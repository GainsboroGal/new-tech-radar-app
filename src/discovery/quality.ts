import { Opportunity } from "../domain/opportunity";

export type QualityResult = {
  passed: boolean;
  score: number;
  failures: string[];
  notes: string[];
};

export function assessQuality(
  candidate: Partial<Opportunity> & {
    name?: string;
    summary?: string;
    links?: { official?: string };
    organizer?: { name?: string; officialUrl?: string };
    dates?: {
      startDate?: string;
      endDate?: string;
      registrationDeadline?: string;
      earlyBirdDeadline?: string;
    };
    verification?: { status?: string };
  }
): QualityResult {
  const failures: string[] = [];
  const notes: string[] = [];
  let score = 100;

  if (!candidate.name?.trim()) {
    failures.push("missing-name");
    score -= 25;
  }
  if (!candidate.summary?.trim() || (candidate.summary?.trim().length ?? 0) < 40) {
    failures.push("thin-or-missing-summary");
    score -= 20;
  }
  if (!candidate.organizer?.name?.trim()) {
    failures.push("missing-organizer");
    score -= 15;
  }
  if (!candidate.organizer?.officialUrl?.startsWith("http")) {
    failures.push("missing-organizer-url");
    score -= 10;
  }
  if (!candidate.links?.official?.startsWith("http")) {
    failures.push("missing-official-link");
    score -= 20;
  }
  const hasDate =
    Boolean(candidate.dates?.startDate) ||
    Boolean(candidate.dates?.registrationDeadline) ||
    Boolean(candidate.dates?.earlyBirdDeadline);
  if (!hasDate) {
    failures.push("no-date-evidence");
    score -= 15;
  }
  if (candidate.verification?.status === "source-unavailable") {
    failures.push("source-unavailable");
    score -= 30;
  }

  const hardFails = new Set(["missing-name", "missing-official-link", "source-unavailable"]);
  const passed = !failures.some((f) => hardFails.has(f)) && score >= 40;

  if (passed && failures.length) {
    notes.push(`Passed with deductions: ${failures.join(", ")}`);
  }

  return {
    passed,
    score: Math.max(0, Math.min(100, score)),
    failures,
    notes,
  };
}

export function applyQualityScore(opp: Opportunity): Opportunity {
  const result = assessQuality(opp);
  return {
    ...opp,
    scoring: {
      ...opp.scoring,
      qualityScore: result.score,
    },
  };
}
