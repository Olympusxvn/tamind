import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { datasetsRouter, errorHandler } from './routes/datasets.js';
import { suiProxyRouter } from './routes/sui-proxy.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tamind-api' });
});

app.use('/api/datasets', datasetsRouter);
app.use('/api/sui', suiProxyRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`TaMind API listening on http://localhost:${config.port}`);
});
