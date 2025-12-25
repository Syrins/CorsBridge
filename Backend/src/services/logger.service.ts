import pino from 'pino';

import { appConfig } from '../config/app.config';

const level = appConfig.logLevel;
const serviceName = appConfig.serviceName;

export const logger = pino({
  level,
  base: {
    service: serviceName,
    env: appConfig.nodeEnv,
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
