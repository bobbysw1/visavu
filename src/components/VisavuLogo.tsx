/**
 * Visavu mark + wordmark.
 *
 * The mark is a tilted oval stamp — real visa stamps are oval, not circular,
 * and the tilt makes it feel applied to a passport rather than placed.
 *
 * Inside the stamp: a "VU" monogram (the French "vu" = "seen", which is the
 * whole product — we show what each country has seen and approved).
 *
 * Two concentric dashed rings give the postmark depth without needing a
 * raster texture.
 *
 * The mark and wordmark use a shared `currentColor`, so callers can re-tint
 * the entire logo by setting a single Tailwind text-color class on the
 * wrapper. Default colourway via the `tone` prop:
 *   - "brand" (default): emerald mark + foreground-text wordmark
 *   - "mono": both pieces inherit currentColor (favicon / single-colour use)
 */
export function VisavuLogo({
  size = 28,
  className = "",
  showWordmark = true,
  wordmarkClassName = "",
  tone = "brand",
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  tone?: "brand" | "mono";
}) {
  const markColor =
    tone === "mono"
      ? "text-current"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <span
      className={`inline-flex items-baseline gap-1.5 leading-none ${className}`}
      aria-label="Visavu"
    >
      <svg
        width={size * 1.15}
        height={size}
        viewBox="0 0 36 32"
        fill="none"
        aria-hidden="true"
        className={`${markColor} shrink-0 self-center -translate-y-[0.5px]`}
      >
        <g transform="rotate(-10 18 16)">
          {/* Outer dashed ring — the visa-stamp postmark. */}
          <ellipse
            cx="18"
            cy="16"
            rx="14.5"
            ry="10.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="2.2 1.8"
          />
          {/* Inner dashed ring — adds postmark layering. */}
          <ellipse
            cx="18"
            cy="16"
            rx="10.5"
            ry="7"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="1 1.6"
            opacity="0.55"
          />
          {/* VU monogram inside. SVG <text> with a tight letter-spacing reads
              as a stamp impression rather than a typographic label. */}
          <text
            x="18"
            y="19.4"
            fontSize="9"
            fontWeight="800"
            textAnchor="middle"
            fill="currentColor"
            letterSpacing="-0.04em"
            fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          >
            VU
          </text>
        </g>
      </svg>
      {showWordmark && (
        <span
          className={`font-bold tracking-tight text-[1.05em] ${wordmarkClassName}`}
        >
          visavu
        </span>
      )}
    </span>
  );
}
