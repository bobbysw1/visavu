/**
 * Caribbean Citizenship-by-Investment (CBI) programs.
 *
 * Five Caribbean states + Vanuatu offer second-passport programs for
 * qualifying investments. These are PERMANENT pathways to a second
 * citizenship — distinct from the digital-nomad and golden-visa programs
 * which only grant residency.
 *
 *  - Antigua & Barbuda: from US$230k (donation) or US$300k (real estate)
 *  - Dominica: from US$200k (donation) or US$200k (real estate)
 *  - Grenada: from US$235k (donation) or US$270k (real estate)
 *  - Saint Kitts & Nevis: from US$250k (donation) or US$400k (real estate)
 *  - Saint Lucia: from US$240k (donation) or US$300k (real estate)
 *  - Vanuatu: from US$130k single / US$180k family (donation only)
 *
 * Notes on eligibility: CBI programs accept most nationalities but each has
 * a "restricted-nationalities" list (typically Iran, North Korea, Russia,
 * Belarus, Yemen, Afghanistan, Somalia, Cuba, etc.) that varies by program.
 * For UI purposes we conservatively exclude the union of common restrictions.
 *
 * Citizenship-by-investment is legal but politically contentious. The EU has
 * restricted visa-free Schengen access for some CBI passports as of 2025.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

type CbiProgram = {
  destinationIso2: string;
  id: string;
  label: string;
  /** Minimum donation amount in minor units. */
  minDonationAmountMinor: number;
  donationCurrency: string;
  /** Real-estate alternative threshold in minor units (or null if donation-only). */
  realEstateAmountMinor: number | null;
  applicationUrl: string;
  primarySourceUrl: string;
  visaFreeCount: number;
  /** Common-cause restricted nationalities — varies by program but mostly aligned. */
  excluded: string[];
  notes: string;
};

const PROGRAMS: CbiProgram[] = [
  {
    destinationIso2: "AG",
    id: "ag_cbi",
    label: "Antigua & Barbuda Citizenship-by-Investment",
    minDonationAmountMinor: 23_000_000, // US$230,000
    donationCurrency: "USD",
    realEstateAmountMinor: 30_000_000, // US$300,000
    applicationUrl: "https://cip.gov.ag/",
    primarySourceUrl: "https://cip.gov.ag/",
    visaFreeCount: 151,
    excluded: ["IR", "KP", "AF", "SO", "YE", "RU", "BY", "SD", "CU"],
    notes:
      "Family of 4 included. 5-day residency requirement during the first 5 years. Antiguan citizenship is for life and inheritable.",
  },
  {
    destinationIso2: "DM",
    id: "dm_cbi",
    label: "Commonwealth of Dominica Citizenship-by-Investment",
    minDonationAmountMinor: 20_000_000, // US$200,000
    donationCurrency: "USD",
    realEstateAmountMinor: 20_000_000, // US$200,000
    applicationUrl: "https://cbiu.gov.dm/",
    primarySourceUrl: "https://cbiu.gov.dm/",
    visaFreeCount: 144,
    excluded: ["IR", "KP", "AF", "SO", "YE", "RU", "BY", "SD"],
    notes:
      "Among the cheapest CBI programs. Dominica passport visa-free to the UK, Schengen, Singapore, Hong Kong. No residency requirement.",
  },
  {
    destinationIso2: "GD",
    id: "gd_cbi",
    label: "Grenada Citizenship-by-Investment",
    minDonationAmountMinor: 23_500_000, // US$235,000
    donationCurrency: "USD",
    realEstateAmountMinor: 27_000_000, // US$270,000
    applicationUrl: "https://cbi.gov.gd/",
    primarySourceUrl: "https://cbi.gov.gd/",
    visaFreeCount: 144,
    excluded: ["IR", "KP", "AF", "SO", "YE", "RU", "BY", "SD"],
    notes:
      "Grenadian citizenship grants visa-free access to China — uniquely among CBIs. Also opens E-2 treaty-investor pathway to the US.",
  },
  {
    destinationIso2: "KN",
    id: "kn_cbi",
    label: "Saint Kitts & Nevis Citizenship-by-Investment",
    minDonationAmountMinor: 25_000_000, // US$250,000
    donationCurrency: "USD",
    realEstateAmountMinor: 40_000_000, // US$400,000
    applicationUrl: "https://www.ciu.gov.kn/",
    primarySourceUrl: "https://www.ciu.gov.kn/",
    visaFreeCount: 154,
    excluded: ["IR", "KP", "AF", "SO", "YE", "RU", "BY", "SD"],
    notes:
      "The original CBI program (1984). Reformed in 2024 — donation threshold raised to US$250k. Strongest visa-free reach of any Caribbean CBI passport.",
  },
  {
    destinationIso2: "LC",
    id: "lc_cbi",
    label: "Saint Lucia Citizenship-by-Investment",
    minDonationAmountMinor: 24_000_000, // US$240,000
    donationCurrency: "USD",
    realEstateAmountMinor: 30_000_000, // US$300,000
    applicationUrl: "https://www.cipsaintlucia.com/",
    primarySourceUrl: "https://www.cipsaintlucia.com/",
    visaFreeCount: 146,
    excluded: ["IR", "KP", "AF", "SO", "YE", "RU", "BY", "SD"],
    notes:
      "The newest of the Caribbean programs (2015). 90-day decision SLA. Family includes spouse, children under 30, parents over 55.",
  },
  {
    destinationIso2: "VU",
    id: "vu_dsp",
    label: "Vanuatu Development Support Programme (CBI)",
    minDonationAmountMinor: 13_000_000, // US$130,000 single
    donationCurrency: "USD",
    realEstateAmountMinor: null,
    applicationUrl: "https://citizenship.gov.vu/",
    primarySourceUrl: "https://citizenship.gov.vu/",
    visaFreeCount: 96,
    excluded: ["IR", "KP", "AF", "SO", "YE", "RU", "BY", "SD"],
    notes:
      "Cheapest CBI worldwide. Fastest processing (30–60 days). EU revoked Vanuatu's Schengen visa-free access in 2022 due to perceived due-diligence weakness — a major caveat. The Vanuatu Citizenship Office accepts applications only through licensed agents; we link to the government office that authorises them, not to any specific agent.",
  },
];

