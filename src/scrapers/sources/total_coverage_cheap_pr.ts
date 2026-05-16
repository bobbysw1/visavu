/**
 * Cheapest-permanent-residence routes worldwide.
 *
 * Programs covered (7) — sorted by capital outlay ascending:
 *   PY Paraguay Permanent Residence (~$5k agriculture / $70k bank deposit)
 *   NI Nicaragua Pensionado ($600/month income, 45+)
 *   BZ Belize Qualified Retired Persons (QRP, $2,000/month, 45+)
 *   AR Argentina Rentista (~$2,000/month income)
 *   CR Costa Rica Rentista (~$2,500/month income or $60k deposit)
 *   PA Panama Friendly Nations Visa (50 friendly countries, $200k+ bank or property)
 *   EC Ecuador Inversionista ($45k bank deposit or $25k real estate)
 *
 * These are the routes most-asked for "cheapest way to get residency
 * anywhere in the world". All except Argentina Rentista lead directly
 * to permanent residence within 5 years.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

// Panama Friendly Nations is restricted to a fixed list. Source:
// migracion.gob.pa Decreto Ejecutivo 226/2021 (revised 2023).
const PANAMA_FRIENDLY = new Set([
  "AD", "AR", "AU", "AT", "BE", "BR", "CA", "CL", "HR", "CY", "CZ", "DK",
  "EE", "FI", "FR", "DE", "GR", "HK", "HU", "IE", "IL", "JP", "LV", "LI",
  "LT", "LU", "MT", "MX", "MC", "NL", "NZ", "NO", "PL", "PT", "RO", "SM",
  "SG", "SK", "SI", "KR", "ES", "ZA", "SE", "CH", "TW", "GB", "US", "UY",
  "MN", "PY", "CR",
]);

export const totalCoverageCheapPrAdapter: Adapter = {
  metadata: {
    id: "total_coverage_cheap_pr",
    name: "Total coverage — cheapest permanent-residence routes (PY / NI / BZ / AR / CR / PA Friendly Nations / EC)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://www.migraciones.gov.py/",
      "https://www.migob.gob.ni/",
      "https://www.belizetourismboard.org/qrp-program/",
      "https://www.migraciones.gob.ar/",
      "https://www.migracion.go.cr/",
      "https://www.migracion.gob.pa/",
      "https://www.gob.ec/ministerios/ministerio-del-interior",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_cheap_pr.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_cheap_pr" }), fetchUrl: "manual://total_coverage_cheap_pr" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      // ---------- PY — Paraguay Permanent Residence ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "PY",
        purpose: "work",
        status: "embassy_visa",
        label: "Paraguay Permanent Residence — Ley 6984/2022",
        maxStayDays: 9999,
        validityDays: 3650,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Dirección General de Migraciones (Asunción)",
        requirements: [
          "Two routes after the 2022 immigration-law reform:",
          "(A) SEM Investor route — invest USD$70,000 in Paraguay (bank deposit, real estate, or business) and obtain a 10-year permanent residence",
          "(B) MERCOSUR Residence route (for citizens of MERCOSUR / associate member states — most of South America): much simpler 2-year temporary residence, then permanent",
          "Apostilled birth certificate, marriage certificate, police certificate",
          "Health certificate (basic medical) from a Paraguayan doctor",
          "Tax ID (RUC) registration",
          "Once permanent: full work rights, business registration, banking access",
          "Path to Paraguayan citizenship after 3 years of physical residence (must demonstrate ties)",
        ],
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 240,
        applicationUrl: "https://www.migraciones.gov.py/",
        primarySourceUrl: "https://www.migraciones.gov.py/",
        fees: [
          { kind: "base", amountMinor: 150000, currency: "USD", asOf: "2026-05-11", label: "Government + apostille + translation fees (typical)", optional: false },
          { kind: "service", amountMinor: 7000000, currency: "USD", asOf: "2026-05-11", label: "Investment minimum (SEM route)", optional: false },
        ],
        notes: "Paraguay rewrote its immigration law in 2022 — the old US$5,500 bank deposit route was replaced by the SEM US$70,000 investor route. Far cheaper than most CBI / Golden Visa programs but the legal landscape changed materially. MERCOSUR nationals still have the easy old route.",
      });

      // ---------- NI — Nicaragua Pensionado ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "NI",
        purpose: "work",
        status: "embassy_visa",
        label: "Nicaragua Pensionado — Retirement Residence",
        maxStayDays: 9999,
        validityDays: 1825,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Dirección de Migración y Extranjería (Managua)",
        requirements: [
          "Aged 45+",
          "Monthly retirement income of at least US$600 (single applicant) / US$750 (couple) — pension, government benefits, dividends, annuities all count",
          "Income must be remitted to Nicaragua (~85% needs to be brought in)",
          "Apostilled documents: birth certificate, marriage certificate, police certificate, pension verification",
          "Cannot work as employed in Nicaragua; CAN run a business or earn passive income",
          "Tax benefits: imports of household goods + one vehicle tax-free; rental income tax-free; no tax on foreign-source pension income",
          "Renewable every 5 years; path to permanent residence after 3 years of pensionado status",
        ],
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 180,
        applicationUrl: "https://www.migob.gob.ni/",
        primarySourceUrl: "https://www.migob.gob.ni/",
        fees: [
          { kind: "base", amountMinor: 25000, currency: "USD", asOf: "2026-05-11", label: "Government + cedula fees (typical)", optional: false },
        ],
        notes: "Lowest income threshold of any retirement-residency program worldwide. Political situation in Nicaragua has been volatile since 2018 — many foreign retirees have left, weakening the expat infrastructure but property prices have dropped. Read travel advisories before committing.",
      });

      // ---------- BZ — Belize Qualified Retired Persons (QRP) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "BZ",
        purpose: "work",
        status: "embassy_visa",
        label: "Belize Qualified Retired Persons (QRP) Program",
        maxStayDays: 9999,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Belize Tourism Board",
        requirements: [
          "Aged 45+",
          "Monthly income of at least US$2,000 from a verifiable source: pension, social security, annuity, investment income, etc.",
          "Income must be deposited into a Belizean bank account (in USD or BZD)",
          "Spend at least 30 consecutive days per year in Belize to maintain status",
          "Cannot work in Belize, BUT can manage a Belize-registered business and earn passive income",
          "Tax-free imports of personal effects + one vehicle / boat / aircraft",
          "No tax on foreign-source income, no estate tax",
          "Path to permanent residence + citizenship after 5 years",
          "English-speaking jurisdiction (former British Honduras) — easiest LatAm option for English speakers",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 120,
        applicationUrl: "https://www.belizetourismboard.org/qrp-program/",
        primarySourceUrl: "https://www.belizetourismboard.org/qrp-program/",
        fees: [
          { kind: "base", amountMinor: 100000, currency: "USD", asOf: "2026-05-11", label: "QRP application fee", optional: false },
          { kind: "service", amountMinor: 200000, currency: "USD", asOf: "2026-05-11", label: "Annual QRP fee", optional: false },
        ],
        notes: "Run by the Tourism Board, not Immigration directly. The only English-speaking country in Central America. Income threshold is higher than Nicaragua but the legal/political environment is far more stable. The 30-day physical-presence minimum is uniquely accommodating for snowbirds.",
      });

      // ---------- AR — Argentina Rentista ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "AR",
        purpose: "work",
        status: "embassy_visa",
        label: "Argentina Rentista — Passive Income Residence",
        maxStayDays: 9999,
        validityDays: 1095,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 3,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Dirección Nacional de Migraciones (Buenos Aires)",
        requirements: [
          "Monthly passive income of at least 30× the Argentine minimum wage (~US$2,000-2,500 currently, but floats with peso)",
          "Income from: pension, rental income, dividends, royalties, capital — NOT salary from employment",
          "Apostilled documents: birth certificate, marriage certificate, police certificate, income verification (3 months of bank statements + source proof)",
          "Argentine criminal-record check",
          "3-year temporary residence initially, renewable; can apply for permanent residence after 3 years",
          "Argentine citizenship eligible after 2 years of legal residence (one of the world's fastest)",
          "Argentine citizen children of foreign residents get Argentine citizenship at birth — accelerates parents' naturalisation",
        ],
        processingTimeDaysMin: 60,
        processingTimeDaysMax: 180,
        applicationUrl: "https://www.migraciones.gov.ar/",
        primarySourceUrl: "https://www.migraciones.gov.ar/",
        fees: [
          { kind: "base", amountMinor: 20000, currency: "USD", asOf: "2026-05-11", label: "Application + DNI + apostille fees (typical)", optional: false },
        ],
        notes: "Argentine peso volatility makes the income-threshold conversion unpredictable — could be US$1,000 or US$3,000 in real terms depending on the exchange-rate moment of your application. 2-year citizenship pathway is extraordinarily generous (most countries 5-10 years).",
      });

      // ---------- CR — Costa Rica Rentista ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "CR",
        purpose: "work",
        status: "embassy_visa",
        label: "Costa Rica Rentista — Independent Means Residence",
        maxStayDays: 9999,
        validityDays: 730,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Dirección General de Migración y Extranjería",
        requirements: [
          "Stable monthly income of at least US$2,500 for at least 2 years, OR a US$60,000 deposit in a Costa Rican bank to be drawn down at US$2,500/month over 24 months",
          "Letter from your bank or employer documenting the income source",
          "Apostilled birth, marriage, police certificates",
          "Health insurance with comprehensive Costa Rican coverage (CCSS membership or private)",
          "Cannot work as employed in Costa Rica, CAN own / run a business and earn passive income",
          "2-year temporary residence, renewable; permanent residence after 3 years",
          "Path to Costa Rican citizenship after 7 years (5 years for Central American / Iberoamerican nationals)",
        ],
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 240,
        applicationUrl: "https://www.migracion.go.cr/",
        primarySourceUrl: "https://www.migracion.go.cr/",
        fees: [
          { kind: "base", amountMinor: 25000, currency: "USD", asOf: "2026-05-11", label: "Government + apostille + legal fees (typical)", optional: false },
        ],
        notes: "Higher income threshold than Nicaragua but Costa Rica is famously stable and English-friendly. The Pensionado alternative (US$1,000/month, but only pension income counts) is even cheaper for retirees with a structured pension.",
      });

      // ---------- PA — Panama Friendly Nations Visa ----------
      if (PANAMA_FRIENDLY.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "PA",
          purpose: "work",
          status: "embassy_visa",
          label: "Panama Friendly Nations Visa (Decreto Ejecutivo 197/2021)",
          maxStayDays: 9999,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Servicio Nacional de Migración (Panama City)",
          requirements: [
            "Citizen of one of ~50 Friendly Nations (most of Europe, US, Canada, AU/NZ, Japan, Korea, Singapore, Israel, Mexico, Argentina, Brazil, Chile, Uruguay, etc.)",
            "Choose ONE of three routes:",
            "(A) Real Estate: purchase Panamanian property valued at US$200,000+",
            "(B) Fixed-Term Deposit: US$200,000 in a Panamanian bank for 3+ years",
            "(C) Employment: signed labour contract with a Panamanian company in a non-restricted profession (the original route, now narrowed)",
            "2-year temporary residence first, then permanent at year 2 (this is the major change from the old version — used to be instant permanent)",
            "Path to Panamanian citizenship after 5 years of permanent residence",
            "Panama uses a territorial tax system: no tax on foreign-source income",
          ],
          processingTimeDaysMin: 60,
          processingTimeDaysMax: 180,
          applicationUrl: "https://www.migracion.gob.pa/",
          primarySourceUrl: "https://www.migracion.gob.pa/",
          fees: [
            { kind: "base", amountMinor: 80000, currency: "USD", asOf: "2026-05-11", label: "Application + repatriation + carnet fees", optional: false },
          ],
          notes: "Panama's reform in 2021 made this less generous than its early-2010s heyday — used to give permanent residence at year zero, now requires a 2-year temporary phase. Still one of the world's best territorial-tax jurisdictions if you're a Friendly Nations citizen.",
        });
      }

      // ---------- EC — Ecuador Inversionista ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "EC",
        purpose: "work",
        status: "embassy_visa",
        label: "Ecuador Inversionista — Investor / Property Residence",
        maxStayDays: 9999,
        validityDays: 730,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Ministerio del Interior",
        requirements: [
          "Three investment routes:",
          "(A) Real Estate: purchase Ecuadorian property valued at 100× the minimum wage (~US$47,000 in 2026)",
          "(B) Term Deposit: 100× minimum wage (~US$47,000) in an Ecuadorian bank for 2+ years",
          "(C) Productive Investment: 125× minimum wage (~US$58,000) in an Ecuadorian company / activity",
          "Apostilled documents: birth, marriage, police certificates",
          "Ecuadorian health insurance",
          "2-year temporary residence first, permanent at year 2",
          "Ecuador uses the US dollar — no exchange-rate volatility",
          "Path to Ecuadorian citizenship after 3 years of permanent residence (one of the fastest globally)",
        ],
        processingTimeDaysMin: 60,
        processingTimeDaysMax: 180,
        applicationUrl: "https://www.gob.ec/ministerios/ministerio-del-interior",
        primarySourceUrl: "https://www.gob.ec/ministerios/ministerio-del-interior",
        fees: [
          { kind: "base", amountMinor: 45000, currency: "USD", asOf: "2026-05-11", label: "Application + visa stamp + cedula fees", optional: false },
        ],
        notes: "Ecuador uses the US dollar so your investment doesn't get clipped by FX swings. The 3-year citizenship pathway is one of the fastest worldwide. Threshold floats with the Ecuadorian minimum wage which rises ~3% yearly.",
      });
    }

    return { records };
  },
};
