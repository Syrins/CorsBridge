import type { NextFunction, Request, Response } from 'express';

import { rateLimitConfig } from '../config/rate-limit.config';
import { logger } from '../services/logger.service';
import { normalizeIp } from '../utils/ip.utils';

interface AbuseRecord {
  count: number;
  firstSeen: number;
  warned: boolean;
  blockedUntil: number;
}

const abuseStore = new Map<string, AbuseRecord>();
const SPIKE_WINDOW_MS = 60 * 1000; // 1 minute window for spike detection

// Cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of abuseStore.entries()) {
    if (now > record.blockedUntil && now - record.firstSeen > SPIKE_WINDOW_MS) {
      abuseStore.delete(ip);
    }
  }
}, 60000).unref();

export function abuseMonitor(req: Request, res: Response, next: NextFunction): void {
  if (!rateLimitConfig.abuseMonitoringEnabled) {
    next();
    return;
  }

  const ip = normalizeIp(req.ip || req.socket.remoteAddress);
  const now = Date.now();

  let record = abuseStore.get(ip);

  // Check if blocked
  if (record && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      error: true,
      message: 'Temporarily blocked due to suspicious activity. Please try again later.',
      retryAfter
    });
    return;
  }

  // Initialize or Reset Window
  if (!record || now - record.firstSeen > SPIKE_WINDOW_MS) {
    record = {
      count: 0,
      firstSeen: now,
      warned: false,
      blockedUntil: 0
    };
  }

  record.count++;
  abuseStore.set(ip, record);

  // Checks
  const spikeThreshold = rateLimitConfig.abuseSpikeThreshold || 200; // e.g. 200 req/min

  if (record.count > spikeThreshold) {
    const blockDurationMs = (rateLimitConfig.abuseBlockDurationMinutes || 15) * 60 * 1000;
    record.blockedUntil = now + blockDurationMs;
    abuseStore.set(ip, record);

    logger.error(
      {
        ip,
        reqId: req.requestId,
        count: record.count,
        threshold: spikeThreshold
      },
      'Abuse Detected: IP temporarily blocked due to traffic spike'
    );

    res.status(429).json({
      error: true,
      message: 'Too many requests. Temporarily blocked.',
      retryAfter: blockDurationMs / 1000
    });
    return;
  }

  // Additional Checks (Suspicious User-Agent, etc.) could go here
  if (!req.get('User-Agent')) {
    // Optional: Flag missing UA
  }

  next();
}
