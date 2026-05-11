/**
 * Spain Digital Nomad visa adapter.
 *
 * Source: https://www.exteriores.gob.es/Embajadas/londres/en/ServiciosConsulares/Paginas/Consular/Visado-trabajador-digital.aspx
 *
 * Spain's Digital Nomad visa (Ley 28/2022, "Startups Law") permits remote
 * workers to live in Spain while working for non-Spanish employers, with a
 * favourable 24% flat tax (Beckham Law extension) for up to 5 years.
 *
 * Excludes EU/EEA citizens (free movement applies).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL =
  "https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Digital-Nomad-Visa.aspx";

const EU_EEA_SWISS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "CH",
]);

export const spainDigitalNomadAdapter: Adapter = {
  metadata: {
    id: "es_digital_nomad",
    name: "Spain Digital Nomad visa (exteriores.gob.es)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/es_digital_nomad.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("main, body").text().replace(/\s+/g, " ");

    if (!/(digital\s+nomad|teletrabajador|remote\s+work)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected Spain Digital Nomad wording." };
    }

    // Income threshold = 200% of Spanish minimum interprofessional wage (SMI).
    // 2024–2025 SMI ≈ €15,876 → DN threshold ~€31,752/year for the primary
    // applicant, plus 75% SMI for first dependent and 25% for each additional.
    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: false,
      sponsorType: "self",
      salaryThresholdMinor: 31_752_00,
      salaryCurrency: "EUR",
      jobOfferRequired: false,
      workPermitDays: 365, // 1-year initial; renewable up to 5 years total
      routeToSettlement: true,
      eligibleOccupations: [
        "Remote employee of a non-Spanish company",
        "Self-employed remote worker / freelancer",
        "Tech / IT professional",
        "Consultant",
        "Designer",
        "Writer / content creator",
      ],
    };

    const requirements = [
      "Employment contract or freelance contracts ≥ 3 months old with non-Spanish entity",
      "Income at or above 200% of SMI (~€31,752/year for primary applicant)",
      "Bachelor's degree from an accredited institution OR 3+ years of professional experience",
      "Private health insurance valid in Spain (no co-pays)",
      "Clean criminal record (5 years) — apostilled / legalized",
      "Proof of accommodation in Spain",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "ES" && !EU_EEA_SWISS.has(c.iso2))
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "ES",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "Spain Digital Nomad visa (Ley 28/2022)",
        maxStayDays: 365,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        biometricsRequired: true,
        biometricsLocation: "Spanish consulate in your country of residence",
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        requirements,
        processingTimeDaysMin: 15,
        processingTimeDaysMax: 45,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 80_00, currency: "EUR", asOf: today, label: "Visa application fee" },
          { kind: "service" as const, amountMinor: 16_00, currency: "EUR", asOf: today, label: "TIE residency card fee" },
        ],
        notes:
          "Spain's Digital Nomad visa is a 1-year national visa, renewable in-country to a 3-year residence permit and again for a further 2 years (5 years total). Holders qualify for the favourable Beckham Law tax regime (24% flat rate on Spanish income up to €600k). Family members may join under a unified application.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} Spain DN records (expected ~220).` };
    }
    return { records };
  },
};
