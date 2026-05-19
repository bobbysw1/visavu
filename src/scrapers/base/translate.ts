/**
 * Translation pipeline for scraped non-English government pages.
 *
 * Adapters that scrape French (France-Visas), German (BAMF), Spanish
 * (exteriores), Italian (esteri), Japanese (MOFA), Korean (HiKorea),
 * Chinese (MFA), Russian (МИД), Turkish (e-konsolosluk), etc. return
 * requirements[] in the source language. We need them in English so
 * the UI + chat are coherent.
 *
 * Design:
 *  • Translates prose only. Structured fields (fees, dates, ISO codes,
 *    programme names like "Chancenkarte" / "Talent Passport") stay
 *    untouched — they're meaningful as proper nouns.
 *  • Cached on disk at src/data/translation_cache.json keyed by
 *    sha256(text|fromLang|toLang). Translations don't drift; one paid
 *    call per unique string ever.
 *  • Three providers tried in order:
 *      1. DeepL (env DEEPL_API_KEY) — best quality, 500k free chars/mo.
 *      2. LibreTranslate (env LIBRETRANSLATE_URL) — self-hostable.
 *      3. No-op passthrough — returns the original text + logs a warn.
 *    No API key → no translation, no build failure.
 *  • Idempotent: passing English text into translate(text, "en", "en")
 *    short-circuits.
 *
 * Usage in an adapter:
 *   const requirements = await translateMany(rawRequirements, "fr", "en");
 *
 * The cache file ships with the repo so deploys re-use already-translated
 * strings rather than burning API quota on every CI build.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const CACHE_PATH = path.resolve(process.cwd(), "src/data/translation_cache.json");

type CacheEntry = {
  text: string;
  /** ISO date the translation was first cached — for staleness review. */
  cachedAt: string;
  /** Which provider produced this translation. */
  provider: "deepl" | "libretranslate" | "passthrough" | "manual";
};

type Cache = Record<string, CacheEntry>;

let cacheMemo: Cache | null = null;

function loadCache(): Cache {
  if (cacheMemo) return cacheMemo;
  if (!existsSync(CACHE_PATH)) {
    cacheMemo = {};
    return cacheMemo;
  }
  try {
    cacheMemo = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    return cacheMemo as Cache;
  } catch {
    cacheMemo = {};
    return cacheMemo;
  }
}

function saveCache(cache: Cache): void {
  cacheMemo = cache;
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch {
    // Disk write failure shouldn't abort an adapter — log and continue.
    // The in-memory cache still helps within this run.
    console.warn("[translate] failed to persist translation cache");
  }
}

function cacheKey(text: string, fromLang: string, toLang: string): string {
  return createHash("sha256").update(`${fromLang}|${toLang}|${text}`).digest("hex");
}

export type SupportedSourceLang =
  | "en" | "fr" | "de" | "es" | "it" | "pt" | "nl" | "sv" | "fi" | "da" | "no"
  | "pl" | "cs" | "sk" | "hu" | "ro" | "bg" | "hr" | "el" | "tr"
  | "ru" | "uk" | "ja" | "zh" | "ko" | "th" | "vi" | "id" | "ar" | "he"
  | "hi" | "bn" | "ur";

/**
 * Translate a single string. Returns the translated text, or the
 * original on any failure / when no provider is configured / when
 * fromLang === toLang. Never throws.
 */
