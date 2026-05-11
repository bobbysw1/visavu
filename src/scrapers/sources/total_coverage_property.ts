/**
 * Property-investment + residency-by-investment routes.
 *
 * Programs covered (9):
 *   CY Cyprus Permanent Residence Programme (€300k real estate)
 *   TR Turkish Citizenship by Investment ($400k real estate)
 *   MT Malta Permanent Residence Programme (MPRP)
 *   MU Mauritius Premium Visa + Real Estate Scheme (PDS / IRS / RES)
 *   ID Indonesia Second Home Visa (5-year)
 *   MX Mexico Temporary / Permanent Residency by Economic Solvency
 *   PH Philippines Special Resident Retiree's Visa (SRRV)
 *   AE UAE Golden Visa — Real Estate (AED 2M+ property)
 *   ES Spain Golden Visa — closing 2025 (€500k real estate, sunset notice)
 *
 * Each is hand-verified against the destination's own programme page.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

export const totalCoveragePropertyAdapter: Adapter = {
  metadata: {
    id: "total_coverage_property",
    name: "Total coverage — property / investment residency (CY PR / TR CBI / MT MPRP / MU Premium / ID 2nd Home / MX Residency / PH SRRV / AE Golden / ES Golden sunset)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://www.moi.gov.cy/moi/crmd/crmd.nsf/page27_en/page27_en?openform",
      "https://www.csb.gov.tr/en/turkish-citizenship",
      "https://residencymalta.gov.mt/mprp/",
      "https://edbmauritius.org/premium-visa",
      "https://www.imigrasi.go.id/",
      "https://www.gob.mx/inm",
      "https://pra.gov.ph/",
      "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas",
      "https://extranjeros.inclusion.gob.es/es/InformacionInteres/InformacionProcedimientos/Visadosresidenciainversionistas/",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_property.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_property" }), fetchUrl: "manual://total_coverage_property" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    const EU_EEA_CH = new Set([
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
      "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
      "SI", "ES", "SE", "IS", "LI", "NO", "CH",
    ]);

    for (const passport of ALL) {
      // ---------- CY — Cyprus Permanent Residence Programme (Fast-Track) ----------
      if (!EU_EEA_CH.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "CY",
          purpose: "work",
          status: "embassy_visa",
          label: "Cyprus Permanent Residence Programme (Fast-Track Regulation 6.2)",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: true,
          biometricsLocation: "Cyprus Civil Registry & Migration Department",
          requirements: [
            "Purchase new-build residential property of at least €300,000 (excl. VAT) — must be from a developer, not resale",
            "Annual income of at least €50,000 from sources OUTSIDE Cyprus (+€15,000 per dependent spouse, +€10,000 per child)",
            "Clean criminal record",
            "Apostilled documents — birth, marriage, tax records",
            "Cannot work as employed in Cyprus, but CAN be a director / shareholder of a Cyprus company drawing dividends",
            "Visit Cyprus at least once every 2 years to maintain PR status",
            "Citizenship pathway: 7 years legal residence (with significant physical-presence requirement)",
          ],
          processingTimeDaysMin: 60,
          processingTimeDaysMax: 120,
          applicationUrl: "https://www.moi.gov.cy/moi/crmd/crmd.nsf/page27_en/page27_en?openform",
          primarySourceUrl: "https://www.moi.gov.cy/moi/crmd/crmd.nsf/page27_en/page27_en?openform",
          fees: [
            { kind: "base", amountMinor: 50000, currency: "EUR", asOf: "2026-05-11", label: "PR application fee per applicant", optional: false },
          ],
          notes: "Cyprus's main residency-by-investment route since the 2020 closure of the citizenship-by-investment scheme. Fast (60-day target) and covers the whole family. Not a path to Schengen rights — Cyprus is in the EU but not yet Schengen.",
        });
      }

      // ---------- TR — Turkish Citizenship by Investment ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TR",
        purpose: "family",
        status: "embassy_visa",
        label: "Turkish Citizenship by Investment ($400k real estate route)",
        maxStayDays: 9999,
        validityDays: 9999,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Turkish consulate / Land Registry on arrival",
        requirements: [
          "Choose ONE of: $400k real estate purchase (held 3 years), $500k bank deposit, $500k government bond, $500k Turkish company investment, $500k venture-capital fund, OR creating 50+ Turkish jobs",
          "Real estate must be valued by an SPK-licensed valuation expert; foreign-currency cap on price",
          "Clean criminal record",
          "Apostilled birth, marriage certificates for the family",
          "Citizenship granted to: spouse, unmarried children under 18, parents (under separate provisions)",
          "Dual citizenship permitted (Turkey allows it)",
          "Path to powerful passport (visa-free to 110+ countries), and possible visa-waiver discussions with US E-2 treaty",
        ],
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 240,
        applicationUrl: "https://www.csb.gov.tr/en/turkish-citizenship",
        primarySourceUrl: "https://www.csb.gov.tr/en/turkish-citizenship",
        fees: [
          { kind: "base", amountMinor: 7500000, currency: "USD", asOf: "2026-05-11", label: "Legal + valuation + government fees (typical out-of-pocket)", optional: false },
        ],
        notes: "One of the cheapest meaningful CBI programs in the world post-Caribbean revaluation (Antigua / St Kitts $200k → $230k+, Dominica $200k, all raised 2024). Real-estate threshold raised from $250k to $400k in 2022 but has stabilised. Lira-denominated valuations can drift below threshold quickly — watch the exchange rate at submission.",
      });

      // ---------- MT — Malta Permanent Residence Programme ----------
      if (!EU_EEA_CH.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "MT",
          purpose: "work",
          status: "embassy_visa",
          label: "Malta Permanent Residence Programme (MPRP)",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: true,
          biometricsLocation: "Identity Malta",
          requirements: [
            "Capital of at least €500,000 (€150,000 must be financial assets / not real estate)",
            "Property: BUY for €375,000+ in mainland Malta / €300,000+ in Gozo or South Malta, OR RENT for €14,000+/year (mainland) / €10,000+ (Gozo / South)",
            "Government contribution: €68,000 (rental route) / €98,000 (purchase route) — non-refundable",
            "Additional €2,000 NGO donation",
            "Clean criminal background — extensive due diligence (4 tiers)",
            "Health insurance with €100,000+ coverage",
            "5-year residence card initially, renewable; full Schengen rights",
            "Path to Maltese citizenship through naturalisation after 5+ years residence",
          ],
          processingTimeDaysMin: 120,
          processingTimeDaysMax: 270,
          applicationUrl: "https://residencymalta.gov.mt/mprp/",
          primarySourceUrl: "https://residencymalta.gov.mt/mprp/",
          fees: [
            { kind: "base", amountMinor: 4000000, currency: "EUR", asOf: "2026-05-11", label: "Administration fee", optional: false },
            { kind: "service", amountMinor: 6800000, currency: "EUR", asOf: "2026-05-11", label: "Government contribution (rental route minimum)", optional: false },
          ],
          notes: "Malta also runs the Maltese Citizenship by Naturalisation for Exceptional Services scheme (~€700k+ contribution + 3-year residence) — the EU's only remaining CBI program. MPRP is the residency-only sibling and is what most applicants use.",
        });
      }

      // ---------- MU — Mauritius Premium Visa / Real-Estate Scheme ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "MU",
        purpose: "work",
        status: "e_visa",
        label: "Mauritius Premium Travel Visa / PDS — Property Development Scheme",
        maxStayDays: 365,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        biometricsRequired: false,
        requirements: [
          "Premium Visa (remote workers / retirees): no minimum income threshold, but must work for / earn from sources outside Mauritius. 1-year stay, renewable. Apply at edbmauritius.org",
          "PDS Property Investment: buy a property in an approved PDS development for at least US$375,000. Brings family + Mauritius residence permit",
          "IRS / RES (older schemes): higher thresholds (~US$500k-1M), grandfathered for existing developments",
          "Health insurance covering Mauritius for the duration of stay",
          "Clean criminal record",
          "Path to permanent residence after 3 years of physical presence with income / property route",
          "Mauritian tax resident: 15% flat income tax (lower than most home countries)",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 60,
        applicationUrl: "https://edbmauritius.org/premium-visa",
        primarySourceUrl: "https://edbmauritius.org/premium-visa",
        fees: [
          { kind: "base", amountMinor: 0, currency: "USD", asOf: "2026-05-11", label: "Premium Visa fee (free)", optional: false },
        ],
        notes: "Mauritius is the African remote-work / retirement story — Indian Ocean island, English-and-French legal system, low tax. The Premium Visa is essentially free; the PDS is the property-investment route to permanent residence.",
      });

      // ---------- ID — Indonesia Second Home Visa ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "ID",
        purpose: "work",
        status: "e_visa",
        label: "Indonesia Second Home Visa (5-year / 10-year)",
        maxStayDays: 1825,
        validityDays: 1825,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 36,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        requirements: [
          "EITHER a proof-of-funds deposit of IDR 2 billion (~US$130,000) in an Indonesian state-owned bank account",
          "OR ownership of an Indonesian property valued at IDR 2 billion+",
          "5-year or 10-year multi-entry visa option",
          "Cannot work for an Indonesian employer (separate KITAS work permit needed for that)",
          "Spouse + minor children eligible as dependants under the same application",
          "Funds must be held for the duration of the visa",
          "Apply online at evisa.imigrasi.go.id",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 60,
        applicationUrl: "https://evisa.imigrasi.go.id/",
        primarySourceUrl: "https://www.imigrasi.go.id/",
        fees: [
          { kind: "base", amountMinor: 313500000, currency: "IDR", asOf: "2026-05-11", label: "Second Home Visa fee (5-year)", optional: false },
        ],
        notes: "Targeted at retirees, remote investors, and second-home Bali residents. The IDR 2B deposit (~US$130k) is the lowest threshold of any major 'second home / golden visa' programme in Asia. Note: foreign property ownership in Indonesia is leasehold (Hak Pakai), not freehold.",
      });

      // ---------- MX — Mexico Temporary / Permanent Residency by Economic Solvency ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "MX",
        purpose: "work",
        status: "embassy_visa",
        label: "Mexico Temporary / Permanent Residency by Economic Solvency",
        maxStayDays: 1460,
        validityDays: 1460,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Mexican consulate + INM office on arrival",
        requirements: [
          "Temporary Residency (1-4 years) by economic solvency: ~US$2,700+ monthly income (50× minimum wage) for 6 months, OR ~US$45,000+ savings (200× minimum wage) for 12 months",
          "Permanent Residency by economic solvency: ~US$4,400+ monthly income (250× minimum wage) for 6 months, OR ~US$175,000+ savings (800× minimum wage) for 12 months",
          "Permanent Residency by property: own Mexican property valued at ~US$220,000+ (5,000× minimum wage)",
          "Apply at a Mexican consulate in your home country FIRST (this is critical — applying inside Mexico is far harder)",
          "Once approved by consulate, you have 6 months to enter Mexico and finalise at INM",
          "Permanent residents may work in Mexico; temporary residents need a separate work-authorization endorsement",
          "Path to Mexican citizenship after 5 years of permanent residency",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 90,
        applicationUrl: "https://www.gob.mx/inm",
        primarySourceUrl: "https://www.gob.mx/inm",
        fees: [
          { kind: "base", amountMinor: 4800, currency: "USD", asOf: "2026-05-11", label: "Consular visa fee (typical)", optional: false },
        ],
        notes: "Thresholds float with the Mexican minimum wage which has risen ~20% YoY since 2021 — what was easy in 2020 is meaningfully harder now. Mexican consulates also vary considerably (Houston / San Antonio strict; some Canadian consulates more relaxed).",
      });

      // ---------- PH — Philippines SRRV ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "PH",
        purpose: "work",
        status: "embassy_visa",
        label: "Special Resident Retiree's Visa (SRRV) — Philippines",
        maxStayDays: 9999,
        validityDays: 9999,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Philippine Retirement Authority",
        requirements: [
          "Five SRRV variants targeting different applicant profiles:",
          "SRRV Smile: 35+, US$20,000 bank deposit (held in approved Philippine bank)",
          "SRRV Classic: 35-49 US$50,000 / 50+ US$10,000 (with monthly pension proof of US$800 single)",
          "SRRV Human Touch: 35+, with medical / care needs, US$10,000 deposit + US$1,500/mo pension",
          "SRRV Courtesy: ex-Filipinos + diplomats, US$1,500 deposit",
          "Deposit can be converted to a Philippine condominium (leasehold) after 30 days",
          "Multiple-entry visa, no work permission (separate AEP needed)",
          "Spouse + 2 dependants under 21 covered by single applicant fee",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: "https://pra.gov.ph/",
        primarySourceUrl: "https://pra.gov.ph/",
        fees: [
          { kind: "base", amountMinor: 140000, currency: "USD", asOf: "2026-05-11", label: "PRA application fee", optional: false },
          { kind: "service", amountMinor: 36000, currency: "USD", asOf: "2026-05-11", label: "Annual PRA fee (year 1)", optional: false },
        ],
        notes: "One of Asia's cheapest retirement programmes (US$10-50k deposit). The Smile variant's US$20k for under-50s makes it accessible to younger people too. Note: Philippine condominium ownership is foreign-permitted (60/40 building cap) but land is not.",
      });

      // ---------- AE — UAE Golden Visa (Real Estate) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "AE",
        purpose: "work",
        status: "embassy_visa",
        label: "UAE Golden Visa — Real Estate Route (AED 2M+)",
        maxStayDays: 3650,
        validityDays: 3650,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "ICA / GDRFA office in the UAE",
        requirements: [
          "Real estate ownership in the UAE valued at AED 2,000,000+ (US$545,000+) — can be one property OR multiple",
          "Off-plan accepted if at least 50% paid and property registered",
          "Mortgage acceptable as long as the borrower's equity meets the AED 2M threshold",
          "10-year multi-entry residence permit, renewable indefinitely",
          "Sponsor your spouse, children of any age, parents — all on the same Golden Visa terms",
          "No 6-month absence rule (unlike standard UAE residence) — can stay outside the UAE without losing status",
          "Domestic worker can be sponsored under the same residence",
          "Zero income tax, zero capital-gains tax in the UAE",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 60,
        applicationUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas",
        primarySourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas",
        fees: [
          { kind: "base", amountMinor: 1110000, currency: "AED", asOf: "2026-05-11", label: "Golden Visa application + ICA fees", optional: false },
        ],
        notes: "The 6-month rule waiver is the game-changer — standard UAE residence visas lapse if you're outside the country for 6+ months; Golden Visa holders can spend years abroad without losing status. AED is pegged to USD, so the AED 2M threshold is stable at ~US$545k.",
      });

      // ---------- ES — Spain Golden Visa (sunset notice) ----------
      if (!EU_EEA_CH.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "ES",
          purpose: "work",
          status: "embassy_visa",
          label: "Spain Golden Visa — REAL ESTATE ROUTE CLOSED 2025",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 12,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Spanish consulate",
          requirements: [
            "IMPORTANT: The real-estate route (€500,000+ property) was abolished by Law 5/2025, effective 3 April 2025. New applications via property are NO LONGER ACCEPTED.",
            "Remaining routes that are still open: €1M+ Spanish company shares OR €1M+ Spanish bank deposit OR €2M+ Spanish government bonds OR €500k+ business investment creating jobs / scientific or technological impact",
            "Investor + spouse + minor children + dependent parents all included",
            "Health insurance with comprehensive Spanish coverage",
            "Clean criminal record",
            "Sufficient income to support self + family (~€2,400/mo)",
            "1-year visa initially, then 3-year residence card, then 5-year — all renewable",
            "Schengen mobility; path to Spanish citizenship after 10 years (2 years for Iberoamericans)",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://extranjeros.inclusion.gob.es/es/InformacionInteres/InformacionProcedimientos/Visadosresidenciainversionistas/",
          primarySourceUrl: "https://extranjeros.inclusion.gob.es/es/InformacionInteres/InformacionProcedimientos/Visadosresidenciainversionistas/",
          fees: [
            { kind: "base", amountMinor: 8000, currency: "EUR", asOf: "2026-05-11", label: "Application + residence permit fees (typical)", optional: false },
          ],
          notes: "Spain ended the real-estate Golden Visa route in April 2025 to cool the housing market. Business, company-shares, deposit and bond routes remain. Existing Golden Visa holders are grandfathered. The Non-Lucrative Visa is the more accessible alternative for retirees who don't need to work.",
        });
      }
    }

    return { records };
  },
};
