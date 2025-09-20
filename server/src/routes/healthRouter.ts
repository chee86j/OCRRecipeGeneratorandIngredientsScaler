import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/healthz', (_request, response) => {
  response.json({ status: 'ok', timestamp: new Date().toISOString() });
});
