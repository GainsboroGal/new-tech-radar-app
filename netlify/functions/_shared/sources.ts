/**
 * Controlled source registry — no unregistered source may be scanned.
 */

export type SourceRecord = {
  id: string;
  type: "official-site" | "public-calendar" | "github-repo" | "community-list" | "other-public";
  name: string;
  publicUrl: string;
  accessMethod: "fetch" | "github-api" | "manual";
  scanCadenceHours: number;
  maxRequestsPerScan: number;
  reliability: "high" | "medium" | "low";
  enabled: boolean;
  termsNotes?: string;
};

export const SOURCE_REGISTRY: SourceRecord[] = [
  {
    id: "src-seed-static",
    type: "other-public",
    name: "Bundled seed opportunities",
    publicUrl: "https://example.com/seed",
    accessMethod: "manual",
    scanCadenceHours: 24,
    maxRequestsPerScan: 1,
    reliability: "high",
    enabled: true,
    termsNotes: "Internal validated seed — not an external crawl.",
  },
  {
    id: "src-github-netlify-public",
    type: "github-repo",
    name: "GitHub public Netlify-related repos",
    publicUrl: "https://api.github.com/search/repositories",
    accessMethod: "github-api",
    scanCadenceHours: 6,
    maxRequestsPerScan: 5,
    reliability: "medium",
    enabled: true,
    termsNotes: "Public Search API only; rate-limited; optional token.",
  },
];

export function enabledSources(): SourceRecord[] {
  return SOURCE_REGISTRY.filter((s) => s.enabled);
}

export function selectSourceBatch(max: number): SourceRecord[] {
  return enabledSources().slice(0, max);
}
