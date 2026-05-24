import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { config } from '../config.js';
import { getSuiClient } from './sui.js';

const CLOCK_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';

function getSigner() {
  if (!config.suiPrivateKey) throw new Error('SUI_PRIVATE_KEY not configured');
  return Ed25519Keypair.fromSecretKey(config.suiPrivateKey);
}

function toBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export type RegisterResult = {
  digest: string;
  datasetId?: number;
};

export async function registerDatasetOnChain(params: {
  title: string;
  blobId: string;
  sealPolicyId: string;
  priceMist: string;
}): Promise<RegisterResult> {
  if (!config.packageId || !config.registryId) {
    throw new Error('PACKAGE_ID and REGISTRY_ID must be configured');
  }

  const signer = getSigner();
  const client = getSuiClient();
  const tx = new Transaction();
  tx.moveCall({
    target: `${config.packageId}::tamind::register_dataset_entry`,
    arguments: [
      tx.object(config.registryId),
      tx.pure.vector('u8', Array.from(toBytes(params.title))),
      tx.pure.vector('u8', Array.from(toBytes(params.blobId))),
      tx.pure.vector('u8', Array.from(toBytes(params.sealPolicyId))),
      tx.pure.u64(BigInt(params.priceMist)),
      tx.object(CLOCK_ID),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEvents: true, showEffects: true },
  });

  let datasetId: number | undefined;
  for (const event of result.events ?? []) {
    if (event.type.includes('::registry::DatasetRegistered')) {
      const parsed = event.parsedJson as { dataset_id?: number };
      datasetId = parsed.dataset_id;
    }
  }

  return { digest: result.digest, datasetId };
}
