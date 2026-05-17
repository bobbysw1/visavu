/**
 * EU ETIAS adapter — Schengen-area Electronic Travel Information and
 * Authorisation System for visa-exempt nationals.
 *
 * Source: https://travel-europe.europa.eu/etias_en
 *
 * Status: launches operationally late 2026 (the rolling timeline has
 * slipped multiple times; current target Q4 2026). The fee is €7 for
 * applicants aged 18-70; free for under-18 and over-70. 3-year validity
 * or until passport expiry, multiple-entry. Doesn't override the 90/180
 * Schengen rule — surfaces as a pre-condition (eTA) layered on top.
 *
 * Bloc-targeting note: ETIAS targets the entire Schengen bloc, not a
 * single destination country. Until the data model gains a
 * destination_kind = "bloc" column (P31 schema work), this adapter emits
 * one record per (visa-exempt-passport × Schengen-member-state) — the
 * status `visa_free_with_eta` already captures the relevant pre-boarding
 * authorisation requirement.
 *
 * The flag ETIAS_ACTIVE controls whether records carry the
 * `visa_free_with_eta` status. Before operational launch, ETIAS is
 * surfaced as an INFO obstacle on Schengen route pages rather than
 * folded into the visa-status. Flip via env: ETIAS_ACTIVE=true.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://travel-europe.europa.eu/etias_en";

const ETIAS_ACTIVE = process.env.ETIAS_ACTIVE === "true";

// 27 Schengen member states (same set as schengen_short_stay).
const SCHENGEN_STATES: string[] = [
  "AT", "BE", "BG", "HR", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT",
  "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH",
];

// Annex II — the 60+ visa-exempt third-country nationalities that will
// need ETIAS authorisation pre-boarding. Identical to schengen_short_stay's
// ANNEX_II_VISA_EXEMPT.
const VISA_EXEMPT_NATIONALITIES: string[] = [
  "AL", "AD", "AG", "AR", "AU", "BS", "BB", "BA", "BR", "BN",
  "CA", "CL", "CO", "CR", "DM", "SV", "GE", "GT", "HN", "HK",
  "IL", "JP", "KI", "MK", "MY", "MH", "MU", "MX", "MD", "MC",
  "ME", "NZ", "NI", "PA", "PY", "PE", "KN", "LC", "VC", "WS",
  "SM", "RS", "SC", "SG", "SB", "KR", "TW", "TL", "TO", "TT",
  "TV", "AE", "GB", "US", "UY", "VA", "VE",
];

export const euEtiasAdapter: Adapter = {
  metadata: {
    id: "eu_etias",
    name: "EU ETIAS — Schengen pre-travel authorisation (Regulation (EU) 2018/1240)",
    kind: "regional_bloc",
    parserVersion: "2026.05.17",
    // ETIAS regulations amend rarely; quarterly liveness check is enough.
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/ETIAS|travel authorisation|Schengen/i.test(raw.rawText)) {
      return {
        records: [],
        parseError: "travel-europe.europa.eu did not return expected ETIAS marker.",
      };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (const passport of VISA_EXEMPT_NATIONALITIES) {
      if (!validIso.has(passport)) continue;
      for (const destination of SCHENGEN_STATES) {
        if (destination === passport) continue;
        records.push({
          passportIso2: passport,
          destinationIso2: destination,
          purpose: "tourism",
          status: ETIAS_ACTIVE ? "visa_free_with_eta" : "visa_free",
          label: ETIAS_ACTIVE
            ? `Schengen short-stay with ETIAS authorisation (90/180 days)`
            : `Schengen short-stay (90/180 days; ETIAS authorisation required from Q4 2026)`,
          maxStayDays: 90,
          validityDays: ETIAS_ACTIVE ? 3 * 365 : null,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: false,
          requirements: [
            "Valid passport (6+ months beyond planned departure)",
            "Onward / return ticket",
            ...(ETIAS_ACTIVE
              ? ["ETIAS authorisation issued before boarding (€7 fee, ages 18-70; free <18 and >70)"]
              : ["From Q4 2026: ETIAS authorisation will be required before boarding"]),
            "Adequate funds for the stay",
            "Travel must comply with 90/180-day Schengen rule",
          ],
          processingTimeDaysMin: ETIAS_ACTIVE ? 1 : null,
          processingTimeDaysMax: ETIAS_ACTIVE ? 30 : null,
          applicationUrl: ETIAS_ACTIVE ? "https://travel-europe.europa.eu/etias_en" : null,
          primarySourceUrl: SOURCE_URL,
          fees: ETIAS_ACTIVE
            ? [{ kind: "base", amountMinor: 700, currency: "EUR", asOf: today, optional: false }]
            : [],
          notes: ETIAS_ACTIVE
            ? `ETIAS is a Schengen-wide pre-travel authorisation, not a visa. €7 fee, 3-year validity or until passport expiry, multiple-entry. Doesn't override the 90/180-day Schengen short-stay rule — that's enforced separately via the EES biometric entry/exit system.`
            : `From Q4 2026, ETIAS authorisation will be required before boarding for travel to any Schengen state. €7 fee, 3-year validity, multiple-entry. Watch travel-europe.europa.eu for the operational launch date.`,
        });
      }
    }

    if (records.length < 1000) {
      return {
        records,
        parseError: `Only ${records.length} ETIAS records (expected ~1,600 = ${VISA_EXEMPT_NATIONALITIES.length} × ${SCHENGEN_STATES.length}).`,
      };
    }
    return { records };
  },
};
