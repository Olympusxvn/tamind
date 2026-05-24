import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  tatumApiKey: process.env.TATUM_API_KEY ?? '',
  suiNetwork: (process.env.SUI_NETWORK ?? 'mainnet') as 'mainnet' | 'testnet' | 'devnet',
  tatumSuiRpc:
    process.env.TATUM_SUI_RPC ??
    (process.env.SUI_NETWORK === 'testnet'
      ? 'https://sui-testnet.gateway.tatum.io'
      : 'https://sui-mainnet.gateway.tatum.io'),
  suiPrivateKey: process.env.SUI_PRIVATE_KEY ?? '',
  packageId: process.env.PACKAGE_ID ?? '',
  registryId: process.env.REGISTRY_ID ?? '',
  sealThreshold: Number(process.env.SEAL_THRESHOLD ?? 2),
  /** Hackathon demo: false on mainnet until Enoki / verified mainnet key servers are configured. */
  sealEnabled: process.env.SEAL_ENABLED === 'true',
  sealKeyServerIds: (process.env.SEAL_KEY_SERVER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  walrusAggregator: process.env.WALRUS_AGGREGATOR ?? 'https://aggregator.walrus.space/v1',
  walrusPublisher:
    process.env.WALRUS_PUBLISHER_URL ??
    (process.env.SUI_NETWORK === 'testnet'
      ? 'https://publisher.walrus-testnet.walrus.space/v1'
      : 'https://publisher.walrus.space/v1'),
  walrusEpochs: Number(process.env.WALRUS_EPOCHS ?? 10),
};
