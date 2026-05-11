/**
 * Country silhouette — outline cut-out of the country shape.
 *
 * Sourced from the open-source `djaiss/mapsicon` library
 * (CC-BY 4.0 licensed), served via jsDelivr's GitHub CDN. One SVG per
 * country, ISO 3166-1 alpha-2 keyed.
 *
 *   https://cdn.jsdelivr.net/gh/djaiss/mapsicon@master/all/{iso-lower}/vector.svg
 *
 * Renders as a plain `<img>` with `currentColor` inheritance impossible
 * (the SVGs are pre-styled), so we instead use object-fit + an opacity
 * filter to tint them to the section's surface palette.
 *
 * For countries not in mapsicon (a handful of small territories), the
 * component renders nothing — callers should fall back to the flag.
 */

const NOT_IN_MAPSICON = new Set([
  "AX", "BV", "HM", "GS", "SJ", "UM", "TF", "BQ", "CW", "SX",
]);

export function CountrySilhouette({
  iso2,
  size = 200,
  className = "",
  tone = "default",
}: {
  iso2: string;
  size?: number;
  className?: string;
  /** "default" = dark slate fill; "accent" = emerald; "muted" = light grey. */
  tone?: "default" | "accent" | "muted";
}) {
  const lower = iso2.toLowerCase();
  if (NOT_IN_MAPSICON.has(iso2.toUpperCase())) return null;

  const filterClass =
    tone === "accent"
      ? "invert-[60%] sepia-[60%] saturate-[5] hue-rotate-[100deg]"
      : tone === "muted"
        ? "opacity-30"
        : "opacity-90";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.jsdelivr.net/gh/djaiss/mapsicon@master/all/${lower}/vector.svg`}
      alt={`${iso2.toUpperCase()} country outline`}
      width={size}
      height={size}
      className={`${className} ${filterClass}`}
      loading="lazy"
      decoding="async"
      style={{ objectFit: "contain" }}
    />
  );
}
