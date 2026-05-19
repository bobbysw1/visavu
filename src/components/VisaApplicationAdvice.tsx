/**
 * Visa-application advice — editorial layout (May-2026 redesign).
 *
 * Renders the route-specific or per-purpose AdviceBlock content as a
 * sequence of named editorial sections rather than the single emerald-
 * bordered panel it used to be. Each block (what carries weight, money
 * tips, lawyer triage, personal-statement skeleton) gets its own H2 in
 * the editorial serif so readers can scan or jump to the bit they need.
 *
 * Lives on /[passport]/[destination] result pages, between the Do-this-next
 * timeline and the alternatives panel.
 */
import { ADVICE_BY_PURPOSE } from "@/content/visaApplicationAdvice";
import { routeAdviceFor } from "@/content/routeAdvice";
import { PURPOSE_LABEL, type Purpose, type VisaStatus } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
// ClaudeTipCallout was deleted in favour of the new /documents hub —
// the AI-polish-your-documents prompt now lives there alongside the
// downloadable forms it applies to, rather than as a standalone pitch.

export function VisaApplicationAdvice({
  purpose,
  passportIso2,
  destinationIso2,
  primaryStatus,
}: {
  purpose: Purpose;
  passportIso2: string;
  destinationIso2: string;
  /** Skip when no visa actually needed. */
  primaryStatus?: VisaStatus | null;
}) {
  if (passportIso2.toUpperCase() === destinationIso2.toUpperCase()) return null;
  if (
    primaryStatus === "visa_free" ||
    primaryStatus === "visa_free_with_eta" ||
    primaryStatus === "refused"
  )
    return null;

  // Route-specific content wins over generic per-purpose fallback.
  const advice =
    routeAdviceFor(passportIso2, destinationIso2, purpose) ?? ADVICE_BY_PURPOSE[purpose];
  if (!advice) return null;

  const isRouteSpecific = routeAdviceFor(passportIso2, destinationIso2, purpose) !== null;

  const destName = nameFor(destinationIso2);
  const passportAdj = nationalityFor(passportIso2);
  const fillIn = (text: string): string =>
    text
      .replace(/\{destination\}/g, destName)
      .replace(/\{passport\}/g, passportAdj)
      .replace(/\{passportLower\}/g, passportAdj.toLowerCase());

  return (
    <div className="space-y-12">
      {/* ── WHAT CARRIES WEIGHT ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
          <h2 className="section-h2">What carries weight in the application</h2>
          <span className="kicker">
            {isRouteSpecific ? "★ hand-written for this route" : "route-specific"}
          </span>
        </div>
        <p className="lede text-[var(--color-ink)] leading-relaxed mb-6 max-w-3xl">
          {destName} caseworkers weight {advice.whatCarriesWeight.length} things heavily for{" "}
          {passportAdj.toLowerCase()} {PURPOSE_LABEL[purpose].toLowerCase()}-visa applicants. Get
          these right and you almost certainly get the visa; get any one wrong and you waste
          money on a refused application that haunts every future {destName} attempt.
        </p>
        <div className="space-y-5">
          {advice.whatCarriesWeight.map((w) => (
            <div key={w.label} className="border-l-2 border-[var(--color-ink)] pl-5 py-1">
              <h3 className="serif-display text-xl font-medium leading-tight">{w.label}</h3>
              <p className="text-sm text-[var(--color-ink)]/85 mt-1.5 leading-relaxed">
                {fillIn(w.why)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MONEY-SAVING TIPS ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
          <h2 className="section-h2">How to save money</h2>
          <span className="kicker">{advice.moneySavingTips.length} tips</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {advice.moneySavingTips.map((tip, i) => (
            <div key={tip} className="ink-card p-5">
              <div className="serif-display text-5xl text-[var(--color-accent)]/40 mb-2 leading-none tabular">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-sm text-[var(--color-ink)]/90 leading-relaxed">{fillIn(tip)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PERSONAL-STATEMENT SKELETON ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
          <h2 className="section-h2">Personal-statement skeleton</h2>
          <span className="kicker">{advice.personalStatementTemplate.length} sections</span>
        </div>
        <p className="text-sm text-[var(--color-ink-muted)] mb-5 max-w-3xl leading-relaxed">
          Fill each section with your own facts, dates and circumstances. The structure mirrors
          what {destName} caseworkers expect to find — copying the order makes their decision
          faster, which is good for you.
        </p>
        <ol className="space-y-3">
          {advice.personalStatementTemplate.map((p, i) => (
            <li key={p.heading} className="ink-card p-5 flex gap-4 items-start">
              <span className="serif-display text-3xl text-[var(--color-rule-strong)] leading-none tabular shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="serif-display text-lg font-medium leading-snug">{p.heading}</p>
                <p className="text-sm text-[var(--color-ink)]/85 mt-1 leading-relaxed">
                  {fillIn(p.prompt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── DIY vs LAWYER ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
          <h2 className="section-h2">When to DIY · when to hire a lawyer</h2>
          <span className="kicker">honest triage</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="ink-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
              <span className="kicker text-emerald-800 dark:text-emerald-300">You can DIY this</span>
            </div>
            <ul className="text-sm space-y-2.5 leading-relaxed">
              {advice.lawyerTriggers.diy.map((t) => (
                <li key={t} className="flex gap-2 text-[var(--color-ink)]/90">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden>
                    ✓
                  </span>
                  <span>{fillIn(t)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-2xl p-6 border border-amber-200 dark:border-amber-900"
            style={{ background: "rgba(254, 243, 199, 0.35)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden />
              <span className="kicker text-amber-800 dark:text-amber-300">Get a lawyer if…</span>
            </div>
            <ul className="text-sm space-y-2.5 leading-relaxed">
              {advice.lawyerTriggers.getALawyer.map((t) => (
                <li key={t} className="flex gap-2 text-[var(--color-ink)]/90">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" aria-hidden>
                    !
                  </span>
                  <span>{fillIn(t)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] italic mt-4 max-w-3xl">
          This guidance is general — not legal advice. For high-stakes routes (refusal history,
          criminal record, complex finances), spend the money on a qualified immigration adviser
          regulated by your destination (UK: OISC / SRA; AU: MARA; US: bar-admitted attorney).
        </p>
      </section>
    </div>
  );
}
