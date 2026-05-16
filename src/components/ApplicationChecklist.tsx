"use client";

import { GlossaryText } from "./GlossaryText";

/**
 * Application checklist — turns a resolved visa option into an ordered,
 * actionable to-do list.
 *
 * Two phases:
 *
 *   BEFORE YOU SUBMIT — passport check, gather docs, take photos, prep
 *     funds proof. Timed relative to the SUBMISSION date, not the travel
 *     date, because that's how applicants actually plan. Most prep items
 *     have a freshness window (biometrics ~6 months, photos ~6 months,
 *     funds ~30 days) so anchoring to submission keeps the numbers sane.
 *
 *   AFTER YOU SUBMIT — biometrics appointment, interview, tracking, print
 *     the approval. These run between submit-day and travel-day.
 *
 * The previous version computed every step's offset as `daysBeforeTravel =
 * processingMax * 1.5 + N` which produced silly numbers like "biometrics
 * 1100 days before travel" for long-stay visas with 24-month processing.
 * The new model never overflows because each step is anchored to the
 * milestone that actually applies to it.
 */
import type { ResolvedVisaOption } from "@/lib/types";

type Phase = "before-submit" | "after-submit";

type Step = {
  title: string;
  body: string;
  phase: Phase;
  /** Offset before SUBMITTING for before-submit phase, before TRAVELLING
   *  for after-submit phase. Null = no specific timing applies. */
  offsetDays: number | null;
};

/** Recommended cushion between submission and travel — long enough for
 *  the processing window plus a contingency for biometrics + decision
 *  print. */
function recommendedSubmitWindow(processingMax: number | null): number {
  if (processingMax == null) return 30;
  // 14-day cushion beyond the official max, capped at a year. Long-stay
  // visas with 540-day processing get 365-day submit windows, not 1100.
  return Math.min(processingMax + 14, 365);
}

