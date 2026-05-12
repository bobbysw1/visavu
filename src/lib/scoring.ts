/**
 * Server-side scoring helpers for /passport/[iso] and /destination/[iso].
 *
 * Lives outside the "use client" component so the heavy summaries data never
 * crosses the server-client boundary — only the trimmed ScoredItem[] does.
 */
import { assessDifficulty } from "@/lib/difficulty";
import type {
  DestinationSummaryForPassport,
  OriginSummaryForDestination,
} from "@/lib/coverage";
import type { ResolvedVisaOption } from "@/lib/types";
import type { ScoredItem } from "@/components/DifficultyBucketGrid";

export function scoreDestinationsForPassport(
  passportIso2: string,
  summaries: DestinationSummaryForPassport[],
): ScoredItem[] {
  return summaries.map((s) => {
    const opt = passportSummaryToResolved(s, passportIso2);
    const a = assessDifficulty(opt);
    const totalFee = totalMandatoryFee(s.fees);
    return {
      otherIso2: s.destinationIso2,
      label: s.label,
      purpose: s.purpose,
      score: a.score,
      bucket: a.bucket,
      status: s.status,
      processingTimeDaysMax: s.processingTimeDaysMax,
      feeAmountMinor: totalFee?.amount ?? null,
      feeCurrency: totalFee?.currency ?? null,
    };
  });
}

export function scoreOriginsForDestination(
  destinationIso2: string,
  summaries: OriginSummaryForDestination[],
): ScoredItem[] {
  return summaries.map((s) => {
    const opt = originSummaryToResolved(s, destinationIso2);
    const a = assessDifficulty(opt);
    const totalFee = totalMandatoryFee(s.fees);
    return {
      otherIso2: s.passportIso2,
      label: s.label,
      purpose: s.purpose,
      score: a.score,
      bucket: a.bucket,
      status: s.status,
      processingTimeDaysMax: s.processingTimeDaysMax,
      feeAmountMinor: totalFee?.amount ?? null,
      feeCurrency: totalFee?.currency ?? null,
    };
  });
}

function totalMandatoryFee(
  fees: { amountMinor: number; currency: string; optional: boolean; kind: string }[],
): { amount: number; currency: string } | null {
  let acc: { amount: number; currency: string } | null = null;
  for (const f of fees) {
    if (f.optional) continue;
    if (!acc) acc = { amount: f.amountMinor, currency: f.currency };
    else if (acc.currency === f.currency) acc.amount += f.amountMinor;
  }
  return acc;
}

function passportSummaryToResolved(
  s: DestinationSummaryForPassport,
  passportIso2: string,
): ResolvedVisaOption {
  return baseResolved({
    passportIso2,
    destinationIso2: s.destinationIso2,
    purpose: s.purpose,
    status: s.status,
    label: s.label,
    maxStayDays: s.maxStayDays,
    processingTimeDaysMax: s.processingTimeDaysMax,
    requirementsCount: s.requirementsCount,
    biometricsRequired: s.biometricsRequired,
    onwardTicketRequired: s.onwardTicketRequired,
    proofOfFundsRequired: s.proofOfFundsRequired,
    proofOfAccommodationRequired: s.proofOfAccommodationRequired,
    passportValidityMonthsRequired: s.passportValidityMonthsRequired,
    fees: s.fees,
  });
}

function originSummaryToResolved(
  s: OriginSummaryForDestination,
  destinationIso2: string,
): ResolvedVisaOption {
  return baseResolved({
    passportIso2: s.passportIso2,
    destinationIso2,
    purpose: s.purpose,
    status: s.status,
    label: s.label,
    maxStayDays: s.maxStayDays,
    processingTimeDaysMax: s.processingTimeDaysMax,
    requirementsCount: s.requirementsCount,
    biometricsRequired: s.biometricsRequired,
    onwardTicketRequired: s.onwardTicketRequired,
    proofOfFundsRequired: s.proofOfFundsRequired,
    proofOfAccommodationRequired: s.proofOfAccommodationRequired,
    passportValidityMonthsRequired: s.passportValidityMonthsRequired,
    fees: s.fees,
  });
}

function baseResolved(input: {
  passportIso2: string;
  destinationIso2: string;
  purpose: DestinationSummaryForPassport["purpose"];
  status: DestinationSummaryForPassport["status"];
  label: string;
  maxStayDays: number | null;
  processingTimeDaysMax: number | null;
  requirementsCount: number;
  biometricsRequired: boolean | null;
  onwardTicketRequired: boolean | null;
  proofOfFundsRequired: boolean | null;
  proofOfAccommodationRequired: boolean | null;
  passportValidityMonthsRequired: number | null;
  fees: DestinationSummaryForPassport["fees"];
}): ResolvedVisaOption {
  return {
    id: -1,
    passportIso2: input.passportIso2,
    destinationIso2: input.destinationIso2,
    purpose: input.purpose,
    status: input.status,
    label: input.label,
    maxStayDays: input.maxStayDays,
    validityDays: null,
    entriesAllowed: null,
    passportValidityMonthsRequired: input.passportValidityMonthsRequired,
    blankPagesRequired: null,
    onwardTicketRequired: input.onwardTicketRequired,
    proofOfFundsRequired: input.proofOfFundsRequired,
    proofOfAccommodationRequired: input.proofOfAccommodationRequired,
    biometricsRequired: input.biometricsRequired,
    biometricsLocation: null,
    requirements: new Array(input.requirementsCount).fill(""),
    vaccinationRequirements: [],
    processingTimeDaysMin: null,
    processingTimeDaysMax: input.processingTimeDaysMax,
    applicationUrl: null,
    primarySourceUrl: null,
    fees: input.fees.map((f) => ({
      kind: f.kind as "base" | "service" | "biometrics" | "courier" | "vac" | "rush" | "other",
      amountMinor: f.amountMinor,
      currency: f.currency,
      asOf: "",
      optional: f.optional,
    })),
    blocDerivedFrom: null,
    eta: null,
    purposeMetadata: null,
    correctnessBucket: "high",
    lastFetchedAt: null,
    lastVerifiedAt: null,
    crossCheckResult: null,
    notes: null,
  };
}
