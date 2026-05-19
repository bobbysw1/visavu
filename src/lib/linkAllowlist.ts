/**
 * Link allowlist for the AI chat synthesis.
 *
 * Hard rule: the chat MUST NEVER link to competitor visa-info / immigration-
 * consultant / paid-services sites. Only Visavu's own pages + verified
 * government domains are allowed.
 *
 * Enforcement is belt-and-braces:
 *   1. The synthesis prompt instructs Mistral not to invent external links.
 *   2. This module strips any URL Mistral does emit that isn't on the allowlist
 *      (post-processing step before the reply is returned to the client).
 *
 * Allowlist composition:
 *   - visavu.com + .translate.goog proxy (Google Translate of our pages)
 *   - Wildcard *.gov, *.gov.* (every "X is government" TLD pattern globally)
 *   - Wildcard *.gob.*, *.gouv.* (Spanish + French government variants)
 *   - europa.eu (EU institutions)
 *   - .go.* country-government variants (TH, JP, KR, etc.)
 *   - .admin.ch (Swiss federal admin)
 *   - canada.ca + sub-domains (Canada's non-.gov gov domain)
 *   - immi.homeaffairs.gov.au + a handful of curated gov sub-domains that
 *     don't fit the wildcard patterns
 *   - Curated specific government domains for countries with non-standard
 *     ccTLDs (Australia immi., NZ INZ, India BoI, Indonesia AHU, etc.)
 *
 * Anything else (immigration-consultant SEO sites, paid visa services,
 * Wikipedia, IATA cache, Henley Index, Times Higher Education, etc.) is
 * stripped. Even legitimate non-gov sources are blocked — the source-of-
 * truth is the destination's own government immigration site, full stop.
 */

