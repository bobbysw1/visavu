/**
 * Mexico short-stay tourism adapter (visa-exempt nationalities).
 *
 * Source: https://www.gob.mx/inm and the SRE visa-policy catalogue.
 *
 * Mexico grants visa-free entry for tourism up to 180 days (the longest
 * standard short-stay window globally) to ~70 nationalities under the FMM
 * (Forma Migratoria Múltiple). The FMM is now electronic (FMM-DA) for air
 * arrivals at major airports; paper FMM remains at land borders.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.gob.mx/tramites/ficha/forma-migratoria-multiple/INM126";

// 180-day visa-free entry under FMM. Sourced from SRE Mexico visa-policy
// catalogue (2024 — last updated to add CO and PE after policy easing).
const VISA_EXEMPT_180: ReadonlySet<string> = new Set([
  // Anglosphere + EU + EEA
  "US", "CA", "GB", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI",
  "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT",
  "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH",
  // North + East Asia
  "JP", "KR", "SG", "HK", "MO",
  // Latin America
  "AR", "BR", "CL", "CO", "CR", "EC", "PA", "PE", "PY", "UY", "VE", "BO",
  "DO", "BS", "BB", "JM", "TT",
  // Pacific
  "AU", "NZ", "FJ",
  // Other
  "IL", "AE", "QA", "TR", "AD", "SM", "VA", "MC",
]);

export const mexicoShortStayAdapter: Adapter = {
  metadata: {
    id: "mx_short_stay",
    name: "Mexico short-stay visa-exemption (FMM) — SRE",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/Mexico|FMM|inmigraci|visa/i.test(raw.rawText)) {
      return { records: [], parseError: "Mexico INM page did not match expected wording." };
    }
    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];
    for (const passport of VISA_EXEMPT_180) {
      if (!validIso.has(passport) || passport === "MX") continue;
      records.push({
        passportIso2: passport,
        destinationIso2: "MX",
        purpose: "tourism",
        status: "visa_free",
        label: "Mexico visa-free under FMM (up to 180 days)",
        maxStayDays: 180,
        validityDays: null,
        entriesAllowed: "single",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        proofOfFundsRequired: false,
        requirements: [
          "Valid passport (6+ months)",
          "Onward / return ticket",
          "FMM (Forma Migratoria Múltiple) — issued at port; electronic FMM-DA at major airports",
          "Sufficient funds for the stay",
          "Visit must be tourism, business, or family visit — no employment",
        ],
        processingTimeDaysMin: null,
        processingTimeDaysMax: null,
        applicationUrl: null,
        primarySourceUrl: SOURCE_URL,
        fees: [],
        notes:
          "Stay up to 180 days under FMM (most generous short-stay window globally). Each FMM is single-entry — re-enter Mexico resets the 180-day clock. INM may grant fewer days at the port (recent trend at major tourist airports). Cannot work or earn income in Mexico on this exemption.",
      });
    }
    if (records.length < 50) {
      return { records, parseError: `Only ${records.length} MX visa-exempt records (expected 70+).` };
    }
    return { records };
  },
};
