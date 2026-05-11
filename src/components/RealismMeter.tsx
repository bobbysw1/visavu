/**
 * Realism meter — sibling to DifficultyMeter. Renders the 1–10 realism
 * score, the Likely / Uncertain / Unlikely bucket, and a "Why this score?"
 * disclosure showing the inputs (status base + obstacle penalties).
 */
import { type RealismAssessment, BUCKET_LABEL, BUCKET_BLURB } from "@/lib/realism";

const BUCKET_TONE: Record<RealismAssessment["bucket"], { dot: string; bar: string; chip: string }> = {
  likely: {
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  uncertain: {
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    chip: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  },
  unlikely: {
    dot: "bg-red-500",
    bar: "bg-red-500",
    chip: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  },
};

export function RealismMeter({ assessment }: { assessment: RealismAssessment }) {
  const tone = BUCKET_TONE[assessment.bucket];

  return (
    <section className="mb-5 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <header className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${tone.dot}`} aria-hidden />
          <h4 className="text-sm font-semibold">Approval realism</h4>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tone.chip}`}>
            {BUCKET_LABEL[assessment.bucket]}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{assessment.score}</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">/10</span>
        </div>
      </header>

      <div
        role="meter"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={assessment.score}
        aria-label={`Application realism: ${assessment.score} of 10 (${BUCKET_LABEL[assessment.bucket]})`}
        className="flex gap-1 mb-3"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={`flex-1 h-2 rounded-sm ${
              i < assessment.score
                ? tone.bar
                : "bg-neutral-200 dark:bg-neutral-800"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
        {BUCKET_BLURB[assessment.bucket]}
      </p>

      <details className="text-sm group">
        <summary className="cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100">
          What drives this score?
        </summary>
        <ul className="mt-2 space-y-1 text-xs">
          {assessment.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`shrink-0 font-mono w-10 text-right ${
                  r.delta > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : r.delta < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-500"
                }`}
              >
                {r.delta > 0 ? `+${r.delta}` : r.delta === 0 ? "—" : r.delta}
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">{r.text}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
