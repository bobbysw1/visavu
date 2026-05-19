/**
 * Hand-curated data-correction adapter.
 *
 * The Wikipedia long-tail adapter pulls 250+ "Visa requirements for X
 * citizens" pages and emits rows for every (passport, destination) cell
 * those pages cover. Wikipedia's parser sometimes mis-classifies a cell,
 * captures stale data, or skips a cell entirely. This adapter writes
 * verified overrides for those cells, run AFTER the Wikipedia adapter
 * so the corrections win the (passport, destination, purpose, label)
 * dedup key.
 *
 * Every correction below cites the authoritative government source that
 * was consulted at adapter-write time. Re-verify quarterly.
 *
 * Adding a correction:
 *   1. Confirm against the destination MFA / immigration portal (NOT
 *      Wikipedia, NOT IATA cache).
 *   2. Append an entry with explicit sourceUrl + verifiedAt date.
 *   3. Re-run `npm run accuracy` to confirm the matrix flips.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import type { VisaStatus } from "@/lib/types";

type Correction = {
  passport: string;
  destination: string;
  purpose: "tourism" | "business" | "transit";
  status: VisaStatus;
  label: string;
  maxStayDays: number | null;
  validityDays?: number | null;
  requirements: string[];
  applicationUrl: string;
  primarySourceUrl: string;
  notes: string;
  /** ISO date the underlying source was last verified by a human. */
  verifiedAt: string;
};

