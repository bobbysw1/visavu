/**
 * United States "Gold Card" visa — announced February 2025.
 *
 * The Gold Card replaces / supplements the EB-5 investor program with a flat
 * US$5 million payment to the U.S. government in exchange for permanent
 * residency (and a path to citizenship). At time of writing the program is
 * being implemented and applications have begun rolling out via official
 * channels at goldcardvisa.gov (a verification of the launch URL is
 * recommended on each refresh — the program is unusually politically active).
 *
 * Eligibility: any nationality not on a sanctions list (effectively the
 * standard B-visa eligibility universe). We emit one record per passport
 * except for sanctioned states.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.uscis.gov/working-in-the-united-states/permanent-workers";

// Excluded for Gold Card per OFAC sanctions screening + program guidance.
const EXCLUDED = new Set(["IR", "KP", "SY", "CU", "RU", "BY"]);

export const usGoldCardAdapter: Adapter = {
  metadata: {
    id: "us_gold_card",
    name: "US Gold Card visa (US$5M permanent-residency pathway)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/us_gold_card.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return {
      rawText: JSON.stringify({ program: "us_gold_card", asOf: "2026-05-10" }),
      fetchUrl: "manual://us_gold_card",
    };
  },

  async parse() {
    const records: ParsedRecord[] = [];
    for (const c of COUNTRY_LIST) {
      if (c.iso2 === "US") continue;
      if (EXCLUDED.has(c.iso2)) continue;

      records.push({
        passportIso2: c.iso2,
        destinationIso2: "US",
        purpose: "work",
        status: "embassy_visa",
        label: "United States Gold Card (US$5M permanent-residency pathway)",
        maxStayDays: null, // permanent residency
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "US embassy or consulate",
        requirements: [
          "US$5,000,000 payment to the United States government (non-refundable)",
          "Source-of-funds documentation showing the money was lawfully acquired",
          "Standard US criminal-history and security background checks",
          "Medical examination by a panel physician",
          "Not subject to any OFAC sanction or US-specific travel restriction",
          "Tax: Gold Card holders pay US tax only on US-source income (vs. worldwide for green-card holders) — confirmed publicly though formal IRS guidance is pending",
        ],
        processingTimeDaysMin: 60,
        processingTimeDaysMax: 180,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          {
            kind: "base",
            amountMinor: 500_000_000, // US$5,000,000 in cents
            currency: "USD",
            asOf: "2026-05-10",
            label: "Gold Card programme fee — paid to the US government",
            optional: false,
          },
          {
            kind: "service",
            amountMinor: 1_500_000, // US$15,000
            currency: "USD",
            asOf: "2026-05-10",
            label: "Application processing & adjudication (typical legal-counsel range)",
            optional: true,
          },
        ],
        notes:
          "Announced February 2025 by the U.S. administration as a replacement / complement to EB-5. " +
          "Grants lawful permanent residency on payment of US$5M; pathway to citizenship after the standard 5-year residency requirement. " +
          "Verify program status before applying — the Gold Card has been politically contentious and operational details continue to evolve.",
      });
    }
    return { records };
  },
};
