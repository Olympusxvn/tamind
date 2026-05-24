# Changelog

All notable changes to TaMind are documented here.

**Maintainer rule:** Whenever we hit a bug, crash, rate limit, misconfiguration, or unexpected behavior — add a row to **Lessons learned** (Issue → Symptom → Root cause → Fix). This file is shared memory for the builder and for AI assistants on future sessions.

## [0.1.0] — Hackathon MVP (2026-05)

### Demo scope (mainnet)

- **Walrus + Sui marketplace E2E** — collect Sui txs (Tatum RPC) → Parquet → Walrus blob → on-chain registry → buy → verify → download.
- **Seal V2 is not active in the hackathon demo.** Mainnet has no public open key servers yet; access requires [Enoki](https://enoki.mystenlabs.com/) approval ([Seal verified key servers](https://seal-docs.wal.app/Pricing#verified-key-servers)).

### Deferred post-hackathon

- **Seal V2 on mainnet** — enable `SEAL_ENABLED=true` with Enoki / verified mainnet key server object IDs; full encrypt → `seal_approve` → decrypt flow (Move + API + UI already implemented).
- Multi-chain datasets, subscriptions, automated daily pipelines.

### Submission

- Hackathon form: [Tatum × Build on Sui with Walrus](https://docs.google.com/forms/d/e/1FAIpQLSdOkI-NlBkSHOudVcOXpeDN6h2TQf7f0m9JxA46mhx0Ifm77A/viewform)

---

## Lessons learned (errors, crashes & fixes)

Ghi lại các sự cố gặp khi build MVP — để lần sau không lặp lại.

### Pipeline (Python + Tatum RPC)

| Issue | Symptom | Root cause | Fix |
|-------|---------|------------|-----|
| Sai params RPC | `Invalid params: invalid type: map, expected a string` | `suix_queryTransactionBlocks` gọi với `[{"limit": 50}]`; digest truyền vào `sui_getTransactionBlock` là object, không phải string | Dùng query `{ options: { showInput, showEffects, showEvents } }` + `[query, cursor, limit, true]`; dùng trực tiếp `result.data[]` (đã có full tx) |
| Tatum rate limit | `HTTP 429` / `Too Many Requests` khi collect | Free tier / burst limit trên gateway | Retry exponential backoff trong `collectors/sui_tx.py`; giảm `max_pages` khi dev |
| Upload timeout | Pipeline upload fail sau 120s | Walrus `writeBlob` + on-chain register mất lâu | Tăng timeout upload API lên 600s trong `uploaders/walrus.py` |

### Backend API (Node / Walrus / Seal)

| Issue | Symptom | Root cause | Fix |
|-------|---------|------------|-----|
| Seal encrypt 500 | `Object … does not exist` | `SEAL_KEY_SERVER_IDS` là **testnet** IDs nhưng `SUI_NETWORK=mainnet` | Hackathon demo: `SEAL_ENABLED=false`; post-hackathon dùng Enoki / verified mainnet servers |
| Walrus qua Tatum 429 | `Unexpected status code: 429` trong `writeBlob` | Walrus SDK gọi `multiGetObjects` nhiều lần qua Tatum RPC | Tách RPC: `getWalrusSuiClient()` → Sui **public fullnode** (`WALRUS_SUI_RPC` optional) |
| Walrus storage abort | `Dry run failed … system::inner_mut` | Ví thiếu **WAL** cho storage fee hoặc epochs quá cao | Nạp WAL mainnet; thử `WALRUS_EPOCHS=1` |
| Walrus epoch at capacity | New blob registration fails (upload) | Walrus mainnet is at capacity for the current epoch (network-wide), so new blobs cannot be registered | Wait for the next epoch; network-wide limitation, not application-specific |
| Walrus hang | `writeBlob` test treo 5+ phút, không output | Chờ tx on-chain / RPC chậm / thiếu coin | Timeout 120s + retry; dùng fullnode riêng; kiểm tra SUI + WAL trước upload |
| esbuild crash | API dev server exit sau hot-reload: `@esbuild/win32-x64` could not be found | `npm install` thiếu optional deps (esbuild platform binary) | `npm install esbuild @esbuild/win32-x64` — không dùng `--omit=optional` |
| Type mismatch Walrus SDK | TS build fail: `SuiJsonRpcClient` vs Walrus bundled `@mysten/sui` | Version skew giữa `@mysten/walrus` và `@mysten/sui` | Cast `as never` tạm thời; lâu dài: npm overrides align versions |
| Balance check hang | Script `getBalance` treo ~3 phút | Tatum RPC chậm / rate limit | Dùng public fullnode cho ops nặng; retry + timeout |

### On-chain & registry

| Issue | Symptom | Root cause | Fix |
|-------|---------|------------|-----|
| Blob ID verify fail | SHA-256 content ≠ on-chain blob ID | `computeWalrusBlobId()` là hash nội dung, không phải Walrus canonical blob ID | Verify = fetch aggregator thành công + blob tồn tại; lưu blob ID từ `writeBlob` lên chain |
| Registry parse | Walrus URL sai / blob ID lạ | `blob_id` on-chain là UTF-8 string, parser cũ ép hex | `chainText()` / `bytesToString()` trong `registry.ts` |
| seal_approve bytes | Decrypt fail (khi bật Seal) | Policy ID lưu UTF-8 hex string nhưng PTB dùng `fromHex` raw bytes | `TextEncoder.encode(sealPolicyId)` trong `buildSealApproveTxBytes` |

### Frontend

| Issue | Symptom | Root cause | Fix |
|-------|---------|------------|-----|
| Invalid JSX | Build fail sau edit | Stray `</motion.div>` tag (typo từ refactor) | Xóa tag thừa; chỉ dùng `<motion.div>` chuẩn |
| Seal UI misleading | Nút Decrypt hiện khi Seal tắt | UI không biết `SEAL_ENABLED` | Fetch `decrypt-params.sealEnabled`; ẩn Decrypt + ghi chú CHANGELOG |

### DevOps / monorepo

| Issue | Symptom | Root cause | Fix |
|-------|---------|------------|-----|
| `EADDRINUSE :3001` | API không restart | Process cũ còn listen | `taskkill` PID trên 3001 trước khi `npm run dev:api` |
| Git repo path | Git detect sai root | Workspace vs user home | Chạy git trong `c:\users\admin\tamind` |

### Takeaways

1. **Tatum** — tốt cho proxy/demo query; **Walrus write** và burst RPC nên dùng **fullnode riêng**.
2. **Walrus mainnet** cần **WAL + SUI**; test với `WALRUS_EPOCHS=1` trước.
3. **Seal mainnet** chưa có open servers công khai — demo hackathon **tắt Seal**, bật lại sau Enoki.
4. **Luôn lưu blob ID từ Walrus SDK** lên chain, không tự hash SHA-256.
5. **Windows + tsx watch**: giữ `@esbuild/win32-x64` trong optional deps.
