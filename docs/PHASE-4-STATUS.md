# Phase 4 — Netlify Backend

**Status: Complete**  
Date: 31 July 2026

## Delivered

### Shared
- `_shared/config.ts` — env-based config
- `_shared/responses.ts` — JSON helpers
- `_shared/security.ts` — scan secret + redaction
- `_shared/blobs.ts` — versioned snapshots, pointer, lock, scan runs
- `_shared/github.ts` — rate-limit-aware public search
- `_shared/sources.ts` — controlled source registry

### Functions
- `scan-scheduler.ts` — Scheduled, orchestration only, 4× daily
- `scan-worker-background.ts` — Background, bounded work, lock release
- `get-opportunities.ts` — public snapshot API
- `get-scan-status.ts` — operator/scan health API

### Docs
- `docs/OPERATIONS.md`
- this status file

## Guardrails honored
- Scheduler does not run full scan
- Background has hard limits; no recursive crawl
- GitHub optional; missing token → partial, feed intact
- Snapshot pointer only updates after readback
- Secrets via env only
- Public feed never depends solely on live scan (client seed/emergency)

## Known launch limitation
New external GitHub candidates are counted and logged but **not auto-published**. Operator review (Phase 5) is required before new candidates enter the public set. Worker refreshes scan metadata on the last good snapshot.

## Next
**Phase 5** — Operator console, review queue, failure states, kill-switch UI.
