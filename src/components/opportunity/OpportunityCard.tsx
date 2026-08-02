import { Opportunity } from "../../domain/opportunity";
import { deadlineLabel } from "../../domain/dates";
import { SignalRing } from "../ui/SignalRing";

type Props = {
  opportunity: Opportunity;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onOpen?: (id: string) => void;
  onCompareToggle?: (id: string) => void;
  comparing?: boolean;
};

export function OpportunityCard({
  opportunity: opp,
  saved,
  onToggleSave,
  onOpen,
  onCompareToggle,
  comparing,
}: Props) {
  const deadline = deadlineLabel(opp);

  return (
    <article
      style={{
        background: "var(--surface-primary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        transition: "border-color 120ms ease, transform 120ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
      }}
    >
      <header style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
        <SignalRing opportunity={opp} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 600, lineHeight: 1.35 }}>
            <button
              type="button"
              onClick={() => onOpen?.(opp.id)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--text-primary)",
                font: "inherit",
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {opp.name}
            </button>
          </h2>
          <p
            className="mono"
            style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}
          >
            {opp.verification.status}
            {opp.verification.lastVerifiedAt
              ? ` · verified ${opp.verification.lastVerifiedAt.slice(0, 10)}`
              : ""}
          </p>
        </div>
      </header>

      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
        {opp.location.format}
        {opp.location.city ? ` · ${opp.location.city}` : ""}
        {opp.location.country && opp.location.country !== "Global"
          ? ` · ${opp.location.country}`
          : opp.location.country === "Global"
            ? " · Global"
            : ""}
        {deadline ? ` · ${deadline}` : ""}
      </p>

      <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.55 }}>
        {opp.summary}
      </p>

      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        <strong style={{ color: "var(--text-primary)" }}>Why it stands out:</strong>{" "}
        {opp.rationale.whyItStandsOut}
      </p>

      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Relatively uncommon: {opp.rationale.whyRelativelyUncommon}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          alignItems: "center",
          marginTop: "var(--space-1)",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {opp.pricing.displayText}
        </span>
        {opp.topics.slice(0, 3).map((t) => (
          <span
            key={t}
            style={{
              fontSize: "11px",
              background: "var(--accent-muted)",
              color: "var(--accent)",
              padding: "2px 8px",
              borderRadius: "999px",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          marginTop: "var(--space-2)",
          paddingTop: "var(--space-3)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <button type="button" className="btn btn-ghost" onClick={() => onOpen?.(opp.id)}>
          Details
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onToggleSave?.(opp.id)}
          aria-pressed={saved}
        >
          {saved ? "Saved" : "Save"}
        </button>
        {onCompareToggle && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onCompareToggle(opp.id)}
            aria-pressed={comparing}
          >
            {comparing ? "Comparing" : "Compare"}
          </button>
        )}
        <a
          className="btn btn-ghost"
          href={opp.links.official}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official site
        </a>
      </div>
    </article>
  );
}
