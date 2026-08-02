/**
 * Migration helpers from the old Unique Public Apps prototype shape
 * to the authoritative Opportunity schema.
 *
 * Old shape (inferred):
 * {
 *   id, name, description, url, homepage?, stars, language?,
 *   topics, category, uniqueness, keyFeatures, discoveredAt, pushedAt?
 * }
 */

import { Opportunity, OpportunitySchema } from "../domain/opportunity";

export type LegacyDiscoveryItem = {
  id: string | number;
  name: string;
  description?: string;
  url: string;
  homepage?: string | null;
  stars?: number;
  language?: string;
  topics?: string[];
  category?: string;
  uniqueness?: number;
  keyFeatures?: string;
  discoveredAt?: string;
  pushedAt?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Best-effort conversion of a legacy item into an Opportunity.
 * Missing required fields receive safe placeholders that fail closed
 * (lifecycle = "draft" or "review") so they never appear as published
 * without human review.
 */
export function migrateLegacyItem(item: LegacyDiscoveryItem): Opportunity {
  const id = String(item.id);
  const name = item.name || "Untitled opportunity";
  const summary =
    item.description?.trim() ||
    item.keyFeatures?.trim() ||
    "No summary available from legacy source.";

  const candidate: Opportunity = {
    id: `legacy-${id}`,
    slug: slugify(name) || `legacy-${id}`,
    name,
    summary,
    eventType: "other",
    topics: item.topics?.length
      ? item.topics
      : item.category
        ? [item.category]
        : [],
    organizer: {
      name: "Legacy import",
      officialUrl: item.url || "https://example.com",
    },
    location: {
      country: "Unknown",
      format: "online",
    },
    dates: {},
    pricing: {
      status: "not-announced",
      displayText: "Pricing not available in legacy data",
    },
    links: {
      official: item.homepage || item.url || "https://example.com",
      ...(item.url ? { registration: item.url } : {}),
    },
    verification: {
      status: "needs-recheck",
      lastVerifiedAt: item.discoveredAt,
      sourceIds: ["legacy-prototype"],
      notes: "Migrated from Unique Public Apps prototype. Requires re-verification.",
    },
    scoring: {
      qualityScore: 40,
      rarityScore: Math.min(100, Math.max(0, item.uniqueness ?? 50)),
      desirabilityScore: 45,
      rarityModeUsed: "legacy-import",
    },
    clustering: {
      status: "unclustered",
    },
    rationale: {
      whyItStandsOut:
        item.keyFeatures?.slice(0, 200) ||
        "Imported from earlier prototype; rationale not yet regenerated.",
      whyRelativelyUncommon:
        typeof item.uniqueness === "number"
          ? `Legacy uniqueness heuristic scored this item at ${item.uniqueness}%.`
          : "No rarity rationale available from legacy data.",
    },
    lifecycle: "review", // never auto-publish legacy items
  };

  // Validate; if it still fails, throw with context
  const parsed = OpportunitySchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(
      `Migration failed for legacy id ${id}: ${parsed.error.message}`
    );
  }
  return parsed.data;
}

export function migrateLegacyCollection(
  items: LegacyDiscoveryItem[]
): Opportunity[] {
  const results: Opportunity[] = [];
  const errors: string[] = [];

  for (const item of items) {
    try {
      results.push(migrateLegacyItem(item));
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : `Unknown error for ${item.id}`
      );
    }
  }

  if (errors.length) {
    console.warn("[migration] Some legacy items failed:", errors);
  }

  return results;
}