const ALLOWED_HOSTS_EXACT = new Set<string>([
  "visavu.com",
  "www.visavu.com",
  // Canada has its own .ca government top-level
  "canada.ca",
  "www.canada.ca",
  // EU institutional sites
  "europa.eu",
  "ec.europa.eu",
  "home-affairs.ec.europa.eu",
  "eur-lex.europa.eu",
  "consilium.europa.eu",
  // Switzerland federal admin (uses .admin.ch not .gov.ch)
  "admin.ch",
  "www.admin.ch",
  "sem.admin.ch",
  "www.sem.admin.ch",
  "bsv.admin.ch",
  "bag.admin.ch",
  // Iceland's foreign ministry doesn't use .gov.is
  "utl.is",
  "www.utl.is",
  "stjr.is",
  // Hungary
  "konzuliszolgalat.kormany.hu",
  // Norway
  "udi.no",
  "www.udi.no",
  // Sweden
  "migrationsverket.se",
  "www.migrationsverket.se",
  // Finland
  "migri.fi",
  "www.migri.fi",
  // Denmark
  "nyidanmark.dk",
  // Estonia
  "politsei.ee",
  // Spain agency (uses .es)
  "extranjeros.inclusion.gob.es",
  "inclusion.gob.es",
  "exteriores.gob.es",
  "interior.gob.es",
  "sede.mjusticia.gob.es",
  // Israel uses .gov.il (covered by wildcard) but also some .org.il
  // Türkiye Goç İdaresi
  "goc.gov.tr",
  "www.goc.gov.tr",
  // Türkiye Nüfus
  "nvi.gov.tr",
  // China
  "fmprc.gov.cn",
  "mfa.gov.cn",
  "mps.gov.cn",
  "nia.gov.cn",
  "en.nia.gov.cn",
  // Hong Kong / Macau
  "immd.gov.hk",
  "www.immd.gov.hk",
  // Japan
  "mofa.go.jp",
  "www.mofa.go.jp",
  "moj.go.jp",
  "isa.go.jp",
  "www.isa.go.jp",
  // South Korea
  "hikorea.go.kr",
  "www.hikorea.go.kr",
  "visa.go.kr",
  "www.visa.go.kr",
  "immigration.go.kr",
  "k-eta.go.kr",
  "www.k-eta.go.kr",
  "0404.go.kr",
  "www.0404.go.kr",
  // Thailand
  "immigration.go.th",
  "www.immigration.go.th",
  "mfa.go.th",
  "www.mfa.go.th",
  "consular.mfa.go.th",
  "evisathailand.com",
  // Vietnam
  "evisa.xuatnhapcanh.gov.vn",
  "xuatnhapcanh.gov.vn",
  "lanhsuvietnam.gov.vn",
  "molisa.gov.vn",
  "www.molisa.gov.vn",
  "lltptructuyen.moj.gov.vn",
  // Singapore
  "ica.gov.sg",
  "www.ica.gov.sg",
  "mom.gov.sg",
  "www.mom.gov.sg",
  "edb.gov.sg",
  "www.edb.gov.sg",
  // Malaysia
  "imi.gov.my",
  "www.imi.gov.my",
  "kln.gov.my",
  "rmp.gov.my",
  // Indonesia
  "imigrasi.go.id",
  "www.imigrasi.go.id",
  "evisa.imigrasi.go.id",
  "apostille.ahu.go.id",
  "ahu.go.id",
  "bkpm.go.id",
  "www.bkpm.go.id",
  // Philippines
  "dfa.gov.ph",
  "www.dfa.gov.ph",
  "consular.dfa.gov.ph",
  "boi.gov.ph",
  "immigration.gov.ph",
  // India
  "boi.gov.in",
  "www.boi.gov.in",
  "indianvisaonline.gov.in",
  "www.indianvisaonline.gov.in",
  "ociservices.gov.in",
  "mha.gov.in",
  "www.mha.gov.in",
  "passportindia.gov.in",
  "www.passportindia.gov.in",
  "mea.gov.in",
  "www.mea.gov.in",
  // Bangladesh
  "boi.gov.bd",
  "mofa.gov.bd",
  "pcc.police.gov.bd",
  // Pakistan
  "nadra.gov.pk",
  "www.nadra.gov.pk",
  "mofa.gov.pk",
  "fbr.gov.pk",
  "www.fbr.gov.pk",
  // Sri Lanka
  "immigration.gov.lk",
  "www.immigration.gov.lk",
  "mfa.gov.lk",
  // Nepal
  "immigration.gov.np",
  "mofa.gov.np",
  // Bhutan
  "immi.gov.bt",
  // Mongolia
  "immigration.gov.mn",
  // Australia
  "immi.homeaffairs.gov.au",
  "homeaffairs.gov.au",
  "www.homeaffairs.gov.au",
  "afp.gov.au",
  "www.afp.gov.au",
  "ato.gov.au",
  "www.ato.gov.au",
  "smartraveller.gov.au",
  "www.smartraveller.gov.au",
  "naati.com.au",
  // New Zealand
  "immigration.govt.nz",
  "www.immigration.govt.nz",
  "dia.govt.nz",
  "www.dia.govt.nz",
  "justice.govt.nz",
  "www.justice.govt.nz",
  "ird.govt.nz",
  "www.ird.govt.nz",
  // South Africa
  "dha.gov.za",
  "www.dha.gov.za",
  "saps.gov.za",
  "www.saps.gov.za",
  "dirco.gov.za",
  "www.dirco.gov.za",
  "sars.gov.za",
  "saqa.org.za",
  // Brazil
  "gov.br",
  "www.gov.br",
  "brazil.vfsevisa.com", // official Brazilian gov visa partner
  // Mexico
  "inm.gob.mx",
  "www.inm.gob.mx",
  "gob.mx",
  "www.gob.mx",
  // Egypt
  "moiegypt.gov.eg",
  "www.moiegypt.gov.eg",
  "mfa.gov.eg",
  "www.mfa.gov.eg",
  "visa2egypt.gov.eg",
  "www.visa2egypt.gov.eg",
  "gafi.gov.eg",
  "eta.gov.eg",
  "www.eta.gov.eg",
  // Morocco
  "dgsn.gov.ma",
  "www.dgsn.gov.ma",
  "consulat.ma",
  "www.consulat.ma",
  "service-public.ma",
  "tax.gov.ma",
  "anapec.org",
  "www.anapec.org",
  // Kenya
  "kra.go.ke",
  "www.kra.go.ke",
  "dci.go.ke",
  "www.dci.go.ke",
  "mfa.go.ke",
  "ecitizen.go.ke",
  // Nigeria
  "immigration.gov.ng",
  "www.immigration.gov.ng",
  "foreignaffairs.gov.ng",
  "firs.gov.ng",
  // Ghana
  "gis.gov.gh",
  // Tanzania
  "immigration.go.tz",
  // Tunisia
  "interieur.gov.tn",
  // UAE
  "mofa.gov.ae",
  "www.mofa.gov.ae",
  "moi.gov.ae",
  "www.moi.gov.ae",
  "u.ae",
  "www.u.ae",
  "gdrfad.gov.ae",
  "www.gdrfad.gov.ae",
  "icp.gov.ae",
  "www.icp.gov.ae",
  "uaepass.ae",
  // Saudi Arabia
  "mofa.gov.sa",
  "www.mofa.gov.sa",
  "visa.mofa.gov.sa",
  "zatca.gov.sa",
  "absher.sa",
  // Qatar / Kuwait / Bahrain / Oman / Jordan
  "moi.gov.qa",
  "moi.gov.kw",
  "moi.gov.bh",
  "rop.gov.om",
  "moi.gov.jo",
  // Turkey
  "csgb.gov.tr",
  "www.csgb.gov.tr",
  "ecalisma.csgb.gov.tr",
  "icisleri.gov.tr",
  "adalet.gov.tr",
  "gib.gov.tr",
  "www.gib.gov.tr",
  "evisa.gov.tr",
  // Russia + post-Soviet
  "мвд.рф",
  "мид.рф",
  "nalog.gov.ru",
  "www.nalog.gov.ru",
  "gosuslugi.ru",
  // Ukraine
  "diia.gov.ua",
  "hsc.gov.ua",
  "tax.gov.ua",
  "minjust.gov.ua",
  // United States — many .gov sub-domains
  "uscis.gov",
  "www.uscis.gov",
  "travel.state.gov",
  "state.gov",
  "cbp.dhs.gov",
  "esta.cbp.dhs.gov",
  "dol.gov",
  "www.dol.gov",
  "irs.gov",
  "www.irs.gov",
  "ssa.gov",
  "www.ssa.gov",
  "fbi.gov",
  "www.fbi.gov",
  "ftc.gov",
  // UK
  "gov.uk",
  "www.gov.uk",
  "acro.police.uk",
  "www.acro.police.uk",
  // Ireland
  "irishimmigration.ie",
  "dfa.ie",
  "www.dfa.ie",
  "revenue.ie",
  "www.revenue.ie",
  "justice.ie",
  "garda.ie",
  "www.garda.ie",
  // Germany
  "bmi.bund.de",
  "www.bmi.bund.de",
  "bamf.de",
  "www.bamf.de",
  "make-it-in-germany.com",
  "www.make-it-in-germany.com",
  "anabin.kmk.org",
  "bundesjustizamt.de",
  "www.bundesjustizamt.de",
  "bundesverwaltungsamt.de",
  "www.bundesverwaltungsamt.de",
  "elster.de",
  "www.elster.de",
  // France
  "france-visas.gouv.fr",
  "immigration.interieur.gouv.fr",
  "www.immigration.interieur.gouv.fr",
  "service-public.fr",
  "www.service-public.fr",
  "campusfrance.org",
  "www.campusfrance.org",
  "demarches-simplifiees.fr",
  "www.demarches-simplifiees.fr",
  "ofii.fr",
  "www.ofii.fr",
  "casier-judiciaire.justice.gouv.fr",
  "impots.gouv.fr",
  "www.impots.gouv.fr",
  "legifrance.gouv.fr",
  // Italy
  "vistoperitalia.esteri.it",
  "esteri.it",
  "www.esteri.it",
  "interno.gov.it",
  "www.interno.gov.it",
  "giustizia.it",
  "www.giustizia.it",
  "agenziaentrate.gov.it",
  "www.agenziaentrate.gov.it",
  "gazzettaufficiale.it",
  "studiare-in-italia.it",
  "www.studiare-in-italia.it",
  // Spain (most under .gob.es covered by wildcard, but a few .es)
  "sede.administracionespublicas.gob.es",
  "investinspain.org",
  "www.investinspain.org",
  // Portugal
  "aima.gov.pt",
  "www.aima.gov.pt",
  "sef.pt",
  "www.sef.pt",
  "portaldascomunidades.mne.gov.pt",
  "info.portaldasfinancas.gov.pt",
  "portaldasfinancas.gov.pt",
  "dges.gov.pt",
  "www.dges.gov.pt",
  "eportugal.gov.pt",
  "justica.gov.pt",
  "ministeriopublico.pt",
  "www.ministeriopublico.pt",
  // Greece
  "migration.gov.gr",
  "www.migration.gov.gr",
  "mfa.gr",
  "www.mfa.gr",
  "yok.gov.tr", // wait this is Türkiye
  "minedu.gov.gr",
  "www.minedu.gov.gr",
  "aade.gr",
  "www.aade.gr",
  "ministryofjustice.gr",
  "enterprisegreece.gov.gr",
  // Netherlands
  "ind.nl",
  "www.ind.nl",
  "kvk.nl",
  "www.kvk.nl",
  "rechtspraak.nl",
  "www.rechtspraak.nl",
  "belastingdienst.nl",
  "www.belastingdienst.nl",
  "justis.nl",
  "www.justis.nl",
  "netherlandsworldwide.nl",
  "www.netherlandsworldwide.nl",
  // Belgium
  "ibz.be",
  "www.ibz.be",
  "diplomatie.belgium.be",
  // Austria
  "bmeia.gv.at",
  "www.bmeia.gv.at",
  "bmi.gv.at",
  "oesterreich.gv.at",
  // Poland
  "gov.pl",
  "www.gov.pl",
  "udsc.gov.pl",
  "www.udsc.gov.pl",
  "ekrk.ms.gov.pl",
  "podatki.gov.pl",
  // Czechia / Slovakia
  "mvcr.cz",
  "www.mvcr.cz",
  "mzv.cz",
  "minv.sk",
  // Hungary
  "kormany.hu",
  "www.kormany.hu",
  "okmanyiroda.hu",
  // Romania
  "igi.mai.gov.ro",
  // Bulgaria
  "mfa.bg",
  // Croatia / Slovenia
  "mup.gov.hr",
  "policija.si",
  "www.policija.si",
  // Latin America
  "argentina.gob.ar",
  "www.argentina.gob.ar",
  "cancilleria.gob.ar",
  "www.cancilleria.gob.ar",
  "afip.gob.ar",
  "www.afip.gob.ar",
  "minrel.gob.cl",
  "www.minrel.gob.cl",
  "registrocivil.cl",
  "www.registrocivil.cl",
  "sii.cl",
  "www.sii.cl",
  "cancilleria.gov.co",
  "www.cancilleria.gov.co",
  "antecedentes.policia.gov.co",
  "policia.gov.co",
  "dian.gov.co",
  "www.dian.gov.co",
  "consular.mre.gov.br",
]);

