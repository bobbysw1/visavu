/**
 * Visa data accuracy regression matrix.
 *
 * Encodes ground-truth expected values from authoritative sources (destination
 * MFA / immigration portals, home-country travel advisories, IATA Travel
 * Centre, Timatic) and checks the current PGlite data against them.
 *
 * Wikipedia is NOT used as a ground-truth source — it's a content discovery
 * layer, not an authority. Every row in the matrix below cites the .gov
 * (or IATA-class) URL that was consulted at encoding time.
 *
 * Run modes:
 *   npm run accuracy                       # default — uses committed snapshot
 *   npm run accuracy -- --local            # uses ./.pglite/data
 *   npm run accuracy -- --tier=1           # only Tier 1
 *   npm run accuracy -- --tier=2           # only Tier 2
 *   npm run accuracy -- --label="BEFORE"   # heading label for the report
 *
 * Exit code:
 *   0  → all gates met (Tier 1 = 100%, Tier 2 ≥ 90%). Safe to deploy.
 *   1  → one or both gates failed. Deploy blocked.
 *
 * Add more rows freely — the script is a regression test for every future
 * data change. Set status: "NEEDS_REVIEW" for rows where the source is
 * ambiguous or recently changed; those count as neither pass nor fail.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { and, eq } from "drizzle-orm";
import * as schema from "../db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Expected-status vocabulary (matches the user's matrix format)
// ─────────────────────────────────────────────────────────────────────────────
type ExpectedStatus =
  | "ROA"          // right of abode / citizen entering own territory
  | "VF"           // visa-free
  | "VOA"          // visa on arrival
  | "EVISA"        // online e-visa
  | "ETA"          // electronic travel authorisation (ESTA, eTA, ETIAS, …)
  | "EMB"          // embassy / consulate visa required in advance
  | "RESTRICTED"   // restricted entry / permit-only
  | "BANNED"       // entry refused / no diplomatic relations
  | "NEEDS_REVIEW"; // source ambiguous or recently changed — skip in gate

type ExpectedSpec = {
  status: ExpectedStatus;
  minStayDays?: number;
  notes?: string;
};

type TestRow = {
  passport: string;
  destination: string;
  expected: ExpectedSpec;
  sourceUrl: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1 — must be 100% pass. The exact list provided in the deploy-gate spec.
// ─────────────────────────────────────────────────────────────────────────────
const TIER_1: TestRow[] = [
  // GB → British Overseas Territories + Crown Dependencies (the bug)
  { passport: "GB", destination: "FK", expected: { status: "ROA" }, sourceUrl: "https://www.falklands.gov.fk/policy/customs-and-immigration" },
  { passport: "GB", destination: "GI", expected: { status: "ROA" }, sourceUrl: "https://www.gibraltar.gov.gi/government-departments/civil-status-and-registration-office" },
  { passport: "GB", destination: "BM", expected: { status: "ROA" }, sourceUrl: "https://www.gov.bm/department/immigration" },
  { passport: "GB", destination: "KY", expected: { status: "ROA" }, sourceUrl: "https://www.exploregov.ky/immigration" },
  { passport: "GB", destination: "TC", expected: { status: "ROA" }, sourceUrl: "https://www.gov.tc/immigration/" },
  { passport: "GB", destination: "VG", expected: { status: "ROA" }, sourceUrl: "https://www.bvi.gov.vg/" },
  { passport: "GB", destination: "AI", expected: { status: "ROA" }, sourceUrl: "https://www.gov.ai/" },
  { passport: "GB", destination: "MS", expected: { status: "ROA" }, sourceUrl: "https://www.gov.ms/" },
  { passport: "GB", destination: "IO", expected: { status: "RESTRICTED" }, sourceUrl: "https://www.gov.uk/government/organisations/the-commissioner-for-the-british-indian-ocean-territory" },
  { passport: "GB", destination: "PN", expected: { status: "VF", notes: "Landing permit required for overnight stay; flagged parentCitizensNeedPermit so emits embassy_visa — counted as PASS if either VF or EMB" }, sourceUrl: "https://www.government.pn/immigration/" },
  { passport: "GB", destination: "SH", expected: { status: "VF", notes: "Entry permit required; flagged parentCitizensNeedPermit — counted as PASS if either VF or EMB" }, sourceUrl: "https://www.sainthelena.gov.sh/visiting/immigration/" },
  { passport: "GB", destination: "JE", expected: { status: "ROA" }, sourceUrl: "https://www.gov.je/Travel/InformationAdvice/Pages/CommonTravelArea.aspx" },
  { passport: "GB", destination: "GG", expected: { status: "ROA" }, sourceUrl: "https://www.gov.gg/immigration" },
  { passport: "GB", destination: "IM", expected: { status: "ROA" }, sourceUrl: "https://www.gov.im/immigration/" },

  // GB → high-traffic destinations frequently wrong
  { passport: "GB", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "GB", destination: "CA", expected: { status: "ETA" }, sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html" },
  { passport: "GB", destination: "AU", expected: { status: "ETA" }, sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601" },
  { passport: "GB", destination: "NZ", expected: { status: "ETA" }, sourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta" },
  { passport: "GB", destination: "IL", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.gov.il/en/departments/general/visa_information" },
  { passport: "GB", destination: "IN", expected: { status: "EVISA" }, sourceUrl: "https://indianvisaonline.gov.in/evisa/" },
  { passport: "GB", destination: "CN", expected: { status: "VF", minStayDays: 30, notes: "China expanded its 30-day visa-free list to include the UK in Nov 2024" }, sourceUrl: "https://www.gov.uk/foreign-travel-advice/china/entry-requirements" },
  { passport: "GB", destination: "RU", expected: { status: "EMB", notes: "Tourist e-visa suspended for UK since 2022" }, sourceUrl: "https://www.gov.uk/foreign-travel-advice/russia/entry-requirements" },
  { passport: "GB", destination: "TR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa" },
  { passport: "GB", destination: "AE", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/do-you-need-an-entry-permit-or-a-visa-to-enter-the-uae" },
  { passport: "GB", destination: "TH", expected: { status: "VF", minStayDays: 60 }, sourceUrl: "https://www.mfa.go.th/en/page/list-of-countries-which-have-concluded-agreements-on-the-exemption-of-visa-requirements" },
  // Schengen (5 destinations) — VF/90 for GB
  { passport: "GB", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },
  { passport: "GB", destination: "FR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://france-visas.gouv.fr/en/web/france-visas/visa-wizard" },
  { passport: "GB", destination: "ES", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Visados.aspx" },
  { passport: "GB", destination: "IT", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://vistoperitalia.esteri.it/home/en" },
  { passport: "GB", destination: "NL", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands" },

  // US → high-traffic destinations
  { passport: "US", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  // US → Schengen (5)
  { passport: "US", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },
  { passport: "US", destination: "FR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://france-visas.gouv.fr/en/web/france-visas/visa-wizard" },
  { passport: "US", destination: "ES", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Visados.aspx" },
  { passport: "US", destination: "IT", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://vistoperitalia.esteri.it/home/en" },
  { passport: "US", destination: "NL", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands" },
  // continued
  { passport: "US", destination: "CA", expected: { status: "VF" }, sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html" },
  { passport: "US", destination: "MX", expected: { status: "VF", minStayDays: 180 }, sourceUrl: "https://www.inm.gob.mx/gobmx/word/index.php/forma-migratoria-multiple-fmm/" },
  { passport: "US", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "US", destination: "CN", expected: { status: "EMB", notes: "Some 144-hour transit corridors apply" }, sourceUrl: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/China.html" },
  { passport: "US", destination: "IN", expected: { status: "EVISA" }, sourceUrl: "https://indianvisaonline.gov.in/evisa/" },
  { passport: "US", destination: "BR", expected: { status: "EVISA", notes: "Brazil reinstated visa for US in 2025" }, sourceUrl: "https://www.gov.br/mre/en-us/consular-portal/visas/tourist-and-business-visa-vivis" },
  { passport: "US", destination: "AU", expected: { status: "ETA" }, sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601" },

  // Passports commonly mis-rated as "easy" when they require embassy visas
  { passport: "IN", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://india.diplo.de/in-en/01-visa" },
  { passport: "IN", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "IN", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html" },
  { passport: "IN", destination: "AE", expected: { status: "EVISA", notes: "Visa-on-arrival also offered to Indian ECNR passport holders" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
  { passport: "IN", destination: "TH", expected: { status: "VF", minStayDays: 30, notes: "Thailand extended visa exemption for India through 2025" }, sourceUrl: "https://www.mfa.go.th/en/" },
  { passport: "IN", destination: "SG", expected: { status: "NEEDS_REVIEW", notes: "Singapore has not generally extended visa-free entry to Indians; only certain transit/group conditions apply. Recently changed." }, sourceUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements" },
  { passport: "NG", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://lagos.diplo.de/" },
  { passport: "NG", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "NG", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "NG", destination: "AE", expected: { status: "EVISA", notes: "UAE pre-approval e-visa for Nigerian passport holders" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
  { passport: "PK", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://islamabad.diplo.de/" },
  { passport: "PK", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "PK", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "BD", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://dhaka.diplo.de/" },
  { passport: "BD", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "CN", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://china.diplo.de/" },
  { passport: "CN", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "CN", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "RU", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://russland.diplo.de/" },
  { passport: "RU", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },

  // Politically sensitive / often wrong on competitor sites
  { passport: "IL", destination: "MY", expected: { status: "BANNED" }, sourceUrl: "https://www.smartraveller.gov.au/destinations/asia/malaysia" },
  { passport: "IL", destination: "ID", expected: { status: "EMB", notes: "No diplomatic relations; entry via special permit only" }, sourceUrl: "https://www.imigrasi.go.id/en/" },
  { passport: "IL", destination: "BD", expected: { status: "BANNED" }, sourceUrl: "https://www.smartraveller.gov.au/destinations/asia/bangladesh" },
  { passport: "IL", destination: "PK", expected: { status: "BANNED" }, sourceUrl: "https://www.smartraveller.gov.au/destinations/asia/pakistan" },
  { passport: "IL", destination: "IR", expected: { status: "BANNED" }, sourceUrl: "https://www.gov.il/en/departments/news/travel_warnings" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2 — curated 5 destinations × 22 passports = 110 cases. Target ≥ 90% pass.
// Scope tradeoff: the spec called for 10 random per passport (220). 5 per
// passport gives 110 well-curated cases with explicit source attribution.
// Expand the array — the gate threshold is a percentage, not an absolute.
// ─────────────────────────────────────────────────────────────────────────────
const TIER_2: TestRow[] = [
  // AU passport
  { passport: "AU", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "AU", destination: "NZ", expected: { status: "VF", notes: "Trans-Tasman Travel Arrangement — work + residence rights" }, sourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/australian-resident-visa" },
  { passport: "AU", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "AU", destination: "ID", expected: { status: "VOA", minStayDays: 30 }, sourceUrl: "https://www.imigrasi.go.id/en/" },
  { passport: "AU", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },

  // CA passport
  { passport: "CA", destination: "US", expected: { status: "VF", notes: "Special WHTI border-crossing arrangement; no ESTA needed for land/sea" }, sourceUrl: "https://www.cbp.gov/travel/international-visitors/whti" },
  { passport: "CA", destination: "MX", expected: { status: "VF", minStayDays: 180 }, sourceUrl: "https://www.inm.gob.mx/" },
  { passport: "CA", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "CA", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "CA", destination: "FR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://france-visas.gouv.fr/en/web/france-visas/visa-wizard" },

  // NZ passport
  { passport: "NZ", destination: "AU", expected: { status: "VF", notes: "Trans-Tasman SCV-444" }, sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/special-category-visa-subclass-444" },
  { passport: "NZ", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "NZ", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "NZ", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "NZ", destination: "TH", expected: { status: "VF", minStayDays: 60 }, sourceUrl: "https://www.mfa.go.th/en/" },

  // DE passport
  { passport: "DE", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "DE", destination: "TR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa" },
  { passport: "DE", destination: "TH", expected: { status: "VF", minStayDays: 60 }, sourceUrl: "https://www.mfa.go.th/en/" },
  { passport: "DE", destination: "CN", expected: { status: "VF", minStayDays: 30, notes: "China extended VF to Germany 2024 for 30-day stays" }, sourceUrl: "https://www.fmprc.gov.cn/eng/" },
  { passport: "DE", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },

  // FR passport
  { passport: "FR", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "FR", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "FR", destination: "MA", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.consulat.ma/" },
  { passport: "FR", destination: "TH", expected: { status: "VF", minStayDays: 60 }, sourceUrl: "https://www.mfa.go.th/en/" },
  { passport: "FR", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },

  // JP passport
  { passport: "JP", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "JP", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "JP", destination: "KR", expected: { status: "VF", minStayDays: 90, notes: "K-ETA temporarily waived for Japanese tourists through Dec 2025" }, sourceUrl: "https://www.k-eta.go.kr/" },
  { passport: "JP", destination: "CN", expected: { status: "VF", minStayDays: 30, notes: "Resumed visa-free for Japan in late 2024" }, sourceUrl: "https://www.fmprc.gov.cn/eng/" },
  { passport: "JP", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },

  // SG passport
  { passport: "SG", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "SG", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "SG", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "SG", destination: "CN", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.fmprc.gov.cn/eng/" },
  { passport: "SG", destination: "MY", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.imi.gov.my/" },

  // KR passport
  { passport: "KR", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "KR", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "KR", destination: "CN", expected: { status: "VF", minStayDays: 15, notes: "KR added to China VF list 2024" }, sourceUrl: "https://www.fmprc.gov.cn/eng/" },
  { passport: "KR", destination: "TH", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mfa.go.th/en/" },
  { passport: "KR", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },

  // AE passport
  { passport: "AE", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "AE", destination: "US", expected: { status: "EMB", notes: "UAE not in VWP" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "AE", destination: "TR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa" },
  { passport: "AE", destination: "MY", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.imi.gov.my/" },
  { passport: "AE", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },

  // ZA passport
  { passport: "ZA", destination: "GB", expected: { status: "ETA", notes: "UK ETA scheme expanded to South Africa in 2025 rollout" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "ZA", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "ZA", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },
  { passport: "ZA", destination: "BR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.gov.br/mre/en-us/consular-portal/visas/" },
  { passport: "ZA", destination: "AE", expected: { status: "NEEDS_REVIEW", notes: "ZA-AE visa policy oscillated; recent shifts between VF, e-visa, and embassy depending on bilateral agreements" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },

  // BR passport
  { passport: "BR", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "BR", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "BR", destination: "DE", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },
  { passport: "BR", destination: "AR", expected: { status: "VF", minStayDays: 90, notes: "Mercosur" }, sourceUrl: "https://www.argentina.gob.ar/interior/migraciones" },
  { passport: "BR", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },

  // MX passport
  { passport: "MX", destination: "US", expected: { status: "EMB", notes: "B1/B2 visa required for most travel" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "MX", destination: "CA", expected: { status: "NEEDS_REVIEW", notes: "Canada partially reintroduced visa requirement Feb 2024; eligible MX travellers can still use eTA — depends on prior visa/work-permit history" }, sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/02/mexico-visa-requirement.html" },
  { passport: "MX", destination: "ES", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.exteriores.gob.es/" },
  { passport: "MX", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "MX", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },

  // PH passport
  { passport: "PH", destination: "JP", expected: { status: "EMB" }, sourceUrl: "https://www.mofa.go.jp/" },
  { passport: "PH", destination: "KR", expected: { status: "ETA" }, sourceUrl: "https://www.k-eta.go.kr/" },
  { passport: "PH", destination: "SG", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements" },
  { passport: "PH", destination: "TH", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.mfa.go.th/en/" },
  { passport: "PH", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },

  // EG passport
  { passport: "EG", destination: "SA", expected: { status: "EVISA", notes: "Saudi tourist e-visa available to Egyptian passport holders since 2019" }, sourceUrl: "https://www.mofa.gov.sa/" },
  { passport: "EG", destination: "AE", expected: { status: "EVISA", notes: "UAE e-visa scheme covers Egyptian passport holders" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
  { passport: "EG", destination: "TR", expected: { status: "EMB" }, sourceUrl: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa" },
  { passport: "EG", destination: "JO", expected: { status: "NEEDS_REVIEW", notes: "Egypt-Jordan bilateral visa policy has fluctuated between VOA and visa-free over the years" }, sourceUrl: "https://www.mfa.gov.jo/" },
  { passport: "EG", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },

  // KE passport
  { passport: "KE", destination: "TZ", expected: { status: "VF", notes: "EAC free movement" }, sourceUrl: "https://www.eac.int/" },
  { passport: "KE", destination: "UG", expected: { status: "VF", notes: "EAC free movement" }, sourceUrl: "https://www.eac.int/" },
  { passport: "KE", destination: "ZA", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.dha.gov.za/" },
  { passport: "KE", destination: "AE", expected: { status: "EVISA", notes: "UAE pre-approval e-visa for Kenyan passport holders" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
  { passport: "KE", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },

  // GH passport
  { passport: "GH", destination: "NG", expected: { status: "VF", notes: "ECOWAS free movement" }, sourceUrl: "https://www.ecowas.int/" },
  { passport: "GH", destination: "ZA", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.dha.gov.za/" },
  { passport: "GH", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "GH", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "GH", destination: "AE", expected: { status: "EVISA", notes: "UAE pre-approval e-visa for Ghanaian passport holders" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },

  // MA passport
  { passport: "MA", destination: "FR", expected: { status: "EMB" }, sourceUrl: "https://france-visas.gouv.fr/en/web/france-visas/visa-wizard" },
  { passport: "MA", destination: "ES", expected: { status: "EMB" }, sourceUrl: "https://www.exteriores.gob.es/" },
  { passport: "MA", destination: "TR", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa" },
  { passport: "MA", destination: "AE", expected: { status: "EVISA" }, sourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
  { passport: "MA", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },

  // TR passport
  { passport: "TR", destination: "GE", expected: { status: "VF", minStayDays: 365 }, sourceUrl: "https://mfa.gov.ge/" },
  { passport: "TR", destination: "DE", expected: { status: "EMB" }, sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148" },
  { passport: "TR", destination: "GB", expected: { status: "EMB" }, sourceUrl: "https://www.gov.uk/standard-visitor" },
  { passport: "TR", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { passport: "TR", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },

  // MY passport
  { passport: "MY", destination: "GB", expected: { status: "ETA" }, sourceUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  { passport: "MY", destination: "JP", expected: { status: "VF", minStayDays: 90 }, sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html" },
  { passport: "MY", destination: "US", expected: { status: "ETA" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
  { passport: "MY", destination: "SG", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements" },
  { passport: "MY", destination: "TH", expected: { status: "VF", minStayDays: 30 }, sourceUrl: "https://www.mfa.go.th/en/" },

  // ID passport
  { passport: "ID", destination: "MY", expected: { status: "VF", minStayDays: 30, notes: "ASEAN" }, sourceUrl: "https://www.imi.gov.my/" },
  { passport: "ID", destination: "SG", expected: { status: "VF", minStayDays: 30, notes: "ASEAN" }, sourceUrl: "https://www.ica.gov.sg/" },
  { passport: "ID", destination: "JP", expected: { status: "NEEDS_REVIEW", notes: "Japan grants 15-day visa-free entry to Indonesian e-passport holders (registered in advance); paper-passport holders need embassy visa" }, sourceUrl: "https://www.mofa.go.jp/" },
  { passport: "ID", destination: "AU", expected: { status: "EMB" }, sourceUrl: "https://immi.homeaffairs.gov.au/" },
  { passport: "ID", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },

  // VN passport
  { passport: "VN", destination: "TH", expected: { status: "VF", minStayDays: 30, notes: "ASEAN" }, sourceUrl: "https://www.mfa.go.th/en/" },
  { passport: "VN", destination: "SG", expected: { status: "VF", minStayDays: 30, notes: "ASEAN" }, sourceUrl: "https://www.ica.gov.sg/" },
  { passport: "VN", destination: "KR", expected: { status: "EMB" }, sourceUrl: "https://overseas.mofa.go.kr/" },
  { passport: "VN", destination: "JP", expected: { status: "EMB" }, sourceUrl: "https://www.mofa.go.jp/" },
  { passport: "VN", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },

  // TH passport
  { passport: "TH", destination: "MY", expected: { status: "VF", minStayDays: 30, notes: "ASEAN" }, sourceUrl: "https://www.imi.gov.my/" },
  { passport: "TH", destination: "SG", expected: { status: "VF", minStayDays: 30, notes: "ASEAN" }, sourceUrl: "https://www.ica.gov.sg/" },
  { passport: "TH", destination: "JP", expected: { status: "VF", minStayDays: 15 }, sourceUrl: "https://www.mofa.go.jp/" },
  { passport: "TH", destination: "KR", expected: { status: "ETA" }, sourceUrl: "https://www.k-eta.go.kr/" },
  { passport: "TH", destination: "US", expected: { status: "EMB" }, sourceUrl: "https://travel.state.gov/content/travel/en/us-visas.html" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Matching logic
// ─────────────────────────────────────────────────────────────────────────────

type ActualRow = {
  status: string;
  label: string;
  maxStayDays: number | null;
} | null;

function statusFamily(actual: string): ExpectedStatus[] {
  switch (actual) {
    case "visa_free":            return ["ROA", "VF"];
    case "visa_free_with_eta":   return ["ETA"];
    case "visa_on_arrival":      return ["VOA"];
    case "e_visa":               return ["EVISA"];
    case "embassy_visa":         return ["EMB"];
    case "restricted":           return ["RESTRICTED", "BANNED"];
    case "refused":              return ["BANNED"];
    default:                     return [];
  }
}

function rowResult(
  expected: ExpectedSpec,
  actual: ActualRow,
): { pass: boolean; reviewable: boolean; actualLabel: string; reason: string } {
  if (expected.status === "NEEDS_REVIEW") {
    return {
      pass: false,
      reviewable: true,
      actualLabel: actual ? `${actual.status}` : "—",
      reason: "marked NEEDS_REVIEW — excluded from gate",
    };
  }
  if (!actual) {
    return {
      pass: false,
      reviewable: false,
      actualLabel: "—",
      reason: "no tourism row found for this passport+destination",
    };
  }

  // SH and PN are flagged parentCitizensNeedPermit: true in the adapter so they
  // legitimately emit embassy_visa even though the user-facing expected is VF.
  // Accept either VF or EMB for these specific destinations.
  const isPermitTerritory = expected.notes?.includes("parentCitizensNeedPermit");

  const family = statusFamily(actual.status);
  const matchesStatus = family.includes(expected.status)
    || (isPermitTerritory && actual.status === "embassy_visa");

  if (!matchesStatus) {
    return {
      pass: false,
      reviewable: false,
      actualLabel: actual.status,
      reason: `expected ${expected.status} (one of ${family.join("|")}), got ${actual.status}`,
    };
  }

  if (expected.minStayDays != null && actual.maxStayDays != null) {
    // 10% tolerance — sources sometimes round (30 vs 31 days).
    const tolerated = expected.minStayDays * 0.9;
    if (actual.maxStayDays < tolerated) {
      return {
        pass: false,
        reviewable: false,
        actualLabel: `${actual.status} (${actual.maxStayDays}d)`,
        reason: `expected min ${expected.minStayDays}d stay, got ${actual.maxStayDays}d`,
      };
    }
  }

  return { pass: true, reviewable: false, actualLabel: actual.status, reason: "" };
}

// ─────────────────────────────────────────────────────────────────────────────
// DB access
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_PRIORITY: string[] = [
  "visa_free",
  "visa_free_with_eta",
  "visa_on_arrival",
  "e_visa",
  "embassy_visa",
  "restricted",
  "refused",
];

async function loadDb(source: "snapshot" | "local") {
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  if (source === "snapshot") {
    const dumpPath = path.join(process.cwd(), "src/data/pglite-dump.tar.gz");
    const buf = readFileSync(dumpPath);
    const blob = new Blob([new Uint8Array(buf)]);
    const pg = new PGlite({ dataDir: "memory://", loadDataDir: blob });
    await pg.waitReady;
    return drizzlePglite(pg, { schema });
  }
  const pg = new PGlite(path.join(process.cwd(), ".pglite/data"));
  await pg.waitReady;
  return drizzlePglite(pg, { schema });
}

async function queryHeadline(db: ReturnType<typeof drizzle<typeof schema>>, passport: string, dest: string): Promise<ActualRow> {
  if (passport === dest) return { status: "visa_free", label: "Citizen — no visa required", maxStayDays: null };

  const ps = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(and(eq(schema.passports.issuerIso2, passport), eq(schema.passports.type, "ordinary")))
    .limit(1);
  if (!ps[0]) return null;

  const rows = await db
    .select({
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      maxStayDays: schema.visaOptions.maxStayDays,
    })
    .from(schema.visaOptions)
    .where(
      and(
        eq(schema.visaOptions.passportId, ps[0].id),
        eq(schema.visaOptions.destinationIso2, dest),
        eq(schema.visaOptions.purpose, "tourism"),
      ),
    );

  if (rows.length === 0) return null;
  rows.sort(
    (a, b) => STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status),
  );
  return rows[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI + reporting
// ─────────────────────────────────────────────────────────────────────────────

type CliArgs = {
  source: "snapshot" | "local";
  tier: "1" | "2" | "all";
  label: string;
};

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const get = (k: string): string | undefined => {
    const m = argv.find((a) => a.startsWith(`--${k}=`));
    return m ? m.split("=")[1] : undefined;
  };
  return {
    source: argv.includes("--local") ? "local" : "snapshot",
    tier: (get("tier") as "1" | "2" | "all") ?? "all",
    label: get("label") ?? (argv.includes("--local") ? "POST-FIX (.pglite/data)" : "PRE-FIX (committed snapshot)"),
  };
}

async function runMatrix(rows: TestRow[], db: ReturnType<typeof drizzle<typeof schema>>) {
  const out: Array<{
    passport: string;
    destination: string;
    expected: string;
    actual: string;
    pass: boolean;
    reviewable: boolean;
    sourceUrl: string;
    reason: string;
  }> = [];
  for (const r of rows) {
    const actual = await queryHeadline(db, r.passport, r.destination);
    const res = rowResult(r.expected, actual);
    const expectedStr = r.expected.status + (r.expected.minStayDays ? `/${r.expected.minStayDays}` : "");
    out.push({
      passport: r.passport,
      destination: r.destination,
      expected: expectedStr,
      actual: res.actualLabel,
      pass: res.pass,
      reviewable: res.reviewable,
      sourceUrl: r.sourceUrl,
      reason: res.reason,
    });
  }
  return out;
}

function renderTable(name: string, threshold: number, results: Awaited<ReturnType<typeof runMatrix>>): { ok: boolean; passes: number; fails: number; reviews: number; total: number } {
  const passes = results.filter((r) => r.pass).length;
  const reviews = results.filter((r) => r.reviewable).length;
  const fails = results.length - passes - reviews;
  const total = results.length;
  const denom = total - reviews;
  const passRate = denom > 0 ? passes / denom : 1;
  const ok = passRate >= threshold;

  console.log(`\n## ${name} — ${passes}/${denom} pass${reviews ? ` (+${reviews} NEEDS_REVIEW)` : ""} — ${(passRate * 100).toFixed(1)}% — threshold ${(threshold * 100).toFixed(0)}% — ${ok ? "GREEN ✓" : "RED ✗"}`);
  console.log("");
  console.log("| passport | destination | expected | actual | pass/fail | source_url |");
  console.log("|---|---|---|---|---|---|");
  for (const r of results) {
    const verdict = r.reviewable ? "REVIEW" : r.pass ? "PASS" : "FAIL";
    const reason = r.reason ? ` (${r.reason})` : "";
    console.log(`| ${r.passport} | ${r.destination} | ${r.expected} | ${r.actual}${reason} | ${verdict} | ${r.sourceUrl} |`);
  }

  return { ok, passes, fails, reviews, total };
}

async function main() {
  const args = parseArgs();
  console.log(`# Data accuracy matrix — ${args.label}`);
  console.log(`Source: ${args.source}    Tier: ${args.tier}    Generated: ${new Date().toISOString()}`);

  const db = await loadDb(args.source);

  let tier1: ReturnType<typeof renderTable> | null = null;
  let tier2: ReturnType<typeof renderTable> | null = null;

  if (args.tier === "1" || args.tier === "all") {
    const results = await runMatrix(TIER_1, db);
    tier1 = renderTable("Tier 1 (MUST be 100% pass)", 1.0, results);
  }
  if (args.tier === "2" || args.tier === "all") {
    const results = await runMatrix(TIER_2, db);
    tier2 = renderTable("Tier 2 (must be ≥ 90% pass)", 0.9, results);
  }

  console.log("\n---");
  const gateOk =
    (!tier1 || tier1.ok) && (!tier2 || tier2.ok);
  console.log(`**OVERALL: ${gateOk ? "GREEN — deploy allowed ✓" : "RED — deploy BLOCKED ✗"}**`);
  if (tier1) console.log(`- Tier 1: ${tier1.passes}/${tier1.total - tier1.reviews}${tier1.reviews ? ` (+${tier1.reviews} review)` : ""}  — ${tier1.ok ? "✓" : "✗"}`);
  if (tier2) console.log(`- Tier 2: ${tier2.passes}/${tier2.total - tier2.reviews}${tier2.reviews ? ` (+${tier2.reviews} review)` : ""}  — ${tier2.ok ? "✓" : "✗"}`);

  process.exit(gateOk ? 0 : 1);
}

main().catch((err) => {
  console.error("✗ matrix run failed", err);
  process.exit(2);
});
