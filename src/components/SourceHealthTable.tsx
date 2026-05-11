/**
 * Source-health table — used by both the admin dashboard (full detail) and
 * the public /sources page (read-only summary). Renders one row per adapter
 * with last-fetched, record count, parse-error indicator, and an overdue
 * badge when the adapter hasn't run within its `defaultIntervalMs`.
 */
import type { SourceHealth } from "@/lib/sourceHealth";

const KIND_LABEL: Record<SourceHealth["kind"], string> = {
  government: "Government",
  embassy: "Embassy",
  wikipedia: "Wikipedia",
  wikidata: "Wikidata",
  regional_bloc: "Regional bloc",
  manual: "Curated",
};

const KIND_TONE: Record<SourceHealth["kind"], string> = {
  government: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200",
  embassy: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-200",
  wikipedia: "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
  wikidata: "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
  regional_bloc: "bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-200",
  manual: "bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200",
};

function fmtMs(ms: number): string {
  const days = Math.round(ms / 86_400_000);
  if (days === 1) return "daily";
  if (days < 7) return `every ${days} days`;
  if (days < 30) return `every ${Math.round(days / 7)} weeks`;
  return `every ${Math.round(days / 30)} months`;
}

function fmtRelative(iso: string | null): string {
  if (!iso) return "Never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "Just now";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export function SourceHealthTable({
  rows,
  variant = "public",
}: {
  rows: SourceHealth[];
  variant?: "public" | "admin";
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="py-3 px-4">Source</th>
            <th className="py-3 px-4">Kind</th>
            <th className="py-3 px-4 text-right">Records</th>
            <th className="py-3 px-4">Last fetched</th>
            <th className="py-3 px-4">Cadence</th>
            {variant === "admin" && (
              <>
                <th className="py-3 px-4">Parser</th>
                <th className="py-3 px-4">Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            return (
              <tr
                key={r.id}
                className="border-b border-neutral-100 dark:border-neutral-900 last:border-0"
              >
                <td className="py-2.5 px-4">
                  <div className="font-medium leading-tight">{r.name}</div>
                  {r.primaryUrl && (
                    <a
                      href={r.primaryUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-neutral-500 dark:text-neutral-400 hover:underline truncate block max-w-md"
                    >
                      {r.primaryUrl}
                    </a>
                  )}
                </td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded ${KIND_TONE[r.kind]}`}>
                    {KIND_LABEL[r.kind]}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums">{r.recordCount}</td>
                <td className="py-2.5 px-4">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {fmtRelative(r.lastFetchedAt)}
                  </span>
                  {r.isOverdue && r.lastFetchedAt && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                      overdue
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                  {fmtMs(r.defaultIntervalMs)}
                </td>
                {variant === "admin" && (
                  <>
                    <td className="py-2.5 px-4 text-xs font-mono">
                      {r.lastParserVersion ?? r.parserVersion}
                      {r.lastParserVersion && r.lastParserVersion !== r.parserVersion && (
                        <span
                          className="ml-1 text-amber-700 dark:text-amber-400"
                          title={`Code is ${r.parserVersion}, last run was ${r.lastParserVersion}`}
                        >
                          ⚠
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {r.parseError ? (
                        <span
                          className="inline-block text-xs px-2 py-0.5 rounded bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200"
                          title={r.parseError}
                        >
                          parse error
                        </span>
                      ) : r.lastFetchedAt ? (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
                          ok
                        </span>
                      ) : (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          never run
                        </span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
