import 'dotenv/config';
import os from 'os';
import type http from 'http';
import type { Socket } from 'net';

import { createServer, setShuttingDownState } from './server';
import { logger } from './services/logger.service';
import { disableTlsSessionReuse } from './utils/tls';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const memoryThresholdMb = Number(process.env.MEMORY_RESTART_THRESHOLD_MB ?? 0);
const memoryGuardIntervalMs = Number(process.env.MEMORY_GUARD_INTERVAL_MS ?? 60_000);

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

let shuttingDown = false;

function initiateShutdown(
  reason: string,
  server: http.Server,
  connections: Set<Socket>,
  exitCode: number,
): void {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  setShuttingDownState(true);
  logger.warn({ reason }, 'Shutting down server');

  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Error while closing HTTP server');
      process.exit(exitCode || 1);
      return;
    }
    logger.info('HTTP server closed gracefully');
    process.exit(exitCode);
  });

  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    connections.forEach((socket) => socket.destroy());
    process.exit(1);
  }, 10_000).unref();

  connections.forEach((socket) => {
    socket.end();
    setTimeout(() => socket.destroy(), 5_000).unref();
  });
}

void bootstrap();
