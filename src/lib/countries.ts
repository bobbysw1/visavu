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
/**
 * Territories whose residents use a parent country's passport rather
 * than issuing their own. Excluded from PASSPORT_COUNTRIES so they
 * don't appear on /passport-rankings, the homepage passport collage,
 * /passport/[iso] pages, or the documents library — surfaces where a
 * "passport" entry implies an actually-issued document.
 *
 * They ARE still in COUNTRY_LIST as destinations (a UK passport
 * holder visiting Aruba still wants to look up the rules for that
 * trip; the destination-iso resolves to Aruba while the passport-iso
 * resolves to NL).
 *
 * The PARENT_PASSPORT map below records which country's passport
 * residents actually carry — surfaced in the UI when a user lands on
 * a removed iso ("Curaçao residents use Dutch passports → see /passport/nl").
 */
export const NO_PASSPORT_CODES: ReadonlySet<string> = new Set([
  // Uninhabited / research-only territories
  "AQ", // Antarctica — no civilian population
  "BV", // Bouvet Island — uninhabited (Norway)
  "HM", // Heard Island & McDonald Islands — uninhabited (Australia)
  "TF", // French Southern Territories — research stations only
  "UM", // US Minor Outlying Islands — no permanent residents
  "IO", // British Indian Ocean Territory — military only
  "GS", // South Georgia & South Sandwich — uninhabited
  "EH", // Western Sahara — disputed, no internationally recognized passport

  // Dutch Kingdom — constituent countries + special municipalities all use
  // Dutch passports (Kingdom of the Netherlands passport):
  "AW", // Aruba
  "CW", // Curaçao
  "SX", // Sint Maarten (Dutch)
  "BQ", // Bonaire, Sint Eustatius, Saba

  // French overseas departments/collectivities — all use French passports:
  "GP", // Guadeloupe
  "MQ", // Martinique
  "GF", // French Guiana
  "RE", // Réunion
  "YT", // Mayotte
  "PM", // Saint Pierre and Miquelon
  "WF", // Wallis and Futuna
  "NC", // New Caledonia
  "PF", // French Polynesia
  "BL", // Saint Barthélemy
  "MF", // Saint Martin (French)

  // Danish Kingdom realm — use Danish passports (with FO/GL variants):
  "FO", // Faroe Islands
  "GL", // Greenland

  // Finnish autonomy — use Finnish passports:
  "AX", // Åland Islands

  // Australian external territories — use Australian passports:
  "CC", // Cocos (Keeling) Islands
  "CX", // Christmas Island
  "NF", // Norfolk Island

  // Norwegian special — use Norwegian passports:
  "SJ", // Svalbard & Jan Mayen

  // US territories — residents are US citizens (or nationals for AS)
  // using US passports. Listed here so the iso doesn't appear as its
  // own passport entry; rules under the parent US passport instead.
  "AS", // American Samoa — US nationals (not full citizens), still US passport
  "GU", // Guam — US citizens, US passport
  "MP", // Northern Mariana Islands — US citizens, US passport
  "PR", // Puerto Rico — US citizens, US passport
  "VI", // US Virgin Islands — US citizens, US passport

  // New Zealand realm — Cook Islanders / Niueans / Tokelauans are
  // automatically NZ citizens at birth and use NZ passports:
  "CK", // Cook Islands
  "NU", // Niue
  "TK", // Tokelau

  // British Overseas Territories — issue BOTC variant passports but
  // residents typically use full British Citizen passports. Excluded
  // from PASSPORT_COUNTRIES because the rules for inbound visas to a
  // BOT-passport holder == UK-passport holder for all practical
  // purposes. NB: Gibraltar uniquely issues an EU-recognised variant.
  "PN", // Pitcairn
  "AI", // Anguilla
  "BM", // Bermuda
  "KY", // Cayman Islands
  "VG", // British Virgin Islands
  "MS", // Montserrat
  "TC", // Turks and Caicos
  "FK", // Falkland Islands
  "SH", // Saint Helena, Ascension and Tristan da Cunha

  // British Crown Dependencies — Jersey/Guernsey/Isle of Man passports
  // are British Islands variants. Residents commonly hold full British
  // passports. Excluded for the same reason as BOTs above.
  "JE", // Jersey
  "GG", // Guernsey
  "IM", // Isle of Man

  // NB Gibraltar (GI) — KEPT in the passport list because it's the most
  // distinctive of the BOTs and routinely searched as its own passport.
]);

/**
 * Map of non-issuing-territory → parent-passport iso2. Used by the UI
 * when a user lands on a /passport/[iso] URL for an excluded territory
 * — we redirect them to the right place with a contextual note.
 */
export const PARENT_PASSPORT: Record<string, string> = {
  AW: "NL", CW: "NL", SX: "NL", BQ: "NL",
  GP: "FR", MQ: "FR", GF: "FR", RE: "FR", YT: "FR", PM: "FR",
  WF: "FR", NC: "FR", PF: "FR", BL: "FR", MF: "FR",
  FO: "DK", GL: "DK",
  AX: "FI",
  CC: "AU", CX: "AU", NF: "AU",
  SJ: "NO",
  AS: "US", GU: "US", MP: "US", PR: "US", VI: "US",
  CK: "NZ", NU: "NZ", TK: "NZ",
  PN: "GB", AI: "GB", BM: "GB", KY: "GB", VG: "GB",
  MS: "GB", TC: "GB", FK: "GB", SH: "GB",
  JE: "GB", GG: "GB", IM: "GB",
};

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
