const parseList = (value: string | undefined, fallback: readonly string[], transformer?: (entry: string) => string): string[] => {
  if (!value) {
    return [...fallback];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => (transformer ? transformer(entry) : entry));
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (typeof value === 'undefined') {
    return fallback;
  }

  switch (value.toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true;
    case '0':
    case 'false':
    case 'no':
    case 'off':
      return false;
    default:
      return fallback;
  }
};

const DEFAULT_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;
const DEFAULT_HEADERS = [
  'accept',
  'content-type',
  'authorization',
  'x-requested-with',
  'x-trace-id',
  'traceparent',
  'x-proxy-cache',
  'cache-control',
  'pragma',
];

export interface CorsConfig {
  readonly allowedOrigins: readonly string[];
  readonly allowCredentials: boolean;
  readonly allowedHeaders: readonly string[];
  readonly allowedMethods: readonly string[];
  readonly exposeHeaders: readonly string[];
  readonly maxAgeSeconds: number;
  readonly poweredByHeader: boolean;
}

const allowedHeaders = parseList(process.env.CORS_ALLOWED_HEADERS, DEFAULT_HEADERS, (header) => header.toLowerCase());
const allowedMethods = parseList(process.env.CORS_ALLOWED_METHODS, DEFAULT_METHODS, (method) => method.toUpperCase());

if (allowedHeaders.length === 0) {
  allowedHeaders.push(...DEFAULT_HEADERS);
}

if (allowedMethods.length === 0) {
  allowedMethods.push(...DEFAULT_METHODS);
}

export const corsConfig: CorsConfig = {
  allowedOrigins: parseList(process.env.CORS_ALLOWED_ORIGINS, ['*']),
  allowCredentials: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS, true),
  allowedHeaders,
  allowedMethods,
  exposeHeaders: parseList(process.env.CORS_EXPOSE_HEADERS, ['traceparent', 'x-request-id', 'x-proxy-cache']),
  maxAgeSeconds: Number.isFinite(Number(process.env.CORS_MAX_AGE)) ? Number(process.env.CORS_MAX_AGE) : 86_400,
  poweredByHeader: parseBoolean(process.env.SEND_POWERED_BY_HEADER, false),
};
