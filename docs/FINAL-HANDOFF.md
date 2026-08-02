# Final Handoff — New Tech Radar App

**Date:** 31 July 2026  
**Lead Architect:** Multi-agent build under Agent Charter  
**Phases completed:** 0–6

## 1. Project location

```
/home/workdir/artifacts/New Tech Radar App/
```

## 2. Production / preview URL

Not deployed from this environment. Deploy via Netlify using `README.md` instructions. After deploy, record URL here:

- Preview: _TBD_
- Production: _TBD_

## 3. Implementation summary

Built a static-first opportunity radar with:

- Zod-validated Opportunity domain
- Seed + emergency snapshots
- Discover / detail / shortlist / compare / explainability / operator UI
- Deterministic quality → rarity → desirability → Jaccard clustering pipeline
- Netlify Scheduled + Background functions, Blobs versioning, GitHub-optional discovery
- Trust-oriented scan health and failure states
- High-end technical-journal aesthetic (dark-first, cyan accent)

## 4. Features retained (from prototype)

- Dark calm aesthetic direction
- Card feed + search/filter interaction pattern
- Last-scan visibility concept
- Netlify Functions + Blobs direction
- Relative rarity + cluster suppression intent
- Public-only principle

## 5. Features added

- Full Opportunity schema + migration from legacy
- Seven public feature groups (Phase 2)
- Signal Ring, ICS calendar, shortlist, compare
- Discovery pipeline modules + tests
- Scheduler / worker / snapshot APIs
- Operator console + failure playbook
- Complete docs set + release checklist

## 6. Features removed / not carried

- Repo-centric “% unique” as primary metric
- Auto-publish of unreviewed external candidates
- Exhaustive “scan all GitHub/Netlify” claims
- Heavy UI frameworks / engagement dark patterns

## 7–9. Tests / a11y / performance

- Unit tests: schema + discovery (see `docs/TEST-PLAN.md`)
- A11y baseline: `docs/ACCESSIBILITY.md`
- Performance approach: `docs/PERFORMANCE.md`  
Run `npm test` and `npm run build` after `npm install` on a full Node environment.

## 10. Known remaining limitations

- Operator write APIs not fully auth-gated in UI (env secrets protect functions)
- Review queue UI is structural; Blobs queue population is next iteration
- GitHub hits logged, not auto-merged into published set
- No CI pipeline wired in-repo yet
- Example.com placeholders in seed data

## 11. Environment variables

See README table — **no secret values in this document**.

## 12. Netlify deployment

See README + `netlify.toml` + `docs/OPERATIONS.md`.

## 13. Rollback

See `docs/RELEASE-CHECKLIST.md` → Rollback.

## 14. Operator console

`/admin` — status, kill-switch docs, review/cluster guidance, failure playbook.

## 15. First 30 days monitoring

- Daily: scan-health, lock stuck?, function errors
- Weekly: suppressed samples, zero-result searches, broken official links
- Do not expand scope until trust metrics are stable

---

## Requirements traceability (abbreviated)

| Requirement | Location | Test / proof | Status |
|-------------|----------|--------------|--------|
| Single Core Goal | UI copy, Explainability | Manual | Done |
| ≤7 public feature groups | Routes + pages | Manual | Done |
| Quality before rarity | `discovery/quality.ts` → pipeline | `discovery.test.ts` | Done |
| Cluster max 3 / Jaccard 0.55 | `discovery/clustering.ts` | unit tests | Done |
| Public-only intent | OPERATIONS, non-claims | Docs | Done |
| Static-first feed | `services/dataset.ts` | Manual offline | Done |
| Scheduled orchestration only | `scan-scheduler.ts` | Code review | Done |
| Background bounded | `scan-worker-background.ts` | Code review | Done |
| Snapshot pointer safety | `blobs.ts` publishSnapshot | Code review | Done |
| GitHub optional | `github.ts` + config | unit/integration | Done |
| Scan health visible | `ScanHealthBar` | Manual | Done |
| Explainability + non-claims | `ExplainabilityPage` | Manual | Done |
| Operator console | `AdminPage` | Manual | Done |
| Aesthetic tokens | `styles/tokens.css` | Visual | Done |
| Docs + release checklist | `docs/*` | Review | Done |
