import { randomBytes } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const TRACE_VERSION = '00';

const randomHex = (size: number): string => randomBytes(size).toString('hex');

function parseTraceparent(header: string | undefined): { traceId: string; parentId?: string; traceFlags: string } | null {
  if (!header) {
    return null;
  }

  const parts = header.trim().split('-');
  if (parts.length !== 4) {
    return null;
  }

  const [version, traceId, parentId, traceFlags] = parts;
  if (version !== TRACE_VERSION || !/^[0-9a-f]{32}$/.test(traceId) || !/^[0-9a-f]{16}$/.test(parentId) || !/^[0-9a-f]{2}$/.test(traceFlags)) {
    return null;
  }

  if (traceId === '00000000000000000000000000000000') {
    return null;
  }

  return { traceId, parentId, traceFlags };
}

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceContext = parseTraceparent(req.header('traceparent')) ?? parseTraceparent(req.header('x-trace-id'));
  const traceId = traceContext?.traceId ?? randomHex(16);
  const spanId = randomHex(8);
  const parentSpanId = traceContext?.parentId;
  const traceFlags = traceContext?.traceFlags ?? '01';

  req.traceId = traceId;
  req.spanId = spanId;
  req.parentSpanId = parentSpanId;
  req.traceFlags = traceFlags;
  if (!req.requestId) {
    req.requestId = traceId.slice(0, 16);
  }

  res.setHeader('traceparent', `${TRACE_VERSION}-${traceId}-${spanId}-${traceFlags}`);
  res.setHeader('x-trace-id', traceId);
  res.setHeader('x-span-id', spanId);
  if (parentSpanId) {
    res.setHeader('x-parent-span-id', parentSpanId);
  }
  res.setHeader('x-request-id', req.requestId);

  next();
}
