const parseNumber = (value: string | undefined, fallback: number, { allowZero = false }: { allowZero?: boolean } = {}): number => {
  if (typeof value === 'undefined') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (parsed < 0) {
    return fallback;
  }

  if (parsed === 0 && !allowZero) {
    return fallback;
  }

  return parsed;
};

const parseBytes = (value: string | undefined, fallback: string): number => {
  const input = (value ?? fallback).trim().toLowerCase();
  const unitMatch = /^([0-9]+)(b|kb|mb|gb)?$/.exec(input);
  if (!unitMatch) {
    return parseBytes(fallback, fallback);
  }

  const [, numeric, unit = 'mb'] = unitMatch;
  const quantity = Number(numeric);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return parseBytes(fallback, fallback);
  }

  switch (unit) {
    case 'b':
      return quantity;
    case 'kb':
      return quantity * 1024;
    case 'gb':
      return quantity * 1024 * 1024 * 1024;
    case 'mb':
    default:
      return quantity * 1024 * 1024;
  }
};

export type CacheDriver = 'memory' | 'redis';

export interface CacheConfig {
  readonly enabled: boolean;
  readonly ttlSeconds: number;
  readonly maxEntries: number;
  readonly maxBodyBytes: number;
  readonly driver: CacheDriver;
  readonly redisUrl?: string;
  readonly redisKeyPrefix: string;
  readonly redisConnectTimeoutMs: number;
}

const resolveDriver = (): CacheDriver => {
  const driver = (process.env.CACHE_DRIVER ?? '').toLowerCase();
  if (driver === 'redis') {
    return 'redis';
  }
  return 'memory';
};

const preferredDriver = resolveDriver();
const redisUrl = process.env.CACHE_REDIS_URL ?? process.env.REDIS_URL;
const driver: CacheDriver = preferredDriver === 'redis' && redisUrl ? 'redis' : 'memory';

export const cacheConfig: CacheConfig = {
  enabled: process.env.ENABLE_CACHE !== 'false',
  ttlSeconds: Math.max(1, parseNumber(process.env.CACHE_TTL, 300)),
  maxEntries: parseNumber(process.env.CACHE_MAX_SIZE, 500, { allowZero: true }),
  maxBodyBytes: parseBytes(process.env.CACHE_MAX_BODY_SIZE, process.env.MAX_RESPONSE_SIZE ?? '10mb'),
  driver,
  redisUrl: driver === 'redis' ? redisUrl : undefined,
  redisKeyPrefix: process.env.CACHE_REDIS_KEY_PREFIX ?? 'corsbridge:cache:',
  redisConnectTimeoutMs: parseNumber(process.env.CACHE_REDIS_CONNECT_TIMEOUT_MS, 5_000),
};
