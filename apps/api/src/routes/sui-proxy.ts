import { Router } from 'express';
import { config } from '../config.js';

export const suiProxyRouter = Router();

/** Proxy JSON-RPC to Tatum Sui gateway (API key server-side). */
suiProxyRouter.post('/*', async (req, res) => {
  if (!config.tatumApiKey) {
    return res.status(503).json({ error: 'TATUM_API_KEY not configured' });
  }
  try {
    const upstream = await fetch(config.tatumSuiRpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.tatumApiKey,
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'Proxy error' });
  }
});

suiProxyRouter.get('/health', (_req, res) => {
  res.json({ ok: true, rpc: config.tatumSuiRpc, network: config.suiNetwork });
});
