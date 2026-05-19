/**
 * Destination visa-category adapter factory.
 *
 * Most destinations have a recognisable shape of visa categories (Tourist,
 * Business, Work, Student, Family, Investor / Golden, Retirement). Building
 * one adapter per destination by hand wastes 70% of the code on identical
 * scaffolding. This factory takes a structured per-destination spec and
 * builds the adapter — same Adapter interface, same emission shape, same
 * fixture stub.
 *
 * Per-destination spec example:
 *
 *   buildDestinationAdapter({
 *     id: "eg_visa_categories",
 *     iso2: "EG",
 *     name: "Egypt visa categories",
 *     primaryUrls: ["https://www.mfa.gov.eg/", "https://www.visa2egypt.gov.eg/"],
 *     categories: [
 *       { label: "Work Permit — Egypt", purpose: "work", status: "embassy_visa", ... },
 *       { label: "Student Visa — Egypt", purpose: "study", status: "embassy_visa", ... },
 *       …
 *     ],
 *     // Optional: only emit a category for specific nationalities
 *     // (e.g. CBI eligibility, VOA list). Default = all non-self nationalities.
 *     nationalityFilter: (passport) => true,
 *   });
 *
 * Each adapter emits N categories × ~250 nationalities = N×250 rows.
 *
 * Source-of-truth principle: data baked in here must match the latest
 * government immigration-service site (linked in primaryUrls). Refresh
 * quarterly. The factory does not "fetch" — it's a static-data adapter, the
 * canonical pattern for hand-curated category specs.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";
import type { Purpose, VisaStatus } from "@/lib/types";

export type CategorySpec = {
  /** Display label — must be unique within the destination. */
  label: string;
  purpose: Purpose;
  status: VisaStatus;
  maxStayDays?: number | null;
  validityDays?: number | null;
  entriesAllowed?: "single" | "multiple" | null;
  passportValidityMonthsRequired?: number | null;
  blankPagesRequired?: number | null;
  onwardTicketRequired?: boolean | null;
  proofOfFundsRequired?: boolean | null;
  proofOfAccommodationRequired?: boolean | null;
  biometricsRequired?: boolean | null;
  biometricsLocation?: string | null;
  requirements: string[];
  processingTimeDaysMin?: number | null;
  processingTimeDaysMax?: number | null;
  applicationUrl?: string | null;
  primarySourceUrl?: string | null;
  /** [{amountMinor, currency, label}, …] — kind defaults to "base". */
  fees?: Array<{
    amountMinor: number;
    currency: string;
    label?: string;
    kind?: "base" | "service" | "biometrics" | "courier" | "vac" | "rush" | "other";
    optional?: boolean;
  }>;
  notes?: string | null;
  purposeMetadata?: Record<string, unknown> | null;
  /** Optional nationality filter — if set, only emit for nationalities returning true. */
  nationalityFilter?: (passportIso2: string) => boolean;
  /** Nationalities the category EXCLUDES even when filter returns true. */
  excludeNationalities?: string[];
};

export type DestinationAdapterSpec = {
  /** Stable id matching sources table convention, snake_case, e.g. "eg_visa_categories". */
  id: string;
  /** ISO2 of the destination country. */
  iso2: string;
  /** Display name for source registry. */
  name: string;
  /** Source documentation URLs. */
  primaryUrls: string[];
  /** Path to a fixture stub (empty {} is fine — staticData). */
  fixturePath: string;
  /** Visa category specs to emit. */
  categories: CategorySpec[];
  /** Refresh interval (default 90 days). */
  defaultIntervalMs?: number;
};

export function buildDestinationAdapter(spec: DestinationAdapterSpec): Adapter {
  const ALL = COUNTRY_LIST.map((c) => c.iso2);
  const SELF_EXCLUDED = new Set([spec.iso2]);

  return {
    metadata: {
      id: spec.id,
      name: spec.name,
      kind: "government",
      parserVersion: "1.0.0",
      defaultIntervalMs: spec.defaultIntervalMs ?? 90 * 24 * 60 * 60 * 1000,
      primaryUrls: spec.primaryUrls,
      fixturePath: spec.fixturePath,
      staticData: true,
    },

    async fetch(_ctx: FetchContext) {
      return { rawText: JSON.stringify({ source: spec.id }), fetchUrl: `manual://${spec.id}` };
    },

    async parse() {
      const today = new Date().toISOString().slice(0, 10);
      const records: ParsedRecord[] = [];

      for (const passport of ALL) {
        if (SELF_EXCLUDED.has(passport)) continue;
        for (const cat of spec.categories) {
          if (cat.nationalityFilter && !cat.nationalityFilter(passport)) continue;
          if (cat.excludeNationalities?.includes(passport)) continue;
          records.push({
            passportIso2: passport,
            destinationIso2: spec.iso2,
            purpose: cat.purpose,
            status: cat.status,
            label: cat.label,
            maxStayDays: cat.maxStayDays ?? null,
            validityDays: cat.validityDays ?? null,
            entriesAllowed: cat.entriesAllowed ?? null,
            passportValidityMonthsRequired: cat.passportValidityMonthsRequired ?? null,
            blankPagesRequired: cat.blankPagesRequired ?? null,
            onwardTicketRequired: cat.onwardTicketRequired ?? null,
            proofOfFundsRequired: cat.proofOfFundsRequired ?? null,
            proofOfAccommodationRequired: cat.proofOfAccommodationRequired ?? null,
            biometricsRequired: cat.biometricsRequired ?? null,
            biometricsLocation: cat.biometricsLocation ?? null,
            requirements: cat.requirements,
            processingTimeDaysMin: cat.processingTimeDaysMin ?? null,
            processingTimeDaysMax: cat.processingTimeDaysMax ?? null,
            applicationUrl: cat.applicationUrl ?? null,
            primarySourceUrl: cat.primarySourceUrl ?? null,
            fees: cat.fees?.map((f) => ({
              kind: f.kind ?? "base",
              amountMinor: f.amountMinor,
              currency: f.currency,
              asOf: today,
              label: f.label,
              optional: f.optional,
            })),
            notes: cat.notes ?? null,
            purposeMetadata: cat.purposeMetadata ?? null,
          });
        }
      }

      return { records };
    },
  };
}
