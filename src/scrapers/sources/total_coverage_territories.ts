/**
 * Dependent-territory inheritance adapter.
 *
 * Most of the world's "zero coverage" destinations are dependent
 * territories that don't issue their own visas — they inherit the
 * metropolitan country's rules (Guam uses US visa law, French Polynesia
 * uses French / Schengen, Greenland uses Danish / Schengen with
 * caveats, etc.).
 *
 * This adapter creates one informational record per (passport,
 * territory) for the relevant purposes, pointing at the parent country's
 * visa portal and adding the territory-specific caveat (e.g. "Guam &
 * CNMI accept the Guam-CNMI Visa Waiver Program for 12 extra countries
 * the standard ESTA doesn't").
 *
 * Status is `embassy_visa` by default (sensible safe choice — caller
 * should verify with the parent country's rules). Notes always explain
 * the divergence where one exists.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST, nameFor } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

type Territory = {
  iso2: string;
  /** ISO2 of the country whose visa rules apply (most of the time). */
  parent: string;
  /** Short description of how the visa policy diverges or aligns. */
  policyNote: string;
  /** Best government link to the territory's own immigration / entry page,
   *  or the parent's if the territory lacks one. */
  applicationUrl: string;
  /** Default status — embassy_visa keeps things honest. Override per
   *  territory if a clearer status applies (e.g. uninhabited → restricted). */
  status?: "embassy_visa" | "visa_free" | "restricted";
  /** Treat as uninhabited — produces a single "no civilian visa" record. */
  uninhabited?: boolean;
  /** Set true for territories whose parent's own citizens still need a permit
   *  (Saint Helena entry permit, Pitcairn licence-to-land). When false
   *  (default), a parent-passport → territory query emits a `visa_free` row
   *  because citizens of the realm have automatic right of entry. */
  parentCitizensNeedPermit?: boolean;
};

