/**
 * Coverage queries — surfaces real stats on the country index pages.
 *
 *   coverageForPassport(iso2) → counts of visa_options grouped by status,
 *   for the ordinary passport of that country.
 *
 *   coverageForDestination(iso2) → counts of visa_options targeting that
 *   destination, grouped by status (i.e. "who needs what to enter X?").
 *
 * Returns zero-counts cleanly when no data exists yet, so the UI renders
 * an empty state rather than crashing pre-bootstrap.
 */
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { VisaStatus, Purpose } from "./types";

export type StatusCounts = Record<VisaStatus, number>;

export type CoverageSnapshot = {
  totalDestinationsCovered: number;
  byStatus: StatusCounts;
  byPurpose: Record<Purpose, number>;
  // Number of unique distinct (passport, destination, purpose) cells covered.
  totalOptions: number;
};

const EMPTY_BY_STATUS: StatusCounts = {
  visa_free: 0,
  visa_free_with_eta: 0,
  visa_on_arrival: 0,
  e_visa: 0,
  embassy_visa: 0,
  restricted: 0,
  refused: 0,
};

const EMPTY_BY_PURPOSE: Record<Purpose, number> = {
  tourism: 0,
  business: 0,
  transit: 0,
  work: 0,
  study: 0,
  family: 0,
  diplomatic: 0,
};

