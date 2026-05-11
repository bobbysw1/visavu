/**
 * Ancestry / citizenship-by-descent routes.
 *
 * These programs are restricted by **family history**, not by passport —
 * a US citizen with an Italian-born grandparent qualifies for Italian
 * jure sanguinis the same way a Brazilian or Argentine citizen does.
 * The eligibility filter lives in the requirements field, not the
 * passport loop.
 *
 * Programs covered (10):
 *   IT Italian citizenship jure sanguinis
 *   IE Irish citizenship by descent (Foreign Births Register)
 *   PL Polish citizenship by descent
 *   DE German citizenship restoration (StAG §15)
 *   HU Hungarian simplified naturalisation (ethnic descent)
 *   IL Israeli Law of Return
 *   ES Iberoamerican accelerated citizenship (2-year residency)
 *   PT Portuguese citizenship by descent / Sephardic Jewish heritage
 *   GR Greek citizenship by descent
 *   LT Lithuanian citizenship restoration / by descent
 *
 * Source: each country's MFA / interior ministry. Verified 2026-05-11.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

export const totalCoverageAncestryAdapter: Adapter = {
  metadata: {
    id: "total_coverage_ancestry",
    name: "Total coverage — ancestry / citizenship by descent (IT jure sanguinis / IE FBR / PL / DE StAG / HU / IL / ES Iberoamerican / PT Sephardic / GR / LT)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/cittadinanza/",
      "https://www.dfa.ie/citizenship/born-abroad/registering-a-foreign-birth/",
      "https://www.gov.pl/web/mswia-en/confirmation-of-polish-citizenship",
      "https://www.bva.bund.de/EN/Services/Citizens/Citizenship-Law/citizenship-law_node.html",
      "https://allampolgarsag.gov.hu/en/",
      "https://www.gov.il/en/departments/topics/law_of_return/govil-landing-page",
      "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Servicios-al-ciudadano-otros-servicios.aspx",
      "https://justica.gov.pt/en/",
      "https://www.greekcitizenship.gr/",
      "https://migracija.lrv.lt/en/",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_ancestry.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_ancestry" }), fetchUrl: "manual://total_coverage_ancestry" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      // ---------- IT — Italian Citizenship Jure Sanguinis ----------
      if (passport !== "IT") {
        records.push({
          passportIso2: passport,
          destinationIso2: "IT",
          purpose: "family",
          status: "embassy_visa",
          label: "Italian Citizenship Jure Sanguinis (by blood)",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Have an Italian-born ancestor who was alive on 17 March 1861 (unification) or born after, who NEVER renounced Italian citizenship before the birth of the next descendant in the line",
            "Recent 2025 reform: now generally limited to 2 generations (parent or grandparent born Italian), or you must apply via the 'by judicial route' through the Italian courts",
            "Female-line transmission limited to descendants born after 1 January 1948 (administrative route); pre-1948 lines must go through Italian courts",
            "Apostilled birth, marriage, death certificates for every ancestor in the chain",
            "Certified translations into Italian for all foreign documents",
            "Letter of non-renunciation from each link's country of residence",
            "Application at consulate (3–4 year wait typical) OR moving to Italy and applying at the comune (much faster, 6–12 months)",
            "On approval: Italian citizenship by birth, full EU citizenship rights, passport issued",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 1460,
          applicationUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/cittadinanza/",
          primarySourceUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/cittadinanza/",
          fees: [
            { kind: "base", amountMinor: 60000, currency: "EUR", asOf: "2026-05-11", label: "Application fee (per applicant adult)", optional: false },
            { kind: "service", amountMinor: 80000, currency: "EUR", asOf: "2026-05-11", label: "Marca da bollo + certificates + apostilles (typical out-of-pocket)", optional: false },
          ],
          notes: "DL 36/2025 narrowed jure sanguinis significantly in March 2025 — most great-grandparent claims now require the judicial route (court case in Rome / Venice / Naples). Direct grandparent claims still administrative. Italian residency route is the fastest by far if you have time to relocate.",
        });
      }

      // ---------- IE — Irish Citizenship by Descent (FBR) ----------
      if (passport !== "IE") {
        records.push({
          passportIso2: passport,
          destinationIso2: "IE",
          purpose: "family",
          status: "embassy_visa",
          label: "Irish Citizenship by Descent — Foreign Births Register",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Have an Irish-born parent or grandparent OR a parent who was already on the FBR before YOUR birth",
            "Great-grandparent claims do NOT qualify directly — you must trace through a parent who registered on the FBR before your birth",
            "Apostilled birth, marriage, death certificates for the entire chain",
            "Online application through dfa.ie/citizenship",
            "On registration: full Irish + EU citizenship, eligible for Irish passport",
            "Processing currently runs 12–24 months (significant backlog as of 2026)",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 730,
          applicationUrl: "https://www.dfa.ie/citizenship/born-abroad/registering-a-foreign-birth/",
          primarySourceUrl: "https://www.dfa.ie/citizenship/born-abroad/registering-a-foreign-birth/",
          fees: [
            { kind: "base", amountMinor: 27800, currency: "EUR", asOf: "2026-05-11", label: "Foreign Births Register fee", optional: false },
          ],
          notes: "Backlog of 30,000+ applications as of 2025 — historically 6 months, now 12–24. Irish-born grandparent is the easiest route; great-grandparents only count if the chain of FBR registrations was kept current before each birth.",
        });
      }

      // ---------- PL — Polish Citizenship Confirmation ----------
      if (passport !== "PL") {
        records.push({
          passportIso2: passport,
          destinationIso2: "PL",
          purpose: "family",
          status: "embassy_visa",
          label: "Polish Citizenship Confirmation by Descent",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Have a Polish-citizen ancestor who emigrated AFTER 1920 (most common), AND who did NOT lose Polish citizenship",
            "Polish citizenship laws of 1920, 1951, and 1962 each had different loss provisions — Polish military service in a foreign army before 1951 was a typical loss event",
            "Apostilled documents for every ancestor in the chain (birth, marriage, military, naturalisation)",
            "If documents are in archives in Poland, the consulate / Voivode office can request them",
            "Procedure: 'confirmation of Polish citizenship' (Voivode), not naturalisation — you're declared to have ALWAYS been Polish if eligible",
            "Karta Polaka — separate from citizenship, gives many benefits for Polish-heritage applicants who can't fully document the chain",
            "On confirmation: full Polish + EU citizenship",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 720,
          applicationUrl: "https://www.gov.pl/web/mswia-en/confirmation-of-polish-citizenship",
          primarySourceUrl: "https://www.gov.pl/web/mswia-en/confirmation-of-polish-citizenship",
          fees: [
            { kind: "base", amountMinor: 24400, currency: "PLN", asOf: "2026-05-11", label: "Voivode application fee + apostilles + translations (typical total)", optional: false },
          ],
          notes: "Best for descendants of Polish emigrants of 1918–1939 era. Loss-of-citizenship rules are the trap — pre-1951 men who served in foreign militaries (US WWII vets) often lost it, breaking the chain.",
        });
      }

      // ---------- DE — German Citizenship by Restoration ----------
      if (passport !== "DE") {
        records.push({
          passportIso2: passport,
          destinationIso2: "DE",
          purpose: "family",
          status: "embassy_visa",
          label: "German Citizenship Restoration (StAG §15 / Persecution Descendants)",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Two main routes:",
            "(A) StAG §15 — descendant of persons persecuted by the Nazi regime 1933–1945 on political, racial or religious grounds (Article 116(2) Basic Law)",
            "(B) StAG §5 — child of a German parent born between 1949 and 1974 to a German MOTHER married to a non-German father (historic gender discrimination remedy)",
            "Naturalisation Reform 2024: Germany now broadly permits dual citizenship — earlier renunciation requirement removed",
            "Apostilled documents proving the chain back to the German-born ancestor",
            "Proof of persecution for StAG §15 (Jewish community records, expulsion documents, archive records)",
            "Application at BVA (Federal Office of Administration) or your nearest German consulate",
            "Typical processing 1–3 years (significant backlogs since 2024 reform)",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 1095,
          applicationUrl: "https://www.bva.bund.de/EN/Services/Citizens/Citizenship-Law/citizenship-law_node.html",
          primarySourceUrl: "https://www.bva.bund.de/EN/Services/Citizens/Citizenship-Law/citizenship-law_node.html",
          fees: [
            { kind: "base", amountMinor: 25500, currency: "EUR", asOf: "2026-05-11", label: "Naturalisation / restoration fee", optional: false },
          ],
          notes: "Germany's 2024 dual-citizenship reform massively widened eligibility — naturalising no longer requires renouncing your existing nationality. StAG §15 is the route for Jewish descendants of pre-1945 German nationals; StAG §5 for children of German mothers in the 1949–1974 cohort.",
        });
      }

      // ---------- HU — Hungarian Simplified Naturalisation ----------
      if (passport !== "HU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "HU",
          purpose: "family",
          status: "embassy_visa",
          label: "Hungarian Simplified Naturalisation (Ethnic Hungarian Descent)",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Ethnic Hungarian heritage — at least one ancestor who was a Hungarian citizen (typically pre-Treaty of Trianon 1920 territories: now in Romania, Slovakia, Serbia, Ukraine, Croatia)",
            "Basic conversational Hungarian (proven at consulate interview)",
            "No criminal record",
            "Apostilled documents tracing the chain back to the Hungarian-citizen ancestor",
            "Hungarian-language oath at the consulate or in Hungary",
            "Full Hungarian + EU citizenship granted; passport issued 3–6 months after oath",
            "No physical residency in Hungary required at any point",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 540,
          applicationUrl: "https://allampolgarsag.gov.hu/en/",
          primarySourceUrl: "https://allampolgarsag.gov.hu/en/",
          fees: [
            { kind: "base", amountMinor: 0, currency: "EUR", asOf: "2026-05-11", label: "Application fee (none — simplified procedure)", optional: false },
          ],
          notes: "One of the easiest EU citizenships by descent — no residency requirement, free of charge, faster than Italian. The Hungarian-language requirement is real (basic conversation) but not as demanding as Spain's DELE A2 for Iberoamerican route.",
        });
      }

      // ---------- IL — Israeli Law of Return ----------
      if (passport !== "IL") {
        records.push({
          passportIso2: passport,
          destinationIso2: "IL",
          purpose: "family",
          status: "embassy_visa",
          label: "Israeli Citizenship — Law of Return (Aliyah)",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Israeli consulate / Jewish Agency office",
          requirements: [
            "Eligible: Jewish (born to a Jewish mother or converted), OR a child/grandchild of a Jew, OR the spouse of any of the above",
            "Proof of Jewish heritage — synagogue records, prior Jewish marriage records, parent's bar/bat mitzvah records, rabbinical letter, immigration records, ketubah",
            "Conversion must be recognised by Israeli authorities (Orthodox / Conservative / Reform — Israel Rabbinical Council recognises all formal procedures)",
            "Aliyah application processed by Nefesh B'Nefesh (North America / UK) or local Jewish Agency office (elsewhere)",
            "Israeli citizenship granted automatically on arrival (Olim status)",
            "Sal Klita absorption basket (~₪35,000 / family) + tax benefits + Hebrew ulpan + employment support",
            "Renounce of prior citizenship NOT required",
          ],
          processingTimeDaysMin: 90,
          processingTimeDaysMax: 365,
          applicationUrl: "https://www.gov.il/en/departments/topics/law_of_return/govil-landing-page",
          primarySourceUrl: "https://www.gov.il/en/departments/topics/law_of_return/govil-landing-page",
          fees: [
            { kind: "base", amountMinor: 0, currency: "EUR", asOf: "2026-05-11", label: "Aliyah application fee (free)", optional: false },
          ],
          notes: "The world's most generous citizenship-by-heritage program — grandchildren of a single Jewish grandparent qualify, conversions are recognised broadly, the government pays YOU to move. Israeli passport is among the strongest globally for visa-free travel.",
        });
      }

      // ---------- ES — Spanish Iberoamerican Accelerated Citizenship ----------
      const IBEROAMERICAN = new Set([
        "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "GT", "HN", "MX",
        "NI", "PA", "PY", "PE", "PR", "SV", "UY", "VE", "PH", "GQ", "AD", "PT",
      ]);
      if (IBEROAMERICAN.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "ES",
          purpose: "family",
          status: "embassy_visa",
          label: "Spanish Citizenship by 2-year Iberoamerican Residence",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "National of an Iberoamerican country, Andorra, the Philippines, Equatorial Guinea, or Portugal",
            "Continuous LEGAL residence in Spain for 2 years (other nationals: 10 years)",
            "Spanish DELE A2 language exam (waived for Spanish-speaking applicants)",
            "Spanish CCSE constitutional & cultural knowledge exam",
            "No criminal record (both in Spain and home country)",
            "Renounce prior citizenship — BUT Spain has bilateral dual-nationality treaties with most Iberoamerican countries, so this is a formality (you keep your original)",
            "Apply through the Ministry of Justice once 2-year residence is complete",
            "On approval: Spanish + EU citizenship",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 1095,
          applicationUrl: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Servicios-al-ciudadano-otros-servicios.aspx",
          primarySourceUrl: "https://www.mjusticia.gob.es/",
          fees: [
            { kind: "base", amountMinor: 10100, currency: "EUR", asOf: "2026-05-11", label: "Citizenship application fee", optional: false },
          ],
          notes: "The fastest EU citizenship route for Latin American nationals — 2 years vs 10. Held up by long Ministry of Justice processing (1-3 years on top of the 2-year residence). Sephardic Jewish descendants had a parallel route through 2019 that's now closed.",
        });
      }

      // ---------- PT — Portuguese Citizenship by Descent ----------
      if (passport !== "PT") {
        records.push({
          passportIso2: passport,
          destinationIso2: "PT",
          purpose: "family",
          status: "embassy_visa",
          label: "Portuguese Citizenship by Descent",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Have a Portuguese parent or grandparent — straightforward attribution if a parent was Portuguese at the time of your birth",
            "Grandchildren claims: must demonstrate 'effective ties to the national community' (Portuguese language at A2+, regular Portugal visits, family / cultural connections)",
            "Sephardic Jewish heritage route CLOSED 2022 (no longer accepting new applications)",
            "Apostilled birth, marriage, citizenship-status documents for the chain",
            "Apply at a Portuguese Civil Registry office (Conservatória) or consulate",
            "On approval: Portuguese + EU citizenship + passport",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 720,
          applicationUrl: "https://justica.gov.pt/en/",
          primarySourceUrl: "https://justica.gov.pt/en/",
          fees: [
            { kind: "base", amountMinor: 17500, currency: "EUR", asOf: "2026-05-11", label: "Acquisition of nationality fee", optional: false },
          ],
          notes: "Portuguese parents = automatic citizenship at birth (jus sanguinis). Grandparent claims require demonstrating 'effective ties' — language test + tangible cultural connection. Sephardic Jewish route under Decree-Law 30-A/2022 closed for new applications.",
        });
      }

      // ---------- GR — Greek Citizenship by Descent ----------
      if (passport !== "GR") {
        records.push({
          passportIso2: passport,
          destinationIso2: "GR",
          purpose: "family",
          status: "embassy_visa",
          label: "Greek Citizenship by Descent",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Have a Greek parent (automatic citizenship by birth) OR a Greek-born grandparent (qualification process)",
            "Register the Greek ancestor's birth, your parent's birth, and your own birth in the Greek municipal records (Demos)",
            "Apostilled foreign documents + certified Greek translations",
            "If great-grandparent: case-by-case via the Greek embassy / consulate; not guaranteed",
            "Once registered: Greek + EU citizenship + passport eligibility",
            "Mandatory military service for males 19–45 (currently 1 year, can defer if living abroad)",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 540,
          applicationUrl: "https://www.greekcitizenship.gr/",
          primarySourceUrl: "https://www.greekcitizenship.gr/",
          fees: [
            { kind: "base", amountMinor: 10000, currency: "EUR", asOf: "2026-05-11", label: "Greek registry + citizenship documentation (typical)", optional: false },
          ],
          notes: "Greek-born grandparent is the typical sweet spot. The military-service obligation for males is the catch — most diaspora applicants can defer indefinitely while resident abroad, but coming home for an extended stay triggers it.",
        });
      }

      // ---------- LT — Lithuanian Citizenship Restoration ----------
      if (passport !== "LT") {
        records.push({
          passportIso2: passport,
          destinationIso2: "LT",
          purpose: "family",
          status: "embassy_visa",
          label: "Lithuanian Citizenship Restoration / by Descent",
          maxStayDays: 9999,
          validityDays: 9999,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Restoration route: descendant of a Lithuanian citizen who was a citizen of Lithuania pre-15 June 1940 (Soviet occupation) and lost citizenship as a result",
            "Descent route: child, grandchild, or great-grandchild of a former or current Lithuanian citizen",
            "Apostilled documents tracing the chain back to the Lithuanian-citizen ancestor",
            "Dual citizenship now broadly permitted under 2018 reform (was strict before)",
            "Litvak Jewish heritage applicants have a streamlined evidentiary path under specific provisions",
            "On approval: Lithuanian + EU citizenship + passport",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 540,
          applicationUrl: "https://migracija.lrv.lt/en/",
          primarySourceUrl: "https://migracija.lrv.lt/en/",
          fees: [
            { kind: "base", amountMinor: 22000, currency: "EUR", asOf: "2026-05-11", label: "Application + documentation fee (typical)", optional: false },
          ],
          notes: "Particularly popular among descendants of Litvaks (Lithuanian Jews who emigrated to South Africa / US / UK pre-1940). Dual-citizenship reform has made this much more attractive over the past 5 years.",
        });
      }
    }

    return { records };
  },
};
