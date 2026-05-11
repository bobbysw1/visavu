import type { Metadata } from "next";
import { sourceHealthSnapshot } from "@/lib/sourceHealth";
import { SourceHealthTable } from "@/components/SourceHealthTable";

// Admin pages — never indexed (robots.txt disallow + middleware gate).
export const metadata: Metadata = {
  title: "Admin · Source health",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  let rows: Awaited<ReturnType<typeof sourceHealthSnapshot>> = [];
  let error: string | null = null;
  try {
    rows = await sourceHealthSnapshot();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const total = rows.reduce((n, r) => n + r.recordCount, 0);
  const overdue = rows.filter((r) => r.isOverdue).length;
  const errored = rows.filter((r) => r.parseError).length;
  const neverRun = rows.filter((r) => r.lastFetchedAt == null).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold">Source health</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            One row per registered adapter. Overdue means the last fetch is older than the
            adapter&apos;s configured cadence.
          </p>
        </div>
        <a
          href="/admin/review-queue"
          className="text-sm rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Review queue →
        </a>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 p-4 text-sm">
          <p className="font-medium mb-1">Failed to load source health.</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-300">{error}</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Stat label="Adapters" value={rows.length} tone="neutral" />
            <Stat label="Records" value={total} tone="emerald" />
            <Stat label="Overdue" value={overdue} tone={overdue > 0 ? "amber" : "neutral"} />
            <Stat
              label="Parse errors"
              value={errored}
              tone={errored > 0 ? "red" : "neutral"}
            />
          </section>

          {neverRun > 0 && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {neverRun} adapter{neverRun === 1 ? "" : "s"} never run yet — trigger via{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">
                npm run scrape -- &lt;id&gt;
              </code>{" "}
              or{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">
                npm run refresh
              </code>
              .
            </p>
          )}

          <SourceHealthTable rows={rows} variant="admin" />
        </>
      )}
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "red" | "neutral" }) {
  const toneClass: Record<typeof tone, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-700 dark:text-red-400",
    neutral: "text-neutral-900 dark:text-neutral-100",
  };
  return (
    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <p className={`text-2xl font-bold tabular-nums ${toneClass[tone]}`}>{value}</p>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}
