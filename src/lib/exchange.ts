/**
 * Currency conversion. Reads USD-base rates from src/data/exchange_rates.json
 * (refreshed nightly by src/scripts/refreshExchangeRates.ts) and converts
 * any currency pair via USD as intermediate.
 *
 * Design notes:
 *  - Rates are quoted as "1 USD = X target". JPY=156 means 1 USD = ¥156.
 *  - To convert FROM source TO target: convert source → USD → target.
 *  - Per-currency minor-unit factors are respected (JPY/KRW/VND have no
 *    subunit; BHD/KWD have 1000). See currencyByCountry.ts MINOR_UNIT_FACTOR.
 *  - The asOf date is shown in tooltip so users know the rate's age.
 */
import rates from "@/data/exchange_rates.json";
import { minorFactor } from "./currencyByCountry";

type RatesFile = {
  base: string;
  asOf: string;
  source: string;
  rates: Record<string, number>;
};

const TABLE = rates as RatesFile;

export function ratesAsOf(): string {
  return TABLE.asOf;
}

export function supportedCurrencies(): string[] {
  return Object.keys(TABLE.rates).filter((c) => TABLE.rates[c] > 0);
}

/**
 * Convert an amount in MINOR units (cents, paise, satang, etc.) from one
 * currency to another. Returns null if either currency is unsupported.
 */
export function convertMinor(
  amountMinor: number,
  fromCurrency: string,
  toCurrency: string,
): number | null {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  if (from === to) return amountMinor;
  const fromRate = TABLE.rates[from];
  const toRate = TABLE.rates[to];
  if (!fromRate || !toRate || fromRate <= 0 || toRate <= 0) return null;

  // amountMinor is in source's smallest unit. Convert to major in source,
  // then to major in target via USD, then back to target's minor.
  const sourceMajor = amountMinor / minorFactor(from);
  const usdMajor = sourceMajor / fromRate;
  const targetMajor = usdMajor * toRate;
  return Math.round(targetMajor * minorFactor(to));
}

export type FormattedFee = {
  /** Native string with the original currency, e.g. "฿50,000". */
  native: string;
  /** Local string with the converted currency, e.g. "≈ £1,090". Null when
   *  not convertible, when the source and target are the same, or when the
   *  conversion is too small to be meaningful (< 1 unit). */
  local: string | null;
  /** ISO date of the rate used for the conversion. */
  asOf: string | null;
  /** True when the conversion went through. */
  converted: boolean;
};

/**
 * Format a fee in BOTH the source currency and the user's local currency.
 *
 *   formatFeeLocalised(5_000_000, "THB", "GBP")
 *     → { native: "฿50,000", local: "≈ £1,090", asOf: "2026-05-11", converted: true }
 *
 *   formatFeeLocalised(5_000_000, "THB", "THB")
 *     → { native: "฿50,000", local: null, asOf: null, converted: false }
 */
export function formatFeeLocalised(
  amountMinor: number,
  sourceCurrency: string,
  userCurrency: string | null,
): FormattedFee {
  const native = formatMoney(amountMinor, sourceCurrency);
  if (!userCurrency || userCurrency.toUpperCase() === sourceCurrency.toUpperCase()) {
    return { native, local: null, asOf: null, converted: false };
  }
  const convertedMinor = convertMinor(amountMinor, sourceCurrency, userCurrency);
  if (convertedMinor == null) {
    return { native, local: null, asOf: null, converted: false };
  }
  const target = userCurrency.toUpperCase();
  const targetMajor = convertedMinor / minorFactor(target);
  if (targetMajor < 1) {
    // Too small to be meaningfully shown in target currency — e.g. 1 satang.
    return { native, local: null, asOf: null, converted: false };
  }
  return {
    native,
    local: `≈ ${formatMoney(convertedMinor, target)}`,
    asOf: TABLE.asOf,
    converted: true,
  };
}

export function formatMoney(amountMinor: number, currency: string): string {
  const factor = minorFactor(currency);
  const value = amountMinor / factor;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: factor === 1 ? 0 : value >= 1000 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
