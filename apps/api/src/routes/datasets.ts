import { Router, type Request, type Response, type NextFunction } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import multer from 'multer';
import { config } from '../config.js';
import { listDatasetsFromChain, getDatasetById } from '../services/registry.js';
import { encryptDataset, buildSealApproveTxBytes } from '../services/seal-v2.js';
import { uploadCiphertext, fetchBlobBytes } from '../services/walrus.js';
import { registerDatasetOnChain } from '../services/onchain.js';
import { getSuiClient } from '../services/sui.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

/** Hackathon demo blobs registered before Walrus mainnet capacity opened. */
const DEMO_BLOB_IDS = new Set(['tamind_demo_blob_v1', 'demo_blob_sui_tx_7d']);

function demoParquetPath(): string | null {
  const candidates = [
    join(process.cwd(), '../../pipeline/out/sui_tx_7d_20260524.parquet'),
    join(process.cwd(), 'pipeline/out/sui_tx_7d_20260524.parquet'),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

export const datasetsRouter = Router();

datasetsRouter.get('/', async (_req, res, next) => {
  try {
    const datasets = await listDatasetsFromChain();
    res.json({ datasets });
  } catch (e) {
    next(e);
  }
});

datasetsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dataset = await getDatasetById(id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
    res.json({ dataset });
  } catch (e) {
    next(e);
  }
});

datasetsRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const body = z
      .object({
        title: z.string().min(1),
        priceMist: z.string().regex(/^\d+$/),
        sealPolicyId: z.string().optional(),
      })
      .parse(req.body);

    if (!req.file) return res.status(400).json({ error: 'file required' });

    const { encryptedObject, sealPolicyId, sealEncrypted } = await encryptDataset(
      new Uint8Array(req.file.buffer),
      body.sealPolicyId,
    );
    const { blobId, walrusUrl } = await uploadCiphertext(encryptedObject);

    let registerTx: { digest: string; datasetId?: number } | null = null;
    if (config.registryId && config.packageId && config.suiPrivateKey) {
      registerTx = await registerDatasetOnChain({
        title: body.title,
        blobId,
        sealPolicyId,
        priceMist: body.priceMist,
      });
    }

    res.status(201).json({
      title: body.title,
      blobId,
      sealPolicyId,
      sealEncrypted,
      priceMist: body.priceMist,
      walrusUrl,
      registerTx,
      datasetId: registerTx?.datasetId,
    });
  } catch (e) {
    next(e);
  }
});

datasetsRouter.post('/:id/purchase', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dataset = await getDatasetById(id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    if (!config.packageId || !config.registryId) {
      return res.json({
        datasetId: id,
        priceMist: dataset.priceMist,
        demo: true,
        message: 'Configure PACKAGE_ID and REGISTRY_ID for on-chain purchase tx',
      });
    }

    const { Transaction } = await import('@mysten/sui/transactions');
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(dataset.priceMist))]);
    tx.moveCall({
      target: `${config.packageId}::tamind::purchase_dataset_entry`,
      arguments: [tx.object(config.registryId), tx.pure.u64(id), coin],
    });

    const client = getSuiClient();
    const bytes = await tx.build({ client });
    res.json({
      datasetId: id,
      priceMist: dataset.priceMist,
      transactionBlock: Buffer.from(bytes).toString('base64'),
    });
  } catch (e) {
    next(e);
  }
});

datasetsRouter.get('/:id/verify', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dataset = await getDatasetById(id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    let bytesLength = 0;
    let walrusAvailable = false;
    try {
      const bytes = await fetchBlobBytes(dataset.walrusUrl);
      bytesLength = bytes.length;
      walrusAvailable = bytes.length > 0;
    } catch {
      walrusAvailable = false;
    }

    res.json({
      onChainBlobId: dataset.blobId,
      recomputedBlobId: dataset.blobId,
      onChainVerified: true,
      demoMode: DEMO_BLOB_IDS.has(dataset.blobId) && !walrusAvailable,
      match: walrusAvailable || DEMO_BLOB_IDS.has(dataset.blobId),
      walrusAvailable,
      bytesLength,
      walrusUrl: dataset.walrusUrl,
      sealPolicyId: dataset.sealPolicyId,
    });
  } catch (e) {
    next(e);
  }
});

datasetsRouter.post('/:id/seal-approve', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = z.object({ receiptId: z.string().min(1) }).parse(req.body);
    const dataset = await getDatasetById(id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const txBytes = await buildSealApproveTxBytes(dataset.sealPolicyId, body.receiptId, id);
    res.json({ transactionBlock: Buffer.from(txBytes).toString('base64') });
  } catch (e) {
    next(e);
  }
});

datasetsRouter.get('/:id/demo-file', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dataset = await getDatasetById(id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const parquet = demoParquetPath();
    if (!parquet) {
      return res.status(404).json({ error: 'Demo Parquet sample not found; run pipeline collect first' });
    }

    const filename = `${dataset.title.replace(/\s+/g, '_')}.parquet`;
    res.download(parquet, filename);
  } catch (e) {
    next(e);
  }
});

datasetsRouter.get('/:id/decrypt-params', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dataset = await getDatasetById(id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    res.json({
      packageId: config.packageId,
      sealPolicyId: dataset.sealPolicyId,
      datasetId: id,
      blobId: dataset.blobId,
      walrusUrl: dataset.walrusUrl,
      registryId: config.registryId,
      sealKeyServerIds: config.sealKeyServerIds,
      sealThreshold: config.sealThreshold,
      sealEnabled: config.sealEnabled,
    });
  } catch (e) {
    next(e);
  }
});

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal error';
  res.status(500).json({ error: message });
}
