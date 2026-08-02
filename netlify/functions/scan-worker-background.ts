import type { Config } from "@netlify/functions";
import { config as appConfig } from "./_shared/config";
import {
  publishSnapshot,
  releaseScanLock,
  saveScanRun,
  saveLastSuccess,
  getCurrentSnapshot,
} from "./_shared/blobs";
import { searchGithubRepos } from "./_shared/github";
import { enabledSources } from "./_shared/sources";
import { json } from "./_shared/responses";

type Incoming = {
  scanId?: string;
  sourceIds?: string[];
};

export default async function handler(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Incoming;
  const scanId =
    body.scanId || req.headers.get("x-scan-id") || `scan-${Date.now()}`;

  const started = Date.now();
  let partial = false;
  const errors: string[] = [];
  let examined = 0;
  let kept = 0;
  let suppressed = 0;

  try {
    const sources = enabledSources().filter(
      (s) => !body.sourceIds?.length || body.sourceIds.includes(s.id)
    );

    let githubItems: unknown[] = [];
    if (appConfig.enableGithubDiscovery) {
      const gh = await searchGithubRepos(undefined, 15);
      examined += gh.items.length;
      if (gh.partial) partial = true;
      if (gh.error) errors.push(gh.error);
      githubItems = gh.items.slice(0, appConfig.maxScanCandidates);
    }

    const previous = await getCurrentSnapshot();
    const previousOpps = (previous?.opportunities as unknown[]) || [];

    const version = `snap-${Date.now()}`;
    const opportunities = previousOpps.length ? previousOpps : [];

    kept = opportunities.length;
    examined = Math.max(examined, kept);

    const scanMeta = {
      lastScan: new Date().toISOString(),
      examined,
      kept,
      suppressed,
      partial: partial || opportunities.length === 0,
      status: (partial ? "partial" : "ok") as "ok" | "partial",
      message:
        opportunities.length === 0
          ? "No prior snapshot — client seed remains authoritative until operator publishes."
          : errors.length
            ? `Scan completed with notes: ${errors.join("; ")}`
            : `Scan completed. GitHub candidates seen: ${githubItems.length}. Published set unchanged pending operator review.`,
    };

    if (opportunities.length > 0) {
      await publishSnapshot({
        version,
        generatedAt: new Date().toISOString(),
        opportunities,
        scanMeta,
      });
    }

    const runSummary = {
      scanId,
      status: "completed",
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      examined,
      kept,
      suppressed,
      partial,
      errors,
      githubCandidateCount: githubItems.length,
      sources: sources.map((s) => s.id),
    };

    await saveScanRun(scanId, runSummary);
    await saveLastSuccess(runSummary);

    return json({ ok: true, ...runSummary }, 202);
  } catch (err) {
    const message = err instanceof Error ? err.message : "worker failed";
    console.error("[scan-worker]", message);
    await saveScanRun(scanId, {
      scanId,
      status: "failed",
      error: message,
      finishedAt: new Date().toISOString(),
    });
    return json({ ok: false, error: message, scanId }, 500);
  } finally {
    await releaseScanLock(scanId);
  }
}

export const config: Config = {
  background: true,
  path: "/.netlify/functions/scan-worker-background",
};
