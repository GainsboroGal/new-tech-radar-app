/**
 * Deterministic online cluster suppression — Master Prompt §8 / Phase 3.
 */

export const SIMILARITY_THRESHOLD = 0.55;
export const MIN_SIMILARITY_THRESHOLD = 0.45;
export const MAX_SIMILARITY_THRESHOLD = 0.65;
export const MAX_PER_CLUSTER = 3;
export const MIN_SIGNATURE_TOKENS = 3;

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "dare", "ought", "used",
  "this", "that", "these", "those", "it", "its", "into", "over", "after",
  "before", "between", "under", "above", "about", "against", "during", "without",
  "via", "per", "each", "few", "more", "most", "other", "some", "such", "than",
  "too", "very", "just", "also", "only", "own", "same", "so", "than", "too",
  "online", "event", "course", "program", "session", "sessions", "join", "free",
]);

export type Clusterable = {
  id: string;
  name: string;
  summary?: string;
  topics?: string[];
  eventType?: string;
  organizerName?: string;
  officialUrl?: string;
  desirabilityScore?: number;
  qualityScore?: number;
  rarityScore?: number;
  activityRecency?: number; // higher = more recent
  popularity?: number; // lower preferred when sorting
};

export type ClusterMember = Clusterable & {
  clusterId: string;
  clusterRank: number;
  clusterSize: number;
  status: "representative" | "kept-related" | "suppressed" | "unclustered";
  similarityToRep?: number;
};

export type ClusterResult = {
  kept: ClusterMember[];
  suppressed: ClusterMember[];
  clusters: {
    id: string;
    representativeId: string;
    size: number;
    memberIds: string[];
  }[];
};

/** Build compact token signature per Master Prompt rules. */
export function buildSignature(item: Clusterable): Set<string> {
  const parts = [
    item.name || "",
    item.summary || "",
    ...(item.topics || []),
    item.eventType || "",
    item.organizerName || "",
  ];
  const text = parts.join(" ").toLowerCase();

  // remove punctuation, normalize simple accents
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

  const tokens = normalized
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4)
    .filter((t) => !STOPWORDS.has(t))
    // drop pure numbers / date-like
    .filter((t) => !/^\d+$/.test(t) && !/^\d{4}$/.test(t))
    // simple singular: drop trailing s if length > 4
    .map((t) => (t.endsWith("s") && t.length > 4 && !t.endsWith("ss") ? t.slice(0, -1) : t));

  const unique = [...new Set(tokens)].slice(0, 80);
  return new Set(unique);
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function normalizeUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, "");
  }
}

function sortCandidates(items: Clusterable[]): Clusterable[] {
  return [...items].sort((a, b) => {
    const d = (b.desirabilityScore ?? 0) - (a.desirabilityScore ?? 0);
    if (d) return d;
    const q = (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
    if (q) return q;
    const r = (b.rarityScore ?? 0) - (a.rarityScore ?? 0);
    if (r) return r;
    const act = (b.activityRecency ?? 0) - (a.activityRecency ?? 0);
    if (act) return act;
    const pop = (a.popularity ?? 0) - (b.popularity ?? 0);
    if (pop) return pop;
    return a.id.localeCompare(b.id);
  });
}

export type ClusterOptions = {
  similarityThreshold?: number;
  maxPerCluster?: number;
};

/**
 * Online clustering with suppression.
 * - Exact ID and canonical URL dedupe first
 * - Jaccard on signatures
 * - Keep strongest first; suppress beyond maxPerCluster
 */
export function clusterAndSuppress(
  items: Clusterable[],
  options: ClusterOptions = {}
): ClusterResult {
  const threshold = Math.min(
    MAX_SIMILARITY_THRESHOLD,
    Math.max(MIN_SIMILARITY_THRESHOLD, options.similarityThreshold ?? SIMILARITY_THRESHOLD)
  );
  const maxPer = options.maxPerCluster ?? MAX_PER_CLUSTER;

  const sorted = sortCandidates(items);
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();

  type InternalCluster = {
    id: string;
    representative: Clusterable;
    signature: Set<string>;
    members: ClusterMember[];
  };

  const clusters: InternalCluster[] = [];
  const kept: ClusterMember[] = [];
  const suppressed: ClusterMember[] = [];

  for (const item of sorted) {
    // Exact ID
    if (seenIds.has(item.id)) {
      suppressed.push({
        ...item,
        clusterId: "dup-id",
        clusterRank: 0,
        clusterSize: 0,
        status: "suppressed",
      });
      continue;
    }
    seenIds.add(item.id);

    // Canonical URL
    const urlKey = normalizeUrl(item.officialUrl);
    if (urlKey && seenUrls.has(urlKey)) {
      suppressed.push({
        ...item,
        clusterId: "dup-url",
        clusterRank: 0,
        clusterSize: 0,
        status: "suppressed",
      });
      continue;
    }
    if (urlKey) seenUrls.add(urlKey);

    const sig = buildSignature(item);
    if (sig.size < MIN_SIGNATURE_TOKENS) {
      // Too thin to cluster confidently — keep as unclustered
      const member: ClusterMember = {
        ...item,
        clusterId: `solo-${item.id}`,
        clusterRank: 1,
        clusterSize: 1,
        status: "unclustered",
      };
      kept.push(member);
      continue;
    }

    let matched: InternalCluster | null = null;
    let bestSim = 0;

    for (const cluster of clusters) {
      const sim = jaccard(sig, cluster.signature);
      if (sim >= threshold && sim > bestSim) {
        bestSim = sim;
        matched = cluster;
      }
    }

    if (matched) {
      const rank = matched.members.length + 1;
      if (matched.members.length >= maxPer) {
        suppressed.push({
          ...item,
          clusterId: matched.id,
          clusterRank: rank,
          clusterSize: matched.members.length + 1,
          status: "suppressed",
          similarityToRep: bestSim,
        });
        // still reflect size growth for logging
        matched.members.push({
          ...item,
          clusterId: matched.id,
          clusterRank: rank,
          clusterSize: rank,
          status: "suppressed",
          similarityToRep: bestSim,
        });
      } else {
        const member: ClusterMember = {
          ...item,
          clusterId: matched.id,
          clusterRank: rank,
          clusterSize: rank,
          status: rank === 1 ? "representative" : "kept-related",
          similarityToRep: bestSim,
        };
        matched.members.push(member);
        kept.push(member);
      }
    } else {
      const clusterId = `cluster-${clusters.length + 1}-${item.id.slice(0, 8)}`;
      const member: ClusterMember = {
        ...item,
        clusterId,
        clusterRank: 1,
        clusterSize: 1,
        status: "representative",
      };
      clusters.push({
        id: clusterId,
        representative: item,
        signature: sig,
        members: [member],
      });
      kept.push(member);
    }
  }

  // Finalize cluster sizes on kept members
  const sizeByCluster = new Map<string, number>();
  for (const c of clusters) {
    sizeByCluster.set(c.id, c.members.length);
  }
  for (const m of kept) {
    if (sizeByCluster.has(m.clusterId)) {
      m.clusterSize = sizeByCluster.get(m.clusterId)!;
    }
  }

  return {
    kept,
    suppressed: suppressed.filter((s) => s.status === "suppressed"),
    clusters: clusters.map((c) => ({
      id: c.id,
      representativeId: c.representative.id,
      size: c.members.length,
      memberIds: c.members.map((m) => m.id),
    })),
  };
}
