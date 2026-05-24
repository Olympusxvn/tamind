# TaMind — Development Workflow

> **Repo kickoff:** 23 May 2026 (hackathon start)  
> **Submission deadline:** 6 June 2026, 17:00 UTC

## Principles

1. **Spec before code** — OpenSpec change `mvp-hackathon-sui-txs` is the contract.
2. **Seal V2 before Walrus upload** — encrypt with `@mysten/seal`, then store ciphertext on Walrus.
3. **Minimal scope** — Sui txs only; everything else is post-hackathon.
4. **autoskills on scaffold** — re-run when stack changes so Cursor gets matching skills.

---

## Day 0 — Before 23/05 (prep, no public repo required)

- [x] README + OpenSpec artifacts + `CLAUDE.md`
- [ ] Review `openspec/changes/mvp-hackathon-sui-txs/tasks.md`
- [ ] Read [Seal docs](https://seal-docs.wal.app/UsingSeal) (encrypt → Walrus → decrypt via `seal_approve`)

## Day 1 — 23/05: Create repo & bootstrap

```bash
# 1. Create GitHub repo, push current tamind folder
git init && git add . && git commit -m "docs: spec-first MVP scaffold"
git remote add origin https://github.com/Olympusxvn/tamind.git
git push -u origin main

# 2. OpenSpec (if not already)
npx @fission-ai/openspec@latest init --tools cursor

# 3. Agent skills — manual baseline
npx skills@latest add mattpocock/skills

# 4. After monorepo scaffold (package.json exists), auto-detect stack:
npx autoskills -y -a cursor
# Re-run after adding apps/web, apps/api, contracts, pipeline:
#   npx autoskills -y -a cursor

# 5. Implement via OpenSpec
# In Cursor: /opsx:apply
```

## Seal V2 stack (mandatory for MVP)

| Step | Technology |
|------|------------|
| Access policy | Move `seal_approve*` in `contracts/sources/seal_policy.move` |
| Encrypt | `@mysten/seal` → `client.seal.encrypt({ threshold, packageId, id, data })` |
| Store | Walrus blob = **ciphertext only** |
| Purchase | Sui escrow → `PurchaseEvent` |
| Decrypt | `SessionKey` + PTB calling `seal_approve` → `client.seal.decrypt` |
| Verify | Recompute Walrus blob ID on ciphertext bytes |

Official references:
- [seal-docs.wal.app](https://seal-docs.wal.app/)
- [@mysten/seal SDK](https://sdk.mystenlabs.com/seal)
- [subscription pattern](https://github.com/MystenLabs/seal/tree/main/move/patterns/sources/subscription.move) (adapt for payment-gated)

## Implementation order (from `tasks.md`)

```
1. Scaffold monorepo
2. contracts/ — registry + escrow + seal_approve
3. Seal V2 + Walrus in apps/api (encrypt before upload)
4. pipeline/ — Sui txs → Parquet
5. apps/api — routes
6. apps/web — UI + Verify on Walrus
7. Demo video
```

## autoskills

Run whenever the tech stack changes:

```bash
npx autoskills              # interactive
npx autoskills -y -a cursor # install all detected for Cursor
npx autoskills --dry-run    # preview only
```

**Note:** autoskills scans `package.json`, config files, etc. It will detect little until `apps/web` and `apps/api` exist. Run again after Task 1.1 scaffold.

Expected skills after full scaffold (approximate): TypeScript, React, Vite, Express, Vitest, etc.

## OpenSpec commands (Cursor)

| Command | When |
|---------|------|
| `/opsx:propose` | New feature after MVP |
| `/opsx:apply` | Implement `tasks.md` checkboxes |
| `/opsx:archive` | MVP complete — merge specs |
| `/opsx:explore` | Spike / design questions |

## Post-hackathon

New OpenSpec change per feature (multi-chain, subscriptions, etc.). Do not expand MVP scope in place.
