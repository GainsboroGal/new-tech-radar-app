import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "../hooks/useDataset";
import { useShortlist } from "../hooks/useShortlist";
import { useCompareSelection } from "./ComparePage";
import { OpportunityCard } from "../components/opportunity/OpportunityCard";
import { FeedFilters } from "../components/filters/FeedFilters";
import { ScanHealthBar } from "../components/status/ScanHealthBar";
import { AppHeader } from "../components/layout/AppHeader";
import { Opportunity } from "../domain/opportunity";

function sortByMode(items: Opportunity[], mode: string): Opportunity[] {
  const copy = [...items];
  if (mode === "rarer") {
    copy.sort((a, b) => b.scoring.rarityScore - a.scoring.rarityScore);
  } else if (mode === "quality") {
    copy.sort((a, b) => b.scoring.qualityScore - a.scoring.qualityScore);
  } else {
    copy.sort((a, b) => b.scoring.desirabilityScore - a.scoring.desirabilityScore);
  }
  return copy;
}

export function DiscoverPage() {
  const { dataset, loading, error } = useDataset();
  const { isSaved, toggle, count } = useShortlist();
  const { toggle: toggleCompare, isComparing, count: compareCount } =
    useCompareSelection();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("");
  const [rarityMode, setRarityMode] = useState("balanced");

  const topics = useMemo(() => {
    if (!dataset) return [];
    const set = new Set<string>();
    dataset.opportunities.forEach((o) => o.topics.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [dataset]);

  const filtered = useMemo(() => {
    if (!dataset) return [];
    let list = dataset.opportunities.filter((o) => o.lifecycle === "published");

    if (topic) list = list.filter((o) => o.topics.includes(topic));
    if (format) list = list.filter((o) => o.location.format === format);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        const hay =
          `${o.name} ${o.summary} ${o.topics.join(" ")} ${o.rationale.whyItStandsOut}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const clusterCounts: Record<string, number> = {};
    list = list.filter((o) => {
      const cid = o.clustering.clusterId;
      if (!cid) return true;
      clusterCounts[cid] = (clusterCounts[cid] || 0) + 1;
      return clusterCounts[cid] <= 3;
    });

    return sortByMode(list, rarityMode);
  }, [dataset, search, topic, format, rarityMode]);

  return (
    <>
      <AppHeader shortlistCount={count} compareCount={compareCount} />
      <main className="page">
        <FeedFilters
          search={search}
          onSearch={setSearch}
          topic={topic}
          onTopic={setTopic}
          topics={topics}
          format={format}
          onFormat={setFormat}
          rarityMode={rarityMode}
          onRarityMode={setRarityMode}
        />

        {dataset && (
          <div style={{ marginBottom: "var(--space-5)" }}>
            <ScanHealthBar
              meta={dataset.scanMeta}
              source={dataset.source}
              count={filtered.length}
            />
          </div>
        )}

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading opportunities…</p>}
        {error && <p style={{ color: "var(--error)" }}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              padding: "var(--space-8) 0",
            }}
          >
            No matching opportunities. Try clearing filters or check back after the next scan.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gap: "var(--space-4)",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              saved={isSaved(opp.id)}
              onToggleSave={toggle}
              onOpen={(id) => navigate(`/opportunity/${id}`)}
              onCompareToggle={toggleCompare}
              comparing={isComparing(opp.id)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
