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

export async function loadDataset(): Promise<Dataset> {
  try {
    const res = await fetch("/.netlify/functions/get-opportunities");
    if (res.ok) {
      const data = await res.json();
      const opportunities = OpportunityArraySchema.parse(data.opportunities ?? data.items ?? []);
      const scanMeta = ScanMetaSchema.parse(
        data.scanMeta ?? {
          lastScan: data.lastScan ?? null,
          status: "ok",
        }
      );
      if (opportunities.length > 0) {
        return { opportunities, scanMeta, source: "live" };
      }
    }
  } catch {
    // fall through
  }

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
        message: "Serving validated seed data (no live scan yet).",
      },
      source: "seed",
    };
  } catch (err) {
    console.error("[dataset] Seed validation failed", err);
  }

  const opportunities = OpportunityArraySchema.parse(emergency.opportunities);
  const scanMeta = ScanMetaSchema.parse(emergency.scanMeta);
  return {
    opportunities,
    scanMeta,
    source: "emergency",
  };
}

export function getEmergencySnapshot(): Dataset {
  return {
    opportunities: OpportunityArraySchema.parse(emergency.opportunities),
    scanMeta: ScanMetaSchema.parse(emergency.scanMeta),
    source: "emergency",
  };
}
