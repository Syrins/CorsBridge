import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import type { ClientRequest, IncomingMessage, ServerResponse, IncomingHttpHeaders } from 'http';
import httpProxy from 'http-proxy';
import type { ServerOptions } from 'http-proxy';

import { getAgentForTarget, proxyConfig } from '../config/proxy.config';
import { securityConfig } from '../config/security.config';
import { cacheConfig } from '../config/cache.config';
import {
	BadGatewayError,
	GatewayTimeoutError,
	HttpError,
	PayloadTooLargeError,
	ValidationError,
} from '../utils/errors';
import { logger } from './logger.service';
import { cacheService, type CachedResponse } from './cache.service';
import { circuitBreakerService } from './circuit-breaker.service';
import { metricsService } from './metrics.service';

type ProxyError = NodeJS.ErrnoException & { code?: string };

type EnhancedServerOptions = ServerOptions & { maxRedirects?: number };

const stripHeaders = new Set(proxyConfig.stripRequestHeaders);
const allowedMethods = new Set(proxyConfig.allowedMethods.map((method) => method.toUpperCase()));
const hopByHopResponseHeaders = new Set([
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
]);


interface InFlightRequest {
	promise: Promise<CachedResponse>;
	timestamp: number;
}

const inFlightRequests = new Map<string, InFlightRequest>();

setInterval(() => {
	const now = Date.now();
	const timeout = 60_000; 

	for (const [key, request] of inFlightRequests.entries()) {
		if (now - request.timestamp > timeout) {
			inFlightRequests.delete(key);
			logger.debug({ key }, 'Cleaned up stale in-flight request');
		}
	}
}, 60_000).unref();

const proxy = httpProxy.createProxyServer({
	changeOrigin: proxyConfig.changeOrigin,
	secure: proxyConfig.secure,
	followRedirects: proxyConfig.followRedirects,
	proxyTimeout: proxyConfig.proxyTimeout,
	timeout: proxyConfig.timeout,
	xfwd: true,
	ignorePath: true,
});

proxy.on('proxyReq', handleProxyRequest);
proxy.on('proxyRes', handleProxyResponse);

proxy.on('proxyRes', (proxyRes: IncomingMessage, rawReq: IncomingMessage) => {
	const req = rawReq as Request;
	const statusCode = proxyRes.statusCode ?? 200;

	if (statusCode >= 300 && statusCode < 400 && proxyRes.headers.location) {
		req.redirectCount = (req.redirectCount ?? 0) + 1;

		if (req.redirectCount > proxyConfig.maxRedirects) {
			logger.warn(
				{
					requestId: req.requestId,
					redirectCount: req.redirectCount,
					maxRedirects: proxyConfig.maxRedirects,
					location: proxyRes.headers.location,
				},
				'Redirect limit exceeded',
			);
			proxyRes.destroy(new BadGatewayError('Target exceeded redirect limit'));
		} else {
			logger.debug(
				{
					requestId: req.requestId,
					redirectCount: req.redirectCount,
					location: proxyRes.headers.location,
				},
				'Following redirect',
			);
		}
	}
});

export const proxyRouter = Router();

