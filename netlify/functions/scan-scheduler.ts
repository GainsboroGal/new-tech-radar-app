import type { Config } from "@netlify/functions";
import { config as appConfig } from "./_shared/config";
import { acquireScanLock, saveScanRun } from "./_shared/blobs";
import { selectSourceBatch } from "./_shared/sources";
import { json } from "./_shared/responses";

export default async function handler(req: Request) {
  const started = Date.now();

  if (!appConfig.enableAutomatedScans) {
    return json({ ok: true, skipped: true, reason: "ENABLE_AUTOMATED_SCANS=false" });
  }

  const lock = await acquireScanLock("scan-scheduler");
  if (!lock) {
    return json({ ok: true, skipped: true, reason: "scan-lock-held" });
  }

  const sources = selectSourceBatch(appConfig.maxScanSources);
  const scanRecord = {
    scanId: lock.scanId,
    status: "queued",
    sources: sources.map((s) => s.id),
    createdAt: new Date().toISOString(),
    trigger: "schedule",
  };

  await saveScanRun(lock.scanId, scanRecord);

  const siteUrl =
    appConfig.publicSiteUrl ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "";

  let workerInvoked = false;
  let workerError: string | undefined;

  if (siteUrl) {
    try {
      const workerUrl = `${siteUrl.replace(/\/$/, "")}/.netlify/functions/scan-worker-background`;
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-scan-id": lock.scanId,
        },
        body: JSON.stringify({ scanId: lock.scanId, sourceIds: sources.map((s) => s.id) }),
      });
      workerInvoked = res.ok || res.status === 202;
      if (!workerInvoked) {
        workerError = `worker status ${res.status}`;
      }
    } catch (err) {
      workerError = err instanceof Error ? err.message : "worker invoke failed";
    }
  } else {
    workerError = "No PUBLIC_SITE_URL / URL to invoke background worker";
  }

  return json({
    ok: true,
    scanId: lock.scanId,
    sources: sources.length,
    workerInvoked,
    workerError,
    durationMs: Date.now() - started,
  });
}

export const config: Config = {
  schedule: "0 */6 * * *",
};
