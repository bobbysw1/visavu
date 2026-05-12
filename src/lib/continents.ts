/**
 * Continent groupings for visa-result organisation.
 *
 * Seven continent buckets (Europe / Asia / North America / South America /
 * Africa / Oceania / Middle East) split from the wider Americas grouping
 * used by the heat-map. Each iso2 lives in exactly one continent.
 *
 * `continentFor(iso2)` returns `null` for territories not on the list —
 * the caller should fall back to "Other" or drop the row.
 */

export type Continent =
  | "europe"
  | "asia"
  | "north_america"
  | "south_america"
  | "africa"
  | "oceania"
  | "middle_east";

export const CONTINENT_ORDER: Continent[] = [
  "europe",
  "asia",
  "north_america",
  "south_america",
  "africa",
  "oceania",
  "middle_east",
];

export const CONTINENT_LABEL: Record<Continent, string> = {
  europe: "Europe",
  asia: "Asia",
  north_america: "North America",
  south_america: "South America",
  africa: "Africa",
  oceania: "Oceania",
  middle_east: "Middle East",
};

const CONTINENT_CODES: Record<Continent, string[]> = {
  europe: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
    "PT", "RO", "SK", "SI", "ES", "SE", "CH", "GB", "AL", "AD", "BA", "MK",
    "MC", "ME", "RS", "SM", "VA", "MD", "UA", "BY", "RU", "TR", "XK", "GI",
    "FO", "JE", "GG", "IM",
  ],
  asia: [
    "CN", "JP", "KR", "KP", "HK", "MO", "TW", "MN",
    "IN", "PK", "BD", "LK", "NP", "BT", "MV", "AF",
    "TH", "VN", "ID", "MY", "SG", "PH", "MM", "KH", "LA", "BN", "TL",
    "KZ", "UZ", "TM", "TJ", "KG", "AZ", "AM", "GE",
  ],
  north_america: [
    "US", "CA", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA",
    "CU", "DO", "HT", "JM", "BS", "BB", "TT", "AG", "DM", "GD", "KN", "LC", "VC",
    "PR", "GL", "AI", "AW", "BM", "BQ", "KY", "CW", "MQ", "MS", "SX", "TC", "VG", "VI",
  ],
  south_america: [
    "BR", "AR", "CL", "PE", "CO", "VE", "EC", "BO", "PY", "UY", "GY", "SR", "GF",
    "FK",
  ],
  africa: [
    "EG", "MA", "DZ", "TN", "LY", "SD", "SS",
    "NG", "GH", "CI", "SN", "BJ", "BF", "ML", "NE", "TG", "GM", "GW", "GN",
    "SL", "LR", "CV", "MR",
    "ET", "KE", "TZ", "UG", "RW", "BI", "DJ", "SO", "ER",
    "CM", "TD", "CF", "CG", "CD", "GA", "GQ", "ST", "AO",
    "ZA", "BW", "NA", "ZM", "ZW", "MZ", "MW", "MG", "MU", "SC", "KM", "LS", "SZ",
  ],
  oceania: [
    "AU", "NZ", "PG", "FJ", "WS", "TO", "VU", "SB", "KI", "MH", "FM", "NR", "PW", "TV",
    "CK", "NU", "AS", "GU", "MP", "NC", "PF", "TK", "WF",
  ],
  middle_east: [
    "SA", "AE", "QA", "BH", "KW", "OM", "IL", "JO", "LB", "SY", "IQ", "IR",
    "YE", "PS",
  ],
};

const ISO_TO_CONTINENT: Map<string, Continent> = (() => {
  const m = new Map<string, Continent>();
  for (const c of CONTINENT_ORDER) {
    for (const iso of CONTINENT_CODES[c]) m.set(iso, c);
  }
  return m;
})();

export function continentFor(iso2: string): Continent | null {
  return ISO_TO_CONTINENT.get(iso2.toUpperCase()) ?? null;
}
