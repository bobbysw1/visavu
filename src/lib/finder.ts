/**
 * "Where can I go?" finder — turns a (passport, goal, optional filters) into a
 * ranked list of matching destinations + the visa option that best fits.
 *
 * Goals are concrete user intents, not raw purpose codes:
 *   - "visit"          — short-stay tourism (visa-free or easiest visa)
 *   - "work_temporary" — Working Holiday programs first, then short work permits
 *   - "live_work"      — long-stay work / employment / talent visas
 *   - "study"          — student visas
 *   - "retire"         — retirement / rentista / passive-income / golden visas
 *   - "invest"         — citizenship-by-investment + golden / investor visas
 *   - "remote_work"    — digital-nomad / remote-work residence permits
 *
 * Each goal maps to a SQL filter against visa_options + a per-status score
 * function that ranks results by "easiness" for the user.
 */
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { VisaStatus, Purpose } from "@/lib/types";
import { COUNTRY_LIST } from "@/lib/countries";

export type FinderGoal =
  | "visit"
  | "work_temporary"
  | "live_work"
  | "study"
  | "retire"
  | "invest"
  | "remote_work";

export const FINDER_GOAL_LABEL: Record<FinderGoal, string> = {
  visit: "Visit somewhere short-term (tourism)",
  work_temporary: "Work and travel for a year (Working Holiday)",
  live_work: "Move there to live and work",
  study: "Study at a foreign university",
  retire: "Retire abroad on savings or pension",
  invest: "Invest for residency or a second passport",
  remote_work: "Work remotely from abroad (digital nomad)",
};

export type FinderResult = {
  destinationIso2: string;
  optionId: number;
  label: string;
  status: VisaStatus;
  purpose: Purpose;
  maxStayDays: number | null;
  feeAmountMinor: number | null;
  feeCurrency: string | null;
  /** Processing time upper bound in days, when known. */
  processingTimeDaysMax: number | null;
  primarySourceUrl: string | null;
  applicationUrl: string | null;
  /** Score 0–100, higher = better fit. Used for ranking. */
  score: number;
  /** One-line rationale shown next to the result. */
  rationale: string;
};

/** Filter description: which purposes / statuses / labels to include for each goal. */
type GoalFilter = {
  purposes: Purpose[];
  /** Only count records whose label matches one of these substring patterns (lowercase). */
  labelIncludes?: string[];
  /** Only count records whose label DOES NOT match these (lowercase). */
  labelExcludes?: string[];
  statuses?: VisaStatus[];
};

const GOAL_FILTERS: Record<FinderGoal, GoalFilter> = {
  visit: {
    purposes: ["tourism"],
    statuses: ["visa_free", "visa_free_with_eta", "visa_on_arrival", "e_visa", "embassy_visa"],
  },
  work_temporary: {
    purposes: ["work"],
    labelIncludes: ["working holiday", "youth mobility", "vacances-travail", "ferias-trabalho", "stagiaires", "vacanze-lavoro", "jugendmobilität"],
  },
  live_work: {
    purposes: ["work"],
    labelExcludes: ["working holiday", "youth mobility", "vacances-travail", "ferias-trabalho", "stagiaires", "vacanze-lavoro", "jugendmobilität", "digital nomad", "nomad residence", "welcome stamp", "work from", "work in nature", "@home", "premium visa", "workcation", "remote work", "rentista", "retire"],
  },
  study: {
    purposes: ["study"],
  },
  retire: {
    // Retirement isn't a single visa "purpose" in any country's taxonomy — it's
    // the user-facing name for "live there off pension / passive income". The
    // adapters store these under family / work, with the route name signalling
    // what it actually is. We catch them by label substring so a British retiree
    // looking for somewhere to land sees Spain NLV, Italy Elective Residence,
    // Greece FIP, Portugal D7, Belize QRP, Mauritius PV, Thailand LTR, etc.
    purposes: ["work", "family"],
    labelIncludes: [
      // Direct retirement / pension wording
      "retire",
      "pensionado",
      "pensioner",
      "pension visa",
      "rentista",
      "rentier",
      "qualified retired",
      "qrp",
      "retirement",
      // Passive income / financially independent
      "passive income",
      "non-lucrative",
      "non lucrative",
      "nlv",
      "financially independent",
      "elective residence",
      "elective resident",
      "independent means",
      "self-sufficient",
      "self sufficient",
      "residencia rentista",
      // Country-specific programmes commonly used as retirement routes
      "d7",
      "d-7",
      "mm2h",
      "my second home",
      "long-term resident",
      "long term resident",
      "ltr",
      "premium visa",
      "second home",
      "golden visa",
      "permanent residency by investment",
      "long-stay visitor",
      "visitor long stay",
      "long-stay tourist",
      "visitante",
      "visa for retirees",
    ],
  },
  invest: {
    purposes: ["work", "family"],
    labelIncludes: ["citizenship-by-investment", "golden", "investor", "gold card", "high-net-worth", "wealthy"],
  },
  remote_work: {
    purposes: ["work"],
    labelIncludes: ["digital nomad", "nomad residence", "welcome stamp", "work from", "work in nature", "@home", "premium visa", "workcation", "remote work", "remote-work", "white card", "long-stay digital nomad", "vitem xiv", "v visa", "b211a", "de rantau"],
  },
};

