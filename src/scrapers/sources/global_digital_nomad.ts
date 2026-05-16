/**
 * Global Digital Nomad / Remote Work visa adapter.
 *
 * The pandemic kicked off ~50 distinct "remote-worker" or "digital-nomad"
 * residence permits worldwide — most are open to any nationality with proof
 * of foreign-earned income above a threshold. We encode the major programs
 * here as a single adapter; each emits records for ALL passports (since
 * eligibility is income-based, not nationality-based, except where noted).
 *
 * Sources are linked per-program — every URL is the destination's official
 * portal or MFA page.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

type NomadProgram = {
  destinationIso2: string;
  id: string;
  label: string;
  /** Minimum monthly income required, in destination's typical reporting currency. */
  monthlyIncomeAmount: number;
  monthlyIncomeCurrency: string;
  /** Application fee in minor units. */
  feeAmountMinor: number;
  feeCurrency: string;
  stayDays: number;
  applicationUrl: string;
  primarySourceUrl: string;
  /** Set of ISO2 passports excluded — most programs accept all nationalities. */
  excluded?: string[];
  /** Special requirements / restrictions for the readout. */
  specialNotes: string;
};

/** OECD member ISO2 codes — used for Latvia digital-nomad eligibility filter. */
const OECD_MEMBERS = new Set([
  "AU", "AT", "BE", "CA", "CL", "CO", "CR", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IS", "IE", "IL", "IT", "JP", "KR", "LV", "LT", "LU",
  "MX", "NL", "NZ", "NO", "PL", "PT", "SK", "SI", "ES", "SE", "CH", "TR",
  "GB", "US",
]);

