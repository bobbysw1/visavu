import { ISO_3166 } from "../seed/iso3166";

export type CountryRef = { iso2: string; name: string; flag: string };

// Regional Indicator Symbols. ISO alpha-2 → flag emoji.
// Two-letter codes that aren't real ISO (XK = Kosovo) still produce a valid emoji.
function flagFor(iso2: string): string {
  const upper = iso2.toUpperCase();
  if (upper.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const a = "A".charCodeAt(0);
  return String.fromCodePoint(A + (upper.charCodeAt(0) - a), A + (upper.charCodeAt(1) - a));
}

// Stable sorted list for dropdowns. Keep here so the UI doesn't need a DB roundtrip
// on first paint — the canonical ISO list is small (~250 entries) and stable.
export const COUNTRY_LIST: CountryRef[] = [...ISO_3166]
  .map(([iso2, , , name]) => ({ iso2, name, flag: flagFor(iso2) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function nameFor(iso2: string): string {
  const c = COUNTRY_LIST.find((x) => x.iso2 === iso2.toUpperCase());
  return c?.name ?? iso2.toUpperCase();
}

export function flagEmoji(iso2: string): string {
  return flagFor(iso2);
}

// ISO 3166-1 codes that do NOT issue passports — uninhabited territories,
// research stations, and dependencies whose residents travel on the
// administering country's passport. Generating /passport/[cc] for these
// produces fabricated thin content (Google "Crawled — currently not indexed"
// territory). Routes 410-Gone them; sitemap/internal-link callers must
// filter via `passportCountries()`.
export const NO_PASSPORT_CODES: ReadonlySet<string> = new Set([
  "AQ", // Antarctica — no civilian population, no passports
  "BV", // Bouvet Island — uninhabited (Norway)
  "HM", // Heard Island & McDonald Islands — uninhabited (Australia)
  "TF", // French Southern Territories — research stations only
  "UM", // US Minor Outlying Islands — no permanent residents
  "IO", // British Indian Ocean Territory — military only
  "GS", // South Georgia & South Sandwich — uninhabited
  "PN", // Pitcairn — UK BOTC, no own passport
  "BQ", // Bonaire, Sint Eustatius, Saba — Dutch passports
  "CC", // Cocos (Keeling) Islands — Australian
  "CX", // Christmas Island — Australian
  "NF", // Norfolk Island — Australian
  "SJ", // Svalbard & Jan Mayen — Norwegian
  "EH", // Western Sahara — disputed, no internationally recognized passport
]);

export function issuesPassport(iso2: string): boolean {
  return !NO_PASSPORT_CODES.has(iso2.toUpperCase());
}

/** Countries that issue passports — the canonical set for /passport/[iso]
 *  generation, /passport-rankings, the homepage popular grids, and the
 *  destination-page "all passports" list. */
export const PASSPORT_COUNTRIES: CountryRef[] = COUNTRY_LIST.filter((c) =>
  issuesPassport(c.iso2),
);

// High-traffic origins and destinations. Used for the home page "popular routes"
// grid and as the first ~500 hand-curated SEO pages (top 25 origins × top 20 dests).
// Ordered roughly by global outbound travel volume (UNWTO + airline reports).
export const TOP_ORIGINS: string[] = [
  "US", "GB", "DE", "CA", "AU", "FR", "IT", "ES", "NL", "JP",
  "CN", "IN", "BR", "MX", "RU", "KR", "SG", "AE", "CH", "SE",
  "BE", "PL", "ZA", "TR", "IE",
];

export const TOP_DESTINATIONS: string[] = [
  "US", "GB", "FR", "ES", "IT", "JP", "TH", "MX", "TR", "DE",
  "GR", "AU", "PT", "CA", "AE", "ID", "VN", "IN", "MA", "EG",
];
