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
import { dedupeService } from './dedupe.service';
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
	resolve: (value: CachedResponse) => void;
	reject: (reason: Error) => void;
	timestamp: number;
}

const inFlightRequests = new Map<string, InFlightRequest>();

setInterval(() => {
	const now = Date.now();
	const timeout = 60_000;

	for (const [key, request] of inFlightRequests.entries()) {
		if (now - request.timestamp > timeout) {
			inFlightRequests.delete(key);
			request.reject(new Error('In-flight cache request timed out'));
		}
	}
}, 60_000).unref();

function trackInFlightRequest(cacheKey: string): InFlightRequest {
	let resolve: ((value: CachedResponse) => void) | null = null;
	let reject: ((reason: Error) => void) | null = null;

	const promise = new Promise<CachedResponse>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	const entry: InFlightRequest = {
		promise,
		resolve: resolve!,
		reject: reject!,
		timestamp: Date.now(),
	};

	inFlightRequests.set(cacheKey, entry);
	return entry;
}

function resolveInFlightRequest(cacheKey: string | undefined, payload: CachedResponse): void {
	if (!cacheKey) {
		return;
	}
	const entry = inFlightRequests.get(cacheKey);
	if (!entry) {
		void dedupeService.release(cacheKey);
		return;
	}
	inFlightRequests.delete(cacheKey);
	entry.resolve(payload);
	void dedupeService.release(cacheKey);
}

function rejectInFlightRequest(cacheKey: string | undefined, error: Error): void {
	if (!cacheKey) {
		return;
	}
	const entry = inFlightRequests.get(cacheKey);
	if (!entry) {
		void dedupeService.release(cacheKey);
		return;
	}
	inFlightRequests.delete(cacheKey);
	entry.reject(error);
	void dedupeService.release(cacheKey);
}

const timeoutErrorCodes = new Set([
	'ETIMEDOUT',
	'ECONNABORTED',
	'ESOCKETTIMEDOUT',
	'ECONNRESET',
	'UND_ERR_ABORTED',
	'UND_ERR_CONNECT_TIMEOUT',
	'UND_ERR_HEADERS_TIMEOUT',
	'UND_ERR_BODY_TIMEOUT',
	'ERR_STREAM_PREMATURE_CLOSE',
	'ERR_SSL_INVALID_SESSION_ID',
]);

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

export const proxyRouter = Router();

