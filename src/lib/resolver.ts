/**
 * Resolver — composes (passport, destination, purpose) → ResolvedVisaOption[].
 *
 * Not a SELECT. A small rules engine that:
 *   1. Reads direct visa_options rows for the given passport/destination/purpose.
 *   2. Resolves bloc rules (e.g. DE→IT via Schengen) when no direct row exists.
 *   3. Joins the eTA layer separately (eTA can apply on top of visa-free OR
 *      sit alongside a visa requirement).
 *   4. Identity case (X→X): citizens of destination always have a "no visa needed".
 *
 * Reciprocity-driven re-verification flags happen in the scrape pipeline, not here.
 */
import { and, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db, schema } from "../db/client";
import type { Purpose, ResolvedVisaOption, EtaApplied, FeeComponent, ConfidenceBucket } from "./types";
import { combinedBucket, freshnessBucket } from "./confidence";

export type ResolverInput = {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  // Defaults to today; effective-dating respects this.
  asOf?: Date;
};

export type ResolvedRoute = {
  primary: ResolvedVisaOption[];
  alternatives: Array<{ purpose: Purpose; options: ResolvedVisaOption[] }>;
  /** The applicant passport's TOURISM access status to the destination. Drives
   *  the passport-baseline modifier in difficulty/realism scoring so a British
   *  Digital Nomad applicant doesn't score the same as an Afghan one. */
  baselineTourismStatus: import("./types").VisaStatus | null;
};

// Extended lookup: returns the requested-purpose options plus a summary of
// every OTHER purpose covered for the same (passport, destination). Drives
// the "Alternatives" panel on the result page so a user searching for a
// tourist visa can see at-a-glance that work / study / family routes also
// exist for the same country pair.
export async function resolveRoute(input: ResolverInput): Promise<ResolvedRoute> {
  const primary = await resolve(input);
  const allPurposes: Purpose[] = ["tourism", "business", "transit", "work", "study", "family", "diplomatic"];

  const alternatives: ResolvedRoute["alternatives"] = [];
  let tourismOptions: ResolvedVisaOption[] | null = null;
  for (const p of allPurposes) {
    if (p === input.purpose) {
      // Tourism baseline lives in the requested-purpose result if user asked for tourism.
      if (p === "tourism") tourismOptions = primary;
      continue;
    }
    const opts = await resolve({ ...input, purpose: p });
    if (p === "tourism") tourismOptions = opts;
    if (opts.length === 0) continue;
    alternatives.push({ purpose: p, options: opts });
  }

  // Compute the passport-baseline tourism status. Used by difficulty/realism
  // to differentiate strong vs weak passports applying for the same visa.
  const baselineTourismStatus = tourismOptions && tourismOptions.length > 0
    ? tourismOptions[0].status
    : null;

  return { primary, alternatives, baselineTourismStatus };
}

export async function resolve(input: ResolverInput): Promise<ResolvedVisaOption[]> {
  const asOf = input.asOf ?? new Date();
  const passportIso2 = input.passportIso2.toUpperCase();
  const destinationIso2 = input.destinationIso2.toUpperCase();

  // 1. Identity case — citizens of destination.
  if (passportIso2 === destinationIso2) {
    return [identityOption(passportIso2, destinationIso2, input.purpose)];
  }

  // 2. Find the ordinary passport for the issuer.
  const passport = await db
    .select()
    .from(schema.passports)
    .where(and(eq(schema.passports.issuerIso2, passportIso2), eq(schema.passports.type, "ordinary")))
    .limit(1);

  if (passport.length === 0) return [];

  const passportId = passport[0].id;

  // 3. Direct visa_options matches.
  const direct = await db.query.visaOptions.findMany({
    where: and(
      eq(schema.visaOptions.passportId, passportId),
      eq(schema.visaOptions.destinationIso2, destinationIso2),
      eq(schema.visaOptions.purpose, input.purpose),
      isNull(schema.visaOptions.deprecatedAt),
    ),
    with: { fees: true },
  });

  let options = direct;

  // 4. Bloc resolution — only if no direct rows. Find blocs the passport-issuer
  // belongs to as of the request date, then look for visa_options that target
  // any other member of the same bloc, marked as bloc-derived.
  if (options.length === 0) {
    const passportBlocs = await blocsActiveFor(passportIso2, asOf);
    const destBlocs = await blocsActiveFor(destinationIso2, asOf);
    const sharedBlocs = passportBlocs.filter((b) => destBlocs.includes(b));

    if (sharedBlocs.length > 0) {
      const blocOptions = await db.query.visaOptions.findMany({
        where: and(
          eq(schema.visaOptions.passportId, passportId),
          eq(schema.visaOptions.purpose, input.purpose),
          inArray(schema.visaOptions.blocDerivedFrom, sharedBlocs),
          isNull(schema.visaOptions.deprecatedAt),
        ),
        with: { fees: true },
      });
      options = blocOptions;
    }
  }

  if (options.length === 0) return [];

  // 5. eTA layer — destination-level. Joined onto every option for this dest.
  const eta = await etaForDestination(destinationIso2, passportId);

  return options.map((opt) => toResolved(opt, passportIso2, eta));
}

async function blocsActiveFor(countryIso2: string, asOf: Date): Promise<string[]> {
  const asOfStr = asOf.toISOString().slice(0, 10);
  const rows = await db
    .select({ blocId: schema.blocMemberships.blocId })
    .from(schema.blocMemberships)
    .where(
      and(
        eq(schema.blocMemberships.countryIso2, countryIso2),
        lte(schema.blocMemberships.effectiveFrom, asOfStr),
        or(isNull(schema.blocMemberships.effectiveTo), sql`${schema.blocMemberships.effectiveTo} >= ${asOfStr}`),
      ),
    );
  return rows.map((r) => r.blocId);
}

