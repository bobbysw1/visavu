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

// Each locale's JSON has a `_meta` block (object) used by tooling +
// LocaleSwitcher to surface completion status, plus the actual
// translation strings (all string-valued). The cast widens past the
// _meta typing so the helpers downstream can index by key freely;
// t() ignores _meta when resolving lookups.
type LocaleTable = Record<string, unknown>;
const TABLES: Record<Locale, LocaleTable> = {
  en: en as LocaleTable,
  es: es as LocaleTable,
  fr: fr as LocaleTable,
  pt: pt as LocaleTable,
  ar: ar as LocaleTable,
  hi: hi as LocaleTable,
  zh: zh as LocaleTable,
  ru: ru as LocaleTable,
  id: id as LocaleTable,
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
  // Resolution: locale-specific → en fallback → key itself (so missing
  // strings render as the key, which is easy to spot in QA).
  const localised = TABLES[locale]?.[key];
  if (typeof localised === "string") return localised;
  const en = TABLES.en[key];
  if (typeof en === "string") return en;
  return key;
}

/** Reads the _meta.completionStatus from a locale file so the
 *  LocaleSwitcher can show 'complete / partial / stub' badges next
 *  to each language without each surface having to re-derive it. */
export function localeCompletionStatus(locale: Locale): "complete" | "partial" | "stub" {
  const meta = TABLES[locale]?._meta as { completionStatus?: string } | undefined;
  if (meta?.completionStatus === "complete" || meta?.completionStatus === "partial" || meta?.completionStatus === "stub") {
    return meta.completionStatus;
  }
  // Default — assume stub if not stamped.
  return locale === DEFAULT_LOCALE ? "complete" : "stub";
}