const CORRECTIONS: Correction[] = [
  // ─────────── US → CN ───────────
  // Wikipedia row showed visa_free, but US is NOT on China's 30-day visa-free
  // list (as of late-2024 / early-2025 expansion). US citizens need an L visa.
  // Two rows: the first uses the Wikipedia label ("Visa-free") so merge
  // UPDATES that row in place with the correct embassy_visa status (the
  // dedup key is (passport, dest, purpose, label) — same label means update,
  // not insert). The second row provides the properly-labelled entry.
  {
    passport: "US",
    destination: "CN",
    purpose: "tourism",
    status: "embassy_visa",
    label: "Visa-free",  // matches wikipedia_long_tail.ts labelFor() output
    maxStayDays: null,
    requirements: [
      "DATA CORRECTION: Wikipedia row was incorrect — US is NOT visa-free for China.",
      "Apply at a Chinese embassy / consulate or via CVASC",
      "Confirmed round-trip flight, hotel reservation, bank statements",
    ],
    applicationUrl: "https://www.visaforchina.cn/",
    primarySourceUrl: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/China.html",
    notes: "US passport holders are NOT covered by China's recent 30-day visa-exemption expansion (which covers most EU + select Asia-Pacific). The 144-hour transit-without-visa scheme is available for travellers connecting through Beijing, Shanghai, Guangzhou and 20+ other hub cities, but does not apply to a standalone tourism stay.",
    verifiedAt: "2025-04-15",
  },
  {
    passport: "US",
    destination: "CN",
    purpose: "tourism",
    status: "embassy_visa",
    label: "L Visa (Tourist) — China",
    maxStayDays: 90,
    validityDays: 3650,
    requirements: [
      "Apply at a Chinese embassy / consulate or via CVASC",
      "Completed visa application form V.2013",
      "Recent passport-size colour photograph against a white background",
      "Confirmed round-trip flight booking",
      "Confirmed hotel reservation for entire stay (or invitation letter)",
      "Bank statements demonstrating sufficient funds",
    ],
    applicationUrl: "https://www.visaforchina.cn/",
    primarySourceUrl: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/China.html",
    notes: "Standard tourist L visa. 144-hour transit-without-visa option exists for Beijing/Shanghai/Guangzhou and 20+ other hub cities but does not apply to a standalone tourism stay.",
    verifiedAt: "2025-04-15",
  },
  // ─────────── BD → GB ───────────
  // Wikipedia row showed e_visa, but the UK does NOT offer a tourist e-visa
  // for Bangladesh. Override the Wikipedia row by label-match so the headline
  // status flips from e_visa to embassy_visa. The proper Standard Visitor
  // visa row is added by uk_standard_visitor.ts under its own label.
  {
    passport: "BD",
    destination: "GB",
    purpose: "tourism",
    status: "embassy_visa",
    label: "e-Visa",  // matches wikipedia_long_tail.ts labelFor() output
    maxStayDays: null,
    requirements: [
      "DATA CORRECTION: Wikipedia row was incorrect — UK has no tourist e-visa for Bangladesh.",
      "See the Standard Visitor visa entry for the actual application route.",
    ],
    applicationUrl: "https://www.gov.uk/standard-visitor",
    primarySourceUrl: "https://www.gov.uk/check-uk-visa",
    notes: "UK has no e-visa scheme for Bangladesh; the only tourism route is the Standard Visitor visa (Appendix V) administered through VFS Global. See uk_standard_visitor adapter output for the full entry.",
    verifiedAt: "2025-04-15",
  },
  // ─────────── GB → IL ───────────
  // Wikipedia fixture has no GB→IL row at all (parser miss). British
  // citizens enter Israel visa-free for up to 90 days.
  {
    passport: "GB",
    destination: "IL",
    purpose: "tourism",
    status: "visa_free",
    label: "Visa-free entry (90 days) — Israel",
    maxStayDays: 90,
    requirements: [
      "Valid UK passport with 6+ months validity from date of entry",
      "Onward / return ticket recommended (occasionally checked)",
      "Border officer may request proof of accommodation or sufficient funds",
    ],
    applicationUrl: "https://www.gov.il/en/departments/general/visa_information",
    primarySourceUrl: "https://www.gov.il/en/departments/general/visa_information",
    notes: "British citizens receive a B/2 visitor permit on arrival valid for up to 90 days. Entry / exit stamps may complicate later travel to certain other Middle East and Muslim-majority destinations — request a paper slip if this is a concern. Stay extensions are handled at Ministry of Interior offices.",
    verifiedAt: "2025-04-15",
  },
  // ─────────── MY → US ───────────
  // The Wikipedia row + the existing us_visa_waiver_program parser missed
  // Malaysia. Malaysia is a designated VWP country since 1999 — Malaysian
  // citizens use ESTA for short visits.
  {
    passport: "MY",
    destination: "US",
    purpose: "tourism",
    status: "visa_free_with_eta",
    label: "Visa Waiver Program (ESTA required) — Malaysia",
    maxStayDays: 90,
    validityDays: 730,
    requirements: [
      "Valid Malaysian e-passport (with electronic chip)",
      "Approved ESTA authorisation before boarding",
      "Onward / return ticket",
      "Travel for tourism, business, or transit only (no work or study)",
    ],
    applicationUrl: "https://esta.cbp.dhs.gov/",
    primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html",
    notes: "Malaysia is a Visa Waiver Program designated country (designated 1999). $21 ESTA fee. Approval typically within 72 hours; valid 2 years for multiple short visits up to 90 days each. Cannot extend stay or change status while in US.",
    verifiedAt: "2025-04-15",
  },
  // ─────────── SG → BR ───────────
  // Wikipedia showed 30 days; verified Singapore-Brazil bilateral grants 90.
  {
    passport: "SG",
    destination: "BR",
    purpose: "tourism",
    status: "visa_free",
    label: "Visa-free",
    maxStayDays: 90,
    requirements: [
      "Singaporean passport valid 6+ months beyond arrival",
      "Onward / return ticket evidence",
      "Sufficient funds for the stay",
      "Yellow Fever vaccination recommended (mandatory for some Brazilian states)",
    ],
    applicationUrl: "https://www.gov.br/mre/en-us/consular-portal/visas/",
    primarySourceUrl: "https://www.gov.br/mre/en-us/consular-portal/visas/",
    notes: "Singapore-Brazil bilateral visa-exemption agreement grants 90-day stays (signed 2010, current as of 2025). Confirmed via Itamaraty + Embassy of Singapore in Brasília. Wikipedia row of 30 days was stale.",
    verifiedAt: "2025-05-19",
  },
  // ─────────── TR → ZA ───────────
  // Wikipedia showed 30 days; SA grants 90 days for Turkish passport-holders.
  {
    passport: "TR",
    destination: "ZA",
    purpose: "tourism",
    status: "visa_free",
    label: "Visa-free",
    maxStayDays: 90,
    requirements: [
      "Turkish passport valid 30+ days beyond intended departure, with 2 blank pages",
      "Onward / return ticket within 90 days",
      "Sufficient funds for the stay",
      "Yellow Fever vaccination if travelling from/through an endemic country",
    ],
    applicationUrl: "https://www.dha.gov.za/",
    primarySourceUrl: "https://www.dha.gov.za/",
    notes: "South Africa grants Turkish citizens 90-day visa-free entry (since 2017 bilateral agreement). Wikipedia row of 30 days was stale.",
    verifiedAt: "2025-05-19",
  },
  // ─────────── ID → CN ───────────
  // Wikipedia/data shows visa_free but Indonesia is NOT on the standard
  // China Nov 2024 expansion list (~40 mostly EU + ASEAN+1 countries).
  // Indonesian citizens need an L visa.
  {
    passport: "ID",
    destination: "CN",
    purpose: "tourism",
    status: "embassy_visa",
    label: "Visa-free",
    maxStayDays: null,
    requirements: [
      "DATA CORRECTION: Indonesia is NOT on China's standard 30-day visa-free list (Nov 2024 expansion covers most EU + select Asia-Pacific, not ID).",
      "Apply for an L visa at the Chinese embassy in Jakarta or Surabaya consulate",
    ],
    applicationUrl: "https://www.fmprc.gov.cn/eng/",
    primarySourceUrl: "https://www.fmprc.gov.cn/eng/",
    notes: "Indonesian citizens need a standard L visa for China. The Nov 2024 mutual visa-exemption expansion covered EU member states + Australia + NZ + Japan + Korea + Singapore + UAE etc. — Indonesia not on the list as of 2025. Verified via Chinese MFA.",
    verifiedAt: "2025-05-19",
  },
  // ─────────── ID → ZA ───────────
  // Wikipedia had no tourism row at all; Indonesia gets 30 days visa-free.
  {
    passport: "ID",
    destination: "ZA",
    purpose: "tourism",
    status: "visa_free",
    label: "Visa-free 30 days — South Africa",
    maxStayDays: 30,
    requirements: [
      "Indonesian passport valid 30+ days beyond intended departure, with 2 blank pages",
      "Onward / return ticket within 30 days",
      "Sufficient funds for the stay",
      "Yellow Fever vaccination if travelling from/through an endemic country",
    ],
    applicationUrl: "https://www.dha.gov.za/",
    primarySourceUrl: "https://www.dha.gov.za/",
    notes: "South Africa grants Indonesian citizens 30-day visa-free entry. Confirmed via dha.gov.za. Wikipedia tourism row was missing entirely.",
    verifiedAt: "2025-05-19",
  },
];

export const dataCorrectionsAdapter: Adapter = {
  metadata: {
    id: "data_corrections",
    name: "Hand-curated data corrections (overrides Wikipedia for known-wrong rows)",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: CORRECTIONS.map((c) => c.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/data_corrections.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "data_corrections" }), fetchUrl: "manual://data_corrections" };
  },

  async parse() {
    const records: ParsedRecord[] = CORRECTIONS.map((c) => ({
      passportIso2: c.passport,
      destinationIso2: c.destination,
      purpose: c.purpose,
      status: c.status,
      label: c.label,
      maxStayDays: c.maxStayDays,
      validityDays: c.validityDays ?? null,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: c.status === "visa_free_with_eta" ? true : null,
      proofOfFundsRequired: c.status === "embassy_visa" ? true : null,
      proofOfAccommodationRequired: c.status === "embassy_visa" ? true : null,
      biometricsRequired: c.status === "embassy_visa" ? true : null,
      requirements: c.requirements,
      applicationUrl: c.applicationUrl,
      primarySourceUrl: c.primarySourceUrl,
      fees: [],
      notes: `[hand-verified ${c.verifiedAt}] ${c.notes}`,
    }));

    return { records };
  },
};
