import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../services/logger.service';
import { metricsService } from '../services/metrics.service';

function getTargetLabel(target?: string): string | undefined {
  if (!target) {
    return undefined;
  }
  try {
    const parsed = new URL(target);
    return parsed.origin;
  } catch {
    return target;
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.requestId ?? uuidv4();
  const startTime = Date.now();

  req.requestId = requestId;
  req.startTime = startTime;
  res.requestId = requestId;
  if (!res.getHeader('X-Request-ID')) {
    res.setHeader('X-Request-ID', requestId);
  }

  const targetLabel = getTargetLabel(req.targetUrl);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metricsService.recordRequest(res.statusCode, duration, req.method, targetLabel);
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
  });

  res.on('close', () => {
    if (res.writableFinished) {
      return;
    }
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
