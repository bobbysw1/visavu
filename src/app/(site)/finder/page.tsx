import Link from "next/link";
import { Suspense } from "react";
import { COUNTRY_LIST, flagEmoji, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import {
  findDestinations,
  type FinderGoal,
  FINDER_GOAL_LABEL,
} from "@/lib/finder";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata = {
  title: `Where can I go? — visa finder · ${SITE.name}`,
  description:
    "Pick your passport and what you want to do. We'll show every country open to you for that goal — visa-free, e-Visa, Working Holiday, Digital Nomad, retirement, investment.",
  alternates: { canonical: absoluteUrl("/finder") },
};

const GOALS: FinderGoal[] = [
  "visit",
  "remote_work",
  "work_temporary",
  "live_work",
  "study",
  "retire",
  "invest",
];

const GOAL_BLURB: Record<FinderGoal, string> = {
  visit: "Holidays, family visits, short business trips. Up to ~90 days.",
  remote_work: "Stay 3-24 months working for a non-local employer. Income threshold typical.",
  work_temporary: "12-24 month Working Holiday Visas. Age 18-30 (some 35).",
  live_work: "Skilled-worker, employer-sponsored, talent-visa long-stay programs.",
  study: "Bachelor's, master's, language schools. Often path to post-study work.",
  retire: "Pension, savings, or passive-income visas. Often path to permanent residency.",
  invest: "Citizenship-by-investment, Golden Visas, Gold Card programs.",
};

const STATUS_BADGE: Record<string, string> = {
  visa_free: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  visa_free_with_eta: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  visa_on_arrival: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-200",
  e_visa: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
  embassy_visa: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
};

function isFinderGoal(value: string | null | undefined): value is FinderGoal {
  return !!value && (GOALS as string[]).includes(value);
}

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount == null || !currency) return "—";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(0)} ${currency}`;
  }
}

export default async function FinderPage({
  searchParams,
}: {
  searchParams: Promise<{ passport?: string; goal?: string }>;
}) {
  const sp = await searchParams;
  const passport = sp.passport?.toUpperCase();
  const goal = isFinderGoal(sp.goal) ? sp.goal : undefined;
  const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
  const validPassport = passport && validIso.has(passport) ? passport : null;
  const invalidPassportSubmitted = !!passport && !validPassport;

  const results = validPassport && goal ? await findDestinations(validPassport, goal, { limit: 60 }) : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Where can I go?
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Pick your passport and what you want to do. We&apos;ll show every country open to you,
          ranked easiest first.
        </p>
      </header>

      <form
        method="GET"
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div>
          <label htmlFor="passport-select" className="block text-sm font-semibold mb-2">
            Your nationality
          </label>
          <select
            id="passport-select"
            name="passport"
            required
            defaultValue={validPassport ?? ""}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="" disabled>Select a nationality…</option>
            {COUNTRY_LIST.map((c) => (
              <option key={c.iso2} value={c.iso2}>
                {c.flag} {nationalityFor(c.iso2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="goal-select" className="block text-sm font-semibold mb-2">
            What do you want to do?
          </label>
          <select
            id="goal-select"
            name="goal"
            required
            defaultValue={goal ?? ""}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="" disabled>Select a goal…</option>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {FINDER_GOAL_LABEL[g]}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button
            type="submit"
            className="plausible-event-name=FinderSubmitted px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          >
            Show me where I can go
          </button>
          {validPassport && goal && (
            <Link
              href="/finder"
              className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {invalidPassportSubmitted && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-200">
          <strong>{passport}</strong> isn&apos;t a valid passport code. Pick from the list above
          or check the ISO 3166-1 alpha-2 code (e.g. <code>US</code>, <code>GB</code>,{" "}
          <code>IN</code>).
        </div>
      )}

      {(!validPassport || !goal) && (
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
          <h2 className="font-semibold text-base mb-3">Pick a goal to start</h2>
          <ul className="space-y-2 text-sm">
            {GOALS.map((g) => (
              <li key={g} className="flex gap-3">
                <span className="font-medium min-w-[180px]">{FINDER_GOAL_LABEL[g]}</span>
                <span className="text-neutral-600 dark:text-neutral-400">{GOAL_BLURB[g]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {validPassport && goal && (
        <Suspense fallback={<p className="text-sm text-neutral-500">Looking up your options…</p>}>
          <ResultsBlock passport={validPassport} goal={goal} results={results} />
        </Suspense>
      )}
    </main>
  );
}

function ResultsBlock({
  passport,
  goal,
  results,
}: {
  passport: string;
  goal: FinderGoal;
  results: Awaited<ReturnType<typeof findDestinations>>;
}) {
  if (results.length === 0) {
    return (
      <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-5 sm:p-6">
        <h2 className="font-semibold text-base mb-2">Nothing in our index for this combination yet</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
          We don&apos;t have structured records for {nationalityFor(passport)} →{" "}
          <strong>{FINDER_GOAL_LABEL[goal].toLowerCase()}</strong>. Try a different goal or check
          your passport&apos;s general overview.
        </p>
        <Link
          href={`/passport/${passport.toLowerCase()}`}
          className="text-sm text-blue-700 dark:text-blue-400 underline"
        >
          See all destinations for {nationalityFor(passport)} passport →
        </Link>
      </section>
    );
  }

  const easyCount = results.filter((r) => r.score >= 80).length;
  const mediumCount = results.filter((r) => r.score >= 50 && r.score < 80).length;
  const hardCount = results.filter((r) => r.score < 50).length;

  return (
    <section>
      <header className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold">
          {results.length} options for {nationalityFor(passport)} → {FINDER_GOAL_LABEL[goal].toLowerCase()}
        </h2>
        <p className="text-xs text-neutral-500">
          {easyCount} easy · {mediumCount} moderate · {hardCount} embassy
        </p>
      </header>
      <ol className="space-y-2">
        {results.map((r) => (
          <li key={r.optionId}>
            <Link
              href={`/${passport.toLowerCase()}/${r.destinationIso2.toLowerCase()}?purpose=${r.purpose}`}
              className="block rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <p className="font-semibold text-base flex items-center gap-2">
                  <span className="text-xl" aria-hidden>{flagEmoji(r.destinationIso2)}</span>
                  <span>{nameFor(r.destinationIso2)}</span>
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      STATUS_BADGE[r.status] ??
                      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {r.rationale}
                  </span>
                </div>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
                {r.label}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                {r.maxStayDays != null ? `Up to ${r.maxStayDays} days` : "Stay varies"}
                {" · "}
                Fee {fmtMoney(r.feeAmountMinor, r.feeCurrency)}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
