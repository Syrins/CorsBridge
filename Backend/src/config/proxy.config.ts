import type { AgentOptions } from 'http';
import http from 'http';
import https from 'https';
import { LRUCache } from 'lru-cache';
import { getProxyForUrl } from 'proxy-from-env';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

import { securityConfig } from './security.config';

const DEFAULT_ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;
const DEFAULT_STRIP_HEADERS = [
  'accept-encoding',
  'connection',
  'keep-alive',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via',
];

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

const parseMethodList = (value: string | undefined, fallback: readonly string[]): string[] => {
  const list = (value ? value.split(',') : [...fallback]).map((item) => item.trim().toUpperCase()).filter(Boolean);
  const unique = Array.from(new Set(list));
  if (!unique.includes('HEAD')) {
    unique.push('HEAD');
  }
  if (!unique.includes('GET')) {
    unique.unshift('GET');
  }
  return unique;
};

const parseHeaderList = (value: string | undefined, fallback: readonly string[]): string[] => {
  if (!value) {
    return [...fallback];
  }

  return value
    .split(',')
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);
};

const parseExposeHeaders = (value: string | undefined, fallback: readonly string[]): string[] => {
  if (!value) {
    return [...fallback];
  }

  return value
    .split(',')
    .map((header) => header.trim())
    .filter(Boolean);
};

export interface ProxyConfig {
  readonly changeOrigin: boolean;
  readonly secure: boolean;
  readonly timeout: number;
  readonly proxyTimeout: number;
  readonly followRedirects: boolean;
  readonly maxRedirects: number;
  readonly agent: http.Agent;
  readonly httpsAgent: https.Agent;
  readonly maxResponseSizeBytes: number;
  readonly allowedMethods: readonly string[];
  readonly optionsPassthrough: boolean;
  readonly passThroughOrigin: boolean;
  readonly preserveHostHeader: boolean;
  readonly stripRequestHeaders: readonly string[];
  readonly exposeResponseHeaders: readonly string[];
}

type ExtendedAgentOptions = AgentOptions & { maxCachedSessions?: number };

const agentConfig: ExtendedAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: Number(process.env.MAX_SOCKETS ?? 50),
  maxFreeSockets: Number(process.env.MAX_FREE_SOCKETS ?? 10),
  maxCachedSessions: Number(process.env.MAX_CACHED_SESSIONS ?? 0),
  scheduling: 'lifo',
};

const exposeHeaders = parseExposeHeaders(process.env.PROXY_EXPOSE_HEADERS, ['*']);

export const proxyConfig: ProxyConfig = {
  changeOrigin: true,
  secure: process.env.PROXY_REJECT_UNSECURE !== 'true',
  timeout: securityConfig.requestTimeout,
  proxyTimeout: securityConfig.requestTimeout,
  followRedirects: process.env.ENABLE_REDIRECTS !== 'false',
  maxRedirects: securityConfig.maxRedirects,
  agent: new http.Agent(agentConfig),
  httpsAgent: new https.Agent(agentConfig),
  maxResponseSizeBytes: securityConfig.maxResponseSizeBytes,
  allowedMethods: parseMethodList(process.env.PROXY_ALLOWED_METHODS, DEFAULT_ALLOWED_METHODS),
  optionsPassthrough: parseBoolean(process.env.PROXY_OPTIONS_PASSTHROUGH, false),
  passThroughOrigin: parseBoolean(process.env.PROXY_PASSTHROUGH_ORIGIN, false),
  preserveHostHeader: parseBoolean(process.env.PROXY_PRESERVE_HOST_HEADER, false),
  stripRequestHeaders: parseHeaderList(process.env.PROXY_STRIP_HEADERS, DEFAULT_STRIP_HEADERS),
  exposeResponseHeaders: exposeHeaders,
};

const upstreamAgentCache = new LRUCache<string, http.Agent>({
  max: Number(process.env.PROXY_MAX_UPSTREAM_AGENTS ?? 200),
  ttl: Number(process.env.PROXY_UPSTREAM_AGENT_TTL_MS ?? 15 * 60 * 1000),
  dispose: (agent) => {
    agent.destroy?.();
  },
});

function createUpstreamAgent(proxyUrl: string, isHttpsTarget: boolean): http.Agent {
  return isHttpsTarget ? new HttpsProxyAgent(proxyUrl) : new HttpProxyAgent(proxyUrl);
}

export function getAgentForTarget(target: string): http.Agent {
  const proxyUrl = getProxyForUrl(target);
  const isHttpsTarget = target.startsWith('https://');

  if (!proxyUrl) {
    return isHttpsTarget ? proxyConfig.httpsAgent : proxyConfig.agent;
  }

  const cacheKey = `${isHttpsTarget ? 'https' : 'http'}:${proxyUrl}`;
  let agent = upstreamAgentCache.get(cacheKey);
  if (!agent) {
    agent = createUpstreamAgent(proxyUrl, isHttpsTarget);
    upstreamAgentCache.set(cacheKey, agent);
  }
  return agent;
}
