import { useParams, Link } from "react-router-dom";
import { useDataset } from "../hooks/useDataset";
import { useShortlist } from "../hooks/useShortlist";
import { deadlineLabel, downloadIcs } from "../domain/dates";
import { SignalRing } from "../components/ui/SignalRing";
import { AppHeader } from "../components/layout/AppHeader";

export function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const { dataset, loading, error } = useDataset();
  const { isSaved, toggle, count } = useShortlist();

  if (loading) {
    return (
      <>
        <AppHeader shortlistCount={count} />
        <main className="page">Loading…</main>
      </>
    );
  }

  if (error || !dataset) {
    return (
      <>
        <AppHeader shortlistCount={count} />
        <main className="page" style={{ color: "var(--error)" }}>
          {error || "Unavailable"}
        </main>
      </>
    );
  }

  const opp = dataset.opportunities.find((o) => o.id === id);

  if (!opp) {
    return (
      <>
        <AppHeader shortlistCount={count} />
        <main className="page">
          <p>Opportunity not found.</p>
          <Link to="/">← Back to Discover</Link>
        </main>
      </>
    );
  }

  const deadline = deadlineLabel(opp);

  return (
    <>
      <AppHeader shortlistCount={count} />
      <main className="page" style={{ maxWidth: 720 }}>
        <p style={{ marginBottom: "var(--space-4)" }}>
          <Link to="/" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ← Discover
          </Link>
        </p>

        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
          <SignalRing opportunity={opp} size={56} />
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, lineHeight: 1.25 }}>
              {opp.name}
            </h1>
            <p className="mono" style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              {opp.verification.status}
              {opp.verification.lastVerifiedAt
                ? ` · last verified ${opp.verification.lastVerifiedAt.slice(0, 10)}`
                : ""}
            </p>
          </div>
        </div>

        <section style={{ marginTop: "var(--space-6)" }}>
          <h2 className="section-title">Summary</h2>
          <p style={{ lineHeight: 1.6 }}>{opp.summary}</p>
        </section>

        <section style={{ marginTop: "var(--space-5)" }}>
          <h2 className="section-title">Dates & deadlines</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2em", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {opp.dates.startDate && <li>Starts: {opp.dates.startDate}</li>}
            {opp.dates.endDate && <li>Ends: {opp.dates.endDate}</li>}
            {opp.dates.earlyBirdDeadline && <li>Early bird: {opp.dates.earlyBirdDeadline}</li>}
            {opp.dates.registrationDeadline && (
              <li>Registration closes: {opp.dates.registrationDeadline}</li>
            )}
            {deadline && <li style={{ color: "var(--accent)" }}>Nearest: {deadline}</li>}
          </ul>
        </section>

        <section style={{ marginTop: "var(--space-5)" }}>
          <h2 className="section-title">Pricing</h2>
          <p>{opp.pricing.displayText}</p>
          {opp.pricing.inclusions && (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Includes: {opp.pricing.inclusions.join(", ")}
            </p>
          )}
        </section>

        <section style={{ marginTop: "var(--space-5)" }}>
          <h2 className="section-title">Why it is relatively uncommon</h2>
          <p style={{ lineHeight: 1.6 }}>{opp.rationale.whyRelativelyUncommon}</p>
          <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
            <em>Why it stands out:</em> {opp.rationale.whyItStandsOut}
          </p>
        </section>

        <section style={{ marginTop: "var(--space-5)" }}>
          <h2 className="section-title">Evidence & verification</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Status: <strong style={{ color: "var(--text-primary)" }}>{opp.verification.status}</strong>
            {opp.verification.notes ? ` — ${opp.verification.notes}` : ""}
          </p>
          <p className="mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Sources: {opp.verification.sourceIds.join(", ") || "—"}
          </p>
        </section>

        <section
          style={{
            marginTop: "var(--space-6)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <a className="btn btn-primary" href={opp.links.official} target="_blank" rel="noopener noreferrer">
            Official site
          </a>
          {opp.links.registration && (
            <a
              className="btn btn-primary"
              href={opp.links.registration}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => toggle(opp.id)}>
            {isSaved(opp.id) ? "Remove from shortlist" : "Save to shortlist"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => downloadIcs(opp)}>
            Add to calendar
          </button>
        </section>
      </main>
    </>
  );
}
