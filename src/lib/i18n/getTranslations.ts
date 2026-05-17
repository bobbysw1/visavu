/**
 * Server-side message loader for the i18n scaffold (P29).
 *
 * Loads JSON message files at request time, with English as the fallback
 * for any locale that's still in "stub" coverage. Returns a `t()` helper
 * that accepts a dotted-path key and substitutes any {param} placeholders.
 *
 * Usage in a server component:
 *   const t = await getTranslations(locale);
 *   <h1>{t("hero.title")}</h1>
 *
 * Production swap target: replace with next-intl when the message set
 * stabilises across all 6 locales — same shape, more features (plurals,
 * date formatting). Keeping the dependency surface narrow until then.
 */
import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";
import { DEFAULT_LOCALE, type Locale } from "./locales";

type MessageMap = typeof enMessages;

const MESSAGES: Record<Locale, MessageMap> = {
  en: enMessages,
  es: esMessages as MessageMap,
  // The remaining locales fall back to English at runtime until their
  // message files land. The fallback path keeps the page rendering rather
  // than throwing on missing keys.
  fr: enMessages,
  de: enMessages,
  pt: enMessages,
  zh: enMessages,
};

export type Translator = (key: string, params?: Record<string, string | number>) => string;

export async function getTranslations(locale: Locale): Promise<Translator> {
  const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  return (key: string, params?: Record<string, string | number>) => {
    const value = pickPath(messages, key);
    if (value == null) {
      // Missing key — log in dev, fall back to the dotted path so the
      // string is at least visible rather than empty.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`i18n: missing key "${key}" for locale "${locale}"`);
      }
      return key;
    }
    if (params) {
      return String(value).replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? `{${p}}`));
    }
    return String(value);
  };
}

function pickPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}
