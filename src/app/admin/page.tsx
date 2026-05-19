/**
 * Admin landing. Single hub linking to every admin tool. Each
 * subpage already lives under the ADMIN_TOKEN-gated /admin/* middleware
 * matcher — this page just makes them discoverable in one place
 * instead of having to remember each URL.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGES = [
  {
    href: "/admin/health",
    title: "Site health",
    blurb: "Live record / adapter / parse-error counts + Plausible link.",
  },
  {
    href: "/admin/sources",
    title: "Source health",
    blurb: "Per-adapter freshness, last-fetch status, intervals.",
  },
  {
    href: "/admin/review-queue",
    title: "Review queue",
    blurb: "User reports, low-confidence records, stale verifications, Wikipedia mismatches.",
  },
  {
    href: "/admin/programmes",
    title: "Programmes",
    blurb: "Per-route record explorer for spot-fixing visa entries.",
  },
  {
    href: "/admin/analytics",
    title: "Analytics",
    blurb: "Top routes, traffic mix, conversion to /consultation + /chat.",
  },
  {
    href: "/admin/chat-review",
    title: "Chat review",
    blurb: "Recent conversations, refusals, top-token spenders. Used to spot bad replies + tune the prompt.",
  },
];

export default function AdminIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
          Admin
        </p>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Token-gated. If you can read this, your <code>?key=</code> or
          cookie matched the ADMIN_TOKEN env var.
        </p>
      </header>
      <ul className="space-y-3">
        {PAGES.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="block rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition p-4"
            >
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {p.title}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {p.blurb}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
