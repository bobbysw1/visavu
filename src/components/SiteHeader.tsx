import Link from "next/link";
import { Suspense } from "react";
import { CurrencySwitcher } from "./CurrencySwitcher";

// NOTE: LocaleSwitcher is intentionally hidden site-wide until translation
// coverage moves beyond status / purpose labels. A switcher that silently
// no-ops on ~95% of page copy hurts credibility more than offering no
// switcher at all. When we add locale-prefixed routes (see project
// backlog), re-import LocaleSwitcher and add it to <nav> below.

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
          <Link
            href="/finder"
            className="hidden md:inline px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
          >
            Where can I go?
          </Link>
          <Link
            href="/guides"
            className="hidden sm:inline px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
          >
            Guides
          </Link>
          <Link
            href="/services"
            className="hidden md:inline px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
          >
            Services
          </Link>
          <Link
            href="/passport-rankings"
            className="hidden lg:inline px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
          >
            Rankings
          </Link>
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
        </nav>
      </div>
    </header>
  );
}
