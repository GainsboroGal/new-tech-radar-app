import { Opportunity } from "../domain/opportunity";
import { RaritySignals } from "./rarity";

/**
 * Deterministic plain-language rationales from observed signals.
 * AI may polish wording later; must not invent facts.
 */
export function buildWhyItStandsOut(opp: Opportunity): string {
  const parts: string[] = [];

  if (opp.topics.length >= 2) {
    parts.push(
      `Combines ${opp.topics.slice(0, 3).join(" + ")} in a single ${opp.eventType || "offering"}`
    );
  } else if (opp.topics.length === 1) {
    parts.push(`Focused ${opp.topics[0]} ${opp.eventType || "program"}`);
  }

  if (opp.pricing.status === "published" && opp.pricing.displayText) {
    parts.push(`with clear public pricing (${opp.pricing.displayText})`);
  }

  if (opp.location.format === "in-person" && opp.location.city) {
    parts.push(`in ${opp.location.city}`);
  } else if (opp.location.format === "online") {
    parts.push("in an online format");
  }

  if (
    opp.verification.status === "verified" ||
    opp.verification.status === "partially-verified"
  ) {
    parts.push("and verified public details");
  }

  if (!parts.length) {
    return (
      opp.summary?.slice(0, 160) ||
      "Public offering with identifiable organizer and program information."
    );
  }

  let text = parts.join(" ");
  if (!text.endsWith(".")) text += ".";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildWhyRelativelyUncommon(
  opp: Opportunity,
  signals?: Partial<RaritySignals>
): string {
  const reasons: string[] = [];

  if ((signals?.unusualTopicCombo ?? 0) >= 0.5 || opp.topics.length >= 2) {
    reasons.push(
      `unusual topic mix (${opp.topics.slice(0, 3).join(", ") || "specialized focus"})`
    );
  }

  if ((signals?.inverseMainstreamOverlap ?? 0) >= 0.6) {
    reasons.push("limited overlap with mainstream conference topics");
  }

  if ((signals?.geographicRarity ?? 0) >= 0.6 && opp.location.city) {
    reasons.push(`specific location (${opp.location.city}) rather than a generic mega-event`);
  }

  if (opp.pricing.status === "published") {
    reasons.push("transparent current pricing");
  }

  if (
    opp.verification.status === "verified" &&
    (signals?.freshnessObscurity ?? 0) >= 0.6
  ) {
    reasons.push("recently verified details");
  }

  if (!reasons.length) {
    return "Fewer comparable public listings match this combination of format, focus, and verified information.";
  }

  return `Relatively uncommon due to ${reasons.join("; ")}.`;
}

export function buildWhyRetained(
  opp: Opportunity,
  clusterRank: number,
  clusterSize: number
): string {
  if (clusterSize <= 1) {
    return "Only verified offering of this combination in the current dataset.";
  }
  if (clusterRank === 1) {
    return `Retained as the strongest verified example in its cluster of ${clusterSize} (highest desirability/quality).`;
  }
  return `Kept as related example #${clusterRank} of ${clusterSize} in the same cluster.`;
}

export function applyRationales(
  opp: Opportunity,
  signals?: Partial<RaritySignals>,
  cluster?: { rank: number; size: number }
): Opportunity {
  return {
    ...opp,
    rationale: {
      whyItStandsOut: buildWhyItStandsOut(opp),
      whyRelativelyUncommon: buildWhyRelativelyUncommon(opp, signals),
      whyItWasRetained: cluster
        ? buildWhyRetained(opp, cluster.rank, cluster.size)
        : opp.rationale.whyItWasRetained,
    },
  };
}
