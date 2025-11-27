import type { NextFunction, Request, Response } from 'express';

import { proxyConfig } from '../config/proxy.config';
import { corsConfig } from '../config/cors.config';

function resolveAllowedOrigin(requestOrigin: string | undefined): string | undefined {
  if (!requestOrigin) {
    return corsConfig.allowedOrigins.includes('*') ? '*' : corsConfig.allowedOrigins[0];
  }

  if (corsConfig.allowedOrigins.includes('*')) {
    return corsConfig.allowCredentials ? requestOrigin : '*';
  }

  if (corsConfig.allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return undefined;
}

export function corsHandler(req: Request, res: Response, next: NextFunction): void {
  const requestOrigin = req.header('origin') ?? undefined;
  const allowedOrigin = resolveAllowedOrigin(requestOrigin);
  const requestedHeadersRaw = req.header('access-control-request-headers');
  const requestedHeaders = requestedHeadersRaw
    ? requestedHeadersRaw
        .split(',')
        .map((header) => header.trim().toLowerCase())
        .filter(Boolean)
    : [];

  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
  }
  if (corsConfig.allowCredentials && allowedOrigin && allowedOrigin !== '*') {
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.append('Vary', 'Origin');
  res.append('Vary', 'Access-Control-Request-Headers');
  res.append('Vary', 'Access-Control-Request-Method');
  res.header('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(','));
  if (corsConfig.allowedHeaders.includes('*')) {
    res.header('Access-Control-Allow-Headers', '*');
  } else {
    const mergedHeaders = Array.from(new Set([...corsConfig.allowedHeaders, ...requestedHeaders]));
    res.header('Access-Control-Allow-Headers', mergedHeaders.join(','));
  }
  res.header('Access-Control-Max-Age', String(corsConfig.maxAgeSeconds));
  res.header('Access-Control-Expose-Headers', corsConfig.exposeHeaders.join(','));

  if (corsConfig.poweredByHeader) {
    res.header('X-Powered-By', 'CorsBridge by Syrins • syrins.tech');
  }
  res.header('X-Proxy-Version', process.env.PROXY_VERSION ?? '0.1.0');

  const isOptions = req.method === 'OPTIONS';
  const hasProxyTarget = typeof req.query?.url === 'string';

  if (isOptions && (!hasProxyTarget || !proxyConfig.optionsPassthrough)) {
    res.status(204).end();
    return;
  }

  next();
}
