export interface SecurityConfig {
  readonly maxBodySize: string;
  readonly maxBodySizeBytes: number;
  readonly requestTimeout: number;
  readonly keepAliveTimeout: number;
  readonly headersTimeout: number;
  readonly maxHeaderSize: number;
  readonly maxRedirects: number;
  readonly maxResponseSizeBytes: number;
}

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  if (typeof value === 'undefined') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toBytes = (size: string): number => {
  const match = /^([0-9]+)(b|kb|mb|gb)?$/i.exec(size.trim());
  if (!match) {
    return toBytes('10mb');
  }

  const [, valueStr, unitRaw = 'mb'] = match;
  const value = Number(valueStr);
  const unit = unitRaw.toLowerCase();

  switch (unit) {
    case 'b':
      return value;
    case 'kb':
      return value * 1024;
    case 'gb':
      return value * 1024 * 1024 * 1024;
    case 'mb':
    default:
      return value * 1024 * 1024;
  }
};

const requestTimeout = parsePositiveNumber(process.env.REQUEST_TIMEOUT, 30_000);
const keepAliveTimeout = Math.max(requestTimeout + 1_000, parsePositiveNumber(process.env.KEEP_ALIVE_TIMEOUT, 31_000));
const headersTimeout = Math.max(keepAliveTimeout + 1_000, parsePositiveNumber(process.env.HEADERS_TIMEOUT, keepAliveTimeout + 1_000));

export const securityConfig: SecurityConfig = {
  maxBodySize: process.env.MAX_REQUEST_SIZE ?? '10mb',
  maxBodySizeBytes: toBytes(process.env.MAX_REQUEST_SIZE ?? '10mb'),
  requestTimeout,
  keepAliveTimeout,
  headersTimeout,
  maxHeaderSize: parsePositiveNumber(process.env.MAX_HEADER_SIZE, 16 * 1024),
  maxRedirects: parsePositiveNumber(process.env.MAX_REDIRECTS, 5),
  maxResponseSizeBytes: toBytes(process.env.MAX_RESPONSE_SIZE ?? '10mb'),
};
