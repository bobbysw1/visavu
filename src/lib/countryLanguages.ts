/**
 * Country → primary spoken language(s).
 *
 * Used to render the hero language toggle: "Read this in Japanese ↗" on
 * /passport/jp, "Read this in Portuguese ↗" on /passport/mz, and so on.
 *
 * The language code is BCP47 (ISO 639-1). The `nativeName` is what we show
 * in the toggle UI — always in the target script, never transliterated.
 *
 * For countries with multiple official languages we pick the one most
 * likely to be the reader's first language. Many countries we serve have
 * English as one of several official languages (IN, ZA, NG, PH, KE, …);
 * for those we keep the default English UI and don't render the toggle
 * unless the *primary* spoken language is non-English.
 */

export type CountryLanguage = {
  /** BCP47 language tag — what Google Translate accepts as the target. */
  bcp47: string;
  /** Native name of the language, in its own script. */
  nativeName: string;
  /** English name, used in tooltips / aria-labels. */
  englishName: string;
};

/**
 * The handful of supported in-house locales. When the country's primary
 * language matches one of these, the toggle navigates to the same page
 * with ?lang=xx — no external service. For anything else, we hand off to
 * Google Translate (free, no key, supports ~130 languages).
 */
export const IN_HOUSE_LOCALES = new Set([
  "en",
  "es",
  "fr",
  "pt",
  "ar",
  "hi",
  "zh",
  "ru",
  "id",
]);

/**
 * Curated map. Where a country has English as a co-official language
 * (e.g. India, South Africa, Philippines, Kenya, Nigeria) we still surface
 * the dominant local language — that's a more useful toggle than no toggle.
 */
