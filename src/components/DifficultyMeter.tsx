/**
 * Visual difficulty indicator. Renders the 1–10 score as a 10-segment bar
 * (so the score is visible even on a quick scan), the bucket label, and
 * a "Why this score?" disclosure that lists the modifiers.
 *
 * Scale: 1 = easiest, 10 = hardest. Colours come from BUCKET_PALETTE so
 * every difficulty surface in the app uses the exact same swatches.
 */
import {
  type DifficultyAssessment,
  BUCKET_LABEL,
  BUCKET_BLURB,
  BUCKET_PALETTE,
  BUCKET_RANGE,
} from "@/lib/difficulty";

export function DifficultyMeter({ assessment }: { assessment: DifficultyAssessment }) {
  const tone = BUCKET_PALETTE[assessment.bucket];
  const blurbId = `difficulty-blurb-${assessment.bucket}`;

  return (
    <section className="mb-5 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${tone.dot}`} aria-hidden />
          <h4 className="text-sm font-semibold">Difficulty</h4>
          <span
            className={`text-sm font-bold px-3 py-1 rounded uppercase tracking-wide ${tone.chip}`}
            title={BUCKET_BLURB[assessment.bucket]}
            aria-describedby={blurbId}
          >
            {BUCKET_LABEL[assessment.bucket]}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {BUCKET_RANGE[assessment.bucket]}
          </span>
        </div>
        <div
          className={`inline-flex items-baseline px-3 py-1 rounded ${tone.chip}`}
          title={`Score ${assessment.score} of 10`}
        >
          <span className="text-2xl font-bold leading-none">{assessment.score}</span>
          <span className="text-sm font-medium ml-0.5">/10</span>
        </div>
      </header>

      {/* 10-segment bar — segments left of the score are filled. */}
      <div
        role="meter"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={assessment.score}
        aria-label={`Visa difficulty: ${assessment.score} of 10 (${BUCKET_LABEL[assessment.bucket]})`}
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

      <p id={blurbId} className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
        {BUCKET_BLURB[assessment.bucket]}
      </p>

      <details className="text-sm group">
        <summary className="cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100">
          Why this score?
        </summary>
        <ul className="mt-2 space-y-1 text-xs">
          {assessment.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`shrink-0 font-mono w-10 text-right ${
                  r.delta > 0
                    ? "text-red-600 dark:text-red-400"
                    : r.delta < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-500"
                }`}
                title={
                  r.delta > 0
                    ? `Adds ${r.delta} to difficulty`
                    : r.delta < 0
                    ? `Subtracts ${Math.abs(r.delta)} from difficulty`
                    : "Base difficulty for this visa status"
                }
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
