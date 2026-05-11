/**
 * Total-coverage adapter — Wave 4 — EU national-level visa programs.
 *
 * Programs covered (8):
 *   DE Chancenkarte — Opportunity Card (points-based job seeker)
 *   NL DAFT — Dutch-American Friendship Treaty (US-only)
 *   NL Highly Skilled Migrant
 *   IE Critical Skills Employment Permit
 *   IT Digital Nomad Visa
 *   GR Golden Visa (real-estate route)
 *   ES Non-Lucrative Visa (passive-income)
 *   PT Tech Visa
 *
 * Schengen short-stay tourism + Spain DN + Portugal D7 + DE Blue Card +
 * FR Talent Passport are already covered by their own dedicated adapters.
 * This file fills the most-traffic gaps the user can hit on a "move to
 * Europe" search.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

// EU/EEA + Switzerland — these passports use freedom of movement instead
// of national-level visas, so we skip them.
const EU_EEA_CH = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "CH",
]);

export const totalCoverageEuAdapter: Adapter = {
  metadata: {
    id: "total_coverage_eu",
    name: "Total coverage — EU national-level (DE Chancenkarte / NL DAFT / NL Highly Skilled / IE Critical Skills / IT Digital Nomad / GR Golden / ES Non-Lucrative / PT Tech)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://www.make-it-in-germany.com/en/visa-residence/chancenkarte",
      "https://ind.nl/en/dutch-american-friendship-treaty-daft",
      "https://ind.nl/en/highly-skilled-migrant",
      "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/",
      "https://www.esteri.it/en/servizi-consolari-e-visti/italian-visas/lavoratore-nomade-digitale/",
      "https://www.enterprisegreece.gov.gr/en/invest-in-greece/golden-visa",
      "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/InformacionParaExtranjeros/Paginas/RecomendacionesEnFuncionDelTipoDeViaje/Estancia-no-lucrativa.aspx",
      "https://www.iefp.pt/en/tech-visa",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_eu.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_eu" }), fetchUrl: "manual://total_coverage_eu" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      // Skip EU/EEA/CH passports — they use freedom of movement, not
      // national visas, for these destinations.
      const skipForEu = EU_EEA_CH.has(passport);

      // ============================================================
      // GERMANY — Chancenkarte (Opportunity Card)
      // ============================================================
      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "DE",
          purpose: "work",
          status: "embassy_visa",
          label: "Chancenkarte (Opportunity Card) — Germany",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "German embassy / consulate",
          requirements: [
            "Either: vocational training (2+ years) or university degree recognised in Germany",
            "OR: 6+ points across the points system (qualifications, work experience, age <40, German A2+ / English B2, prior stay in Germany)",
            "Proof of funds €1,091/month for the year (e.g. €13,092 in a blocked account)",
            "Up to 20 hours/week trial work permitted (any sector) while you job-hunt",
            "1-year stay, switch to Skilled Worker / EU Blue Card on finding a qualifying job",
            "Spouse + minor children can join as dependants (right to work)",
          ],
          processingTimeDaysMin: 28,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.make-it-in-germany.com/en/visa-residence/chancenkarte",
          primarySourceUrl: "https://www.make-it-in-germany.com/en/visa-residence/chancenkarte",
          fees: [
            { kind: "base", amountMinor: 7500, currency: "EUR", asOf: "2026-05-11", label: "Chancenkarte visa fee", optional: false },
          ],
          notes: "Launched June 2024 under the Skilled Immigration Act reform. Closest German equivalent to Canada's Express Entry — a points-based job-seeker route. Critically: you can trial-work part-time while searching.",
        });
      }

      // ============================================================
      // NETHERLANDS — DAFT (US-only) + Highly Skilled Migrant
      // ============================================================

      // DAFT is restricted to US nationals (and Japanese via the
      // Japanese-Dutch Treaty of 1912, which lawyers periodically argue
      // for; we list it US-only here per the IND's published guidance).
      if (passport === "US") {
        records.push({
          passportIso2: passport,
          destinationIso2: "NL",
          purpose: "work",
          status: "embassy_visa",
          label: "DAFT — Dutch-American Friendship Treaty (US nationals)",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "IND desk on arrival in the Netherlands",
          requirements: [
            "US citizen by birth or naturalisation (not just permanent resident)",
            "Register a Dutch business (eenmanszaak / B.V. / VOF) — sole proprietor is simplest",
            "Deposit €4,500 in the business's Dutch bank account and keep it there throughout the residence",
            "Substantive business activity in the Netherlands (real customers / operations — not just a holding entity)",
            "BSN registration + KvK Chamber of Commerce registration",
            "Renewable every 2 years indefinitely; spouse + children eligible for dependent permits",
            "Path to permanent residence after 5 years; Dutch citizenship after the same (US dual citizenship permitted)",
          ],
          processingTimeDaysMin: 28,
          processingTimeDaysMax: 90,
          applicationUrl: "https://ind.nl/en/dutch-american-friendship-treaty-daft",
          primarySourceUrl: "https://ind.nl/en/dutch-american-friendship-treaty-daft",
          fees: [
            { kind: "base", amountMinor: 138000, currency: "EUR", asOf: "2026-05-11", label: "MVV + Residence Permit fee", optional: false },
          ],
          notes: "Unique to US passport holders thanks to a 1956 friendship treaty. No salary threshold (compare ~€5k/month for Highly Skilled Migrant). The €4,500 just needs to stay in the business account — it's not a fee or investment in any other sense.",
        });
      }

      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "NL",
          purpose: "work",
          status: "embassy_visa",
          label: "Highly Skilled Migrant — Netherlands",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "IND desk on arrival in the Netherlands",
          requirements: [
            "Job offer from an IND-recognised sponsor (employer must apply for recognition first if not already on the public register)",
            "Minimum gross salary: €5,688/month (30+ years old, 2025), €4,171/month (<30), €2,989/month (post-study graduate first year)",
            "Application by the sponsor on your behalf — typically a 2-4 week IND process",
            "Spouse + children eligible for dependant permits (spouse can work freely)",
            "30%-ruling tax benefit available for the first 5 years (now scaling: 30% / 20% / 10% in three-year blocks)",
            "Path to permanent residence + Dutch citizenship after 5 years",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 56,
          applicationUrl: "https://ind.nl/en/highly-skilled-migrant",
          primarySourceUrl: "https://ind.nl/en/highly-skilled-migrant",
          fees: [
            { kind: "base", amountMinor: 38000, currency: "EUR", asOf: "2026-05-11", label: "Residence permit fee", optional: false },
          ],
          notes: "The standard skilled-employment route. The recent narrowing of the 30%-ruling (Box 3 wealth-tax rules also changing 2025-2027) has reduced the after-tax appeal somewhat but it remains one of Europe's most accessible skilled-worker visas.",
        });
      }

      // ============================================================
      // IRELAND — Critical Skills Employment Permit
      // ============================================================
      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "IE",
          purpose: "work",
          status: "embassy_visa",
          label: "Critical Skills Employment Permit — Ireland",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 12,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Irish embassy / consulate (visa-required nationals only)",
          requirements: [
            "Job offer in an occupation on the Critical Skills Occupations List (most tech, engineering, healthcare, finance roles)",
            "Salary €38,000+/year (most roles) or €64,000+/year for roles not on the list but still permitted",
            "Relevant qualification (degree for €38k threshold, equivalent experience for €64k)",
            "No Labour Market Needs Test required (unlike the General Employment Permit)",
            "Immediate family-reunification rights — spouse/partner gets Stamp 1G (full work rights)",
            "Apply for Stamp 4 (long-term residence, no work permit needed) after 2 years",
            "Path to Irish citizenship after 5 years of legal residence",
          ],
          processingTimeDaysMin: 28,
          processingTimeDaysMax: 90,
          applicationUrl: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/",
          primarySourceUrl: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/",
          fees: [
            { kind: "base", amountMinor: 100000, currency: "EUR", asOf: "2026-05-11", label: "Employment Permit fee (2 years)", optional: false },
          ],
          notes: "Best-of-class EU skilled-worker route — family reunification from day one, fast track to Stamp 4 (work-permit-free residence). The Irish tech sector (Dublin: Google, Meta, Apple, Microsoft EU HQs) heavily uses this.",
        });
      }

      // ============================================================
      // ITALY — Digital Nomad Visa
      // ============================================================
      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "IT",
          purpose: "work",
          status: "embassy_visa",
          label: "Digital Nomad Visa — Italy",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: true,
          biometricsLocation: "Italian embassy / consulate",
          requirements: [
            "Highly skilled worker (€28,000+ annual income — roughly 3× the Italian minimum wage)",
            "Remote work for a non-Italian employer OR freelance with non-Italian clients",
            "Health insurance valid in Italy with minimum €30,000 cover",
            "Long-stay accommodation in Italy (rental contract or proof of property)",
            "Clean criminal record for the past 5 years",
            "Codice Fiscale + Permesso di Soggiorno application within 8 days of arrival",
            "Renewable annually; path to permanent residence after 5 years",
            "Spouse + minor children eligible for family reunification",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/italian-visas/lavoratore-nomade-digitale/",
          primarySourceUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/italian-visas/lavoratore-nomade-digitale/",
          fees: [
            { kind: "base", amountMinor: 11600, currency: "EUR", asOf: "2026-05-11", label: "Digital Nomad visa fee", optional: false },
            { kind: "service", amountMinor: 7600, currency: "EUR", asOf: "2026-05-11", label: "Permesso di Soggiorno", optional: false },
          ],
          notes: "Officially launched April 2024 under Decree 71/2024. The €28k income threshold is lower than most EU digital-nomad visas. Italian flat-tax regime for new residents (€100k/year for foreign income) makes it attractive to higher earners.",
        });
      }

      // ============================================================
      // GREECE — Golden Visa
      // ============================================================
      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "GR",
          purpose: "work",
          status: "embassy_visa",
          label: "Golden Visa (Real Estate) — Greece",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Greek embassy / consulate or local authority on arrival",
          requirements: [
            "Real estate purchase of €800k+ (Attica, Thessaloniki, Mykonos, Santorini, plus islands with 3,100+ population) OR €400k (rest of Greece)",
            "Alternative routes: €250k investment in commercial property converted to residential, OR €500k+ investment in Greek government bonds / shares / specific funds",
            "Clean criminal record",
            "Greek health insurance covering you + family",
            "5-year residence permit, renewable indefinitely as long as the investment is maintained",
            "Spouse + unmarried children under 21 + parents of both spouses included",
            "Schengen mobility — but no residence rights in other EU states",
            "Path to Greek citizenship after 7 years of physical residence (not just permit-holding)",
          ],
          processingTimeDaysMin: 60,
          processingTimeDaysMax: 180,
          applicationUrl: "https://www.enterprisegreece.gov.gr/en/invest-in-greece/golden-visa",
          primarySourceUrl: "https://www.enterprisegreece.gov.gr/en/invest-in-greece/golden-visa",
          fees: [
            { kind: "base", amountMinor: 200000, currency: "EUR", asOf: "2026-05-11", label: "Application + biometrics fee per applicant", optional: false },
          ],
          notes: "Thresholds increased in 2024 to dampen real-estate speculation in tourist hotspots. The €250k commercial-conversion route is the cheapest current entry but limited stock. Citizenship requires actual physical residence, not just permit-holding.",
        });
      }

      // ============================================================
      // SPAIN — Non-Lucrative Visa
      // ============================================================
      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "ES",
          purpose: "work",
          status: "embassy_visa",
          label: "Non-Lucrative Visa (Visado de Residencia No Lucrativa) — Spain",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 12,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: true,
          biometricsLocation: "Spanish consulate (apply only from country of residence)",
          requirements: [
            "Passive income of at least 400% of the IPREM (€2,400/month / €28,800/year in 2025), plus 100% IPREM per dependent",
            "Funds typically demonstrated as: pension / annuity / rental income / savings drawdown / dividend income — NOT remote-work salary (use the Digital Nomad Visa for that)",
            "Private health insurance with full coverage in Spain (no co-pays, no caps), valid for 1 year",
            "Spanish criminal-record check (apostilled if from abroad) + medical certificate",
            "Long-term Spanish accommodation (rental contract or property deed)",
            "Cannot work in Spain (employed or self-employed) — switch to a different residence permit if you want to",
            "Renewable for 2 years, then another 2 years, then 5-year Long-Term EU Residence",
            "Path to Spanish citizenship after 10 years (2 years for Iberoamerican nationals)",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/InformacionParaExtranjeros/Paginas/RecomendacionesEnFuncionDelTipoDeViaje/Estancia-no-lucrativa.aspx",
          primarySourceUrl: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/InformacionParaExtranjeros/Paginas/RecomendacionesEnFuncionDelTipoDeViaje/Estancia-no-lucrativa.aspx",
          fees: [
            { kind: "base", amountMinor: 8000, currency: "EUR", asOf: "2026-05-11", label: "Consular fee (varies by nationality)", optional: false },
          ],
          notes: "Spain's most popular passive-income / retirement route. Income must be unearned (pension, rentals, dividends, savings). Remote workers should use the Digital Nomad Visa instead. IPREM is updated annually; check the current rate.",
        });
      }

      // ============================================================
      // PORTUGAL — Tech Visa
      // ============================================================
      if (!skipForEu) {
        records.push({
          passportIso2: passport,
          destinationIso2: "PT",
          purpose: "work",
          status: "embassy_visa",
          label: "Tech Visa — Portugal",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Portuguese embassy / consulate",
          requirements: [
            "Job offer from a Tech Visa–certified Portuguese tech company (~700+ certified employers including OutSystems, Critical TechWorks, Farfetch, Talkdesk)",
            "Salary 2.5× the Portuguese guaranteed minimum monthly wage (~€2,000+/month)",
            "Relevant tech / digital skills",
            "Employer obtains the Termo de Responsabilidade (Letter of Responsibility) — a fast-track endorsement from IAPMEI",
            "30-day visa processing target (vs months for the standard work visa)",
            "Path to Portuguese permanent residence after 5 years; citizenship after the same",
            "Spouse + children eligible for family reunification",
          ],
          processingTimeDaysMin: 21,
          processingTimeDaysMax: 60,
          applicationUrl: "https://www.iefp.pt/en/tech-visa",
          primarySourceUrl: "https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Empreendedorismo-Inovacao/Tech-Visa.aspx",
          fees: [
            { kind: "base", amountMinor: 9000, currency: "EUR", asOf: "2026-05-11", label: "Tech Visa application fee", optional: false },
          ],
          notes: "Portugal's fast-lane for tech-sector employers. Distinct from the D8 (Digital Nomad), D7 (passive income) and standard Highly Qualified routes. The certified-employer requirement is the constraint — but the list is growing.",
        });
      }
    }

    return { records };
  },
};
