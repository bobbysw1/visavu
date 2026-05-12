"use client";

/**
 * Smart questionnaire wizard — twelve-field guided flow that ends in a
 * personalised recommendations dashboard.
 *
 * Single client component. All answers live in React state + mirrored to
 * localStorage so the user can refresh or come back and resume. The
 * "review" step calls a Server Action that runs the recommendation
 * engine; the results dashboard renders inline (no second page load).
 *
 * Smart skip: visibleSteps() decides which steps apply for the chosen
 * goal — a "visit short-term" answer skips income / family / capital
 * entirely so the flow stays fast.
 */
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CountryCombobox } from "./CountryCombobox";
import { RecommendationResults } from "./RecommendationResults";
import {
  type QuestionnaireAnswers,
  type QuestionnaireGoal,
  type EducationLevel,
  type Occupation,
  type IncomeBand,
  type NetWorthBand,
  type InvestmentCapital,
  type FamilyStatus,
  type RemoteWork,
  type Timeline,
  type LongTermGoal,
  type CriminalRecord,
  type StepId,
  GOAL_LABEL,
  visibleSteps,
} from "@/lib/questionnaire";
import { runQuestionnaire } from "@/app/(site)/find-my-visa/actions";
import type { Recommendations } from "@/lib/findMyVisa";
import { nameFor } from "@/lib/countries";

const STORAGE_KEY = "visavu:find-my-visa:v1";
/** Separate key for the bit other pages read — just the inferred profile +
 *  passport. Stable so it survives wizard-state schema changes. */
const PROFILE_STORAGE_KEY = "visavu:saved-profile:v1";

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High school" },
  { value: "trade_cert", label: "Trade certificate" },
  { value: "associate", label: "Associate / diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
];

const OCCUPATION_OPTIONS: { value: Occupation; label: string; emoji: string }[] = [
  { value: "healthcare", label: "Healthcare / medical", emoji: "🩺" },
  { value: "engineering_tech", label: "Engineering / tech", emoji: "🛠️" },
  { value: "trades", label: "Skilled trades", emoji: "🔧" },
  { value: "education_research", label: "Education / research", emoji: "🎓" },
  { value: "finance_legal", label: "Finance / legal", emoji: "📊" },
  { value: "creative_media", label: "Creative / media", emoji: "🎨" },
  { value: "service_hospitality", label: "Service / hospitality", emoji: "🍽️" },
  { value: "agriculture", label: "Agriculture", emoji: "🌾" },
  { value: "executive_management", label: "Executive / management", emoji: "💼" },
  { value: "self_employed", label: "Self-employed / founder", emoji: "🚀" },
  { value: "student", label: "Student", emoji: "📚" },
  { value: "retired", label: "Retired", emoji: "🌅" },
  { value: "other", label: "Other", emoji: "💡" },
];

const INCOME_OPTIONS: { value: IncomeBand; label: string }[] = [
  { value: "under_25k", label: "Under $25k" },
  { value: "25_50k", label: "$25k – $50k" },
  { value: "50_100k", label: "$50k – $100k" },
  { value: "100_200k", label: "$100k – $200k" },
  { value: "200k_plus", label: "$200k+" },
];

const NET_WORTH_OPTIONS: { value: NetWorthBand; label: string }[] = [
  { value: "under_100k", label: "Under $100k" },
  { value: "100k_500k", label: "$100k – $500k" },
  { value: "500k_2m", label: "$500k – $2m" },
  { value: "2m_5m", label: "$2m – $5m" },
  { value: "5m_plus", label: "$5m+" },
];

const CAPITAL_OPTIONS: { value: InvestmentCapital; label: string }[] = [
  { value: "none", label: "None" },
  { value: "under_100k", label: "Under $100k" },
  { value: "100k_500k", label: "$100k – $500k" },
  { value: "500k_2m", label: "$500k – $2m" },
  { value: "2m_plus", label: "$2m+" },
];

const FAMILY_OPTIONS: { value: FamilyStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "partner_unmarried", label: "Unmarried partner" },
  { value: "married_no_kids", label: "Married, no kids" },
  { value: "married_with_kids", label: "Married with kids" },
  { value: "single_parent", label: "Single parent" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "zh", label: "Mandarin" },
  { value: "ar", label: "Arabic" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
  { value: "ko", label: "Korean" },
];

