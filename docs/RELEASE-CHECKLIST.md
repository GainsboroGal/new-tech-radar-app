# Release Checklist

- [ ] Production env vars set
- [ ] No secrets in client bundle
- [ ] Security headers in netlify.toml
- [ ] Seed validates against Zod
- [ ] Emergency snapshot current
- [ ] Scheduler visible on published deploy
- [ ] Seven feature groups only
- [ ] Explainability + non-claims live
- [ ] Cluster max 3 in feed
- [ ] Keyboard path works
- [ ] Deploy Preview verified
- [ ] Production deploy verified

## Rollback

1. Netlify → Deploys → publish previous good deploy, or
2. Point Blobs current-pointer at prior snapshots/{version}
