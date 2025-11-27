import { LRUCache } from 'lru-cache';
import { createClient, type RedisClientType } from 'redis';

import { cacheConfig } from '../config/cache.config';
import { logger } from './logger.service';

export interface CachedResponse {
	status: number;
	headers: Record<string, string | string[]>;
	body: Buffer;
}

const cacheEnabled = cacheConfig.enabled && cacheConfig.maxEntries !== 0;
const useRedis = cacheEnabled && cacheConfig.driver === 'redis' && typeof cacheConfig.redisUrl === 'string';

const cacheStore = new LRUCache<string, CachedResponse>({
	max: Math.max(cacheConfig.maxEntries, 1),
	ttl: cacheConfig.ttlSeconds * 1000,
	allowStale: false,
	updateAgeOnGet: true,
});

const stats = {
	hits: 0,
	misses: 0,
};

let redisClient: RedisClientType | null = null;
let redisReady = false;

if (useRedis) {
	redisClient = createClient({
		url: cacheConfig.redisUrl,
		socket: {
			connectTimeout: cacheConfig.redisConnectTimeoutMs,
			reconnectStrategy: (retries) => Math.min(retries * 200, 5_000),
		},
	});

	redisClient.on('error', (error) => {
		redisReady = false;
		logger.error({ error }, 'Redis cache connection error');
	});

	void (async () => {
		try {
			await redisClient!.connect();
			redisReady = true;
			logger.info('Redis cache connected');
		} catch (error) {
			logger.error({ error }, 'Failed to connect Redis cache. Falling back to in-memory cache.');
			redisReady = false;
		}
	})();
}

function normaliseAcceptHeader(header?: string): string {
	if (!header) {
		return '*/*';
	}

	return header
		.split(',')
		.map((value) => value.trim().toLowerCase())
		.sort()
		.join(',');
}

function buildRedisKey(key: string): string {
	return `${cacheConfig.redisKeyPrefix}${key}`;
}

function serialisePayload(payload: CachedResponse): string {
	return JSON.stringify({
		status: payload.status,
		headers: payload.headers,
		body: payload.body.toString('base64'),
	});
}

function deserialisePayload(raw: string): CachedResponse | null {
	try {
		const parsed = JSON.parse(raw) as { status: number; headers: Record<string, string | string[]>; body: string };
		return {
			status: parsed.status,
			headers: parsed.headers,
			body: Buffer.from(parsed.body, 'base64'),
		};
	} catch (error) {
		logger.error({ error }, 'Failed to parse cached payload from Redis');
		return null;
	}
}

function usingRedis(): boolean {
	return Boolean(redisClient && redisReady);
}

async function redisGet(key: string): Promise<CachedResponse | null> {
	if (!usingRedis()) {
		return null;
	}
	try {
		const value = await redisClient!.get(buildRedisKey(key));
		return value ? deserialisePayload(value) : null;
	} catch (error) {
		logger.error({ error }, 'Redis cache get failed');
		return null;
	}
}

async function redisSet(key: string, payload: CachedResponse): Promise<void> {
	if (!usingRedis()) {
		return;
	}
	try {
		await redisClient!.set(buildRedisKey(key), serialisePayload(payload), {
			EX: cacheConfig.ttlSeconds,
		});
	} catch (error) {
		logger.error({ error }, 'Redis cache set failed');
	}
}

async function redisPeek(key: string): Promise<CachedResponse | null> {
	if (!usingRedis()) {
		return null;
	}

	try {
		const value = await redisClient!.get(buildRedisKey(key));
		return value ? deserialisePayload(value) : null;
	} catch (error) {
		logger.error({ error }, 'Redis cache peek failed');
		return null;
	}
}

async function redisClear(): Promise<void> {
	if (!usingRedis()) {
		return;
	}
	try {
		for await (const key of redisClient!.scanIterator({ MATCH: `${cacheConfig.redisKeyPrefix}*`, COUNT: 100 })) {
			await redisClient!.del(key as string);
		}
	} catch (error) {
		logger.error({ error }, 'Redis cache clear failed');
	}
}

async function redisSize(): Promise<number> {
	if (!usingRedis()) {
		return 0;
	}
	let count = 0;
	try {
		for await (const _key of redisClient!.scanIterator({ MATCH: `${cacheConfig.redisKeyPrefix}*`, COUNT: 1000 })) {
			count += 1;
		}
	} catch (error) {
		logger.error({ error }, 'Redis cache size scan failed');
	}
	return count;
}

export const cacheService = {
	isEnabled(): boolean {
		return cacheEnabled && (cacheConfig.driver === 'memory' || cacheConfig.driver === 'redis');
	},

	async get(key: string): Promise<CachedResponse | null> {
		if (!cacheEnabled) {
			return null;
		}

		if (usingRedis()) {
			const redisValue = await redisGet(key);
			if (redisValue) {
				stats.hits += 1;
				return redisValue;
			}
			stats.misses += 1;
			return null;
		}

		const value = cacheStore.get(key);
		if (value) {
			stats.hits += 1;
			return value;
		}
		stats.misses += 1;
		return null;
	},

	async set(key: string, payload: CachedResponse): Promise<void> {
		if (!cacheEnabled) {
			return;
		}

		if (payload.body.length > cacheConfig.maxBodyBytes) {
			return;
		}

		if (usingRedis()) {
			await redisSet(key, payload);
			return;
		}

		try {
			cacheStore.set(key, payload);
		} catch (error) {
			logger.error({ error, key }, 'Failed to store response in cache');
		}
	},

	buildKey(method: string, targetUrl: string, acceptHeader: string | undefined): string {
		const normalizedMethod = (method ?? 'GET').toUpperCase();
		const accept = normaliseAcceptHeader(acceptHeader);
		return `${normalizedMethod}:${targetUrl}::${accept}`;
	},

	async getStats(): Promise<{ size: number; hits: number; misses: number; ttlSeconds: number; backend: string }> {
		const size = usingRedis() ? await redisSize() : cacheStore.size;
		return {
			size,
			hits: stats.hits,
			misses: stats.misses,
			ttlSeconds: cacheConfig.ttlSeconds,
			backend: usingRedis() ? 'redis' : 'memory',
		};
	},

	async clear(): Promise<void> {
		if (usingRedis()) {
			await redisClear();
		} else {
			cacheStore.clear();
		}
		stats.hits = 0;
		stats.misses = 0;
	},

	async peek(key: string): Promise<CachedResponse | null> {
		if (!cacheEnabled) {
			return null;
		}

		if (usingRedis()) {
			return redisPeek(key);
		}

		return cacheStore.get(key) ?? null;
	},

	isRedisBacked(): boolean {
		return usingRedis();
	},
};
