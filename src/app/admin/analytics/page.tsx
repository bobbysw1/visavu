/**
 * /admin/analytics — Plausible-driven traffic + behaviour dashboard.
 *
 * Helps the team answer "what should we ship next?" with data instead
 * of conviction:
 *
 *   - Which passport / destination / pair pages get the most traffic?
 *   - Where do visitors come FROM (so we know which currencies +
 *     languages to prioritise)?
 *   - Which "Apply on official site" CTAs convert (affiliate-revenue
 *     proxy)?
 *   - Top zero-coverage destinations: which iso2 pages get crawled
 *     but have no rules? Those are the content gaps to close first.
 *
 * Gated by the existing /admin/* middleware (ADMIN_TOKEN). Renders a
 * useful "set PLAUSIBLE_API_KEY to activate" state when the key isn't
 * configured — so the page exists end-to-end and just lights up the
 * moment the env var lands.
 */
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import { nameFor } from "@/lib/countries";
import {
  aggregate,
  topPages,
  topReferrers,
  topVisitorCountries,
  isPlausibleConfigured,
} from "@/lib/plausible";

export const metadata = {
  title: "Analytics — Visavu admin",
  alternates: { canonical: absoluteUrl("/admin/analytics") },
  robots: { index: false, follow: false },
};

// Always fresh — Plausible API responses are point-in-time aggregates.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const configured = isPlausibleConfigured();

  if (!configured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <p className="kicker">Admin</p>
          <h1 className="serif-display text-4xl mt-2 mb-3">Analytics dashboard</h1>
          <p className="text-[var(--color-ink-muted)]">
            Plausible-driven traffic + behaviour stats. Currently inactive — set
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-sm">PLAUSIBLE_API_KEY</code>
            in Vercel to activate.
          </p>
        </header>
        <section className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-6">
          <h2 className="font-semibold text-lg mb-3">To activate</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--color-ink-muted)]">
            <li>
              Sign in to{" "}
              <a href="https://plausible.io" target="_blank" rel="noopener" className="underline">Plausible</a>{" "}
              (or your self-hosted install), open the site dashboard.
            </li>
            <li>Settings → API keys → New API key. Copy the token.</li>
            <li>
              Vercel → Visavu project → Settings → Environment Variables → add
              <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-xs">PLAUSIBLE_API_KEY</code>
              = the token. Apply to Production + Preview.
            </li>
            <li>
              (Optional) Add{" "}
              <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-xs">PLAUSIBLE_SITE_ID</code>
              if your site ID differs from <code className="px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-xs">visavu.com</code>,
              and{" "}
              <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-xs">PLAUSIBLE_BASE_URL</code>
              if self-hosted.
            </li>
            <li>Redeploy. This page lights up automatically.</li>
          </ol>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-6">
          <h2 className="font-semibold text-lg mb-3">What this page will show</h2>
          <ul className="space-y-2 text-sm text-[var(--color-ink-muted)]">
            <li>• Top 20 most-visited pages over the last 30 days</li>
            <li>• Total visitors, pageviews, bounce rate, average session duration</li>
            <li>• Top external referrers (Google / direct / social / other)</li>
            <li>• Visitor-country breakdown — which markets actually use the site</li>
            <li>• Top zero-coverage iso2s — pages visitors hit that we have no visa rules for</li>
            <li>• Apply-CTA click-through (affiliate-revenue proxy)</li>
          </ul>
        </section>
      </div>
    );
  }

  // Active path — pull all four breakdowns in parallel.
  const [agg, pages, refs, countries] = await Promise.all([
    aggregate("30d"),
    topPages("30d", 20),
    topReferrers("30d", 10),
    topVisitorCountries("30d", 10),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <p className="kicker">Admin</p>
        <h1 className="serif-display text-4xl mt-2 mb-2">Analytics — last 30 days</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Plausible API · self-refresh on page load · timezone: site default
        </p>
      </header>

      {/* Headline metrics */}
      {agg && (
        <section className="grid sm:grid-cols-4 gap-3 mb-10">
          <Stat label="Unique visitors" value={agg.visitors.toLocaleString()} />
          <Stat label="Pageviews" value={agg.pageviews.toLocaleString()} />
          <Stat label="Bounce rate" value={agg.bounceRate != null ? `${agg.bounceRate}%` : "—"} />
          <Stat label="Avg session" value={agg.avgDurationSeconds != null ? `${Math.round(agg.avgDurationSeconds)}s` : "—"} />
        </section>
      )}

      {/* Top pages */}
      <section className="mb-10">
        <h2 className="serif-display text-2xl font-medium mb-4">Top pages</h2>
        <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-rule)] bg-[var(--color-muted)]/40">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Page</th>
                <th className="text-right px-4 py-2 font-semibold">Visitors</th>
                <th className="text-right px-4 py-2 font-semibold">Pageviews</th>
              </tr>
            </thead>
            <tbody>
              {(pages ?? []).map((p) => (
                <tr key={p.page} className="border-b border-[var(--color-rule)] last:border-0">
                  <td className="px-4 py-2">
                    <Link href={p.page} className="hover:underline text-[var(--color-ink)] font-mono text-xs">
                      {p.page}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.visitors.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.pageviews.toLocaleString()}</td>
                </tr>
              ))}
              {(!pages || pages.length === 0) && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-[var(--color-ink-muted)]">No data yet for this window.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two-column: referrers + visitor countries */}
      <section className="grid lg:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="serif-display text-2xl font-medium mb-4">Top referrers</h2>
          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden">
            <ul className="divide-y divide-[var(--color-rule)]">
              {(refs ?? []).map((r) => (
                <li key={r.source} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-[var(--color-ink)]">{r.source}</span>
                  <span className="tabular-nums text-[var(--color-ink-muted)]">{r.visitors.toLocaleString()}</span>
                </li>
              ))}
              {(!refs || refs.length === 0) && (
                <li className="px-4 py-6 text-center text-[var(--color-ink-muted)] text-sm">No referrer data.</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="serif-display text-2xl font-medium mb-4">Visitor countries</h2>
          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden">
            <ul className="divide-y divide-[var(--color-rule)]">
              {(countries ?? []).map((c) => (
                <li key={c.country} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-[var(--color-ink)]">
                    {nameFor(c.country) || c.country}{" "}
                    <span className="text-[var(--color-ink-muted)] text-xs font-mono">({c.country})</span>
                  </span>
                  <span className="tabular-nums text-[var(--color-ink-muted)]">{c.visitors.toLocaleString()}</span>
                </li>
              ))}
              {(!countries || countries.length === 0) && (
                <li className="px-4 py-6 text-center text-[var(--color-ink-muted)] text-sm">No country data.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <p className="text-xs text-[var(--color-ink-muted)] italic">
        Data via Plausible API · 30-day window · no personal data collected
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)] mb-1">
        {label}
      </p>
      <p className="serif-display text-2xl font-medium text-[var(--color-ink)] tabular-nums">{value}</p>
    </div>
  );
}
