import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { healthRouter } from './routes/healthRouter';
import { ocrRouter } from './routes/ocrRouter';
import { parseRouter } from './routes/parseRouter';
import { validateRouter } from './routes/validateRouter';
import { scaleRouter } from './routes/scaleRouter';
import { exportRouter } from './routes/exportRouter';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandler';
import { applicationLogger } from './logger';

export const buildApplication = () => {
  const application = express();

  const allowedOriginsFromEnvironment = process.env.CORS_ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  application.use(
    cors({
      origin: allowedOriginsFromEnvironment && allowedOriginsFromEnvironment.length > 0 ? allowedOriginsFromEnvironment : true,
      credentials: true
    })
  );

  application.use(helmet());
  application.use(express.json({ limit: '10mb' }));
  application.use(express.urlencoded({ extended: true }));

  application.use(
    pinoHttp({
      logger: applicationLogger,
      autoLogging: true,
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) return 'error';
        if (response.statusCode >= 400) return 'warn';
        return 'info';
      }
    })
  );

  application.use('/api', healthRouter);
  application.use('/api', ocrRouter);
  application.use('/api', parseRouter);
  application.use('/api', validateRouter);
  application.use('/api', scaleRouter);
  application.use('/api', exportRouter);

  application.use(notFoundHandler);
  application.use(globalErrorHandler);

  return application;
};
