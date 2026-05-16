/**
 * Schengen short-stay visa policy adapter (EU Regulation 2018/1806).
 *
 * Source: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20240520
 *
 * Annex II → visa-EXEMPT third countries (90 days in any 180).
 * Annex I  → visa-REQUIRED third countries (must apply for Schengen Type C visa).
 *
 * For each (third-country passport × 27 Schengen states × tourism), this
 * adapter emits one record. ~4,300 records per run, but it's the single
 * highest-leverage data source on the site: it covers tourism into the
 * single largest visa bloc in the world.
 *
 * The lists below are inlined from Regulation 2018/1806 (consolidated text
 * 2024-05-20), the EU's authoritative reference. Parser version is bumped
 * when the regulation is amended (rare — Bahrain joined Annex I in 2024).
 *
 * The fetch hits eur-lex purely to confirm the regulation page still serves;
 * the actual data lives in the inlined constants. parseError fires if the
 * regulation page no longer responds with the expected text marker.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20240520";

// Schengen member states (as of 2026). Croatia joined 2023-01-01;
// Romania + Bulgaria gained full land-border membership 2025-01-01.
// CYPRUS IS NOT in Schengen as of 2026 — it joined the EU in 2004 but
// still issues its own national short-stay visa, not the uniform-format
// Schengen visa. Including CY here was a long-standing data bug
// emitting incorrect Schengen records for the entire Cyprus column.
const SCHENGEN_STATES: string[] = [
  "AT", "BE", "BG", "HR", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT",
  "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH",
];

// Annex II — visa-EXEMPT third-country nationals for short stay (≤90/180).
// Many of these still require ETIAS once it launches; ETIAS is modeled as a
// separate eTA system layered onto the visa-free record.
const ANNEX_II_VISA_EXEMPT: string[] = [
  "AL", "AD", "AG", "AR", "AU", "BS", "BB", "BA", "BR", "BN",
  "CA", "CL", "CO", "CR", "DM", "SV", "GE", "GT", "HN", "HK",
  "IL", "JP", "KI", "MK", "MY", "MH", "MU", "MX", "MD", "MC",
  "ME", "NZ", "NI", "PA", "PY", "PE", "KN", "LC", "VC", "WS",
  "SM", "RS", "SC", "SG", "SB", "KR", "TW", "TL", "TO", "TT",
  "TV", "AE", "GB", "US", "UY", "VA", "VE",
];

// Annex I — visa-REQUIRED third-country nationals (Schengen Type C visa).
// Inline list is large; we encode the most-traveled origins. Anything not
// in either list is considered "consult embassy" for MVP and emits no record.
const ANNEX_I_VISA_REQUIRED: string[] = [
  "AF", "DZ", "AM", "AZ", "BH", "BD", "BY", "BZ", "BJ", "BT",
  "BO", "BW", "BF", "BI", "KH", "CM", "CV", "CF", "TD", "CN",
  "KM", "CG", "CD", "CU", "DJ", "DO", "EC", "EG", "GQ", "ER",
  "SZ", "ET", "FJ", "GA", "GM", "GH", "GN", "GW", "GY", "HT",
  "IN", "ID", "IR", "IQ", "JM", "JO", "KZ", "KE", "KW", "KG",
  "LA", "LB", "LS", "LR", "LY", "MG", "MW", "MV", "ML", "MR",
  "MN", "MA", "MZ", "MM", "NA", "NP", "NE", "NG", "KP", "OM",
  "PK", "PG", "PH", "QA", "RU", "RW", "ST", "SA", "SN", "SL",
  "SO", "ZA", "SS", "LK", "SD", "SR", "SY", "TJ", "TZ", "TH",
  "TG", "TN", "TM", "TR", "UG", "UA", "UZ", "VN", "YE", "ZM", "ZW",
];

export const schengenShortStayAdapter: Adapter = {
  metadata: {
    id: "schengen_short_stay_2018_1806",
    name: "Schengen short-stay (EU Regulation 2018/1806)",
    kind: "regional_bloc",
    parserVersion: "2024.05.20",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000, // monthly — regulation amends infrequently
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/schengen_short_stay.html",
  },

  async fetch(_ctx: FetchContext) {
    // The data is inlined from the regulation; this fetch is a liveness
    // check — confirms eur-lex still serves the consolidated text page.
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const today = new Date().toISOString().slice(0, 10);

    // Liveness-check the regulation page. The URL contains a CELEX id; if
    // that's not in the response, eur-lex changed its layout — flag for review.
    if (!/2018\/1806|02018R1806|short-stay/i.test(raw.rawText)) {
      return {
        records: [],
        parseError:
          "eur-lex did not return the expected Regulation 2018/1806 marker. Verify the source URL.",
      };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];

    // Visa-EXEMPT Annex II × every Schengen state.
    for (const passport of ANNEX_II_VISA_EXEMPT) {
      if (!validIso.has(passport)) continue;
      for (const dest of SCHENGEN_STATES) {
        if (!validIso.has(dest)) continue;
        if (passport === dest) continue;
        records.push({
          passportIso2: passport,
          destinationIso2: dest,
          purpose: "tourism",
          status: "visa_free",
          label: "Schengen short-stay (Annex II — visa-exempt)",
          maxStayDays: 90, // 90 days within any 180-day rolling window
          validityDays: null,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 3, // 3 months beyond planned departure
          onwardTicketRequired: true,
          proofOfFundsRequired: true,
          requirements: [
            "Passport valid 3+ months beyond intended departure (issued within 10 years)",
            "Proof of accommodation",
            "Proof of sufficient funds",
            "Travel medical insurance (€30,000 minimum coverage) recommended",
            "Onward / return ticket",
          ],
          processingTimeDaysMin: null,
          processingTimeDaysMax: null,
          applicationUrl: null,
          primarySourceUrl: SOURCE_URL,
          fees: [],
          blocDerivedFrom: "schengen",
          notes:
            "Annex II of Regulation 2018/1806 grants visa-exempt entry to the Schengen Area for short stays of up to 90 days within any 180-day rolling period. ETIAS authorization will be required once it launches (target Q4 2026).",
        });
      }
    }

    // Visa-REQUIRED Annex I × every Schengen state.
    for (const passport of ANNEX_I_VISA_REQUIRED) {
      if (!validIso.has(passport)) continue;
      for (const dest of SCHENGEN_STATES) {
        if (!validIso.has(dest)) continue;
        records.push({
          passportIso2: passport,
          destinationIso2: dest,
          purpose: "tourism",
          status: "embassy_visa",
          label: "Schengen Short-Stay Visa (Type C)",
          maxStayDays: 90,
          validityDays: 180,
          entriesAllowed: "single, double, or multiple (issued accordingly)",
          passportValidityMonthsRequired: 3,
          biometricsRequired: true,
          biometricsLocation: "Visa Application Centre (VFS Global / TLS / BLS) in your country",
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          onwardTicketRequired: true,
          requirements: [
            "Completed Schengen visa application form",
            "Valid passport with 3 months validity beyond planned return + 2 blank pages",
            "Two recent biometric photos",
            "Travel medical insurance (€30,000 minimum coverage)",
            "Proof of accommodation (booked hotel or invitation letter)",
            "Proof of sufficient funds (~€50–100 per day depending on member state)",
            "Onward / return ticket",
            "Detailed itinerary",
          ],
          processingTimeDaysMin: 15,
          processingTimeDaysMax: 60,
          applicationUrl: null,
          primarySourceUrl: SOURCE_URL,
          fees: [
            { kind: "base", amountMinor: 90_00, currency: "EUR", asOf: today, label: "Schengen visa fee (adult)" },
            { kind: "service", amountMinor: 30_00, currency: "EUR", asOf: today, label: "VFS / VAC service fee (typical)", optional: true },
          ],
          notes:
            "The Schengen short-stay visa (Type C) is uniform across all 27 Schengen states. Apply at the embassy or VAC of the country that is your main destination, or — if no main destination — your first point of entry. Permits 90 days of travel within any 180-day rolling period across the entire Schengen Area.",
          blocDerivedFrom: "schengen",
        });
      }
    }

    if (records.length < 1000) {
      return {
        records,
        parseError: `Only ${records.length} Schengen records generated; expected ~4,000+. Constants may be empty.`,
      };
    }

    return { records };
  },
};
