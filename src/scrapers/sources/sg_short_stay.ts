/**
 * Singapore short-stay tourism adapter (visa-exempt nationalities).
 *
 * Source: https://www.ica.gov.sg/enter-transit-depart/entering-singapore
 *
 * Singapore grants visa-free short-stay entry to ~160 nationalities, the
 * broadest of any major destination. Stay length: 30 or 90 days depending
 * on the nationality + the bilateral arrangement. ICA's SG Arrival Card is
 * mandatory for all visitors (free, online, completed within 3 days of
 * arrival) but is not a visa.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.ica.gov.sg/enter-transit-depart/entering-singapore";

// 90 days for the "Assessment Level I" countries; 30 days for everyone else
// in the visa-exempt list. List sourced from ICA's published Assessment
// Level table (2024).
const VISA_EXEMPT_90_DAYS: ReadonlySet<string> = new Set([
  // Western Europe + most of EU
  "AT", "BE", "DK", "FI", "FR", "DE", "GR", "IE", "IT", "LU", "MT", "NL",
  "NO", "PT", "ES", "SE", "CH", "GB", "IS", "LI", "MC", "SM", "VA",
  // Anglosphere
  "US", "CA", "AU", "NZ",
  // East Asia
  "JP", "KR", "HK", "MO", "TW",
  // Middle East
  "AE", "QA", "BH", "OM", "KW", "SA", "IL",
  // Latin America (selected high-end)
  "AR", "BR", "CL", "MX", "UY", "PE", "CR", "PA",
]);

const VISA_EXEMPT_30_DAYS: ReadonlySet<string> = new Set([
  // ASEAN — bilateral free entry
  "BN", "ID", "MY", "PH", "TH", "VN", "LA", "KH", "MM",
  // Eastern Europe / non-EU
  "AL", "AD", "AM", "BA", "BG", "HR", "CY", "CZ", "EE", "GE", "HU", "LV",
  "LT", "MD", "MK", "ME", "PL", "RO", "RS", "SK", "SI", "UA",
  // Latin America (broader list)
  "BB", "BS", "BZ", "BO", "CO", "DO", "EC", "GT", "GY", "HN", "JM", "NI",
  "PY", "SR", "SV", "TT", "VE",
  // Pacific
  "FJ", "PG", "WS", "TO", "TV", "VU", "SB", "KI", "FM", "MH", "PW", "NR",
  // Africa (selected)
  "BW", "MU", "NA", "SC", "ZA", "TN", "EG", "MA", "JO", "TR", "RU",
  // Misc
  "CH", "AD", "MN", "KZ", "UZ", "KG", "TJ", "TM", "BD", "LK", "MV", "BT",
  "NP",
]);

export const singaporeShortStayAdapter: Adapter = {
  metadata: {
    id: "sg_short_stay",
    name: "Singapore short-stay visa-exemption (ICA)",
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
    if (!/Singapore|visa|Assessment Level|ICA/i.test(raw.rawText)) {
      return { records: [], parseError: "ICA page did not match expected wording." };
    }
    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];
    const seen = new Set<string>();

    for (const passport of VISA_EXEMPT_90_DAYS) {
      if (!validIso.has(passport) || passport === "SG" || seen.has(passport)) continue;
      seen.add(passport);
      records.push(makeRecord(passport, 90));
    }
    for (const passport of VISA_EXEMPT_30_DAYS) {
      if (!validIso.has(passport) || passport === "SG" || seen.has(passport)) continue;
      seen.add(passport);
      records.push(makeRecord(passport, 30));
    }

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} SG visa-exempt records (expected 140+).` };
    }
    return { records };
  },
};

function makeRecord(passport: string, days: number): ParsedRecord {
  return {
    passportIso2: passport,
    destinationIso2: "SG",
    purpose: "tourism",
    status: "visa_free",
    label: `Singapore visa-free (${days} days)`,
    maxStayDays: days,
    validityDays: null,
    entriesAllowed: "multiple",
    passportValidityMonthsRequired: 6,
    onwardTicketRequired: true,
    proofOfFundsRequired: false,
    requirements: [
      "Valid passport (6+ months)",
      "Onward / return ticket",
      "Singapore Arrival Card submitted within 3 days of arrival (free, online at eservices.ica.gov.sg)",
      "Sufficient funds for the stay",
    ],
    processingTimeDaysMin: null,
    processingTimeDaysMax: null,
    applicationUrl: null,
    primarySourceUrl: SOURCE_URL,
    fees: [],
    notes: `Stay up to ${days} days for tourism, short-term business, or family visits. SG Arrival Card (free) is mandatory but is not a visa. Cannot work or earn income in Singapore on this exemption.`,
  };
}
