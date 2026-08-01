/**
 * Runtime configuration from environment variables.
 * Never hard-code secrets.
 */

export function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

export function envOptional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return raw === "1" || raw.toLowerCase() === "true" || raw === "yes";
}

export const config = {
  get githubToken() {
    return envOptional("GITHUB_TOKEN");
  },
  get publicSiteUrl() {
    return envOptional("PUBLIC_SITE_URL", "");
  },
  get maxScanSources() {
    return envInt("MAX_SCAN_SOURCES", 40);
  },
  get maxScanCandidates() {
    return envInt("MAX_SCAN_CANDIDATES", 100);
  },
  get maxScanRuntimeMs() {
    return envInt("MAX_SCAN_RUNTIME_MS", 12 * 60 * 1000);
  },
  get similarityThreshold() {
    return Number.parseFloat(envOptional("SIMILARITY_THRESHOLD", "0.55")) || 0.55;
  },
  get maxPerCluster() {
    return envInt("MAX_PER_CLUSTER", 3);
  },
  get minQualityScore() {
    return envInt("MIN_QUALITY_SCORE", 40);
  },
  get enableAutomatedScans() {
    return envBool("ENABLE_AUTOMATED_SCANS", true);
  },
  get enableGithubDiscovery() {
    return envBool("ENABLE_GITHUB_DISCOVERY", true);
  },
  get scanTriggerSecret() {
    return envOptional("SCAN_TRIGGER_SECRET");
  },
};
