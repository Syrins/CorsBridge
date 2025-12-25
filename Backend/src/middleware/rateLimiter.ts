import type { NextFunction, Request, Response } from 'express';
import { createClient, type RedisClientType } from 'redis';

import { rateLimitConfig } from '../config/rate-limit.config';
import { RateLimitError } from '../utils/errors';
import { logger } from '../services/logger.service';
import { metricsService } from '../services/metrics.service';
import { blocklistService } from '../services/blocklist.service';
import { normalizeIp } from '../utils/ip.utils';

let redisClient: RedisClientType | null = null;
let redisCheckInterval: NodeJS.Timeout | null = null;

// In-memory fallback
const memoryStore = new Map<string, { count: number; expiresAt: number }>();
const MEMORY_CLEANUP_INTERVAL = 60_000;

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.expiresAt) {
      memoryStore.delete(key);
    }
  }
}

setInterval(cleanupMemoryStore, MEMORY_CLEANUP_INTERVAL).unref();

// Initialize Redis if enabled
if (rateLimitConfig.enableRedis && rateLimitConfig.redisUrl) {
  const initRedis = async () => {
    try {
      redisClient = createClient({
        url: rateLimitConfig.redisUrl,
        socket: {
          connectTimeout: 2000,
          reconnectStrategy: (retries) => Math.min(retries * 500, 5000),
        },
      });

      redisClient.on('error', (err) => {
        logger.warn({ err }, 'RateLimit Redis error, falling back to memory');
      });

      await redisClient.connect();
      logger.info('RateLimit Redis connected');
    } catch (error) {
      logger.warn({ error }, 'Failed to connect RateLimit Redis');
    }
  };
  void initRedis();
}

function getDailyKey(ip: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `rate_limit:daily:${ip}:${date}`;
}

async function incrementCount(ip: string, ttlSeconds: number): Promise<number> {
  // Try Redis
  if (redisClient?.isReady) {
    try {
      const key = getDailyKey(ip);
      const multi = redisClient.multi();
      multi.incr(key);
      multi.expire(key, ttlSeconds); // Ensure expiry
      const results = await multi.exec();
      return results[0] as unknown as number;
    } catch (error) {
      logger.warn({ error }, 'Redis incr failed, using memory');
    }
  }

  // Fallback Memory
  const key = getDailyKey(ip);
  const now = Date.now();
  let record = memoryStore.get(key);
  if (!record || now > record.expiresAt) {
    record = { count: 0, expiresAt: now + (ttlSeconds * 1000) };
  }
  record.count++;
  memoryStore.set(key, record);
  return record.count;
}

function calculateDelay(count: number, limit: number): number {
  if (count > limit) return -1; // Blocked

  const usageRatio = count / limit;

  // Progressive Throttling
  if (usageRatio >= 0.95) return 2000; // 95% -> 2s
  if (usageRatio >= 0.90) return 500;  // 90% -> 500ms
  if (usageRatio >= 0.80) return 100;  // 80% -> 100ms

  return 0;
}

export const rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.method === 'OPTIONS' && rateLimitConfig.skipOptions) {
    next();
    return;
  }

  const ip = normalizeIp(req.ip || req.socket.remoteAddress);

  // Whitelist check
  if (rateLimitConfig.whitelistExact.includes(ip) || blocklistService.isTrusted(ip)) {
    next();
    return;
  }

  // Community Blocklist check
  if (blocklistService.isBlocked(ip)) {
    logger.warn({ ip }, 'Blocked request from community blocklisted IP');
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied by community blocklist.'
    });
    return;
  }

  // Note: Check CIDR matches if needed, implementation skipped for brevity but config exists

  const limit = rateLimitConfig.dailyLimit || 200000;
  const ttl = 24 * 60 * 60; // 24h

  const count = await incrementCount(ip, ttl);
  const remaining = Math.max(0, limit - count);
  const reset = Math.ceil(Date.now() / 1000) + ttl; // Rough reset time (end of day approx)

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', reset);

  if (count > limit) {
    metricsService.recordRateLimitHit();
    const retryAfter = 60; // 1 min try again
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Daily rate limit exceeded. Please try again tomorrow.',
      retryAfter,
    });
    return;
  }

  const delay = calculateDelay(count, limit);
  if (delay > 0) {
    res.setHeader('X-RateLimit-Delay', delay); // Debug info
    setTimeout(() => {
      next();
    }, delay);
    return;
  }

  next();
};