const PROGRAMS: NomadProgram[] = [
  // ---------- Caribbean / Atlantic Cluster ----------
  {
    destinationIso2: "VG",
    id: "vg_work_from_here",
    label: "Work From Here — British Virgin Islands",
    monthlyIncomeAmount: 1500,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 150000, // US$1,500
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://bvi.gov.vg/content/work-here-programme",
    primarySourceUrl: "https://bvi.gov.vg/content/work-here-programme",
    specialNotes:
      "1-year remote-work permit with possibility of extension. Spouse/partner and dependent children may accompany.",
  },
  {
    destinationIso2: "BM",
    id: "bm_work_from_bermuda",
    label: "Work From Bermuda — Year-Long Residential Certificate",
    monthlyIncomeAmount: 0, // not stated
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 26300,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://www.gov.bm/work-from-bermuda-certificate",
    primarySourceUrl: "https://www.gov.bm/work-from-bermuda-certificate",
    specialNotes:
      "Open to remote workers and university students. No income threshold but applicants must show employment + means of support.",
  },
  {
    destinationIso2: "KY",
    id: "ky_global_citizen",
    label: "Global Citizen Concierge — Cayman Islands",
    monthlyIncomeAmount: 100000 / 12,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 150000, // US$1,500
    feeCurrency: "USD",
    stayDays: 730,
    applicationUrl: "https://www.gov.ky/visiting/global-citizen-programme",
    primarySourceUrl: "https://www.gov.ky/visiting/global-citizen-programme",
    specialNotes:
      "Annual income threshold of US$100k single / US$150k couple / US$180k family. Renewable up to 24 months total.",
  },
  {
    destinationIso2: "AI",
    id: "ai_work_from_anguilla",
    label: "Work From Anguilla — Remote-Work Permit",
    monthlyIncomeAmount: 0,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 200000,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://ivisitanguilla.com/work-from-anguilla/",
    primarySourceUrl: "https://ivisitanguilla.com/work-from-anguilla/",
    specialNotes:
      "12-month residence for remote workers and full-time students. US$2,000 for individuals / US$3,000 for families of 4.",
  },
  {
    destinationIso2: "AG",
    id: "ag_nomad_residence",
    label: "Nomad Digital Residence — Antigua & Barbuda",
    monthlyIncomeAmount: 50000 / 12,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 150000,
    feeCurrency: "USD",
    stayDays: 730,
    applicationUrl: "https://nomaddigitalresidence.com/",
    primarySourceUrl: "https://nomaddigitalresidence.com/",
    specialNotes: "Income threshold US$50k/year. 2-year permit, no income tax for non-residents.",
  },
  {
    destinationIso2: "BB",
    id: "bb_welcome_stamp",
    label: "Welcome Stamp — Barbados",
    monthlyIncomeAmount: 50000 / 12,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 200000,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://www.barbadoswelcomestamp.bb/",
    primarySourceUrl: "https://www.barbadoswelcomestamp.bb/",
    specialNotes:
      "Income threshold US$50k/year. Among the longest-running remote-work visas — launched 2020.",
  },
  {
    destinationIso2: "CW",
    id: "cw_at_home",
    label: "@HOME in Curaçao — Remote-Work Visa",
    monthlyIncomeAmount: 0,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 29400,
    feeCurrency: "USD",
    stayDays: 180,
    applicationUrl: "https://www.curacao.com/en/discover/at-home-in-curacao/",
    primarySourceUrl: "https://www.curacao.com/en/discover/at-home-in-curacao/",
    specialNotes: "6-month permit. Spouse/partner and children can accompany under the same fee.",
  },
  {
    destinationIso2: "DM",
    id: "dm_work_in_nature",
    label: "Work in Nature — Dominica Extended Stay Visa",
    monthlyIncomeAmount: 70000 / 12,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 80000,
    feeCurrency: "USD",
    stayDays: 540,
    applicationUrl: "https://www.dominica.gov.dm/extended-stay/",
    primarySourceUrl: "https://www.dominica.gov.dm/extended-stay/",
    specialNotes: "18 months, family-friendly, US$70k/year income required.",
  },

  // ---------- European cluster ----------
  {
    destinationIso2: "EE",
    id: "ee_digital_nomad",
    label: "Digital Nomad Visa — Estonia",
    monthlyIncomeAmount: 4500,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 10000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://e-resident.gov.ee/nomadvisa/",
    primarySourceUrl: "https://e-resident.gov.ee/nomadvisa/",
    specialNotes:
      "Income threshold €4,500/month. Estonia pioneered the digital-nomad visa concept in 2020. Distinct from e-Residency (a digital ID, not a physical visa).",
  },
  {
    destinationIso2: "HR",
    id: "hr_digital_nomad",
    label: "Digital Nomad Residence Permit — Croatia",
    monthlyIncomeAmount: 2870,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 7000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://mup.gov.hr/aliens-281621/temporary-stay-of-digital-nomads/286833",
    primarySourceUrl: "https://mup.gov.hr/aliens-281621/temporary-stay-of-digital-nomads/286833",
    specialNotes: "Non-renewable directly — must wait 6 months between permits. Tax exempt on foreign income.",
  },
  {
    destinationIso2: "GR",
    id: "gr_digital_nomad",
    label: "Digital Nomad Visa — Greece",
    monthlyIncomeAmount: 3500,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 7500,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://www.mfa.gr/en/visas/visas-for-foreigners-traveling-to-greece/national-visas-type-d/digital-nomad-visa.html",
    primarySourceUrl: "https://www.mfa.gr/en/visas/visas-for-foreigners-traveling-to-greece/national-visas-type-d/digital-nomad-visa.html",
    specialNotes: "Greece offers a 50% tax break in the first year for digital nomads moving from non-EU.",
  },
  {
    destinationIso2: "HU",
    id: "hu_white_card",
    label: "White Card — Hungary Digital Nomad",
    monthlyIncomeAmount: 3000,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 11000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://oif.gov.hu/index.php?option=com_k2&view=item&layout=item&id=988",
    primarySourceUrl: "https://oif.gov.hu/index.php?option=com_k2&view=item&layout=item&id=988",
    specialNotes:
      "Renewable once for an additional year. Cannot be used to work for a Hungarian employer or shareholding entity.",
  },
  {
    destinationIso2: "IT",
    id: "it_digital_nomad",
    label: "Digital Nomad Visa — Italy",
    monthlyIncomeAmount: 2700,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 11600,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://vistoperitalia.esteri.it/",
    primarySourceUrl: "https://vistoperitalia.esteri.it/",
    specialNotes:
      "Launched April 2024. €28k/year minimum income. Spouse and children may accompany.",
  },
  {
    destinationIso2: "LV",
    id: "lv_digital_nomad",
    label: "Long-stay Digital Nomad — Latvia",
    monthlyIncomeAmount: 4000,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 6000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://www.pmlp.gov.lv/en/long-stay-visa-digital-nomads",
    primarySourceUrl: "https://www.pmlp.gov.lv/en/long-stay-visa-digital-nomads",
    specialNotes: "Open only to nationals of OECD member countries. Renewable for one additional year.",
    excluded: COUNTRY_LIST.map((c) => c.iso2).filter((iso) => !OECD_MEMBERS.has(iso)),
  },
  {
    destinationIso2: "MT",
    id: "mt_nomad_residence",
    label: "Nomad Residence Permit — Malta",
    monthlyIncomeAmount: 3500,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 30000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://nomad.residencymalta.gov.mt/",
    primarySourceUrl: "https://nomad.residencymalta.gov.mt/",
    specialNotes: "€42,000 annual income required. Renewable up to 4 years total.",
  },
  {
    destinationIso2: "RO",
    id: "ro_digital_nomad",
    label: "Digital Nomad Visa — Romania",
    monthlyIncomeAmount: 3700,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 12000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://www.mae.ro/en/node/2113",
    primarySourceUrl: "https://www.mae.ro/en/node/2113",
    specialNotes: "Income must be at least 3x Romanian average gross salary (~€3,700/month).",
  },
  {
    destinationIso2: "TR",
    id: "tr_digital_nomad",
    label: "Digital Nomad Visa — Türkiye",
    monthlyIncomeAmount: 3000,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 10000,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://digitalnomads.gov.tr/",
    primarySourceUrl: "https://digitalnomads.gov.tr/",
    specialNotes: "Launched April 2024. Income threshold US$3,000/month.",
  },
  {
    destinationIso2: "PT",
    id: "pt_d8",
    label: "D8 Digital Nomad Visa — Portugal",
    monthlyIncomeAmount: 3480,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 9000,
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://vistos.mne.gov.pt/en/national-visas/general-information",
    primarySourceUrl: "https://vistos.mne.gov.pt/en/national-visas/general-information",
    specialNotes:
      "4x Portuguese minimum wage required (~€3,480/month). Path to permanent residency after 5 years. Distinct from D7 (passive-income).",
  },

  // ---------- Indian Ocean / Atlantic Africa ----------
  {
    destinationIso2: "MU",
    id: "mu_premium",
    label: "Premium Visa — Mauritius",
    monthlyIncomeAmount: 0,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 0,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://passport.govmu.org/Pages/Premium-Visa.aspx",
    primarySourceUrl: "https://passport.govmu.org/Pages/Premium-Visa.aspx",
    specialNotes:
      "Free, 1-year remote work permit. Open to anyone with foreign income. Cannot work for Mauritian companies.",
  },
  {
    destinationIso2: "SC",
    id: "sc_workcation",
    label: "Workcation Programme — Seychelles",
    monthlyIncomeAmount: 0,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 4500,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://workcation.gov.sc/",
    primarySourceUrl: "https://workcation.gov.sc/",
    specialNotes: "1-year stay for remote workers and self-employed. Must hold travel insurance.",
  },
  {
    destinationIso2: "CV",
    id: "cv_remote_working",
    label: "Remote Working Cabo Verde",
    monthlyIncomeAmount: 1500,
    monthlyIncomeCurrency: "EUR",
    feeAmountMinor: 5400,
    feeCurrency: "EUR",
    stayDays: 180,
    applicationUrl: "https://www.ease.gov.cv/",
    primarySourceUrl: "https://www.ease.gov.cv/",
    specialNotes: "Income €1,500/month single / €2,700/month family. Renewable once for 6 more months.",
  },

  // ---------- Latin America ----------
  {
    destinationIso2: "BR",
    id: "br_digital_nomad",
    label: "Digital Nomad Visa — Brazil",
    monthlyIncomeAmount: 1500,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 10000,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://www.gov.br/mre/en/consular-portal/visas/temporary-visas-vitem/digital-nomad-vitem-xiv",
    primarySourceUrl: "https://www.gov.br/mre/en/consular-portal/visas/temporary-visas-vitem/digital-nomad-vitem-xiv",
    specialNotes: "VITEM XIV. US$1,500/month minimum or US$18k savings. Renewable for one additional year.",
  },
  {
    destinationIso2: "CO",
    id: "co_digital_nomad",
    label: "Digital Nomad Visa — Colombia (V Visa)",
    monthlyIncomeAmount: 720,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 17000,
    feeCurrency: "USD",
    stayDays: 730,
    applicationUrl: "https://www.cancilleria.gov.co/en/procedures_services/visas",
    primarySourceUrl: "https://www.cancilleria.gov.co/en/procedures_services/visas",
    specialNotes:
      "Surprisingly low income threshold (~3x Colombian minimum wage). 2-year stay. Open to all.",
  },
  {
    destinationIso2: "CR",
    id: "cr_rentista",
    label: "Rentista Visa — Costa Rica",
    monthlyIncomeAmount: 2500,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 25000,
    feeCurrency: "USD",
    stayDays: 730,
    applicationUrl: "https://www.migracion.go.cr/Paginas/Permanencia/Categorias-Migratorias/Rentista.aspx",
    primarySourceUrl: "https://www.migracion.go.cr/Paginas/Permanencia/Categorias-Migratorias/Rentista.aspx",
    specialNotes:
      "Stable income of US$2,500/month for 2+ years OR US$60k bank deposit. Renewable indefinitely; path to permanent residency after 3 years.",
  },
  {
    destinationIso2: "MX",
    id: "mx_temporary_resident",
    label: "Temporary Resident Visa — Mexico",
    monthlyIncomeAmount: 4500,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 5500,
    feeCurrency: "USD",
    stayDays: 1460, // 4 years
    applicationUrl: "https://www.gob.mx/inm",
    primarySourceUrl: "https://www.gob.mx/inm",
    specialNotes:
      "Up to 4 years renewable. Income ~US$4,500/month OR US$74k savings. Path to permanent residency after 4 years.",
  },
  {
    destinationIso2: "AR",
    id: "ar_rentista",
    label: "Rentista Visa — Argentina",
    monthlyIncomeAmount: 2400,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 30000,
    feeCurrency: "USD",
    stayDays: 365,
    applicationUrl: "https://www.argentina.gob.ar/interior/migraciones",
    primarySourceUrl: "https://www.argentina.gob.ar/interior/migraciones",
    specialNotes:
      "Stable foreign income of ~US$2,400/month. Renewable annually. Argentina is among the easiest countries to obtain permanent residency (3 years).",
  },

  // ---------- Asia ----------
  {
    destinationIso2: "ID",
    id: "id_b211a_remote",
    label: "B211A Remote Worker Visa — Indonesia (Bali)",
    monthlyIncomeAmount: 5000,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 15000,
    feeCurrency: "USD",
    stayDays: 180,
    applicationUrl: "https://evisa.imigrasi.go.id/",
    primarySourceUrl: "https://evisa.imigrasi.go.id/",
    specialNotes:
      "B211A is the closest to a digital-nomad visa. The promised 5-year 'Second Home' visa launched in 2024 with a US$130k bank-deposit requirement.",
  },
  {
    destinationIso2: "MY",
    id: "my_de_rantau",
    label: "DE Rantau Nomad Pass — Malaysia",
    monthlyIncomeAmount: 24000 / 12,
    monthlyIncomeCurrency: "USD",
    feeAmountMinor: 100000,
    feeCurrency: "MYR",
    stayDays: 365,
    applicationUrl: "https://mdec.my/derantau",
    primarySourceUrl: "https://mdec.my/derantau",
    specialNotes:
      "Annual income US$24k+. 12 months, renewable for another 12. Spouse and dependents may accompany.",
  },
];