const STATUS_EASINESS_SCORE: Record<VisaStatus, number> = {
  visa_free: 100,
  visa_free_with_eta: 90,
  visa_on_arrival: 80,
  e_visa: 70,
  embassy_visa: 50,
  restricted: 20,
  refused: 0,
};

export async function findDestinations(
  passportIso2: string,
  goal: FinderGoal,
  options: { limit?: number } = {},
): Promise<FinderResult[]> {
  const { limit = 30 } = options;
  const filter = GOAL_FILTERS[goal];

  const passportRow = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(
      and(
        eq(schema.passports.issuerIso2, passportIso2.toUpperCase()),
        eq(schema.passports.type, "ordinary"),
      ),
    )
    .limit(1);
  if (passportRow.length === 0) return [];

  const passportId = passportRow[0].id;

  const rows = await db
    .select({
      id: schema.visaOptions.id,
      destinationIso2: schema.visaOptions.destinationIso2,
      label: schema.visaOptions.label,
      status: schema.visaOptions.status,
      purpose: schema.visaOptions.purpose,
      maxStayDays: schema.visaOptions.maxStayDays,
      processingTimeDaysMax: schema.visaOptions.processingTimeDaysMax,
      primarySourceUrl: schema.visaOptions.primarySourceUrl,
      applicationUrl: schema.visaOptions.applicationUrl,
    })
    .from(schema.visaOptions)
    .where(
      and(
        eq(schema.visaOptions.passportId, passportId),
        inArray(schema.visaOptions.purpose, filter.purposes),
        ...(filter.statuses ? [inArray(schema.visaOptions.status, filter.statuses)] : []),
      ),
    );

  const ids = rows.map((r) => r.id);
  const feeRows = ids.length
    ? await db
        .select({
          visaOptionId: schema.feeComponents.visaOptionId,
          amountMinor: schema.feeComponents.amountMinor,
          currency: schema.feeComponents.currency,
          optional: schema.feeComponents.optional,
        })
        .from(schema.feeComponents)
        .where(inArray(schema.feeComponents.visaOptionId, ids))
    : [];
  const feesByOpt = new Map<number, { amount: number; currency: string }>();
  for (const f of feeRows) {
    if (f.optional) continue;
    const existing = feesByOpt.get(f.visaOptionId);
    if (!existing) feesByOpt.set(f.visaOptionId, { amount: f.amountMinor, currency: f.currency });
    else if (existing.currency === f.currency) existing.amount += f.amountMinor;
  }

  // Apply label-substring filters in JS — simpler than building dynamic SQL.
  const includes = filter.labelIncludes?.map((s) => s.toLowerCase()) ?? null;
  const excludes = filter.labelExcludes?.map((s) => s.toLowerCase()) ?? null;
  const filtered = rows.filter((r) => {
    const label = r.label.toLowerCase();
    if (includes && !includes.some((s) => label.includes(s))) return false;
    if (excludes && excludes.some((s) => label.includes(s))) return false;
    return true;
  });

  // Best record per destination — keep the one with the highest easiness score.
  const bestPerDest = new Map<string, typeof filtered[number] & { score: number }>();
  for (const r of filtered) {
    const score = STATUS_EASINESS_SCORE[r.status as VisaStatus] ?? 0;
    const existing = bestPerDest.get(r.destinationIso2);
    if (!existing || score > existing.score) {
      bestPerDest.set(r.destinationIso2, { ...r, score });
    }
  }

  const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));

  const results: FinderResult[] = [...bestPerDest.values()]
    .filter((r) => validIso.has(r.destinationIso2))
    .map((r) => {
      const fee = feesByOpt.get(r.id);
      return {
        destinationIso2: r.destinationIso2,
        optionId: r.id,
        label: r.label,
        status: r.status as VisaStatus,
        purpose: r.purpose as Purpose,
        maxStayDays: r.maxStayDays,
        processingTimeDaysMax: r.processingTimeDaysMax ?? null,
        feeAmountMinor: fee?.amount ?? null,
        feeCurrency: fee?.currency ?? null,
        primarySourceUrl: r.primarySourceUrl,
        applicationUrl: r.applicationUrl,
        score: r.score,
        rationale: rationaleFor(r.status as VisaStatus, r.maxStayDays),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreak: longer max stay first, then alphabetical destination.
      const stayDelta = (b.maxStayDays ?? 0) - (a.maxStayDays ?? 0);
      if (stayDelta !== 0) return stayDelta;
      return a.destinationIso2.localeCompare(b.destinationIso2);
    })
    .slice(0, limit);

  return results;
}

function rationaleFor(status: VisaStatus, maxStayDays: number | null): string {
  const stay = maxStayDays != null ? `${maxStayDays} days` : "duration varies";
  switch (status) {
    case "visa_free":
      return `Visa-free entry (${stay})`;
    case "visa_free_with_eta":
      return `Visa-free with electronic travel authorisation (${stay})`;
    case "visa_on_arrival":
      return `Visa on arrival (${stay})`;
    case "e_visa":
      return `Online application; usually fast (${stay})`;
    case "embassy_visa":
      return `Embassy application required (${stay})`;
    case "restricted":
      return "Case-by-case review";
    case "refused":
      return "Entry generally refused";
  }
}
