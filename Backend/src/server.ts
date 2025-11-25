import http from 'http';
import express, { type NextFunction, type Request, type Response } from 'express';
import compression from 'compression';
import helmet from 'helmet';

import { securityConfig } from './config/security.config';
import { corsHandler } from './middleware/corsHandler';
import { urlValidationMiddleware } from './middleware/urlValidator';
import { bodyValidationMiddleware } from './middleware/bodyValidator';
import { rateLimiter } from './middleware/rateLimiter';
import { originTracker } from './middleware/originChecker';
import { requestLogger } from './middleware/requestLogger';
import { abuseMonitor } from './middleware/abuseMonitor';
import { errorHandler } from './middleware/errorHandler';
import { tracingMiddleware } from './middleware/tracing';
import { proxyRouter } from './services/proxy.service';
import { getHelpContent, showHelpOnRoot } from './services/help.service';
import { metricsService } from './services/metrics.service';
import { analyticsTracker } from './services/analytics.service';
import { cacheService } from './services/cache.service';

let isShuttingDown = false;

export function setShuttingDownState(value: boolean): void {
  isShuttingDown = value;
}

/**
 * Check memory health
 */
function checkMemoryHealth(): { status: string; heapUsed: number; heapTotal: number; rss: number } {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(usage.rss / 1024 / 1024);

  const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
  const status = heapUsagePercent > 80 ? 'warning' : 'ok';

  return {
    status,
    heapUsed: heapUsedMB,
    heapTotal: heapTotalMB,
    rss: rssMB,
  };
}

/**
 * Check cache health
 */
function checkCacheHealth(): { status: string; enabled: boolean; stats: unknown } {
  if (!cacheService.isEnabled()) {
    return {
      status: 'ok',
      enabled: false,
      stats: null,
    };
  }

  try {
    const stats = cacheService.getStats();
    return {
      status: 'ok',
      enabled: true,
      stats,
    };
  } catch (error) {
    return {
      status: 'error',
      enabled: true,
      stats: null,
    };
  }
}

export async function createServer(): Promise<http.Server> {
  const app = express();

  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    if (isShuttingDown) {
      res.setHeader('Connection', 'close');
      res.status(503).json({
        error: true,
        message: 'Server is shutting down. Please retry shortly.',
        statusCode: 503,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    compression({
      filter: (req, res) => {
        const hasProxyTarget = typeof req.query?.url === 'string';
        if (hasProxyTarget) {
          return false;
        }

        return compression.filter(req, res);
      },
    }),
  );

  app.use(tracingMiddleware);
  app.use(requestLogger);
  app.use(rateLimiter);
  app.use(abuseMonitor);
  app.use(originTracker);
  app.use(corsHandler);
  app.use(bodyValidationMiddleware);

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    const health = {
      status: 'ready',
      uptime: process.uptime(),
      timestamp: Date.now(),
      checks: {
        memory: checkMemoryHealth(),
        cache: checkCacheHealth(),
      },
    };

    const allHealthy = Object.values(health.checks).every((check) => check.status === 'ok');

    res.status(allHealthy ? 200 : 503).json(health);
  });

  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'alive',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  app.get('/help', (_req: Request, res: Response) => {
    res
      .status(200)
      .type('text/plain; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=300')
      .send(getHelpContent());
  });

  app.get('/metrics', (_req: Request, res: Response) => {
    const snapshot = metricsService.getSnapshot();
    res.status(200).json({
      ...snapshot,
      topOrigins: analyticsTracker.getTopOrigins(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics/prometheus', (_req: Request, res: Response) => {
    const prometheusMetrics = metricsService.exportPrometheus();
    res
      .status(200)
      .type('text/plain; version=0.0.4; charset=utf-8')
      .send(prometheusMetrics);
  });

  app.get('/circuit-breakers', (_req: Request, res: Response) => {
    const { circuitBreakerService } = require('./services/circuit-breaker.service');
    const states = circuitBreakerService.getAllStates();
    res.status(200).json({
      circuits: states,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/', (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.query?.url === 'string') {
      next();
      return;
    }

    if (!showHelpOnRoot) {
      res.status(200).json({
        name: 'CorsBridge',
        version: process.env.PROXY_VERSION ?? 'dev',
        message: 'Proxy endpoint ready • built by Syrins (syrins.tech). Use /?url={TARGET_URL}.',
      });
      return;
    }

    res
      .status(200)
      .type('text/plain; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=300')
      .send(getHelpContent());
  });

  app.use(urlValidationMiddleware);
  app.use('/', proxyRouter);

  app.use(errorHandler);

  const server = http.createServer({ maxHeaderSize: securityConfig.maxHeaderSize }, app);

  server.requestTimeout = securityConfig.requestTimeout;
  server.keepAliveTimeout = securityConfig.keepAliveTimeout;
  server.headersTimeout = securityConfig.headersTimeout;

  return server;
}
