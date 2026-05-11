/**
 * Portugal D7 (Passive Income / Retirement) visa adapter.
 *
 * Source: https://vistos.mne.gov.pt/en/national-visas/general-information/who-can-apply
 *
 * Portugal's D7 is the canonical "passive income" route — popular with
 * retirees, freelancers and remote workers (though Portugal also has a
 * dedicated D8 Digital Nomad visa). D7 grants 4-month entry visa convertible
 * to a 2-year residence permit, renewable to 3, then permanent residence /
 * citizenship after 5 years.
 *
 * Excludes EU/EEA + Switzerland (free movement applies).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { FamilyVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://vistos.mne.gov.pt/en/national-visas/general-information";

const EU_EEA_SWISS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "CH",
]);

export const portugalD7Adapter: Adapter = {
  metadata: {
    id: "pt_d7",
    name: "Portugal D7 visa (Passive income / Retirement)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/pt_d7.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("main, body").text().replace(/\s+/g, " ");

    if (!/(d7|passive\s+income|residen|nacional)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected D7 / passive-income wording." };
    }

    // 2024–2025 income threshold: 100% of Portuguese minimum wage (~€820/month
    // for primary applicant) + 50% for spouse + 30% per dependent.
    // For a single applicant: ~€9,840/year minimum.
    const purposeMetadata: FamilyVisaMetadata = {
      // We model D7 under purpose=family because it primarily serves
      // self-supporting residents (retirees, family-based moves) and
      // the relationship pattern (spouse + dependents joining) matches
      // the family schema. Income threshold is a sponsor-equivalent.
      relationshipTypes: ["spouse", "partner", "child", "dependent"],
      sponsorIncomeThresholdMinor: 9_840_00,
      sponsorIncomeCurrency: "EUR",
      sponsorMustBeCitizenOrResident: false,
      cohabitationProofRequired: false,
      routeToSettlement: true,
    };

    const requirements = [
      "Stable, regular passive income (pension, rental, dividends, royalties) ≥ €820/month",
      "Proof of accommodation in Portugal (lease, deed, or owned property)",
      "Portuguese tax number (NIF)",
      "Portuguese bank account with deposited 12-month minimum balance",
      "Health insurance valid in Portugal (or registration with SNS)",
      "Clean criminal record (apostilled)",
      "Demonstrate genuine intent to reside in Portugal (≥183 days/year)",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "PT" && !EU_EEA_SWISS.has(c.iso2))
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "PT",
        purpose: "family" as const,
        status: "embassy_visa" as const,
        label: "Portugal D7 visa (Passive Income)",
        maxStayDays: 4 * 30, // 4-month national entry visa, then residence permit
        validityDays: 4 * 30,
        entriesAllowed: "double",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "Portuguese consulate / VFS centre",
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        requirements,
        processingTimeDaysMin: 60,
        processingTimeDaysMax: 120,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 90_00, currency: "EUR", asOf: today, label: "National visa (D7) application fee" },
          { kind: "service" as const, amountMinor: 170_00, currency: "EUR", asOf: today, label: "Residence permit (AIMA) issuance fee" },
        ],
        notes:
          "D7 is Portugal's passive-income / retirement route. The 4-month national visa is converted to a 2-year residence permit on arrival, renewable for 3 more years, after which permanent residence (or citizenship via the language test) becomes available. Holders may register for the NHR / IFICI tax regime. Family members may join under a unified application.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} D7 records (expected ~220).` };
    }
    return { records };
  },
};
