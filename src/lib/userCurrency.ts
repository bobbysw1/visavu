/**
 * Detect the visitor's likely local currency.
 *
 * Priority:
 *   1. Cookie `vl_currency=XXX` (set by the header currency switcher).
 *   2. Query param ?currency=XXX (one-off override).
 *   3. Accept-Language header — extract the region tag (e.g. "en-GB" → GB → GBP),
 *      OR the language tag's plausible home country if no region present
 *      (sq → AL → ALL, vi → VN → VND, etc.).
 *   4. Default: USD — but only when no signal exists. The language-only
 *      fallback above means most browsers get a sensible local currency
 *      even without a region tag.
 *
 * Why: showing an Albanian visitor their visa fees in USD because their
 * browser reports `sq;q=0.9` (no region) is a real loss of trust — the
 * fix is a small primary-language → country mapping.
 */
import { currencyForCountry } from "./currencyByCountry";
import { supportedCurrencies } from "./exchange";

export const DEFAULT_CURRENCY = "USD";

export function isSupportedCurrency(code: string | null | undefined): boolean {
  if (!code) return false;
  return supportedCurrencies().includes(code.toUpperCase());
}

// Primary-language → likely home country. Covers the languages most likely
// to appear in `Accept-Language` without a region tag. Where a language is
// spoken across many countries with different currencies (en, es, fr, ar,
// pt, de) we omit it — the region tag is the only safe signal.
const LANG_TO_COUNTRY: Record<string, string> = {
  sq: "AL", // Albanian → Albania
  hr: "HR", // Croatian → Croatia
  cs: "CZ", // Czech
  da: "DK", // Danish
  nl: "NL", // Dutch
  et: "EE", // Estonian
  fi: "FI", // Finnish
  el: "GR", // Greek
  he: "IL", // Hebrew
  hi: "IN", // Hindi
  hu: "HU", // Hungarian
  is: "IS", // Icelandic
  id: "ID", // Indonesian
  it: "IT", // Italian
  ja: "JP", // Japanese
  ko: "KR", // Korean
  lv: "LV", // Latvian
  lt: "LT", // Lithuanian
  mk: "MK", // Macedonian
  ms: "MY", // Malay
  no: "NO", // Norwegian
  nb: "NO",
  nn: "NO",
  pl: "PL", // Polish
  ro: "RO", // Romanian
  ru: "RU", // Russian
  sr: "RS", // Serbian
  sk: "SK", // Slovak
  sl: "SI", // Slovenian
  sv: "SE", // Swedish
  th: "TH", // Thai
  tr: "TR", // Turkish
  uk: "UA", // Ukrainian
  vi: "VN", // Vietnamese
  bg: "BG", // Bulgarian
  fa: "IR", // Persian
  ka: "GE", // Georgian
  hy: "AM", // Armenian
  km: "KH", // Khmer
  lo: "LA", // Lao
  my: "MM", // Burmese
  ne: "NP", // Nepali
  si: "LK", // Sinhala
  ta: "LK", // Tamil → Sri Lanka (default; India is the bigger speaker base but Hindi covers that)
  bn: "BD", // Bengali → Bangladesh
  ur: "PK", // Urdu → Pakistan
  ps: "AF", // Pashto
  az: "AZ", // Azerbaijani
  kk: "KZ", // Kazakh
  ky: "KG", // Kyrgyz
  uz: "UZ", // Uzbek
  tg: "TJ", // Tajik
  mn: "MN", // Mongolian
};

/** Try to extract the user's home country from Accept-Language.
 *  First pass: region tag (en-GB → GB). Second pass: language-only
 *  fallback (sq → AL via LANG_TO_COUNTRY). */
function countryFromAcceptLanguage(header: string | null | undefined): string | null {
  if (!header) return null;
  const tags = header
    .split(",")
    .map((s) => s.split(";")[0]?.trim())
    .filter(Boolean);
  // First pass — explicit region tag.
  for (const tag of tags) {
    const parts = tag.split("-");
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      if (/^[A-Z]{2}$/.test(region)) return region;
    }
  }
  // Second pass — language-only fallback.
  for (const tag of tags) {
    const lang = tag.split("-")[0]?.toLowerCase();
    if (!lang) continue;
    const country = LANG_TO_COUNTRY[lang];
    if (country) return country;
  }
  return null;
}

export function resolveUserCurrency(input: {
  cookie?: string | null;
  queryParam?: string | null;
  acceptLanguage?: string | null;
}): string {
  if (isSupportedCurrency(input.queryParam)) return input.queryParam!.toUpperCase();
  if (isSupportedCurrency(input.cookie)) return input.cookie!.toUpperCase();

  const country = countryFromAcceptLanguage(input.acceptLanguage);
  if (country) {
    const fromCountry = currencyForCountry(country);
    if (fromCountry && isSupportedCurrency(fromCountry)) return fromCountry;
  }
  return DEFAULT_CURRENCY;
}

/**
 * De-facto secondary currency that's widely accepted in the country.
 * Returned alongside the primary currency on result-page fee chips for
 * markets where two currencies are both common in daily life.
 */
const SECONDARY_CURRENCY: Record<string, string> = {
  AL: "EUR", // Albania — EUR widely accepted
  AR: "USD", // Argentina — USD parallel rate dominant
  KH: "USD", // Cambodia — USD widely accepted
  LB: "USD", // Lebanon — USD informal pricing
  VE: "USD", // Venezuela
  EC: "USD", // Ecuador (officially uses USD but also has Sucre legacy pricing)
  ZW: "USD",
  XK: "EUR",
  ME: "EUR",
  BA: "EUR",
  MK: "EUR",
  BY: "USD",
  TR: "EUR", // tourism / luxury commonly quoted in EUR
  EG: "USD",
  RU: "USD",
};

export function secondaryCurrencyFor(country: string | null | undefined): string | null {
  if (!country) return null;
  return SECONDARY_CURRENCY[country.toUpperCase()] ?? null;
}
