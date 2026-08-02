# Discovery and Scoring (Phase 3)

## Pipeline order

1. **Quality gate** (`src/discovery/quality.ts`)
2. **Rarity** (`src/discovery/rarity.ts`)
3. **Desirability** (`src/discovery/desirability.ts`)
4. **Cluster suppression** (`src/discovery/clustering.ts`) — Jaccard, threshold 0.55, max 3 per cluster
5. **Rationales** (`src/discovery/rationales.ts`)

Orchestrator: `src/discovery/pipeline.ts` → `runDiscoveryPipeline()`.

## Cluster defaults

| Constant | Value |
|----------|-------|
| SIMILARITY_THRESHOLD | 0.55 |
| MIN / MAX threshold | 0.45 / 0.65 |
| MAX_PER_CLUSTER | 3 |
| MIN_SIGNATURE_TOKENS | 3 |

Tests: `src/tests/discovery.test.ts`
