import { ExternalLink } from "lucide-react";
import type { ResolvedVisaOption, VisaStatus } from "@/lib/types";
import { PURPOSE_LABEL } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import { assessDifficulty } from "@/lib/difficulty";
import { assessRealism } from "@/lib/realism";
import { obstaclesFor } from "@/content/obstacles";
import { PurposeMetadataPanel } from "./PurposeMetadataPanel";
import { DifficultyMeter } from "./DifficultyMeter";
import { RealismMeter } from "./RealismMeter";
import { ApplicationChecklist } from "./ApplicationChecklist";
import { t, type Locale, DEFAULT_LOCALE } from "@/i18n/t";
import { Money } from "./Money";
import { GlossaryText } from "./GlossaryText";

const STATUS_LABEL: Record<ResolvedVisaOption["status"], string> = {
  visa_free: "Visa-free",
  visa_free_with_eta: "Visa-free with eTA",
  visa_on_arrival: "Visa on arrival",
  e_visa: "e-Visa",
  embassy_visa: "Embassy visa",
  restricted: "Restricted (case-by-case)",
  refused: "Entry generally refused",
};

const STATUS_BADGE: Record<ResolvedVisaOption["status"], string> = {
  visa_free: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  visa_free_with_eta: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  visa_on_arrival: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-200",
  e_visa: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
  embassy_visa: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  restricted: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
  refused: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
};

const BUCKET_LABEL: Record<ResolvedVisaOption["correctnessBucket"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
  unverified: "Unverified",
};

const BUCKET_DOT: Record<ResolvedVisaOption["correctnessBucket"], string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-orange-500",
  unverified: "bg-neutral-400",
};

