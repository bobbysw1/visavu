"use client";

/**
 * Header-level locale switcher. Renders a small <details> with each
 * supported language in its native script. Preserves the current
 * pathname + search params when changing language so the user doesn't
 * lose their place — only the ?lang= query value changes.
 *
 * Reads its own state from the URL on the client (no server-side
 * Accept-Language read needed) so the SiteHeader stays static-
 * cacheable. Defaults to "en" until hydrated.
 */
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  SUPPORTED_LOCALES,
  LOCALE_DISPLAY_NAMES,
  isSupportedLocale,
  type Locale,
} from "@/i18n/t";
import { trackEvent } from "./PlausibleScript";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState<Locale>("en");

  // Hydrate from URL on mount. `?lang=xx` wins; otherwise stay at "en".
  // We deliberately DON'T sniff navigator.language because that would
  // create a hydration mismatch on the first paint of the static layout.
  useEffect(() => {
    const fromUrl = searchParams.get("lang");
    if (fromUrl && isSupportedLocale(fromUrl)) setCurrent(fromUrl);
  }, [searchParams]);

  function pick(target: Locale) {
    const params = new URLSearchParams(searchParams.toString());
    if (target === "en") params.delete("lang");
    else params.set("lang", target);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    trackEvent("LocaleChanged", { from: current, to: target });
  }

  return (
    <details className="relative text-sm">
      <summary
        className="cursor-pointer list-none px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
        aria-label={`Current language: ${LOCALE_DISPLAY_NAMES[current]}. Click to change.`}
      >
        {LOCALE_DISPLAY_NAMES[current]} ▾
      </summary>
      <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg p-1.5 grid grid-cols-1 gap-0.5 min-w-[12rem]">
        {SUPPORTED_LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => pick(l)}
            className={`text-left px-3 py-1.5 rounded text-sm ${
              l === current
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {LOCALE_DISPLAY_NAMES[l]}
          </button>
        ))}
      </div>
    </details>
  );
}
