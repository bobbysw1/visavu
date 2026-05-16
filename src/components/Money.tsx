"use client";

/**
 * Single source of truth for rendering monetary amounts client-side.
 *
 * Reads the user's preferred currency from the `vl_currency` cookie set by
 * <CurrencySwitcher>, then renders the native amount plus an "≈ £xxx"
 * converted hint when source ≠ target. Falls back to native-only when no
 * cookie is present, when the source equals the target, or when the
 * conversion table doesn't cover the currency.
 *
 * Use this anywhere a fee, threshold, or other monetary amount is rendered
 * in a client component. For server components, prefer `formatFeeLocalised`
 * directly with a userCurrency value propagated from the page-level cookie
 * read.
 */
import { useEffect, useState } from "react";
import { formatFeeLocalised, ratesAsOf } from "@/lib/exchange";

function readCurrencyCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)vl_currency=([A-Z]{3})/);
  return m ? m[1] : null;
}

export function Money({
  amountMinor,
  currency,
  showAsOf = false,
  className = "",
}: {
  amountMinor: number;
  currency: string;
  /** When true, renders a small "as of YYYY-MM-DD" hint after the converted
   *  amount so users can judge the rate's freshness. */
  showAsOf?: boolean;
  className?: string;
}) {
  // Pre-hydration we render the native amount only — no conversion can
  // happen on the server because the cookie isn't readable from React Server
  // Components without explicit prop drilling. Hydration upgrades to the
  // user's chosen currency.
  const [userCurrency, setUserCurrency] = useState<string | null>(null);
  useEffect(() => {
    setUserCurrency(readCurrencyCookie());
  }, []);

  const formatted = formatFeeLocalised(amountMinor, currency, userCurrency);
  if (!formatted.converted) {
    return <span className={className}>{formatted.native}</span>;
  }
  return (
    <span className={className}>
      {formatted.native}{" "}
      <span className="text-[var(--color-ink-muted)] font-normal">
        ({formatted.local})
      </span>
      {showAsOf && formatted.asOf && (
        <span className="text-xs text-[var(--color-ink-muted)] ml-1">
          as of {formatted.asOf}
        </span>
      )}
    </span>
  );
}

export { ratesAsOf };
