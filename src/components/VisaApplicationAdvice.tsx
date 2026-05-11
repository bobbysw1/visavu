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
import { PURPOSE_LABEL, type Purpose } from "@/lib/types";

export function VisaApplicationAdvice({
  purpose,
}: {
  purpose: Purpose;
}) {
  const advice = ADVICE_BY_PURPOSE[purpose];
  if (!advice) return null;

  return (
    <section className="mt-10 mb-2 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/15 overflow-hidden">
      <header className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-700 dark:text-emerald-300 mb-1">
          Make your case
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 leading-tight">
          Free guidance for your {PURPOSE_LABEL[purpose].toLowerCase()} application
        </h2>
        <p className="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-100/80 mt-1.5 leading-relaxed">
          The same things a £1,000 immigration consultation would tell you — what evidence
          caseworkers actually weight, a personal-statement skeleton you can adapt, common
          mistakes that get applications refused, and when it&apos;s worth hiring a lawyer.
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
                  {w.why}
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
                {p.prompt}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 italic">
          Tip: paste this skeleton into Claude or ChatGPT with your specific facts — the AI
          will turn rough notes into a tightly-structured statement caseworkers expect.
        </p>
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
              <span>{tip}</span>
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
                  • {t}
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
                  • {t}
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