function formatDate(iso: string | null, locale: Locale = DEFAULT_LOCALE): string {
  if (!iso) return "—";
  // Map our internal locale codes to BCP-47 tags. Most match directly.
  const bcp47: Record<Locale, string> = {
    en: "en", es: "es", fr: "fr", pt: "pt", ar: "ar", hi: "hi", zh: "zh", ru: "ru", id: "id",
  };
  return new Date(iso).toLocaleDateString(bcp47[locale] ?? "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function ResultCard({
  option,
  baselineTourismStatus = null,
  locale = DEFAULT_LOCALE,
}: {
  option: ResolvedVisaOption;
  /** The passport's tourism baseline access to the destination. Drives the
   *  passport-aware portion of the difficulty/realism scores. */
  baselineTourismStatus?: VisaStatus | null;
  locale?: Locale;
}) {
  const totalFees = option.fees
    .filter((f) => !f.optional)
    .reduce<{ amountMinor: number; currency: string } | null>((acc, f) => {
      if (!acc) return { amountMinor: f.amountMinor, currency: f.currency };
      if (acc.currency !== f.currency) return acc;
      return { amountMinor: acc.amountMinor + f.amountMinor, currency: acc.currency };
    }, null);

  const sourceHost = hostnameOf(option.primarySourceUrl);

  const obstaclesList = obstaclesFor(option.passportIso2, option.destinationIso2);
  const realismAssessment = assessRealism(option, obstaclesList, baselineTourismStatus);
  const showRealismHeadline = realismAssessment.score < 6;
  const headlineObstacles = obstaclesList.filter(
    (o) => o.severity === "critical" || o.severity === "caution",
  );

  return (
    <article className="ink-card overflow-hidden">
      {showRealismHeadline && (
        <div
          className={`px-6 py-4 border-b ${
            realismAssessment.bucket === "unlikely"
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wide uppercase text-neutral-600 dark:text-neutral-300">
              Approval realism
            </span>
            <span
              className={`text-base font-bold ${
                realismAssessment.bucket === "unlikely"
                  ? "text-red-800 dark:text-red-200"
                  : "text-amber-800 dark:text-amber-200"
              }`}
            >
              {realismAssessment.score}/10 — {realismAssessment.bucket === "unlikely" ? "Unlikely" : "Uncertain"}
            </span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {realismAssessment.bucket === "unlikely"
              ? "Real-world approval is the harder hurdle here than the visa rules themselves."
              : "Visa rules are not the whole story — approval depends heavily on the documents and circumstances you can show."}
          </p>
          {headlineObstacles.length > 0 && (
            <ul className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 space-y-1 list-disc list-inside marker:text-neutral-400">
              {headlineObstacles.slice(0, 2).map((o) => (
                <li key={o.id}>{o.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {option.programmeStatus && option.programmeStatus !== "active" && (
        <div className="px-6 py-3 bg-red-100 dark:bg-red-950/50 border-b border-red-300 dark:border-red-800 text-sm text-red-900 dark:text-red-100">
          <strong>
            {option.programmeStatus === "paused"
              ? "Programme currently paused"
              : option.programmeStatus === "wound_down"
              ? "Programme has been wound down"
              : "Programme status unverified"}
            .
          </strong>{" "}
          {option.programmeStatusNote ?? "Verify with the destination authority before applying."}
        </div>
      )}
      {option.crossCheckResult === "conflicts" && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900 text-sm text-red-900 dark:text-red-200">
          ⚠️ This conflicts with the {nameFor(option.destinationIso2)} foreign-affairs ministry —
          verify directly before booking. <a href={option.primarySourceUrl ?? "#"} className="underline" target="_blank" rel="noreferrer noopener">Open the official source →</a>
        </div>
      )}

      {/* Hero — stripped down: status pill, label, path. No duplicate confidence. */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded ${STATUS_BADGE[option.status]}`}>
            {t(`status.${option.status}`, locale)}
          </span>
          {option.crossCheckResult === "agrees" && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
              title={`Cross-checked against the ${nameFor(option.destinationIso2)} ministry of foreign affairs.`}
            >
              ✓ Confirmed against {nameFor(option.destinationIso2)} MFA
            </span>
          )}
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {PURPOSE_LABEL[option.purpose]}
          </span>
        </div>
        <h3 className="serif-display text-2xl sm:text-3xl font-medium leading-tight">{option.label}</h3>
      </div>

      <div className="px-6 pb-6">
        {/* Three core stats only — drop "Validity" which mostly duplicates Max stay. */}
        <dl className="grid grid-cols-3 gap-3 mb-5">
          <Stat
            label="Max stay"
            value={option.maxStayDays != null ? `${option.maxStayDays}` : "—"}
            sub={option.maxStayDays != null ? "days" : undefined}
          />
          <Stat
            label="Processing"
            value={
              option.processingTimeDaysMin != null && option.processingTimeDaysMax != null
                ? `${option.processingTimeDaysMin}–${option.processingTimeDaysMax}`
                : "—"
            }
            sub={option.processingTimeDaysMin != null ? "days" : undefined}
          />
          <Stat
            label="Fee"
            value={
              totalFees ? (
                <Money amountMinor={totalFees.amountMinor} currency={totalFees.currency} />
              ) : (
                "—"
              )
            }
          />
        </dl>

        {option.linkHealth === "broken" && (
          <div className="mb-3 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100">
            ⚠️ The official apply URL appears broken (404 / page moved). Try the destination&apos;s
            embassy directory before relying on the link below.
          </div>
        )}

        {/* Big primary CTA right where the eye lands. Disabled when the
            programme is paused / wound down. */}
        <div className="flex flex-wrap gap-2 mb-4">
          {option.applicationUrl && option.programmeStatus !== "paused" && option.programmeStatus !== "wound_down" && (
            <a
              className="plausible-event-name=ApplyClicked inline-flex items-center px-5 py-2.5 rounded-full bg-[var(--color-ink)] hover:opacity-90 text-[var(--color-paper)] text-sm font-semibold transition"
              href={option.applicationUrl}
              target="_blank"
              rel="noreferrer noopener"
              data-event-destination={option.destinationIso2}
              data-event-passport={option.passportIso2}
              data-event-purpose={option.purpose}
              data-event-status={option.status}
            >
              {t("ui.apply_on_official_site", locale)}
              <ExternalLink className="ml-2 opacity-90" size={16} aria-hidden="true" />
              {sourceHost && <span className="ml-1.5 opacity-80 font-normal">{sourceHost}</span>}
            </a>
          )}
          {(option.programmeStatus === "paused" || option.programmeStatus === "wound_down") && (
            <span className="inline-flex items-center px-5 py-2.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm font-semibold cursor-not-allowed line-through">
              {t("ui.apply_on_official_site", locale)}
            </span>
          )}
        </div>

        {/* Compact dual scoring chip — replaces the two full-size meters. */}
        <details className="mb-4 group">
          <summary
            className="list-none cursor-pointer"
            aria-label={`Difficulty ${assessDifficulty(option, baselineTourismStatus).score} out of 10, Realism ${realismAssessment.score} out of 10 — click to see why`}
          >
            <CompactScoreRow
              difficulty={assessDifficulty(option, baselineTourismStatus)}
              realism={realismAssessment}
            />
          </summary>
          <div className="mt-3 space-y-3">
            <DifficultyMeter assessment={assessDifficulty(option, baselineTourismStatus)} />
            <RealismMeter assessment={realismAssessment} />
          </div>
        </details>

        {/* Purpose-specific metadata block (only renders when there's something) */}
        <PurposeMetadataPanel purpose={option.purpose} metadata={option.purposeMetadata} />

        {/* Application checklist — collapsed by default for visa_free, open for the rest. */}
        <details
          className="mb-4 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          open={option.status !== "visa_free" && option.status !== "visa_free_with_eta"}
        >
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            Step-by-step checklist
          </summary>
          <div className="p-4">
            <ApplicationChecklist option={option} />
          </div>
        </details>

        {option.eta && (
          <div className="mb-4 p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-sm">
            <p className="font-semibold mb-1">Also requires {option.eta.name}</p>
            {option.eta.notes && (
              <p className="text-neutral-700 dark:text-neutral-300">{option.eta.notes}</p>
            )}
            {option.eta.applyUrl && (
              <a
                href={option.eta.applyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block mt-1.5 text-blue-700 dark:text-blue-300 underline font-medium"
              >
                Apply for {option.eta.name} →
              </a>
            )}
          </div>
        )}

        {/* Everything else folds into one disclosure to cut visual noise. */}
        <details className="text-sm">
          <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 py-1">
            Show full requirements, fees, and source
          </summary>
          <div className="mt-3 space-y-4">
            {(option.passportValidityMonthsRequired ||
              option.onwardTicketRequired ||
              option.proofOfFundsRequired ||
              option.proofOfAccommodationRequired ||
              option.biometricsRequired) && (
              <div className="flex flex-wrap gap-2">
                {option.passportValidityMonthsRequired && (
                  <Pill>Passport valid {option.passportValidityMonthsRequired}+ months</Pill>
                )}
                {option.onwardTicketRequired && <Pill>Onward ticket required</Pill>}
                {option.proofOfFundsRequired && <Pill>Proof of funds</Pill>}
                {option.proofOfAccommodationRequired && <Pill>Proof of accommodation</Pill>}
                {option.biometricsRequired && (
                  <Pill>Biometrics{option.biometricsLocation ? ` (${option.biometricsLocation})` : ""}</Pill>
                )}
              </div>
            )}

            {option.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-1.5">{t("ui.what_you_need", locale)}</h4>
                <ul className="space-y-1 text-neutral-700 dark:text-neutral-300 list-disc list-inside marker:text-neutral-400">
                  {option.requirements.map((r, i) => (
                    <li key={i}>
                      <GlossaryText text={r} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {option.fees.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-1.5">Fee breakdown</h4>
                <ul>
                  {option.fees.map((f, i) => (
                    <li
                      key={i}
                      className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 py-1.5"
                    >
                      <span>
                        {f.label ?? f.kind}
                        {f.optional && (
                          <span className="text-neutral-500 text-xs"> (optional)</span>
                        )}
                      </span>
                      <span className="text-right font-medium">
                        <Money amountMinor={f.amountMinor} currency={f.currency} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {option.primarySourceUrl && (
              <a
                className="inline-flex items-center text-[var(--color-ink)] underline underline-offset-4 hover:no-underline"
                href={option.primarySourceUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t("ui.view_primary_source", locale)} {sourceHost ? `(${sourceHost})` : ""} →
              </a>
            )}
          </div>
        </details>
      </div>

      <footer className="px-6 py-3 border-t border-[var(--color-rule)] bg-[var(--color-muted)]/40 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)]">
        <div className="flex flex-wrap gap-4">
          <span>
            {t("ui.verified", locale)}:{" "}
            <strong className="text-neutral-800 dark:text-neutral-200 font-medium">
              {option.lastVerifiedAt
                ? formatDate(option.lastVerifiedAt, locale)
                : t("ui.not_independently_verified", locale)}
            </strong>
          </span>
          <span>{t("ui.last_fetched", locale)}: {formatDate(option.lastFetchedAt, locale)}</span>
        </div>
        <a
          className="underline hover:no-underline"
          href={`/api/report?passport=${option.passportIso2}&destination=${option.destinationIso2}&purpose=${option.purpose}&visaOptionId=${option.id}`}
        >
          {t("ui.report_incorrect_info", locale)}
        </a>
      </footer>
    </article>
  );
}

function Stat({
  label,
  value,
  sub,
  sub2,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  sub2?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
        {label}
      </dt>
      <dd className="font-semibold text-base">
        {value}
        {sub && <span className="block text-xs font-normal text-neutral-500">{sub}</span>}
        {sub2 && <span className="block text-xs font-normal text-neutral-400 dark:text-neutral-500">{sub2}</span>}
      </dd>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
      {children}
    </span>
  );
}

function CompactScoreRow({
  difficulty,
  realism,
}: {
  difficulty: ReturnType<typeof assessDifficulty>;
  realism: ReturnType<typeof assessRealism>;
}) {
  const diffTone =
    difficulty.bucket === "easy"
      ? "text-emerald-700 dark:text-emerald-300"
      : difficulty.bucket === "medium"
      ? "text-orange-700 dark:text-orange-300"
      : "text-red-700 dark:text-red-300";
  const realTone =
    realism.bucket === "likely"
      ? "text-emerald-700 dark:text-emerald-300"
      : realism.bucket === "uncertain"
      ? "text-amber-700 dark:text-amber-300"
      : "text-red-700 dark:text-red-300";
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition">
      <div className="flex items-center gap-4 text-sm">
        <span>
          <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mr-1.5">
            Difficulty
          </span>
          <strong className={`font-semibold ${diffTone}`}>
            {difficulty.score}/10
          </strong>
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span>
          <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mr-1.5">
            Realism
          </span>
          <strong className={`font-semibold ${realTone}`}>
            {realism.score}/10
          </strong>
        </span>
      </div>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">Why? ▾</span>
    </div>
  );
}
