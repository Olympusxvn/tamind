import { Router } from 'express';
import { config } from '../config.js';
import { hasTatumRpcAccess, resolveTatumApiKey } from '../lib/tatum-key.js';

export const suiProxyRouter = Router();

/** Proxy JSON-RPC to Tatum Sui gateway (user or server API key). */
suiProxyRouter.post('/*', async (req, res) => {
  if (!hasTatumRpcAccess(req)) {
    return res.status(503).json({ error: 'Tatum API key not configured (set TATUM_API_KEY or send X-Tatum-Api-Key)' });
  }
  const apiKey = resolveTatumApiKey(req);
  try {
    const upstream = await fetch(config.tatumSuiRpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
