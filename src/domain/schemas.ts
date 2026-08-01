import { z } from "zod";

/** Authoritative Opportunity schema — Phase 1 contract */
export const OpportunitySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  eventType: z.string().min(1),
  topics: z.array(z.string()).default([]),
  organizer: z.object({
    name: z.string().min(1),
    officialUrl: z.string().url(),
  }),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().min(1),
    venue: z.string().optional(),
    format: z.enum(["in-person", "online", "hybrid", "cruise"]),
  }),
  dates: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    registrationOpenDate: z.string().optional(),
    earlyBirdDeadline: z.string().optional(),
    registrationDeadline: z.string().optional(),
  }),
  pricing: z.object({
    status: z.enum(["published", "partially-published", "not-announced"]),
    currency: z.string().optional(),
    minimum: z.number().nonnegative().optional(),
    maximum: z.number().nonnegative().optional(),
    displayText: z.string().min(1),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
  }),
  links: z.object({
    official: z.string().url(),
    registration: z.string().url().optional(),
    agenda: z.string().url().optional(),
    social: z.array(z.string().url()).optional(),
  }),
  verification: z.object({
    status: z.enum([
      "verified",
      "partially-verified",
      "needs-recheck",
      "source-unavailable",
      "announced",
    ]),
    lastVerifiedAt: z.string().optional(),
    sourceIds: z.array(z.string()).default([]),
    notes: z.string().optional(),
  }),
  scoring: z.object({
    qualityScore: z.number().min(0).max(100),
    rarityScore: z.number().min(0).max(100),
    desirabilityScore: z.number().min(0).max(100),
    rarityModeUsed: z.string().min(1),
  }),
  clustering: z.object({
    clusterId: z.string().optional(),
    clusterRank: z.number().int().positive().optional(),
    clusterSize: z.number().int().nonnegative().optional(),
    status: z.enum(["representative", "kept-related", "unclustered"]),
  }),
  rationale: z.object({
    whyItStandsOut: z.string().min(1),
    whyRelativelyUncommon: z.string().min(1),
    whyItWasRetained: z.string().optional(),
  }),
  lifecycle: z.enum(["draft", "review", "published", "expired", "archived"]),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

export const OpportunityArraySchema = z.array(OpportunitySchema);

export const ScanMetaSchema = z.object({
  lastScan: z.string().nullable(),
  examined: z.number().int().nonnegative().default(0),
  kept: z.number().int().nonnegative().default(0),
  suppressed: z.number().int().nonnegative().default(0),
  partial: z.boolean().default(false),
  status: z.enum(["ok", "partial", "failed", "never"]).default("never"),
  message: z.string().optional(),
});

export type ScanMeta = z.infer<typeof ScanMetaSchema>;
