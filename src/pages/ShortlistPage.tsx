import { useNavigate } from "react-router-dom";
import { useDataset } from "../hooks/useDataset";
import { useShortlist } from "../hooks/useShortlist";
import { OpportunityCard } from "../components/opportunity/OpportunityCard";
import { AppHeader } from "../components/layout/AppHeader";

export function ShortlistPage() {
  const { dataset, loading } = useDataset();
  const { ids, isSaved, toggle, clear, count } = useShortlist();
  const navigate = useNavigate();

  const items =
    dataset?.opportunities.filter((o) => ids.includes(o.id) && o.lifecycle === "published") ?? [];

  return (
    <>
      <AppHeader shortlistCount={count} />
      <main className="page">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "var(--space-5)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>Shortlist</h1>
          {count > 0 && (
            <button type="button" className="btn btn-ghost" onClick={clear}>
              Clear all
            </button>
          )}
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}

        {!loading && items.length === 0 && (
          <p style={{ color: "var(--text-muted)", padding: "var(--space-8) 0", textAlign: "center" }}>
            No saved opportunities yet. Save items from Discover to build your shortlist.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gap: "var(--space-4)",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {items.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              saved={isSaved(opp.id)}
              onToggleSave={toggle}
              onOpen={(id) => navigate(`/opportunity/${id}`)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
