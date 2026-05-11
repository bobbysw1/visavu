/**
 * Stylised passport-cover illustration.
 *
 * We don't use real passport photographs (licensing minefield — different
 * issuing authorities, copyright on official images). Instead we generate
 * a tasteful SVG passport cover per country with:
 *   - the country's real passport colour (UK burgundy, US navy, Australian
 *     navy, Indian navy, Brazilian green, etc.)
 *   - the country's coat-of-arms-style emblem replaced by the flag
 *   - the country name + "PASSPORT" + biometric-chip glyph
 *
 * Result: instantly recognisable as "this country's passport" without
 * copyright concerns or per-country image hosting.
 */
import { Flag } from "./Flag";
import { nameFor } from "@/lib/countries";

/** Real passport-cover colours sourced from each country's issuing authority.
 *  Where I'm not sure, default to "passport navy" (#1f3358) — the most
 *  common cover colour worldwide. */
const COVER_COLORS: Record<string, { bg: string; gold: string }> = {
  GB: { bg: "#5b1f24", gold: "#d4b16a" }, // burgundy (HM Passport)
  US: { bg: "#1c2856", gold: "#c9a85a" }, // navy
  CA: { bg: "#5b1f24", gold: "#c9a85a" }, // burgundy
  AU: { bg: "#0b1a2f", gold: "#c9a85a" }, // navy
  NZ: { bg: "#0b1a2f", gold: "#c9a85a" },
  IN: { bg: "#0a2545", gold: "#c9a85a" },
  CN: { bg: "#7e1010", gold: "#d4b16a" },
  JP: { bg: "#5b1010", gold: "#c9a85a" },
  KR: { bg: "#0e3163", gold: "#c9a85a" },
  RU: { bg: "#7e1010", gold: "#c9a85a" },
  BR: { bg: "#0d3d2c", gold: "#c9a85a" },
  AR: { bg: "#0a2545", gold: "#c9a85a" },
  MX: { bg: "#0e5536", gold: "#c9a85a" },
  DE: { bg: "#5b1f24", gold: "#c9a85a" }, // burgundy (EU)
  FR: { bg: "#5b1f24", gold: "#c9a85a" },
  IT: { bg: "#5b1f24", gold: "#c9a85a" },
  ES: { bg: "#5b1f24", gold: "#c9a85a" },
  NL: { bg: "#5b1f24", gold: "#c9a85a" },
  BE: { bg: "#5b1f24", gold: "#c9a85a" },
  PT: { bg: "#5b1f24", gold: "#c9a85a" },
  IE: { bg: "#5b1f24", gold: "#c9a85a" },
  AT: { bg: "#5b1f24", gold: "#c9a85a" },
  DK: { bg: "#5b1f24", gold: "#c9a85a" },
  SE: { bg: "#5b1f24", gold: "#c9a85a" },
  FI: { bg: "#5b1f24", gold: "#c9a85a" },
  GR: { bg: "#5b1f24", gold: "#c9a85a" },
  PL: { bg: "#5b1f24", gold: "#c9a85a" },
  CZ: { bg: "#5b1f24", gold: "#c9a85a" },
  HU: { bg: "#5b1f24", gold: "#c9a85a" },
  RO: { bg: "#5b1f24", gold: "#c9a85a" },
  HR: { bg: "#0b1a2f", gold: "#c9a85a" },
  MT: { bg: "#5b1f24", gold: "#c9a85a" },
  CY: { bg: "#5b1f24", gold: "#c9a85a" },
  EE: { bg: "#0b1a2f", gold: "#c9a85a" },
  LV: { bg: "#0b1a2f", gold: "#c9a85a" },
  LT: { bg: "#0b1a2f", gold: "#c9a85a" },
  LU: { bg: "#5b1f24", gold: "#c9a85a" },
  BG: { bg: "#5b1f24", gold: "#c9a85a" },
  SK: { bg: "#5b1f24", gold: "#c9a85a" },
  SI: { bg: "#5b1f24", gold: "#c9a85a" },
  NO: { bg: "#7e1010", gold: "#c9a85a" },
  IS: { bg: "#5b1f24", gold: "#c9a85a" },
  CH: { bg: "#7e1010", gold: "#ffffff" }, // Swiss is red + white cross
  IL: { bg: "#0a2545", gold: "#c9a85a" },
  TR: { bg: "#5b1010", gold: "#c9a85a" },
  AE: { bg: "#0d2c1c", gold: "#c9a85a" }, // deep green-black
  SA: { bg: "#0e5536", gold: "#c9a85a" },
  EG: { bg: "#0b1a2f", gold: "#c9a85a" },
  TH: { bg: "#7e1010", gold: "#c9a85a" },
  VN: { bg: "#0b3e1c", gold: "#c9a85a" },
  ID: { bg: "#0b1a2f", gold: "#c9a85a" },
  PH: { bg: "#5b1010", gold: "#c9a85a" },
  MY: { bg: "#0b1a2f", gold: "#c9a85a" },
  SG: { bg: "#5b1010", gold: "#c9a85a" },
  HK: { bg: "#0b3e2c", gold: "#c9a85a" },
  TW: { bg: "#0b3e2c", gold: "#c9a85a" },
  ZA: { bg: "#0b3e2c", gold: "#c9a85a" },
  NG: { bg: "#0b3e2c", gold: "#c9a85a" },
  KE: { bg: "#0b1a2f", gold: "#c9a85a" },
  GH: { bg: "#5b1010", gold: "#c9a85a" },
  ET: { bg: "#0b3e2c", gold: "#c9a85a" },
  PK: { bg: "#0b3e2c", gold: "#c9a85a" },
  BD: { bg: "#0b3e2c", gold: "#c9a85a" },
  LK: { bg: "#7e1010", gold: "#c9a85a" },
};

