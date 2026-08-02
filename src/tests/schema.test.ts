import { describe, it, expect } from "vitest";
import { OpportunityArraySchema, OpportunitySchema } from "../domain/schemas";
import seed from "../data/seed-opportunities.json";
import emergency from "../data/emergency-snapshot.json";
import { migrateLegacyItem } from "../discovery/migration";

describe("Opportunity schema", () => {
  it("validates all seed records", () => {
    const result = OpportunityArraySchema.safeParse(seed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it("validates emergency snapshot opportunities", () => {
    const result = OpportunityArraySchema.safeParse(emergency.opportunities);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const bad = { id: "x" };
    const result = OpportunitySchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe("Legacy migration", () => {
  it("converts a minimal legacy item into a review-lifecycle Opportunity", () => {
    const legacy = {
      id: 42,
      name: "old-repo/example",
      description: "A sample public tool",
      url: "https://github.com/old-repo/example",
      uniqueness: 67,
      topics: ["tool"],
      keyFeatures: "Does one useful thing",
    };
    const opp = migrateLegacyItem(legacy);
    expect(opp.lifecycle).toBe("review");
    expect(opp.scoring.rarityScore).toBe(67);
    expect(opp.verification.status).toBe("needs-recheck");
    expect(opp.id).toBe("legacy-42");
  });
});
