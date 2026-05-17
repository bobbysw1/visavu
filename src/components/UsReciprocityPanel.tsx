/**
 * Renders the US reciprocity note for a given origin passport on US-bound
 * route pages (i.e. /[passport]/us/* routes). Surfaces fee + validity +
 * entries plus the country-specific narrative captured in
 * src/content/usReciprocity.ts.
 *
 * Only renders when the passport has a curated reciprocity entry — for
 * uncovered origins we omit the panel rather than fabricate.
 */
import { usReciprocityFor } from "@/content/usReciprocity";
import { nameFor } from "@/lib/countries";

export function UsReciprocityPanel({ passportIso2 }: { passportIso2: string }) {
  const note = usReciprocityFor(passportIso2);
  if (!note) return null;

  const passportName = nameFor(passportIso2);

  return (
    <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-5 mt-8">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold">
          US visa reciprocity for {passportName} passport holders
        </h2>
        <a
          href={note.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs underline text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          travel.state.gov →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Tile label="Issuance fee" value={note.issuanceFeeSummary} />
        <Tile label="Validity" value={note.validity} />
        <Tile label="Entries" value={note.entries} />
      </div>

      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {note.body}
      </p>

      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
        Reciprocity schedules are set by the US State Department under bilateral
        agreements and change with policy revisions. Confirm the current schedule
        at the linked travel.state.gov page before applying.
      </p>
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-0.5">{label}</p>
      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}
