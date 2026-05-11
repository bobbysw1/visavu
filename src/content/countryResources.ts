/**
 * Curated official-source resources per country.
 *
 * Even when we don't have a structured visa_options record for a particular
 * (passport, destination) cell, we can ALWAYS point the user at the right
 * primary sources:
 *   - the destination's official visa / immigration portal
 *   - the issuing ministry of foreign affairs
 *   - the major travel-advisory dashboards (UK FCDO, US State, AU Smartraveller)
 *   - the embassy directory
 *
 * That's the bridge between "we don't have specific data" and a useful answer.
 *
 * Coverage: top ~70 most-trafficked destinations + every country mentioned in
 * the obstacles file. Add more as needed.
 *
 * NOTE: every URL in this file points to a primary government source. Never
 * include affiliate links here.
 */
export type CountryResources = {
  iso2: string;
  // Destination-side: where do non-citizens look up visa rules?
  visaPortal?: string;
  visaPortalLabel?: string;
  immigrationDept?: string;
  embassyDirectory?: string;
  // Origin-side: travel advice published by the *originating* country's foreign-affairs ministry.
  travelAdvice?: { gov: string; url: string }[];
  // Optional non-English official portal (used to flag translation needs).
  localLanguagePortal?: { language: string; url: string };
  // Transparency disclosure for cases where the visa channel is operated by
  // a contractor (VFS, SNEDAI, etc.) or runs on a non-.gov domain. We surface
  // this inline on result pages so users know exactly what they're using.
  deliveryNote?: string;
};

