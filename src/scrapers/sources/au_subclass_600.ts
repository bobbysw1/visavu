/**
 * Australia Visitor visa — Subclass 600 (Tourist + Business + Sponsored Family streams).
 *
 * The user-flagged gap: we only had ETA (subclass 601, AUD $20) + eVisitor
 * (subclass 651, free) but not the Visitor visa subclass 600 which is the
 * embassy-issued tourist/business visa starting at AUD $200. Used by:
 *   - Visa-required nationalities (most of Africa, South Asia, some LatAm)
 *   - ETA/eVisitor-eligible applicants who want LONGER stays (>3 months) or
 *     multiple long visits
 *   - Sponsored Family stream (relatives sponsored by Australian residents)
 *   - Business stream (business activities beyond what ETA/eVisitor permit)
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600
 * Fee (July 2024 update): Tourist stream base AUD $200; Business AUD $200;
 * Sponsored Family AUD $1,475; Approved Destination Status AUD $200.
 *
 * This adapter emits the Tourist + Business streams for ALL nationalities
 * since any nationality can apply — distinct from ETA / eVisitor which are
 * nationality-restricted. The headline for ETA-eligible nationalities still
 * surfaces ETA (cheaper + faster); this adapter ensures the 600 option is
 * always visible as the longer-stay alternative.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const APPLY_URL = "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600";

const ALL = COUNTRY_LIST.map((c) => c.iso2);
const EXCLUDED = new Set(["AU"]);

export const auSubclass600Adapter: Adapter = {
  metadata: {
    id: "au_subclass_600",
    name: "Australia Visitor Visa (subclass 600) — Tourist + Business + Sponsored Family",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [APPLY_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/au_subclass_600.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "au_subclass_600" }), fetchUrl: "manual://au_subclass_600" };
  },

  async parse() {
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      if (EXCLUDED.has(passport)) continue;

      // Tourist stream — for tourism, family visits, cruise, short courses < 3 months
      records.push({
        passportIso2: passport,
        destinationIso2: "AU",
        purpose: "tourism",
        status: "embassy_visa",
        label: "Visitor Visa (subclass 600) Tourist stream — Australia",
        maxStayDays: 365,
        validityDays: 365 * 3,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "VFS Global / Australian visa application centre",
        requirements: [
          "For visa-required nationalities (most of Africa, South Asia, parts of LatAm) — required visa",
          "For ETA/eVisitor-eligible nationalities — alternative for stays LONGER than 3 months OR multiple long visits",
          "Sufficient funds for the stay + return ticket evidence",
          "Genuine temporary entrant intent",
          "Health insurance recommended (cost of medical care is the visitor's responsibility)",
          "Single, 3-month, 6-month, 12-month options — extendable in-country in limited circumstances",
          "Multi-entry available; entries within 3-year validity window",
        ],
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 56,
        applicationUrl: APPLY_URL,
        primarySourceUrl: APPLY_URL,
        fees: [
          { kind: "base", amountMinor: 20000_0, currency: "AUD", asOf: today, label: "Visitor 600 Tourist stream base fee (AUD $200, July 2024 schedule)" },
        ],
        notes: "Australia's standard embassy-issued visitor visa. For ETA / eVisitor-eligible nationalities (US, Canada, UK, EU, Japan etc.), use ETA (subclass 601, AUD $20) or eVisitor (subclass 651, free) for stays up to 3 months — cheaper and faster. The Visitor 600 is the right route for: visa-required nationalities, stays longer than 3 months, complex itineraries, or where ETA/eVisitor was refused.",
      });

      // Business Visitor stream — for business meetings, conferences, exploratory work
      records.push({
        passportIso2: passport,
        destinationIso2: "AU",
        purpose: "business",
        status: "embassy_visa",
        label: "Visitor Visa (subclass 600) Business Visitor stream — Australia",
        maxStayDays: 90,
        validityDays: 365 * 3,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        proofOfFundsRequired: true,
        biometricsRequired: true,
        biometricsLocation: "VFS Global / Australian visa application centre",
        requirements: [
          "For visa-required nationalities — required visa for business activities",
          "For ETA/eVisitor-eligible nationalities — alternative for longer business visits or complex itineraries",
          "Letter of invitation from Australian business partner",
          "Permitted: meetings, conferences, contract negotiations, intra-company training, exploratory market research",
          "PROHIBITED: paid work for Australian employer (requires Subclass 482 TSS or other work visa)",
          "Multi-entry available; entries within 3-year validity window",
        ],
        processingTimeDaysMin: 5,
        processingTimeDaysMax: 42,
        applicationUrl: APPLY_URL,
        primarySourceUrl: APPLY_URL,
        fees: [
          { kind: "base", amountMinor: 20000_0, currency: "AUD", asOf: today, label: "Visitor 600 Business stream base fee (AUD $200, July 2024 schedule)" },
        ],
        notes: "Business Visitor stream of subclass 600. Use cases beyond ETA/eVisitor business activities: longer stays, complex bilateral business projects, conference series, training secondments. For productive paid work, the right visa is Subclass 482 (TSS) or 400 (Specialist Activity) — not the 600.",
      });
    }

    return { records };
  },
};
