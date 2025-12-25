import 'dotenv/config';
import { validateEnv } from './config/env.schema';

// Validate environment before doing anything else
validateEnv();

import os from 'os';
import type http from 'http';
import type { Socket } from 'net';

import { createServer, setShuttingDownState } from './server';
import { logger } from './services/logger.service';
import { disableTlsSessionReuse } from './utils/tls';
import { getActiveRequestCount } from './middleware/requestLogger';
import * as Sentry from '@sentry/node';

import { appConfig } from './config/app.config';

if (appConfig.errorTrackingDsn) {
  Sentry.init({
    dsn: appConfig.errorTrackingDsn,
    environment: appConfig.nodeEnv,
    tracesSampleRate: 1.0,
  });
  logger.info('Sentry initialized for error tracking');
}

const port = appConfig.port;
const host = appConfig.host;
const memoryThresholdMb = appConfig.memoryRestartThresholdMb;
const memoryGuardIntervalMs = appConfig.memoryGuardIntervalMs;

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap(): Promise<void> {
  disableTlsSessionReuse();
  const server = await createServer();
  const connections = trackConnections(server);
  registerProcessHandlers(server, connections);
  startMemoryGuard(server, connections);

  server.listen(port, host, () => {
    const localIp = getLocalIpAddress();
    logger.info({ port, host, localIp }, 'CorsBridge backend running - syrins.tech');
  });
}

function trackConnections(server: http.Server): Set<Socket> {
  const connections = new Set<Socket>();
  server.on('connection', (socket) => {
    connections.add(socket);
    socket.on('close', () => connections.delete(socket));
    socket.on('error', () => connections.delete(socket));
  });
  return connections;
}

function serializeProcessError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const errno = error as NodeJS.ErrnoException;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: errno.code,
    };
  }

  return {
    error,
  };
}

function registerProcessHandlers(server: http.Server, connections: Set<Socket>): void {
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason: serializeProcessError(reason) }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error({ error: serializeProcessError(error) }, 'Uncaught exception');
    initiateShutdown('uncaughtException', server, connections, 1);
  });

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      initiateShutdown(signal, server, connections, 0);
    });
  });
}

function startMemoryGuard(server: http.Server, connections: Set<Socket>): void {
  if (!Number.isFinite(memoryThresholdMb) || memoryThresholdMb <= 0) {
    return;
  }

  const thresholdBytes = memoryThresholdMb * 1024 * 1024;
  const interval = Number.isFinite(memoryGuardIntervalMs) && memoryGuardIntervalMs > 0 ? memoryGuardIntervalMs : 60_000;

  setInterval(() => {
    const usage = process.memoryUsage();
    if (usage.rss >= thresholdBytes) {
      logger.error({ rss: usage.rss, thresholdBytes }, 'Memory threshold exceeded. Restarting to prevent leaks.');
      initiateShutdown('memory-threshold', server, connections, 1);
    }
  }, interval).unref();
}

let isShuttingDown = false;

async function initiateShutdown(
  reason: string,
  server: http.Server,
  connections: Set<Socket>,
  exitCode: number,
): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  setShuttingDownState(true);

  logger.warn({ reason }, 'Shutdown signal received. Starting graceful shutdown...');

  const start = Date.now();
  const SHUTDOWN_TIMEOUT_MS = 30000;
  const CHECK_INTERVAL_MS = 500;

  const waitForDrain = async () => {
    while (Date.now() - start < SHUTDOWN_TIMEOUT_MS) {
      const activeRequests = getActiveRequestCount();
      if (activeRequests === 0) {
        logger.info('All active requests drained.');
        return;
      }
      logger.info({ activeRequests }, 'Waiting for requests to drain...');
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
    }
    logger.warn('Shutdown timeout reached. Forcing exit with active requests.');
  };

  server.close(async (error) => {
    if (error) {
      logger.error({ error }, 'Error while closing HTTP server');
      process.exit(exitCode || 1);
      return;
    }
    logger.info('HTTP server closed gracefully.');
    await waitForDrain(); // Wait for requests to drain after server stops accepting new ones

    // Cleanup other resources...
    try {
      // Destroy any remaining open connections
      connections.forEach((socket) => socket.destroy());
      logger.info('All connections destroyed.');
      process.exit(exitCode);
    } catch (cleanupError) {
      logger.error({ error: cleanupError }, 'Error during shutdown cleanup');
      process.exit(1);
    }
  });

  // Force exit if server.close takes too long (e.g. keep-alive connections or long-running requests)
  setTimeout(() => {
    logger.error('Force shutting down due to timeout');
    connections.forEach((socket) => socket.destroy()); // Ensure all sockets are destroyed
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS + 5000).unref();

  connections.forEach((socket) => {
    socket.end();
    setTimeout(() => socket.destroy(), 5_000).unref();
  });
}

void bootstrap();
