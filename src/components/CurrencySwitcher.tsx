"use client";

/**
 * Tiny header dropdown that lets users override the auto-detected currency.
 * Posts to /api/set-currency (server action) which sets a long-lived cookie,
 * then redirects back to the current page.
 *
 * Reads the current value from `document.cookie` on the client so the
 * SiteHeader can stay static-cacheable. Defaults to "USD" until hydrated.
 */
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Curated top-30 currencies — enough to cover the audience without showing
// every obscure pegged dollar. Sorted alphabetically by code.
const CURRENCIES: Array<{ code: string; label: string; symbol: string }> = [
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "ARS", label: "Argentine Peso", symbol: "$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "CLP", label: "Chilean Peso", symbol: "$" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "DKK", label: "Danish Krone", symbol: "kr" },
  { code: "EGP", label: "Egyptian Pound", symbol: "£" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$" },
  { code: "IDR", label: "Indonesian Rupiah", symbol: "Rp" },
  { code: "ILS", label: "Israeli Shekel", symbol: "₪" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "KRW", label: "South Korean Won", symbol: "₩" },
  { code: "MXN", label: "Mexican Peso", symbol: "$" },
  { code: "MYR", label: "Malaysian Ringgit", symbol: "RM" },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { code: "NOK", label: "Norwegian Krone", symbol: "kr" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  { code: "PHP", label: "Philippine Peso", symbol: "₱" },
  { code: "PKR", label: "Pakistani Rupee", symbol: "₨" },
  { code: "PLN", label: "Polish Złoty", symbol: "zł" },
  { code: "SEK", label: "Swedish Krona", symbol: "kr" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "THB", label: "Thai Baht", symbol: "฿" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
];

function readCurrencyCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)vl_currency=([A-Z]{3})/);
  return m ? m[1] : null;
}

export function CurrencySwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const next = qs ? `${pathname}?${qs}` : pathname;

  // Hydrate the displayed currency from the cookie on mount. Default to
  // "USD" pre-hydration so SSR + first-paint match — we never read
  // navigator.language here for the same reason.
  const [current, setCurrent] = useState("USD");
  useEffect(() => {
    const fromCookie = readCurrencyCookie();
    if (fromCookie) setCurrent(fromCookie);
  }, []);

  return (
    <details className="relative text-sm">
      <summary
        className="cursor-pointer list-none px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
        aria-label={`Display fees in ${current}. Click to change currency.`}
      >
        {current} ▾
      </summary>
      <form
        method="POST"
        action="/api/set-currency"
        className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg p-2 max-h-96 overflow-y-auto min-w-[14rem]"
      >
        <input type="hidden" name="next" value={next} />
        <ul className="space-y-0.5">
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                type="submit"
                name="currency"
                value={c.code}
                className={`w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between gap-2 ${
                  c.code === current
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="truncate">{c.label}</span>
                <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                  {c.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </form>
    </details>
  );
}
