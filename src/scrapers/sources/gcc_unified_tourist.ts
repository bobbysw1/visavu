/**
 * GCC unified tourist visa adapter.
 *
 * Source: GCC General Secretariat announcements (approved 2023, phased
 * rollout 2024-2026) + per-state implementing rules. As of 2026 the
 * unified visa is in phased operational launch across Saudi Arabia,
 * UAE, Bahrain, Qatar, Kuwait, and Oman.
 *
 * Eligibility: rolling out in tranches. Tier-1 nationalities confirmed
 * across all 6 GCC states; Tier-2 nationalities still being phased in
 * per-state through 2026.
 *
 * Bloc-targeting note: same pattern as the ETIAS adapter — we emit one
 * record per (eligible-passport × GCC-state) until the data model gains
 * destination_kind = "bloc" support. The label and notes clarify that the
 * single visa is valid across all 6 GCC states.
 *
 * Toggle GCC_UNIFIED_ACTIVE=true once operational rollout is confirmed by
 * GCC Secretariat. Until then, emits records labelled "rolling out".
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.gcc-sg.org/";

const GCC_UNIFIED_ACTIVE = process.env.GCC_UNIFIED_ACTIVE === "true";

// All 6 GCC member states.
const GCC_STATES: string[] = ["AE", "BH", "KW", "OM", "QA", "SA"];

// Tier-1 nationalities approved across all GCC states (visa-free, eTA, or
// unified visa-eligible per the 2024 published list).
const TIER_1_NATIONALITIES: string[] = [
  // Western Europe + EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "MC", "NL", "NO",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH", "AD", "SM", "VA",
  // Anglosphere
  "GB", "US", "CA", "AU", "NZ",
  // East Asia
  "JP", "KR", "SG", "HK", "MO", "BN", "TW",
  // Latin America (selected)
  "BR", "AR", "CL", "MX", "UY",
  // Other tier-1
  "IL", "MY",
];

// Tier-2 nationalities partially eligible — rolling out per-state through
// 2026. Visa-on-arrival or e-visa varies by GCC state for these.
const TIER_2_NATIONALITIES: string[] = [
  "CN", "IN", "ID", "PH", "VN", "TH", "TR", "RU", "UA", "BY", "KZ", "AZ",
  "GE", "AM", "EG", "JO", "ZA", "MA",
];

export const gccUnifiedTouristAdapter: Adapter = {
  metadata: {
    id: "gcc_unified_tourist",
    name: "GCC unified tourist visa (General Secretariat — phased rollout 2024-2026)",
    kind: "regional_bloc",
    parserVersion: "2026.05.17",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/GCC|Gulf Cooperation|تعاون/i.test(raw.rawText)) {
      return {
        records: [],
        parseError: "GCC General Secretariat page did not return expected marker.",
      };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (const passport of TIER_1_NATIONALITIES) {
      if (!validIso.has(passport)) continue;
      for (const destination of GCC_STATES) {
        if (destination === passport) continue;
        records.push({
          passportIso2: passport,
          destinationIso2: destination,
          purpose: "tourism",
          status: GCC_UNIFIED_ACTIVE ? "visa_free_with_eta" : "visa_free",
          label: GCC_UNIFIED_ACTIVE
            ? "GCC unified tourist visa (valid across all 6 GCC states)"
            : "Visa-free / e-visa (GCC unified tourist visa rolling out 2024-2026)",
          maxStayDays: 30,
          validityDays: GCC_UNIFIED_ACTIVE ? 30 : null,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: false,
          requirements: [
            "Valid passport (6+ months)",
            "Onward / return ticket",
            ...(GCC_UNIFIED_ACTIVE
              ? ["GCC unified tourist visa application via any participating GCC state's portal"]
              : ["Until GCC unified rollout completes: apply via the destination GCC state's existing eVisa or visa-on-arrival route"]),
          ],
          processingTimeDaysMin: GCC_UNIFIED_ACTIVE ? 1 : null,
          processingTimeDaysMax: GCC_UNIFIED_ACTIVE ? 14 : null,
          applicationUrl: null,
          primarySourceUrl: SOURCE_URL,
          fees: GCC_UNIFIED_ACTIVE
            ? [{ kind: "base", amountMinor: 27_000, currency: "USD", asOf: today, optional: false }]
            : [],
          notes: GCC_UNIFIED_ACTIVE
            ? `GCC unified tourist visa is a single visa accepted across Bahrain, Kuwait, Oman, Qatar, Saudi Arabia, and the United Arab Emirates. Useful for multi-state itineraries within the bloc.`
            : `GCC unified tourist visa was approved by the GCC Supreme Council in 2023 with phased rollout 2024-2026. ${passport} is on the Tier-1 confirmed list; the existing per-state visa-free or eVisa route applies until the unified system is live in that state.`,
        });
      }
    }

    // Tier-2 records flagged as "rolling out" regardless of GCC_UNIFIED_ACTIVE
    // since the per-state implementation list is still being confirmed.
    for (const passport of TIER_2_NATIONALITIES) {
      if (!validIso.has(passport)) continue;
      for (const destination of GCC_STATES) {
        if (destination === passport) continue;
        records.push({
          passportIso2: passport,
          destinationIso2: destination,
          purpose: "tourism",
          status: "e_visa",
          label: "Per-state e-Visa (GCC unified tourist visa pending Tier-2 confirmation)",
          maxStayDays: 30,
          validityDays: null,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: true,
          requirements: [
            "Valid passport (6+ months)",
            "Onward / return ticket",
            "Per-state e-Visa application until GCC unified rollout includes Tier-2 nationalities",
            "Sponsor / accommodation evidence depending on state",
          ],
          processingTimeDaysMin: null,
          processingTimeDaysMax: 14,
          applicationUrl: null,
          primarySourceUrl: SOURCE_URL,
          fees: [],
          notes: `Tier-2 GCC unified visa eligibility for ${passport} is still being phased in across the 6 GCC states. Apply via the destination state's existing e-Visa portal in the interim.`,
        });
      }
    }

    if (records.length < 200) {
      return {
        records,
        parseError: `Only ${records.length} GCC unified records (expected 400+).`,
      };
    }
    return { records };
  },
};
