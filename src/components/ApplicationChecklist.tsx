"use client";

/**
 * Application checklist — turns a resolved visa option into an ordered,
 * actionable to-do list. The point: "Embassy visa required" is the start of a
 * 200-step journey, not the answer. We list the steps a real applicant has
 * to take, with a recommended buffer before travel.
 */
import type { ResolvedVisaOption } from "@/lib/types";

type Step = { title: string; body: string; daysBeforeTravel: number | null };

function buildSteps(opt: ResolvedVisaOption): Step[] {
  const steps: Step[] = [];

  const processingMax = opt.processingTimeDaysMax ?? opt.processingTimeDaysMin ?? null;
  const buffer = processingMax != null ? Math.ceil(processingMax * 1.5) : null;

  // Universal first step — passport validity check.
  const months = opt.passportValidityMonthsRequired ?? 6;
  steps.push({
    title: "Check your passport validity",
    body: `Most countries require ${months}+ months of validity beyond your travel dates and at least one blank page. If it's close, renew before applying.`,
    daysBeforeTravel: buffer != null ? buffer + 30 : 60,
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
      daysBeforeTravel: buffer != null ? buffer + 14 : 45,
    });
  }

  if (opt.proofOfFundsRequired) {
    steps.push({
      title: "Prepare proof of funds",
      body:
        "Bank statements covering 3–6 months are standard. Include both savings and recent income flow — adjudicators look for stability, not just balance.",
      daysBeforeTravel: buffer != null ? buffer + 14 : 45,
    });
  }

  if (opt.proofOfAccommodationRequired || opt.onwardTicketRequired) {
    steps.push({
      title: "Book refundable flight + accommodation",
      body:
        "Use a refundable booking (or a free hold/itinerary service) until your visa is approved — embassies want to see real plans, but you don't want to lose the money on a refusal.",
      daysBeforeTravel: buffer != null ? buffer + 7 : 30,
    });
  }

  if (opt.biometricsRequired) {
    steps.push({
      title: `Book a biometrics appointment${opt.biometricsLocation ? ` (${opt.biometricsLocation})` : ""}`,
      body:
        "Biometrics centres often have 1–3 week waitlists. Book the slot the moment your application is submitted, not after.",
      daysBeforeTravel: buffer != null ? buffer + 7 : 21,
    });
  }

  if (opt.status === "e_visa") {
    steps.push({
      title: "Submit the e-Visa application online",
      body:
        opt.applicationUrl
          ? `Apply directly at the official portal. Save the reference number — you'll need it for arrival.`
          : "Apply on the destination's official e-Visa portal. Save the confirmation email and reference number.",
      daysBeforeTravel: buffer ?? 14,
    });
  } else if (opt.status === "embassy_visa") {
    steps.push({
      title: "Submit the application to the embassy or consulate",
      body:
        "In person at the consulate with jurisdiction over your residence. Bring originals + photocopies of every document. Most consulates require a prior appointment.",
      daysBeforeTravel: buffer ?? 30,
    });
  } else if (opt.status === "visa_on_arrival") {
    steps.push({
      title: "Bring cash for the visa-on-arrival fee",
      body:
        "Visa-on-arrival counters often only accept exact cash in USD or local currency. Card readers fail constantly. Carry at least the listed fee + 20%.",
      daysBeforeTravel: 1,
    });
  }

  if (opt.status === "embassy_visa" || opt.status === "e_visa") {
    steps.push({
      title: "Track the application; print the approval",
      body:
        processingMax != null
          ? `Decisions typically take ${opt.processingTimeDaysMin ?? "?"}–${processingMax} days. Print or save a clear PDF of the approved visa — airlines check this at check-in.`
          : "Print or save a clear PDF of the approved visa. Airlines check this at check-in.",
      daysBeforeTravel: 7,
    });
  }

  steps.push({
    title: "On the day of travel",
    body:
      "Carry: passport (printed visa if applicable), onward ticket, proof of accommodation, proof of funds, travel insurance. Border officers retain discretion regardless of visa status.",
    daysBeforeTravel: 0,
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
                {step.daysBeforeTravel != null && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                    {step.daysBeforeTravel === 0
                      ? "day of travel"
                      : step.daysBeforeTravel === 1
                      ? "day before"
                      : `${step.daysBeforeTravel}+ days before`}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
