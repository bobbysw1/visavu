/**
 * Visa-application advice panel — renders the personal-statement template,
 * weight-of-evidence rankings, money-saving tips, and DIY-vs-lawyer
 * triggers per purpose. Lives on /[passport]/[destination] result pages,
 * below the prep timeline.
 *
 * "Free, personalised guidance written by someone who's been through it"
 * is the genuine differentiator vs. the visa-services middlemen.
 */
import { Scale, FileText, Lightbulb, Scale3d } from "lucide-react";
import { ADVICE_BY_PURPOSE } from "@/content/visaApplicationAdvice";
import { routeAdviceFor } from "@/content/routeAdvice";
import { PURPOSE_LABEL, type Purpose, type VisaStatus } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { ClaudeTipCallout } from "@/components/ClaudeTipCallout";

export function VisaApplicationAdvice({
  purpose,
  passportIso2,
  destinationIso2,
  primaryStatus,
}: {
  purpose: Purpose;
  passportIso2: string;
  destinationIso2: string;
  /** Skip the panel for routes where no visa is actually needed
   *  (same-country travel, visa-free destinations). */
  primaryStatus?: VisaStatus | null;
}) {
  // Same-country: no visa needed, no advice useful.
  if (passportIso2.toUpperCase() === destinationIso2.toUpperCase()) return null;
  // Visa-free / eTA / refused: advice doesn't apply.
  if (
    primaryStatus === "visa_free" ||
    primaryStatus === "visa_free_with_eta" ||
    primaryStatus === "refused"
  )
    return null;

  // Route-specific copy (hand-written for high-traffic routes) wins over
  // the generic per-purpose fallback. A Canadian going to Australia for
  // study sees AUD$1,600 fee, OSHC, RCMP police-check — not generic
  // 'destination publishes a maintenance figure' language.
  const advice =
    routeAdviceFor(passportIso2, destinationIso2, purpose) ?? ADVICE_BY_PURPOSE[purpose];
  if (!advice) return null;

  const isRouteSpecific = routeAdviceFor(passportIso2, destinationIso2, purpose) !== null;

  const destName = nameFor(destinationIso2);
  const passportAdj = nationalityFor(passportIso2);
  /** Replace generic placeholders in advice copy with the actual route
   *  parties — turns 'destination' into 'Australia', etc. */
  const fillIn = (text: string): string =>
    text
      .replace(/\{destination\}/g, destName)
      .replace(/\{passport\}/g, passportAdj)
      .replace(/\{passportLower\}/g, passportAdj.toLowerCase());

  return (
    <section className="mt-10 mb-2 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/15 overflow-hidden">
      <header className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-700 dark:text-emerald-300">
            Make your case
          </p>
          {isRouteSpecific && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white"
              title="Specifically researched for this passport → destination pair"
            >
              ★ Hand-written for this route
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 leading-tight">
          Tailored guidance — {passportAdj} applying for a {PURPOSE_LABEL[purpose].toLowerCase()} visa to {destName}
        </h2>
        <p className="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-100/80 mt-1.5 leading-relaxed">
          The same things a £1,000 immigration consultation would tell you — what evidence
          {destName}&apos;s caseworkers actually weight, a personal-statement skeleton you can
          adapt to {destName}&apos;s framing, common mistakes that get {passportAdj.toLowerCase()}{" "}
          applications refused, and when it&apos;s worth hiring a lawyer.
        </p>
      </header>

      {/* What carries weight */}
      <div className="px-5 sm:px-6 py-4 border-t border-emerald-200/60 dark:border-emerald-900/60 bg-white/40 dark:bg-neutral-950/20">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={15} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-800 dark:text-emerald-200">
            What caseworkers actually weight
          </h3>
        </div>
        <ol className="space-y-3">
          {advice.whatCarriesWeight.map((w, i) => (
            <li key={w.label} className="flex items-start gap-3">
              <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50">
                  {w.label}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 leading-snug">
                  {fillIn(w.why)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Personal statement template */}
      <div className="px-5 sm:px-6 py-4 border-t border-emerald-200/60 dark:border-emerald-900/60">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-800 dark:text-emerald-200">
            Personal-statement skeleton
          </h3>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-snug">
          Fill in each section with your own facts, dates, and details. The structure mirrors
          what caseworkers expect to find.
        </p>
        <ol className="space-y-3.5">
          {advice.personalStatementTemplate.map((p) => (
            <li key={p.heading} className="rounded-lg bg-white/60 dark:bg-neutral-950/40 border border-emerald-200/40 dark:border-emerald-900/40 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
                {p.heading}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
                {fillIn(p.prompt)}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <ClaudeTipCallout />
        </div>
      </div>

      {/* Money-saving tips */}
      <div className="px-5 sm:px-6 py-4 border-t border-emerald-200/60 dark:border-emerald-900/60 bg-white/40 dark:bg-neutral-950/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={15} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-800 dark:text-emerald-200">
            Mistakes that cost real money
          </h3>
        </div>
        <ul className="space-y-2">
          {advice.moneySavingTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
              <span aria-hidden="true" className="shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>{fillIn(tip)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lawyer triggers */}
      <div className="px-5 sm:px-6 py-4 border-t border-emerald-200/60 dark:border-emerald-900/60">
        <div className="flex items-center gap-2 mb-3">
          <Scale3d size={15} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-800 dark:text-emerald-200">
            DIY or hire a lawyer?
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
              ✓ DIY is fine if
            </p>
            <ul className="space-y-1.5">
              {advice.lawyerTriggers.diy.map((t) => (
                <li key={t} className="text-sm text-emerald-950 dark:text-emerald-100 leading-snug">
                  • {fillIn(t)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
              ⚠ Get a specialist if
            </p>
            <ul className="space-y-1.5">
              {advice.lawyerTriggers.getALawyer.map((t) => (
                <li key={t} className="text-sm text-amber-950 dark:text-amber-100 leading-snug">
                  • {fillIn(t)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="px-5 sm:px-6 py-3 text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
        This guidance is general — not legal advice. For high-stakes routes (refusal history,
        criminal record, complex finances), spend the money on a qualified immigration adviser
        regulated by your destination (UK: OISC / SRA; AU: MARA; US: bar-admitted attorney).
      </footer>
    </section>
  );
}
