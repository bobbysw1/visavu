/**
 * Tiny i18n helper. Translations live in ./<locale>.json. The default locale
 * is "en" — anything we don't translate falls through to the English string.
 *
 * Locale resolution (in order):
 *  1. Query param ?lang=<code>
 *  2. Accept-Language header (top match against supported list)
 *  3. Default "en"
 *
 * The function is server-side; client components that need locale-aware
 * strings must receive them as props from the server tree.
 */
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import pt from "./pt.json";
import ar from "./ar.json";
import hi from "./hi.json";
import zh from "./zh.json";
import ru from "./ru.json";
import id from "./id.json";

export type Locale = "en" | "es" | "fr" | "pt" | "ar" | "hi" | "zh" | "ru" | "id";
export const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr", "pt", "ar", "hi", "zh", "ru", "id"];
export const DEFAULT_LOCALE: Locale = "en";

const RTL_LOCALES: Locale[] = ["ar"];

const TABLES: Record<Locale, Record<string, string>> = {
  en,
  es,
  fr,
  pt,
  ar,
  hi,
  zh,
  ru,
  id,
};

export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  ar: "العربية",
  hi: "हिन्दी",
  zh: "中文",
  ru: "Русский",
  id: "Bahasa Indonesia",
};

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

/** Pull the best locale from an Accept-Language header value. */
export function resolveLocaleFromAcceptLanguage(headerValue: string | null | undefined): Locale {
  if (!headerValue) return DEFAULT_LOCALE;
  // Accept-Language: "es-ES,es;q=0.9,en;q=0.8" → ["es-ES", "es", "en"]
  const tags = headerValue
    .split(",")
    .map((s) => s.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    const primary = tag.split("-")[0];
    if (isSupportedLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return TABLES[locale]?.[key] ?? TABLES.en[key] ?? key;
}
