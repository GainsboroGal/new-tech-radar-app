import { Opportunity } from "../domain/opportunity";

export type RaritySignals = {
  unusualTopicCombo: number; // 0–1
  inverseDirectoryOccurrence: number;
  inverseMainstreamOverlap: number;
  sourceDiversity: number;
  geographicRarity: number;
  languageRarity: number;
  inverseStars: number;
  inverseForks: number;
  freshnessObscurity: number;
  marketingCopyPenalty: number; // 0–1, subtracted
};

const MAINSTREAM_TOPICS = new Set([
  "ai",
  "startup",
  "conference",
  "networking",
  "webinar",
  "general",
  "business",
  "marketing",
  "crypto",
  "nft",
]);

/**
 * Relative rarity heuristic (0–100).
 * Weights from Master Prompt §7. Normalize when GitHub signals absent.
 * Never presented as scientific uniqueness.
 */
export function computeRarityScore(
  opp: Opportunity,
  context?: {
    /** How often this topic combo appears in the current batch (0 = unique) */
    topicComboFrequency?: number;
    /** Rough public-directory hit estimate 0–1 */
    directoryOccurrence?: number;
    stars?: number;
    forks?: number;
  }
): { score: number; signals: RaritySignals; mode: string } {
  const topics = opp.topics.map((t) => t.toLowerCase());

  // Unusual topic combination
  const unusualTopicCombo =
    topics.length >= 2
      ? Math.min(1, 0.4 + topics.length * 0.15)
      : topics.length === 1
        ? 0.35
        : 0.1;

  const mainstreamHits = topics.filter((t) =>
    [...MAINSTREAM_TOPICS].some((m) => t.includes(m))
  ).length;
  const inverseMainstreamOverlap = Math.max(
    0,
    1 - mainstreamHits / Math.max(1, topics.length)
  );

  const inverseDirectoryOccurrence = 1 - Math.min(1, context?.directoryOccurrence ?? 0.3);

  const sourceDiversity = Math.min(
    1,
    (opp.verification.sourceIds?.length ?? 0) / 2
  );

  const geographicRarity =
    opp.location.format === "in-person" &&
    opp.location.country &&
    opp.location.country !== "Global" &&
    opp.location.country !== "Unknown"
      ? 0.7
      : opp.location.format === "online"
        ? 0.35
        : 0.5;

  // Language rarity placeholder (no multi-language detection yet)
  const languageRarity = 0.4;

  const stars = context?.stars ?? 0;
  const forks = context?.forks ?? 0;
  const hasGithub = stars > 0 || forks > 0;
  const inverseStars = hasGithub ? 1 / (1 + Math.log10(stars + 1)) : 0;
  const inverseForks = hasGithub ? 1 / (1 + Math.log10(forks + 1)) : 0;

  // Freshness–obscurity: prefer recent verification, not pure popularity
  let freshnessObscurity = 0.5;
  if (opp.verification.lastVerifiedAt) {
    const days =
      (Date.now() - new Date(opp.verification.lastVerifiedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    freshnessObscurity = days < 14 ? 0.85 : days < 45 ? 0.65 : 0.4;
  }

  // Marketing-copy penalty (very generic summary language)
  const genericPhrases = [
    "join us",
    "don't miss",
    "world-class",
    "limited spots",
    "transform your",
    "game-changing",
  ];
  const summaryLower = (opp.summary || "").toLowerCase();
  const hits = genericPhrases.filter((p) => summaryLower.includes(p)).length;
  const marketingCopyPenalty = Math.min(0.4, hits * 0.12);

  const signals: RaritySignals = {
    unusualTopicCombo,
    inverseDirectoryOccurrence,
    inverseMainstreamOverlap,
    sourceDiversity,
    geographicRarity,
    languageRarity,
    inverseStars,
    inverseForks,
    freshnessObscurity,
    marketingCopyPenalty,
  };

  // Weights from Master Prompt (sum ≈ 1.0 when GitHub present)
  let weights: Record<keyof RaritySignals, number> = {
    unusualTopicCombo: 0.22,
    inverseDirectoryOccurrence: 0.15,
    inverseMainstreamOverlap: 0.12,
    sourceDiversity: 0.1,
    geographicRarity: 0.1,
    languageRarity: 0.08,
    inverseStars: 0.08,
    inverseForks: 0.05,
    freshnessObscurity: 0.1,
    marketingCopyPenalty: 0, // handled as subtraction
  };

  if (!hasGithub) {
    // Redistribute star/fork weight into topic + freshness
    weights = {
      ...weights,
      inverseStars: 0,
      inverseForks: 0,
      unusualTopicCombo: 0.28,
      freshnessObscurity: 0.15,
    };
  }

  let raw =
    signals.unusualTopicCombo * weights.unusualTopicCombo +
    signals.inverseDirectoryOccurrence * weights.inverseDirectoryOccurrence +
    signals.inverseMainstreamOverlap * weights.inverseMainstreamOverlap +
    signals.sourceDiversity * weights.sourceDiversity +
    signals.geographicRarity * weights.geographicRarity +
    signals.languageRarity * weights.languageRarity +
    signals.inverseStars * weights.inverseStars +
    signals.inverseForks * weights.inverseForks +
    signals.freshnessObscurity * weights.freshnessObscurity -
    signals.marketingCopyPenalty;

  // Slight boost when topic combo is rare in batch
  if (context?.topicComboFrequency !== undefined) {
    raw += (1 - Math.min(1, context.topicComboFrequency)) * 0.08;
  }

  const score = Math.round(Math.max(0, Math.min(100, raw * 100)));
  return { score, signals, mode: hasGithub ? "with-github" : "default" };
}

export function applyRarityScore(opp: Opportunity, context?: Parameters<typeof computeRarityScore>[1]): Opportunity {
  const { score, mode } = computeRarityScore(opp, context);
  return {
    ...opp,
    scoring: {
      ...opp.scoring,
      rarityScore: score,
      rarityModeUsed: mode,
    },
  };
}
