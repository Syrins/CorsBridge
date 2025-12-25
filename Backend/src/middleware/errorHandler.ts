import { type Request, type Response, type NextFunction } from 'express';
import { HttpError } from 'http-errors';
import * as Sentry from '@sentry/node';
import { logger } from '../services/logger.service';

export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (process.env.ERROR_TRACKING_DSN && (!error.statusCode || error.statusCode >= 500)) {
    Sentry.captureException(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const safeMessage = statusCode >= 500 ? 'Internal Server Error' : message;

  logger.error(
    {
      requestId: req.requestId,
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      error: error instanceof Error ? error.stack : error,
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

  if (error instanceof HttpError && (error as any).details) {
    responsePayload.details = (error as any).details;
  }

  res.status(statusCode).json(responsePayload);
};
