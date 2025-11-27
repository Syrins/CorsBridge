import http from 'http';
import express, { type NextFunction, type Request, type Response } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import v8 from 'v8';

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

const MEMORY_WARNING_PERCENT = (() => {
  const value = Number(process.env.HEALTH_MEMORY_WARNING_PERCENT);
  if (Number.isFinite(value)) {
    return Math.min(Math.max(value, 1), 100);
  }
  return 92;
})();

const MIN_HEAP_FLOOR_MB = (() => {
  const value = Number(process.env.HEALTH_MIN_HEAP_MB);
  if (Number.isFinite(value)) {
    return Math.max(value, 64);
  }
  return 256;
})();

let isShuttingDown = false;

export function setShuttingDownState(value: boolean): void {
  isShuttingDown = value;
}

function applyHealthCors(res: Response): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '600');
}

/**
 * Check memory health
 */
function checkMemoryHealth(): { status: string; heapUsed: number; heapTotal: number; rss: number } {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(usage.rss / 1024 / 1024);
  const heapLimitMB = Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024);

  const effectiveHeapTotalMB = Math.max(heapTotalMB, MIN_HEAP_FLOOR_MB, heapLimitMB);
  const heapUsagePercent = (heapUsedMB / effectiveHeapTotalMB) * 100;
  const status = heapUsagePercent > MEMORY_WARNING_PERCENT ? 'warning' : 'ok';

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
async function checkCacheHealth(): Promise<{ status: string; enabled: boolean; stats: unknown }> {
  if (!cacheService.isEnabled()) {
    return {
      status: 'ok',
      enabled: false,
      stats: null,
    };
  }

  try {
    const stats = await cacheService.getStats();
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

  const healthRoutes = ['/health', '/health/ready', '/health/live'];
  healthRoutes.forEach((path) => {
    app.options(path, (_req: Request, res: Response) => {
      applyHealthCors(res);
      res.status(204).end();
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    applyHealthCors(res);
    const startDate = new Date('2025-10-26T00:00:00Z').getTime();
    const uptime = (Date.now() - startDate) / 1000;
    res.status(200).json({
      status: 'ok',
      uptime: uptime,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    applyHealthCors(res);
    const startDate = new Date('2025-10-26T00:00:00Z').getTime();
    const uptime = (Date.now() - startDate) / 1000;
    const cacheHealth = await checkCacheHealth();
    const health = {
      status: 'ready',
      uptime: uptime,
      timestamp: new Date().toISOString(),
      checks: {
        memory: checkMemoryHealth(),
        cache: cacheHealth,
      },
    };

    const allHealthy = Object.values(health.checks).every((check) => check.status === 'ok');

    res.status(allHealthy ? 200 : 503).json(health);
  });

  app.get('/health/live', (_req: Request, res: Response) => {
    applyHealthCors(res);
    const startDate = new Date('2025-10-26T00:00:00Z').getTime();
    const uptime = (Date.now() - startDate) / 1000;
    res.status(200).json({
      status: 'alive',
      uptime: uptime,
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
