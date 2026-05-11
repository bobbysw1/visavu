/**
 * Transit-visa total-coverage adapter.
 *
 * Most countries fold transit into the tourist policy — a visa-free
 * tourism arrival also covers airport transit. The exceptions are
 * countries with restrictive transit regimes (China, Russia, Saudi
 * Arabia, the US, the UK for visa-required nationals, the Schengen
 * Airport Transit Visa for 13 specific nationalities).
 *
 * Programs covered (11):
 *   US C-1 Transit Visa
 *   UK Direct Airside Transit (DATV) + Visitor in Transit
 *   Schengen Airport Transit Visa (ATV) — restricted to 13 specific
 *     nationalities under Reg 810/2009 Annex IV
 *   CN 144-hour Transit Without Visa (TWOV)
 *   CN 10-day Transit Without Visa (since 2024)
 *   RU 72-hour Visa-Free Transit
 *   AE 96-hour Transit Visa
 *   SA Transit Visa (Stopover)
 *   SG Visa-Free Transit Facility (VFTF — 96 hours)
 *   JP Shore Pass / Transit Visa
 *   KR K-ETA Transit Exemption
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

// Schengen ATV is restricted to 13 nationalities under Reg 810/2009 Annex IV
// (plus additional list at the Schengen state's discretion).
const SCHENGEN_ATV_REQUIRED = new Set([
  "AF", "BD", "CD", "ER", "ET", "GH", "IR", "IQ", "NG", "PK", "SO", "LK", "SY",
]);

// Visa-required nationalities for UK DATV (subset that also need a UK visa
// for entry — most major-economy passports transit visa-free).
const UK_DATV_VISA_REQUIRED = new Set([
  "AF", "AL", "AM", "AZ", "BD", "BY", "BO", "BA", "BI", "KH", "CM", "CN", "CO",
  "CU", "DO", "EC", "EG", "ER", "ET", "GE", "GH", "GT", "HN", "IN", "ID", "IR",
  "IQ", "JM", "JO", "KZ", "KE", "XK", "KG", "LA", "LB", "LR", "LY", "MK", "MG",
  "MW", "ML", "MR", "MD", "MN", "ME", "MA", "MZ", "MM", "NA", "NP", "NI", "NE",
  "NG", "KP", "OM", "PK", "PS", "PE", "PH", "RU", "RW", "SN", "RS", "SL", "SO",
  "ZA", "LK", "SD", "SR", "SY", "TJ", "TZ", "TH", "TG", "TN", "TR", "TM", "UG",
  "UA", "UZ", "VE", "VN", "YE", "ZM", "ZW",
]);

type TransitVisa = {
  iso2: string;
  label: string;
  status: "embassy_visa" | "e_visa" | "visa_free";
  applicationUrl: string;
  primarySourceUrl: string;
  feeMinor: number;
  feeCurrency: string;
  processingDaysMin: number;
  processingDaysMax: number;
  maxStayDays: number;
  validityDays: number;
  requirements: string[];
  notes: string;
  /** Restrict to specific passport nationalities only. */
  restrictedTo?: Set<string>;
};