async function etaForDestination(
  destinationIso2: string,
  passportId: number,
): Promise<EtaApplied | null> {
  const rows = await db
    .select({
      id: schema.etaSystems.id,
      name: schema.etaSystems.name,
      applyUrl: schema.etaSystems.applyUrl,
      status: schema.etaSystems.status,
      effectiveFrom: schema.etaSystems.effectiveFrom,
      notes: schema.etaSystems.notes,
      eligible: schema.etaEligibility.passportId,
    })
    .from(schema.etaSystems)
    .leftJoin(
      schema.etaEligibility,
      and(
        eq(schema.etaEligibility.etaId, schema.etaSystems.id),
        eq(schema.etaEligibility.passportId, passportId),
      ),
    )
    .where(eq(schema.etaSystems.destinationIso2, destinationIso2))
    .limit(1);

  if (rows.length === 0) return null;
  const r = rows[0];
  // Only attach the eTA if the passport is on the eligibility list.
  if (r.eligible == null) return null;
  return {
    id: r.id,
    name: r.name,
    applyUrl: r.applyUrl ?? undefined,
    status: r.status as EtaApplied["status"],
    effectiveFrom: r.effectiveFrom ?? undefined,
    notes: r.notes ?? undefined,
  };
}

function identityOption(
  passportIso2: string,
  destinationIso2: string,
  purpose: Purpose,
): ResolvedVisaOption {
  return {
    id: -1,
    passportIso2,
    destinationIso2,
    purpose,
    status: "visa_free",
    label: "Citizen — no visa required",
    maxStayDays: null,
    validityDays: null,
    entriesAllowed: "multiple",
    passportValidityMonthsRequired: null,
    blankPagesRequired: null,
    onwardTicketRequired: null,
    proofOfFundsRequired: null,
    proofOfAccommodationRequired: null,
    biometricsRequired: null,
    biometricsLocation: null,
    requirements: [],
    vaccinationRequirements: [],
    processingTimeDaysMin: null,
    processingTimeDaysMax: null,
    applicationUrl: null,
    primarySourceUrl: null,
    fees: [],
    blocDerivedFrom: null,
    eta: null,
    purposeMetadata: null,
    correctnessBucket: "high",
    lastFetchedAt: null,
    lastVerifiedAt: null,
    crossCheckResult: null,
    notes: "Identity case: a citizen does not require a visa to enter their own country.",
  };
}

type DbVisaOption = typeof schema.visaOptions.$inferSelect & {
  fees: (typeof schema.feeComponents.$inferSelect)[];
};

function toResolved(
  opt: DbVisaOption,
  passportIso2: string,
  eta: EtaApplied | null,
): ResolvedVisaOption {
  const fees: FeeComponent[] = opt.fees.map((f) => ({
    kind: f.kind,
    amountMinor: f.amountMinor,
    currency: f.currency,
    asOf: typeof f.asOf === "string" ? f.asOf : new Date(f.asOf).toISOString().slice(0, 10),
    label: f.label ?? undefined,
    optional: f.optional,
  }));

  // Combine stored correctness bucket with freshness decay computed from
  // last_verified_at. A high-correctness record older than 180 days drops to
  // "unverified" regardless.
  const correctness =
    (opt.correctnessBucket as ConfidenceBucket | null) ?? "unverified";
  const freshness = freshnessBucket(opt.lastVerifiedAt as Date | null);
  const combined = combinedBucket(correctness, freshness);

  return {
    id: opt.id,
    passportIso2,
    destinationIso2: opt.destinationIso2,
    purpose: opt.purpose,
    status: opt.status,
    label: opt.label,
    maxStayDays: opt.maxStayDays,
    validityDays: opt.validityDays,
    entriesAllowed: opt.entriesAllowed,
    passportValidityMonthsRequired: opt.passportValidityMonthsRequired,
    blankPagesRequired: opt.blankPagesRequired,
    onwardTicketRequired: opt.onwardTicketRequired,
    proofOfFundsRequired: opt.proofOfFundsRequired,
    proofOfAccommodationRequired: opt.proofOfAccommodationRequired,
    biometricsRequired: opt.biometricsRequired,
    biometricsLocation: opt.biometricsLocation,
    requirements: (opt.requirements as string[]) ?? [],
    vaccinationRequirements: (opt.vaccinationRequirements as string[]) ?? [],
    processingTimeDaysMin: opt.processingTimeDaysMin,
    processingTimeDaysMax: opt.processingTimeDaysMax,
    applicationUrl: opt.applicationUrl,
    primarySourceUrl: opt.primarySourceUrl,
    fees,
    blocDerivedFrom: opt.blocDerivedFrom,
    eta,
    purposeMetadata: (opt.purposeMetadata as Record<string, unknown> | null) ?? null,
    correctnessBucket: combined,
    lastFetchedAt: opt.lastFetchedAt ? new Date(opt.lastFetchedAt as Date).toISOString() : null,
    lastVerifiedAt: opt.lastVerifiedAt ? new Date(opt.lastVerifiedAt as Date).toISOString() : null,
    crossCheckResult: (opt.crossCheckResult as ResolvedVisaOption["crossCheckResult"]) ?? null,
    programmeStatus: (opt.programmeStatus as ResolvedVisaOption["programmeStatus"]) ?? null,
    programmeStatusNote: opt.programmeStatusNote ?? null,
    linkHealth: (opt.linkHealth as ResolvedVisaOption["linkHealth"]) ?? null,
    notes: opt.notes,
  };
}
