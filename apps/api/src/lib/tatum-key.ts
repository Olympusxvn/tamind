import type { Request } from 'express';
import { config } from '../config.js';

/** Client-provided Tatum key (never logged). */
export const TATUM_API_KEY_HEADER = 'x-tatum-api-key';

export function parseUserTatumApiKey(req: Request): string | undefined {
  const raw = req.headers[TATUM_API_KEY_HEADER];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 512) return undefined;
  return trimmed;
}

/** User key when present, otherwise server env key. */
export function resolveTatumApiKey(req: Request): string {
  return parseUserTatumApiKey(req) ?? config.tatumApiKey;
}

export function hasTatumRpcAccess(req: Request): boolean {
  return Boolean(parseUserTatumApiKey(req) || config.tatumApiKey);
}