// Parent-country mapping + territory-specific notes. Sources: each parent
// country's MFA + the territory's own immigration department where one
// exists (Falklands, Gibraltar, Bermuda etc. all run their own).
const TERRITORIES: Territory[] = [
  // ─────────── United States ───────────
  { iso2: "PR", parent: "US", policyNote: "Puerto Rico is a US territory — same US federal visa policy applies (B1/B2, ESTA, etc.). No separate entry check from mainland US.", applicationUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { iso2: "GU", parent: "US", policyNote: "Guam uses US federal visa law plus the Guam-CNMI Visa Waiver Program — adds 12 Asia-Pacific nationalities (Hong Kong, Malaysia, Nauru, Papua New Guinea, etc.) not in standard ESTA.", applicationUrl: "https://www.cbp.gov/travel/international-visitors/visa-waiver-program/gcvwp" },
  { iso2: "MP", parent: "US", policyNote: "Northern Mariana Islands (Saipan) — same as Guam: US federal visa law + Guam-CNMI Visa Waiver Program.", applicationUrl: "https://www.cbp.gov/travel/international-visitors/visa-waiver-program/gcvwp" },
  { iso2: "VI", parent: "US", policyNote: "US Virgin Islands — full US federal visa policy. Travel from mainland US treated as domestic.", applicationUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { iso2: "AS", parent: "US", policyNote: "American Samoa — US federal visa policy with a unique twist: American Samoans are US nationals, not US citizens by birth (don't get a US passport with citizenship).", applicationUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },

  // ─────────── United Kingdom ───────────
  { iso2: "FK", parent: "GB", policyNote: "Falkland Islands run their own immigration. Most short visits don't need a visa (different to UK ETA); long stays require a Falkland Islands work or residence permit.", applicationUrl: "https://www.falklands.gov.fk/policy/customs-and-immigration" },
  { iso2: "GI", parent: "GB", policyNote: "Gibraltar has its own immigration (Civil Status & Registration Office). Aligned with UK policy but operates an independent entry system. Spanish nationals enter under bilateral agreement.", applicationUrl: "https://www.gibraltar.gov.gi/government-departments/civil-status-and-registration-office" },
  { iso2: "BM", parent: "GB", policyNote: "Bermuda is a British Overseas Territory with its own immigration. UK passport holders enter visa-free. Standard visitor stay 90 days; most other nationalities get visa-free entry too, but check the Bermuda Department of Immigration list.", applicationUrl: "https://www.gov.bm/department/immigration" },
  { iso2: "KY", parent: "GB", policyNote: "Cayman Islands operate their own immigration. UK passport holders enter visa-free for up to 30 days (extendable). The Cayman visa-exempt list is broader than the UK's.", applicationUrl: "https://www.exploregov.ky/immigration" },
  { iso2: "VG", parent: "GB", policyNote: "British Virgin Islands run their own immigration. UK passport holders enter visa-free for up to 6 months. Distinct from the US Virgin Islands.", applicationUrl: "https://www.bvi.gov.vg/" },
  { iso2: "AI", parent: "GB", policyNote: "Anguilla is a British Overseas Territory with its own immigration. UK passport holders enter visa-free for up to 3 months. Visa-exempt list is broadly similar to other Caribbean BOTs.", applicationUrl: "https://www.gov.ai/" },
  { iso2: "MS", parent: "GB", policyNote: "Montserrat issues its own visas via the Immigration Department. UK passport holders enter visa-free.", applicationUrl: "https://www.gov.ms/" },
  { iso2: "SH", parent: "GB", parentCitizensNeedPermit: true, policyNote: "Saint Helena, Ascension and Tristan da Cunha — Saint Helena requires an Entry Permit, even for UK passport holders. Charge to land applies.", applicationUrl: "https://www.sainthelena.gov.sh/visiting/immigration/" },
  { iso2: "TC", parent: "GB", policyNote: "Turks and Caicos run their own Immigration Department. Most visa-free nationalities for UK get the same here, but always check — TCI maintains its own list.", applicationUrl: "https://www.gov.tc/immigration/" },
  { iso2: "IO", parent: "GB", policyNote: "British Indian Ocean Territory (Diego Garcia) — closed to civilians. Permit required from the Commissioner; effectively limited to military, contractors, and approved researchers.", applicationUrl: "https://www.gov.uk/government/organisations/the-commissioner-for-the-british-indian-ocean-territory", status: "restricted" },
  { iso2: "PN", parent: "GB", parentCitizensNeedPermit: true, policyNote: "Pitcairn Islands — population ~50. Day-visit landing fee for cruise ship visitors. Anyone staying overnight needs a Licence to Land application weeks in advance.", applicationUrl: "https://www.government.pn/immigration/" },
  { iso2: "GG", parent: "GB", policyNote: "Guernsey is a Crown Dependency, NOT in the UK. Operates the Common Travel Area: UK / Ireland / Channel Islands / Isle of Man move freely between each other, but Guernsey runs its own immigration for non-CTA arrivals.", applicationUrl: "https://www.gov.gg/immigration" },
  { iso2: "JE", parent: "GB", policyNote: "Jersey is a Crown Dependency in the Common Travel Area. Non-CTA arrivals follow UK-aligned visa policy administered locally.", applicationUrl: "https://www.gov.je/immigration/" },
  { iso2: "IM", parent: "GB", policyNote: "Isle of Man is a Crown Dependency in the Common Travel Area. UK visa policy applies for non-CTA arrivals, administered by the Manx Immigration office.", applicationUrl: "https://www.gov.im/immigration/" },

  // ─────────── France (Schengen aligned with caveats) ───────────
  { iso2: "GF", parent: "FR", policyNote: "French Guiana is part of France (DROM) — Schengen visa rules apply. Note: not all Schengen visas auto-cover the DROM, and there's mandatory yellow-fever vaccination.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "MQ", parent: "FR", policyNote: "Martinique is part of France (DROM). Schengen visa policy applies for entry, but a separate visa endorsement for the French Overseas Territories may be required for some nationalities.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "GP", parent: "FR", policyNote: "Guadeloupe is part of France (DROM). Schengen visa applies; some visa types need a specific endorsement for the French Overseas Territories.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "RE", parent: "FR", policyNote: "Réunion is part of France (DROM). Schengen visa applies.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "YT", parent: "FR", policyNote: "Mayotte is part of France (DROM) but has stricter entry rules due to its position near Comoros — additional Mayotte-specific visa endorsement often required even for Schengen-visa holders.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "BL", parent: "FR", policyNote: "Saint-Barthélemy is a French overseas collectivity. Schengen visa applies; arrives via St-Martin or Guadeloupe.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "MF", parent: "FR", policyNote: "Saint-Martin (French part) — French collectivity, Schengen visa applies. Note: Dutch side (Sint Maarten) has separate immigration.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "PM", parent: "FR", policyNote: "Saint-Pierre and Miquelon (off Newfoundland) — French collectivity, NOT in Schengen. Operates its own short-stay visa-waiver list distinct from Schengen and a 90-day stay rule.", applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/" },
  { iso2: "NC", parent: "FR", policyNote: "New Caledonia is a French sui generis collectivity. Schengen visa is NOT automatically valid — most nationalities need a separate New Caledonia visa endorsement.", applicationUrl: "https://www.haut-commissariat.gouv.nc/" },
  { iso2: "PF", parent: "FR", policyNote: "French Polynesia (Tahiti) is a French overseas collectivity. Schengen visa is NOT automatically valid — separate French Polynesia visa endorsement required for many nationalities.", applicationUrl: "https://www.polynesie-francaise.pref.gouv.fr/" },
  { iso2: "WF", parent: "FR", policyNote: "Wallis and Futuna — French collectivity in the South Pacific. Separate visa-policy regime from mainland France; most stays require a specific endorsement.", applicationUrl: "https://www.wallis-et-futuna.gouv.fr/" },

  // ─────────── Netherlands ───────────
  { iso2: "AW", parent: "NL", policyNote: "Aruba is a constituent country of the Kingdom of the Netherlands — runs its own immigration. Many nationalities visa-free for tourism via the Aruba-specific list (broader than Schengen).", applicationUrl: "https://www.dimas.aw/" },
  { iso2: "BQ", parent: "NL", policyNote: "Caribbean Netherlands (Bonaire, Sint Eustatius, Saba) — Dutch public bodies. Dutch / Schengen visa policy applies with island-specific rules in places.", applicationUrl: "https://english.ind.nl/Pages/Caribbean.aspx" },
  { iso2: "SX", parent: "NL", policyNote: "Sint Maarten (Dutch part) is a constituent country of the Kingdom of the Netherlands — separate immigration. Operates its own visa-waiver list.", applicationUrl: "https://www.sintmaartengov.org/" },

  // ─────────── Australia ───────────
  { iso2: "CX", parent: "AU", policyNote: "Christmas Island is an Australian external territory — full Australian visa policy. ETA / eVisitor / Subclass 600 etc. all valid; no separate entry check from Perth.", applicationUrl: "https://immi.homeaffairs.gov.au/" },
  { iso2: "CC", parent: "AU", policyNote: "Cocos (Keeling) Islands — Australian external territory. Full Australian visa policy applies.", applicationUrl: "https://immi.homeaffairs.gov.au/" },
  { iso2: "NF", parent: "AU", policyNote: "Norfolk Island — Australian external territory since 2016 (was formerly self-governing). Full Australian visa policy.", applicationUrl: "https://immi.homeaffairs.gov.au/" },

  // ─────────── Denmark ───────────
  { iso2: "GL", parent: "DK", policyNote: "Greenland is part of the Kingdom of Denmark but NOT in Schengen. Most Schengen visas are NOT valid for Greenland — a separate Greenland-stamped Schengen visa is required.", applicationUrl: "https://nyidanmark.dk/en-GB/Words-and-Concepts/US/Visum/Greenland-and-the-Faroe-Islands" },
  { iso2: "FO", parent: "DK", policyNote: "Faroe Islands are part of the Kingdom of Denmark but NOT in Schengen. Schengen visas need to be specifically endorsed for the Faroes.", applicationUrl: "https://nyidanmark.dk/en-GB/Words-and-Concepts/US/Visum/Greenland-and-the-Faroe-Islands" },

  // ─────────── New Zealand ───────────
  { iso2: "CK", parent: "NZ", policyNote: "Cook Islands — self-governing state in free association with NZ. Cook Islanders hold NZ passports. Visa-free entry for many nationalities; standard NZ rules influence entry policy.", applicationUrl: "https://immigration.gov.ck/" },
  { iso2: "NU", parent: "NZ", policyNote: "Niue is a self-governing state in free association with NZ. Niueans hold NZ passports. Visa-free entry for most nationalities for 30 days.", applicationUrl: "https://niue.nu/" },
  { iso2: "TK", parent: "NZ", policyNote: "Tokelau is a non-self-governing NZ territory. NZ visa policy applies. Access only via charter boat from Samoa — no airport.", applicationUrl: "https://www.immigration.govt.nz/" },

  // ─────────── Norway ───────────
  { iso2: "SJ", parent: "NO", policyNote: "Svalbard operates under the 1920 Svalbard Treaty — visa-FREE for ALL nationalities to live and work, no immigration restrictions. But you must transit through mainland Norway (which is Schengen) to reach it.", applicationUrl: "https://www.udi.no/en/word-definitions/svalbard/", status: "visa_free" },

  // ─────────── Finland ───────────
  { iso2: "AX", parent: "FI", policyNote: "Åland Islands are an autonomous region of Finland — full EU and Schengen membership. Standard Finnish / Schengen visa policy applies.", applicationUrl: "https://migri.fi/en/home" },

  // ─────────── Disputed / contested ───────────
  { iso2: "PS", parent: "IL", policyNote: "Palestinian Territories (West Bank + Gaza) — access controlled by Israel. Entry via Allenby Bridge from Jordan or Israeli airports; many nationalities face additional questioning. Gaza largely inaccessible since 2007.", applicationUrl: "https://www.gov.il/en/departments/ministry_of_interior", status: "restricted" },
  { iso2: "EH", parent: "MA", policyNote: "Western Sahara is administered by Morocco — Moroccan visa policy applies for entry, though much of the territory is disputed (claimed by Polisario Front / SADR).", applicationUrl: "https://www.consulat.ma/" },

  // ─────────── Uninhabited / scientific ───────────
  { iso2: "AQ", parent: "AQ", policyNote: "Antarctica has no permanent population. Civilian visits via Antarctic Treaty signatory countries' tour operators. Most visitors are tourists on IAATO cruises; no traditional visa applies.", applicationUrl: "https://iaato.org/", uninhabited: true },
  { iso2: "BV", parent: "NO", policyNote: "Bouvet Island is an uninhabited Norwegian dependency in the South Atlantic. No civilian access without a Norwegian Polar Institute permit.", applicationUrl: "https://www.npolar.no/", uninhabited: true },
  { iso2: "HM", parent: "AU", policyNote: "Heard Island and McDonald Islands — uninhabited Australian external territory. Access only by permit from the Australian Antarctic Division.", applicationUrl: "https://www.antarctica.gov.au/", uninhabited: true },
  { iso2: "TF", parent: "FR", policyNote: "French Southern and Antarctic Lands (Kerguelen, Crozet, etc.) — uninhabited. Access only by French scientific expedition or rare tourist resupply voyage.", applicationUrl: "https://www.taaf.fr/", uninhabited: true },
  { iso2: "GS", parent: "GB", policyNote: "South Georgia and South Sandwich Islands — no permanent residents (BAS scientific staff only). Access via cruise-ship permit from the GSGSSI Commissioner.", applicationUrl: "https://www.gov.gs/", uninhabited: true },
  { iso2: "UM", parent: "US", policyNote: "US Minor Outlying Islands (Wake, Midway, Howland, Baker, Jarvis, Johnston, Kingman, Navassa, Palmyra) — uninhabited military/wildlife refuges. Visit by special permit only.", applicationUrl: "https://www.fws.gov/refuge/midway-atoll", uninhabited: true },
];

export const totalCoverageTerritoriesAdapter: Adapter = {
  metadata: {
    id: "total_coverage_territories",
    name: "Total coverage — dependent territories (inheritance from parent country with caveats)",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: TERRITORIES.map((t) => t.applicationUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_territories.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_territories" }), fetchUrl: "manual://total_coverage_territories" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      for (const t of TERRITORIES) {
        if (passport === t.iso2) continue;

        const parentName = nameFor(t.parent);
        const tName = nameFor(t.iso2);

        if (t.uninhabited) {
          records.push({
            passportIso2: passport,
            destinationIso2: t.iso2,
            purpose: "tourism",
            status: "restricted",
            label: `${tName} — permit only (uninhabited)`,
            maxStayDays: null,
            entriesAllowed: "single",
            passportValidityMonthsRequired: 6,
            onwardTicketRequired: true,
            proofOfFundsRequired: false,
            proofOfAccommodationRequired: false,
            biometricsRequired: false,
            requirements: [
              t.policyNote,
              `Tourist visits (where allowed at all) require expedition / cruise operator permits, not a traditional visa.`,
              `${tName} has no civilian airport and no resident immigration office.`,
            ],
            applicationUrl: t.applicationUrl,
            primarySourceUrl: t.applicationUrl,
            fees: [],
            notes: `${tName} is uninhabited or limited to research staff. There is no traditional visa channel — see the responsible authority for permit applications.`,
          });
          continue;
        }

        // Parent passport → territory = visa-free as of right.
        // Citizens of the realm have automatic right of entry to their own
        // territories. Previously every (passport, territory) cell defaulted
        // to embassy_visa, which was wrong for GB→FK, GB→GI, GB→TC, FR→NC,
        // NL→AW, DK→GL, NZ→CK, AU→NF, US→PR, and ~25 others.
        // Exceptions: territories with their own permit regime even for
        // parent citizens (SH, PN) are flagged parentCitizensNeedPermit;
        // restricted territories (IO) keep their explicit status.
        if (
          passport === t.parent &&
          t.status !== "restricted" &&
          !t.parentCitizensNeedPermit
        ) {
          records.push({
            passportIso2: passport,
            destinationIso2: t.iso2,
            purpose: "tourism",
            status: "visa_free",
            label: `Visa-free entry as a ${parentName} citizen`,
            maxStayDays: null,
            entriesAllowed: "multiple",
            passportValidityMonthsRequired: 6,
            onwardTicketRequired: false,
            proofOfFundsRequired: false,
            proofOfAccommodationRequired: false,
            biometricsRequired: false,
            requirements: [
              `As a ${parentName} citizen, you have automatic right of entry to ${tName} — no visa required.`,
              t.policyNote,
            ],
            applicationUrl: t.applicationUrl,
            primarySourceUrl: t.applicationUrl,
            fees: [],
            notes: `${tName} is a ${parentName} territory; ${parentName} citizens enter as of right.`,
          });
          continue;
        }

        // Inherited-policy record — one per (passport, territory) for
        // tourism. Caller still sees parent-country adapters via the
        // standard /[passport]/[parent] route too.
        const status = t.status ?? "embassy_visa";
        records.push({
          passportIso2: passport,
          destinationIso2: t.iso2,
          purpose: "tourism",
          status,
          label: `${tName} — visa policy follows ${parentName}`,
          maxStayDays: null,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            t.policyNote,
            `Check the ${parentName} visa rules for your specific passport — see the link below.`,
            `Where ${tName} runs its own immigration desk (Gibraltar, Falklands, Aruba, etc.), the linked portal is authoritative for the local rules.`,
          ],
          applicationUrl: t.applicationUrl,
          primarySourceUrl: t.applicationUrl,
          fees: [],
          notes: `${tName} doesn't issue separate visa categories the way a sovereign state does. The most reliable next step is the linked ${parentName === tName ? "" : parentName + " "}immigration portal — and your own embassy.`,
        });
      }
    }

    return { records };
  },
};
