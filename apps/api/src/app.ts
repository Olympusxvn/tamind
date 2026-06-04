import express from 'express';
import cors from 'cors';
import { datasetsRouter, errorHandler } from './routes/datasets.js';
import { suiProxyRouter } from './routes/sui-proxy.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      allowedHeaders: ['Content-Type', 'X-Tatum-Api-Key'],
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'tamind-api' });
  });

  app.use('/api/datasets', datasetsRouter);
  app.use('/api/sui', suiProxyRouter);

  app.use(errorHandler);

  return app;
}
