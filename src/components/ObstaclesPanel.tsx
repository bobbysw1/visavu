/**
 * Obstacles / advisories panel — surfaces the knowledge-file context that
 * the structured visa data alone can't capture: sanctions, reciprocity
 * disputes, active-conflict effects, refusal-rate context, etc.
 *
 * Rendered prominently above the visa option cards so users see the
 * real-world friction before reading the procedural details.
 */
import type { Obstacle } from "@/content/obstacles";

const TONE: Record<Obstacle["severity"], { container: string; badge: string; label: string }> = {
  info: {
    container: "border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30",
    badge: "bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100",
    label: "Context",
  },
  caution: {
    container: "border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
    label: "Caution",
  },
  critical: {
    container: "border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30",
    badge: "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100",
    label: "Critical",
  },
};

export function ObstaclesPanel({ obstacles }: { obstacles: Obstacle[] }) {
  if (obstacles.length === 0) return null;

  // Order: critical → caution → info, then by id for stability.
  const SEVERITY_ORDER: Record<Obstacle["severity"], number> = { critical: 0, caution: 1, info: 2 };
  const sorted = [...obstacles].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.id.localeCompare(b.id),
  );

  return (
    <section className="mb-8 space-y-3" aria-label="Obstacles and advisories">
      <h2 className="text-base font-semibold">Real-world considerations</h2>
      {sorted.map((o) => {
        const tone = TONE[o.severity];
        return (
          <article
            key={o.id}
            className={`p-4 rounded-lg border ${tone.container}`}
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tone.badge}`}>
                  {tone.label}
                </span>
                <h3 className="font-semibold text-sm">{o.title}</h3>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                Updated {new Date(o.updatedAt).toLocaleDateString("en", { year: "numeric", month: "short" })}
              </span>
            </header>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {o.body}
            </p>
            {o.references.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {o.references.map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-700 dark:text-blue-400 underline hover:no-underline"
                    >
                      {ref.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </section>
  );
}
