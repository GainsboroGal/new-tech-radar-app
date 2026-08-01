# Deploy: GitHub → Netlify

## 1. Repository

https://github.com/GainsboroGal/new-tech-radar-app

## 2. Connect Netlify

1. app.netlify.com → Add new site → Import existing project
2. Choose GitHub → select `new-tech-radar-app`
3. Build: `npm run build` · Publish: `dist` · Functions: `netlify/functions`
4. Deploy

## 3. Environment variables (Production)

| Key | Note |
|-----|------|
| `GITHUB_TOKEN` | Optional PAT |
| `PUBLIC_SITE_URL` | `https://<your-site>.netlify.app` |
| `SCAN_TRIGGER_SECRET` | Long random string |
| `ENABLE_AUTOMATED_SCANS` | `true` |
| `ENABLE_GITHUB_DISCOVERY` | `true` |

Redeploy after saving env vars.

## 4. Post-deploy verification

1. Open `/` — seed opportunities should render.
2. Open `/how-it-works` — non-claims visible.
3. Open `/admin` — operator overview.
4. Functions → `scan-scheduler` → Run now (published production).
5. Confirm SPA routes: `/shortlist`, `/compare`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Scheduler never runs | Must be published production deploy |
| Worker not invoked | Set `PUBLIC_SITE_URL` |
| 404 on client routes | SPA redirect in netlify.toml |
