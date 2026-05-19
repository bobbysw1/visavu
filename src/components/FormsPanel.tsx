/**
 * Inline forms panel rendered on /[passport]/[destination] result
 * pages. Surfaces the curated visa forms that match the page's
 * (destination, purpose, visa-label) tuple — so an applicant looking
 * at the AU Partner visa page sees Form 888 + Form 47SP immediately,
 * a UK Spouse applicant sees Appendix FM-SE, etc.
 *
 * Returns null when no match — most route pages don't have curated
 * forms (we only cover the top 12 categories), and that's fine:
 * the page renders without a forms section rather than with an empty
 * one.
 */
import Link from "next/link";
import type { Purpose } from "@/lib/types";
import { formsForRoute, type FormsEntry, type VisaForm } from "@/content/visaForms";

const STAGE_TONE: Record<VisaForm["stage"], string> = {
  before_applying:
    "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  with_application:
    "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
  after_decision:
    "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

const STAGE_LABEL: Record<VisaForm["stage"], string> = {
  before_applying: "Before applying",
  with_application: "Submit with application",
  after_decision: "After decision",
};

export function FormsPanel({
  destinationIso2,
  purpose,
  visaLabel,
}: {
  destinationIso2: string;
  purpose: Purpose;
  visaLabel: string;
}) {
  const entries = formsForRoute(destinationIso2, purpose, visaLabel);
  if (entries.length === 0) return null;

  // Usually 1 entry per route; render only the first matching programme
  // to keep the panel focused. The /documents page links to the full set.
  const entry = entries[0];

  return (
    <section
      id="forms"
      aria-label="Government forms you'll need"
      className="mt-8 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden scroll-mt-32"
    >
      <header className="px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--color-rule)]">
        <p className="kicker">Forms you&apos;ll download</p>
        <h2 className="serif-display text-xl sm:text-2xl font-medium text-[var(--color-ink)] mt-1">
          {entry.programmeLabel}
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1.5">
          Direct links to the official government download pages for every form
          in this application. No third-party mirrors.
        </p>
      </header>

      <ul role="list" className="divide-y divide-[var(--color-rule)]">
        {entry.forms.map((form) => (
          <li key={form.code} className="px-5 sm:px-6 py-4">
            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1">
                  {form.code}
                </p>
                <p className="font-semibold text-[var(--color-ink)] leading-snug">
                  {form.name}
                </p>
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.14em] font-semibold px-2 py-1 rounded shrink-0 ${STAGE_TONE[form.stage]}`}
              >
                {STAGE_LABEL[form.stage]}
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
              {form.description}
            </p>
            <a
              href={form.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-1.5 rounded-full
                border border-[var(--color-ink)] text-[var(--color-ink)]
                hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]
                text-xs font-semibold px-3.5 py-1.5 transition
              "
            >
              Download official PDF ↗
            </a>
          </li>
        ))}
      </ul>

      <footer className="px-5 sm:px-6 py-3 border-t border-[var(--color-rule)] bg-[var(--color-muted)]/30 flex items-center justify-between gap-2 text-xs flex-wrap">
        <span className="text-[var(--color-ink-muted)]">
          Filed via:{" "}
          <a
            href={entry.applicationPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-[var(--color-ink)]"
          >
            official application portal ↗
          </a>
        </span>
        <Link
          href={`/documents/${destinationIso2.toLowerCase()}`}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
        >
          All {entry.programmeLabel.split(" — ")[0]} forms →
        </Link>
      </footer>
    </section>
  );
}
