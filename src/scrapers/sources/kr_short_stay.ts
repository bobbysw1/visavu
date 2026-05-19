/**
 * South Korea short-stay tourism adapter (visa-exempt nationalities).
 *
 * Source: https://www.0404.go.kr/dev/main.mofa (MOFA Korea) and the K-ETA
 * portal at https://www.k-eta.go.kr.
 *
 * South Korea grants visa-free short-stay entry to ~110 nationalities. Most
 * also require the K-ETA (Korea Electronic Travel Authorisation) before
 * boarding (KRW 10,000, 3-year validity). Some nationalities (22 entries)
 * have temporary K-ETA exemption that's annually renewed; treat them as
 * visa-free for the matrix and surface the eTA detail in the label.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.k-eta.go.kr/portal/apply/index.do";

// Visa-exempt for the indicated days. K-ETA-required unless the iso is also
// in the K_ETA_EXEMPT set (temporary exemption regularly renewed by MOFA).
const VISA_EXEMPT_DAYS: Record<string, number> = {
  // 90 days (most of the list)
  AD: 90, AT: 90, AU: 90, BE: 90, BR: 90, BG: 90, CA: 90, CL: 90,
  CR: 90, HR: 90, CZ: 90, DK: 90, DM: 90, DO: 90, EC: 90, SV: 90,
  EE: 90, FI: 90, FR: 90, DE: 90, GR: 90, GT: 90, HT: 90, HK: 90,
  HU: 90, IS: 90, IE: 90, IL: 90, IT: 90, JM: 90, JP: 90, KZ: 90, LV: 90,
  LI: 90, LT: 90, LU: 90, MO: 90, MY: 90, MT: 90, MX: 90, MC: 90, MA: 90,
  NL: 90, NZ: 90, NO: 90, PA: 90, PY: 90, PE: 90, PL: 90, PT: 90,
  RO: 90, RU: 90, SM: 90, RS: 90, SG: 90, SK: 90, SI: 90, ZA: 90, ES: 90,
  SR: 90, SE: 90, CH: 90, TW: 90, TH: 90, TR: 90, UA: 90, AE: 90, GB: 90,
  US: 90, UY: 90, VA: 90, VE: 90,
  // 60 days
  LS: 60, GG: 60, JE: 60, IM: 60,
  // 30 days
  AL: 30, BS: 30, BB: 30, BZ: 30, BO: 30, BW: 30, BN: 30, CO: 30, CY: 30,
  EG: 30, FJ: 30, GA: 30, GN: 30, GY: 30, HN: 30, ID: 30, KW: 30, MG: 30,
  MZ: 30, NA: 30, NI: 30, OM: 30, PG: 30, PH: 30, QA: 30, SA: 30, SC: 30, SB: 30,
  SZ: 30, TJ: 30, TZ: 30, TO: 30, TV: 30, VU: 30, WS: 30,
  // 14 days
  BH: 14,
};

// K-ETA temporary exemption — these nationalities enter without K-ETA per the
// annually-renewed MOFA notice (current exemption tranche through 31 Dec 2025).
const K_ETA_EXEMPT: ReadonlySet<string> = new Set([
  "AT", "BE", "DK", "FR", "DE", "IT", "NL", "NO", "ES", "SE", "CH", "GB",
  "FI", "US", "CA", "AU", "NZ", "JP", "SG", "TW", "HK", "MO",
]);

export const koreaShortStayAdapter: Adapter = {
  metadata: {
    id: "kr_short_stay",
    name: "South Korea short-stay visa-exemption (MOFA / K-ETA)",
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
    if (!/K-ETA|electronic travel|visa|입국/i.test(raw.rawText)) {
      return { records: [], parseError: "K-ETA page did not match expected wording." };
    }
    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];
    for (const [passport, days] of Object.entries(VISA_EXEMPT_DAYS)) {
      if (!validIso.has(passport) || passport === "KR") continue;
      const ketaRequired = !K_ETA_EXEMPT.has(passport);
      records.push({
        passportIso2: passport,
        destinationIso2: "KR",
        purpose: "tourism",
        status: ketaRequired ? "visa_free_with_eta" : "visa_free",
        label: ketaRequired
          ? `South Korea visa-free with K-ETA (${days} days)`
          : `South Korea visa-free (${days} days, K-ETA exempt)`,
        maxStayDays: days,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        proofOfFundsRequired: false,
        requirements: [
          "Valid passport (6+ months)",
          "Onward / return ticket",
          ...(ketaRequired ? ["K-ETA authorisation issued before boarding (KRW 10,000, 3-year validity)"] : []),
          "Visit must be tourism, short business, or family visit — no employment",
        ],
        processingTimeDaysMin: null,
        processingTimeDaysMax: null,
        applicationUrl: ketaRequired ? "https://www.k-eta.go.kr/" : null,
        primarySourceUrl: SOURCE_URL,
        fees: ketaRequired
          ? [
              // K-ETA fee per K-ETA portal: ₩10,000 (KRW has no subunit, so
              // amountMinor is whole won). Multiple-entry, 3-year validity.
              { kind: "base", amountMinor: 10_000, currency: "KRW", asOf: new Date().toISOString().slice(0, 10), label: "K-ETA authorisation fee" },
            ]
          : [],
        notes: ketaRequired
          ? `Stay up to ${days} days. K-ETA mandatory pre-boarding for most visa-exempt nationalities; KRW 10,000, multiple-entry, 3-year validity. Apply at least 72 hours before travel at k-eta.go.kr.`
          : `Stay up to ${days} days. ${passport} is currently exempt from K-ETA under the MOFA tranche through 31 Dec 2025; the exemption is renewed annually.`,
      });
    }
    if (records.length < 80) {
      return { records, parseError: `Only ${records.length} KR visa-exempt records (expected 100+).` };
    }
    return { records };
  },
};
