/**
 * Compact route-summary band. Sits directly under the RouteHero.
 *
 * Previously this was a 3–4 paragraph essay — useful content but it
 * dominated the page. The new band is a single sentence in a shaded
 * pill, colour-coded by the combination of:
 *
 *   - Difficulty score for the primary route
 *   - Number of available options
 *   - Status flags (refused / restricted)
 *
 * Bands:
 *   GREEN  — Very easy (difficulty ≤ 3 and entry allowed)
 *   AMBER  — Some friction (difficulty 4–7 or limited options)
 *   RED    — Very few / closed routes (refused / restricted / difficulty ≥ 8 / zero options)
 *
 * The full prose answer is preserved inside an inline `<details>` so
 * users who want the explanation can expand it.
 */
import type { ResolvedVisaOption, Purpose, VisaStatus } from "@/lib/types";
import { PURPOSE_LABEL } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { assessDifficulty } from "@/lib/difficulty";
import { assessRealism } from "@/lib/realism";
import { obstaclesFor, type Obstacle } from "@/content/obstacles";

type Band = "green" | "amber" | "red";

const BAND_TONE: Record<Band, { wrap: string; bar: string; head: string; body: string }> = {
  green: {
    wrap: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
    bar: "bg-emerald-500",
    head: "text-emerald-900 dark:text-emerald-200",
    body: "text-emerald-900/80 dark:text-emerald-200/80",
  },
  amber: {
    wrap: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
    bar: "bg-orange-500",
    head: "text-orange-900 dark:text-orange-200",
    body: "text-orange-900/80 dark:text-orange-200/80",
  },
  red: {
    wrap: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
    bar: "bg-red-500",
    head: "text-red-900 dark:text-red-200",
    body: "text-red-900/80 dark:text-red-200/80",
  },
};

function bandFor(
  diff: number | null,
  optCount: number,
  status: VisaStatus | undefined,
): Band {
  if (status === "refused" || status === "restricted") return "red";
  if (optCount === 0) return "red";
  if (diff == null) return "amber";
  if (diff >= 8) return "red";
  if (diff <= 3) return "green";
  return "amber";
}

const STATUS_PHRASE: Record<ResolvedVisaOption["status"], (purpose: Purpose) => string> = {
  visa_free: () => "don't need a visa",
  visa_free_with_eta: () => "don't need a visa — just a quick eTA before boarding",
  visa_on_arrival: () => "can get a visa on arrival at the border",
  e_visa: () => "apply for an e-Visa online before travel",
  embassy_visa: (p) =>
    p === "tourism" || p === "business" || p === "transit"
      ? "apply at the embassy or visa application centre before travel"
      : "go through the embassy or consulate before travel",
  restricted: () => "have their applications reviewed case by case — there's no automatic answer",
  refused: () => "are generally refused entry",
};

function headlineFor(band: Band, optionCount: number): string {
  if (band === "green" && optionCount <= 1) return "Very easy · 1 main route";
  if (band === "green") return `Very easy · ${optionCount} options`;
  if (band === "amber" && optionCount === 1) return "Some friction · 1 route";
  if (band === "amber") return `Some friction · ${optionCount} options`;
  if (optionCount === 0) return "Very limited";
  if (optionCount === 1) return "Difficult · 1 route";
  return `Difficult · ${optionCount} options`;
}

export function DirectAnswerCard({
  passportIso2,
  destinationIso2,
  purpose,
  options,
  baselineTourismStatus = null,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  options: ResolvedVisaOption[];
  baselineTourismStatus?: VisaStatus | null;
}) {
  const passportNationality = nationalityFor(passportIso2);
  const destName = nameFor(destinationIso2);
  const purposeLabel = PURPOSE_LABEL[purpose].toLowerCase();

  // Empty state — no resolved options. Still render a small band so the
  // user gets a clear "we don't have data yet" signal.
  if (options.length === 0) {
    const tone = BAND_TONE.amber;
    return (
      <div className={`rounded-lg border ${tone.wrap} mb-5 overflow-hidden`}>
        <div className="flex items-stretch">
          <div className={`w-1.5 ${tone.bar}`} aria-hidden />
          <div className="flex-1 px-3 py-2.5">
            <p className={`font-semibold text-xs uppercase tracking-wide mb-0.5 ${tone.head}`}>
              No verified data yet
            </p>
            <p className={`text-xs leading-snug ${tone.body}`}>
              We don&apos;t yet have a verified record for {passportNationality} travellers
              heading to {destName} for {purposeLabel}. Use the destination&apos;s embassy /
              consulate directory in the sidebar for the authoritative answer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const top = options[0];
  const difficulty = assessDifficulty(top, baselineTourismStatus);
  const obstacles: Obstacle[] = obstaclesFor(passportIso2, destinationIso2);
  const realism = assessRealism(top, obstacles, baselineTourismStatus);
  const band = bandFor(difficulty.score, options.length, top.status);
  const tone = BAND_TONE[band];
  const phrase = STATUS_PHRASE[top.status](purpose);
  const headline = headlineFor(band, options.length);

  // Short summary sentence — single line ideally.
  const summary = `Most ${passportNationality} travellers ${phrase} for ${purposeLabel} in ${destName}.`;

  // Critical obstacles get inline mention even in the compact band.
  const critical = obstacles.find((o) => o.severity === "critical");

  return (
    <div className={`rounded-lg border ${tone.wrap} mb-5 overflow-hidden`}>
      <div className="flex items-stretch">
        <div className={`w-1.5 ${tone.bar}`} aria-hidden />
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-0.5">
            <p className={`font-semibold text-xs uppercase tracking-wide ${tone.head}`}>
              {headline}
            </p>
            <p className={`text-[10px] font-mono opacity-70 ${tone.head}`}>
              difficulty {difficulty.score}/10 · realism {realism.score}/10
            </p>
          </div>
          <p className={`text-xs leading-snug ${tone.body}`}>
            {summary}{" "}
            <span className="font-medium">{top.label}</span>
            {top.maxStayDays != null && (
              <span>
                {" "}
                — up to {top.maxStayDays} days
                {top.status !== "embassy_visa" ? " per visit" : ""}.
              </span>
            )}
            {critical && (
              <span className="font-medium">
                {" "}
                One thing first: {critical.title.toLowerCase()}.
              </span>
            )}
          </p>
          {top.primarySourceUrl && (
            <p className={`mt-1 text-[10px] ${tone.body}`}>
              Source:{" "}
              <a
                href={top.primarySourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="underline hover:no-underline"
              >
                {hostnameOf(top.primarySourceUrl) ?? "primary source"}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
