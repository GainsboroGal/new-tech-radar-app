import type { Config, Context } from "@netlify/functions";
import { json } from "./_shared/responses";

export default async function handler(_req: Request, _context: Context) {
  try {
    const { getStore } = await import("@netlify/blobs");
    const { STORES, getCurrentSnapshot } = await import("./_shared/blobs");
    const scanStore = getStore(STORES.scanState);
    const lock = await scanStore.get("active-lock", { type: "json" });
    const lastSuccess = await scanStore.get("last-success", { type: "json" });
    const snap = await getCurrentSnapshot();

    return json({
      lock: lock ?? null,
      lastSuccess: lastSuccess ?? null,
      currentVersion: snap?.version ?? null,
      opportunityCount: snap?.opportunities?.length ?? 0,
      scanMeta: snap?.scanMeta ?? null,
    });
  } catch (err) {
    console.error("[get-scan-status]", err);
    return json({
      lock: null,
      lastSuccess: null,
      currentVersion: null,
      opportunityCount: 0,
      scanMeta: {
        lastScan: null,
        examined: 0,
        kept: 0,
        suppressed: 0,
        partial: true,
        status: "failed",
        message: "Scan status store unavailable.",
      },
      offline: true,
    });
  }
}

export const config: Config = {
  path: "/api/scan-status",
};
