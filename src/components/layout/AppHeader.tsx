import { Link, useLocation } from "react-router-dom";

type Props = {
  shortlistCount?: number;
  compareCount?: number;
};

export function AppHeader({ shortlistCount = 0, compareCount = 0 }: Props) {
  const loc = useLocation();

  const link = (to: string, label: string, badge?: number) => {
    const active = loc.pathname === to;
    return (
      <Link
        to={to}
        style={{
          color: active ? "var(--accent)" : "var(--text-secondary)",
          fontSize: "13px",
          fontWeight: active ? 600 : 400,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {label}
        {typeof badge === "number" && badge > 0 && (
          <span
            className="mono"
            style={{
              background: "var(--accent-muted)",
              color: "var(--accent)",
              fontSize: "11px",
              padding: "1px 6px",
              borderRadius: 999,
            }}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--surface-primary)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "var(--space-4) var(--space-5)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          alignItems: "center",
        }}
      >
        <div>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              New Tech Radar
            </h1>
          </Link>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
            Unusually worthwhile opportunities, before deadlines pass.
          </p>
        </div>
        <nav
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}
          aria-label="Main"
        >
          {link("/", "Discover")}
          {link("/shortlist", "Shortlist", shortlistCount)}
          {link("/compare", "Compare", compareCount)}
          {link("/how-it-works", "How this works")}
          {link("/admin", "Operator")}
        </nav>
      </div>
    </header>
  );
}
