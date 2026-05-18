/**
 * Per (passport, purpose) destination summary loader.
 *
 * Powers /passport/[iso]/purpose/[purpose] — returns every destination
 * the given passport has VISA OPTIONS for under the requested purpose.
 * Each row carries the best (lowest-difficulty) status + label so the
 * UI can bucket the grid into Easy / Medium / Hard.
 *
 * Mirrors destinationSummariesForPassport in lib/coverage.ts but filters
 * by purpose instead of picking a single headline per destination.
 */
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { Purpose, VisaStatus } from "./types";

export type DestinationOptionForPurpose = {
  destinationIso2: string;
  status: VisaStatus;
  label: string;
  maxStayDays: number | null;
  processingTimeDaysMax: number | null;
  biometricsRequired: boolean | null;
  onwardTicketRequired: boolean | null;
  proofOfFundsRequired: boolean | null;
  proofOfAccommodationRequired: boolean | null;
  passportValidityMonthsRequired: number | null;
  requirementsCount: number;
  fees: Array<{ kind: string; amountMinor: number; currency: string; optional: boolean }>;
};

const STATUS_RANK: Record<VisaStatus, number> = {
  visa_free: 0,
  visa_free_with_eta: 1,
  visa_on_arrival: 2,
  e_visa: 3,
  embassy_visa: 4,
  restricted: 5,
  refused: 6,
};

export async function destinationsForPassportPurpose(
  passportIso2: string,
  purpose: Purpose,
): Promise<DestinationOptionForPurpose[]> {
  const upperIso = passportIso2.toUpperCase();
  const passport = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(and(eq(schema.passports.issuerIso2, upperIso), eq(schema.passports.type, "ordinary")))
    .limit(1);
  if (!passport[0]) return [];

  const rows = await db
    .select({
      id: schema.visaOptions.id,
      destinationIso2: schema.visaOptions.destinationIso2,
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      maxStayDays: schema.visaOptions.maxStayDays,
      processingTimeDaysMax: schema.visaOptions.processingTimeDaysMax,
      biometricsRequired: schema.visaOptions.biometricsRequired,
      onwardTicketRequired: schema.visaOptions.onwardTicketRequired,
      proofOfFundsRequired: schema.visaOptions.proofOfFundsRequired,
      proofOfAccommodationRequired: schema.visaOptions.proofOfAccommodationRequired,
      passportValidityMonthsRequired: schema.visaOptions.passportValidityMonthsRequired,
      requirements: schema.visaOptions.requirements,
    })
    .from(schema.visaOptions)
    .where(
      and(
        eq(schema.visaOptions.passportId, passport[0].id),
        eq(schema.visaOptions.purpose, purpose),
      ),
    );

  if (rows.length === 0) return [];

  // Fees in a second pass.
  const feeRows = await db
    .select({
      visaOptionId: schema.feeComponents.visaOptionId,
      kind: schema.feeComponents.kind,
      amountMinor: schema.feeComponents.amountMinor,
      currency: schema.feeComponents.currency,
      optional: schema.feeComponents.optional,
    })
    .from(schema.feeComponents)
    .where(inArray(schema.feeComponents.visaOptionId, rows.map((r) => r.id)));
  const feesByOpt = new Map<number, DestinationOptionForPurpose["fees"]>();
  for (const f of feeRows) {
    const arr = feesByOpt.get(f.visaOptionId) ?? [];
    arr.push({ kind: f.kind, amountMinor: f.amountMinor, currency: f.currency, optional: f.optional });
    feesByOpt.set(f.visaOptionId, arr);
  }

  // Pick the best (lowest-difficulty) option per destination.
  const byDest = new Map<string, typeof rows[number]>();
  for (const r of rows) {
    const existing = byDest.get(r.destinationIso2);
    if (!existing || STATUS_RANK[r.status as VisaStatus] < STATUS_RANK[existing.status as VisaStatus]) {
      byDest.set(r.destinationIso2, r);
    }
  }

  return [...byDest.values()].map((r) => ({
    destinationIso2: r.destinationIso2,
    status: r.status as VisaStatus,
    label: r.label,
    maxStayDays: r.maxStayDays,
    processingTimeDaysMax: r.processingTimeDaysMax,
    biometricsRequired: r.biometricsRequired,
    onwardTicketRequired: r.onwardTicketRequired,
    proofOfFundsRequired: r.proofOfFundsRequired,
    proofOfAccommodationRequired: r.proofOfAccommodationRequired,
    passportValidityMonthsRequired: r.passportValidityMonthsRequired,
    requirementsCount: ((r.requirements as string[] | null) ?? []).length,
    fees: feesByOpt.get(r.id) ?? [],
  }));
}
