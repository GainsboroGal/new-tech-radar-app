# Architecture

## Summary

New Tech Radar is a **curated, static-first** discovery application. The browser reads a validated, versioned dataset. It does not crawl the open web on every page load.

```
[Browser] → get-opportunities (snapshot)
                ↑
[Blobs] current-pointer → snapshots/{version}
                ↑
[Background worker] quality → rarity → cluster → (operator review) → publish
                ↑
[Scheduled function] lock → select sources → invoke worker → exit
```

## Data sources

- Controlled **source registry** (`netlify/functions/_shared/sources.ts`)
- Optional **GitHub public Search** (rate-limited, secondary)
- Bundled **seed** + **emergency snapshot** for resilience

## Scan lifecycle

1. Scheduler acquires lock (skip if held).
2. Selects bounded source batch.
3. Invokes Background Function.
4. Worker may call GitHub; new external candidates are not auto-published at launch.
5. Snapshot write → strong-consistency readback → pointer update.
6. Lock released; last-success recorded.

## Scoring & suppression

- Quality gate **before** rarity.
- Rarity = documented heuristic (not scientific uniqueness).
- Desirability blends relevance, quality, rarity, freshness, deadline usefulness.
- Jaccard cluster suppression: threshold 0.55 (0.45–0.65), max 3 per cluster.

## Known limitations

- Coverage is selective, not exhaustive.
- Scheduled Functions run only on published production deploys.
- Jaccard does not capture every semantic near-duplicate.
- Human verification remains necessary.
