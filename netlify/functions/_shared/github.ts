/**
 * Bounded GitHub Search helper with rate-limit awareness.
 * Optional and secondary — failure must not break the public feed.
 */

import { config } from "./config";

export type GithubRepoHit = {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
  private: boolean;
};

export type GithubSearchResult = {
  items: GithubRepoHit[];
  partial: boolean;
  rateLimitRemaining: number | null;
  error?: string;
};

const DEFAULT_QUERIES = [
  "topic:netlify is:public pushed:>2025-01-01",
  '"netlify.toml" is:public stars:<500 pushed:>2025-06-01',
];

export async function searchGithubRepos(
  queries: string[] = DEFAULT_QUERIES,
  perPage = 20
): Promise<GithubSearchResult> {
  if (!config.enableGithubDiscovery) {
    return { items: [], partial: false, rateLimitRemaining: null, error: "GitHub discovery disabled" };
  }

  const token = config.githubToken;
  if (!token) {
    return {
      items: [],
      partial: true,
      rateLimitRemaining: null,
      error: "GITHUB_TOKEN missing — GitHub discovery skipped",
    };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "NewTechRadar-Scanner",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const items: GithubRepoHit[] = [];
  let partial = false;
  let rateLimitRemaining: number | null = null;
  let lastError: string | undefined;

  for (const q of queries.slice(0, 5)) {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=updated&per_page=${perPage}`;
      const res = await fetch(url, { headers });
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining !== null) rateLimitRemaining = Number(remaining);

      if (res.status === 403 || res.status === 429) {
        partial = true;
        lastError = `GitHub rate limited (${res.status})`;
        break;
      }

      if (!res.ok) {
        partial = true;
        lastError = `GitHub search failed: ${res.status}`;
        continue;
      }

      const data = (await res.json()) as { items?: GithubRepoHit[] };
      for (const item of data.items || []) {
        if (!item.private) items.push(item);
      }

      await new Promise((r) => setTimeout(r, 1200));

      if (rateLimitRemaining !== null && rateLimitRemaining < 5) {
        partial = true;
        lastError = "Approaching GitHub rate limit — stopping early";
        break;
      }
    } catch (err) {
      partial = true;
      lastError = err instanceof Error ? err.message : "GitHub fetch error";
    }
  }

  const byId = new Map<number, GithubRepoHit>();
  for (const item of items) byId.set(item.id, item);

  return {
    items: [...byId.values()],
    partial,
    rateLimitRemaining,
    error: lastError,
  };
}
