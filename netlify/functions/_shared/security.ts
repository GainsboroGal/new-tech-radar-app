import { config } from "./config";

/** Validate operator/scan trigger secret from Authorization or x-scan-secret header. */
export function assertScanSecret(req: Request): boolean {
  const secret = config.scanTriggerSecret;
  if (!secret) {
    return false;
  }
  const auth = req.headers.get("authorization") || "";
  const header = req.headers.get("x-scan-secret") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return bearer === secret || header === secret;
}

export function redactSecrets(text: string): string {
  return text
    .replace(/ghp_[A-Za-z0-9]+/g, "ghp_[REDACTED]")
    .replace(/github_pat_[A-Za-z0-9_]+/g, "github_pat_[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [REDACTED]");
}
