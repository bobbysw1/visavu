/**
 * Germany EU Blue Card adapter.
 *
 * Source: https://www.make-it-in-germany.com/en/visa-residence/eu-blue-card
 *
 * Status: embassy_visa, purpose=work. The Blue Card is the EU-wide framework
 * for highly-qualified non-EU nationals; this adapter covers Germany's
 * implementation, which is the most-used Blue Card route in the EU.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card";

// EU/EEA + Switzerland nationals don't need the Blue Card — they have free
// movement under EU law. Skip them.
const EU_EEA_SWISS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IS", "IT", "LV", "LI", "LT", "LU",
  "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH",
]);

export const germanyBlueCardAdapter: Adapter = {
  metadata: {
    id: "de_eu_blue_card",
    name: "Germany EU Blue Card (make-it-in-germany.com)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/de_blue_card.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("body").text().replace(/\s+/g, " ");

    if (!/(blue\s+card|blaue\s+karte)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected Blue Card wording." };
    }

    // 2024 thresholds: regular professions €45,300; shortage occupations €41,041.62
    // We surface the regular threshold as the headline value.
    const salaryMatches = [...main.matchAll(/€?\s?(\d{2,3}(?:[.,]\d{3})+|\d{4,6})/g)]
      .map((m) => parseInt(m[1].replace(/[.,]/g, ""), 10))
      .filter((n) => n >= 35_000 && n <= 80_000);
    const salaryThreshold = salaryMatches.length > 0 ? Math.max(...salaryMatches) : 45_300;

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      salaryThresholdMinor: salaryThreshold * 100,
      salaryCurrency: "EUR",
      jobOfferRequired: true,
      workPermitDays: 4 * 365,
      routeToSettlement: true, // settlement permit after 33 months (or 21 with B1 German)
      eligibleOccupations: [
        "IT specialist",
        "Software engineer",
        "Data scientist",
        "Civil / mechanical / electrical engineer",
        "Architect",
        "Mathematician / scientist",
        "Doctor (recognised qualification)",
        "Academic teacher / researcher",
      ],
    };

    const requirements = [
      "Recognized university degree or comparable qualification",
      "Concrete job offer in Germany",
      "Gross annual salary at or above the Blue Card threshold",
      "Health insurance (statutory or comparable private)",
      "Valid passport",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "DE" && !EU_EEA_SWISS.has(c.iso2))
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "DE",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "EU Blue Card (Germany)",
        maxStayDays: 4 * 365,
        validityDays: 4 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "German embassy / consulate in your country",
        requirements,
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 90,
        applicationUrl: "https://www.make-it-in-germany.com/en/visa-residence/eu-blue-card/applying-for-a-blue-card",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 100_00, currency: "EUR", asOf: today, label: "Visa application fee" },
          { kind: "service" as const, amountMinor: 100_00, currency: "EUR", asOf: today, label: "Residence permit issuance fee" },
        ],
        notes:
          "The EU Blue Card grants residence and work in Germany for up to 4 years and provides a fast track to a settlement permit (33 months, or 21 with B1 German). Family reunification is fast-tracked, and Blue Card holders can move to other EU member states after 12 months of residence.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} Blue Card records (expected ~220+).` };
    }
    return { records };
  },
};