const REMOTE_WORK_OPTIONS: { value: RemoteWork; label: string }[] = [
  { value: "yes_employer", label: "Yes — salaried, employer abroad" },
  { value: "yes_freelance", label: "Yes — freelance / contract" },
  { value: "yes_own_business", label: "Yes — I run my own business" },
  { value: "no", label: "No — I need local employment" },
];

const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "0_6_months", label: "Within 6 months" },
  { value: "6_12_months", label: "6 – 12 months" },
  { value: "1_2_years", label: "1 – 2 years" },
  { value: "2_5_years", label: "2 – 5 years" },
  { value: "no_rush", label: "No rush — researching" },
];

const LONG_TERM_OPTIONS: { value: LongTermGoal; label: string }[] = [
  { value: "citizenship", label: "Eventually get citizenship" },
  { value: "permanent_residency", label: "Permanent residency" },
  { value: "long_stay_no_pr", label: "Multi-year stay, no PR needed" },
  { value: "short_term_stay", label: "Short-term experience only" },
];

const CRIMINAL_OPTIONS: { value: CriminalRecord; label: string }[] = [
  { value: "none", label: "No criminal record" },
  { value: "minor", label: "Minor offence (traffic, civil)" },
  { value: "serious", label: "Serious offence (felony, conviction)" },
];