proxyRouter.all('*', (req: Request, res: Response, next: NextFunction) => {
	const method = req.method?.toUpperCase() ?? 'GET';

	if (!allowedMethods.has(method)) {
		res.setHeader('Allow', proxyConfig.allowedMethods.join(', '));
		next(new HttpError('Method not allowed', 405));
		return;
	}

	if (method === 'OPTIONS' && !proxyConfig.optionsPassthrough) {
		res.status(204).setHeader('Cache-Control', 'public, max-age=86400');
		res.end();
		return;
	}

	if (!req.targetUrl) {
		next(new ValidationError('Missing target URL', 400));
		return;
	}

	const targetUrl = req.targetUrl;
	const cacheable = isRequestCacheable(req);

	req.redirectCount = 0;

	const targetHost = getTargetOrigin(targetUrl);
	if (!targetHost) {
		next(new ValidationError('Invalid target URL', 400));
		return;
	}
	if (!circuitBreakerService.canAttempt(targetHost)) {
		logger.warn(
			{
				requestId: req.requestId,
				target: targetHost,
			},
			'Circuit breaker open - rejecting request',
		);
		res.setHeader('X-Circuit-Breaker', 'OPEN');
		next(new HttpError('Target service temporarily unavailable', 503));
		return;
	}

	if (cacheable) {
		const cacheKey = cacheService.buildKey(method, targetUrl, req.headers.accept);
		req.cacheKey = cacheKey;
		req.cacheCandidate = true;

		const cached = cacheService.get(cacheKey);
		if (cached) {
			respondFromCache(res, cached);
			return;
		}

		const inFlight = inFlightRequests.get(cacheKey);
		if (inFlight) {
			metricsService.recordCache('dedupe');
			logger.debug(
				{
					requestId: req.requestId,
					cacheKey,
				},
				'Request deduplicated - waiting for in-flight request',
			);

			void inFlight.promise
				.then((cachedResponse) => {
					respondFromCache(res, cachedResponse);
				})
				.catch((error) => {
					logger.error(
						{
							requestId: req.requestId,
							error,
						},
						'In-flight request failed',
					);
					next(error);
				});
			return;
		}

		res.setHeader('X-Proxy-Cache', 'MISS');
		metricsService.recordCache('miss');
	} else {
		res.setHeader('X-Proxy-Cache', 'BYPASS');
		metricsService.recordCache('bypass');
	}

	const cleanupBodyListener = attachBodySizeGuard(req);
	attachClientTimeout(req);

	const proxyOptions = buildProxyOptions(targetUrl);

	req.once('aborted', () => {
		logger.warn(
			{
				requestId: req.requestId,
				method: req.method,
				target: targetUrl,
			},
			'Client aborted request before completion',
		);
	});

	proxy.web(req, res, proxyOptions, (error) => {
		cleanupBodyListener();
		
		if (error) {
			recordTargetFailure(targetHost);
			
			logger.error(
				{
					requestId: req.requestId,
					method: req.method,
					target: targetUrl,
					code: (error as ProxyError).code ?? error.name,
					message: error.message,
				},
				'Proxy request failed',
			);
		}
		
		next(mapProxyError(error));
	});
});

function attachClientTimeout(req: Request): void {
	req.setTimeout(securityConfig.requestTimeout, () => {
		req.destroy(new GatewayTimeoutError('Client request timeout exceeded'));
	});
}

function attachBodySizeGuard(req: Request): () => void {
	let bytesRead = 0;
	const limit = securityConfig.maxBodySizeBytes;

	const onData = (chunk: Buffer): void => {
		bytesRead += chunk.length;
		if (bytesRead > limit) {
			req.off('data', onData);
			req.destroy(new PayloadTooLargeError('Request payload exceeds configured limit'));
		}
	};

	req.on('data', onData);

	const cleanup = (): void => {
		req.off('data', onData);
	};

	req.once('end', cleanup);
	req.once('close', cleanup);

	return cleanup;
}

function handleProxyRequest(proxyReq: ClientRequest, rawReq: IncomingMessage): void {
	const req = rawReq as Request;

	if (!req.targetUrl) {
		return;
	}

	stripHeaders.forEach((header) => {
		proxyReq.removeHeader(header);
	});

	if (!proxyConfig.passThroughOrigin) {
		proxyReq.removeHeader('origin');
		proxyReq.removeHeader('referer');
	}

	if (!proxyConfig.preserveHostHeader) {
		const targetUrl = new URL(req.targetUrl);
		proxyReq.setHeader('host', targetUrl.host);
	}

	if (req.requestId) {
		proxyReq.setHeader('x-request-id', req.requestId);
	}

	const abortHandler = (): void => {
		proxyReq.destroy();
	};

	rawReq.once('aborted', abortHandler);
	rawReq.once('close', () => rawReq.off('aborted', abortHandler));
}

