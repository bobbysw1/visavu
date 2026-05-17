"use client";

/**
 * Header locale switcher — backed by the P29 i18n scaffold registry
 * (src/lib/i18n/locales.ts). Switches the ?lang= URL param + cookie so
 * server components on the next render apply the right message table.
 *
 * Honest about translation coverage — surfaces "partial" / "stub" next
 * to each option so users see which locales are fully translated and
 * which fall back to English UI. Editorial content (passport intros,
 * guides) is English-only with an in-page notice; translating the body
 * copy is on the backlog.
 *
 * The structural App Router migration to /(site)/[locale]/* is the next
 * step — once that lands, URLs become canonical locale-prefixed and
 * this switcher only needs to redirect.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  LOCALES,
  LOCALE_LABEL,
  LOCALE_COVERAGE,
  isValidLocale,
  type Locale,
  DEFAULT_LOCALE,
} from "@/lib/i18n/locales";
import { trackEvent } from "./PlausibleScript";

const COVERAGE_SUFFIX: Record<"complete" | "partial" | "stub", string> = {
  complete: "",
  partial: " · partial translation",
  stub: " · English fallback",
};

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState<Locale>(DEFAULT_LOCALE);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Hydrate from URL on mount; URL ?lang= wins over cookie.
  useEffect(() => {
    const fromUrl = searchParams.get("lang");
    if (fromUrl && isValidLocale(fromUrl)) {
      setCurrent(fromUrl);
      return;
    }
    const fromCookie = document.cookie.match(/(?:^|; )visavu_locale=([^;]+)/)?.[1];
    if (fromCookie && isValidLocale(fromCookie)) {
      setCurrent(fromCookie);
    }
  }, [searchParams]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function pick(next: Locale): void {
    setOpen(false);
    if (next === current) return;
    setCurrent(next);
    document.cookie = `visavu_locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    const sp = new URLSearchParams(searchParams.toString());
    if (next === DEFAULT_LOCALE) sp.delete("lang");
    else sp.set("lang", next);
    const target = sp.size > 0 ? `${pathname}?${sp.toString()}` : pathname;
    trackEvent("LocaleChanged", { locale: next });
    router.replace(target);
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 py-1 text-xs font-medium hover:bg-[var(--color-muted)]/40"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={12} aria-hidden />
        {LOCALE_LABEL[current]}
        <span aria-hidden className="text-[10px] text-[var(--color-ink-muted)]">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Choose language"
          className="absolute right-0 z-50 mt-1 min-w-[12rem] rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-lg overflow-hidden"
        >
          {LOCALES.map((locale) => {
            const coverage = LOCALE_COVERAGE[locale];
            return (
              <li key={locale}>
                <button
                  type="button"
                  onClick={() => pick(locale)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[var(--color-muted)]/40 ${
                    locale === current ? "bg-[var(--color-muted)]/30" : ""
                  }`}
                >
                  <span className="font-medium">{LOCALE_LABEL[locale]}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">
                    {COVERAGE_SUFFIX[coverage]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
