/**
 * VisaPrepTimeline — "what you'll need" panel.
 *
 * Renders the list of documents the applicant needs to obtain for a
 * given (destination, purpose, status), sorted by lead time (longest
 * first). The intent is "what should I start TODAY?" — long-lead docs
 * like police certificates, medicals, and credential evaluations gate
 * the whole application and must be ordered before anything else.
 *
 * Layout:
 *  - A header with the purpose + total estimated prep window
 *  - "Start these today" — documents flagged `mustOrderFirst`, in their
 *    own visually-distinct emerald block
 *  - "Then gather the rest" — everything else, in a plain list
 *
 * When the visa status is visa_free / visa_free_with_eta the component
 * renders nothing (the caller checks length before mounting).
 */
import { ListChecks, Hourglass, AlertCircle } from "lucide-react";
import { documentsFor } from "@/content/visaPrep";
import { DOCUMENTS, formatLeadDays, type VisaDocument } from "@/content/visaDocuments";
import { PURPOSE_LABEL, type Purpose, type VisaStatus } from "@/lib/types";
import { nameFor } from "@/lib/countries";

function sortByLeadDesc(a: VisaDocument, b: VisaDocument): number {
  // Most-urgent (longest-lead) items first. Tie-break on `mustOrderFirst`.
  const maxDiff = b.leadDaysMax - a.leadDaysMax;
  if (maxDiff !== 0) return maxDiff;
  return Number(b.mustOrderFirst ?? false) - Number(a.mustOrderFirst ?? false);
}

const CATEGORY_LABEL: Record<VisaDocument["category"], string> = {
  identity: "Identity",
  "purpose-evidence": "Purpose evidence",
  "background-check": "Background",
  medical: "Medical",
  credentials: "Credentials",
  financial: "Financial",
  relationship: "Relationship",
  application: "Application",
};

export function VisaPrepTimeline({
  destinationIso2,
  purpose,
  status,
}: {
  destinationIso2: string;
  purpose: Purpose;
  status: VisaStatus;
}) {
  const ids = documentsFor(destinationIso2, purpose, status);
  if (ids.length <= 2) return null; // visa-free → nothing useful here

  const docs = ids
    .map((id) => DOCUMENTS[id])
    .filter((d): d is VisaDocument => Boolean(d))
    .sort(sortByLeadDesc);

  const startToday = docs.filter((d) => d.mustOrderFirst);
  const rest = docs.filter((d) => !d.mustOrderFirst);

  const overallMax = Math.max(...docs.map((d) => d.leadDaysMax));
  const overallWindow = formatLeadDays(
    Math.min(...docs.map((d) => d.leadDaysMin)),
    overallMax,
  );

  return (
    <section className="mt-8 mb-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
      <header className="px-5 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
        <div className="flex items-start gap-3">
          <ListChecks
            size={22}
            aria-hidden="true"
            className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-700 dark:text-emerald-300 mb-0.5">
              What you&apos;ll need
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">
              {PURPOSE_LABEL[purpose]} visa for {nameFor(destinationIso2)}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
              <Hourglass size={13} aria-hidden="true" />
              Start <strong className="font-semibold">~{overallWindow}</strong> before your
              intended travel date.
            </p>
          </div>
        </div>
      </header>

      {startToday.length > 0 && (
        <div className="px-5 sm:px-6 pt-5 pb-4 bg-emerald-50/40 dark:bg-emerald-950/15 border-b border-emerald-200/50 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
            <h3 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-800 dark:text-emerald-200">
              Order these first — they have the longest lead time
            </h3>
          </div>
          <ul className="space-y-3">
            {startToday.map((doc, i) => (
              <DocRow key={doc.id} doc={doc} index={i + 1} emphasis />
            ))}
          </ul>
        </div>
      )}

      {rest.length > 0 && (
        <div className="px-5 sm:px-6 py-5">
          {startToday.length > 0 && (
            <h3 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
              Then gather these
            </h3>
          )}
          <ul className="space-y-3">
            {rest.map((doc, i) => (
              <DocRow key={doc.id} doc={doc} index={startToday.length + i + 1} />
            ))}
          </ul>
        </div>
      )}

      <footer className="px-5 sm:px-6 py-3 text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
        Lead times are global averages. Country-specific channels can be
        faster (FBI Channeler in days vs FBI Mail in months) — always
        check the destination&apos;s embassy or visa portal for current
        timelines.
      </footer>
    </section>
  );
}

function DocRow({
  doc,
  index,
  emphasis = false,
}: {
  doc: VisaDocument;
  index: number;
  emphasis?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 sm:gap-4">
      <div
        className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold tabular-nums ${
          emphasis
            ? "bg-emerald-600 text-white"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 ring-1 ring-neutral-200 dark:ring-neutral-700"
        }`}
        aria-hidden="true"
      >
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
          <p className="font-semibold text-[15px] sm:text-base text-slate-900 dark:text-slate-50">
            {doc.label}
          </p>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
            {CATEGORY_LABEL[doc.category]}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ml-auto ${
              emphasis
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <Hourglass size={11} aria-hidden="true" />
            {formatLeadDays(doc.leadDaysMin, doc.leadDaysMax)}
          </span>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
          {doc.description}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          <strong className="font-semibold text-neutral-700 dark:text-neutral-300">
            How:
          </strong>{" "}
          {doc.howToObtain}
        </p>
      </div>
    </li>
  );
}
