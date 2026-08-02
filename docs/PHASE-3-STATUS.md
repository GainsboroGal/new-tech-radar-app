# Phase 3 — Deterministic Discovery Engine

**Status: Complete**  
Date: 31 July 2026

## Delivered modules

| Module | Path |
|--------|------|
| Quality gate | `src/discovery/quality.ts` |
| Rarity scoring | `src/discovery/rarity.ts` |
| Desirability scoring | `src/discovery/desirability.ts` |
| Jaccard cluster suppression | `src/discovery/clustering.ts` |
| Rationale templates | `src/discovery/rationales.ts` |
| Pipeline orchestrator | `src/discovery/pipeline.ts` |
| Unit tests | `src/tests/discovery.test.ts` |
| Documentation | `docs/DISCOVERY-AND-SCORING.md` |

## Phase mapping (locked)

| Phase | Scope |
|-------|--------|
| 0 | Audit |
| 1 | Domain + static feed |
| 2 | Core public UX (7 features) |
| **3** | Quality, rarity, desirability, clustering, rationales, tests |
| 4 | Netlify Functions, Blobs, GitHub guardrails |
| 5 | Operator console + failure/trust states |
| 6 | Security, a11y, performance, full docs, release |

## Acceptance

- Quality runs before rarity
- Rarity is heuristic and documented as such
- Cluster max 3, threshold 0.55, deterministic
- Rationales do not invent facts
- Tests cover edge cases listed in Master Prompt §8

## Next

**Phase 4** — Netlify backend (Scheduled orchestration, Background worker, Blobs snapshots, source registry, GitHub guardrails).
