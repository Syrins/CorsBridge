import pino from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';
const serviceName = process.env.SERVICE_NAME ?? 'corsbridge-backend';

export const logger = pino({
  level,
  base: {
    service: serviceName,
    env: process.env.NODE_ENV ?? 'development',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
