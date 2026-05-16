/**
 * EditorialBillboard — the redesigned top-of-results hero.
 *
 * Replaces RouteHero + DirectAnswerCard at the top of every result page.
 *
 * Visual: full-bleed atmospheric destination photo with dark overlay,
 * billboard-sized serif answer headline ("You don't need a visa."),
 * status pill colour-coded green/amber/red, and a 4-cell metric strip
 * baked into the bottom of the band (Cost · Time · Difficulty · Max stay).
 *
 * Server component — no client state needed. All scoring is precomputed
 * by the page-level resolver call.
 */
import Image from "next/image";
import Link from "next/link";
import type { ResolvedVisaOption, Purpose, VisaStatus } from "@/lib/types";
import { PURPOSE_LABEL } from "@/lib/types";
import { flagEmoji, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { assessDifficulty, bucketFor, BUCKET_LABEL } from "@/lib/difficulty";
import type { CountryPhoto } from "@/lib/pexels";

type Band = "green" | "amber" | "red" | "neutral";

const PILL_TONE: Record<Band, { pill: string; dot: string }> = {
  green: {
    pill: "bg-emerald-500/15 text-emerald-100 ring-1 ring-inset ring-emerald-300/30",
    dot: "bg-emerald-400",
  },
  amber: {
    pill: "bg-amber-500/15 text-amber-100 ring-1 ring-inset ring-amber-300/30",
    dot: "bg-amber-400",
  },
  red: {
    pill: "bg-red-500/15 text-red-100 ring-1 ring-inset ring-red-300/30",
    dot: "bg-red-400",
  },
  neutral: {
    pill: "bg-white/10 text-white/90 ring-1 ring-inset ring-white/20",
    dot: "bg-white/60",
  },
};

function bandFor(status: VisaStatus | null, difficulty: number | null): Band {
  if (status === "refused") return "red";
  if (status === "restricted") return "red";
  if (status === "visa_free" || status === "visa_free_with_eta") return "green";
  if (difficulty == null) return "neutral";
  if (difficulty >= 7) return "red";
  if (difficulty >= 5) return "amber";
  return "green";
}

/** Big editorial headline that answers the question in one sentence.
 *  Intentionally generic ("You need a visa.") — the specific visa class
 *  (e-Visa, sponsored work, etc.) is described in the subline + status pill,
 *  not the H1. The headline is the binary yes/no the user came for. */
function answerHeadlineFor(
  status: VisaStatus | null,
  optionsCount: number,
): string {
  if (optionsCount === 0) return "No route is available right now.";
  switch (status) {
    case "visa_free":
      return "You don't need a visa.";
    case "visa_free_with_eta":
      return "You don't need a visa — just an eTA.";
    case "visa_on_arrival":
    case "e_visa":
    case "embassy_visa":
      return "You need a visa.";
    case "restricted":
      return "Your case is reviewed individually.";
    case "refused":
      return "This route is currently not viable.";
    default:
      return "Check the visa options below.";
  }
}

function pillLabelFor(status: VisaStatus | null, optionsCount: number): string {
  if (optionsCount === 0) return "No routes available";
  switch (status) {
    case "visa_free": return "Visa-free";
    case "visa_free_with_eta": return "eTA required";
    case "visa_on_arrival": return "Visa on arrival";
    case "e_visa": return "e-Visa";
    case "embassy_visa": return "Visa required";
    case "restricted": return "Case-by-case";
    case "refused": return "High refusal risk";
    default: return "—";
  }
}

function formatFee(option: ResolvedVisaOption): string {
  const total = option.fees
    .filter((f) => !f.optional)
    .reduce<{ amountMinor: number; currency: string } | null>((acc, f) => {
      if (!acc) return { amountMinor: f.amountMinor, currency: f.currency };
      if (acc.currency !== f.currency) return acc;
      return { amountMinor: acc.amountMinor + f.amountMinor, currency: acc.currency };
    }, null);
  if (!total) {
    return option.status === "visa_free" || option.status === "visa_free_with_eta"
      ? "£0"
      : "—";
  }
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: total.currency,
      maximumFractionDigits: 0,
    }).format(total.amountMinor / 100);
  } catch {
    return `${(total.amountMinor / 100).toFixed(0)} ${total.currency}`;
  }
}

function formatProcessing(option: ResolvedVisaOption): string {
  if (option.status === "visa_free") return "On arrival";
  if (option.status === "visa_free_with_eta") return "Minutes";
  if (option.status === "visa_on_arrival") return "On arrival";
  const min = option.processingTimeDaysMin;
  const max = option.processingTimeDaysMax;
  if (min == null && max == null) return "—";
  if (min != null && max != null && min === max) return `${min} days`;
  if (min != null && max != null) return `${min}–${max} days`;
  if (max != null) return `≤ ${max} days`;
  return `${min}+ days`;
}

function formatMaxStay(option: ResolvedVisaOption): string {
  const d = option.maxStayDays;
  if (d == null) return "—";
  if (d >= 365 * 2) return `${Math.round(d / 365)} years`;
  if (d >= 365) return "1 year";
  if (d >= 30) return `${Math.round(d / 30)} months`;
  return `${d} days`;
}

