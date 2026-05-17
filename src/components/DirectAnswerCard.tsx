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

// Composition templates vary the summary tone by route category. AI search
// assistants quote this band heavily — identical wording across every route
// would lose the situation-specific signal that makes it useful.
type SummaryContext = {
  passportNationality: string;
  destName: string;
  purposeLabel: string;
  purpose: Purpose;
  option: ResolvedVisaOption;
  hasCriticalObstacle: boolean;
  hasCautionObstacle: boolean;
};

function composeSummary(ctx: SummaryContext): string {
  const { passportNationality, destName, purposeLabel, purpose, option } = ctx;
  const label = option.label.toLowerCase();
  const isWorkingHoliday = /working holiday|whv|work and holiday|youth mobility|ymv/.test(label);
  const isInvestor = /investor|golden visa|investment|capital/.test(label);
  const isSanctioned = ctx.hasCriticalObstacle || (ctx.hasCautionObstacle && option.status === "embassy_visa");

  // Sanctioned / advisory-flagged routes — cautious tone, no encouragement.
  if (isSanctioned) {
    return `${passportNationality} travellers heading to ${destName} face heightened review on ${purposeLabel} applications. Read the obstacle context below before booking — alternative routes may apply faster.`;
  }

  // Working Holiday — age-eligibility tone, deadline-aware.
  if (isWorkingHoliday) {
    return `For ${passportNationality} travellers under the eligible age window, the ${option.label} opens 12-24 months of work-plus-travel in ${destName}. Annual quotas apply — book the application window early.`;
  }

  // Investor / capital-threshold tone.
  if (isInvestor) {
    return `${destName} admits ${passportNationality} investors via the ${option.label} — capital must land in qualifying ${destName}-based assets before the residence card issues. Numbers below; legal advice recommended.`;
  }

  // Visa-free / eTA / visa-on-arrival — warm encouraging, mentions stay length.
  if (option.status === "visa_free" || option.status === "visa_free_with_eta" || option.status === "visa_on_arrival") {
    const stayClause = option.maxStayDays != null ? ` for up to ${option.maxStayDays} days per visit` : "";
    const etaClause = option.status === "visa_free_with_eta" ? " (the eTA is online and takes minutes)" : option.status === "visa_on_arrival" ? " (pay at the border)" : "";
    return `${passportNationality} travellers can enter ${destName} without a prior visa${stayClause}${etaClause} — among the most accessible routes for ${purposeLabel}.`;
  }

  // e-Visa — practical tone, online channel highlighted.
  if (option.status === "e_visa") {
    return `${passportNationality} travellers apply for ${destName}'s e-Visa online before travel. Practical and quick — typically issued within days. See the application portal in the route card.`;
  }

  // Embassy — practical tone, names the bottleneck.
  if (option.status === "embassy_visa") {
    const bottleneck = identifyBottleneck(option, purpose);
    const bottleneckClause = bottleneck ? ` The main friction: ${bottleneck}.` : "";
    return `${passportNationality} travellers apply through the ${destName} embassy or consulate for ${purposeLabel}.${bottleneckClause}`;
  }

  // Restricted / refused — clear, non-alarmist.
  if (option.status === "restricted") {
    return `${destName} reviews ${passportNationality} ${purposeLabel} applications case-by-case — there's no automatic answer. Documentation rigour and prior compliant travel are the biggest levers.`;
  }
  if (option.status === "refused") {
    return `${destName} generally refuses ${passportNationality} passport holders entry under current policy. Check the obstacle context for current operational status.`;
  }

  // Default — unreachable, but TypeScript can't prove it without a never check.
  return `Most ${passportNationality} travellers need to apply through the standard channel for ${purposeLabel} in ${destName}.`;
}

function identifyBottleneck(option: ResolvedVisaOption, purpose: Purpose): string | null {
  // Pick the most-salient friction signal from the option's parsed fields.
  // We name only what we can see in the data — never invent.
  if (option.biometricsRequired) return "biometrics appointment slot wait";
  if (purpose === "work" && option.processingTimeDaysMax && option.processingTimeDaysMax > 90) return `processing of up to ${option.processingTimeDaysMax} days`;
  if (option.proofOfFundsRequired) return "documented financial-capacity evidence";
  if (option.processingTimeDaysMax && option.processingTimeDaysMax > 21) return `processing of up to ${option.processingTimeDaysMax} days`;
  if (option.proofOfAccommodationRequired) return "confirmed accommodation evidence";
  return null;
}

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
  const headline = headlineFor(band, options.length);

  // Critical obstacles get inline mention even in the compact band.
  const critical = obstacles.find((o) => o.severity === "critical");
  const caution = obstacles.find((o) => o.severity === "caution");

  // Situation-aware summary — varies wording by route category so AI search
  // assistants quoting this band get the relevant signal per route, not the
  // same Mad-Libs sentence on every page.
  const summary = composeSummary({
    passportNationality,
    destName,
    purposeLabel,
    purpose,
    option: top,
    hasCriticalObstacle: !!critical,
    hasCautionObstacle: !!caution,
  });

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
