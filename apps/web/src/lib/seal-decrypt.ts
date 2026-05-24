import { SealClient, SessionKey, type SealCompatibleClient } from '@mysten/seal';
import type { SuiClient } from '@mysten/sui/client';
import type { DecryptParams } from '@tamind/shared';

export async function decryptDatasetBlob(params: {
  encryptedBytes: Uint8Array;
  decryptParams: DecryptParams;
  receiptId: string;
  buyerAddress: string;
  suiClient: SuiClient | unknown;
  sealApproveTxBase64: string;
  signPersonalMessage: (input: { message: Uint8Array }) => Promise<{ signature: string }>;
}): Promise<Uint8Array> {
  const servers = params.decryptParams.sealKeyServerIds ?? [];
  if (!params.decryptParams.packageId || servers.length === 0) {
    throw new Error('Seal key servers not configured on API');
  }

  const compatibleClient = params.suiClient as SealCompatibleClient;
  const seal = new SealClient({
    suiClient: compatibleClient,
    serverConfigs: servers.map((objectId) => ({ objectId, weight: 1 })),
    verifyKeyServers: false,
  });

  const sessionKey = await SessionKey.create({
    address: params.buyerAddress,
    packageId: params.decryptParams.packageId,
    ttlMin: 10,
    suiClient: compatibleClient,
  });

  const message = sessionKey.getPersonalMessage();
  const { signature } = await params.signPersonalMessage({ message });
  await sessionKey.setPersonalMessageSignature(signature);

  const txBytes = Uint8Array.from(atob(params.sealApproveTxBase64), (c) => c.charCodeAt(0));
  return seal.decrypt({
    data: params.encryptedBytes,
    sessionKey,
    txBytes,
  });
}
