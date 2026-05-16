/**
 * "Alternatives" panel on the result page. Shows a compact summary of every
 * OTHER purpose covered for the same (passport, destination) — so a user
 * searching for a tourist visa can see at-a-glance that this country pair
 * also has work, study, family, etc. routes.
 */
import Link from "next/link";
import type { ResolvedRoute } from "@/lib/resolver";
import { PURPOSE_LABEL } from "@/lib/types";
import { assessDifficulty } from "@/lib/difficulty";
import { routeHref } from "@/lib/routeHref";

export function AlternativesPanel({
  passportIso2,
  destinationIso2,
  alternatives,
}: {
  passportIso2: string;
  destinationIso2: string;
  alternatives: ResolvedRoute["alternatives"];
}) {
  if (alternatives.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-1">Other visa types for this route</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        We also have data on these visa categories between {passportIso2} and {destinationIso2}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {alternatives.map(({ purpose, options }) => {
          const headline = options[0];
          const difficulty = assessDifficulty(headline);
          const tone =
            difficulty.bucket === "easy"
              ? "border-emerald-200 dark:border-emerald-900"
              : difficulty.bucket === "medium"
              ? "border-amber-200 dark:border-amber-900"
              : "border-red-200 dark:border-red-900";

          return (
            <Link
              key={purpose}
              href={routeHref(passportIso2, destinationIso2, purpose)}
              className={`block p-4 rounded-lg border ${tone} bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition`}
            >
              <header className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {PURPOSE_LABEL[purpose]}
                </p>
                <span
                  className={`text-xs font-mono ${
                    difficulty.bucket === "easy"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : difficulty.bucket === "medium"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {difficulty.score}/10
                </span>
              </header>
              <p className="font-semibold text-sm mb-1 truncate">{headline.label}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {options.length} option{options.length === 1 ? "" : "s"} · See details
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
