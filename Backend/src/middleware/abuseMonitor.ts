import type { NextFunction, Request, Response } from 'express';

import { rateLimitConfig } from '../config/rate-limit.config';
import { logger } from '../services/logger.service';
import { normalizeIp } from '../utils/ip.utils';

interface UsageRecord {
  count: number;
  firstSeen: number;
  warned: boolean;
  alerted: boolean;
}

const usagePerIp = new Map<string, UsageRecord>();
const windowMs = rateLimitConfig.windowMs;

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of usagePerIp.entries()) {
    if (now - record.firstSeen > windowMs) {
      usagePerIp.delete(ip);
    }
  }
}, Math.min(windowMs, 5 * 60_000)).unref();

export function abuseMonitor(req: Request, _res: Response, next: NextFunction): void {
  if (!rateLimitConfig.abuseMonitoringEnabled) {
    next();
    return;
  }

  const ip = normalizeIp(req.ip || req.socket.remoteAddress);
  const now = Date.now();

  let record = usagePerIp.get(ip);
  if (!record || now - record.firstSeen > windowMs) {
    record = { count: 0, firstSeen: now, warned: false, alerted: false };
  }

  record.count += 1;
  usagePerIp.set(ip, record);

  if (!record.warned && rateLimitConfig.warnThreshold > 0 && record.count >= rateLimitConfig.warnThreshold) {
    record.warned = true;
    logger.warn({ ip, requestId: req.requestId, count: record.count, windowMs }, 'High request volume detected for IP');
  }

  if (!record.alerted && rateLimitConfig.alertThreshold > 0 && record.count >= rateLimitConfig.alertThreshold) {
    record.alerted = true;
    logger.error({ ip, requestId: req.requestId, count: record.count, windowMs }, 'Abuse alert threshold exceeded for IP');
  }

  next();
}
