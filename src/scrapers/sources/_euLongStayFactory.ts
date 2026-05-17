/**
 * Shared factory for EU member-state long-stay D-class adapters.
 *
 * Each member state's national long-stay visa follows a similar shape:
 *   - Employer-sponsored or self-sufficient income evidence
 *   - 1-2 year initial validity, renewable to 5-year EU long-term resident
 *   - Apostilled credentials + translation
 *   - Issued by the destination's consulate, finalised at local immigration
 *
 * Rather than reimplementing the politeFetch + cheerio shell for every
 * member state, this factory takes a per-country config and produces a
 * standard Adapter. Member-state-specific quirks (salary thresholds,
 * language tests, fast-track shortage occupations) go in the config.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

export type EuLongStayConfig = {
  /** Unique adapter id (e.g. "nl_hsm", "it_lavoro_subordinato"). */
  id: string;
  /** Adapter display name. */
  name: string;
  /** ISO2 of the destination member state. */
  destinationIso2: string;
  /** Primary source URL (must respond with text matching `liveness`). */
  sourceUrl: string;
  /** Substring or regex the source HTML must contain for parse() to succeed. */
  liveness: RegExp;
  /** Visa label shown on the record. */
  label: string;
  /** Initial validity in days. */
  initialValidityDays: number;
  /** Salary threshold (minor units, optional). */
  salaryMinor?: number;
  /** Salary currency (default EUR). */
  salaryCurrency?: string;
  /** Application processing window. */
  processingDaysMin: number;
  processingDaysMax: number;
  /** Application fee in minor units (optional). */
  applicationFeeMinor?: number;
  /** Application fee currency (default EUR). */
  applicationFeeCurrency?: string;
  /** Application URL. */
  applicationUrl?: string;
  /** Requirements bullet points. */
  requirements: string[];
  /** Editorial notes (what makes this member-state's route distinctive). */
  notes: string;
  /** Purpose (default "work"). */
  purpose?: "work" | "family" | "study";
  /** Excluded passport nationalities (e.g. EU/EEA — they don't need this). */
  excludedPassports?: ReadonlySet<string>;
};

const STANDARD_EU_EEA_EXEMPT: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "CH",
]);

/**
 * Build a standard EU long-stay adapter from a per-country config.
 */
export function makeEuLongStayAdapter(cfg: EuLongStayConfig): Adapter {
  const purpose = cfg.purpose ?? "work";
  const exempt = cfg.excludedPassports ?? STANDARD_EU_EEA_EXEMPT;

  return {
    metadata: {
      id: cfg.id,
      name: cfg.name,
      kind: "government",
      parserVersion: "1.0.0",
      defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
      primaryUrls: [cfg.sourceUrl],
    },

    async fetch(_ctx: FetchContext) {
      const res = await politeFetch(cfg.sourceUrl);
      if (!res.ok) return null;
      return { rawText: await res.text(), fetchUrl: cfg.sourceUrl };
    },

    async parse(raw) {
      if (!cfg.liveness.test(raw.rawText)) {
        return { records: [], parseError: `${cfg.name} source did not match expected wording.` };
      }
      const today = new Date().toISOString().slice(0, 10);
      const records: ParsedRecord[] = [];
      for (const country of COUNTRY_LIST) {
        if (country.iso2 === cfg.destinationIso2 || exempt.has(country.iso2)) continue;
        records.push({
          passportIso2: country.iso2,
          destinationIso2: cfg.destinationIso2,
          purpose,
          status: "embassy_visa",
          label: cfg.label,
          maxStayDays: cfg.initialValidityDays,
          validityDays: cfg.initialValidityDays,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 12,
          onwardTicketRequired: false,
          proofOfFundsRequired: purpose !== "work",
          requirements: cfg.requirements,
          processingTimeDaysMin: cfg.processingDaysMin,
          processingTimeDaysMax: cfg.processingDaysMax,
          applicationUrl: cfg.applicationUrl ?? cfg.sourceUrl,
          primarySourceUrl: cfg.sourceUrl,
          fees: cfg.applicationFeeMinor
            ? [
                {
                  kind: "base",
                  amountMinor: cfg.applicationFeeMinor,
                  currency: cfg.applicationFeeCurrency ?? "EUR",
                  asOf: today,
                  optional: false,
                },
              ]
            : [],
          notes: cfg.notes,
        });
      }
      return { records };
    },
  };
}