const RESOURCES: Record<string, CountryResources> = {
  // ---------------- Top destinations ----------------
  US: {
    iso2: "US",
    visaPortal: "https://travel.state.gov/content/travel/en/us-visas.html",
    visaPortalLabel: "U.S. State Department — Visas",
    immigrationDept: "https://www.uscis.gov/",
    embassyDirectory: "https://www.usembassy.gov/",
  },
  GB: {
    iso2: "GB",
    visaPortal: "https://www.gov.uk/browse/visas-immigration",
    visaPortalLabel: "gov.uk — Visas & immigration",
    immigrationDept: "https://www.gov.uk/government/organisations/uk-visas-and-immigration",
    embassyDirectory: "https://www.gov.uk/world/embassies",
  },
  CA: {
    iso2: "CA",
    visaPortal: "https://www.canada.ca/en/services/immigration-citizenship.html",
    visaPortalLabel: "Canada.ca — Immigration & citizenship",
    immigrationDept: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
    embassyDirectory: "https://travel.gc.ca/assistance/embassies-consulates",
  },
  AU: {
    iso2: "AU",
    visaPortal: "https://immi.homeaffairs.gov.au/",
    visaPortalLabel: "Home Affairs — visa finder",
    immigrationDept: "https://immi.homeaffairs.gov.au/",
    embassyDirectory: "https://www.dfat.gov.au/about-us/our-locations/missions/our-embassies-and-consulates-overseas",
  },
  NZ: {
    iso2: "NZ",
    visaPortal: "https://www.immigration.govt.nz/new-zealand-visas",
    visaPortalLabel: "Immigration NZ — visa options",
    embassyDirectory: "https://www.mfat.govt.nz/en/embassies/",
  },
  IE: {
    iso2: "IE",
    visaPortal: "https://www.irishimmigration.ie/",
    visaPortalLabel: "Irish Immigration Service",
    embassyDirectory: "https://www.ireland.ie/en/dfa/embassies/",
  },

  // EU / Schengen
  DE: {
    iso2: "DE",
    visaPortal: "https://www.auswaertiges-amt.de/en/visa-service",
    visaPortalLabel: "Federal Foreign Office — visa service",
    embassyDirectory: "https://www.auswaertiges-amt.de/en/about-us/auslandsvertretungen",
    localLanguagePortal: { language: "German", url: "https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt" },
  },
  FR: {
    iso2: "FR",
    visaPortal: "https://france-visas.gouv.fr/",
    visaPortalLabel: "France-Visas",
    embassyDirectory: "https://www.diplomatie.gouv.fr/en/the-ministry/diplomatic-network",
    localLanguagePortal: { language: "French", url: "https://france-visas.gouv.fr/" },
  },
  ES: {
    iso2: "ES",
    visaPortal: "https://www.exteriores.gob.es/es/EmbajadasConsulados/Paginas/index.aspx",
    visaPortalLabel: "Ministerio de Asuntos Exteriores — visas",
    localLanguagePortal: { language: "Spanish", url: "https://www.exteriores.gob.es/" },
  },
  IT: {
    iso2: "IT",
    visaPortal: "https://vistoperitalia.esteri.it/",
    visaPortalLabel: "Visti per l'Italia",
    localLanguagePortal: { language: "Italian", url: "https://vistoperitalia.esteri.it/" },
  },
  NL: {
    iso2: "NL",
    visaPortal: "https://www.netherlandsworldwide.nl/visa-the-netherlands",
    visaPortalLabel: "NetherlandsWorldwide",
  },
  BE: {
    iso2: "BE",
    visaPortal: "https://dofi.ibz.be/en",
    visaPortalLabel: "Office des Étrangers / DVZ",
  },
  AT: {
    iso2: "AT",
    visaPortal: "https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa",
    visaPortalLabel: "BMEIA — visa information",
  },
  PT: {
    iso2: "PT",
    visaPortal: "https://vistos.mne.gov.pt/en/",
    visaPortalLabel: "Visa Portal — Portuguese MFA",
    localLanguagePortal: { language: "Portuguese", url: "https://vistos.mne.gov.pt/" },
  },
  GR: { iso2: "GR", visaPortal: "https://www.mfa.gr/en/visas/", visaPortalLabel: "Hellenic MFA" },
  PL: { iso2: "PL", visaPortal: "https://www.gov.pl/web/diplomacy/visas-and-passports", visaPortalLabel: "gov.pl — visas" },
  SE: { iso2: "SE", visaPortal: "https://www.migrationsverket.se/English/Private-individuals.html", visaPortalLabel: "Migrationsverket" },
  DK: { iso2: "DK", visaPortal: "https://www.nyidanmark.dk/en-GB", visaPortalLabel: "New to Denmark" },
  NO: { iso2: "NO", visaPortal: "https://www.udi.no/en/", visaPortalLabel: "UDI — Directorate of Immigration" },
  FI: { iso2: "FI", visaPortal: "https://migri.fi/en/", visaPortalLabel: "Migri — Finnish Immigration Service" },
  CH: { iso2: "CH", visaPortal: "https://www.sem.admin.ch/sem/en/home.html", visaPortalLabel: "State Secretariat for Migration" },
  CZ: { iso2: "CZ", visaPortal: "https://www.mzv.gov.cz/jnp/en/information_for_aliens/", visaPortalLabel: "Czech MFA — visas" },
  HU: { iso2: "HU", visaPortal: "https://konzuliszolgalat.kormany.hu/visa-information", visaPortalLabel: "Hungarian Consular Service" },
  RO: { iso2: "RO", visaPortal: "https://www.mae.ro/en/node/2036", visaPortalLabel: "Romanian MFA — visas" },
  BG: { iso2: "BG", visaPortal: "https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria", visaPortalLabel: "Bulgarian MFA" },
  HR: { iso2: "HR", visaPortal: "https://mvep.gov.hr/consular-information/visa-system/visa-applications/229", visaPortalLabel: "Croatian MFA" },
  SK: { iso2: "SK", visaPortal: "https://www.mzv.sk/en/web/en/services/visa-information", visaPortalLabel: "Slovak MFA" },
  SI: { iso2: "SI", visaPortal: "https://www.gov.si/en/topics/entry-and-residence/", visaPortalLabel: "gov.si — visas" },
  EE: { iso2: "EE", visaPortal: "https://www.politsei.ee/en/instructions/visa-and-extending-period-of-stay/long-term-visa", visaPortalLabel: "Estonian Police & Border Guard" },
  LV: { iso2: "LV", visaPortal: "https://www.mfa.gov.lv/en/applying-visa", visaPortalLabel: "Latvian MFA" },
  LT: { iso2: "LT", visaPortal: "https://migracija.lrv.lt/en/", visaPortalLabel: "Lithuanian Migration Department" },
  LU: { iso2: "LU", visaPortal: "https://maee.gouvernement.lu/en/services-aux-citoyens/visa-immigration.html", visaPortalLabel: "Luxembourg MFA" },
  CY: { iso2: "CY", visaPortal: "https://www.gov.cy/mfa/", visaPortalLabel: "Cyprus MFA" },
  MT: { iso2: "MT", visaPortal: "https://identita.gov.mt/", visaPortalLabel: "Identità Malta" },

  // Asia
  CN: { iso2: "CN", visaPortal: "https://en.nia.gov.cn/", visaPortalLabel: "National Immigration Administration", localLanguagePortal: { language: "Mandarin Chinese", url: "https://www.nia.gov.cn/" } },
  JP: { iso2: "JP", visaPortal: "https://www.mofa.go.jp/j_info/visit/visa/", visaPortalLabel: "MOFA — visa information", localLanguagePortal: { language: "Japanese", url: "https://www.mofa.go.jp/mofaj/toko/visa/" } },
  KR: { iso2: "KR", visaPortal: "https://www.visa.go.kr/openPage.do?MENU_ID=10301", visaPortalLabel: "HiKorea — Visa Portal" },
  TH: { iso2: "TH", visaPortal: "https://www.thaievisa.go.th/", visaPortalLabel: "Thai eVisa" },
  VN: { iso2: "VN", visaPortal: "https://evisa.xuatnhapcanh.gov.vn/", visaPortalLabel: "Vietnam eVisa" },
  MY: { iso2: "MY", visaPortal: "https://www.imi.gov.my/index.php/en/main-services/visa/", visaPortalLabel: "Imigresen Malaysia" },
  SG: { iso2: "SG", visaPortal: "https://www.ica.gov.sg/enter-depart/entry_requirements", visaPortalLabel: "Singapore ICA" },
  ID: { iso2: "ID", visaPortal: "https://evisa.imigrasi.go.id/", visaPortalLabel: "Indonesia eVisa" },
  PH: { iso2: "PH", visaPortal: "https://dfa.gov.ph/list-of-countries-for-21-day-visa", visaPortalLabel: "DFA Philippines" },
  IN: { iso2: "IN", visaPortal: "https://indianvisaonline.gov.in/", visaPortalLabel: "Indian Visa Online" },
  PK: { iso2: "PK", visaPortal: "https://visa.nadra.gov.pk/", visaPortalLabel: "Pakistan Online Visa" },
  BD: { iso2: "BD", visaPortal: "https://www.visa.gov.bd/", visaPortalLabel: "Bangladesh eVisa" },
  LK: { iso2: "LK", visaPortal: "https://www.eta.gov.lk/slvisa/", visaPortalLabel: "Sri Lanka ETA" },
  NP: { iso2: "NP", visaPortal: "https://www.online.nepalimmigration.gov.np/tourist-visa", visaPortalLabel: "Department of Immigration Nepal" },
  TW: { iso2: "TW", visaPortal: "https://www.boca.gov.tw/np-1-2.html", visaPortalLabel: "Bureau of Consular Affairs (Taiwan)" },
  HK: { iso2: "HK", visaPortal: "https://www.immd.gov.hk/eng/services/index.html", visaPortalLabel: "HK Immigration Department" },
  MO: { iso2: "MO", visaPortal: "https://www.fsm.gov.mo/psp/eng/", visaPortalLabel: "Macao Public Security Police Force" },

  // Middle East
  AE: { iso2: "AE", visaPortal: "https://u.ae/en/information-and-services/visa-and-emirates-id", visaPortalLabel: "u.ae — visas" },
  SA: { iso2: "SA", visaPortal: "https://visa.visitsaudi.com/", visaPortalLabel: "Saudi eVisa" },
  QA: { iso2: "QA", visaPortal: "https://portal.moi.gov.qa/", visaPortalLabel: "Qatar Ministry of Interior" },
  KW: { iso2: "KW", visaPortal: "https://evisa.moi.gov.kw/evisa/", visaPortalLabel: "Kuwait eVisa" },
  BH: { iso2: "BH", visaPortal: "https://www.evisa.gov.bh/", visaPortalLabel: "Bahrain eVisa" },
  OM: { iso2: "OM", visaPortal: "https://evisa.rop.gov.om/", visaPortalLabel: "Oman eVisa" },
  IL: { iso2: "IL", visaPortal: "https://www.gov.il/en/departments/general/visa", visaPortalLabel: "Israel Population & Immigration Authority" },
  TR: { iso2: "TR", visaPortal: "https://www.evisa.gov.tr/en/", visaPortalLabel: "Republic of Türkiye Electronic Visa" },
  IR: { iso2: "IR", visaPortal: "https://evisa.mfa.ir/en/", visaPortalLabel: "Iran eVisa", localLanguagePortal: { language: "Persian", url: "https://evisa.mfa.ir/" } },
  EG: { iso2: "EG", visaPortal: "https://visa2egypt.gov.eg/", visaPortalLabel: "Egypt eVisa" },
  JO: { iso2: "JO", visaPortal: "https://www.evisa.gov.jo/", visaPortalLabel: "Jordan eVisa" },
  LB: { iso2: "LB", visaPortal: "http://www.general-security.gov.lb/", visaPortalLabel: "Lebanese General Directorate of General Security" },

  // Latin America
  MX: { iso2: "MX", visaPortal: "https://www.gob.mx/inm", visaPortalLabel: "Instituto Nacional de Migración" },
  BR: { iso2: "BR", visaPortal: "https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos", visaPortalLabel: "Itamaraty — vistos", localLanguagePortal: { language: "Portuguese", url: "https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos" } },
  AR: { iso2: "AR", visaPortal: "https://www.argentina.gob.ar/interior/migraciones", visaPortalLabel: "Dirección Nacional de Migraciones" },
  CL: { iso2: "CL", visaPortal: "https://serviciomigraciones.cl/", visaPortalLabel: "Servicio Nacional de Migraciones" },
  CO: { iso2: "CO", visaPortal: "https://www.cancilleria.gov.co/tramites_servicios/visa", visaPortalLabel: "Cancillería Colombia" },
  PE: { iso2: "PE", visaPortal: "https://www.gob.pe/migraciones", visaPortalLabel: "Migraciones Perú" },
  CR: { iso2: "CR", visaPortal: "https://www.migracion.go.cr/", visaPortalLabel: "Dirección General de Migración Costa Rica" },
  PA: { iso2: "PA", visaPortal: "https://www.migracion.gob.pa/", visaPortalLabel: "Servicio Nacional de Migración Panamá" },
  UY: { iso2: "UY", visaPortal: "https://www.gub.uy/ministerio-relaciones-exteriores/", visaPortalLabel: "MRREE Uruguay" },

  // Africa
  ZA: { iso2: "ZA", visaPortal: "https://www.dha.gov.za/index.php/immigration-services", visaPortalLabel: "Department of Home Affairs South Africa" },
  KE: { iso2: "KE", visaPortal: "https://www.etakenya.go.ke/", visaPortalLabel: "Kenya eTA" },
  TZ: { iso2: "TZ", visaPortal: "https://eservices.immigration.go.tz/", visaPortalLabel: "Tanzania Immigration eVisa" },
  UG: { iso2: "UG", visaPortal: "https://visas.immigration.go.ug/", visaPortalLabel: "Uganda eVisa" },
  ET: { iso2: "ET", visaPortal: "https://www.evisa.gov.et/", visaPortalLabel: "Ethiopia eVisa" },
  NG: { iso2: "NG", visaPortal: "https://portal.immigration.gov.ng/", visaPortalLabel: "Nigeria Immigration Service" },
  GH: { iso2: "GH", visaPortal: "https://www.gis.gov.gh/", visaPortalLabel: "Ghana Immigration Service" },
  MA: { iso2: "MA", visaPortal: "https://www.consulat.ma/en", visaPortalLabel: "Consulate General of Morocco" },
  TN: { iso2: "TN", visaPortal: "https://diplomatie.gov.tn/en/services-aux-tunisiens-letranger/visa-en", visaPortalLabel: "Tunisia MFA" },

  // Conflict / sensitive — fewer working portals
  RU: { iso2: "RU", visaPortal: "https://electronic-visa.kdmid.ru/", visaPortalLabel: "Russia eVisa", localLanguagePortal: { language: "Russian", url: "https://electronic-visa.kdmid.ru/" } },
  UA: { iso2: "UA", visaPortal: "https://mfa.gov.ua/en/consular-affairs/services-citizens/entering-ukraine-foreigners", visaPortalLabel: "Ukrainian MFA" },
  BY: { iso2: "BY", visaPortal: "https://mfa.gov.by/en/visa/", visaPortalLabel: "Belarusian MFA" },
  SD: { iso2: "SD", visaPortal: "https://www.mofa.gov.sd/", visaPortalLabel: "Sudanese MFA (limited services)" },
  AF: { iso2: "AF", visaPortal: "https://moi.gov.af/", visaPortalLabel: "Afghan Ministry of Interior (limited services)" },
  YE: { iso2: "YE", visaPortal: "https://www.mofa.gov.ye/", visaPortalLabel: "Yemeni MFA (limited services)" },
  IQ: { iso2: "IQ", visaPortal: "https://moi.gov.iq/", visaPortalLabel: "Iraq Ministry of Interior" },
  SY: { iso2: "SY", visaPortal: "http://www.mofaex.gov.sy/", visaPortalLabel: "Syrian MFA" },
  KP: { iso2: "KP", visaPortal: undefined, visaPortalLabel: "No public visa portal — embassy-only" },

  // ---------------- Long-tail / lesser-trafficked sovereign portals ----------------
  // Researched and verified by automated checker. Mostly e-visa portals + MFA
  // visa-information pages. A handful are non-.gov where the country uses a
  // commercial processor (MH, TV) — flagged for manual review at refresh time.
  AL: { iso2: "AL", visaPortal: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/", visaPortalLabel: "Albanian MFA", localLanguagePortal: { language: "Albanian", url: "https://punetejashtme.gov.al/regjimi-i-vizave-per-te-huajt/" } },
  DZ: { iso2: "DZ", visaPortal: "https://www.mfa.gov.dz/services-for-foreigners/entry-visa-to-algeria", visaPortalLabel: "Algerian MFA" },
  AD: { iso2: "AD", visaPortal: "https://www.govern.ad/en/ministries-and-secretaries-of-state/ministry-of-foreign-affairs/travel-to-andorra", visaPortalLabel: "Govern d'Andorra — Travel to Andorra" },
  AO: { iso2: "AO", visaPortal: "https://www.smevisa.gov.ao/", visaPortalLabel: "Angolan SME e-Visa" },
  AG: { iso2: "AG", visaPortal: "https://immigration.gov.ag/visa-services/general-visa-information/", visaPortalLabel: "Antigua & Barbuda Immigration" },
  AM: { iso2: "AM", visaPortal: "https://www.mfa.am/en/visa", visaPortalLabel: "Armenian MFA", embassyDirectory: "https://www.mfa.am/en/diplomatic-representations" },
  AZ: { iso2: "AZ", visaPortal: "https://evisa.gov.az/en/", visaPortalLabel: "Azerbaijan ASAN Visa" },
  BS: { iso2: "BS", visaPortal: "https://mofa.gov.bs/evisa-online-services/", visaPortalLabel: "Bahamas eVISA (MoFA)" },
  BB: { iso2: "BB", visaPortal: "https://immigration.gov.bb/pages/visa_requirements.aspx", visaPortalLabel: "Barbados Immigration" },
  BZ: { iso2: "BZ", visaPortal: "https://immigration.gov.bz/visa/visa-requirements/", visaPortalLabel: "Belize Immigration" },
  BJ: { iso2: "BJ", visaPortal: "https://evisa.bj/", visaPortalLabel: "Benin e-Visa" },
  BT: { iso2: "BT", visaPortal: "https://visit.doi.gov.bt/", visaPortalLabel: "Bhutan e-Visa (DOI)", embassyDirectory: "https://www.mfa.gov.bt/" },
  BO: { iso2: "BO", visaPortal: "https://visas.cancilleria.gob.bo/", visaPortalLabel: "Bolivia Cancillería visa portal", localLanguagePortal: { language: "Spanish", url: "https://visas.cancilleria.gob.bo/" } },
  BA: { iso2: "BA", visaPortal: "https://www.mvp.gov.ba/en/vize", visaPortalLabel: "Bosnia & Herzegovina MFA" },
  BW: { iso2: "BW", visaPortal: "https://www.gov.bw/visa-applications/visa-application-tourism-visa", visaPortalLabel: "Botswana eVisa" },
  BN: { iso2: "BN", visaPortal: "https://www.immigration.gov.bn/en/", visaPortalLabel: "Brunei Immigration" },
  BF: { iso2: "BF", visaPortal: "https://www.visaburkina.bf/en/home/", visaPortalLabel: "Visa Burkina e-Visa" },
  BI: { iso2: "BI", visaPortal: "https://migration.gov.bi/Apply/step1/3", visaPortalLabel: "Burundi Migration", embassyDirectory: "https://www.mae.gov.bi/en/" },
  CV: { iso2: "CV", visaPortal: "https://www.ease.gov.cv/", visaPortalLabel: "Cabo Verde EASE pre-registration" },
  KH: { iso2: "KH", visaPortal: "https://www.evisa.gov.kh/", visaPortalLabel: "Cambodia eVisa" },
  CM: { iso2: "CM", visaPortal: "https://evisacam.cm/", visaPortalLabel: "Cameroon e-Visa" },
  TD: { iso2: "TD", visaPortal: "https://www.evisas.gouv.td/", visaPortalLabel: "Chad e-Visa" },
  KM: { iso2: "KM", visaPortal: "https://evisa.gov.km/", visaPortalLabel: "Comoros eVisa" },
  CG: { iso2: "CG", visaPortal: "https://republic-congo.com/en/apply-for-a-visa/application/", visaPortalLabel: "Republic of Congo visa application" },
  CD: { iso2: "CD", visaPortal: "https://evisa.gouv.cd/", visaPortalLabel: "DR Congo DGM e-Visa" },
  CI: { iso2: "CI", visaPortal: "https://snedai.com/e-visa/", visaPortalLabel: "Côte d'Ivoire SNEDAI e-Visa" },
  CU: { iso2: "CU", visaPortal: "https://evisacuba.cu/", visaPortalLabel: "Cuba MINTUR eVisa" },
  DJ: { iso2: "DJ", visaPortal: "https://www.evisa.gouv.dj/", visaPortalLabel: "Djibouti e-Visa" },
  DM: { iso2: "DM", visaPortal: "https://dominica.gov.dm/services/passports-and-travel-documents-non-nationals/do-i-need-a-visa-to-enter-into-dominica", visaPortalLabel: "Government of Dominica" },
  DO: { iso2: "DO", visaPortal: "https://migracion.gob.do/en/", visaPortalLabel: "Dominican Republic DGM" },
  EC: { iso2: "EC", visaPortal: "https://www.cancilleria.gob.ec/2020/06/15/visas-en-el-ecuador/", visaPortalLabel: "Ecuador Cancillería" },
  SV: { iso2: "SV", visaPortal: "https://rree.gob.sv/visas/", visaPortalLabel: "El Salvador RREE", localLanguagePortal: { language: "Spanish", url: "https://rree.gob.sv/visas/" } },
  SZ: { iso2: "SZ", visaPortal: "https://evisa.gov.sz/", visaPortalLabel: "Eswatini eVisa" },
  FJ: { iso2: "FJ", visaPortal: "https://www.immigration.gov.fj/fiji-visas/", visaPortalLabel: "Fiji Immigration" },
  GA: { iso2: "GA", visaPortal: "https://evisa.dgdi.ga/", visaPortalLabel: "Gabon e-Visa (DGDI)" },
  GM: { iso2: "GM", visaPortal: "https://gid.gov.gm/visa/", visaPortalLabel: "Gambia Immigration Dept" },
  GE: { iso2: "GE", visaPortal: "https://www.evisa.gov.ge/", visaPortalLabel: "Georgia e-Visa" },
  GD: { iso2: "GD", visaPortal: "https://www.gov.gd/documents/immigration", visaPortalLabel: "Government of Grenada — Immigration" },
  GT: { iso2: "GT", visaPortal: "https://igm.gob.gt/", visaPortalLabel: "Guatemala Instituto de Migración", embassyDirectory: "https://www.minex.gob.gt/" },
  GN: { iso2: "GN", visaPortal: "https://www.paf.gov.gn/visa", visaPortalLabel: "Guinea PAF e-Visa" },
  GY: { iso2: "GY", visaPortal: "https://eservices.iss.gov.gy/visitor-visa", visaPortalLabel: "Guyana ISS visitor visa" },
  HT: { iso2: "HT", visaPortal: "https://mae.gouv.ht/", visaPortalLabel: "Haiti MAE", localLanguagePortal: { language: "French", url: "https://mae.gouv.ht/" } },
  IS: { iso2: "IS", visaPortal: "https://island.is/en/do-you-need-a-visa", visaPortalLabel: "Iceland Ísland.is — Do you need a visa?", embassyDirectory: "https://www.government.is/topics/foreign-affairs/visa-to-iceland/" },
  JM: { iso2: "JM", visaPortal: "https://www.pica.gov.jm/immigration/entry-visa-requirements", visaPortalLabel: "Jamaica PICA" },
  KZ: { iso2: "KZ", visaPortal: "https://www.vmp.gov.kz/", visaPortalLabel: "Kazakhstan VMP e-Visa" },
  KI: { iso2: "KI", visaPortal: "https://www.mfa.gov.ki/visa/", visaPortalLabel: "Kiribati MFA & Immigration" },
  XK: { iso2: "XK", visaPortal: "https://arkivi.mfa-ks.net/en/sherbimet_konsullore/505/kategorit-e-veanta-t-liruara-nga-viza/505.html", visaPortalLabel: "Kosovo MFA — visa info" },
  KG: { iso2: "KG", visaPortal: "https://www.evisa.e-gov.kg/", visaPortalLabel: "Kyrgyzstan e-Visa" },
  LA: { iso2: "LA", visaPortal: "https://laoevisa.gov.la/", visaPortalLabel: "Laos eVisa" },
  LS: { iso2: "LS", visaPortal: "https://www.homeaffairs.gov.ls/e-visa/", visaPortalLabel: "Lesotho e-Visa (Home Affairs)" },
  LR: { iso2: "LR", visaPortal: "https://visaonarrival.lis.gov.lr/", visaPortalLabel: "Liberia Visa on Arrival (LIS)", embassyDirectory: "https://www.mofa.gov.lr/" },
  LY: { iso2: "LY", visaPortal: "https://www.evisa.gov.ly/", visaPortalLabel: "Libya e-Visa" },
  LI: { iso2: "LI", visaPortal: "https://www.llv.li/en/national-administration/migration-and-passport-office/visa", visaPortalLabel: "Liechtenstein Migration & Passport Office" },
  MG: { iso2: "MG", visaPortal: "https://evisamada-mg.com/en/home", visaPortalLabel: "Madagascar eVisa" },
  MW: { iso2: "MW", visaPortal: "https://evisa.gov.mw/", visaPortalLabel: "Malawi e-Visa" },
  MV: { iso2: "MV", visaPortal: "https://imuga.immigration.gov.mv/", visaPortalLabel: "Maldives IMUGA" },
  ML: { iso2: "ML", visaPortal: "https://diplomatiemdc.gouv.ml/", visaPortalLabel: "Mali MFA (MDC)", localLanguagePortal: { language: "French", url: "https://diplomatiemdc.gouv.ml/" } },
  MH: { iso2: "MH", visaPortal: "https://rmiimmigration.org/", visaPortalLabel: "RMI Division of Immigration" },
  MR: { iso2: "MR", visaPortal: "https://anrpts.gov.mr/visa/requestvisa", visaPortalLabel: "Mauritania ANRPTS e-Visa" },
  MU: { iso2: "MU", visaPortal: "https://passport.govmu.org/passport/?page_id=605", visaPortalLabel: "Mauritius Passport & Immigration Office" },
  MD: { iso2: "MD", visaPortal: "https://mfa.gov.md/en/content/types-visas-requirements", visaPortalLabel: "Moldovan MFA", embassyDirectory: "https://evisa.gov.md/" },
  MC: { iso2: "MC", visaPortal: "https://monservicepublic.gouv.mc/en/themes/transport-and-mobility/travelling-abroad/visit-monaco/staying-in-monaco", visaPortalLabel: "Monaco — Visiting Monaco" },
  MN: { iso2: "MN", visaPortal: "https://evisa.mn/en/apply", visaPortalLabel: "Mongolia e-Visa" },
  ME: { iso2: "ME", visaPortal: "https://www.gov.me/en/government-of-montenegro/visas-and-entry-requirements", visaPortalLabel: "Montenegro — visas & entry requirements" },
  MZ: { iso2: "MZ", visaPortal: "https://evisa.gov.mz/", visaPortalLabel: "Mozambique eVisa/eTA" },
  MM: { iso2: "MM", visaPortal: "https://evisa.moip.gov.mm/", visaPortalLabel: "Myanmar eVisa (MOIP)" },
  NA: { iso2: "NA", visaPortal: "https://eservices.mhaiss.gov.na/visaonarrival", visaPortalLabel: "Namibia MHAISS e-Services" },
  NR: { iso2: "NR", visaPortal: "https://www.nauru.gov.nr/about-nauru/visiting-nauru/visa-requirements.aspx", visaPortalLabel: "Nauru Government — Visa Requirements", embassyDirectory: "https://justice.gov.nr/immigration-division/" },
  MK: { iso2: "MK", visaPortal: "https://mfa.gov.mk/en-GB/konzularni-uslugi/informacii-za-vlez-vo-rsm", visaPortalLabel: "North Macedonia MFA" },
  PW: { iso2: "PW", visaPortal: "https://palautravel.pw/", visaPortalLabel: "Palau Entry Form (BCBP)" },
  PG: { iso2: "PG", visaPortal: "https://ica.gov.pg/visa", visaPortalLabel: "Papua New Guinea ICA" },
  PY: { iso2: "PY", visaPortal: "https://www.mre.gov.py/visas/", visaPortalLabel: "Paraguay MRE", localLanguagePortal: { language: "Spanish", url: "https://www.mre.gov.py/visas/" } },
  RW: { iso2: "RW", visaPortal: "https://www.migration.gov.rw/visa/", visaPortalLabel: "Rwanda DGIE", embassyDirectory: "https://irembo.gov.rw/" },
  KN: { iso2: "KN", visaPortal: "https://www.knatravelform.kn/en", visaPortalLabel: "St Kitts & Nevis Electronic Border System" },
  LC: { iso2: "LC", visaPortal: "https://www.govt.lc/services/apply-for-saint-lucia-non-immigrant-visa", visaPortalLabel: "Government of Saint Lucia — Visa", embassyDirectory: "https://travelslu.govt.lc/en" },
  VC: { iso2: "VC", visaPortal: "https://security.gov.vc/security/index.php?option=com_content&view=article&id=53&Itemid=106", visaPortalLabel: "St Vincent Min. of National Security" },
  WS: { iso2: "WS", visaPortal: "https://www.mfat.gov.ws/visas/", visaPortalLabel: "Samoa MFAT" },
  SM: { iso2: "SM", visaPortal: "https://www.esteri.sm/pub1/EsteriSM/en/Servizi-per-utenza/Informazioni-per-chi-visita-SMR.html", visaPortalLabel: "San Marino MFA — Visiting" },
  SN: { iso2: "SN", visaPortal: "https://www.diplomatie.gouv.sn/visiter-le-senegal", visaPortalLabel: "Senegalese MFA", localLanguagePortal: { language: "French", url: "https://www.diplomatie.gouv.sn/visiter-le-senegal" } },
  RS: { iso2: "RS", visaPortal: "https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-requirements", visaPortalLabel: "Serbian MFA" },
  SC: { iso2: "SC", visaPortal: "https://seychelles.govtas.com/en", visaPortalLabel: "Seychelles Electronic Border System (SEBS)", embassyDirectory: "https://mfa.gov.sc/travelling-to-seychelles/" },
  SL: { iso2: "SL", visaPortal: "https://www.evisa.sl/", visaPortalLabel: "Sierra Leone eVisa" },
  SB: { iso2: "SB", visaPortal: "https://immigration.gov.sb/visas/", visaPortalLabel: "Solomon Islands Immigration" },
  SO: { iso2: "SO", visaPortal: "https://immigration.gov.so/en/visa/", visaPortalLabel: "Somalia ICA eTAS" },
  SS: { iso2: "SS", visaPortal: "https://mofaic.gov.ss/visas/", visaPortalLabel: "South Sudan MFAIC", embassyDirectory: "https://www.evisa.gov.ss/" },
  SR: { iso2: "SR", visaPortal: "https://suriname.vfsevisa.com/suriname/online/home/information", visaPortalLabel: "Suriname e-Visa", deliveryNote: "Operated by VFS on behalf of the Surinamese government. There is no separate gov.sr visa portal — VFS is the only official channel." },
  TJ: { iso2: "TJ", visaPortal: "https://www.evisa.tj/", visaPortalLabel: "Tajikistan e-Visa (MFA)" },
  TL: { iso2: "TL", visaPortal: "https://www.migracao.gov.tl/html/sub0301.php", visaPortalLabel: "Timor-Leste Immigration Service" },
  TG: { iso2: "TG", visaPortal: "https://voyage.gouv.tg/", visaPortalLabel: "Togo Voyage e-Visa", localLanguagePortal: { language: "French", url: "https://voyage.gouv.tg/" } },
  TO: { iso2: "TO", visaPortal: "https://www.revenue.gov.to/immigration-and-general-services", visaPortalLabel: "Tonga Immigration (Revenue & Customs)" },
  TT: { iso2: "TT", visaPortal: "https://nationalsecurity.gov.tt/divisions/immigrationdivision/evisa-online/", visaPortalLabel: "Trinidad & Tobago Min. of Homeland Security" },
  TM: { iso2: "TM", visaPortal: "https://www.mfa.gov.tm/en/articles/57", visaPortalLabel: "Turkmenistan MFA — Consular" },
  TV: { iso2: "TV", visaPortal: "https://www.tuvalu-immigration.tv/", visaPortalLabel: "Tuvalu Immigration" },
  UZ: { iso2: "UZ", visaPortal: "https://e-visa.gov.uz/", visaPortalLabel: "Uzbekistan e-Visa" },
  VU: { iso2: "VU", visaPortal: "https://immigration.gov.vu/visit/", visaPortalLabel: "Vanuatu Immigration" },
  VA: { iso2: "VA", visaPortal: "https://www.vaticanstate.va/en/", visaPortalLabel: "Vatican City — entry under Schengen rules" },
  VE: { iso2: "VE", visaPortal: "https://cancilleriadigital.mppre.gob.ve/", visaPortalLabel: "Venezuela MPPRE Cancillería Digital", localLanguagePortal: { language: "Spanish", url: "https://cancilleriadigital.mppre.gob.ve/" } },
  ZM: { iso2: "ZM", visaPortal: "https://eservices.zambiaimmigration.gov.zm/", visaPortalLabel: "Zambia Immigration e-Services" },
  ZW: { iso2: "ZW", visaPortal: "https://www.evisa.gov.zw/", visaPortalLabel: "Zimbabwe eVisa" },
};

// Origin-side travel-advice URLs published by the originating country's
// foreign-affairs ministry. Includes the headline four English-speaking
// advisory dashboards and a few national-language variants.
const ADVISORY_HOSTS: Record<string, { gov: string; baseUrl: (destIso: string) => string }> = {
  GB: {
    gov: "UK FCDO travel advice",
    baseUrl: (iso) => `https://www.gov.uk/foreign-travel-advice/${countryNameForFcdo(iso)}`,
  },
  US: {
    gov: "U.S. State Department travel advisories",
    baseUrl: () => "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html",
  },
  AU: {
    gov: "Smartraveller (Australia)",
    baseUrl: () => "https://www.smartraveller.gov.au/",
  },
  CA: {
    gov: "travel.gc.ca (Canada)",
    baseUrl: () => "https://travel.gc.ca/travelling/advisories",
  },
};

// Best-effort iso2 → gov.uk path-segment mapping. gov.uk uses lowercased,
// hyphenated country names ("united-states", "south-korea"). Fallback to the
// FCDO root if we don't know the segment.
function countryNameForFcdo(iso: string): string {
  const map: Record<string, string> = {
    US: "usa",
    GB: "united-kingdom",
    AE: "united-arab-emirates",
    KR: "south-korea",
    KP: "north-korea",
    SA: "saudi-arabia",
    NZ: "new-zealand",
    ZA: "south-africa",
    DO: "dominican-republic",
    CD: "democratic-republic-of-the-congo",
    CG: "republic-of-congo",
    CV: "cape-verde",
    CI: "ivory-coast",
    TR: "turkey",
    CZ: "czech-republic",
    SZ: "eswatini",
  };
  return map[iso] ?? iso.toLowerCase();
}

export function resourcesFor(iso2: string): CountryResources | undefined {
  return RESOURCES[iso2.toUpperCase()];
}

export function travelAdvisoriesForOrigin(originIso2: string, destIso2: string) {
  return Object.values(ADVISORY_HOSTS).map((host) => ({
    gov: host.gov,
    url: host.baseUrl(destIso2),
  }));
}

// Helper: returns advisories from anglophone countries (always useful) plus
// the originating country's own MFA where we have it.
export function generalAdvisoriesFor(destIso2: string): { gov: string; url: string }[] {
  return [
    { gov: ADVISORY_HOSTS.GB.gov, url: ADVISORY_HOSTS.GB.baseUrl(destIso2) },
    { gov: ADVISORY_HOSTS.US.gov, url: ADVISORY_HOSTS.US.baseUrl(destIso2) },
    { gov: ADVISORY_HOSTS.AU.gov, url: ADVISORY_HOSTS.AU.baseUrl(destIso2) },
    { gov: ADVISORY_HOSTS.CA.gov, url: ADVISORY_HOSTS.CA.baseUrl(destIso2) },
  ];
}