function handleProxyResponse(
	proxyRes: IncomingMessage,
	_rawReq: IncomingMessage,
	rawRes: ServerResponse<IncomingMessage>,
): void {
	const req = _rawReq as Request;
	const res = rawRes as unknown as Response;
	let transferred = 0;

	const cacheCollector = initCacheCollector(req, proxyRes);
	const targetOrigin = req.targetUrl ? getTargetOrigin(req.targetUrl) : null;
	let responseOutcomeSettled = false;
	const markFailure = (): void => {
		if (responseOutcomeSettled) {
			return;
		}
		responseOutcomeSettled = true;
		recordTargetFailure(targetOrigin);
	};
	const markSuccess = (): void => {
		if (responseOutcomeSettled) {
			return;
		}
		responseOutcomeSettled = true;
		recordTargetSuccess(targetOrigin);
	};

	const contentLengthHeader = proxyRes.headers['content-length'];
	if (typeof contentLengthHeader === 'string') {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > proxyConfig.maxResponseSizeBytes) {
			cacheCollector?.abort('hard-limit-content-length');
			markFailure();
			proxyRes.destroy(new BadGatewayError('Target response exceeded configured limit'));
			if (!res.headersSent) {
				res.status(502).json({
					error: true,
					message: 'Target response exceeded configured limit',
					statusCode: 502,
					timestamp: new Date().toISOString(),
				});
			} else {
				res.destroy();
			}
			return;
		}
	}

	const onData = (chunk: Buffer): void => {
		transferred += chunk.length;
		if (transferred > proxyConfig.maxResponseSizeBytes) {
			cacheCollector?.abort('hard-limit-stream');
			markFailure();
			proxyRes.destroy(new BadGatewayError('Target response exceeded configured limit'));
			if (!res.headersSent) {
				res.status(502).json({
					error: true,
					message: 'Target response exceeded configured limit',
					statusCode: 502,
					timestamp: new Date().toISOString(),
				});
			} else {
				res.destroy();
			}
		}

		if (cacheCollector) {
			cacheCollector.collect(chunk);
		}
	};

	proxyRes.on('data', onData);
	proxyRes.once('end', () => {
		proxyRes.off('data', onData);
		cacheCollector?.finalize();
		markSuccess();
	});

	proxyRes.once('aborted', () => {
		cacheCollector?.abort('aborted');
		markFailure();
	});

	proxyRes.once('close', () => {
		if (!proxyRes.complete) {
			cacheCollector?.abort('incomplete');
			markFailure();
		}
	});

	if (proxyConfig.exposeResponseHeaders.length > 0) {
		res.setHeader('Access-Control-Expose-Headers', proxyConfig.exposeResponseHeaders.join(', '));
	}
}

function buildProxyOptions(target: string): EnhancedServerOptions {
	return {
		target,
		changeOrigin: proxyConfig.changeOrigin,
		secure: proxyConfig.secure,
		followRedirects: proxyConfig.followRedirects,
		proxyTimeout: proxyConfig.proxyTimeout,
		timeout: proxyConfig.timeout,
		ignorePath: true,
		maxRedirects: proxyConfig.maxRedirects,
		agent: getAgentForTarget(target),
	};
}

function mapProxyError(error: Error | null | undefined): HttpError {
	if (!error) {
		return new HttpError('Unknown proxy error', 500);
	}

	if (error instanceof HttpError) {
		return error;
	}

	const code = (error as ProxyError).code ?? error.name;

	switch (code) {
		case 'ETIMEDOUT':
		case 'ECONNABORTED':
		case 'ESOCKETTIMEDOUT':
			return new GatewayTimeoutError('Target response timed out');
		case 'ECONNREFUSED':
		case 'EHOSTUNREACH':
		case 'ENOTFOUND':
		case 'ECONNRESET':
			return new BadGatewayError('Target host not reachable');
		case 'ERR_FR_MAX_REDIRECTS':
		case 'ERR_TOO_MANY_REDIRECTS':
		case 'MAX_REDIRECTS_EXCEEDED':
			return new BadGatewayError('Target exceeded redirect limit');
		default:
			break;
	}

	if (error instanceof PayloadTooLargeError) {
		return error;
	}

	return new HttpError('Proxy request failed', 500);
}

function isRequestCacheable(req: Request): boolean {
	if (!cacheService.isEnabled()) {
		return false;
	}

	if ((req.method ?? 'GET').toUpperCase() !== 'GET') {
		return false;
	}

	const hasAuthHeaders = Boolean(req.headers.authorization || req.headers.cookie || req.headers['x-api-key']);
	if (hasAuthHeaders) {
		return false;
	}

	const cacheControl = req.header('cache-control');
	if (cacheControl && /no-store|no-cache/i.test(cacheControl)) {
		return false;
	}

	return true;
}

