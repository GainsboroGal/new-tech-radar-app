# New Tech Radar App

Curated, static-first discovery of unusually worthwhile opportunities — before registration or pricing deadlines pass.

**Core goal:** Help a user find, understand, verify, save/compare, and act on a relevant opportunity.

## Quick start

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## Stack

- Vite · React · TypeScript · Zod
- Netlify Hosting · Functions (Scheduled + Background) · Blobs
- No large external DB for launch

## Environment variables (Netlify)

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | Optional | Higher GitHub Search limits |
| `PUBLIC_SITE_URL` | Recommended | Scheduler → worker invoke |
| `SCAN_TRIGGER_SECRET` | Recommended | Protect scan triggers |
| `OPERATOR_SESSION_SECRET` | Optional | Future operator writes |
| `ENABLE_AUTOMATED_SCANS` | Default true | Schedule kill switch |
| `ENABLE_GITHUB_DISCOVERY` | Default true | GitHub kill switch |
| `MAX_SCAN_SOURCES` | Default 40 | Hard cap |
| `MAX_SCAN_CANDIDATES` | Default 100 | Hard cap |
| `SIMILARITY_THRESHOLD` | Default 0.55 | Cluster threshold |
| `MAX_PER_CLUSTER` | Default 3 | Cluster size cap |

Never commit secrets. Never expose tokens to the browser bundle.

## Deployment

1. Connect the repo to Netlify.
2. Build command: `npm run build` · Publish: `dist` · Functions: `netlify/functions`
3. Set env vars (production context).
4. Deploy to a **published** production branch so Scheduled Functions run.
5. Trigger `scan-scheduler` once via **Run now** and confirm `get-scan-status`.
6. Verify public `/` loads (seed if no snapshot yet).

## Emergency fallback

The client always tries: **live API → validated seed → emergency snapshot**.
A failed scan cannot blank the UI.

## Documentation

See `/docs` for architecture, data model, discovery, operations, accessibility, tests, and release checklist.

## Product non-claims

This app does **not** claim exhaustive global coverage, scientific uniqueness, guaranteed prices/deadlines, or access to private resources. See `/how-it-works`.
