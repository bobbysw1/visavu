/**
 * Translation helper for non-English government source scrapes.
 *
 * Several government immigration portals publish primarily in the
 * destination's domestic language — Japanese MOFA, Korean MOFA, Mexican
 * INM, Brazilian Itamaraty, Russian MID. The English versions are often
 * less detailed and updated late.
 *
 * Per P38 — translate ONLY prose fields during scraping (requirements
 * bullet points, notes, eligibility narrative). Structured fields
 * (fees, dates, numeric thresholds, URLs) stay in the source language
 * because they're language-agnostic.
 *
 * Cache translations against a content-hash so re-runs of unchanged
 * source text don't burn the translation API. Persist the cache in a
 * `translations` table (TODO — schema migration to be added when the
 * first non-English adapter is wired in).
 *
 * Provider: DeepL preferred for legal/government text; OpenAI / Claude as
 * fallback. Set DEEPL_API_KEY (free tier 500k chars/mo, Pro from ~€5/mo).
 */
import { createHash } from "node:crypto";

export type TranslateInput = {
  text: string;
  /** Source language as ISO 639-1 (e.g. "ja", "ko", "es-MX", "pt-BR", "ru"). */
  sourceLang: string;
  /** Optional cache-key suffix to disambiguate different fields of the same source. */
  contextHint?: string;
};

export type TranslateResult = {
  text: string;
  /** True if the result came from the cache (no API call billed). */
  fromCache: boolean;
  /** Source language echoed for the caller's logging. */
  sourceLang: string;
};

// In-memory cache keyed by content-hash. Production use should layer a
// persistent (DB) cache on top — this module's API stays the same.
const memoryCache = new Map<string, string>();

const DEEPL_ENDPOINT = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO_ENDPOINT = "https://api.deepl.com/v2/translate";

export async function translateScrape(input: TranslateInput): Promise<TranslateResult> {
  const cacheKey = computeCacheKey(input);
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    return { text: cached, fromCache: true, sourceLang: input.sourceLang };
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "translateScrape: DEEPL_API_KEY not set. Translation pipeline (P38) requires a DeepL Free or Pro account. Set the env var and retry.",
    );
  }
  const endpoint = apiKey.endsWith(":fx") ? DEEPL_ENDPOINT : DEEPL_PRO_ENDPOINT;

  const params = new URLSearchParams();
  params.set("text", input.text);
  params.set("source_lang", normalizeDeeplLang(input.sourceLang));
  params.set("target_lang", "EN");
  params.set("preserve_formatting", "1");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `DeepL-Auth-Key ${apiKey}`,
    },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error(
      `translateScrape: DeepL responded ${res.status} ${res.statusText} for ${input.sourceLang}`,
    );
  }
  const data = (await res.json()) as { translations: Array<{ text: string }> };
  const translated = data.translations[0]?.text;
  if (!translated) {
    throw new Error("translateScrape: DeepL returned no translation");
  }
  memoryCache.set(cacheKey, translated);
  return { text: translated, fromCache: false, sourceLang: input.sourceLang };
}

/** Translate a list of strings in parallel with cache hits skipped. */
export async function translateBatch(
  inputs: TranslateInput[],
): Promise<TranslateResult[]> {
  return Promise.all(inputs.map((input) => translateScrape(input)));
}

function computeCacheKey({ text, sourceLang, contextHint }: TranslateInput): string {
  return createHash("sha256")
    .update(`${sourceLang}|${contextHint ?? ""}|${text}`)
    .digest("hex");
}

// DeepL expects ISO 639-1 without the regional subtag for source_lang.
// "pt-BR" → "PT"; "es-MX" → "ES"; "ja" → "JA".
function normalizeDeeplLang(lang: string): string {
  return lang.split("-")[0].toUpperCase();
}

/**
 * Adapter-side wrapper — used by foreign-language adapters to translate
 * their prose fields before emitting records. Falls back to the original
 * text if translation fails so a transient DeepL outage doesn't crash a
 * scrape — the parseError on the record surfaces the failure for review.
 */
export async function translateProseFieldsSafely(
  fields: Record<string, string>,
  sourceLang: string,
): Promise<Record<string, string>> {
  try {
    const keys = Object.keys(fields);
    const results = await translateBatch(
      keys.map((k) => ({ text: fields[k], sourceLang, contextHint: k })),
    );
    const out: Record<string, string> = {};
    for (let i = 0; i < keys.length; i++) out[keys[i]] = results[i].text;
    return out;
  } catch {
    // Caller logs the failure; we return the originals so the record
    // still surfaces with un-translated prose rather than missing data.
    return fields;
  }
}

/**
 * Estimated cost model for the translation budget. DeepL Pro pricing is
 * €20/mo for 1M characters; Free tier 500k characters. Used by the
 * /admin/health tile to surface monthly translation spend.
 */
export function estimateMonthlyCharacterSpend(adapters: Array<{ prose: string[] }>): number {
  return adapters.reduce(
    (total, adapter) => total + adapter.prose.reduce((s, p) => s + p.length, 0),
    0,
  );
}