const TRANSIT_VISAS: TransitVisa[] = [
  {
    iso2: "US",
    label: "C-1 Transit Visa — United States",
    status: "embassy_visa",
    applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/other-visa-categories/transit-crew-visa.html",
    primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/other-visa-categories/transit-crew-visa.html",
    feeMinor: 18500,
    feeCurrency: "USD",
    processingDaysMin: 14,
    processingDaysMax: 90,
    maxStayDays: 29,
    validityDays: 3650,
    requirements: [
      "Required for any passenger transiting US territory by air or sea who isn't eligible for ESTA / a tourist visa",
      "Visa Waiver Program (ESTA) nationalities transit visa-free up to 90 days — no C-1 needed",
      "C-1 is for transit only (immediate continuous journey); not a tourist visa",
      "DS-160 + interview at US embassy / consulate",
      "Proof of onward ticket within 29 days",
      "C-1/D combo issued routinely for crew members",
      "Most international transits at US hubs (LAX, JFK, MIA, SFO) require clearing immigration — US has no truly 'airside' transit",
    ],
    notes: "The US is unusual — there is NO airside transit. Every traveller transiting the US clears immigration and customs, then re-checks bags and goes through security again. This trips up many travellers expecting Singapore-style airside transit.",
  },
  {
    iso2: "GB",
    label: "Direct Airside Transit Visa (DATV) — United Kingdom",
    status: "embassy_visa",
    applicationUrl: "https://www.gov.uk/transit-visa",
    primarySourceUrl: "https://www.gov.uk/transit-visa",
    feeMinor: 3500,
    feeCurrency: "GBP",
    processingDaysMin: 14,
    processingDaysMax: 45,
    maxStayDays: 1,
    validityDays: 180,
    requirements: [
      "DATV: needed by ~80 visa-required nationalities even for an airside stop at LHR / LGW / MAN — for connections that DON'T require passing UK immigration",
      "Visitor in Transit (£35 fee, 48-hour stay): for travellers who DO need to pass UK immigration en route — e.g. switching airport between LHR and LCY, or overnight transit",
      "Onward flight booking within 24 hours (DATV) / 48 hours (Visitor in Transit)",
      "Valid passport + visa for the final destination",
      "Some exemptions: holders of a US C-1/D, Canadian visa, US Permanent Resident Card, Schengen visa, EU/EEA national, etc.",
      "Apply at gov.uk before travel; visa-required nationals can't get this on arrival",
    ],
    notes: "The DATV vs Visitor in Transit distinction trips up travellers — DATV is airside only (you stay in the airport's transit zone), Visitor in Transit lets you pass UK immigration. Wrong choice = denied boarding by the airline.",
    restrictedTo: UK_DATV_VISA_REQUIRED,
  },
  {
    iso2: "FR",
    label: "Schengen Airport Transit Visa (ATV / VTA) — Schengen Area",
    status: "embassy_visa",
    applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/airport-transit",
    primarySourceUrl: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en",
    feeMinor: 9000,
    feeCurrency: "EUR",
    processingDaysMin: 15,
    processingDaysMax: 60,
    maxStayDays: 1,
    validityDays: 180,
    requirements: [
      "Required by 13 nationalities under EU Reg 810/2009 Annex IV: AF, BD, CD, ER, ET, GH, IR, IQ, NG, PK, SO, LK, SY",
      "Some Schengen states extend this to a longer national-list (e.g. France adds 24 more, Germany adds several)",
      "ATV is airside only — you stay in the transit zone, you do NOT enter Schengen",
      "Holders of a regular Schengen visa, US / UK / IE / CA / AU / NZ / JP visa, residency permits in those countries are typically exempt even from the Annex IV list",
      "Apply at the consulate of the Schengen state of transit",
      "Onward ticket required within 24 hours",
    ],
    notes: "The Annex IV list and per-state extensions create a complex matrix — same passport may need ATV in Paris but not Frankfurt, depending on each state's national supplementary list.",
    restrictedTo: SCHENGEN_ATV_REQUIRED,
  },
  {
    iso2: "CN",
    label: "240-hour Transit Without Visa (TWOV) — China",
    status: "visa_free",
    applicationUrl: "https://www.travelchinaguide.com/embassy/visa/free-72/",
    primarySourceUrl: "https://www.nia.gov.cn/",
    feeMinor: 0,
    feeCurrency: "USD",
    processingDaysMin: 0,
    processingDaysMax: 0,
    maxStayDays: 10,
    validityDays: 1,
    requirements: [
      "Available to passport holders of ~54 countries (including US, UK, Schengen, most of EU, AU, NZ, JP, KR)",
      "Expanded from 144 hours to 10 days (240 hours) in December 2024",
      "Must enter and exit via the same port of entry region (24 regions covering most major cities now)",
      "Onward flight to a third country (not your origin country) within 10 days",
      "Permitted: tourism, business meetings, visits within the approved region",
      "Apply on arrival at the immigration counter — no advance application",
      "Stay limited to the approved transit regions (Beijing, Shanghai, Guangzhou, Chengdu, etc.)",
    ],
    notes: "China's 240-hour TWOV (extended from 144 hours in Dec 2024) is now one of the world's most generous transit policies. Plus a separate visa-free entry programme for ~38 nationalities (Schengen members, AU, NZ, JP, KR, etc.) gives 30-day stays.",
  },
  {
    iso2: "RU",
    label: "72-hour Visa-Free Transit (St Petersburg / Kaliningrad e-Visa) — Russia",
    status: "e_visa",
    applicationUrl: "https://evisa.kdmid.ru/",
    primarySourceUrl: "https://www.mid.ru/en/",
    feeMinor: 5200,
    feeCurrency: "USD",
    processingDaysMin: 4,
    processingDaysMax: 7,
    maxStayDays: 16,
    validityDays: 60,
    requirements: [
      "Russia's general e-Visa programme covers transit, tourism, business, humanitarian, sports for ~50+ nationalities",
      "Stay up to 16 days for tourism / transit purposes",
      "Apply at evisa.kdmid.ru — 4 days standard processing",
      "Visa-required for most non-CIS, non-friendly nationalities (US, UK, most of Western Europe in current context)",
      "St Petersburg & Kaliningrad have separate 72-hour visa-free entry for tour group travellers (cruise / ferry arrivals)",
      "Limited operational status: many Western consulates closed since 2022; processing times unpredictable",
    ],
    notes: "Sanctions-era complications: many Western Europeans face significantly tightened scrutiny and longer processing times. The 72-hour visa-free for St Petersburg / Kaliningrad is essentially limited to organised tour-group cruise / ferry arrivals.",
  },
  {
    iso2: "AE",
    label: "96-hour Transit Visa — UAE",
    status: "e_visa",
    applicationUrl: "https://www.emirates.com/english/before-you-fly/visa-passport-information/transit-visa.aspx",
    primarySourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/transit-visa",
    feeMinor: 5000,
    feeCurrency: "AED",
    processingDaysMin: 2,
    processingDaysMax: 4,
    maxStayDays: 4,
    validityDays: 30,
    requirements: [
      "Two tiers: 48-hour Transit Visa (free) and 96-hour Transit Visa (paid)",
      "Sponsored by the carrier (Emirates / Etihad most commonly, but flydubai, Air Arabia, RAK Airways also)",
      "Required only if you can't enter the UAE visa-free (many major economies enter visa-on-arrival)",
      "Permitted: enter Dubai / Abu Dhabi / Sharjah airside or land area for the transit duration",
      "Apply through the carrier at the time of ticket purchase",
      "Cannot work; must depart within the transit window",
      "Stays beyond 96 hours require a regular UAE entry permit / visa",
    ],
    notes: "Emirates and Etihad heavily market their UAE transit programmes — the 96-hour visa makes long layovers in Dubai / Abu Dhabi practical for sightseeing. Most major-economy nationalities (US, UK, AU, NZ, JP, KR, Schengen, etc.) get visa-on-arrival anyway so don't need a separate transit visa.",
  },
  {
    iso2: "SA",
    label: "Stopover (Transit) Visa — Saudi Arabia",
    status: "e_visa",
    applicationUrl: "https://stopover.sa/",
    primarySourceUrl: "https://www.visitsaudi.com/en/plan-and-book/visa-and-passport",
    feeMinor: 30000,
    feeCurrency: "USD",
    processingDaysMin: 1,
    processingDaysMax: 7,
    maxStayDays: 4,
    validityDays: 90,
    requirements: [
      "96-hour Stopover Visa — free with a Saudia or flyadeal connecting ticket through Jeddah / Riyadh / Dammam / Medina",
      "Permitted: tourism activities, Umrah (with separate Umrah authorisation), business meetings",
      "Visit Saudi Arabia (general tourism eVisa) is also available for ~65 nationalities at visa.visitsaudi.com — covers transit + tourism",
      "Onward ticket out of Saudi Arabia within 96 hours required",
      "Single-entry only; cannot extend within Saudi Arabia",
      "Pilgrim Visa (Hajj / Umrah) is separate — Stopover allows Umrah but not Hajj",
    ],
    notes: "Saudia launched the Stopover Visa as part of Vision 2030 — a clear push to grow Saudi tourism through Jeddah's airport. Pair with a stopover at Medina airport for Umrah pilgrims in transit.",
  },
  {
    iso2: "SG",
    label: "Visa-Free Transit Facility (VFTF) — Singapore",
    status: "visa_free",
    applicationUrl: "https://www.ica.gov.sg/enter-transit-depart/transiting-singapore/transit-singapore",
    primarySourceUrl: "https://www.ica.gov.sg/",
    feeMinor: 0,
    feeCurrency: "SGD",
    processingDaysMin: 0,
    processingDaysMax: 0,
    maxStayDays: 4,
    validityDays: 1,
    requirements: [
      "Available to certain visa-required nationalities (PRC, India, Russia, Ukraine, Belarus, etc.) carrying a valid visa or residence card of US / UK / Canada / Australia / Japan / NZ / Schengen / Germany",
      "Allows 96-hour transit through Singapore — clear immigration and visit Singapore during your layover",
      "Apply at the immigration counter on arrival; no advance application",
      "Onward flight booking out of Singapore within 96 hours",
      "Single-entry — once you leave you cannot re-enter on the same VFTF",
      "Most major-economy nationalities (US, UK, EU, AU, NZ, JP, KR etc.) already enter Singapore visa-free for 30-90 days, so don't need VFTF",
    ],
    notes: "Singapore's VFTF is a quiet superpower for travellers from visa-required countries who hold a Schengen / US / UK / similar visa — you can break a long layover with a Singapore sightseeing day with no advance application.",
  },
  {
    iso2: "JP",
    label: "Shore Pass / Transit Without Visa — Japan",
    status: "visa_free",
    applicationUrl: "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    primarySourceUrl: "https://www.mofa.go.jp/",
    feeMinor: 0,
    feeCurrency: "JPY",
    processingDaysMin: 0,
    processingDaysMax: 0,
    maxStayDays: 3,
    validityDays: 1,
    requirements: [
      "Shore Pass: up to 72 hours (3 days) for travellers transiting Japan with a valid onward ticket — even visa-required nationalities can use this",
      "Apply at the immigration counter on arrival (no advance application)",
      "Valid passport, onward ticket, proof of accommodation",
      "Cannot work or change to another visa during the shore pass period",
      "Most major-economy nationalities enter Japan visa-free for 90 days so don't need a Shore Pass — it's for visa-required nationals (Russia, China, India, etc.)",
    ],
    notes: "Japanese immigration is famously efficient — Shore Pass approvals are typically instant at the counter. Even Chinese / Russian / Indian travellers can break a Tokyo-via-Narita stopover for a day of sightseeing.",
  },
  {
    iso2: "KR",
    label: "K-ETA Transit Exemption + 30-day Transit Tourism — South Korea",
    status: "visa_free",
    applicationUrl: "https://www.k-eta.go.kr/portal/apply/index.do",
    primarySourceUrl: "https://www.hikorea.go.kr/",
    feeMinor: 0,
    feeCurrency: "USD",
    processingDaysMin: 0,
    processingDaysMax: 1,
    maxStayDays: 30,
    validityDays: 1,
    requirements: [
      "Visa-free transit for many nationalities: continue to a third country within 30 days, do not require a visa for that third country, no Korean stay over 30 days",
      "B-2 Transit Visa for nationalities requiring a Korean visa: typically 30 days, single entry",
      "K-ETA (Korea Electronic Travel Authorization) — required by most visa-free nationalities for any Korean entry including transit; ~$10 fee; valid 3 years",
      "K-ETA exemption: 22 countries (US, UK, JP, AU, NZ, DE, FR, etc.) through end-2025 — confirm current status before travel",
      "Jeju Island has separate visa-free regime: 30 days for most nationalities",
      "Cannot work on transit / B-2",
    ],
    notes: "Korea announced extended K-ETA exemption for 22 countries through end-2025. Even nationalities normally needing K-ETA can get on a 'transit tour' programme that buses them into Seoul / Incheon during long layovers.",
  },
];

