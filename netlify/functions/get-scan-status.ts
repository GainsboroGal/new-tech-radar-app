import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { STORES, getCurrentSnapshot } from "./_shared/blobs";
import { json, error } from "./_shared/responses";

export default async function handler() {
  try {
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
    return error("Failed to load scan status", 500);
  }
}

export const config: Config = {
  path: "/api/scan-status",
};
