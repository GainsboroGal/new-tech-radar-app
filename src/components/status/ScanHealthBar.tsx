import { ScanMeta } from "../../domain/opportunity";

type Props = {
  meta: ScanMeta;
  source: "live" | "seed" | "emergency";
  count: number;
};

export function ScanHealthBar({ meta, source, count }: Props) {
  const statusColor =
    meta.status === "ok"
      ? "var(--success)"
      : meta.status === "partial"
        ? "var(--warning)"
        : meta.status === "failed"
          ? "var(--error)"
          : "var(--text-muted)";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        alignItems: "center",
        fontSize: "12px",
        color: "var(--text-muted)",
      }}
    >
      <span className="mono">
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: statusColor,
            marginRight: 6,
          }}
        />
        {meta.lastScan
          ? `Last scan ${new Date(meta.lastScan).toLocaleString()}`
          : "No automated scan yet"}
      </span>
      <span className="mono">
        {count} shown
        {meta.examined > 0 && ` · examined ${meta.examined}`}
        {meta.kept > 0 && ` · kept ${meta.kept}`}
        {meta.suppressed > 0 && ` · suppressed ${meta.suppressed}`}
      </span>
      <span className="mono">source: {source}</span>
      {meta.partial && <span style={{ color: "var(--warning)" }}>partial scan</span>}
      {meta.message && (
        <span style={{ color: "var(--text-secondary)", maxWidth: 420 }}>{meta.message}</span>
      )}
    </div>
  );
}