function buildSteps(opt: ResolvedVisaOption): Step[] {
  const steps: Step[] = [];

  const processingMax = opt.processingTimeDaysMax ?? opt.processingTimeDaysMin ?? null;

  // ---- BEFORE YOU SUBMIT ----
  // Anchor to submission date. These all have freshness windows so the
  // numbers stay between 7 and 90 days regardless of processing time.

  const months = opt.passportValidityMonthsRequired ?? 6;
  steps.push({
    title: "Check your passport validity",
    body: `Most countries require ${months}+ months of validity beyond your travel dates and at least one blank page. If it's close, renew now — UK takes 3 weeks, US 6–8, AU 6 — well before you submit anything else.`,
    phase: "before-submit",
    offsetDays: 60,
  });

  if (
    opt.status === "embassy_visa" ||
    opt.status === "e_visa" ||
    opt.status === "visa_free_with_eta"
  ) {
    steps.push({
      title: "Gather supporting documents",
      body:
        opt.requirements.length > 0
          ? `You'll need: ${opt.requirements.slice(0, 4).join("; ")}${
              opt.requirements.length > 4 ? "; and others (see full list above)." : "."
            }`
          : "Typically: passport-size photo, passport bio page, onward ticket, proof of accommodation, proof of funds, travel insurance. Confirm against the destination's official portal.",
      phase: "before-submit",
      offsetDays: 30,
    });
  }

  if (opt.proofOfFundsRequired) {
    steps.push({
      title: "Prepare proof of funds",
      body: "Bank statements covering 3–6 months are standard. Most consulates accept funds held for 28 consecutive days, so don't make a big deposit the week before — adjudicators look for stability, not just balance.",
      phase: "before-submit",
      offsetDays: 30,
    });
  }

  if (opt.proofOfAccommodationRequired || opt.onwardTicketRequired) {
    steps.push({
      title: "Book refundable flight + accommodation",
      body: "Use a refundable booking (or a free hold/itinerary service) until your visa is approved — embassies want to see real plans, but you don't want to lose the money on a refusal.",
      phase: "before-submit",
      offsetDays: 14,
    });
  }

  // ---- SUBMISSION ----

  if (opt.status === "e_visa") {
    steps.push({
      title: "Submit the e-Visa application online",
      body: opt.applicationUrl
        ? "Apply directly at the official portal. Save the reference number — you'll need it for arrival."
        : "Apply on the destination's official e-Visa portal. Save the confirmation email and reference number.",
      phase: "after-submit",
      offsetDays: recommendedSubmitWindow(processingMax),
    });
  } else if (opt.status === "embassy_visa") {
    steps.push({
      title: "Submit the application to the embassy or consulate",
      body: "In person at the consulate with jurisdiction over your residence. Bring originals + photocopies of every document. Most consulates require a prior appointment.",
      phase: "after-submit",
      offsetDays: recommendedSubmitWindow(processingMax),
    });
  } else if (opt.status === "visa_on_arrival") {
    steps.push({
      title: "Bring cash for the visa-on-arrival fee",
      body: "Visa-on-arrival counters often only accept exact cash in USD or local currency. Card readers fail constantly. Carry at least the listed fee + 20%.",
      phase: "after-submit",
      offsetDays: 1,
    });
  }

  // ---- AFTER YOU SUBMIT ----

  if (opt.biometricsRequired) {
    steps.push({
      title: `Book biometrics${opt.biometricsLocation ? ` (${opt.biometricsLocation})` : ""}`,
      body: "Biometrics centres (VFS / TLScontact / BLS) often have 1–3 week waitlists. Book the slot the moment your application is submitted, not after — and don't book too early either: most jurisdictions require fingerprints taken within 6 months of the decision.",
      phase: "after-submit",
      // After submitting but well before travel — book within days of submission.
      offsetDays: Math.max(7, recommendedSubmitWindow(processingMax) - 14),
    });
  }

  if (opt.status === "embassy_visa" || opt.status === "e_visa") {
    steps.push({
      title: "Track the application; print the approval",
      body: processingMax != null
        ? `Decisions typically take ${opt.processingTimeDaysMin ?? "?"}–${processingMax} days. Print or save a clear PDF of the approved visa — airlines check this at check-in.`
        : "Print or save a clear PDF of the approved visa. Airlines check this at check-in.",
      phase: "after-submit",
      offsetDays: 7,
    });
  }

  steps.push({
    title: "On the day of travel",
    body: "Carry: passport (printed visa if applicable), onward ticket, proof of accommodation, proof of funds, travel insurance. Border officers retain discretion regardless of visa status.",
    phase: "after-submit",
    offsetDays: 0,
  });

  return steps;
}

export function ApplicationChecklist({ option }: { option: ResolvedVisaOption }) {
  // Skip the checklist for refused / restricted (different journey entirely)
  // and for citizens of the destination country.
  if (option.status === "refused" || option.status === "restricted") return null;
  if (option.id === -1) return null;

  const steps = buildSteps(option);

  return (
    <section className="mb-6 print:mb-2">
      <header className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h4 className="text-sm font-semibold">Your application checklist</h4>
        <button
          type="button"
          onClick={() => window.print()}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline print:hidden"
        >
          Print this checklist
        </button>
      </header>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40"
          >
            <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <p className="font-semibold text-sm leading-snug">{step.title}</p>
                {step.offsetDays != null && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                    {formatOffset(step.offsetDays, step.phase)}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
                <GlossaryText text={step.body} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatOffset(days: number, phase: Phase): string {
  if (days === 0) return "day of travel";
  const anchor = phase === "before-submit" ? "submitting" : "travel";
  if (days === 1) return `day before ${anchor}`;
  if (days >= 30 && days % 7 === 0) {
    const weeks = days / 7;
    if (weeks >= 8) {
      const months = Math.round(weeks / 4.345);
      return `~${months} month${months === 1 ? "" : "s"} before ${anchor}`;
    }
    return `${weeks} weeks before ${anchor}`;
  }
  return `${days}+ days before ${anchor}`;
}
