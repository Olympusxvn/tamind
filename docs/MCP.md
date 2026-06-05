# TaMind MCP — AI dataset discovery

Expose TaMind marketplace datasets to AI agents (Cursor, Claude Desktop, etc.) via the [Model Context Protocol](https://modelcontextprotocol.io).

Pair with the official **[Tatum Blockchain MCP](https://github.com/tatumio/blockchain-mcp)** for Sui RPC and wallet data on the same agent.

## Tools (`@tamind/mcp`)

| Tool | Description |
|------|-------------|
| `tamind_list_datasets` | All listings from on-chain registry (via TaMind API) |
| `tamind_get_dataset` | One dataset by ID |
| `tamind_verify_dataset` | On-chain + Walrus verify result |
| `tamind_search_datasets` | Keyword search in title / blob ID / seller |

Default API: **https://tamind-hackathon-demo.netlify.app**

## 1. Build

From repo root:

```bash
npm install
npm run build -w @tamind/mcp
```

## 2. Cursor — TaMind + Tatum MCP

Repo includes [`.cursor/mcp.json`](../.cursor/mcp.json) — replace `YOUR_TATUM_API_KEY`, run `npm run build:mcp`, then restart Cursor.

**Cursor Settings → MCP** should pick up project config automatically. Or paste the same JSON manually.

## 3. Claude Desktop

Copy servers from [`.cursor/mcp.json`](../.cursor/mcp.json) into:

`%APPDATA%\Claude\claude_desktop_config.json`

Quit Claude fully and reopen after editing.

## 4. Example prompts

**Dataset discovery (TaMind tools):**

```text
Search TaMind for datasets about Sui transactions, then verify dataset 0.
```

```text
List all TaMind datasets and show blob ID and price in SUI for each.
```

**On-chain context (Tatum MCP):**

```text
Using Tatum gateway_execute_rpc on Sui mainnet, read object 0xa93536944fbfabebbdf49fe801640a086df097edfde736c0ac7f135ac86b014a.
```

```text
Get transaction history for the seller address of TaMind dataset 0.
```

## 5. Local API

```bash
npm run dev:api
```

```json
"env": {
  "TAMIND_API_URL": "http://localhost:3001",
  "TATUM_API_KEY": "..."
}
```

## 6. Environment

| Variable | Required | Default |
|----------|----------|---------|
| `TAMIND_API_URL` | No | `https://tamind-hackathon-demo.netlify.app` |
| `TATUM_API_KEY` | No | — sent as `X-Tatum-Api-Key` when set |

Never commit API keys. Use Cursor MCP env or local `.env` (not in git).
