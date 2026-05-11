/**
 * Flag component — consistent SVG rendering across iOS / Android / Windows.
 *
 * Backed by Twemoji's SVG flags via jsDelivr CDN. Falls back to the unicode
 * emoji if the SVG fails to load (so users with no images still see a flag).
 *
 * Why not bundle 250 SVGs locally? They'd add ~200 KB even gzipped and
 * jsDelivr's CDN is fast everywhere we serve. If a deploy needs offline
 * assets, swap the URL builder for a local /flags/ path.
 */

const TWEMOJI_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg";

const A_REGIONAL = 0x1f1e6;
const A_LATIN = "A".charCodeAt(0);

function codepointPair(iso2: string): string | null {
  const upper = iso2.toUpperCase();
  if (upper.length !== 2) return null;
  const c1 = A_REGIONAL + (upper.charCodeAt(0) - A_LATIN);
  const c2 = A_REGIONAL + (upper.charCodeAt(1) - A_LATIN);
  return `${c1.toString(16)}-${c2.toString(16)}`;
}

export function Flag({
  iso2,
  size = 20,
  className = "",
}: {
  iso2: string;
  /** Pixel height. Width auto from the SVG aspect ratio. */
  size?: number;
  className?: string;
}) {
  const pair = codepointPair(iso2);
  if (!pair) {
    return <span className={className} aria-hidden>🏳️</span>;
  }

  return (
    <img
      src={`${TWEMOJI_CDN}/${pair}.svg`}
      alt={`${iso2.toUpperCase()} flag`}
      width={Math.round(size * 1.5)}
      height={size}
      style={{ height: size, width: "auto", display: "inline-block", verticalAlign: "-0.15em" }}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
