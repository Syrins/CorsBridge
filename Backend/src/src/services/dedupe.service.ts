import { randomUUID } from 'crypto';
import { createClient, type RedisClientType, type SetOptions } from 'redis';

import { cacheConfig } from '../config/cache.config';
import { dedupeConfig } from '../config/dedupe.config';
import type { CachedResponse } from './cache.service';
import { cacheService } from './cache.service';
import { logger } from './logger.service';

const supportsRedisDedupe =
	dedupeConfig.enabled && cacheConfig.driver === 'redis' && typeof cacheConfig.redisUrl === 'string';

const instanceId = randomUUID();
const ownedLocks = new Set<string>();
let redisClient: RedisClientType | null = null;
let redisReady = false;

if (supportsRedisDedupe) {
	redisClient = createClient({
		url: cacheConfig.redisUrl,
		socket: {
			connectTimeout: cacheConfig.redisConnectTimeoutMs,
			reconnectStrategy: (retries) => Math.min(retries * 200, 5_000),
		},
	});

	redisClient.on('error', (error) => {
		redisReady = false;
		logger.error({ error }, 'Redis dedupe connection error');
	});

	void (async () => {
		try {
			await redisClient!.connect();
			redisReady = true;
			logger.info('Redis dedupe connected');
		} catch (error) {
			redisReady = false;
			logger.error({ error }, 'Failed to establish Redis dedupe connection');
		}
	})();
}

const unlockScript = `
if redis.call("get", KEYS[1]) == ARGV[1] then
	return redis.call("del", KEYS[1])
end
return 0
`;

const delay = (ms: number): Promise<void> =>
	new Promise((resolve) => {
		setTimeout(resolve, ms).unref?.();
	});

function buildRedisKey(cacheKey: string): string {
	return `${dedupeConfig.redisKeyPrefix}${cacheKey}`;
}

async function waitForCachedPayload(cacheKey: string): Promise<CachedResponse | null> {
	const deadline = Date.now() + dedupeConfig.waitTimeoutMs;
	while (Date.now() < deadline) {
		const cached = await cacheService.peek(cacheKey);
		if (cached) {
			return cached;
		}
		await delay(dedupeConfig.pollIntervalMs);
	}
	return null;
}

async function releaseLock(redisKey: string): Promise<void> {
	if (!redisClient || !redisReady) {
		return;
	}
	try {
		await redisClient.eval(unlockScript, {
			keys: [redisKey],
			arguments: [instanceId],
		});
	} catch (error) {
		logger.error({ error, redisKey }, 'Failed to release distributed dedupe lock');
	}
}

async function acquireLock(cacheKey: string, useNx: boolean): Promise<'leader' | 'follower'> {
	if (!redisClient || !redisReady) {
		return 'leader';
	}

	const redisKey = buildRedisKey(cacheKey);

	try {
		const options: SetOptions = useNx
			? { PX: dedupeConfig.lockTtlMs, NX: true }
			: { PX: dedupeConfig.lockTtlMs };
		const result = await redisClient.set(redisKey, instanceId, options);

		if (result === 'OK') {
			ownedLocks.add(redisKey);
			return 'leader';
		}

		return 'follower';
	} catch (error) {
		logger.error({ error, cacheKey }, 'Failed to acquire distributed dedupe lock');
		return 'leader';
	}
}

export const dedupeService = {
	supportsDistributedLocks(): boolean {
		return supportsRedisDedupe && redisReady;
	},

	async tryAcquire(cacheKey: string): Promise<'leader' | 'follower'> {
		if (!this.supportsDistributedLocks()) {
			return 'leader';
		}
		return acquireLock(cacheKey, true);
	},

	async promote(cacheKey: string): Promise<'leader' | 'follower'> {
		if (!this.supportsDistributedLocks()) {
			return 'leader';
		}
		return acquireLock(cacheKey, false);
	},

	async waitForRemote(cacheKey: string): Promise<CachedResponse | null> {
		if (!this.supportsDistributedLocks()) {
			return null;
		}
		return waitForCachedPayload(cacheKey);
	},

	release(cacheKey: string): Promise<void> {
		if (!this.supportsDistributedLocks()) {
			return Promise.resolve();
		}

		const redisKey = buildRedisKey(cacheKey);
		if (!ownedLocks.has(redisKey)) {
			return Promise.resolve();
		}

		ownedLocks.delete(redisKey);
		return releaseLock(redisKey);
	},
};
