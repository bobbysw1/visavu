import Link from "next/link";
import { Suspense } from "react";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { MobileMenu } from "./MobileMenu";
import { ToolsDropdown } from "./ToolsDropdown";

// LocaleSwitcher removed 2026-05-19 — translation coverage was only
// ~120 strings against a fully English UI, so the switcher implied
// coverage we didn't actually have. Better to render <html lang="en">
// honestly and let Chrome / Safari / Edge fire their built-in
// auto-translate prompt when the user's browser language differs.
// The i18n machinery (src/i18n/t.ts + per-locale JSON) is kept for
// future re-enable once full URL-prefix routing + complete string
// coverage land. See SiteFooter for the user-facing browser-translate
// hint.

/**
 * SiteHeader — editorial chrome.
 *
 * Slim, paper-backed top bar with a Newsreader-set wordmark.  Replaces the
 * blue-CTA-prominent header of the pre-redesign era; the editorial frame
 * leaves CTAs to in-page elements (RefineSearchPanel, billboard) rather
 * than the chrome.
 *
 * Pure static server component — no headers()/cookies(), full edge cache.
 * Locale + currency state is resolved client-side by the two switchers.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-rule)] sticky top-0 z-30 bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="serif-display text-2xl tracking-tight flex items-baseline gap-0.5 shrink-0"
          aria-label="Visavu — home"
        >
          <span>Visavu</span>
          <span className="text-[var(--color-accent)]">.</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          {/* Primary headline link — the discoverability tool. Kept inline
              because it's the one most-clicked nav entry per analytics. */}
          <Link
            href="/finder"
            className="hidden md:inline px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
          >
            Where can I go?
          </Link>
          {/* Tools dropdown — bundles chat / find-my-visa / documents /
              myths / guides / rankings into a single nav entry. Updates
              removed per user — that surface is now the visa-news
              carousel at the bottom of the homepage, not its own nav item. */}
          <ToolsDropdown />
          {/* Services — coming-soon state until partner programmes are
              actually registered. Marked with a 'Soon' badge so users
              know it's intentional, not broken. */}
          <Link
            href="/services"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
          >
            <span>Services</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider rounded-full bg-[var(--color-muted)] text-[var(--color-ink-muted)] px-1.5 py-0.5 leading-none">
              Soon
            </span>
          </Link>
          {/* Find my visa — circled CTA at the end of the row. */}
          <Link
            href="/find-my-visa"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)] px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition whitespace-nowrap"
          >
            Find my visa
          </Link>
          {/* Suspense wraps the switchers because they call useSearchParams()
              client-side; without a boundary, Next bails out of SSG. */}
          <Suspense fallback={null}>
            <CurrencySwitcher />
          </Suspense>
          <MobileMenu />
        </nav>
      </div>
    </header>
  );
}
