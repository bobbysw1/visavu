/**
 * Lightweight PDF helper for adapters that need to extract text from a
 * PDF source (typical for government fee schedules and policy circulars
 * that aren't published as HTML).
 *
 * Stays dependency-light: only loads the `pdf-parse` module when actually
 * invoked. Most government PDFs are well-structured and reading them as
 * plain text is enough — for column-aware extraction the caller should
 * post-process the returned string.
 *
 * Usage:
 *   const text = await fetchPdfText("https://gov.uk/.../fees.pdf");
 *   const fees = parseFeeTable(text, /UK Skilled Worker.*?£(\d[\d,]+)/);
 *
 * Wired to adapters via P37 when the fee data lives in a PDF. Until those
 * adapters land, this is a standalone helper exposed for future use.
 */
import { politeFetch } from "@/scrapers/base/fetchClient";

export async function fetchPdfText(url: string): Promise<string> {
  const res = await politeFetch(url);
  if (!res.ok) {
    throw new Error(`fetchPdfText: ${url} responded ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  // Dynamic import keeps pdf-parse out of the bundle for adapters that
  // don't use it. The dependency is added to package.json when this
  // helper first gets wired into a production adapter.
  type PdfParseFn = (data: Buffer) => Promise<{ text: string }>;
  type PdfParseModule = { default: PdfParseFn } | PdfParseFn;
  // Use a string variable to bypass TS module-resolution since pdf-parse
  // isn't in package.json yet — installed only when an adapter actually
  // uses this helper. Until then the dynamic import returns null.
  const moduleName = "pdf-parse";
  const mod = (await import(/* webpackIgnore: true */ moduleName).catch(() => null)) as PdfParseModule | null;
  if (!mod) {
    throw new Error(
      "fetchPdfText: pdf-parse module not installed. Run `npm i pdf-parse` to enable PDF-based adapters.",
    );
  }
  const fn = ("default" in mod ? mod.default : mod) as PdfParseFn;
  const parsed = await fn(buf);
  return parsed.text;
}

/**
 * Parse a fee table from extracted PDF text using a pattern. Returns an
 * array of { feeClass, amount, currency } entries. Pattern must produce
 * three capture groups: class label, numeric amount (digits + optional
 * comma), currency code or symbol.
 */
export function parseFeeTable(
  text: string,
  pattern: RegExp,
): Array<{ feeClass: string; amount: number; currency: string }> {
  const results: Array<{ feeClass: string; amount: number; currency: string }> = [];
  for (const match of text.matchAll(new RegExp(pattern, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g"))) {
    const [, feeClass, amountRaw, currency] = match;
    const amount = parseInt(amountRaw.replace(/[,\s]/g, ""), 10);
    if (Number.isFinite(amount)) {
      results.push({
        feeClass: feeClass.trim(),
        amount,
        currency: currency.toUpperCase().trim(),
      });
    }
  }
  return results;
}

/**
 * Sanity-normalise a fee currency symbol to ISO 4217.
 * Used by parseFeeTable callers that capture symbols rather than codes.
 */
export function symbolToIso4217(s: string): string {
  const map: Record<string, string> = {
    "£": "GBP",
    "$": "USD",
    "€": "EUR",
    "¥": "JPY",
    "A$": "AUD",
    "C$": "CAD",
    "NZ$": "NZD",
    "S$": "SGD",
  };
  return map[s] ?? s.toUpperCase();
}
