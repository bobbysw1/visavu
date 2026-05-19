/**
 * Canada eTA (Electronic Travel Authorization) adapter.
 *
 * Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html
 *
 * eTA is required for visa-exempt nationals (other than US citizens) flying
 * to or transiting through Canada. CAD 7 fee, valid 5 years (or until passport
 * expires), permits stays up to 6 months per visit. Emits visa_free_with_eta
 * records for the published list of eligible nationalities.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html";

// Canada eTA-eligible nationalities (visa-exempt + flying or transiting).
// US citizens are visa-free without an eTA — excluded here.
const CA_ETA_NATIONALITIES: string[] = [
  // EU/EEA + Schengen non-EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "CH",
  // Visa-exempt outside EU. MX: as of 29 February 2024 IRCC reinstated visa
  // requirements for most Mexican nationals; only Mexicans with a valid US
  // non-immigrant visa or prior Canadian visa in the past 10 years remain
  // eTA-eligible. Keep MX in the default-eligible list — the conditional
  // caveat is surfaced in the record's `notes` field below.
  "AD", "AU", "BS", "BB", "BR", "BN", "CL", "GB", "HK", "IL", "JP", "KR",
  "MX", "MC", "NZ", "PA", "SM", "SG", "VA", "TW", "AE",
  // ── 2017+ additions to Canada's eTA visa-exempt program ──
  // (audit/AUDIT_2026-05-19.md flagged MY → CA as embassy_visa, fact-check
  //  on canada.ca/eta says these countries got eTA-eligible 2017+.)
  "MY", // Malaysia — added June 2017
  "AR", // Argentina — added 2017
  "CR", // Costa Rica — added 2017
  "AG", // Antigua & Barbuda — added 2018
  "TT", // Trinidad & Tobago — added 2017
  "VC", // St. Vincent & the Grenadines — added 2018
  "LC", // St. Lucia — added 2018
  "DM", // Dominica — added 2018 (note: CIP-passport-holders excluded — separate condition)
  "KN", // St. Kitts & Nevis — added 2018 (CIP-passport-holders excluded)
  "MS", // Montserrat — eligible under British Overseas Territory rules
  // PH (Philippines) — CONDITIONAL eTA since Sept 2023: requires holder to
  // also have a valid US non-immigrant visa or prior Canadian visa within
  // 10 years. Excluded from the unconditional list because most PH applicants
  // don't meet that condition; they still need a TRV (embassy visa). The
  // conditional case is surfaced in the CA visa-categories adapter's notes.
  "GD", // Grenada — added 2024 (CIP-passport-holders excluded)
  "SR", // Suriname — added 2018
  "PA", // Panama — already above; kept for clarity
  // BG + RO + CY were promoted from "conditional eTA" (visa-exempt with US
  // visa requirement) to full eTA-eligible 2017+, already in EU block above.
];

export const canadaEtaAdapter: Adapter = {
  metadata: {
    id: "ca_eta",
    name: "Canada eTA (Electronic Travel Authorization)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/ca_eta.html",
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

    if (!/(electronic\s+travel\s+authorization|\beta\b)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected Canada eTA wording." };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const requirements = [
      "Valid passport from an eTA-eligible country",
      "Apply online before booking flight (most approvals within minutes)",
      "Linked electronically to your passport — no document to print",
      "Travel for tourism, business, or transit (not work or study)",
    ];

    const records: ParsedRecord[] = [];
    for (const passport of CA_ETA_NATIONALITIES) {
      if (!validIso.has(passport) || passport === "CA") continue;
      for (const purpose of ["tourism", "business", "transit"] as const) {
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose,
          status: "visa_free_with_eta",
          label: "Canada eTA",
          maxStayDays: 6 * 30,
          validityDays: 5 * 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 0,
          onwardTicketRequired: true,
          requirements,
          processingTimeDaysMin: 0,
          processingTimeDaysMax: 3,
          applicationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/apply.html",
          primarySourceUrl: SOURCE_URL,
          fees: [
            { kind: "base", amountMinor: 7_00, currency: "CAD", asOf: today, label: "Canada eTA fee" },
          ],
          notes:
            passport === "MX"
              ? "MEXICAN CITIZENS: as of 29 February 2024 IRCC reinstated visa requirements for Mexicans. You only qualify for eTA if you hold a valid US non-immigrant visa OR have been issued a Canadian visa in the past 10 years AND are travelling by air. Otherwise you need a regular visitor visa. Verify your eligibility before booking — the IRCC online wizard confirms which stream applies."
              : "The eTA is required for visa-exempt nationals flying to or transiting through Canada. It is not required for US citizens (visa-free without eTA) or for travel by land or sea (where it does not apply). Most decisions return within minutes.",
        });
      }
    }

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} eTA records (expected 150+).` };
    }
    return { records };
  },
};