proxyRouter.all(/(.*)/, async (req: Request, res: Response, next: NextFunction) => {
	try {
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
		const bypassCache = shouldBypassCache(req);
		const cacheable = isRequestCacheable(req) && !bypassCache;

		req.redirectCount = 0;

		const targetHost = getTargetOrigin(targetUrl);
		if (!targetHost) {
			next(new ValidationError('Invalid target URL', 400));
			return;
		}

		if (targetHost && !(await circuitBreakerService.canAttempt(targetHost))) {
			logger.warn(
				{
					requestId: req.requestId,
					target: targetHost,
				},
				'Circuit breaker open - rejecting request',
			);
			res.setHeader('X-Circuit-Breaker', 'OPEN');
			res.setHeader('X-Proxy-Status', 'CIRCUIT_OPEN');
			next(new HttpError('Target service temporarily unavailable', 503));
			return;
		}

		if (cacheable) {
			const cacheKey = cacheService.buildKey(method, targetUrl, req.headers.accept);
			req.cacheKey = cacheKey;
			req.cacheCandidate = true;

			const cached = await cacheService.get(cacheKey);
			if (cached) {
				res.setHeader('X-Proxy-Status', 'HIT');
				respondFromCache(res, cached);
				return;
			}

			const inFlight = inFlightRequests.get(cacheKey);
			if (inFlight) {
				metricsService.recordCache('dedupe');

				void inFlight.promise
					.then((cachedResponse) => {
						res.setHeader('X-Proxy-Status', 'HIT');
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

			if (dedupeService.supportsDistributedLocks()) {
				const distributedRole = await dedupeService.tryAcquire(cacheKey);
				if (distributedRole === 'follower') {
					metricsService.recordCache('dedupe');
					res.setHeader('X-Proxy-Status', 'DEDUPE_FOLLOWER');

					const remotePayload = await dedupeService.waitForRemote(cacheKey);
					if (remotePayload) {
						res.setHeader('X-Proxy-Status', 'HIT');
						respondFromCache(res, remotePayload);
						return;
					}

					const promotedRole = await dedupeService.promote(cacheKey);
					if (promotedRole === 'follower') {
						logger.warn(
							{
								requestId: req.requestId,
								cacheKey,
							},
							'Distributed dedupe wait timed out — responding with 504',
						);
						next(new GatewayTimeoutError('Another proxy node is still processing this request'));
						return;
					}
				}
			}

			trackInFlightRequest(cacheKey);

			res.setHeader('X-Proxy-Cache', 'MISS');
			res.setHeader('X-Proxy-Status', 'MISS');
			metricsService.recordCache('miss');
		} else {
			res.setHeader('X-Proxy-Cache', 'BYPASS');
			res.setHeader('X-Proxy-Status', 'BYPASS');
			if (bypassCache) {
				res.setHeader('X-Proxy-Bypass-Reason', 'CLIENT_REQUEST');
			}
			metricsService.recordCache('bypass');
		}

		const cleanupBodyListener = attachBodySizeGuard(req);
		attachClientTimeout(req);
		prepareProxyRequestHeaders(req);

		const proxyOptions = {
			...buildProxyOptions(targetUrl),
			proxyTimeout: Number(process.env.PROXY_PROXY_TIMEOUT || 30000),
			timeout: Number(process.env.PROXY_TIMEOUT || 30000),
		};

		req.once('aborted', () => {
			logger.warn(
				{
					requestId: req.requestId,
					method: req.method,
					target: targetUrl,
				},
				'Client aborted request before completion',
			);
			rejectInFlightRequest(req.cacheKey, new GatewayTimeoutError('Client aborted request before completion'));
		});

		proxy.web(req, res, proxyOptions, (error) => {
			cleanupBodyListener();

			if (!error) {
				return;
			}

			recordTargetFailure(targetHost);
			const mappedError = mapProxyError(error);
			rejectInFlightRequest(req.cacheKey, mappedError);

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

			if (!isResponseWritable(res)) {
				logger.warn(
					{
						requestId: req.requestId,
						target: targetUrl,
					},
					'Skipping proxy error response because client connection already closed',
				);
				if (!res.writableEnded && !res.writableFinished && !(res as any).destroyed) {
					res.end();
				}
				return;
			}

			next(mappedError);
		});
	} catch (error) {
		next(error);
	}
});

function attachClientTimeout(req: Request): void {
	req.setTimeout(securityConfig.requestTimeout, () => {
		req.destroy(new GatewayTimeoutError('Client request timeout exceeded'));
	});
}

function attachBodySizeGuard(req: Request): () => void {
	let bytesRead = 0;
	const limit = Math.min(securityConfig.maxBodySizeBytes, req.bodySizeLimitBytes ?? securityConfig.maxBodySizeBytes);

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

	const abortHandler = (): void => {
		proxyReq.destroy();
	};

	rawReq.once('aborted', abortHandler);
	rawReq.once('close', () => rawReq.off('aborted', abortHandler));
}

function prepareProxyRequestHeaders(req: Request): void {
	const headers = req.headers;

	stripHeaders.forEach((header) => {
		if (header in headers) {
			delete headers[header];
		}
	});

	if (!proxyConfig.passThroughOrigin) {
		delete headers.origin;
		delete headers.referer;
	}

	if (req.requestId) {
		headers['x-request-id'] = req.requestId;
	}

	if (!proxyConfig.preserveHostHeader && req.targetUrl) {
		headers.host = new URL(req.targetUrl).host;
	}
}

function enforceRedirectLimits(req: Request, proxyRes: IncomingMessage): boolean {
	const statusCode = proxyRes.statusCode ?? 200;
	if (statusCode < 300 || statusCode >= 400 || !proxyRes.headers.location) {
		return false;
	}

	req.redirectCount = (req.redirectCount ?? 0) + 1;
	if (req.redirectCount <= proxyConfig.maxRedirects) {
		return false;
	}

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
	return true;
}

function handleProxyResponse(
	proxyRes: IncomingMessage,
	_rawReq: IncomingMessage,
	rawRes: ServerResponse<IncomingMessage>,
): void {
	const req = _rawReq as Request;
	const res = rawRes as unknown as Response;
	let transferred = 0;

	if (enforceRedirectLimits(req, proxyRes)) {
		return;
	}

	if (req.startTime) {
		const duration = Date.now() - req.startTime;
		// Estimate upstream time as duration since we entered proxy (roughly)
		// Precise upstream timing requires wrapping proxy.web, but total is good enough for now.
		res.setHeader('X-Proxy-Timing', `total=${duration}ms`);
	}

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

	if (proxyConfig.exposeResponseHeaders.length > 0 && isResponseWritable(res)) {
		const mergedExposeHeaders = buildExposeHeaderValue(
			res.getHeader('Access-Control-Expose-Headers') ?? undefined,
			proxyConfig.exposeResponseHeaders,
		);

		if (mergedExposeHeaders) {
			res.setHeader('Access-Control-Expose-Headers', mergedExposeHeaders);
		}
	}
}

function buildExposeHeaderValue(
	existing: number | string | string[] | undefined,
	extra: readonly string[],
): string | null {
	const headerSet = new Set<string>();

	const appendValues = (value: string | number | string[] | undefined): void => {
		if (typeof value === 'undefined') {
			return;
		}

		if (Array.isArray(value)) {
			value.forEach((entry) => appendValues(entry));
			return;
		}

		const normalized = value.toString();
		normalized
			.split(',')
			.map((segment) => segment.trim())
			.filter(Boolean)
			.forEach((segment) => headerSet.add(segment));
	};

	appendValues(existing);
	extra.forEach((entry) => appendValues(entry));

	if (headerSet.size === 0) {
		return null;
	}

	return Array.from(headerSet).join(', ');
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

	const rawCode =
		(error as ProxyError).code ??
		((error as { cause?: ProxyError }).cause?.code ?? undefined) ??
		error.name;
	const code = rawCode?.toUpperCase();
	const name = error.name;
	const message = error.message ?? '';

	if (isTimeoutLikeError(code, name, message)) {
		return new GatewayTimeoutError('Target response timed out', {
			reason: 'upstream-timeout',
			code,
		});
	}

	switch (code) {
		case 'ECONNREFUSED':
		case 'EHOSTUNREACH':
		case 'ENOTFOUND':
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

function isTimeoutLikeError(code: string | undefined, name: string, message: string): boolean {
	if (timeoutErrorCodes.has(code ?? '')) {
		return true;
	}

	if (/timeout|timed out/i.test(message)) {
		return true;
	}

	if (/socket hang up|client network socket disconnected/i.test(message)) {
		return true;
	}

	return name === 'AbortError' || name === 'TimeoutError';
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
	if (!isResponseWritable(res)) {
		logger.warn(
			{
				requestId: res.requestId,
			},
			'Skipping cache replay because response is already closed',
		);
		return;
	}
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
		rejectInFlightRequest(req.cacheKey, new Error('Response status not cacheable'));
		return null;
	}

	if (proxyRes.headers['set-cookie']) {
		rejectInFlightRequest(req.cacheKey, new Error('Response contains Set-Cookie header'));
		return null;
	}

	const cacheControl = proxyRes.headers['cache-control'];
	if (typeof cacheControl === 'string' && /no-store|private/i.test(cacheControl)) {
		rejectInFlightRequest(req.cacheKey, new Error('Response marked as uncacheable'));
		return null;
	}

	const contentLengthHeader = proxyRes.headers['content-length'];
	if (typeof contentLengthHeader === 'string') {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > cacheConfig.maxBodyBytes) {
			rejectInFlightRequest(req.cacheKey, new Error('Content-Length exceeds cache limit'));
			return null;
		}
	}

	const chunks: Buffer[] = [];
	let collected = 0;
	let settled = false;
	const cacheKey = req.cacheKey!;

	const abort = (reason?: string): void => {
		if (settled) {
			return;
		}
		settled = true;
		chunks.length = 0;
		metricsService.recordCache('error');
		rejectInFlightRequest(cacheKey, new Error(reason ?? 'Cache collection aborted'));
	};

	return {
		collect: (chunk: Buffer) => {
			if (settled) {
				return;
			}

			const len = chunk.length;
			if (collected + len > cacheConfig.maxBodyBytes) {
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

			void cacheService.set(cacheKey, cachedResponse);
			settled = true;
			resolveInFlightRequest(cacheKey, cachedResponse);
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

function isResponseWritable(res: Response): boolean {
	const serverResponse = res as unknown as ServerResponse;
	if (res.headersSent) {
		return false;
	}
	if (serverResponse.writableEnded || serverResponse.writableFinished) {
		return false;
	}
	if ((serverResponse as { destroyed?: boolean }).destroyed) {
		return false;
	}
	return true;
}

function shouldBypassCache(req: Request): boolean {
	if (req.query?.refresh === 'true') {
		return true;
	}
	if (req.headers['cache-control'] === 'no-cache') {
		return true;
	}
	if (req.headers['pragma'] === 'no-cache') {
		return true;
	}
	return false;
}