export const totalCoverageTransitAdapter: Adapter = {
  metadata: {
    id: "total_coverage_transit",
    name: "Total coverage — transit visas (11 programmes: airside transit, TWOV, stopover)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 60 * 24 * 60 * 60 * 1000,
    primaryUrls: TRANSIT_VISAS.map((v) => v.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_transit.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_transit" }), fetchUrl: "manual://total_coverage_transit" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      for (const v of TRANSIT_VISAS) {
        if (passport === v.iso2) continue;
        if (v.restrictedTo && !v.restrictedTo.has(passport)) continue;

        records.push({
          passportIso2: passport,
          destinationIso2: v.iso2,
          purpose: "transit",
          status: v.status,
          label: v.label,
          maxStayDays: v.maxStayDays,
          validityDays: v.validityDays,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: v.status === "embassy_visa",
          biometricsLocation: v.status === "embassy_visa" ? "Destination consulate / Visa Application Centre" : undefined,
          requirements: v.requirements,
          processingTimeDaysMin: v.processingDaysMin,
          processingTimeDaysMax: v.processingDaysMax,
          applicationUrl: v.applicationUrl,
          primarySourceUrl: v.primarySourceUrl,
          fees: v.feeMinor > 0
            ? [{ kind: "base", amountMinor: v.feeMinor, currency: v.feeCurrency, asOf: "2026-05-11", label: "Transit visa fee", optional: false }]
            : [],
          notes: v.notes,
        });
      }
    }

    return { records };
  },
};
