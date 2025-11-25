import type { NextFunction, Request, Response } from 'express';
import rateLimit, { type RateLimitRequestHandler, type Store } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient, type RedisClientType } from 'redis';

import { rateLimitConfig } from '../config/rate-limit.config';
import { RateLimitError } from '../utils/errors';
import { logger } from '../services/logger.service';
import { metricsService } from '../services/metrics.service';
import { matchesCidr, normalizeIp } from '../utils/ip.utils';

const dailyWindowMs = 24 * 60 * 60 * 1000;

interface DailyUsageRecord {
  count: number;
  windowStart: number;
}

const dailyUsage = new Map<string, DailyUsageRecord>();
const whitelistExact = new Set(rateLimitConfig.whitelistExact.map((ip) => normalizeIp(ip)));
const whitelistCidrs = rateLimitConfig.whitelistCidrs;

let redisClient: RedisClientType | null = null;
let currentLimiter: RateLimitRequestHandler;

const createLimiter = (store?: Store): RateLimitRequestHandler =>
  rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: rateLimitConfig.skipFailedRequests,
    skipSuccessfulRequests: rateLimitConfig.skipSuccessfulRequests,
    skip: (req) => {
      if (rateLimitConfig.skipOptions && req.method === 'OPTIONS') {
        return true;
      }
      const ip = normalizeIp(req.ip || req.socket.remoteAddress);
      return isWhitelisted(ip);
    },
    store,
    handler: (req: Request, res: Response, handlerNext: NextFunction, options) => {
      metricsService.recordRateLimitHit();
      res.setHeader('Retry-After', Math.ceil(rateLimitConfig.windowMs / 1000).toString());
      handlerNext(
        new RateLimitError('Too many requests. Please slow down and try again later.', options.statusCode ?? 429, {
          windowMs: rateLimitConfig.windowMs,
        }),
      );
    },
  });

currentLimiter = createLimiter();

if (rateLimitConfig.enableRedis && rateLimitConfig.redisUrl) {
  redisClient = createClient({ url: rateLimitConfig.redisUrl });
  redisClient.on('error', (error) => {
    logger.error({ error }, 'Redis rate-limit client error');
  });

  void (async () => {
    try {
      await redisClient!.connect();
      logger.info('Redis rate-limit client connected');

      const redisStore = new RedisStore({
        sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
      }) as Store;

      currentLimiter = createLimiter(redisStore);
      logger.info('Redis-backed rate limiter enabled');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Redis rate limiter. Using in-memory store.');
      await redisClient?.quit().catch(() => undefined);
      redisClient = null;
    }
  })();
} else if (rateLimitConfig.enableRedis) {
  logger.warn('ENABLE_REDIS is true but REDIS_URL is missing. Using in-memory rate limiting.');
}

if (rateLimitConfig.dailyLimit > 0) {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of dailyUsage.entries()) {
      if (now - record.windowStart >= dailyWindowMs) {
        dailyUsage.delete(ip);
      }
    }
  }, Math.min(dailyWindowMs, 60 * 60 * 1000)).unref();
}

function isWhitelisted(ip: string): boolean {
  if (ip === 'unknown') {
    return false;
  }

  if (whitelistExact.has(ip)) {
    return true;
  }

  return whitelistCidrs.some((cidr) => matchesCidr(ip, cidr));
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = normalizeIp(req.ip || req.socket.remoteAddress);
  if (isWhitelisted(ip)) {
    next();
    return;
  }

  if (enforceDailyLimit(ip, next)) {
    return;
  }

  currentLimiter(req, res, next);
}

function enforceDailyLimit(ip: string, next: NextFunction): boolean {
  if (rateLimitConfig.dailyLimit <= 0) {
    return false;
  }

  const now = Date.now();
  let record = dailyUsage.get(ip);

  if (!record || now - record.windowStart >= dailyWindowMs) {
    record = { count: 0, windowStart: now };
  }

  record.count += 1;
  dailyUsage.set(ip, record);

  if (record.count > rateLimitConfig.dailyLimit) {
    metricsService.recordRateLimitHit();
    next(new RateLimitError('Daily request limit exceeded. Please try again tomorrow.', 429));
    return true;
  }

  return false;
}
