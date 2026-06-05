# TaMind MCP — AI dataset discovery

Expose TaMind marketplace datasets to AI agents (Cursor, Claude Desktop, etc.) via the [Model Context Protocol](https://modelcontextprotocol.io).

**Hackathon context ([Tatum × Walrus](https://tatum.io/tatum-x-walrus-hackathon)):** MCP is **optional** (bonus category *Best Use of Tatum Tools*). TaMind MCP needs **no API key** — it calls the live demo API, which already uses Tatum Sui RPC on the server.

| Requirement | Who needs it |
|-------------|--------------|
| Tatum API key (free at [dashboard.tatum.io](https://dashboard.tatum.io)) | **Builders** deploying their own API / pipeline — not end users of this repo |
| Walrus + Sui mainnet | Project submission |
| MCP | Optional bonus |

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
npm run build:mcp
```

## 2. Cursor

Repo includes [`.cursor/mcp.json`](../.cursor/mcp.json) — run `npm run build:mcp`, then **restart Cursor**.

No keys to paste. **Settings → MCP** should show `tamind` connected.

## 3. Claude Desktop

Copy the `tamind` server from [`.cursor/mcp.json`](../.cursor/mcp.json) into:

`%APPDATA%\Claude\claude_desktop_config.json`

Use an absolute path to `apps/mcp/dist/index.js` if `${workspaceFolder}` is not supported. Quit Claude fully and reopen.

## 4. Example prompts

```text
Search TaMind for datasets about Sui transactions, then verify dataset 0.
```

```text
List all TaMind datasets and show blob ID and price in SUI for each.
```

## 5. Optional — Tatum Blockchain MCP

For Sui RPC / wallet tools in the same agent ([`@tatumio/blockchain-mcp`](https://github.com/tatumio/blockchain-mcp)), add a second server with a **free** Tatum key (only if you want on-chain queries beyond TaMind tools):

```json
"tatumio": {
  "command": "npx",
  "args": ["-y", "@tatumio/blockchain-mcp"],
  "env": {
    "TATUM_API_KEY": "<your-free-key-from-dashboard.tatum.io>"
  }
}
```

Not required for hackathon submission or for TaMind dataset discovery.

## 6. Local API

```bash
npm run dev:api
```

Point MCP at localhost (requires `TATUM_API_KEY` in `apps/api/.env` for your own RPC):

```json
"env": {
  "TAMIND_API_URL": "http://localhost:3001"
}
```

## 7. Environment

| Variable | Required | Default |
|----------|----------|---------|
| `TAMIND_API_URL` | No | `https://tamind-hackathon-demo.netlify.app` |
| `TATUM_API_KEY` | No | Only if calling an API without a server-side key |

Never commit API keys.