function respondFromCache(res: Response, cached: CachedResponse): void {
	Object.entries(cached.headers).forEach(([key, value]) => {
		res.setHeader(key, value as string | readonly string[]);
	});
	res.setHeader('X-Proxy-Cache', 'HIT');
	metricsService.recordCache('hit');
	res.status(cached.status).send(cached.body);
}

function initCacheCollector(
	req: Request,
	proxyRes: IncomingMessage,
): { collect: (chunk: Buffer) => void; finalize: () => void; abort: (reason?: string) => void } | null {
	if (!cacheService.isEnabled() || !req.cacheCandidate || !req.cacheKey) {
		return null;
	}

	const statusCode = proxyRes.statusCode ?? 200;
	if (statusCode < 200 || statusCode >= 300) {
		return null;
	}

	if (proxyRes.headers['set-cookie']) {
		return null;
	}

	const cacheControl = proxyRes.headers['cache-control'];
	if (typeof cacheControl === 'string' && /no-store|private/i.test(cacheControl)) {
		return null;
	}

	const contentLengthHeader = proxyRes.headers['content-length'];
	if (typeof contentLengthHeader === 'string') {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > cacheConfig.maxBodyBytes) {
			return null;
		}
	}

	const chunks: Buffer[] = [];
	let collected = 0;
	let settled = false;
	const cacheKey = req.cacheKey!;

	let resolveInFlight: ((value: CachedResponse) => void) | null = null;
	let rejectInFlight: ((reason: Error) => void) | null = null;

	const inFlightPromise = new Promise<CachedResponse>((resolve, reject) => {
		resolveInFlight = resolve;
		rejectInFlight = reject;
	});

	inFlightRequests.set(cacheKey, {
		promise: inFlightPromise,
		timestamp: Date.now(),
	});

	const abort = (reason?: string): void => {
		if (settled) {
			return;
		}
		settled = true;
		chunks.length = 0;
		metricsService.recordCache('error');
		inFlightRequests.delete(cacheKey);
		if (rejectInFlight) {
			rejectInFlight(new Error(reason ?? 'Cache collection aborted'));
		}
	};

	return {
		collect: (chunk: Buffer) => {
			if (settled) {
				return;
			}

			const len = chunk.length;
			if (collected + len > cacheConfig.maxBodyBytes) {
				logger.debug(
					{
						requestId: req.requestId,
						collected,
						chunkSize: len,
						maxBodyBytes: cacheConfig.maxBodyBytes,
					},
					'Cache collection aborted: size limit exceeded',
				);
				abort('Response too large to cache');
				return;
			}

			collected += len;
			chunks.push(Buffer.from(chunk));
		},
		finalize: () => {
			if (settled) {
				return;
			}
			if (chunks.length === 0) {
				abort('Cache collection aborted');
				return;
			}

			const body = Buffer.concat(chunks);
			const cachedResponse: CachedResponse = {
				status: statusCode,
				headers: filterResponseHeaders(proxyRes.headers, body.length),
				body,
			};

			cacheService.set(cacheKey, cachedResponse);
			settled = true;
			if (resolveInFlight) {
				resolveInFlight(cachedResponse);
			}
			inFlightRequests.delete(cacheKey);
		},
		abort,
	};
}

function filterResponseHeaders(headers: IncomingHttpHeaders, bodyLength: number): Record<string, string | string[]> {
	const filtered: Record<string, string | string[]> = {};
	for (const [key, value] of Object.entries(headers)) {
		if (!key || hopByHopResponseHeaders.has(key.toLowerCase())) {
			continue;
		}
		if (typeof value === 'undefined') {
			continue;
		}
		filtered[key] = value;
	}

	filtered['content-length'] = String(bodyLength);

	return filtered;
}

function getTargetOrigin(targetUrl: string): string | null {
	try {
		return new URL(targetUrl).origin;
	} catch {
		return null;
	}
}

function recordTargetFailure(origin: string | null): void {
	if (!origin) {
		return;
	}
	circuitBreakerService.recordFailure(origin);
}

function recordTargetSuccess(origin: string | null): void {
	if (!origin) {
		return;
	}
	circuitBreakerService.recordSuccess(origin);
}
