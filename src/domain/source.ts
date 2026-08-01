import { z } from "zod";

export const SourceSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "official-site",
    "public-calendar",
    "github-repo",
    "community-list",
    "other-public",
  ]),
  name: z.string().min(1),
  publicUrl: z.string().url(),
  accessMethod: z.enum(["fetch", "github-api", "manual"]),
  scanCadenceHours: z.number().positive(),
  maxRequestsPerScan: z.number().int().positive(),
  reliability: z.enum(["high", "medium", "low"]),
  lastAttemptAt: z.string().nullable().default(null),
  lastSuccessAt: z.string().nullable().default(null),
  nextEligibleAt: z.string().nullable().default(null),
  termsNotes: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type Source = z.infer<typeof SourceSchema>;
