import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/errors';
import { logger } from '../services/logger.service';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err instanceof HttpError ? err.message : 'Internal Server Error';
  const safeMessage = statusCode >= 500 ? 'Internal Server Error' : message;

  logger.error(
    {
      requestId: req.requestId,
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      error: err instanceof Error ? err.stack : err,
    },
    'Request failed',
  );

  const responsePayload: Record<string, unknown> = {
    error: true,
    message: safeMessage,
    statusCode,
    requestId: req.requestId,
    traceId: req.traceId,
    spanId: req.spanId,
    timestamp: new Date().toISOString(),
  };

  if (err instanceof HttpError && err.details) {
    responsePayload.details = err.details;
  }

  res.status(statusCode).json(responsePayload);
}