async function passportIdFor(iso2: string): Promise<number | null> {
  const rows = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(and(eq(schema.passports.issuerIso2, iso2), eq(schema.passports.type, "ordinary")))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function coverageForPassport(iso2: string): Promise<CoverageSnapshot> {
  const passportId = await passportIdFor(iso2.toUpperCase());
  if (!passportId) return emptySnapshot();

  // Count distinct destinations + status + purpose breakdowns in one pass.
  const statusRows = await db
    .select({
      status: schema.visaOptions.status,
      n: sql<number>`COUNT(*)::int`,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.passportId, passportId))
    .groupBy(schema.visaOptions.status);

  const purposeRows = await db
    .select({
      purpose: schema.visaOptions.purpose,
      n: sql<number>`COUNT(*)::int`,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.passportId, passportId))
    .groupBy(schema.visaOptions.purpose);

  const distinctDest = await db
    .select({
      n: sql<number>`COUNT(DISTINCT ${schema.visaOptions.destinationIso2})::int`,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.passportId, passportId));

  const byStatus = { ...EMPTY_BY_STATUS };
  for (const r of statusRows) byStatus[r.status as VisaStatus] = r.n;
  const byPurpose = { ...EMPTY_BY_PURPOSE };
  for (const r of purposeRows) byPurpose[r.purpose as Purpose] = r.n;
  const totalOptions = Object.values(byStatus).reduce((s, n) => s + n, 0);

  return {
    totalDestinationsCovered: distinctDest[0]?.n ?? 0,
    byStatus,
    byPurpose,
    totalOptions,
  };
}

export async function coverageForDestination(iso2: string): Promise<CoverageSnapshot> {
  const upper = iso2.toUpperCase();

  const statusRows = await db
    .select({
      status: schema.visaOptions.status,
      n: sql<number>`COUNT(*)::int`,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.destinationIso2, upper))
    .groupBy(schema.visaOptions.status);

  const purposeRows = await db
    .select({
      purpose: schema.visaOptions.purpose,
      n: sql<number>`COUNT(*)::int`,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.destinationIso2, upper))
    .groupBy(schema.visaOptions.purpose);

  const distinctOrigin = await db
    .select({
      n: sql<number>`COUNT(DISTINCT ${schema.visaOptions.passportId})::int`,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.destinationIso2, upper));

  const byStatus = { ...EMPTY_BY_STATUS };
  for (const r of statusRows) byStatus[r.status as VisaStatus] = r.n;
  const byPurpose = { ...EMPTY_BY_PURPOSE };
  for (const r of purposeRows) byPurpose[r.purpose as Purpose] = r.n;
  const totalOptions = Object.values(byStatus).reduce((s, n) => s + n, 0);

  return {
    totalDestinationsCovered: distinctOrigin[0]?.n ?? 0,
    byStatus,
    byPurpose,
    totalOptions,
  };
}

function emptySnapshot(): CoverageSnapshot {
  return {
    totalDestinationsCovered: 0,
    byStatus: { ...EMPTY_BY_STATUS },
    byPurpose: { ...EMPTY_BY_PURPOSE },
    totalOptions: 0,
  };
}

// ---------------------------------------------------------------------------
// Per-destination summaries for the passport index page.
//
// Returns one row per destination this passport has data for, keyed for
// rendering as "easiest tourism option per country". The caller computes
// difficulty client-side via assessDifficulty() against the lightweight
// payload below.
// ---------------------------------------------------------------------------

export type DestinationSummaryForPassport = {
  destinationIso2: string;
  // The "headline" tourism option — preferred for the easiest-bucket view.
  // Falls back to any short-stay option, then any option at all.
  status: VisaStatus;
  label: string;
  maxStayDays: number | null;
  processingTimeDaysMax: number | null;
  fees: Array<{ kind: string; amountMinor: number; currency: string; optional: boolean }>;
  requirementsCount: number;
  biometricsRequired: boolean | null;
  onwardTicketRequired: boolean | null;
  proofOfFundsRequired: boolean | null;
  proofOfAccommodationRequired: boolean | null;
  passportValidityMonthsRequired: number | null;
  purpose: Purpose;
};

const PURPOSE_PRIORITY: Purpose[] = [
  "tourism", // headline view prefers tourism
  "business",
  "transit",
  "work",
  "study",
  "family",
  "diplomatic",
];

export async function destinationSummariesForPassport(
  iso2: string,
): Promise<DestinationSummaryForPassport[]> {
  const passportId = await passportIdFor(iso2.toUpperCase());
  if (!passportId) return [];

  const rows = await db
    .select({
      destinationIso2: schema.visaOptions.destinationIso2,
      purpose: schema.visaOptions.purpose,
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      maxStayDays: schema.visaOptions.maxStayDays,
      processingTimeDaysMax: schema.visaOptions.processingTimeDaysMax,
      requirements: schema.visaOptions.requirements,
      biometricsRequired: schema.visaOptions.biometricsRequired,
      onwardTicketRequired: schema.visaOptions.onwardTicketRequired,
      proofOfFundsRequired: schema.visaOptions.proofOfFundsRequired,
      proofOfAccommodationRequired: schema.visaOptions.proofOfAccommodationRequired,
      passportValidityMonthsRequired: schema.visaOptions.passportValidityMonthsRequired,
      visaOptionId: schema.visaOptions.id,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.passportId, passportId));

  // Pull fees in a second pass so we don't have to join + groupBy in SQL.
  const ids = rows.map((r) => r.visaOptionId);
  const feeRows = ids.length
    ? await db
        .select({
          visaOptionId: schema.feeComponents.visaOptionId,
          kind: schema.feeComponents.kind,
          amountMinor: schema.feeComponents.amountMinor,
          currency: schema.feeComponents.currency,
          optional: schema.feeComponents.optional,
        })
        .from(schema.feeComponents)
        .where(inArray(schema.feeComponents.visaOptionId, ids))
    : [];
  const feesByOpt = new Map<number, DestinationSummaryForPassport["fees"]>();
  for (const f of feeRows) {
    const existing = feesByOpt.get(f.visaOptionId) ?? [];
    existing.push({ kind: f.kind, amountMinor: f.amountMinor, currency: f.currency, optional: f.optional });
    feesByOpt.set(f.visaOptionId, existing);
  }

  // Pick the "headline" option per destination — prefer tourism, then by
  // status (visa-free wins) so the easiest-bucket grouping is meaningful.
  const byDest = new Map<string, typeof rows[number]>();
  for (const r of rows) {
    const existing = byDest.get(r.destinationIso2);
    if (!existing) {
      byDest.set(r.destinationIso2, r);
      continue;
    }
    const existingScore = headlineScore(existing.purpose as Purpose, existing.status as VisaStatus);
    const candidateScore = headlineScore(r.purpose as Purpose, r.status as VisaStatus);
    if (candidateScore > existingScore) byDest.set(r.destinationIso2, r);
  }

  return [...byDest.values()].map((r) => ({
    destinationIso2: r.destinationIso2,
    status: r.status as VisaStatus,
    label: r.label,
    maxStayDays: r.maxStayDays,
    processingTimeDaysMax: r.processingTimeDaysMax,
    fees: feesByOpt.get(r.visaOptionId) ?? [],
    requirementsCount: ((r.requirements as string[] | null) ?? []).length,
    biometricsRequired: r.biometricsRequired,
    onwardTicketRequired: r.onwardTicketRequired,
    proofOfFundsRequired: r.proofOfFundsRequired,
    proofOfAccommodationRequired: r.proofOfAccommodationRequired,
    passportValidityMonthsRequired: r.passportValidityMonthsRequired,
    purpose: r.purpose as Purpose,
  }));
}

const STATUS_HEADLINE_RANK: Record<VisaStatus, number> = {
  visa_free: 7,
  visa_free_with_eta: 6,
  visa_on_arrival: 5,
  e_visa: 4,
  embassy_visa: 3,
  restricted: 2,
  refused: 1,
};

function headlineScore(purpose: Purpose, status: VisaStatus): number {
  const purposeRank = PURPOSE_PRIORITY.length - PURPOSE_PRIORITY.indexOf(purpose);
  const statusRank = STATUS_HEADLINE_RANK[status];
  return purposeRank * 100 + statusRank;
}

// ---------------------------------------------------------------------------
// Passport rankings: aggregate strength index across all passports for which
// we have data. Powers /passport-rankings — a sortable directory page that
// surfaces breadth of access at a glance.
// ---------------------------------------------------------------------------

export type PassportRanking = {
  iso2: string;
  totalDestinations: number;
  // Combined visa-free + visa-free-with-eta count for tourism (the standard
  // passport-strength index metric).
  visaFreeAccess: number;
  totalOptions: number;
};

export async function passportRankings(): Promise<PassportRanking[]> {
  // One pass over visa_options + a join to passports → countries so we can
  // group by issuer ISO. Tourism-only filter for the headline visa-free count.
  const tourismRows = await db
    .select({
      iso2: schema.passports.issuerIso2,
      status: schema.visaOptions.status,
      destIso: schema.visaOptions.destinationIso2,
    })
    .from(schema.visaOptions)
    .innerJoin(schema.passports, eq(schema.passports.id, schema.visaOptions.passportId))
    .where(
      and(
        eq(schema.visaOptions.purpose, "tourism"),
        eq(schema.passports.type, "ordinary"),
      ),
    );

  const allRows = await db
    .select({
      iso2: schema.passports.issuerIso2,
      destIso: schema.visaOptions.destinationIso2,
    })
    .from(schema.visaOptions)
    .innerJoin(schema.passports, eq(schema.passports.id, schema.visaOptions.passportId))
    .where(eq(schema.passports.type, "ordinary"));

  const visaFreeByIso = new Map<string, Set<string>>();
  for (const r of tourismRows) {
    if (r.status !== "visa_free" && r.status !== "visa_free_with_eta") continue;
    if (!visaFreeByIso.has(r.iso2)) visaFreeByIso.set(r.iso2, new Set());
    visaFreeByIso.get(r.iso2)!.add(r.destIso);
  }

  const totalsByIso = new Map<string, { dests: Set<string>; options: number }>();
  for (const r of allRows) {
    let entry = totalsByIso.get(r.iso2);
    if (!entry) {
      entry = { dests: new Set(), options: 0 };
      totalsByIso.set(r.iso2, entry);
    }
    entry.dests.add(r.destIso);
    entry.options += 1;
  }

  const rankings: PassportRanking[] = [];
  for (const [iso2, entry] of totalsByIso) {
    rankings.push({
      iso2,
      totalDestinations: entry.dests.size,
      visaFreeAccess: visaFreeByIso.get(iso2)?.size ?? 0,
      totalOptions: entry.options,
    });
  }

  rankings.sort((a, b) =>
    b.visaFreeAccess - a.visaFreeAccess || b.totalDestinations - a.totalDestinations,
  );

  return rankings;
}

// ---------------------------------------------------------------------------
// Symmetric to destinationSummariesForPassport — "who finds it easiest to
// enter X?" for the destination index page.
// ---------------------------------------------------------------------------

export type OriginSummaryForDestination = {
  passportIso2: string;
  status: VisaStatus;
  label: string;
  maxStayDays: number | null;
  processingTimeDaysMax: number | null;
  fees: Array<{ kind: string; amountMinor: number; currency: string; optional: boolean }>;
  requirementsCount: number;
  biometricsRequired: boolean | null;
  onwardTicketRequired: boolean | null;
  proofOfFundsRequired: boolean | null;
  proofOfAccommodationRequired: boolean | null;
  passportValidityMonthsRequired: number | null;
  purpose: Purpose;
};

export async function originSummariesForDestination(
  iso2: string,
): Promise<OriginSummaryForDestination[]> {
  const upper = iso2.toUpperCase();
  const rows = await db
    .select({
      passportIso2: schema.passports.issuerIso2,
      purpose: schema.visaOptions.purpose,
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      maxStayDays: schema.visaOptions.maxStayDays,
      processingTimeDaysMax: schema.visaOptions.processingTimeDaysMax,
      requirements: schema.visaOptions.requirements,
      biometricsRequired: schema.visaOptions.biometricsRequired,
      onwardTicketRequired: schema.visaOptions.onwardTicketRequired,
      proofOfFundsRequired: schema.visaOptions.proofOfFundsRequired,
      proofOfAccommodationRequired: schema.visaOptions.proofOfAccommodationRequired,
      passportValidityMonthsRequired: schema.visaOptions.passportValidityMonthsRequired,
      visaOptionId: schema.visaOptions.id,
    })
    .from(schema.visaOptions)
    .innerJoin(schema.passports, eq(schema.passports.id, schema.visaOptions.passportId))
    .where(
      and(
        eq(schema.visaOptions.destinationIso2, upper),
        eq(schema.passports.type, "ordinary"),
      ),
    );

  const ids = rows.map((r) => r.visaOptionId);
  const feeRows = ids.length
    ? await db
        .select({
          visaOptionId: schema.feeComponents.visaOptionId,
          kind: schema.feeComponents.kind,
          amountMinor: schema.feeComponents.amountMinor,
          currency: schema.feeComponents.currency,
          optional: schema.feeComponents.optional,
        })
        .from(schema.feeComponents)
        .where(inArray(schema.feeComponents.visaOptionId, ids))
    : [];
  const feesByOpt = new Map<number, OriginSummaryForDestination["fees"]>();
  for (const f of feeRows) {
    const list = feesByOpt.get(f.visaOptionId) ?? [];
    list.push({ kind: f.kind, amountMinor: f.amountMinor, currency: f.currency, optional: f.optional });
    feesByOpt.set(f.visaOptionId, list);
  }

  const byOrigin = new Map<string, typeof rows[number]>();
  for (const r of rows) {
    const existing = byOrigin.get(r.passportIso2);
    if (!existing) {
      byOrigin.set(r.passportIso2, r);
      continue;
    }
    const existingScore = headlineScore(existing.purpose as Purpose, existing.status as VisaStatus);
    const candidateScore = headlineScore(r.purpose as Purpose, r.status as VisaStatus);
    if (candidateScore > existingScore) byOrigin.set(r.passportIso2, r);
  }

  return [...byOrigin.values()].map((r) => ({
    passportIso2: r.passportIso2,
    status: r.status as VisaStatus,
    label: r.label,
    maxStayDays: r.maxStayDays,
    processingTimeDaysMax: r.processingTimeDaysMax,
    fees: feesByOpt.get(r.visaOptionId) ?? [],
    requirementsCount: ((r.requirements as string[] | null) ?? []).length,
    biometricsRequired: r.biometricsRequired,
    onwardTicketRequired: r.onwardTicketRequired,
    proofOfFundsRequired: r.proofOfFundsRequired,
    proofOfAccommodationRequired: r.proofOfAccommodationRequired,
    passportValidityMonthsRequired: r.passportValidityMonthsRequired,
    purpose: r.purpose as Purpose,
  }));
}

// ---------------------------------------------------------------------------
// Site-wide aggregate stats. Powers the homepage "trust signals" row so
// visitors can see the database scale at a glance — verified records,
// distinct passports/destinations, and the count of primary sources.
// ---------------------------------------------------------------------------

export type SiteStats = {
  totalRecords: number;
  distinctPassports: number;
  distinctDestinations: number;
  distinctSources: number;
};

// ---------------------------------------------------------------------------
// easierPassportsFor: passports that get visa-free tourism access to a given
// destination. Surfaced as the "if you hold dual citizenship, try one of
// these" hint on result pages where realism is low. Cached per destination.
// ---------------------------------------------------------------------------

export type EasyPassport = {
  iso2: string;
  status: string;
  maxStayDays: number | null;
};

const EASIER_CACHE = new Map<string, EasyPassport[]>();

export async function easierPassportsFor(
  destinationIso2: string,
  excludeIso2: string,
  limit = 6,
): Promise<EasyPassport[]> {
  const dest = destinationIso2.toUpperCase();
  const exclude = excludeIso2.toUpperCase();
  const cacheKey = `${dest}|${exclude}|${limit}`;
  const cached = EASIER_CACHE.get(cacheKey);
  if (cached) return cached;

  const rows = await db
    .select({
      iso2: schema.passports.issuerIso2,
      status: schema.visaOptions.status,
      maxStayDays: schema.visaOptions.maxStayDays,
    })
    .from(schema.visaOptions)
    .innerJoin(schema.passports, eq(schema.passports.id, schema.visaOptions.passportId))
    .where(
      and(
        eq(schema.visaOptions.destinationIso2, dest),
        eq(schema.visaOptions.purpose, "tourism"),
        eq(schema.passports.type, "ordinary"),
      ),
    );

  // Best status per passport — prefer visa_free > visa_free_with_eta > visa_on_arrival.
  const order = ["visa_free", "visa_free_with_eta", "visa_on_arrival"];
  const best = new Map<string, EasyPassport>();
  for (const r of rows) {
    if (r.iso2 === exclude || r.iso2 === dest) continue;
    if (!order.includes(r.status)) continue;
    const existing = best.get(r.iso2);
    if (!existing || order.indexOf(r.status) < order.indexOf(existing.status)) {
      best.set(r.iso2, { iso2: r.iso2, status: r.status, maxStayDays: r.maxStayDays });
    }
  }

  const result = [...best.values()]
    .sort((a, b) => {
      const ord = order.indexOf(a.status) - order.indexOf(b.status);
      if (ord !== 0) return ord;
      return (b.maxStayDays ?? 0) - (a.maxStayDays ?? 0);
    })
    .slice(0, limit);

  EASIER_CACHE.set(cacheKey, result);
  return result;
}

export async function siteStats(): Promise<SiteStats> {
  const [records, passports, destinations, sources] = await Promise.all([
    db.select({ n: sql<number>`COUNT(*)::int` }).from(schema.visaOptions),
    db
      .select({ n: sql<number>`COUNT(DISTINCT ${schema.visaOptions.passportId})::int` })
      .from(schema.visaOptions),
    db
      .select({
        n: sql<number>`COUNT(DISTINCT ${schema.visaOptions.destinationIso2})::int`,
      })
      .from(schema.visaOptions),
    db.select({ n: sql<number>`COUNT(*)::int` }).from(schema.sources),
  ]);
  return {
    totalRecords: records[0]?.n ?? 0,
    distinctPassports: passports[0]?.n ?? 0,
    distinctDestinations: destinations[0]?.n ?? 0,
    distinctSources: sources[0]?.n ?? 0,
  };
}
