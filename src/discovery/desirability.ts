import { Opportunity } from "../domain/opportunity";
import { nearestDeadline } from "../domain/dates";

/**
 * Desirability = weighted blend.
 * 35% relevance (caller may pass override) + 25% quality + 20% rarity
 * + 10% freshness + 10% deadline usefulness.
 * Rarity must never be the only optimization target.
 */
export function computeDesirabilityScore(
  opp: Opportunity,
  opts?: { relevance?: number }
): number {
  const relevance = opts?.relevance ?? estimateRelevance(opp);
  const quality = opp.scoring.qualityScore / 100;
  const rarity = opp.scoring.rarityScore / 100;
  const freshness = freshnessSignal(opp);
  const deadline = deadlineUsefulness(opp);

  const raw =
    relevance * 0.35 +
    quality * 0.25 +
    rarity * 0.2 +
    freshness * 0.1 +
    deadline * 0.1;

  return Math.round(Math.max(0, Math.min(100, raw * 100)));
}

function estimateRelevance(opp: Opportunity): number {
  // Baseline: published + verified-ish items are more relevant for the feed
  let r = 0.55;
  if (opp.lifecycle === "published") r += 0.15;
  if (
    opp.verification.status === "verified" ||
    opp.verification.status === "partially-verified"
  ) {
    r += 0.15;
  }
  if ((opp.topics?.length ?? 0) >= 2) r += 0.1;
  return Math.min(1, r);
}

function freshnessSignal(opp: Opportunity): number {
  if (!opp.verification.lastVerifiedAt) return 0.4;
  const days =
    (Date.now() - new Date(opp.verification.lastVerifiedAt).getTime()) /
    (1000 * 60 * 60 * 24);
  if (days <= 7) return 1;
  if (days <= 21) return 0.8;
  if (days <= 45) return 0.55;
  return 0.3;
}

function deadlineUsefulness(opp: Opportunity): number {
  const d = nearestDeadline(opp);
  if (!d) return 0.25;
  const days = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 0.1; // past
  if (days <= 14) return 1;
  if (days <= 45) return 0.75;
  if (days <= 90) return 0.5;
  return 0.35;
}

export function applyDesirabilityScore(opp: Opportunity): Opportunity {
  const score = computeDesirabilityScore(opp);
  return {
    ...opp,
    scoring: {
      ...opp.scoring,
      desirabilityScore: score,
    },
  };
}
