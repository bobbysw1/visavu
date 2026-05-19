/**
 * US State Department visa reciprocity schedule.
 *
 * The MRV application fee ($185 for most non-petition-based visas) is
 * uniform globally, but the visa's **validity** and **number of entries**
 * vary substantially by applicant nationality under reciprocity. Some
 * nationalities also pay an **additional reciprocity fee** on top of MRV
 * (Brazil $160, Nigeria $110, Haiti $100 — these are the State Department
 * matching the fees the foreign government charges US citizens).
 *
 * Without this overlay, every us_b1b2 row claimed 10-year multi-entry —
 * which is correct for ~150 nationalities but wildly wrong for the ~30
 * where it isn't. An Iranian applicant routinely gets 3-month single-
 * entry; a Vietnamese applicant gets 1-year multi-entry as of 2024.
 *
 * Source-of-truth: the State Department's per-country reciprocity tables
 * at https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-
 * and-Civil-Documents-by-Country.html — one page per country, click
 * "Reciprocity Schedule" → "B1/B2" row.
 *
 * Coverage: nationalities whose reciprocity differs from the default
 * 10-year multi-entry $185-only. The us_b1b2 adapter falls back to the
 * default for any iso2 not listed here. Re-verify quarterly — State
 * adjusts reciprocity in response to bilateral negotiations (Vietnam
 * was reduced from 5y to 1y in 2024; Kazakhstan was extended to 5y in
 * 2023 after MFN agreement).
 *
 * Reciprocity fees stored in USD minor (cents). 0 = no additional fee
 * beyond MRV (the common case).
 */
export type B1B2Reciprocity = {
  /** Visa validity in days from issue date. 10y = 3650, 5y = 1825, etc. */
  validityDays: number;
  /** "single" | "two" | "multiple" — Drizzle column is text, no enum. */
  entries: string;
  /** Additional reciprocity fee in USD minor (cents). 0 = MRV-only. */
  reciprocityFeeMinor: number;
  /** Source URL on travel.state.gov for the specific country page. */
  sourceUrl: string;
  /** Free-text note explaining anything unusual — surfaced in adapter
   *  notes so users see the why, not just the number. */
  note?: string;
};

// Default applied to every nationality NOT listed below: 10-year multi-
// entry, no reciprocity fee (just the $185 MRV from us_b1b2).
export const DEFAULT_B1B2: B1B2Reciprocity = {
  validityDays: 10 * 365,
  entries: "multiple",
  reciprocityFeeMinor: 0,
  sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country.html",
};

/**
 * Overrides for nationalities whose B1/B2 reciprocity differs from
 * default. Verified against travel.state.gov country pages as of 2026-05.
 */
