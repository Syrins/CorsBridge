import { promises as dns } from 'dns';
import net from 'net';
import { LRUCache } from 'lru-cache';

import { appConfig } from '../config/app.config';
import { ValidationError } from './errors';
import { isPrivateIp, normalizeIp } from './ip.utils';

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^metadata\.google\.internal$/i,
  /^169\.254\.169\.254$/,
  /^instance-data$/i,
  /^metadata\./i,
  /^0\.0\.0\.0$/,
  /^\[?::1]?$/,
];

const SUSPICIOUS_HOST_PATTERNS = [
  /\.internal$/i,
  /\.intranet$/i,
  /\.local$/i,
  /\.lan$/i,
  /^0x[0-9a-f]+$/i,
  /^0[0-7]+$/,
];

const dnsCache = new LRUCache<string, string[]>({
  max: 500,
  ttl: appConfig.dnsCacheTtlMs,
});

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(normalized)) || SUSPICIOUS_HOST_PATTERNS.some((pattern) => pattern.test(normalized));
}

async function resolveAddresses(hostname: string): Promise<string[]> {
  if (net.isIP(hostname)) {
    return [normalizeIp(hostname)];
  }

  const cached = dnsCache.get(hostname);
  if (cached) {
    return cached;
  }

  try {
    const records = await dns.lookup(hostname, { all: true });
    const addresses = records.map((record) => normalizeIp(record.address));
    dnsCache.set(hostname, addresses);
    return addresses;
  } catch (error) {
    throw new ValidationError('Unable to resolve target hostname', 400, undefined, error);
  }
}

async function assertNotPrivate(hostname: string): Promise<void> {
  if (appConfig.allowPrivateNetworks) {
    return;
  }

  if (isBlockedHostname(hostname)) {
    throw new ValidationError('Access to private/internal hosts is not allowed', 403);
  }

  const addresses = await resolveAddresses(hostname);
  for (const address of addresses) {
    if (isPrivateIp(address)) {
      throw new ValidationError('Resolved address is not reachable from public network', 403, { address });
    }
  }
}

export async function sanitizeTargetUrl(url: string): Promise<string> {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new ValidationError('Target URL cannot be empty', 400);
  }

  if (/^file:/i.test(trimmed)) {
    throw new ValidationError('file:// protocol is not allowed', 400);
  }

  if (!/^https?:/i.test(trimmed)) {
    throw new ValidationError('Only http and https protocols are supported', 400);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch (error) {
    throw new ValidationError('Invalid URL format', 400, undefined, error);
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new ValidationError('URLs with embedded credentials are not allowed', 400);
  }

  if (parsedUrl.hostname.includes('@')) {
    throw new ValidationError('Invalid hostname format', 400);
  }

  await assertNotPrivate(parsedUrl.hostname);
  parsedUrl.hash = '';

  return parsedUrl.toString();
}

