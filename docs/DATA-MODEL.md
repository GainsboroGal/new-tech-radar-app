# Data Model — New Tech Radar App

## Authoritative type: `Opportunity`

Defined in `src/domain/schemas.ts` and validated with Zod.

Key groups:

- **Identity**: `id`, `slug`, `name`, `summary`, `eventType`, `topics`
- **Organizer & location**: nested objects with required `country` and `format`
- **Dates**: optional ISO-ish strings for start/end/registration windows
- **Pricing**: status enum + display text (never invent numbers)
- **Links**: official required; registration/agenda/social optional
- **Verification**: status + lastVerifiedAt + sourceIds
- **Scoring**: quality, rarity, desirability (0–100) + rarityModeUsed
- **Clustering**: clusterId, rank, size, status
- **Rationale**: plain-language whyItStandsOut and whyRelativelyUncommon
- **Lifecycle**: draft | review | published | expired | archived

Only `lifecycle: "published"` records appear in the public feed by default.

## Seed & Emergency data

- `src/data/seed-opportunities.json` — validated seed
- `src/data/emergency-snapshot.json` — last-resort static snapshot

## Migration

`src/discovery/migration.ts` converts legacy prototype items into Opportunity records with `lifecycle: "review"`.
