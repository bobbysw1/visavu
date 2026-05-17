import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PlausibleScript } from "@/components/PlausibleScript";
import { HeroDestinationSearch } from "@/components/HeroDestinationSearch";
import { Flag } from "@/components/Flag";
import { nameFor } from "@/lib/countries";

// Catch-all 404. Lives at the app root (not inside (site)/) because
// Next.js only invokes the root not-found for unmatched URLs — a
// not-found inside a route group only fires for explicit notFound()
// calls within that segment. We re-render the site chrome by hand so
// the page still feels like Visavu.
//
// Vercel + Next.js automatically serves this with HTTP 404; we don't
// need to set the status manually in App Router.

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "We couldn't find that page. Use the search to look up a visa, or jump straight to a popular passport or destination.",
  robots: { index: false, follow: true },
  alternates: { canonical: undefined },
};

// Hand-picked popular routes — match the homepage so visitors land
// somewhere we know is useful, not the long tail.
const POPULAR_DESTINATIONS = ["JP", "PT", "TH", "MX", "IT", "AU", "ES", "GR"];
const POPULAR_PASSPORTS = ["US", "GB", "DE", "CA", "AU", "FR", "IN", "BR"];

const CONTACT_EMAIL = "info@visavu.com";

export default function NotFound() {
  return (
    <>
      <PlausibleScript />
      <div className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded focus:bg-blue-700 focus:text-white focus:font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" role="main" className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 w-full">
          <p className="kicker mb-3 text-[var(--color-accent)]">404 · Page not found</p>
          <h1 className="serif-display text-4xl sm:text-5xl tracking-tight mb-4">
            That page isn&rsquo;t here.
          </h1>
          <p className="text-[var(--color-ink-muted)] max-w-2xl leading-relaxed mb-10">
            Either the URL has a typo, the page has moved, or you followed an old link. Pick up
            where you meant to be — search a visa route below, browse a popular passport or
            destination, or email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Broken%20link%20on%20visavu.com`}
              className="text-blue-700 dark:text-blue-300 underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            if a Visavu link is broken.
          </p>

          <section aria-labelledby="search-heading" className="mb-12">
            <h2 id="search-heading" className="kicker mb-3">
              Look up a visa
            </h2>
            <HeroDestinationSearch />
          </section>

          <section aria-labelledby="dests-heading" className="mb-12">
            <h2 id="dests-heading" className="kicker mb-4">
              Popular destinations
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 list-none p-0">
              {POPULAR_DESTINATIONS.map((iso) => (
                <li key={iso}>
                  <Link
                    href={`/destination/${iso.toLowerCase()}`}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--color-rule)] px-3 py-2.5 hover:bg-[var(--color-paper)] transition"
                  >
                    <Flag iso2={iso} size={20} />
                    <span className="text-sm font-medium truncate">{nameFor(iso)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="passports-heading" className="mb-12">
            <h2 id="passports-heading" className="kicker mb-4">
              Popular passports
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 list-none p-0">
              {POPULAR_PASSPORTS.map((iso) => (
                <li key={iso}>
                  <Link
                    href={`/passport/${iso.toLowerCase()}`}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--color-rule)] px-3 py-2.5 hover:bg-[var(--color-paper)] transition"
                  >
                    <Flag iso2={iso} size={20} />
                    <span className="text-sm font-medium truncate">{nameFor(iso)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="elsewhere-heading">
            <h2 id="elsewhere-heading" className="kicker mb-4">
              Or try
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
              {[
                { href: "/finder", label: "Where can I go?", hint: "Filter every destination by your goal" },
                { href: "/find-my-visa", label: "Find my visa", hint: "Answer a few questions, get ranked routes" },
                { href: "/passport-rankings", label: "Passport rankings", hint: "Every passport, sorted by access" },
                { href: "/guides", label: "Guides", hint: "ETIAS, EES, Schengen explainers" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-lg border border-[var(--color-rule)] px-4 py-3 hover:bg-[var(--color-paper)] transition"
                  >
                    <p className="font-medium text-sm">{l.label}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{l.hint}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

