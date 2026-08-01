import type { Config } from "@netlify/functions";
import { getCurrentSnapshot } from "./_shared/blobs";
import { json, error } from "./_shared/responses";

export default async function handler() {
  try {
    const snap = await getCurrentSnapshot();
    if (!snap) {
      return json({
        opportunities: [],
        scanMeta: {
          lastScan: null,
          examined: 0,
          kept: 0,
          suppressed: 0,
          partial: false,
          status: "never",
          message: "No published snapshot yet — client should use seed/emergency.",
        },
        version: null,
      });
    }

    return json({
      opportunities: snap.opportunities,
      scanMeta: snap.scanMeta,
      version: snap.version,
    });
  } catch (err) {
    console.error("[get-opportunities]", err);
    return error("Failed to load opportunities", 500);
  }
}

export const config: Config = {
  path: "/api/opportunities",
};
