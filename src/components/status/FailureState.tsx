type Props = {
  title: string;
  body: string;
  lastGoodDate?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "calm" | "warning";
};

export function FailureState({
  title,
  body,
  lastGoodDate,
  actionLabel,
  onAction,
  tone = "calm",
}: Props) {
  const border =
    tone === "warning" ? "var(--warning)" : "var(--border-subtle)";

  return (
    <div
      role="status"
      style={{
        padding: "var(--space-5)",
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-md)",
        background: "var(--surface-subtle)",
        maxWidth: 560,
        margin: "var(--space-6) auto",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{title}</h2>
      <p style={{ margin: "10px 0 0", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
        {body}
      </p>
      {lastGoodDate && (
        <p className="mono" style={{ margin: "10px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
          Last successful data: {lastGoodDate}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: "var(--space-4)" }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
