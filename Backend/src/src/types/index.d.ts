import type { RequestHandler } from 'express';

declare global {
	namespace Express {
		interface Request {
			/** Fully-sanitised upstream URL */
			targetUrl?: string;
			/** Stable request identifier shared with logs */
			requestId?: string;
			/** High-resolution start timestamp */
			startTime?: number;
			/** Cache key emitted by cache service */
			cacheKey?: string;
			/** Whether the request is eligible for caching */
			cacheCandidate?: boolean;
			/** Number of redirects followed by proxy */
			redirectCount?: number;
			/** Distributed tracing identifiers */
			traceId?: string;
			spanId?: string;
			parentSpanId?: string;
			traceFlags?: string;
			/** Optional per-request body size limit determined by validators */
			bodySizeLimitBytes?: number;
		}

		interface Response {
			requestId?: string;
		}
	}
}

export type ExpressMiddleware = RequestHandler;
