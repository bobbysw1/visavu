/**
 * Single-zone banner picker for result pages.
 *
 * The result page used to stack up to three coloured warning blocks (recent
 * policy change, obstacle panel, realism headline). They competed for
 * attention and diluted each other. This component picks the ONE most
 * important banner to show and hides the rest. The rest remain available
 * on the inline ResultCard via the "Show full details" disclosure.
 *
 * Severity order:
 *   1. Critical obstacle  (red, highest)
 *   2. Conflict from cross-source check (red)
 *   3. Scheduled policy change with caution severity (amber)
 *   4. Recent policy change (info / caution)
 *   5. Caution obstacle (amber)
 *   6. Realism < 4 (red)
 *   7. Realism < 6 (amber)
 *   8. Info obstacle (blue, lowest)
 */
import Link from "next/link";
import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import type { Obstacle } from "@/content/obstacles";
import type { RecentPolicyChange } from "@/content/recentPolicyChanges";
import type { RealismAssessment } from "@/lib/realism";

type BannerSpec = {
  tone: "red" | "amber" | "blue";
  badge: string;
  title: string;
  body: string;
  references?: { label: string; url: string }[];
  /** Slug of the in-house guide that explains this change in depth. */
  guideSlug?: string;
};

function pickBanner({
  obstacles,
  policyChanges,
  realism,
}: {
  obstacles: Obstacle[];
  policyChanges: RecentPolicyChange[];
  realism: RealismAssessment | null;
}): BannerSpec | null {
  // 1. Critical obstacle.
  const critical = obstacles.find((o) => o.severity === "critical");
  if (critical) {
    return {
      tone: "red",
      badge: "Critical",
      title: critical.title,
      body: critical.body,
      references: critical.references,
    };
  }

  // 2. Caution-severity scheduled change OR breaking policy change.
  const cautionPolicy = policyChanges.find((c) => c.severity === "caution");
  if (cautionPolicy) {
    return {
      tone: "amber",
      badge: `Recent change · ${new Date(cautionPolicy.effectiveDate).toLocaleDateString("en", {
        year: "numeric",
        month: "short",
      })}`,
      title: cautionPolicy.title,
      body: cautionPolicy.body,
      references: cautionPolicy.references,
      guideSlug: cautionPolicy.guideSlug,
    };
  }

  // 3. Caution obstacle.
  const caution = obstacles.find((o) => o.severity === "caution");
  if (caution) {
    return {
      tone: "amber",
      badge: "Caution",
      title: caution.title,
      body: caution.body,
      references: caution.references,
    };
  }

  // 4. Realism < 4 — unlikely.
  if (realism && realism.score < 4) {
    return {
      tone: "red",
      badge: `Approval realism ${realism.score}/10`,
      title: "Real-world approval is the harder hurdle here than the visa rules themselves.",
      body: realism.reasons.slice(0, 2).map((r) => r.text).join(" · "),
    };
  }

  // 5. Scheduled / info policy change.
  const infoPolicy = policyChanges.find(
    (c) => c.severity === "info" || c.severity === "scheduled",
  );
  if (infoPolicy) {
    return {
      tone: infoPolicy.severity === "scheduled" ? "blue" : "amber",
      badge: `${infoPolicy.severity === "scheduled" ? "Upcoming" : "Recent"} change · ${new Date(
        infoPolicy.effectiveDate,
      ).toLocaleDateString("en", { year: "numeric", month: "short" })}`,
      title: infoPolicy.title,
      body: infoPolicy.body,
      references: infoPolicy.references,
      guideSlug: infoPolicy.guideSlug,
    };
  }

  // 6. Realism < 6 — uncertain.
  if (realism && realism.score < 6) {
    return {
      tone: "amber",
      badge: `Approval realism ${realism.score}/10`,
      title: "Visa rules aren't the whole story.",
      body: "Approval depends heavily on the documents and circumstances you can show. " +
        realism.reasons.slice(0, 1).map((r) => r.text).join(""),
    };
  }

  // 7. Info obstacle.
  const info = obstacles.find((o) => o.severity === "info");
  if (info) {
    return {
      tone: "blue",
      badge: "Context",
      title: info.title,
      body: info.body,
      references: info.references,
    };
  }

  return null;
}

const TONE_CLASSES: Record<
  BannerSpec["tone"],
  { container: string; badge: string; title: string; icon: typeof Info; iconColor: string }
> = {
  red: {
    container: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
    badge: "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100",
    title: "text-red-900 dark:text-red-100",
    icon: AlertOctagon,
    iconColor: "text-red-600 dark:text-red-400",
  },
  amber: {
    container: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
    title: "text-amber-900 dark:text-amber-100",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  blue: {
    container: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
    badge: "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
    title: "text-blue-900 dark:text-blue-100",
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

export function ResultBannerStack({
  obstacles,
  policyChanges,
  realism,
}: {
  obstacles: Obstacle[];
  policyChanges: RecentPolicyChange[];
  realism: RealismAssessment | null;
}) {
  const banner = pickBanner({ obstacles, policyChanges, realism });
  if (!banner) return null;

  const tone = TONE_CLASSES[banner.tone];
  const totalHidden =
    obstacles.length +
    policyChanges.length +
    (realism && realism.score < 6 ? 1 : 0) -
    1; // minus the one we're showing

  const Icon = tone.icon;
  return (
    <div className={`mb-6 rounded-lg border p-4 ${tone.container}`}>
      <div className="flex gap-3">
        <Icon className={`shrink-0 mt-0.5 ${tone.iconColor}`} size={20} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${tone.badge}`}>
              {banner.badge}
            </span>
          </div>
          <p className={`font-semibold text-base leading-snug ${tone.title} mb-1`}>{banner.title}</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
            {banner.body}
          </p>
          {(banner.references?.length || banner.guideSlug) && (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {banner.guideSlug && (
                <li>
                  <Link
                    href={`/guides/${banner.guideSlug}`}
                    className="text-blue-700 dark:text-blue-300 underline hover:no-underline font-semibold"
                  >
                    Read the full guide →
                  </Link>
                </li>
              )}
              {banner.references?.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-700 dark:text-blue-300 underline hover:no-underline"
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {totalHidden > 0 && (
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              {totalHidden} additional {totalHidden === 1 ? "warning is" : "warnings are"} folded into the
              result card below.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