const VALID_ISO = new Set(COUNTRY_LIST.map((c) => c.iso2));

export const globalDigitalNomadAdapter: Adapter = {
  metadata: {
    id: "global_digital_nomad",
    name: "Global Digital Nomad / Remote Work visa programs",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: PROGRAMS.map((p) => p.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/global_digital_nomad.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return {
      rawText: JSON.stringify({ programs: PROGRAMS.map((p) => p.id) }),
      fetchUrl: "manual://global_digital_nomad",
    };
  },

  async parse() {
    const records: ParsedRecord[] = [];
    for (const program of PROGRAMS) {
      if (!VALID_ISO.has(program.destinationIso2)) continue;

      const excludedSet = new Set(program.excluded ?? []);

      for (const c of COUNTRY_LIST) {
        if (c.iso2 === program.destinationIso2) continue;
        if (excludedSet.has(c.iso2)) continue;

        const incomeNote =
          program.monthlyIncomeAmount > 0
            ? `Minimum income: ${formatMoney(program.monthlyIncomeAmount, program.monthlyIncomeCurrency)}/month`
            : "No fixed income threshold — show employment + sufficient savings";

        records.push({
          passportIso2: c.iso2,
          destinationIso2: program.destinationIso2,
          purpose: "work",
          status: "embassy_visa",
          label: program.label,
          maxStayDays: program.stayDays,
          validityDays: program.stayDays,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: program.monthlyIncomeAmount > 0,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          biometricsLocation: null,
          requirements: [
            incomeNote,
            "Employment by a non-resident employer OR self-employed serving non-resident clients",
            "Valid travel / health insurance for the full duration of stay",
            "Clean criminal-record check from country of residence",
            "Cannot work for local employers or earn local-source income",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 60,
          applicationUrl: program.applicationUrl,
          primarySourceUrl: program.primarySourceUrl,
          fees:
            program.feeAmountMinor > 0
              ? [
                  {
                    kind: "base",
                    amountMinor: program.feeAmountMinor,
                    currency: program.feeCurrency,
                    asOf: "2026-05-10",
                    label: "Application fee",
                    optional: false,
                  },
                ]
              : [],
          notes: program.specialNotes,
        });
      }
    }
    if (records.length < 1000) {
      return { records, parseError: `Expected ≥ 1000 records, got ${records.length}.` };
    }
    return { records };
  },
};

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${currency}`;
  }
}
