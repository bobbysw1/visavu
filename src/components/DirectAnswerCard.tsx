/**
 * Direct-answer card.
 *
 * Renders a natural-language summary at the top of the result page that
 * directly answers the user's question — the kind of paragraph an AI
 * search assistant would produce. Built deterministically from the
 * resolved data (no LLM at request time) so it stays accurate and free.
 *
 * Designed to:
 *   1. Match how people Google ("Do X passport holders need a visa for Y?")
 *   2. Surface the most decision-relevant facts in 2–3 sentences
 *   3. Render even when no detailed cards are available (empty state)
 *
 * The output is also useful as the answer LLMs would extract for
 * "AI search results" use cases — it's grounded in our structured data
 * with primary-source links surfaced via the cards underneath.
 */
import type { ResolvedVisaOption, Purpose, VisaStatus } from "@/lib/types";
import { PURPOSE_LABEL } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { assessDifficulty, BUCKET_PALETTE, BUCKET_LABEL } from "@/lib/difficulty";
import { assessRealism } from "@/lib/realism";
import { obstaclesFor, type Obstacle } from "@/content/obstacles";

// Conversational status phrases. Subject is "Most {nationality} travellers"
// so the rest reads as natural English. We talk like a knowledgeable friend
// explaining the answer, not like a policy document.
const STATUS_PHRASE: Record<ResolvedVisaOption["status"], (purpose: Purpose) => string> = {
  visa_free: () => "don't need a visa",
  visa_free_with_eta: () => "don't need a visa, but they do need an electronic travel authorisation before boarding",
  visa_on_arrival: () => "can get a visa on arrival at the border",
  e_visa: () => "apply for an e-Visa online before they travel — it's a quick form, usually approved within a few days",
  embassy_visa: (p) =>
    p === "tourism" || p === "business" || p === "transit"
      ? "apply at the embassy or visa application centre before they travel"
      : "go through the embassy or consulate before they travel",
  restricted: () => "have their applications reviewed case by case — there's no automatic answer",
  refused: () => "are generally refused entry",
};

function formatMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(0)} ${currency}`;
  }
}

function totalMandatory(option: ResolvedVisaOption): { amountMinor: number; currency: string } | null {
  if (option.fees.length === 0) return null;
  return option.fees
    .filter((f) => !f.optional)
    .reduce<{ amountMinor: number; currency: string } | null>((acc, f) => {
      if (!acc) return { amountMinor: f.amountMinor, currency: f.currency };
      if (acc.currency !== f.currency) return acc;
      return { amountMinor: acc.amountMinor + f.amountMinor, currency: acc.currency };
    }, null);
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

  if (options.length === 0) {
    return (
      <section className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <p className="text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-100">
          We don&apos;t yet have a verified record for {passportNationality} travellers heading to{" "}
          {destName} for {purposeLabel}. The links below take you straight to {destName}&apos;s
          embassy and official immigration portal — the authoritative answer lives there.
        </p>
      </section>
    );
  }

  // Pick the headline option (first in the resolver result).
  const top = options[0];
  const difficulty = assessDifficulty(top, baselineTourismStatus);
  const obstacles: Obstacle[] = obstaclesFor(passportIso2, destinationIso2);
  const realism = assessRealism(top, obstacles, baselineTourismStatus);
  const statusPhrase = STATUS_PHRASE[top.status](purpose);
  const fee = totalMandatory(top);

  // Build the prose. Conversational voice — talk like a knowledgeable friend
  // explaining what they need to do. Grounded entirely in structured data;
  // never fabricates numbers.
  const sentences: string[] = [];
  sentences.push(
    `Most ${passportNationality} travellers ${statusPhrase} when heading to ${destName} for ${purposeLabel}.`,
  );

  const factParts: string[] = [];
  if (top.maxStayDays != null && top.status !== "embassy_visa") {
    factParts.push(`stays go up to ${top.maxStayDays} days per visit`);
  } else if (top.maxStayDays != null) {
    factParts.push(`stays of up to ${top.maxStayDays} days`);
  }
  if (fee) {
    factParts.push(`expect to pay around ${formatMoney(fee.amountMinor, fee.currency)} in mandatory fees`);
  }
  if (top.processingTimeDaysMin != null && top.processingTimeDaysMax != null) {
    factParts.push(
      `processing usually takes ${top.processingTimeDaysMin}–${top.processingTimeDaysMax} days`,
    );
  } else if (top.processingTimeDaysMax === 0) {
    factParts.push(`approval is usually instant`);
  }
  if (factParts.length > 0) {
    sentences.push(
      `The route most travellers use is the ${top.label}. ${capitaliseFirst(factParts.join(", "))}.`,
    );
  }

  // Difficulty + realism in plain English. Difficulty = paperwork, realism =
  // approval likelihood. Bundle into one sentence.
  const realismPhrase =
    realism.bucket === "likely"
      ? "approval is likely if your documents are in order"
      : realism.bucket === "uncertain"
      ? "approval depends heavily on the documents and circumstances you can show"
      : "real-world approval is the harder hurdle here";
  const difficultyPhrase =
    difficulty.bucket === "easy"
      ? "The paperwork is straightforward"
      : difficulty.bucket === "medium"
      ? "There's a moderate amount of paperwork"
      : "The paperwork is heavy";
  sentences.push(
    `${difficultyPhrase} — ${difficulty.score}/10 difficulty (${BUCKET_LABEL[difficulty.bucket].toLowerCase()}), and ${realism.score}/10 realism (${realism.bucket}). ${capitaliseFirst(realismPhrase)}.`,
  );

  if (options.length > 1) {
    sentences.push(
      `${options.length - 1} other route${options.length === 2 ? "" : "s"} sit below if this one doesn't fit.`,
    );
  }

  // Surface critical obstacles inline in the answer (don't make the user
  // scroll). Cap at 1 — the full list still appears in the ObstaclesPanel.
  const critical = obstacles.find((o) => o.severity === "critical");
  if (critical) {
    sentences.push(
      `One thing to know first: ${critical.title.toLowerCase()}. We cover this in the warning above.`,
    );
  }

  if (top.eta) {
    const a = etaArticle(top.eta.name);
    sentences.push(
      `You'll also need ${a} ${top.eta.name} authorisation before boarding — separate from the visa, and easy to miss.`,
    );
  }

  const tone = BUCKET_PALETTE[difficulty.bucket].border;

  return (
    <section className={`mb-6 rounded-xl border ${tone} p-5 sm:p-6`}>
      {/* The card itself IS the answer. No eyebrow, no apology, no framing. */}
      <div className="text-base sm:text-lg leading-relaxed space-y-3 text-neutral-800 dark:text-neutral-100">
        {sentences.map((s, i) => (
          <p key={i}>{s}</p>
        ))}
      </div>
      {top.primarySourceUrl && (
        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
          Straight from{" "}
          <a
            href={top.primarySourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:no-underline"
          >
            {(() => {
              try {
                return new URL(top.primarySourceUrl).hostname.replace(/^www\./, "");
              } catch {
                return "the primary source";
              }
            })()}
          </a>
          .
        </p>
      )}
    </section>
  );
}

function capitaliseFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** ETA-name article picker. "ESTA" / "ETIAS" / "ETA" take "an"; "UK ETA" /
 *  "Canada eTA" / "K-ETA" take "a" because the first sound is consonant-ish. */
function etaArticle(name: string): "a" | "an" {
  const trimmed = name.trim();
  const first = trimmed.charAt(0).toUpperCase();
  // Letters whose name starts with a vowel sound take "an": A, E, F, H, I, L, M, N, O, R, S, X.
  // For acronyms-as-words, look at the first letter only.
  return ["A", "E", "F", "H", "I", "L", "M", "N", "O", "R", "S", "X"].includes(first) ? "an" : "a";
}
