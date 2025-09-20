import pino from 'pino';
import { applicationConfiguration } from './config/env';

export const applicationLogger = pino({
  level: process.env.LOG_LEVEL ?? (applicationConfiguration.environment === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV === 'production'
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          singleLine: true
        }
      }
});