export const US_B1B2_RECIPROCITY: Record<string, B1B2Reciprocity> = {
  // ─── Sanctioned / hostile-relations: restrictive validity ───
  IR: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Iran.html",
    note: "3-month single-entry only. US Section 221(g) administrative-processing review almost universal. Applications typically processed at Dubai / Yerevan / Ankara consulates.",
  },
  SY: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Syria.html",
    note: "3-month single-entry only. Damascus consulate closed; apply from third country (Amman, Beirut, Istanbul).",
  },
  KP: {
    validityDays: 30,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Korea-Democratic-Peoples-Republic-of.html",
    note: "Effectively no visas issued. US-DPRK travel ban under Executive Order; B1/B2 denied except journalists/Red Cross/humanitarian with specific Treasury licence.",
  },
  AF: {
    validityDays: 30,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Afghanistan.html",
    note: "1-month single-entry. Kabul embassy closed 2021; apply from third country (typically Islamabad, Doha, Abu Dhabi).",
  },
  LY: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Libya.html",
    note: "3-month single-entry. Tripoli embassy closed; apply from Tunis or Cairo.",
  },
  YE: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Yemen.html",
    note: "12-month multi-entry. Sanaa embassy closed; apply from Riyadh, Cairo, or Djibouti.",
  },

  // ─── Higher-friction relations: 1-3 year validity ───
  RU: {
    validityDays: 3 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/RussianFederation.html",
    note: "3-year multi-entry. Russian-origin applicants face 221(g) administrative review almost universally since 2022. Moscow consulate operating with reduced staffing; Warsaw / Astana common third-country posts.",
  },
  VN: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Vietnam.html",
    note: "1-year multi-entry (reduced from 5-year in mid-2024 following bilateral re-negotiation).",
  },
  MM: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Burma.html",
    note: "12-month multi-entry. Rangoon embassy operating; processing extended post-2021 coup due to administrative review.",
  },
  VE: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Venezuela.html",
    note: "1-year multi-entry. Caracas embassy closed 2019; apply from Bogotá, Mexico City, Madrid.",
  },
  CU: {
    validityDays: 5 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Cuba.html",
    note: "5-year multi-entry. Havana consular operations resumed 2023 after 6-year suspension; Guyana / Mexico City remain common third-country alternatives.",
  },

  // ─── Central Asia: mostly 1-year except KZ (5y per 2023 MFN agreement) ───
  KZ: {
    validityDays: 5 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Kazakhstan.html",
    note: "5-year multi-entry (extended from 12 months in 2023 following MFN status).",
  },
  KG: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/KyrgyzRepublic.html",
  },
  TJ: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Tajikistan.html",
  },
  UZ: {
    validityDays: 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Uzbekistan.html",
  },
  TM: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Turkmenistan.html",
    note: "3-month single-entry. Reciprocity reflects Turkmenistan's restrictive treatment of US citizens.",
  },
  AZ: {
    validityDays: 3 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Azerbaijan.html",
  },

  // ─── South Asia: mostly 5-10 years ───
  PK: {
    validityDays: 5 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Pakistan.html",
    note: "5-year multi-entry. Pakistani applicants commonly face 221(g) administrative review for security checks; allow 8-12 weeks beyond appointment.",
  },
  BD: {
    validityDays: 5 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Bangladesh.html",
    note: "5-year multi-entry.",
  },

  // ─── Middle East / North Africa: mostly 5y multi ───
  EG: {
    validityDays: 5 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Egypt.html",
  },
  IQ: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Iraq.html",
    note: "3-month single-entry. Baghdad embassy operating with reduced staff; Amman common third-country alternative.",
  },
  SD: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Sudan.html",
    note: "3-month single-entry. Khartoum embassy operations suspended 2023 conflict; apply from Cairo, Addis Ababa, Nairobi.",
  },

  // ─── Africa: variable, often with reciprocity fees attached ───
  NG: {
    validityDays: 2 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 11000, // $110 USD reciprocity fee mirrors Nigeria's fee on US citizens
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Nigeria.html",
    note: "2-year multi-entry. $110 reciprocity fee on top of $185 MRV (mirrors Nigeria's fee structure for US applicants). Lagos / Abuja consulates routinely backlogged 4-6 months for appointments.",
  },
  ER: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Eritrea.html",
    note: "3-month single-entry. Asmara embassy operations limited; apply from Addis Ababa or Nairobi.",
  },
  SO: {
    validityDays: 90,
    entries: "single",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Somalia.html",
    note: "3-month single-entry. Mogadishu embassy closed; apply from Nairobi or Djibouti.",
  },

  // ─── Caribbean / Latin America: most 10y but Haiti charges fee ───
  HT: {
    validityDays: 5 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 10000, // $100 reciprocity fee
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Haiti.html",
    note: "5-year multi-entry + $100 reciprocity fee on top of $185 MRV. Port-au-Prince embassy operations affected by 2024 security situation; many applicants travel to Santo Domingo.",
  },

  // ─── Brazil: 10-year multi but with reciprocity charge ───
  // Note: as of 2023 Brazil revoked the historic $160 reciprocity fee that
  // it charged US citizens, and the US correspondingly removed Brazil's
  // reciprocity fee. Brazilians now pay only the standard $185 MRV.
  // Kept explicitly in the table as a 0-fee entry to document the history.
  BR: {
    validityDays: 10 * 365,
    entries: "multiple",
    reciprocityFeeMinor: 0,
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Brazil.html",
    note: "10-year multi-entry. The historic $160 reciprocity fee was removed in 2023 after Brazil dropped its corresponding fee on US citizens; only the standard $185 MRV now applies.",
  },
};

/** Convenience lookup with default fallback. */
export function b1b2ReciprocityFor(iso2: string): B1B2Reciprocity {
  return US_B1B2_RECIPROCITY[iso2.toUpperCase()] ?? DEFAULT_B1B2;
}
