import type { Config, Context } from "@netlify/functions";
import { json } from "./_shared/responses";

/**
 * Public API — serves current published snapshot.
 * Falls through to empty so the client can use seed/emergency.
 */
export default async function handler(_req: Request, _context: Context) {
  try {
    // Dynamic import so a Blobs init failure still returns JSON
    const { getCurrentSnapshot } = await import("./_shared/blobs");
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
    // Still JSON so the SPA never receives HTML for this path
    return json(
      {
        opportunities: [],
        scanMeta: {
          lastScan: null,
          examined: 0,
          kept: 0,
          suppressed: 0,
          partial: true,
          status: "failed",
          message: "Snapshot store unavailable — client should use seed/emergency.",
        },
        version: null,
      },
      200
    );
  }
}

export const config: Config = {
  path: "/api/opportunities",
};
