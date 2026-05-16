"use client";

/**
 * Header-level locale switcher.
 *
 * Refactored 2026-05 from <details>-based disclosure to an explicit
 * useState + click-outside dropdown. The <details> version was clicking-
 * through-to-summary correctly but the dropdown panel was clipped under
 * the sticky site header on some layouts. This is more reliable.
 *
 * Changes the URL's ?lang=xx without losing pathname or other query
 * params. trackEvent fires on every selection so we can see which
 * locales actually get use.
 *
 * Reads state from the URL on the client (no server-side Accept-Language
 * read) so SiteHeader stays statically cacheable. Defaults to "en" until
 * hydrated — preventing SSR mismatch.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Hydrate from URL on mount.
  useEffect(() => {
    const fromUrl = searchParams.get("lang");
    if (fromUrl && isSupportedLocale(fromUrl)) setCurrent(fromUrl);
  }, [searchParams]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(target: Locale) {
    const params = new URLSearchParams(searchParams.toString());
    if (target === "en") params.delete("lang");
    else params.set("lang", target);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    trackEvent("LocaleChanged", { from: current, to: target });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative text-sm">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current language: ${LOCALE_DISPLAY_NAMES[current]}. Click to change.`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-muted)] transition"
      >
        <Globe size={14} aria-hidden />
        <span className="hidden sm:inline">{LOCALE_DISPLAY_NAMES[current]}</span>
        <span className="sm:hidden uppercase">{current}</span>
        <span aria-hidden className="text-[10px] opacity-60">▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Choose language"
          className="absolute right-0 top-full mt-2 z-50 ink-card shadow-lg p-1.5 grid grid-cols-1 gap-0.5 min-w-[13rem]"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === current}
              onClick={() => pick(l)}
              className={`text-left px-3 py-1.5 rounded text-sm transition ${
                l === current
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold"
                  : "hover:bg-[var(--color-muted)]"
              }`}
            >
              {LOCALE_DISPLAY_NAMES[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
