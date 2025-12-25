import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../services/logger.service';
import { metricsService } from '../services/metrics.service';

let activeRequestCount = 0;

export function getActiveRequestCount(): number {
  return activeRequestCount;
}

const getTargetLabel = (url?: string): string => {
  if (!url) {
    return 'unknown';
  }
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return 'invalid';
  }
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.requestId ?? uuidv4();
  const startTime = Date.now();

  req.requestId = requestId;
  req.startTime = startTime;
  res.requestId = requestId;
  if (!res.getHeader('X-Request-ID')) {
    res.setHeader('X-Request-ID', requestId);
  }

  activeRequestCount++;

  const targetLabel = getTargetLabel(req.targetUrl);

  res.on('finish', () => {
    activeRequestCount--;
    const duration = Date.now() - startTime;

    // Skip recording metrics/logs for internal monitoring endpoints to reduce noise
    const isInternal = req.originalUrl.startsWith('/stats') ||
      req.originalUrl.startsWith('/health') ||
      req.originalUrl.startsWith('/dashboard') ||
      req.originalUrl.startsWith('/metrics');

    if (!isInternal) {
      metricsService.recordRequest(res.statusCode, duration, req.method, targetLabel);
    }

    if (!isInternal) {
      logger.info(
        {
          requestId,
          traceId: req.traceId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          target: targetLabel,
        },
        'Request completed',
      );
    }
  });

  res.on('close', () => {
    if (res.writableFinished) {
      return;
    }
    activeRequestCount--;
    const duration = Date.now() - startTime;
    logger.warn(
      {
        requestId,
        traceId: req.traceId,
        method: req.method,
        url: req.originalUrl,
        duration,
        target: targetLabel,
      },
      'Response closed before completion',
    );
  });

  next();
}
