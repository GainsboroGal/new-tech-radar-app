import { Opportunity } from "../../domain/opportunity";

type Props = {
  opportunity: Opportunity;
  size?: number;
};

export function SignalRing({ opportunity, size = 40 }: Props) {
  const { qualityScore, rarityScore, desirabilityScore } = opportunity.scoring;
  const verified =
    opportunity.verification.status === "verified" ||
    opportunity.verification.status === "partially-verified";

  const composite = Math.round(
    qualityScore * 0.35 + rarityScore * 0.25 + desirabilityScore * 0.4
  );

  let label = "Developing signal";
  if (composite >= 80 && verified) label = "Strong signal";
  else if (composite >= 65) label = "Balanced signal";

  const stroke = Math.max(2, size * 0.08);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (composite / 100) * c;

  return (
    <div
      role="img"
      aria-label={`${label}. Composite indicator ${composite} of 100 based on quality, rarity and desirability. Verification: ${opportunity.verification.status}.`}
      title={label}
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 150ms ease" }}
        />
      </svg>
      <span
        className="mono"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.22,
          color: "var(--text-muted)",
        }}
      >
        {composite}
      </span>
    </div>
  );
}
