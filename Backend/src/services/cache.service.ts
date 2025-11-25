import { LRUCache } from 'lru-cache';

import { cacheConfig } from '../config/cache.config';
import { logger } from './logger.service';

export interface CachedResponse {
	status: number;
	headers: Record<string, string | string[]>;
	body: Buffer;
}

const cacheEnabled = cacheConfig.enabled && cacheConfig.maxEntries !== 0;

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

export const cacheService = {
	isEnabled(): boolean {
		return cacheEnabled;
	},

	get(key: string): CachedResponse | null {
		if (!cacheEnabled) {
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

	set(key: string, payload: CachedResponse): void {
		if (!cacheEnabled) {
			return;
		}

		if (payload.body.length > cacheConfig.maxBodyBytes) {
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

	getStats(): { size: number; hits: number; misses: number; ttlSeconds: number } {
		return {
			size: cacheStore.size,
			hits: stats.hits,
			misses: stats.misses,
			ttlSeconds: cacheConfig.ttlSeconds,
		};
	},

	clear(): void {
		cacheStore.clear();
		stats.hits = 0;
		stats.misses = 0;
	},
};
