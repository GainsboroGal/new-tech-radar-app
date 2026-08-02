import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "../hooks/useDataset";
import { useShortlist } from "../hooks/useShortlist";
import { AppHeader } from "../components/layout/AppHeader";
import { deadlineLabel } from "../domain/dates";
import { Opportunity } from "../domain/opportunity";

const COMPARE_KEY = "ntr-compare";

function readCompare(): string[] {
  try {
    const raw = sessionStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCompare(ids: string[]) {
  sessionStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, 4)));
}

export function useCompareSelection() {
  const [ids, setIds] = useState<string[]>(() => readCompare());

  const toggle = (id: string) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id];
      writeCompare(next);
      return next;
    });
  };

  const clear = () => {
    writeCompare([]);
    setIds([]);
  };

  return { ids, toggle, clear, count: ids.length, isComparing: (id: string) => ids.includes(id) };
}

function cell(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  }
  return <>{value}</>;
}

export function ComparePage() {
  const { dataset, loading } = useDataset();
  const { count: shortlistCount } = useShortlist();
  const { ids, clear } = useCompareSelection();
  const navigate = useNavigate();

  const items: Opportunity[] = useMemo(() => {
    if (!dataset) return [];
    return ids
      .map((id) => dataset.opportunities.find((o) => o.id === id))
      .filter(Boolean) as Opportunity[];
  }, [dataset, ids]);

  return (
    <>
      <AppHeader shortlistCount={shortlistCount} compareCount={ids.length} />
      <main className="page">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "var(--space-5)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>Compare</h1>
          {ids.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={clear}>
              Clear comparison
            </button>
          )}
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}

        {!loading && items.length < 2 && (
          <p style={{ color: "var(--text-muted)", padding: "var(--space-8) 0", textAlign: "center" }}>
            Select at least two opportunities from Discover (Compare button) to compare them side by
            side. Maximum four.
          </p>
        )}

        {items.length >= 2 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Field</th>
                  {items.map((o) => (
                    <th key={o.id} style={thStyle}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: 0, fontWeight: 600, textAlign: "left" }}
                        onClick={() => navigate(`/opportunity/${o.id}`)}
                      >
                        {o.name}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Format" values={items.map((o) => o.location.format)} />
                <Row label="Location" values={items.map((o) => o.location.city || o.location.country)} />
                <Row label="Nearest deadline" values={items.map((o) => deadlineLabel(o) || "—")} />
                <Row label="Pricing" values={items.map((o) => o.pricing.displayText)} />
                <Row label="Verification" values={items.map((o) => o.verification.status)} />
                <Row
                  label="Quality / Rarity"
                  values={items.map(
                    (o) => `${o.scoring.qualityScore} / ${o.scoring.rarityScore}`
                  )}
                />
                <Row
                  label="Why uncommon"
                  values={items.map((o) => o.rationale.whyRelativelyUncommon)}
                />
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

function Row({ label, values }: { label: string; values: (string | number | null | undefined)[] }) {
  return (
    <tr>
      <th
        scope="row"
        style={{
          ...thStyle,
          textAlign: "left",
          color: "var(--text-muted)",
          fontWeight: 500,
          width: 140,
        }}
      >
        {label}
      </th>
      {values.map((v, i) => (
        <td
          key={i}
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border-subtle)",
            verticalAlign: "top",
            lineHeight: 1.45,
            color: "var(--text-primary)",
          }}
        >
          {cell(v)}
        </td>
      ))}
    </tr>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid var(--border-strong)",
  textAlign: "left",
  fontWeight: 600,
  color: "var(--text-secondary)",
};