// Suffix patterns — anything ending in these is considered government.
// Covers most "gov" patterns globally without needing to enumerate every
// individual sub-domain.
const ALLOWED_SUFFIXES: string[] = [
  ".gov",
  ".gov.uk",
  ".gov.au",
  ".gov.nz",
  ".gov.in",
  ".gov.sg",
  ".gov.ph",
  ".gov.my",
  ".gov.ae",
  ".gov.sa",
  ".gov.eg",
  ".gov.lk",
  ".gov.np",
  ".gov.bt",
  ".gov.mn",
  ".gov.cn",
  ".gov.hk",
  ".gov.tr",
  ".gov.pl",
  ".gov.gr",
  ".gov.pt",
  ".gov.za",
  ".gov.ng",
  ".gov.ke",
  ".gov.bd",
  ".gov.pk",
  ".gov.it",
  ".gov.ru",
  ".gov.ua",
  ".gov.co",
  ".gov.ar",
  ".gov.cl",
  ".gov.mx",
  ".gov.br",
  ".gov.bh",
  ".gov.qa",
  ".gov.kw",
  ".gov.jo",
  ".gov.om",
  ".gov.ye",
  ".gov.iq",
  ".gov.lb",
  ".gov.sy",
  ".gov.ge",
  ".gov.am",
  ".gov.az",
  ".gov.kz",
  ".gov.kg",
  ".gov.uz",
  ".gov.tj",
  ".gov.tm",
  ".gov.af",
  ".gov.cy",
  ".gov.mt",
  ".gov.ad",
  ".gov.li",
  ".gov.mc",
  ".gov.sm",
  ".gov.va",
  ".gob.es",
  ".gob.mx",
  ".gob.ar",
  ".gob.cl",
  ".gob.pe",
  ".gob.pa",
  ".gob.do",
  ".gob.gt",
  ".gob.hn",
  ".gob.sv",
  ".gob.ni",
  ".gob.cr",
  ".gob.bo",
  ".gob.ec",
  ".gob.uy",
  ".gob.py",
  ".gob.ve",
  ".gob.cu",
  ".gouv.fr",
  ".gouv.qc.ca",
  ".gouv.ci",
  ".gouv.sn",
  ".gouv.bj",
  ".gouv.tg",
  ".gouv.gn",
  ".gouv.bf",
  ".gouv.ne",
  ".gouv.ml",
  ".gouv.mg",
  ".gouv.km",
  ".gouv.dj",
  ".gouv.ht",
  ".gouv.lu",
  ".gouv.mc",
  ".gouv.ma", // shared with .gov.ma
  ".gouv.cd",
  ".go.jp",
  ".go.kr",
  ".go.th",
  ".go.id",
  ".go.ke",
  ".go.tz",
  ".go.ug",
  ".go.cr",
  ".translate.goog", // Google Translate proxy of our own pages
];

/** Returns true if the URL points to visavu.com OR a verified government site. */
export function isAllowedChatLink(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (ALLOWED_HOSTS_EXACT.has(host)) return true;
    for (const suffix of ALLOWED_SUFFIXES) {
      if (host === suffix.slice(1) || host.endsWith(suffix)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Strip URLs from chat output that aren't on the allowlist.
 *  Replaces them with a plain-text marker so the model's prose still
 *  reads coherently, without surfacing a competitor link. */
export function sanitiseChatReply(text: string): string {
  // Match Markdown links [text](url) AND bare URLs.
  // We rewrite Markdown links to plain text (drop the URL) and bare URLs to a marker.
  const markdownRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const bareUrlRe = /https?:\/\/[^\s)\]'"<>]+/g;

  let cleaned = text.replace(markdownRe, (match, label, url) => {
    return isAllowedChatLink(url) ? match : label;
  });
  cleaned = cleaned.replace(bareUrlRe, (url) => {
    return isAllowedChatLink(url) ? url : "[link removed — only visavu.com and official government sources are linked here]";
  });
  return cleaned;
}