export function EditorialBillboard({
  passportIso2,
  destinationIso2,
  purpose,
  options,
  baselineTourismStatus = null,
  destinationPhoto = null,
  headline,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  options: ResolvedVisaOption[];
  baselineTourismStatus?: VisaStatus | null;
  /** Pexels photo for the destination — used as the atmospheric backdrop. */
  destinationPhoto?: CountryPhoto | null;
  /** Optional override for the kicker line (defaults to "{Nationality} passport · {purpose}"). */
  headline?: string;
}) {
  const primary = options[0] ?? null;
  const status = primary?.status ?? null;
  const diff = primary ? assessDifficulty(primary, baselineTourismStatus).score : null;
  const band = bandFor(status, diff);
  const tone = PILL_TONE[band];

  const answer = answerHeadlineFor(status, options.length);
  const pillLabel = pillLabelFor(status, options.length);
  const subline = primary
    ? buildSubline(primary, purpose)
    : "Lookup is temporarily unavailable for this route.";

  return (
    <section
      className="relative overflow-hidden rounded-3xl mb-8 isolate"
      style={{ background: "#0c0a09" }}
    >
      {/* Atmospheric photo background. Tinted with a dark gradient so the
          headline reads cleanly regardless of the source image's contrast. */}
      {destinationPhoto?.url && (
        <div className="absolute inset-0 overflow-hidden -z-10">
          <Image
            src={destinationPhoto.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover opacity-55 ken-burns"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative px-6 sm:px-12 lg:px-16 py-14 sm:py-20 lg:py-24 text-white">
        <div className="flex items-center flex-wrap gap-3 mb-6">
          <span className="text-3xl" aria-hidden>{flagEmoji(passportIso2)}</span>
          <span className="text-white/40">→</span>
          <span className="text-3xl" aria-hidden>{flagEmoji(destinationIso2)}</span>
          <span className="ml-3 kicker text-white/70">
            {headline ?? `${nationalityFor(passportIso2)} passport · ${PURPOSE_LABEL[purpose].toLowerCase()}`}
          </span>
        </div>

        <h1 className="billboard max-w-3xl">{answer}</h1>

        <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
          {subline}
        </p>

        <div
          className={`mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${tone.pill}`}
        >
          <span className={`w-2 h-2 rounded-full ${tone.dot}`} aria-hidden />
          <span>{pillLabel}</span>
          {primary?.maxStayDays != null && (
            <span className="opacity-80">· {formatMaxStay(primary)}</span>
          )}
        </div>

        {/* See-all-destinations link from the passport */}
        <p className="mt-6 text-sm text-white/60">
          <Link
            href={`/passport/${passportIso2.toLowerCase()}`}
            className="underline underline-offset-4 hover:text-white hover:no-underline"
          >
            See all destinations for {nationalityFor(passportIso2)} travellers
          </Link>
        </p>
      </div>

      {/* Metric strip — paper-backed band glued to the bottom of the hero. */}
      {primary && (
        <div className="relative bg-[var(--color-paper-elev)]/95 backdrop-blur grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--color-rule)]">
          <Metric label="Cost" value={formatFee(primary)} />
          <Metric label="Time to get it" value={formatProcessing(primary)} />
          <Metric
            label="Difficulty"
            value={diff != null ? `${diff}/10` : "—"}
            sub={diff != null ? BUCKET_LABEL[bucketFor(diff)] : undefined}
          />
          <Metric label="Max stay" value={formatMaxStay(primary)} />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-5 py-4">
      <div className="kicker">{label}</div>
      <div className="serif-display text-2xl font-medium mt-1 leading-tight tabular flex items-baseline gap-1.5">
        <span>{value}</span>
        {sub && <span className="text-sm font-normal text-[var(--color-ink-muted)]">{sub}</span>}
      </div>
    </div>
  );
}

function buildSubline(option: ResolvedVisaOption, purpose: Purpose): string {
  const dest = nameFor(option.destinationIso2);
  const nat = nationalityFor(option.passportIso2);
  const stay = option.maxStayDays
    ? option.maxStayDays >= 365
      ? `${Math.round(option.maxStayDays / 365)} years`
      : `${option.maxStayDays} days`
    : null;
  const purposeLabel = PURPOSE_LABEL[purpose].toLowerCase();
  // For visa-required statuses, lead with the "no visa-free option" framing
  // (the absence is the user's question), then name the visa class.
  const noVisaFreeFor = `There's no visa-free travel between ${nat} passport holders and ${dest} for ${purposeLabel}.`;
  switch (option.status) {
    case "visa_free":
      return `${nat} citizens get ${stay ?? "short-term"} visa-free entry to ${dest}${
        purpose === "tourism" ? " as Temporary Visitors" : ""
      }. Show your passport on arrival.`;
    case "visa_free_with_eta":
      return `${nat} citizens travel to ${dest} on a simple electronic travel authorisation — apply online before boarding, no embassy interview, decision in minutes.`;
    case "visa_on_arrival":
      return `${noVisaFreeFor} ${nat} travellers get the visa stamped at the ${dest} border on arrival — bring proof of onward travel and the visa fee in cash.`;
    case "e_visa":
      return `${noVisaFreeFor} ${nat} citizens apply for an e-Visa online before flying — decision typically arrives by email within days.`;
    case "embassy_visa":
      return `${noVisaFreeFor} ${nat} citizens apply at the ${dest} embassy or visa application centre before travelling. Plan ahead — appointments and processing both take time.`;
    case "restricted":
      return `${dest} reviews each ${nat} application on its merits. Outcomes vary — consult a qualified immigration adviser before applying.`;
    case "refused":
      return `Current ${dest} policy refuses entry from ${nat} passport holders for ${purposeLabel}. Limited humanitarian or case-by-case exceptions may apply.`;
    default:
      return `Visa rules for ${nat} citizens travelling to ${dest}.`;
  }
}
