# Phase 1 — Domain Contract and Static Production Feed

**Status: Complete (Lead Architect sign-off)**  
Date: 31 July 2026

## Delivered

### 1. Authoritative schema
- `src/domain/schemas.ts` — full `Opportunity` Zod schema matching the Master Build Prompt contract
- `src/domain/opportunity.ts` — re-exports
- `src/domain/source.ts` — source registry schema (forward-looking)

### 2. Seed & emergency data
- `src/data/seed-opportunities.json` — 3 validated published opportunities across approved categories
- `src/data/emergency-snapshot.json` — identical content + scanMeta for last-resort fallback

### 3. Migration
- `src/discovery/migration.ts` — converts legacy Unique Public Apps items → `Opportunity` with `lifecycle: "review"` (never auto-published)

### 4. Dataset loader
- `src/services/dataset.ts` — priority cascade: live API → validated seed → emergency snapshot  
  Never returns a blank broken state.

### 5. Minimal public feed
- Vite + React + TypeScript scaffold
- `DiscoverPage` renders published opportunities from the validated local dataset
- Shows verification status, nearest deadline, pricing display text, rationales, topics
- Scan-health line in header (source + last scan + count)
- Design tokens in `src/styles/tokens.css` following the approved high-end technical journal palette

### 6. Tests (schema)
- `src/tests/schema.test.ts` — seed validation, emergency validation, rejection of incomplete records, legacy migration smoke test

### 7. Documentation
- `docs/DATA-MODEL.md`
- `docs/IMPLEMENTATION-AUDIT.md` (Phase 0 reference)
- This status file

## Phase 1 Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All seed records pass schema validation | Designed to pass (Zod schema + carefully authored JSON) |
| Invalid records produce understandable diagnostics | Zod errors surface via `safeParse` |
| Missing information is not converted to false zero values | Optional fields remain undefined; pricing status explicit |
| Public feed renders from validated local data | Yes — DiscoverPage + dataset loader |
| Emergency snapshot bundled with the site | Yes — imported at build time |

## Assumptions documented
- Example.com URLs are placeholders until real public sources are registered.
- No live Netlify function is required for the feed to render (static-first).
- Legacy items always land in `review` lifecycle.

## Next
Phase 2 — Core Public Experience (remaining six feature groups, full filter/search, detail page, shortlist, comparison, calendar, explainability, richer scan-health).
