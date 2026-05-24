import { SessionKey, SealClient, type SealCompatibleClient } from '@mysten/seal';
import { getSealClient, getSuiClient, hasSeal } from './sui.js';
import { config } from '../config.js';

export type EncryptResult = {
  encryptedObject: Uint8Array;
  sealPolicyId: string;
  sealEncrypted: boolean;
};

export async function encryptDataset(data: Uint8Array, sealPolicyIdHex?: string): Promise<EncryptResult> {
  const policyId = sealPolicyIdHex?.replace(/^0x/, '') ?? randomPolicyIdHex();

  const seal = getSealClient();
  if (!hasSeal() || !seal) {
    return { encryptedObject: data, sealPolicyId: policyId, sealEncrypted: false };
  }

  try {
    const { encryptedObject } = await seal.encrypt({
      threshold: config.sealThreshold,
      packageId: config.packageId,
      id: policyId,
      data,
    });
    return { encryptedObject, sealPolicyId: policyId, sealEncrypted: true };
  } catch (err) {
    console.warn('Seal encrypt unavailable on this network — uploading plaintext ciphertext slot:', err);
    return { encryptedObject: data, sealPolicyId: policyId, sealEncrypted: false };
  }
}

export async function buildSealApproveTxBytes(
  sealPolicyId: string,
  receiptId: string,
  datasetId: number,
): Promise<Uint8Array> {
  const { Transaction } = await import('@mysten/sui/transactions');
  const client = getSuiClient();
  const tx = new Transaction();
  tx.moveCall({
    target: `${config.packageId}::seal_policy::seal_approve`,
    arguments: [
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(sealPolicyId.replace(/^0x/, '')))),
      tx.object(receiptId),
      tx.object(config.registryId),
      tx.pure.u64(datasetId),
    ],
  });
  return await tx.build({ client, onlyTransactionKind: true });
}

export async function decryptWithSeal(params: {
  encryptedObject: Uint8Array;
  sealPolicyId: string;
  datasetId: number;
  receiptId: string;
  buyerAddress: string;
  signPersonalMessage: (message: Uint8Array) => Promise<string | Uint8Array>;
}): Promise<Uint8Array> {
  const seal = getSealClient();
  if (!seal) throw new Error('Seal client not configured');

  const suiClient = getSuiClient();
  const sessionKey = await SessionKey.create({
    address: params.buyerAddress,
    packageId: config.packageId,
    ttlMin: 10,
    suiClient: suiClient as unknown as SealCompatibleClient,
  });

  const message = sessionKey.getPersonalMessage();
  const sig = await params.signPersonalMessage(message);
  await sessionKey.setPersonalMessageSignature(
    typeof sig === 'string' ? sig : Buffer.from(sig).toString('base64'),
  );

  const txBytes = await buildSealApproveTxBytes(params.sealPolicyId, params.receiptId, params.datasetId);
  return seal.decrypt({
    data: params.encryptedObject,
    sessionKey,
    txBytes,
  });
}

function randomPolicyIdHex(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
}

export { SealClient, SessionKey };
