/**
 * Locale registry — single source of truth for supported locales.
 *
 * P29 scaffold. Adding a locale: append to LOCALES, add a messages file
 * at src/lib/i18n/messages/<code>.json with the same key set, and
 * (eventually) a country-name translation table. The middleware + sitemap
 * automatically pick up new locales from this list.
 *
 * Current scope: scaffold is structural — `en` is the only locale with a
 * complete message set in this initial scaffold. Other locale files are
 * stubbed and inherit English at runtime via the resolver below until
 * each is hand-translated. We're explicit about that rather than shipping
 * machine-translated UI.
 */
export const LOCALES = ["en", "es", "fr", "de", "pt", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  zh: "中文",
};

export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  es: "ltr",
  fr: "ltr",
  de: "ltr",
  pt: "ltr",
  zh: "ltr",
};

/**
 * Coverage status — used by the LocaleSwitcher and a top-of-page notice
 * to be honest about translation completeness. The aspirational mark
 * means "the messages file exists and key UI strings are translated";
 * the partial mark means "UI translated but editorial content stays in
 * English with a notice".
 */
export const LOCALE_COVERAGE: Record<Locale, "complete" | "partial" | "stub"> = {
  en: "complete",
  es: "partial",
  fr: "stub",
  de: "stub",
  pt: "stub",
  zh: "stub",
};

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Resolve a locale from a request header / URL. Order:
 *   1. URL prefix (/es/foo) — authoritative
 *   2. visavu_locale cookie
 *   3. Accept-Language header
 *   4. DEFAULT_LOCALE
 */
export function resolveLocale(opts: {
  urlPrefix?: string | null;
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (opts.urlPrefix && isValidLocale(opts.urlPrefix)) return opts.urlPrefix;
  if (opts.cookie && isValidLocale(opts.cookie)) return opts.cookie;
  if (opts.acceptLanguage) {
    const candidates = opts.acceptLanguage
      .split(",")
      .map((part) => part.split(";")[0].trim().toLowerCase().split("-")[0]);
    for (const c of candidates) if (isValidLocale(c)) return c;
  }
  return DEFAULT_LOCALE;
}
