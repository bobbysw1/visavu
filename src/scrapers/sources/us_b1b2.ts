/**
 * US B1/B2 tourist & business visa adapter.
 *
 * Source: https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html
 *
 * Covers the non-Visa-Waiver-Program (non-VWP) nationalities. The VWP
 * adapter populates visa-free-with-eTA records for ~41 designated countries;
 * this adapter fills the rest of the matrix with the standard B1/B2 visitor
 * visa. Combined, the two cover every (passport → US, tourism) cell.
 *
 * Avoids overlap by skipping ISO codes that appear in the VWP list.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html";

// VWP-designated countries (≤41) — skipped here to avoid overlap with the
// us_visa_waiver_program adapter. Stays in sync with that adapter's fixture.
const VWP_NATIONALITIES: Set<string> = new Set([
  "AD", "AU", "AT", "BE", "BN", "CL", "HR", "CZ", "DK", "EE",
  "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IL", "IT", "JP",
  "KR", "LV", "LI", "LT", "LU", "MT", "MC", "NL", "NZ", "NO",
  "PL", "PT", "SM", "SG", "SK", "SI", "ES", "SE", "CH", "TW", "GB",
]);

// US-citizen-equivalent / no-visa-needed for native US destination.
const SKIP_PASSPORTS: Set<string> = new Set(["US"]);

export const usB1B2Adapter: Adapter = {
  metadata: {
    id: "us_b1b2",
    name: "US B1/B2 Visitor visa (state.gov)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000, // bi-weekly — page changes infrequently
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/us_b1b2.html",
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

    if (!/(b-1|b-2|visitor\s+visa|business|tourism)/i.test(main)) {
      return {
        records: [],
        parseError: "Page text does not match expected B1/B2 / visitor visa wording.",
      };
    }

    const requirements = [
      "DS-160 nonimmigrant visa application form",
      "Valid passport (at least 6 months beyond intended stay)",
      "Recent photograph meeting US visa specifications",
      "Visa application fee receipt (machine-readable)",
      "Documentary evidence of strong ties to home country (employment, property, family)",
      "Proof of sufficient funds for the trip",
      "Itinerary and intended duration of stay",
      "Interview at the US embassy or consulate (most applicants 14–79)",
    ];

    const records: ParsedRecord[] = [];

    for (const c of COUNTRY_LIST) {
      if (SKIP_PASSPORTS.has(c.iso2)) continue;
      if (VWP_NATIONALITIES.has(c.iso2)) continue;

      // Tourism (B-2)
      records.push({
        passportIso2: c.iso2,
        destinationIso2: "US",
        purpose: "tourism",
        status: "embassy_visa",
        label: "B-2 Visitor visa (Tourism)",
        maxStayDays: 180, // typical admission period
        validityDays: 10 * 365, // up to 10 years for many nationalities; per-country reciprocity in real data
        entriesAllowed: "multiple (typically)",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "US Embassy / Consulate (interview + fingerprints)",
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        onwardTicketRequired: true,
        requirements,
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 90, // wait times vary widely by post; can be much longer
        applicationUrl: "https://ceac.state.gov/genniv/",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base", amountMinor: 18500, currency: "USD", asOf: today, label: "MRV application fee" },
        ],
        notes:
          "B-2 covers tourism, visiting friends/family, medical treatment, and short recreational courses. Maximum admission period is determined by the CBP officer at the port of entry — typically up to 6 months. Visa validity (multi-year, multi-entry) is set by reciprocity schedule per nationality.",
      });

      // Business (B-1)
      records.push({
        passportIso2: c.iso2,
        destinationIso2: "US",
        purpose: "business",
        status: "embassy_visa",
        label: "B-1 Visitor visa (Business)",
        maxStayDays: 180,
        validityDays: 10 * 365,
        entriesAllowed: "multiple (typically)",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "US Embassy / Consulate (interview + fingerprints)",
        proofOfFundsRequired: true,
        onwardTicketRequired: true,
        requirements: [
          ...requirements,
          "Letter of invitation from the US business entity (where applicable)",
          "Conference / training agenda (where applicable)",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 90,
        applicationUrl: "https://ceac.state.gov/genniv/",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base", amountMinor: 18500, currency: "USD", asOf: today, label: "MRV application fee" },
        ],
        notes:
          "B-1 permits attending meetings, conferences, contract negotiations, and short consultations. It does NOT permit gainful employment in the US. Often issued as a combined B-1/B-2 visa.",
      });
    }

    if (records.length < 200) {
      return {
        records,
        parseError: `Only ${records.length} B1/B2 records generated; expected ~400+.`,
      };
    }

    return { records };
  },
};
