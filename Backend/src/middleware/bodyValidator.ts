import type { NextFunction, Request, Response } from 'express';

import { PayloadTooLargeError, ValidationError } from '../utils/errors';

const MAX_JSON_SIZE = Number(process.env.MAX_JSON_BODY_SIZE) || 1024 * 1024;
const MAX_TEXT_SIZE = Number(process.env.MAX_TEXT_BODY_SIZE) || 1024 * 1024;
const JSON_PATTERN = /application\/(?:[a-z.+-]*\+)?json/i;
const TEXT_PATTERN = /^text\//i;

export function bodyValidationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const method = req.method?.toUpperCase() ?? 'GET';
  if (method === 'GET' || method === 'HEAD') {
    next();
    return;
  }

  const contentType = req.header('content-type') ?? '';
  const contentLengthHeader = req.header('content-length');
  const isJson = JSON_PATTERN.test(contentType);
  const isText = TEXT_PATTERN.test(contentType);

  if (!isJson && !isText) {
    next();
    return;
  }

  const limit = isJson ? MAX_JSON_SIZE : MAX_TEXT_SIZE;

  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      next(new ValidationError('Invalid Content-Length header', 400));
      return;
    }
    if (contentLength > limit) {
      next(new PayloadTooLargeError(`${isJson ? 'JSON' : 'Text'} body exceeds ${limit} bytes limit`));
      return;
    }
  }

  let bytesRead = 0;
  let errored = false;

  const onData = (chunk: Buffer): void => {
    if (errored) {
      return;
    }
    bytesRead += chunk.length;
    if (bytesRead > limit) {
      errored = true;
      req.off('data', onData);
      req.destroy();
      next(new PayloadTooLargeError(`${isJson ? 'JSON' : 'Text'} body exceeds ${limit} bytes limit`));
    }
  };

  const onError = (error: Error): void => {
    if (errored) {
      return;
    }
    errored = true;
    req.off('data', onData);
    next(new ValidationError('Error reading request body', 400, undefined, error));
  };

  req.on('data', onData);
  req.once('error', onError);
  req.once('end', () => {
    req.off('data', onData);
    req.off('error', onError);
  });

  next();
}
