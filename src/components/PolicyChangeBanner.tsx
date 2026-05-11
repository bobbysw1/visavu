/**
 * Renders a yellow notice banner above result cards when a recent / scheduled
 * visa-policy change applies to the (passport, destination, purpose) cell
 * being viewed. Sourced from src/content/recentPolicyChanges.ts.
 */
import { policyChangesFor } from "@/content/recentPolicyChanges";

const TONE: Record<string, string> = {
  info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
  caution: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
  scheduled: "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30",
};

const SEVERITY_LABEL: Record<string, string> = {
  info: "Recent change",
  caution: "Recent change — pay attention",
  scheduled: "Upcoming change",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

export function PolicyChangeBanner({
  passportIso2,
  destinationIso2,
  purpose,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: string;
}) {
  const changes = policyChangesFor(passportIso2, destinationIso2, purpose);
  if (changes.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {changes.map((c) => (
        <article
          key={c.id}
          className={`rounded-lg border p-4 ${TONE[c.severity] ?? TONE.info}`}
        >
          <header className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
              {SEVERITY_LABEL[c.severity] ?? "Recent change"} · {fmtDate(c.effectiveDate)}
            </p>
          </header>
          <h3 className="font-semibold text-base leading-snug mb-1">{c.title}</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug mb-2">
            {c.body}
          </p>
          {c.references.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {c.references.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-700 dark:text-blue-400 underline hover:no-underline"
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
