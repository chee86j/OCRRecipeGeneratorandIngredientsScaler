import { buildApplication } from './app';
import { applicationConfiguration } from './config/env';
import { applicationLogger } from './logger';

const startServer = async () => {
  const application = buildApplication();

  application.listen(applicationConfiguration.port, () => {
    applicationLogger.info(
      {
        port: applicationConfiguration.port,
        environment: applicationConfiguration.environment
      },
      'Server is listening'
    );
  });
};

startServer().catch((error) => {
  applicationLogger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  applicationLogger.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  applicationLogger.error({ err: reason }, 'Unhandled rejection');
  process.exit(1);
});
