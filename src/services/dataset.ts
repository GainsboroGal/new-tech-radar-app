import {
  Opportunity,
  OpportunityArraySchema,
  ScanMeta,
  ScanMetaSchema,
} from "../domain/opportunity";
import seed from "../data/seed-opportunities.json";
import emergency from "../data/emergency-snapshot.json";

export type Dataset = {
  opportunities: Opportunity[];
  scanMeta: ScanMeta;
  source: "live" | "seed" | "emergency";
};

const LIVE_URLS = [
  "/api/opportunities",
  "/.netlify/functions/get-opportunities",
];

/** Safely parse JSON; return null if the body is HTML or invalid. */
async function readJson(res: Response): Promise<unknown | null> {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;
  // SPA fallback returns HTML — treat as non-API
  if (
    ct.includes("text/html") ||
    text.trimStart().startsWith("<!DOCTYPE") ||
    text.trimStart().startsWith("<html")
  ) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function tryLiveApi(): Promise<Dataset | null> {
  for (const url of LIVE_URLS) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = await readJson(res);
      if (!data || typeof data !== "object") continue;

      const body = data as Record<string, unknown>;
      const rawList = body.opportunities ?? body.items ?? [];
      const parsed = OpportunityArraySchema.safeParse(rawList);
      if (!parsed.success || parsed.data.length === 0) continue;

      const metaParsed = ScanMetaSchema.safeParse(
        body.scanMeta ?? {
          lastScan: body.lastScan ?? null,
          status: "ok",
        }
      );
      const scanMeta = metaParsed.success
        ? metaParsed.data
        : {
            lastScan: null,
            examined: parsed.data.length,
            kept: parsed.data.length,
            suppressed: 0,
            partial: false,
            status: "ok" as const,
            message: "Live snapshot loaded.",
          };

      return {
        opportunities: parsed.data,
        scanMeta,
        source: "live",
      };
    } catch {
      // try next URL
    }
  }
  return null;
}

/**
 * Load the public dataset.
 * Priority: live API → validated seed → emergency snapshot.
 * Never returns an empty broken state.
 */
export async function loadDataset(): Promise<Dataset> {
  const live = await tryLiveApi();
  if (live) return live;

  // 2. Validated seed (bundled)
  try {
    const opportunities = OpportunityArraySchema.parse(seed);
    return {
      opportunities,
      scanMeta: {
        lastScan: null,
        examined: opportunities.length,
        kept: opportunities.length,
        suppressed: 0,
        partial: false,
        status: "never",
        message: "Serving validated seed data (no live snapshot yet).",
      },
      source: "seed",
    };
  } catch (err) {
    console.error("[dataset] Seed validation failed", err);
  }

  // 3. Emergency snapshot (last resort)
  const opportunities = OpportunityArraySchema.parse(emergency.opportunities);
  const scanMeta = ScanMetaSchema.parse(emergency.scanMeta);
  return {
    opportunities,
    scanMeta,
    source: "emergency",
  };
}

/** Synchronous access to the emergency snapshot for build-time or SSR use */
export function getEmergencySnapshot(): Dataset {
  return {
    opportunities: OpportunityArraySchema.parse(emergency.opportunities),
    scanMeta: ScanMetaSchema.parse(emergency.scanMeta),
    source: "emergency",
  };
}
