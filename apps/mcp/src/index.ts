#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getDataset, listDatasets, searchDatasets, verifyDataset } from './client.js';

const server = new McpServer({
  name: 'tamind',
  version: '0.1.0',
});

function jsonText(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

server.registerTool(
  'tamind_list_datasets',
  {
    title: 'List TaMind datasets',
    description:
      'List all AI-ready datasets on the TaMind Sui marketplace (on-chain registry via TaMind API).',
    inputSchema: {},
  },
  async () => jsonText({ datasets: await listDatasets() }),
);

server.registerTool(
  'tamind_get_dataset',
  {
    title: 'Get TaMind dataset',
    description: 'Fetch one dataset by numeric ID (blob ID, Walrus URL, price in mist, seller).',
    inputSchema: {
      id: z.number().int().min(0).describe('On-chain dataset ID'),
    },
  },
  async ({ id }) => jsonText({ dataset: await getDataset(id) }),
);

server.registerTool(
  'tamind_verify_dataset',
  {
    title: 'Verify TaMind dataset',
    description:
      'Verify on-chain listing and Walrus blob availability for a dataset (demoMode when blob is placeholder).',
    inputSchema: {
      id: z.number().int().min(0).describe('On-chain dataset ID'),
    },
  },
  async ({ id }) => jsonText(await verifyDataset(id)),
);

server.registerTool(
  'tamind_search_datasets',
  {
    title: 'Search TaMind datasets',
    description:
      'Search datasets by keyword in title, blob ID, or seller address (e.g. "Sui", "DeFi", "tx").',
    inputSchema: {
      query: z.string().min(1).describe('Search keyword'),
    },
  },
  async ({ query }) => {
    const all = await listDatasets();
    const datasets = searchDatasets(all, query);
    return jsonText({ query, count: datasets.length, datasets });
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('tamind-mcp failed:', err);
  process.exit(1);
});
