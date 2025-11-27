import type { NextFunction, Request, Response } from 'express';
import validator from 'validator';

import { ValidationError } from '../utils/errors';
import { sanitizeTargetUrl } from '../utils/sanitizer';

const MAX_URL_LENGTH = Number(process.env.MAX_URL_LENGTH ?? 4096);

export async function urlValidationMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const target = req.query.url;

  if (typeof target !== 'string' || !target.trim()) {
    next(new ValidationError('Missing "url" query parameter', 400));
    return;
  }

  if (target.length > MAX_URL_LENGTH) {
    next(new ValidationError('URL exceeds maximum allowed length', 414));
    return;
  }

  try {
    const sanitizedTarget = await sanitizeTargetUrl(target);

    const validatorOptions: validator.IsURLOptions = {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true,
      require_tld: false,
      allow_protocol_relative_urls: false,
      allow_underscores: true,
      allow_trailing_dot: true,
      allow_query_components: true,
    };

    if (!validator.isURL(sanitizedTarget, validatorOptions)) {
      next(new ValidationError('Invalid target URL provided', 400));
      return;
    }

    req.targetUrl = sanitizedTarget;
    next();
  } catch (error) {
    next(error);
  }
}