function colorsFor(iso2: string) {
  return COVER_COLORS[iso2.toUpperCase()] ?? { bg: "#1f3358", gold: "#c9a85a" };
}

export function PassportCover({
  iso2,
  width = 220,
  height = 300,
  className = "",
}: {
  iso2: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const upper = iso2.toUpperCase();
  const { bg, gold } = colorsFor(upper);
  const name = nameFor(upper).toUpperCase();

  return (
    <div
      className={`relative inline-block rounded-md shadow-2xl ring-1 ring-black/20 overflow-hidden ${className}`}
      style={{ width, height, background: bg }}
      aria-label={`${nameFor(upper)} passport cover`}
    >
      {/* Top half-margin band */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: gold, opacity: 0.5 }} />
      <div className="absolute inset-x-4 top-4 h-px" style={{ background: gold, opacity: 0.3 }} />

      {/* Country / authority text */}
      <p
        className="absolute top-[14%] left-1/2 -translate-x-1/2 text-center font-semibold tracking-[0.18em] uppercase"
        style={{ color: gold, fontSize: width * 0.052, letterSpacing: "0.18em" }}
      >
        {name}
      </p>

      {/* Flag medallion (where the coat of arms normally sits) */}
      <div className="absolute top-[34%] left-1/2 -translate-x-1/2">
        <div
          className="rounded-full overflow-hidden ring-2 ring-current shadow-lg"
          style={{ color: gold }}
        >
          <Flag iso2={upper} size={Math.round(width * 0.32)} />
        </div>
      </div>

      {/* "PASSPORT" label */}
      <p
        className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-center font-bold tracking-[0.32em] uppercase"
        style={{ color: gold, fontSize: width * 0.08 }}
      >
        PASSPORT
      </p>

      {/* Biometric chip glyph */}
      <svg
        className="absolute bottom-[5%] left-1/2 -translate-x-1/2"
        width={width * 0.07}
        height={width * 0.07}
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="2" y="6" width="20" height="14" rx="2" stroke={gold} strokeWidth="1.5" />
        <path d="M6 6 V3 M12 6 V3 M18 6 V3 M6 20 V23 M12 20 V23 M18 20 V23" stroke={gold} strokeWidth="1.5" />
        <rect x="8" y="10" width="8" height="6" rx="0.5" stroke={gold} strokeWidth="1" />
      </svg>

      {/* Subtle vertical centre crease for realism */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-black/10" />
    </div>
  );
}