export const COUNTRY_LANGUAGE: Record<string, CountryLanguage> = {
  // Asia ────────────────────────────────────────────────────────────
  JP: { bcp47: "ja", nativeName: "日本語", englishName: "Japanese" },
  CN: { bcp47: "zh", nativeName: "中文", englishName: "Chinese" },
  TW: { bcp47: "zh-TW", nativeName: "繁體中文", englishName: "Traditional Chinese" },
  HK: { bcp47: "zh-HK", nativeName: "繁體中文", englishName: "Cantonese (Traditional)" },
  KR: { bcp47: "ko", nativeName: "한국어", englishName: "Korean" },
  KP: { bcp47: "ko", nativeName: "한국어", englishName: "Korean" },
  TH: { bcp47: "th", nativeName: "ไทย", englishName: "Thai" },
  VN: { bcp47: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese" },
  KH: { bcp47: "km", nativeName: "ខ្មែរ", englishName: "Khmer" },
  LA: { bcp47: "lo", nativeName: "ລາວ", englishName: "Lao" },
  MM: { bcp47: "my", nativeName: "မြန်မာ", englishName: "Burmese" },
  ID: { bcp47: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian" },
  MY: { bcp47: "ms", nativeName: "Bahasa Melayu", englishName: "Malay" },
  PH: { bcp47: "fil", nativeName: "Filipino", englishName: "Filipino" },
  SG: { bcp47: "zh", nativeName: "中文", englishName: "Chinese" },
  BN: { bcp47: "ms", nativeName: "Bahasa Melayu", englishName: "Malay" },
  TL: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  IN: { bcp47: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
  PK: { bcp47: "ur", nativeName: "اردو", englishName: "Urdu" },
  BD: { bcp47: "bn", nativeName: "বাংলা", englishName: "Bengali" },
  LK: { bcp47: "si", nativeName: "සිංහල", englishName: "Sinhala" },
  NP: { bcp47: "ne", nativeName: "नेपाली", englishName: "Nepali" },
  BT: { bcp47: "dz", nativeName: "རྫོང་ཁ", englishName: "Dzongkha" },
  MV: { bcp47: "dv", nativeName: "ދިވެހި", englishName: "Dhivehi" },
  MN: { bcp47: "mn", nativeName: "Монгол", englishName: "Mongolian" },
  KZ: { bcp47: "kk", nativeName: "Қазақша", englishName: "Kazakh" },
  KG: { bcp47: "ky", nativeName: "Кыргызча", englishName: "Kyrgyz" },
  TJ: { bcp47: "tg", nativeName: "Тоҷикӣ", englishName: "Tajik" },
  TM: { bcp47: "tk", nativeName: "Türkmen", englishName: "Turkmen" },
  UZ: { bcp47: "uz", nativeName: "Oʻzbekcha", englishName: "Uzbek" },
  AF: { bcp47: "ps", nativeName: "پښتو", englishName: "Pashto" },

  // Middle East ─────────────────────────────────────────────────────
  AE: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  SA: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  QA: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  KW: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  BH: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  OM: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  YE: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  JO: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  LB: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  SY: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  IQ: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  PS: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  EG: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  IL: { bcp47: "he", nativeName: "עברית", englishName: "Hebrew" },
  IR: { bcp47: "fa", nativeName: "فارسی", englishName: "Persian" },
  TR: { bcp47: "tr", nativeName: "Türkçe", englishName: "Turkish" },

  // Europe ──────────────────────────────────────────────────────────
  DE: { bcp47: "de", nativeName: "Deutsch", englishName: "German" },
  AT: { bcp47: "de", nativeName: "Deutsch", englishName: "German" },
  CH: { bcp47: "de", nativeName: "Deutsch", englishName: "German" },
  LI: { bcp47: "de", nativeName: "Deutsch", englishName: "German" },
  FR: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  BE: { bcp47: "nl", nativeName: "Nederlands", englishName: "Dutch" },
  LU: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  MC: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  ES: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  AD: { bcp47: "ca", nativeName: "Català", englishName: "Catalan" },
  PT: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  IT: { bcp47: "it", nativeName: "Italiano", englishName: "Italian" },
  SM: { bcp47: "it", nativeName: "Italiano", englishName: "Italian" },
  VA: { bcp47: "it", nativeName: "Italiano", englishName: "Italian" },
  NL: { bcp47: "nl", nativeName: "Nederlands", englishName: "Dutch" },
  DK: { bcp47: "da", nativeName: "Dansk", englishName: "Danish" },
  SE: { bcp47: "sv", nativeName: "Svenska", englishName: "Swedish" },
  NO: { bcp47: "no", nativeName: "Norsk", englishName: "Norwegian" },
  IS: { bcp47: "is", nativeName: "Íslenska", englishName: "Icelandic" },
  FI: { bcp47: "fi", nativeName: "Suomi", englishName: "Finnish" },
  EE: { bcp47: "et", nativeName: "Eesti", englishName: "Estonian" },
  LV: { bcp47: "lv", nativeName: "Latviešu", englishName: "Latvian" },
  LT: { bcp47: "lt", nativeName: "Lietuvių", englishName: "Lithuanian" },
  PL: { bcp47: "pl", nativeName: "Polski", englishName: "Polish" },
  CZ: { bcp47: "cs", nativeName: "Čeština", englishName: "Czech" },
  SK: { bcp47: "sk", nativeName: "Slovenčina", englishName: "Slovak" },
  HU: { bcp47: "hu", nativeName: "Magyar", englishName: "Hungarian" },
  RO: { bcp47: "ro", nativeName: "Română", englishName: "Romanian" },
  MD: { bcp47: "ro", nativeName: "Română", englishName: "Romanian" },
  BG: { bcp47: "bg", nativeName: "Български", englishName: "Bulgarian" },
  GR: { bcp47: "el", nativeName: "Ελληνικά", englishName: "Greek" },
  CY: { bcp47: "el", nativeName: "Ελληνικά", englishName: "Greek" },
  AL: { bcp47: "sq", nativeName: "Shqip", englishName: "Albanian" },
  MK: { bcp47: "mk", nativeName: "Македонски", englishName: "Macedonian" },
  RS: { bcp47: "sr", nativeName: "Српски", englishName: "Serbian" },
  ME: { bcp47: "sr", nativeName: "Crnogorski", englishName: "Montenegrin" },
  BA: { bcp47: "bs", nativeName: "Bosanski", englishName: "Bosnian" },
  HR: { bcp47: "hr", nativeName: "Hrvatski", englishName: "Croatian" },
  SI: { bcp47: "sl", nativeName: "Slovenščina", englishName: "Slovenian" },
  XK: { bcp47: "sq", nativeName: "Shqip", englishName: "Albanian" },
  UA: { bcp47: "uk", nativeName: "Українська", englishName: "Ukrainian" },
  BY: { bcp47: "be", nativeName: "Беларуская", englishName: "Belarusian" },
  RU: { bcp47: "ru", nativeName: "Русский", englishName: "Russian" },
  GE: { bcp47: "ka", nativeName: "ქართული", englishName: "Georgian" },
  AM: { bcp47: "hy", nativeName: "Հայերեն", englishName: "Armenian" },
  AZ: { bcp47: "az", nativeName: "Azərbaycan", englishName: "Azerbaijani" },
  MT: { bcp47: "mt", nativeName: "Malti", englishName: "Maltese" },

  // Africa ──────────────────────────────────────────────────────────
  MA: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  DZ: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  TN: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  LY: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  SD: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  MR: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  ET: { bcp47: "am", nativeName: "አማርኛ", englishName: "Amharic" },
  ER: { bcp47: "ti", nativeName: "ትግርኛ", englishName: "Tigrinya" },
  SO: { bcp47: "so", nativeName: "Soomaali", englishName: "Somali" },
  KE: { bcp47: "sw", nativeName: "Kiswahili", englishName: "Swahili" },
  TZ: { bcp47: "sw", nativeName: "Kiswahili", englishName: "Swahili" },
  UG: { bcp47: "sw", nativeName: "Kiswahili", englishName: "Swahili" },
  RW: { bcp47: "rw", nativeName: "Kinyarwanda", englishName: "Kinyarwanda" },
  BI: { bcp47: "rn", nativeName: "Kirundi", englishName: "Kirundi" },
  CD: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  CG: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  CM: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  CF: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  GA: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  GQ: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  TD: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  NE: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  ML: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  BF: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  CI: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  SN: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  GN: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  TG: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  BJ: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  MG: { bcp47: "mg", nativeName: "Malagasy", englishName: "Malagasy" },
  KM: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  DJ: { bcp47: "ar", nativeName: "العربية", englishName: "Arabic" },
  AO: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  MZ: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  GW: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  CV: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  ST: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  // English-speaking Africa kept as default (no toggle needed): GH, LR, SL,
  // GM, NG, ZA, NA, BW, ZW, ZM, MW, MU, SC, SZ, LS

  // Americas ────────────────────────────────────────────────────────
  MX: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  GT: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  HN: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  SV: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  NI: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  CR: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  PA: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  CU: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  DO: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  PR: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  CO: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  VE: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  EC: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  PE: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  BO: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  CL: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  AR: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  PY: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  UY: { bcp47: "es", nativeName: "Español", englishName: "Spanish" },
  BR: { bcp47: "pt", nativeName: "Português", englishName: "Portuguese" },
  HT: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  // English Americas kept as default: US, CA, GB-* territories, JM, BS, BB,
  // TT, GY, BZ, SR (Dutch but English widely used), etc.
  SR: { bcp47: "nl", nativeName: "Nederlands", englishName: "Dutch" },

  // Oceania ─ all English-defaulted except FR territories
  PF: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  NC: { bcp47: "fr", nativeName: "Français", englishName: "French" },
  WF: { bcp47: "fr", nativeName: "Français", englishName: "French" },
};

export function languageFor(iso2: string): CountryLanguage | null {
  return COUNTRY_LANGUAGE[iso2.toUpperCase()] ?? null;
}