export async function translate(
  text: string,
  fromLang: SupportedSourceLang,
  toLang: "en" = "en",
): Promise<{ text: string; provider: CacheEntry["provider"] }> {
  if (!text || !text.trim()) return { text, provider: "passthrough" };
  if (fromLang === toLang) return { text, provider: "passthrough" };

  // Tiny strings (≤ 2 chars) — almost always punctuation or labels we
  // don't want to mangle through translation. Pass through.
  if (text.trim().length <= 2) return { text, provider: "passthrough" };

  const cache = loadCache();
  const key = cacheKey(text, fromLang, toLang);
  const hit = cache[key];
  if (hit) return { text: hit.text, provider: hit.provider };

  // Try DeepL first (best quality), then LibreTranslate, then noop.
  const deeplKey = process.env.DEEPL_API_KEY;
  if (deeplKey) {
    try {
      const translated = await translateDeepl(text, fromLang, toLang, deeplKey);
      if (translated) {
        cache[key] = { text: translated, cachedAt: new Date().toISOString().slice(0, 10), provider: "deepl" };
        saveCache(cache);
        return { text: translated, provider: "deepl" };
      }
    } catch (e) {
      console.warn("[translate] DeepL call failed:", (e as Error).message);
    }
  }

  const libreUrl = process.env.LIBRETRANSLATE_URL;
  if (libreUrl) {
    try {
      const translated = await translateLibre(text, fromLang, toLang, libreUrl);
      if (translated) {
        cache[key] = { text: translated, cachedAt: new Date().toISOString().slice(0, 10), provider: "libretranslate" };
        saveCache(cache);
        return { text: translated, provider: "libretranslate" };
      }
    } catch (e) {
      console.warn("[translate] LibreTranslate call failed:", (e as Error).message);
    }
  }

  // No provider configured — return original. Don't cache the passthrough
  // so a future build with a key set actually gets the translation.
  return { text, provider: "passthrough" };
}

/** Batch translate. Preserves order; failed items keep their original text. */
export async function translateMany(
  texts: string[],
  fromLang: SupportedSourceLang,
  toLang: "en" = "en",
): Promise<string[]> {
  const out: string[] = [];
  for (const t of texts) {
    const r = await translate(t, fromLang, toLang);
    out.push(r.text);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────────────────────────────────

async function translateDeepl(
  text: string,
  fromLang: string,
  toLang: string,
  apiKey: string,
): Promise<string | null> {
  // DeepL free key endpoint is api-free.deepl.com; pro key uses api.deepl.com.
  // The presence of ":fx" suffix marks free-tier keys per DeepL docs.
  const endpoint = apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const params = new URLSearchParams({
    auth_key: apiKey,
    text,
    source_lang: fromLang.toUpperCase(),
    target_lang: toLang.toUpperCase(),
    preserve_formatting: "1",
    // Don't translate code-like tokens / proper nouns. DeepL's tag handling
    // means anything wrapped in <keep>...</keep> roundtrips unchanged.
    tag_handling: "xml",
    ignore_tags: "keep",
  });
  const res = await fetch(`${endpoint}/v2/translate`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) return null;
  type DeeplResponse = { translations?: Array<{ text: string }> };
  const data = (await res.json()) as DeeplResponse;
  return data.translations?.[0]?.text ?? null;
}

async function translateLibre(
  text: string,
  fromLang: string,
  toLang: string,
  baseUrl: string,
): Promise<string | null> {
  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/translate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: fromLang,
      target: toLang,
      format: "text",
    }),
  });
  if (!res.ok) return null;
  type LibreResponse = { translatedText?: string };
  const data = (await res.json()) as LibreResponse;
  return data.translatedText ?? null;
}

/**
 * Wrap proper nouns / programme names in DeepL's no-translate tag so
 * "Chancenkarte" stays "Chancenkarte" rather than getting translated
 * literally to "Chance Card". Call before passing prose into translate().
 *
 * Usage:
 *   const wrapped = wrapKeep("Sie benötigen einen Aufenthaltstitel zur Chancenkarte.", ["Chancenkarte", "Aufenthaltstitel"]);
 *   const en = (await translate(wrapped, "de")).text;
 *   // → "You need a residence permit for the Chancenkarte."
 */
export function wrapKeep(text: string, properNouns: string[]): string {
  let out = text;
  for (const noun of properNouns) {
    const re = new RegExp(`\\b${escapeRegex(noun)}\\b`, "g");
    out = out.replace(re, `<keep>${noun}</keep>`);
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Inspection helper — returns cache stats for /admin/sources or a CLI tool. */
export function translationCacheStats(): { size: number; byProvider: Record<string, number> } {
  const cache = loadCache();
  const byProvider: Record<string, number> = {};
  for (const e of Object.values(cache)) {
    byProvider[e.provider] = (byProvider[e.provider] ?? 0) + 1;
  }
  return { size: Object.keys(cache).length, byProvider };
}
