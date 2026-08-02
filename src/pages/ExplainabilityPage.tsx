import { AppHeader } from "../components/layout/AppHeader";
import { useShortlist } from "../hooks/useShortlist";

export function ExplainabilityPage() {
  const { count } = useShortlist();

  return (
    <>
      <AppHeader shortlistCount={count} />
      <main className="page" style={{ maxWidth: 720 }}>
        <h1 style={{ marginTop: 0, fontSize: "28px" }}>How this works</h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
          New Tech Radar helps you discover and act on unusually worthwhile opportunities before
          registration or pricing deadlines pass. It is a curated, static-first directory — not a
          live crawl of the entire internet.
        </p>

        <h2 className="section-title">What we look for</h2>
        <ul style={{ lineHeight: 1.7, color: "var(--text-secondary)" }}>
          <li>Public information only (no passwords or private groups)</li>
          <li>Clear organizer and purpose</li>
          <li>Future or active dates with meaningful description</li>
          <li>Evidence of registration or announcement</li>
        </ul>

        <h2 className="section-title">Quality before rarity</h2>
        <p style={{ lineHeight: 1.65, color: "var(--text-secondary)" }}>
          Every candidate must pass a quality gate (public access, identifiable organizer, real
          dates, non-empty program information). Only then is relative rarity considered. Rarity is
          a transparent heuristic, not a scientific measure of uniqueness.
        </p>

        <h2 className="section-title">Cluster suppression</h2>
        <p style={{ lineHeight: 1.65, color: "var(--text-secondary)" }}>
          Similar opportunities are grouped. By default at most three from the same cluster appear.
          The strongest candidates (by desirability, then quality, then rarity) are kept; near-copies
          are suppressed so the feed stays high-signal.
        </p>

        <h2 className="section-title">Signal Ring</h2>
        <p style={{ lineHeight: 1.65, color: "var(--text-secondary)" }}>
          The ring is a simple composite of quality, rarity and desirability scores plus verification
          state. Labels such as "Strong signal" or "Balanced signal" are interpretive, not precise
          rankings. Always read the written rationale and check official sources.
        </p>

        <h2 className="section-title">Scan health</h2>
        <p style={{ lineHeight: 1.65, color: "var(--text-secondary)" }}>
          The header shows the last successful data refresh, whether a scan was partial, and how many
          items were examined, kept or suppressed. If automation fails, you still see the last good
          dataset with a clear status message.
        </p>

        <h2 className="section-title">What this product does not claim</h2>
        <ul style={{ lineHeight: 1.7, color: "var(--text-secondary)" }}>
          <li>It does not find every opportunity worldwide</li>
          <li>It does not search all of GitHub or every Netlify site</li>
          <li>It does not establish objective uniqueness</li>
          <li>It does not guarantee pricing or deadlines will not change</li>
          <li>It does not endorse organizers or provide professional advice</li>
          <li>It never accesses private or password-protected resources</li>
        </ul>

        <p style={{ marginTop: "var(--space-6)", fontSize: "13px", color: "var(--text-muted)" }}>
          Always verify details on the official site before registering or paying.
        </p>
      </main>
    </>
  );
}
