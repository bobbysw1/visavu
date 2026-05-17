/**
 * UAE short-stay tourism adapter (visa-exempt + visa-on-arrival nationalities).
 *
 * Source: https://u.ae/en/information-and-services/visa-and-emirates-id/
 *   tourist-visa
 *
 * UAE grants visa-free entry to ~80 nationalities (most for 30 days; some
 * for 90). A further ~80 nationalities qualify for visa-on-arrival at Dubai
 * International, Abu Dhabi International, Sharjah, and the smaller airports.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://u.ae/en/information-and-services/visa-and-emirates-id";

// Visa-free 30/90 day stays; sourced from ICA / GDRFA published list (2024).
const VISA_EXEMPT_90: ReadonlySet<string> = new Set([
  // GCC (full residence reciprocity — separate path)
  "BH", "KW", "OM", "QA", "SA",
  // Tier-1 (90-day visa-free)
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "MC", "NL", "NO",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH", "AD", "SM", "VA",
  "GB", "US", "CA", "AU", "NZ", "JP", "KR", "SG", "BR", "AR", "CL", "UY",
  "MX", "MY", "HK", "MO",
  "IL",
]);

const VISA_EXEMPT_30: ReadonlySet<string> = new Set([
  // 30-day visa-free
  "CN", "RU", "BY", "KZ", "UA", "MD", "RS", "ME", "MK", "AL", "BA", "GE",
  "AM", "AZ", "TR", "TH", "ID", "PH", "VN",
  "SC", "MU", "BT", "MN",
]);

// Visa-on-arrival (paid at the port) for these nationalities.
const VISA_ON_ARRIVAL_30: ReadonlySet<string> = new Set([
  "IN", "ZA", "MY", "BB", "BS", "DM", "GD", "JM", "KN", "LC", "VC", "TT",
  "CO", "EC", "PE", "VE", "BO",
]);

export const uaeShortStayAdapter: Adapter = {
  metadata: {
    id: "ae_short_stay",
    name: "UAE short-stay visa-exemption + visa-on-arrival (ICA / GDRFA)",
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
    if (!/UAE|visa|Emirates|tourist/i.test(raw.rawText)) {
      return { records: [], parseError: "UAE page did not match expected wording." };
    }
    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];
    const seen = new Set<string>();

    for (const passport of VISA_EXEMPT_90) {
      if (!validIso.has(passport) || passport === "AE" || seen.has(passport)) continue;
      seen.add(passport);
      records.push(makeRecord(passport, "visa_free", 90));
    }
    for (const passport of VISA_EXEMPT_30) {
      if (!validIso.has(passport) || passport === "AE" || seen.has(passport)) continue;
      seen.add(passport);
      records.push(makeRecord(passport, "visa_free", 30));
    }
    for (const passport of VISA_ON_ARRIVAL_30) {
      if (!validIso.has(passport) || passport === "AE" || seen.has(passport)) continue;
      seen.add(passport);
      records.push(makeRecord(passport, "visa_on_arrival", 30));
    }

    if (records.length < 60) {
      return { records, parseError: `Only ${records.length} UAE records (expected 80+).` };
    }
    return { records };
  },
};

function makeRecord(
  passport: string,
  status: "visa_free" | "visa_on_arrival",
  days: number,
): ParsedRecord {
  const isFree = status === "visa_free";
  return {
    passportIso2: passport,
    destinationIso2: "AE",
    purpose: "tourism",
    status,
    label: isFree
      ? `UAE visa-free (${days} days)`
      : `UAE visa on arrival (${days} days, paid at port)`,
    maxStayDays: days,
    validityDays: null,
    entriesAllowed: "multiple",
    passportValidityMonthsRequired: 6,
    onwardTicketRequired: true,
    proofOfFundsRequired: false,
    requirements: [
      "Valid passport (6+ months)",
      "Onward / return ticket",
      "Confirmed accommodation or sponsor letter (where requested at port)",
      ...(isFree ? [] : ["Visa-on-arrival fee paid at the port (AED ~280-340 depending on nationality)"]),
    ],
    processingTimeDaysMin: null,
    processingTimeDaysMax: null,
    applicationUrl: null,
    primarySourceUrl: SOURCE_URL,
    fees: isFree
      ? []
      : [{ kind: "base", amountMinor: 30_000, currency: "AED", asOf: new Date().toISOString().slice(0, 10), optional: false }],
    notes: isFree
      ? `Stay up to ${days} days. Cannot work or earn income in the UAE on this exemption. Some ports require confirmed accommodation evidence at entry.`
      : `Stay up to ${days} days. Visa-on-arrival fee (~AED 280-340) paid at the port; some smaller airports do not offer this — confirm with airline before boarding.`,
  };
}
