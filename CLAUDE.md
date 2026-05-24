# CLAUDE.md — TaMind

Behavioral guidelines for AI coding assistants working on this repo.
Derived from [Andrej Karpathy's LLM coding guidelines](https://github.com/multica-ai/andrej-karpathy-skills) and merged with TaMind-specific rules.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## Project Context

**TaMind** is a verifiable AI dataset marketplace on Sui for the Tatum × Walrus Hackathon (deadline: June 6, 2026).

| Constraint | Rule |
|---|---|
| MVP dataset | Sui Mainnet transactions only (rolling window) |
| Storage | Walrus blob upload is **core** — not optional |
| Access control | **Seal V2** (`@mysten/seal`) — encrypt before Walrus; decrypt via `seal_approve` |
| Agent skills | Run `npx autoskills -y -a cursor` after scaffold; re-run when stack changes |
| RPC | Tatum Sui RPC (`https://sui-mainnet.gateway.tatum.io`) |
| Team | Solo builder — keep scope minimal |
| Spec-first | Read `openspec/changes/mvp-hackathon-sui-txs/` before writing code |

**Workflow:** OpenSpec → implement → verify → archive.
Do not skip spec artifacts. Run `/opsx:apply` against `tasks.md` checkboxes.

**Post-hackathon (out of scope for MVP):** multi-chain, subscriptions, royalties, time-lock Seal policies, automated daily pipelines. See README Roadmap.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- Read the relevant OpenSpec spec (`openspec/changes/.../specs/`) and `design.md`.
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what the OpenSpec change defines.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: *"Would a senior engineer say this is overcomplicated?"* If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

Every changed line should trace directly to an OpenSpec task or user request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → write tests for invalid inputs, then make them pass
- "Fix the bug" → write a test that reproduces it, then make it pass
- "Integrate Walrus" → upload a blob, retrieve it, verify blob ID matches

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Mark OpenSpec tasks complete in `tasks.md` only when verified.

---

## Module Boundaries

| Module | Path | Owns |
|---|---|---|
| Web UI | `apps/web/` | Browse, buy, verify, download UX |
| API | `apps/api/` | Tatum RPC proxy, Seal V2 encrypt/decrypt, Walrus ciphertext upload |
| Contracts | `contracts/` | `DatasetRegistry`, escrow, `seal_approve` in `seal_policy.move` |
| Pipeline | `pipeline/` | Collect Sui txs → Parquet → Walrus upload |
| Shared | `packages/shared/` | Types, constants, blob-ID helpers |
| Specs | `openspec/` | Requirements — source of truth |

Do not cross module boundaries without updating the OpenSpec spec first.

---

## Key Commands

```bash
# OpenSpec
openspec list                              # active changes
openspec show mvp-hackathon-sui-txs        # change details
openspec validate mvp-hackathon-sui-txs    # validate specs

# Apps (after scaffold)
cd apps/api && npm run dev
cd apps/web && npm run dev
cd pipeline && python run_pipeline.py --chain sui --window 7d

# Contracts
cd contracts && sui move build

# autoskills (after package.json exists)
npx autoskills -y -a cursor
```

---

## References

- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — spec-driven development
- [mattpocock/skills](https://github.com/mattpocock/skills) — agent skills in `.agents/skills/`
- [Hackathon page](https://tatum.io/tatum-x-walrus-hackathon)
- [Walrus docs](https://docs.wal.app) · [Seal V2 docs](https://seal-docs.wal.app/) · [Seal SDK](https://sdk.mystenlabs.com/seal)
- [autoskills](https://github.com/midudev/autoskills) · [DEVELOPMENT.md](docs/DEVELOPMENT.md)
- [Tatum docs](https://docs.tatum.io)
