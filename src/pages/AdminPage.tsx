import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/layout/AppHeader";
import { useShortlist } from "../hooks/useShortlist";

type ScanStatus = {
  lock: { scanId: string; acquiredAt: string; owner: string } | null;
  lastSuccess: Record<string, unknown> | null;
  currentVersion: string | null;
  opportunityCount: number;
  scanMeta: {
    lastScan: string | null;
    examined: number;
    kept: number;
    suppressed: number;
    partial: boolean;
    status: string;
    message?: string;
  } | null;
};

export function AdminPage() {
  const { count } = useShortlist();
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const urls = ["/api/scan-status", "/.netlify/functions/get-scan-status"];
    let lastErr = "No scan-status endpoint responded with JSON.";
    try {
      let data: ScanStatus | null = null;
      for (const url of urls) {
        try {
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          if (!res.ok) {
            lastErr = `Status ${res.status} from ${url}`;
            continue;
          }
          const text = await res.text();
          if (
            !text ||
            text.trimStart().startsWith("<!DOCTYPE") ||
            text.trimStart().startsWith("<html")
          ) {
            lastErr = "API returned HTML (function may not be deployed yet).";
            continue;
          }
          data = JSON.parse(text) as ScanStatus;
          break;
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "Parse error";
        }
      }
      if (!data) {
        setError(lastErr);
        setStatus(null);
      } else {
        setStatus(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load scan status");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <AppHeader shortlistCount={count} />
      <main className="page">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            marginBottom: "var(--space-5)",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "24px" }}>Operator console</h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
              Scan health and safe controls. Write actions require env secrets in production.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={load}>
            Refresh status
          </button>
        </div>

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading scan status…</p>}

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "var(--space-5)",
              padding: "var(--space-4)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-subtle)",
            }}
          >
            <strong style={{ color: "var(--warning)" }}>Status unavailable</strong>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
              {error} The public feed continues to use seed or emergency data.
            </p>
          </div>
        )}

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="section-title">Overview</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            <Stat label="Current version" value={status?.currentVersion ?? "—"} />
            <Stat label="Published count" value={String(status?.opportunityCount ?? "—")} />
            <Stat label="Scan status" value={status?.scanMeta?.status ?? "unknown"} />
            <Stat label="Lock" value={status?.lock ? `Held by ${status.lock.owner}` : "Free"} />
          </div>
          {status?.scanMeta?.message && (
            <p style={{ marginTop: "var(--space-3)", fontSize: "13px", color: "var(--text-secondary)" }}>
              {status.scanMeta.message}
            </p>
          )}
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="section-title">Kill switches</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Enforced via Netlify env: <span className="mono">ENABLE_AUTOMATED_SCANS</span>,{" "}
            <span className="mono">ENABLE_GITHUB_DISCOVERY</span>.
          </p>
        </section>

        <section>
          <h2 className="section-title">Links</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <Link to="/how-it-works" className="btn btn-ghost">
              Public explainability
            </Link>
            <Link to="/" className="btn btn-ghost">
              ← Public Discover
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--surface-primary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3) var(--space-4)",
      }}
    >
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)", wordBreak: "break-all" }}>
        {value}
      </div>
    </div>
  );
}