export function QuestionnaireWizard() {
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [hydrated, setHydrated] = useState(false);
  const [pos, setPos] = useState(0);
  const [results, setResults] = useState<Recommendations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setAnswers(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore quota / safari private */
    }
  }, [answers, hydrated]);

  const steps = useMemo(() => visibleSteps(answers), [answers]);
  const currentStep = steps[Math.min(pos, steps.length - 1)] as StepId | undefined;

  if (results) {
    return (
      <RecommendationResults
        results={results}
        passportIso2={answers.passportIso2 ?? ""}
        onRestart={() => {
          setResults(null);
          setAnswers({});
          setPos(0);
          try {
            window.localStorage.removeItem(STORAGE_KEY);
            window.localStorage.removeItem(PROFILE_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }}
      />
    );
  }

  const progressPct = Math.round(((pos + 1) / steps.length) * 100);

  function update<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setPos((p) => Math.min(p + 1, steps.length - 1));
  }
  function back() {
    setPos((p) => Math.max(p - 1, 0));
  }

  function canAdvance(): boolean {
    if (!currentStep) return false;
    switch (currentStep) {
      case "nationality":
        return Boolean(answers.passportIso2);
      case "goal":
        return Boolean(answers.goal);
      default:
        return true; // all other steps optional
    }
  }

  function submit() {
    if (!answers.passportIso2 || !answers.goal) {
      setError("Pick your nationality and main goal before generating recommendations.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const r = await runQuestionnaire(answers as QuestionnaireAnswers);
        setResults(r);
        // Remember the inferred profile so every other page on the site
        // (ProfileFilter on result pages, comparison, etc.) can use it.
        try {
          window.localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify({
              profile: r.profile,
              passportIso2: answers.passportIso2 ?? null,
              savedAt: new Date().toISOString(),
            }),
          );
        } catch {
          /* ignore quota / safari private */
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError("Couldn't generate recommendations. Please try again.");
      }
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 font-semibold mb-2">
          Optional · sharpens every result
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Tell us about you, get sharper visa matches.
        </h1>
        <p className="text-neutral-700 dark:text-neutral-300 text-base">
          Visa eligibility is shaped by who you are — occupation, capital, family, timeline,
          long-term goals. Share what you&apos;re comfortable with and we&apos;ll prioritise the
          visas you actually qualify for, on this page <em>and</em> on every direct route lookup
          you do afterwards. Skip any question you&apos;d rather not answer.
        </p>
      </header>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-1.5">
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold">
            Step {Math.min(pos + 1, steps.length)} of {steps.length}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{progressPct}%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 sm:p-7 mb-5">
        {renderStep(currentStep, answers, update)}
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={pos === 0}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          ← Back
        </button>
        {currentStep === "review" ? (
          <button
            type="button"
            onClick={submit}
            disabled={pending || !canAdvance()}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Generating…" : "Get my recommendations →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance() || pos >= steps.length - 1}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>}

      <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
        Your answers stay in this browser unless you submit them. Recommendations are based on
        our visa-rules database and country metrics — they are not personalised legal advice.
        See <Link href="/disclaimer" className="underline hover:no-underline">disclaimer</Link>.
      </p>
    </main>
  );
}

function renderStep(
  step: StepId | undefined,
  answers: Partial<QuestionnaireAnswers>,
  update: <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => void,
) {
  if (!step) return null;
  switch (step) {
    case "nationality":
      return (
        <StepShell title="What passport do you hold?" subtitle="The main passport you plan to apply with.">
          <CountryCombobox
            label="My passport"
            mode="nationality"
            value={answers.passportIso2 ?? ""}
            onChange={(v) => update("passportIso2", v)}
            placeholder="e.g. British, Brazilian, Indian"
            required
          />
        </StepShell>
      );

    case "goal":
      return (
        <StepShell title="What's your main goal?" subtitle="Pick the option that fits closest — we'll fine-tune later.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(GOAL_LABEL) as QuestionnaireGoal[]).map((g) => {
              const meta = GOAL_LABEL[g];
              const on = answers.goal === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => update("goal", g)}
                  className={`text-left p-4 rounded-xl border transition ${
                    on
                      ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/30 ring-2 ring-blue-500/30"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                >
                  <p className="text-2xl mb-1" aria-hidden>{meta.emoji}</p>
                  <p className="font-semibold text-sm mb-0.5">{meta.label}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">{meta.subtitle}</p>
                </button>
              );
            })}
          </div>
        </StepShell>
      );

    case "destination":
      return (
        <StepShell
          title="Anywhere in mind?"
          subtitle="Optional — pick a country or skip if you want suggestions across the board."
        >
          <CountryCombobox
            label="Destination"
            value={answers.desiredDestinationIso2 ?? ""}
            onChange={(v) => update("desiredDestinationIso2", v)}
            placeholder="e.g. Portugal, Canada, Singapore"
          />
          {answers.desiredDestinationIso2 && (
            <button
              type="button"
              onClick={() => update("desiredDestinationIso2", null)}
              className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 underline"
            >
              Clear — show me everywhere
            </button>
          )}
        </StepShell>
      );

    case "education_occupation":
      return (
        <StepShell title="Education & work" subtitle="Helps us match you to skilled-migration occupation lists.">
          <Group label="Highest education">
            <RadioPills
              value={answers.educationLevel ?? null}
              onChange={(v) => update("educationLevel", v)}
              options={EDUCATION_OPTIONS}
            />
          </Group>
          <Group label="Occupation">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {OCCUPATION_OPTIONS.map((o) => {
                const on = answers.occupation === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => update("occupation", o.value)}
                    className={`text-left p-3 rounded-lg border transition text-sm ${
                      on
                        ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/30 ring-2 ring-blue-500/30"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                    }`}
                  >
                    <span className="mr-1.5" aria-hidden>{o.emoji}</span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Group>
        </StepShell>
      );

    case "income_capital":
      return (
        <StepShell title="Income & investable capital" subtitle="Honest answers unlock golden-visa + investor pathways the right way.">
          <Group label="Annual income (USD equivalent)">
            <RadioPills value={answers.income ?? null} onChange={(v) => update("income", v)} options={INCOME_OPTIONS} />
          </Group>
          <Group label="Net worth">
            <RadioPills value={answers.netWorth ?? null} onChange={(v) => update("netWorth", v)} options={NET_WORTH_OPTIONS} />
          </Group>
          <Group label="Investable capital you'd commit for residency">
            <RadioPills
              value={answers.investmentCapital ?? null}
              onChange={(v) => update("investmentCapital", v)}
              options={CAPITAL_OPTIONS}
            />
          </Group>
        </StepShell>
      );

    case "family":
      return (
        <StepShell title="Family status" subtitle="Affects family-reunion timelines, dependant rules, and tax.">
          <RadioPills
            value={answers.familyStatus ?? null}
            onChange={(v) => update("familyStatus", v)}
            options={FAMILY_OPTIONS}
          />
        </StepShell>
      );

    case "language":
      return (
        <StepShell title="Languages you speak well" subtitle="Multi-select. Affects language tests + integration requirements.">
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((l) => {
              const on = (answers.languages ?? []).includes(l.value);
              return (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => {
                    const cur = answers.languages ?? [];
                    update("languages", on ? cur.filter((x) => x !== l.value) : [...cur, l.value]);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                    on
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                      : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </StepShell>
      );

    case "remote_work":
      return (
        <StepShell title="Can you work remotely?" subtitle="Critical for digital-nomad and remote-residency routes.">
          <RadioPills
            value={answers.remoteWork ?? null}
            onChange={(v) => update("remoteWork", v)}
            options={REMOTE_WORK_OPTIONS}
            stack
          />
        </StepShell>
      );

    case "timeline":
      return (
        <StepShell title="When do you need to be there?" subtitle="Drives the cut-off on processing time — we won't recommend routes that miss your window.">
          <RadioPills
            value={answers.timeline ?? null}
            onChange={(v) => update("timeline", v)}
            options={TIMELINE_OPTIONS}
            stack
          />
        </StepShell>
      );

    case "long_term_goals":
      return (
        <StepShell title="Long-term goal" subtitle="Multi-select. Determines whether we prioritise PR-track routes.">
          <div className="flex flex-wrap gap-2">
            {LONG_TERM_OPTIONS.map((o) => {
              const on = (answers.longTermGoals ?? []).includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    const cur = answers.longTermGoals ?? [];
                    update("longTermGoals", on ? cur.filter((x) => x !== o.value) : [...cur, o.value]);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                    on
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                      : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </StepShell>
      );

    case "criminal_record":
      return (
        <StepShell
          title="Criminal record"
          subtitle="Many visa applications ask. Be honest — we don't share this anywhere; it just helps us flag risks."
        >
          <RadioPills
            value={answers.criminalRecord ?? null}
            onChange={(v) => update("criminalRecord", v)}
            options={CRIMINAL_OPTIONS}
            stack
          />
        </StepShell>
      );

    case "review":
      return (
        <StepShell title="Review your answers" subtitle="One click and we'll run them against every visa we've indexed.">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Row label="Passport" value={answers.passportIso2 ? `${nameFor(answers.passportIso2)} (${answers.passportIso2})` : "—"} />
            <Row label="Goal" value={answers.goal ? GOAL_LABEL[answers.goal].label : "—"} />
            <Row label="Destination" value={answers.desiredDestinationIso2 ? nameFor(answers.desiredDestinationIso2) : "Open"} />
            <Row label="Education" value={fmt(EDUCATION_OPTIONS, answers.educationLevel)} />
            <Row label="Occupation" value={fmt(OCCUPATION_OPTIONS, answers.occupation)} />
            <Row label="Income" value={fmt(INCOME_OPTIONS, answers.income)} />
            <Row label="Net worth" value={fmt(NET_WORTH_OPTIONS, answers.netWorth)} />
            <Row label="Investable capital" value={fmt(CAPITAL_OPTIONS, answers.investmentCapital)} />
            <Row label="Family" value={fmt(FAMILY_OPTIONS, answers.familyStatus)} />
            <Row label="Languages" value={(answers.languages ?? []).map((l) => fmt(LANGUAGE_OPTIONS, l)).join(", ") || "—"} />
            <Row label="Remote work" value={fmt(REMOTE_WORK_OPTIONS, answers.remoteWork)} />
            <Row label="Timeline" value={fmt(TIMELINE_OPTIONS, answers.timeline)} />
            <Row label="Long-term goals" value={(answers.longTermGoals ?? []).map((l) => fmt(LONG_TERM_OPTIONS, l)).join(", ") || "—"} />
            <Row label="Criminal record" value={fmt(CRIMINAL_OPTIONS, answers.criminalRecord)} />
          </dl>
        </StepShell>
      );
  }
}

function fmt<T extends string>(opts: { value: T; label: string }[], v: T | null | undefined): string {
  if (!v) return "—";
  return opts.find((o) => o.value === v)?.label ?? String(v);
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-bold text-lg sm:text-xl mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">{subtitle}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function RadioPills<T extends string>({
  value,
  onChange,
  options,
  stack,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  stack?: boolean;
}) {
  return (
    <div className={stack ? "space-y-2" : "flex flex-wrap gap-2"}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`${
              stack ? "w-full text-left" : ""
            } text-sm font-medium px-3.5 py-2 rounded-lg border transition ${
              on
                ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 dark:border-neutral-900 pb-1.5">
      <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="font-medium text-neutral-900 dark:text-neutral-100 text-right">{value}</dd>
    </div>
  );
}
