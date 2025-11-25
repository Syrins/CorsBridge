import type { NextFunction, Request, Response } from 'express';

import { originMonitoringConfig } from '../config/whitelist.config';
import { analyticsTracker } from '../services/analytics.service';
import { logger } from '../services/logger.service';

interface OriginUsageRecord {
  count: number;
  windowStart: number;
  warned: boolean;
  alerted: boolean;
}

const originWindowMs = 24 * 60 * 60 * 1000;
const originUsage = new Map<string, OriginUsageRecord>();
const blockedOrigins = new Set(originMonitoringConfig.blockOrigins.map((origin) => origin.toLowerCase()));

if (originMonitoringConfig.trackUsagePatterns) {
  setInterval(() => {
    const now = Date.now();
    for (const [origin, record] of originUsage.entries()) {
      if (now - record.windowStart >= originWindowMs) {
        originUsage.delete(origin);
      }
    }
  }, Math.min(originWindowMs, 10 * 60_000)).unref();
}

export function originTracker(req: Request, res: Response, next: NextFunction): void {
  if (!originMonitoringConfig.enabled) {
    next();
    return;
  }

  const origin = (req.header('origin') ?? 'unknown').toLowerCase();

  if (originMonitoringConfig.autoBlock && blockedOrigins.has(origin)) {
    logger.warn({ origin, requestId: req.requestId }, 'Request blocked due to origin allowlist');
    res.status(403).json({
      error: true,
      message: 'Origin is not allowed to use this proxy',
      statusCode: 403,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (originMonitoringConfig.trackTopOrigins) {
    analyticsTracker.trackOrigin(origin);
  }

  if (originMonitoringConfig.trackUsagePatterns) {
    trackUsage(origin, req.requestId);
  }

  next();
}

function trackUsage(origin: string, requestId?: string): void {
  const now = Date.now();
  const warnThreshold = originMonitoringConfig.warnThreshold;
  const alertThreshold = originMonitoringConfig.alertThreshold;

  let record = originUsage.get(origin);

  if (!record || now - record.windowStart >= originWindowMs) {
    record = { count: 0, windowStart: now, warned: false, alerted: false };
  }

  record.count += 1;
  originUsage.set(origin, record);

  if (!record.warned && warnThreshold > 0 && record.count >= warnThreshold) {
    record.warned = true;
    logger.warn({ origin, count: record.count, windowMs: originWindowMs, requestId }, 'High origin activity detected');
  }

  if (!record.alerted && alertThreshold > 0 && record.count >= alertThreshold) {
    record.alerted = true;
    logger.error({ origin, count: record.count, windowMs: originWindowMs, requestId }, 'Origin alert threshold exceeded');
  }
}