const VALID_ISO = new Set(COUNTRY_LIST.map((c) => c.iso2));

export const caribbeanCbiAdapter: Adapter = {
  metadata: {
    id: "caribbean_cbi",
    name: "Caribbean Citizenship-by-Investment programs",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: PROGRAMS.map((p) => p.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/caribbean_cbi.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return {
      rawText: JSON.stringify({ programs: PROGRAMS.map((p) => p.id) }),
      fetchUrl: "manual://caribbean_cbi",
    };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const program of PROGRAMS) {
      if (!VALID_ISO.has(program.destinationIso2)) continue;
      const excludedSet = new Set(program.excluded);

      for (const c of COUNTRY_LIST) {
        if (c.iso2 === program.destinationIso2) continue;
        if (excludedSet.has(c.iso2)) continue;

        const realEstateNote =
          program.realEstateAmountMinor != null
            ? `OR US$${(program.realEstateAmountMinor / 100).toLocaleString("en")} approved real estate (held 5+ years)`
            : "Donation-only; no real-estate alternative";

        records.push({
          passportIso2: c.iso2,
          destinationIso2: program.destinationIso2,
          purpose: "family", // CBI is closest to a residency-/citizenship-acquisition path
          status: "embassy_visa",
          label: program.label,
          maxStayDays: null, // permanent citizenship
          validityDays: null,
          entriesAllowed: "permanent",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "authorised CBI agent / consulate",
          requirements: [
            `Minimum donation: US$${(program.minDonationAmountMinor / 100).toLocaleString("en")} (single applicant)`,
            realEstateNote,
            "Source-of-funds documentation showing the wealth was lawfully acquired",
            "International background check (criminal history, sanctions screening)",
            "Family — spouse, dependent children, dependent parents — typically included on the same file at additional fees",
            "No physical residency requirement for most programs (Antigua requires 5 days over 5 years)",
          ],
          processingTimeDaysMin: 90,
          processingTimeDaysMax: 180,
          applicationUrl: program.applicationUrl,
          primarySourceUrl: program.primarySourceUrl,
          fees: [
            {
              kind: "base",
              amountMinor: program.minDonationAmountMinor,
              currency: program.donationCurrency,
              asOf: "2026-05-10",
              label: "Government donation (single applicant)",
              optional: false,
            },
            {
              kind: "service",
              amountMinor: 5_000_000, // US$50,000
              currency: "USD",
              asOf: "2026-05-10",
              label: "Authorised-agent / due-diligence / processing fees (typical range)",
              optional: true,
            },
          ],
          notes:
            `${program.notes} Visa-free travel to ~${program.visaFreeCount} countries on completion. ` +
            "Citizenship-by-investment is legal but politically contentious — EU restricted Schengen access for some CBI passports in 2024–2025.",
        });
      }
    }
    return { records };
  },
};
