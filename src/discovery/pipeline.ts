import { Opportunity } from "../domain/opportunity";
import { assessQuality, applyQualityScore } from "./quality";
import { applyRarityScore, computeRarityScore } from "./rarity";
import { applyDesirabilityScore } from "./desirability";
import { clusterAndSuppress, Clusterable } from "./clustering";
import { applyRationales } from "./rationales";

export type PipelineResult = {
  published: Opportunity[];
  rejected: { id: string; reason: string }[];
  suppressed: { id: string; clusterId: string }[];
  stats: {
    examined: number;
    passedQuality: number;
    kept: number;
    suppressed: number;
  };
};

/**
 * Full deterministic pipeline:
 * quality gate → rarity → desirability → cluster suppress → rationales.
 */
export function runDiscoveryPipeline(
  candidates: Opportunity[],
  options?: { similarityThreshold?: number; maxPerCluster?: number }
): PipelineResult {
  const rejected: PipelineResult["rejected"] = [];
  const scored: Opportunity[] = [];

  for (const raw of candidates) {
    const q = assessQuality(raw);
    if (!q.passed) {
      rejected.push({
        id: raw.id,
        reason: q.failures.join(", ") || "quality-gate",
      });
      continue;
    }
    let opp = applyQualityScore(raw);
    const rarity = computeRarityScore(opp);
    opp = applyRarityScore(opp);
    opp = {
      ...opp,
      scoring: { ...opp.scoring, rarityScore: rarity.score, rarityModeUsed: rarity.mode },
    };
    opp = applyDesirabilityScore(opp);
    opp = applyRationales(opp, rarity.signals);
    scored.push(opp);
  }

  const clusterable: Clusterable[] = scored.map((o) => ({
    id: o.id,
    name: o.name,
    summary: o.summary,
    topics: o.topics,
    eventType: o.eventType,
    organizerName: o.organizer.name,
    officialUrl: o.links.official,
    desirabilityScore: o.scoring.desirabilityScore,
    qualityScore: o.scoring.qualityScore,
    rarityScore: o.scoring.rarityScore,
  }));

  const { kept, suppressed } = clusterAndSuppress(clusterable, options);

  const byId = new Map(scored.map((o) => [o.id, o]));
  const published: Opportunity[] = [];

  for (const m of kept) {
    const base = byId.get(m.id);
    if (!base) continue;
    let opp: Opportunity = {
      ...base,
      clustering: {
        clusterId: m.clusterId,
        clusterRank: m.clusterRank,
        clusterSize: m.clusterSize,
        status:
          m.status === "representative"
            ? "representative"
            : m.status === "kept-related"
              ? "kept-related"
              : "unclustered",
      },
      lifecycle: "published",
    };
    opp = applyRationales(opp, undefined, {
      rank: m.clusterRank,
      size: m.clusterSize,
    });
    published.push(opp);
  }

  return {
    published,
    rejected,
    suppressed: suppressed.map((s) => ({ id: s.id, clusterId: s.clusterId })),
    stats: {
      examined: candidates.length,
      passedQuality: scored.length,
      kept: published.length,
      suppressed: suppressed.length,
    },
  };
}
