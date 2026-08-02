type Props = {
  search: string;
  onSearch: (v: string) => void;
  topic: string;
  onTopic: (v: string) => void;
  topics: string[];
  format: string;
  onFormat: (v: string) => void;
  rarityMode: string;
  onRarityMode: (v: string) => void;
};

export function FeedFilters({
  search,
  onSearch,
  topic,
  onTopic,
  topics,
  format,
  onFormat,
  rarityMode,
  onRarityMode,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        marginBottom: "var(--space-5)",
      }}
    >
      <input
        type="search"
        placeholder="Search name, summary, topics…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search opportunities"
        style={{
          flex: "1 1 200px",
          minWidth: 180,
          background: "var(--surface-primary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: "14px",
        }}
      />
      <select
        value={topic}
        onChange={(e) => onTopic(e.target.value)}
        aria-label="Filter by topic"
        style={selectStyle}
      >
        <option value="">All topics</option>
        {topics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={format}
        onChange={(e) => onFormat(e.target.value)}
        aria-label="Filter by format"
        style={selectStyle}
      >
        <option value="">All formats</option>
        <option value="online">Online</option>
        <option value="in-person">In-person</option>
        <option value="hybrid">Hybrid</option>
        <option value="cruise">Cruise</option>
      </select>
      <select
        value={rarityMode}
        onChange={(e) => onRarityMode(e.target.value)}
        aria-label="Rarity mode"
        style={selectStyle}
      >
        <option value="balanced">Balanced</option>
        <option value="rarer">Prefer rarer</option>
        <option value="quality">Prefer quality</option>
      </select>
    </div>
  );
}

const selectStyle: Record<string, string | number> = {
  background: "var(--surface-primary)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  padding: "10px 12px",
  color: "var(--text-primary)",
  fontSize: "13px",
};
