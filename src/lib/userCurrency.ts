/**
 * Detect the visitor's likely local currency.
 *
 * Priority:
 *   1. Cookie `vl_currency=XXX` (set by the header currency switcher).
 *   2. Query param ?currency=XXX (one-off override).
 *   3. Accept-Language header — extract the region tag (e.g. "en-GB" → GB → GBP)
 *      and map to currency.
 *   4. Default: USD.
 *
 * The helper is intentionally pessimistic: if we can't decode the language /
 * region, fall back to USD rather than guess. Showing a London visitor their
 * fees in USD is fine; showing an Argentinian visitor their fees in JPY would
 * be confusing.
 */
import { currencyForCountry } from "./currencyByCountry";
import { supportedCurrencies } from "./exchange";

export const DEFAULT_CURRENCY = "USD";

export function isSupportedCurrency(code: string | null | undefined): boolean {
  if (!code) return false;
  return supportedCurrencies().includes(code.toUpperCase());
}

/** Parse "en-GB,en;q=0.9" → ["en-GB", "en"] → first one with a region. */
function regionFromAcceptLanguage(header: string | null | undefined): string | null {
  if (!header) return null;
  const tags = header
    .split(",")
    .map((s) => s.split(";")[0]?.trim())
    .filter(Boolean);
  for (const tag of tags) {
    // Looking for the region segment, e.g. en-GB → GB.
    const parts = tag.split("-");
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      if (/^[A-Z]{2}$/.test(region)) return region;
    }
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

  const region = regionFromAcceptLanguage(input.acceptLanguage);
  if (region) {
    const fromRegion = currencyForCountry(region);
    if (fromRegion && isSupportedCurrency(fromRegion)) return fromRegion;
  }
  return DEFAULT_CURRENCY;
}
