import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin · Site health",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PLAUSIBLE_DOMAIN =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? new URL(SITE.url).hostname;
const PLAUSIBLE_URL = `https://plausible.io/${PLAUSIBLE_DOMAIN}`;

type Counts = {
  records: number;
  destinations: number;
  passports: number;
  adapters: number;
  recentRefreshes24h: number;
  parseErrors7d: number;
};

type R = Record<string, string>;
function unwrap<T extends R>(result: unknown): T[] {
  const o = result as { rows?: T[] };
  return (o.rows ?? (result as T[]) ?? []) as T[];
}

async function counts(): Promise<Counts | null> {
  try {
    const main = unwrap<{ records: string; destinations: string; passports: string }>(
      await db.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM ${schema.visaOptions})::text AS records,
          (SELECT COUNT(DISTINCT destination_iso2) FROM ${schema.visaOptions})::text AS destinations,
          (SELECT COUNT(DISTINCT passport_id) FROM ${schema.visaOptions})::text AS passports
      `),
    );
    const adapters = unwrap<{ n: string }>(
      await db.execute(sql`SELECT COUNT(*)::text AS n FROM sources`),
    );
    const recent = unwrap<{ n: string }>(
      await db.execute(sql`
        SELECT COUNT(*)::text AS n FROM source_records
        WHERE fetched_at > NOW() - INTERVAL '24 hours'
      `),
    );
    const errs = unwrap<{ n: string }>(
      await db.execute(sql`
        SELECT COUNT(*)::text AS n FROM source_records
        WHERE parse_error IS NOT NULL AND fetched_at > NOW() - INTERVAL '7 days'
      `),
    );
    const m = main[0] ?? { records: "0", destinations: "0", passports: "0" };
    return {
      records: Number(m.records) || 0,
      destinations: Number(m.destinations) || 0,
      passports: Number(m.passports) || 0,
      adapters: Number(adapters[0]?.n) || 0,
      recentRefreshes24h: Number(recent[0]?.n) || 0,
      parseErrors7d: Number(errs[0]?.n) || 0,
    };
  } catch {
    return null;
  }
}

export default async function AdminHealthPage() {
  const c = await counts();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
          Admin
        </p>
        <h1 className="text-2xl font-bold mb-1">Site health</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Daily 30-second glance. Traffic + funnel numbers live in Plausible (cookieless,
          no consent banner needed). Data-pipeline numbers come from the local DB.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
          Traffic & funnel (Plausible)
        </h2>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm mb-3">
            Plausible hosts the dashboard. Bookmark this link:
          </p>
          <a
            href={PLAUSIBLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Open Plausible dashboard →
          </a>
          <p className="text-xs text-neutral-500 mt-3">
            Domain: <code className="font-mono">{PLAUSIBLE_DOMAIN}</code>
          </p>

          <ul className="mt-4 text-sm space-y-1.5 text-neutral-700 dark:text-neutral-300">
            <li>
              <strong>Top pages</strong> · Pages → 7-day view.
            </li>
            <li>
              <strong>Organic entry pages</strong> · Sources → Channels → Search → drill into landing pages.
            </li>
            <li>
              <strong>404 rate</strong> · Pages → filter for <code>/404</code> entries (the new not-found page sends a Plausible pageview).
            </li>
            <li>
              <strong>Hero-form funnel</strong> · Goals → custom event <code>FinderSubmitted</code> / route-page reach.
            </li>
            <li>
              <strong>Find-my-visa completion</strong> · Goals → custom event <code>FindMyVisaSubmitted</code>.
            </li>
            <li>
              <strong>Country breakdown</strong> · Locations → Countries.
            </li>
            <li>
              <strong>Device split</strong> · Devices → Type.
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
          Data pipeline (local DB)
        </h2>
        {c ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label="Visa records" n={c.records} />
            <Stat label="Destinations" n={c.destinations} />
            <Stat label="Passports" n={c.passports} />
            <Stat label="Adapters" n={c.adapters} />
            <Stat label="Refreshes 24h" n={c.recentRefreshes24h} />
            <Stat
              label="Parse errors 7d"
              n={c.parseErrors7d}
              tone={c.parseErrors7d > 0 ? "warn" : "ok"}
            />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">DB unavailable.</p>
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
          Drill-downs
        </h2>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link href="/admin/sources" className="text-blue-700 dark:text-blue-400 underline">
              Source health
            </Link>{" "}
            — per-adapter overdue / parse-error status.
          </li>
          <li>
            <Link href="/admin/review-queue" className="text-blue-700 dark:text-blue-400 underline">
              Review queue
            </Link>{" "}
            — user reports + low-confidence + 180-day-stale records.
          </li>
          <li>
            <Link href="/changelog" className="text-blue-700 dark:text-blue-400 underline">
              Changelog
            </Link>{" "}
            — live hash-diff feed for every source.
          </li>
        </ul>
      </section>
    </main>
  );
}

function Stat({
  label,
  n,
  tone = "ok",
}: {
  label: string;
  n: number;
  tone?: "ok" | "warn";
}) {
  const toneCls =
    tone === "warn"
      ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
      : "border-neutral-200 dark:border-neutral-800";
  return (
    <div className={`rounded-lg border p-3 ${toneCls}`}>
      <p className="text-xl font-semibold tabular-nums">{n.toLocaleString("en")}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}
