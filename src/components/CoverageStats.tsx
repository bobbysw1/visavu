/**
 * Coverage stats grid for /passport/[iso] and /destination/[iso] pages.
 * Renders zero-state cleanly when no data has been ingested yet, so the
 * page still works pre-bootstrap.
 */
import type { CoverageSnapshot } from "@/lib/coverage";
import { PURPOSE_LABEL, type Purpose } from "@/lib/types";

const STATUS_TILES: Array<{
  key: keyof CoverageSnapshot["byStatus"];
  label: string;
  tone: string;
}> = [
  { key: "visa_free", label: "Visa-free", tone: "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200" },
  { key: "visa_free_with_eta", label: "Visa-free w/ eTA", tone: "bg-sky-50 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200" },
  { key: "visa_on_arrival", label: "Visa on arrival", tone: "bg-cyan-50 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200" },
  { key: "e_visa", label: "e-Visa", tone: "bg-violet-50 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200" },
  { key: "embassy_visa", label: "Embassy", tone: "bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" },
  { key: "restricted", label: "Restricted", tone: "bg-orange-50 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200" },
];

const PURPOSE_ORDER: Purpose[] = ["tourism", "business", "transit", "work", "study", "family", "diplomatic"];

export function CoverageStats({
  snapshot,
  context,
}: {
  snapshot: CoverageSnapshot;
  context: "passport" | "destination";
}) {
  if (snapshot.totalOptions === 0) {
    return (
      <section className="mt-6 p-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400">
        Coverage data not yet ingested for this country. Run{" "}
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">
          npm run bootstrap
        </code>{" "}
        to seed.
      </section>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Coverage</h2>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        We have {snapshot.totalOptions} verified visa{snapshot.totalOptions === 1 ? "" : "s"} on
        record across {snapshot.totalDestinationsCovered}{" "}
        {context === "passport" ? "destinations" : "origin countries"}.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {STATUS_TILES.map((tile) => (
          <div key={tile.key} className={`p-3 rounded-lg ${tile.tone}`}>
            <p className="text-2xl font-bold leading-tight">{snapshot.byStatus[tile.key] ?? 0}</p>
            <p className="text-xs leading-snug">{tile.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
          By purpose
        </h3>
        <div className="flex flex-wrap gap-2">
          {PURPOSE_ORDER.map((p) => (
            <span
              key={p}
              className="text-xs px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              {PURPOSE_LABEL[p]}: <strong className="font-semibold">{snapshot.byPurpose[p] ?? 0}</strong>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
