/**
 * India visa categories adapter.
 *
 * India's visa system has ~20 distinct categories but most users only see
 * the e-Tourist Visa surfaced from the Wikipedia visa-policy page (the
 * adapter that mirrors most of the world's tourism data). Reality:
 * Japanese / German / British / American etc. travellers have at least a
 * dozen routes available: e-Business, e-Conference, e-Medical, Employment
 * (E-class), Business (B-class), Student (S-class), Research (R-class),
 * Project, Journalist, plus OCI for foreign citizens of Indian origin and
 * VOA at airports for select nationalities (Japan, South Korea, UAE since
 * 2023).
 *
 * This adapter emits the eight most-used categories for the broad eligible-
 * nationality set, so that /JP/IN and /US/IN and /DE/IN and friends show
 * the genuine choice of routes instead of "1 e-Tourist Visa and that's it".
 *
 * Sources:
 *   - Bureau of Immigration: https://boi.gov.in/content/all-visa-categories
 *   - Indian Visa Online: https://indianvisaonline.gov.in/
 *   - e-Visa portal: https://indianvisaonline.gov.in/evisa/
 *   - MHA visa policy: https://www.mha.gov.in/
 *
 * Refresh quarterly. The categories themselves are stable (defined in the
 * Foreigners Order 1948 and Visa Manual 2019), but fees + processing
 * times revise periodically and the VOA / e-Visa eligibility lists shift.
 *
 * For e-Tourist + e-Business categories, the Wikipedia long-tail adapter
 * already emits these — we DON'T re-emit them here to avoid duplicate
 * rows. Instead this adapter focuses on the embassy-applied categories
 * (Employment, Student, Research, Project, Journalist) and the niche
 * special categories (Medical, Conference, OCI, VOA).
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const APPLY_URL = "https://indianvisaonline.gov.in/visa/";
const EVISA_URL = "https://indianvisaonline.gov.in/evisa/";
const BOI_URL = "https://boi.gov.in/content/all-visa-categories";

// Nationalities eligible for India e-Visa (165 countries) — used by the
// e-Medical and e-Conference variants. Roughly = "every country with
// diplomatic relations with India" minus a handful of restricted ones.
const EVISA_ELIGIBLE = new Set<string>(
  COUNTRY_LIST.map((c) => c.iso2).filter(
    (iso) => !["IN", "KP", "PK", "BD"].includes(iso),
  ),
);

// VOA at Indian airports — Japan, South Korea, UAE (since 2014/2017/2023).
const VOA_ELIGIBLE = new Set(["JP", "KR", "AE"]);

// India bans / refuses entry for certain passports under MEA orders.
const REFUSED = new Set<string>([]);

const ALL = COUNTRY_LIST.map((c) => c.iso2);
const EXCLUDED = new Set(["IN"]);

export const indiaVisaCategoriesAdapter: Adapter = {
  metadata: {
    id: "in_visa_categories",
    name: "India visa categories — Employment, Student, Research, OCI, VOA + e-Medical / e-Conference",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [APPLY_URL, EVISA_URL, BOI_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/in_visa_categories.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "in_visa_categories" }), fetchUrl: "manual://in_visa_categories" };
  },

  async parse() {
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      if (EXCLUDED.has(passport)) continue;
      if (REFUSED.has(passport)) continue;

      // ─── 1. Employment Visa (E-class) — work for an Indian employer ───
      records.push({
        passportIso2: passport,
        destinationIso2: "IN",
        purpose: "work",
        status: "embassy_visa",
        label: "Employment Visa (E-class) — India",
        maxStayDays: 365, // initial 1-year; extendable in-country to 5 years cumulative
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        blankPagesRequired: 2,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Indian consulate / VFS Global centre",
        requirements: [
          "Employment offer from a registered Indian company",
          "Minimum salary USD 25,000/year (excluding ethnic cooks, language teachers, embassy staff)",
          "Indian employer's incorporation documents + tax PAN",
          "Petition letter from the Indian employer detailing scope of work + duration",
          "Education + professional credentials (apostilled / attested by your home Ministry of Foreign Affairs)",
          "Police clearance certificate from home country",
          "Medical certificate (TB / HIV / yellow fever)",
          "FRRO (Foreigners Regional Registration Office) registration within 14 days of arrival for stays > 180 days",
        ],
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 30,
        applicationUrl: APPLY_URL,
        primarySourceUrl: BOI_URL,
        fees: [
          { kind: "base" as const, amountMinor: 10000_00, currency: "USD", asOf: today, label: "Employment Visa (1-year, USD 100)" },
          { kind: "service" as const, amountMinor: 1900_00, currency: "INR", asOf: today, label: "FRRO registration fee", optional: false },
        ],
        notes: "India's main work-permit route. Salary threshold of USD 25,000/year filters out lower-skilled employment. Renewable in-country at the FRRO for cumulative stays up to 5 years. Dependants (spouse + children under 18) get the X-Misc visa as accompanying family.",
        purposeMetadata: {
          sponsorshipRequired: true,
          jobOfferRequired: true,
          salaryThresholdMinor: 25_000_00, // USD 25k/year stored as cents
          salaryCurrency: "USD",
          routeToSettlement: false,
          // Surface this on /finder?goal=live_work for the relevant passport.
          finderGoals: ["live_work"],
        },
      });

      // ─── 2. Business Visa (B-class, embassy) ───
      records.push({
        passportIso2: passport,
        destinationIso2: "IN",
        purpose: "business",
        status: "embassy_visa",
        label: "Business Visa (B-class) — India",
        maxStayDays: 180,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        blankPagesRequired: 2,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Indian consulate / VFS Global centre",
        requirements: [
          "Letter of invitation from Indian business partner / host company on letterhead",
          "Your employer's letter confirming business purpose, financial responsibility, and your return",
          "Indian company's incorporation + tax-registration documents",
          "Itinerary of meetings, conferences, trade fairs",
          "Bank statements (last 6 months) showing sufficient funds",
          "Proof of professional status (CV, business cards, company letterhead)",
          "Multi-year B-class (5-year / 10-year) available for qualifying nationalities + corporate frequent travellers",
        ],
        processingTimeDaysMin: 5,
        processingTimeDaysMax: 14,
        applicationUrl: APPLY_URL,
        primarySourceUrl: BOI_URL,
        fees: [
          { kind: "base" as const, amountMinor: 10000_00, currency: "USD", asOf: today, label: "Business Visa (1-year, USD 100)" },
        ],
        notes: "For meetings, conferences, contract negotiations, and trade-fair attendance only — paid employment requires an Employment Visa. Multi-year (5-year / 10-year) options available for US, UK, EU, Japanese, Korean, Australian, Singaporean business travellers with prior India travel history.",
      });

      // ─── 3. Student Visa (S-class) ───
      records.push({
        passportIso2: passport,
        destinationIso2: "IN",
        purpose: "study",
        status: "embassy_visa",
        label: "Student Visa (S-class) — India",
        maxStayDays: 365 * 5,
        validityDays: 365 * 5,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        blankPagesRequired: 2,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Indian consulate / VFS Global centre",
        requirements: [
          "Admission letter from a recognised Indian educational institution (UGC / AICTE / Medical Council-approved)",
          "Proof of financial means — typically USD 10,000+/year in living costs and tuition",
          "AYUSH-specific route for Indian Systems of Medicine (Ayurveda, Yoga, Unani, Siddha, Homeopathy) under the AYUSH Visa",
          "FRRO registration within 14 days of arrival for stays > 180 days",
          "Re-validation after each academic year via the educational institution",
        ],
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 30,
        applicationUrl: APPLY_URL,
        primarySourceUrl: BOI_URL,
        fees: [
          { kind: "base" as const, amountMinor: 10000_00, currency: "USD", asOf: today, label: "Student Visa (full course, USD 100)" },
        ],
        notes: "Issued for the full duration of the academic course (typically 3-5 years). Permits part-time work only with explicit authorisation. Medical (MBBS) and Engineering (B.Tech) are the most-applied programmes for international students. India is the world's third-largest education exporter after the US and UK.",
        purposeMetadata: {
          financialProofMonthlyMinor: 800_00, // ~USD 800/month
          financialProofCurrency: "USD",
          englishRequirement: "Course-dependent — most courses are English-medium",
          finderGoals: ["study"],
        },
      });

      // ─── 4. Research Visa (R-class) ───
      records.push({
        passportIso2: passport,
        destinationIso2: "IN",
        purpose: "study",
        status: "embassy_visa",
        label: "Research Visa (R-class) — India",
        maxStayDays: 365 * 3,
        validityDays: 365 * 3,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        blankPagesRequired: 2,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Indian consulate / VFS Global centre",
        requirements: [
          "Sponsorship letter from a recognised Indian research institution (CSIR / DRDO / ISRO / IIT / IISc / IISER)",
          "MHA (Ministry of Home Affairs) clearance for sensitive research areas",
          "Sensitive-research-area approval from concerned ministry (defence, biotech, space) where applicable",
          "Project plan and scope of research",
          "FRRO registration within 14 days of arrival",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: APPLY_URL,
        primarySourceUrl: BOI_URL,
        fees: [
          { kind: "base" as const, amountMinor: 10000_00, currency: "USD", asOf: today, label: "Research Visa (annual, USD 100)" },
        ],
        notes: "Specifically for research / PhD-level work at Indian institutions. The MHA clearance step (90+ days additional processing) applies if research touches defence / nuclear / biotech / cartography / satellite / drone fields. Renewable annually for the duration of the research project.",
      });

      // ─── 5. e-Medical Visa ───
      if (EVISA_ELIGIBLE.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "IN",
          purpose: "family",
          status: "e_visa",
          label: "e-Medical Visa — India",
          maxStayDays: 60,
          validityDays: 120,
          entriesAllowed: "multiple", // triple-entry
          passportValidityMonthsRequired: 6,
          blankPagesRequired: 2,
          onwardTicketRequired: true,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "On arrival at Indian airport",
          requirements: [
            "Letter from the Indian hospital (NABH-accredited or recognised) confirming the medical procedure + duration",
            "Estimate of treatment costs from the Indian hospital",
            "Triple-entry within 120 days from date of arrival (initial + 2 re-entries)",
            "Apply online at indianvisaonline.gov.in/evisa, 4-30 days before travel",
            "Available at designated airports (most major + 5 seaports)",
            "Up to 2 e-Medical Attendant visas can be issued to accompanying family members (spouse + blood relative)",
          ],
          processingTimeDaysMin: 3,
          processingTimeDaysMax: 7,
          applicationUrl: EVISA_URL,
          primarySourceUrl: EVISA_URL,
          fees: [
            { kind: "base" as const, amountMinor: 8000_00, currency: "USD", asOf: today, label: "e-Medical Visa (60 days, triple entry, USD 80)" },
          ],
          notes: "India is a major medical-tourism destination — cardiac surgery, organ transplant, joint replacement, oncology, IVF, ayurveda treatments at NABH / JCI-accredited hospitals in Chennai, Bangalore, Hyderabad, Mumbai, Delhi. The e-Medical Attendant visa lets a spouse + one blood relative accompany the patient. Eligible for 165+ nationalities.",
        });

        // ─── 6. e-Conference Visa ───
        records.push({
          passportIso2: passport,
          destinationIso2: "IN",
          purpose: "business",
          status: "e_visa",
          label: "e-Conference Visa — India",
          maxStayDays: 30,
          validityDays: 30,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 6,
          blankPagesRequired: 2,
          onwardTicketRequired: true,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "On arrival at Indian airport",
          requirements: [
            "Conference clearance from the Ministry of Home Affairs (MHA) — conference organiser handles this",
            "Invitation letter from the conference / seminar / workshop organiser",
            "Apply online at indianvisaonline.gov.in/evisa, 4-30 days before travel",
            "Single entry, max 30 days",
            "Permitted: attending conferences / seminars / workshops organised by ministries / departments / PSUs / NGOs registered with the central government",
            "PROHIBITED: business meetings outside the conference scope — use e-Business Visa for those",
          ],
          processingTimeDaysMin: 3,
          processingTimeDaysMax: 7,
          applicationUrl: EVISA_URL,
          primarySourceUrl: EVISA_URL,
          fees: [
            { kind: "base" as const, amountMinor: 8000_00, currency: "USD", asOf: today, label: "e-Conference Visa (30 days, single entry, USD 80)" },
          ],
          notes: "Conference Visa is dedicated to attending pre-approved academic / professional events. The conference organiser must obtain MHA clearance and provide attendees with the clearance reference — without it, the e-Conference Visa application will be rejected.",
        });
      }

      // ─── 7. OCI Card (Overseas Citizen of India) ───
      records.push({
        passportIso2: passport,
        destinationIso2: "IN",
        purpose: "family",
        status: "embassy_visa",
        label: "OCI Card (Overseas Citizen of India) — lifetime multi-entry",
        maxStayDays: 365 * 100, // lifetime
        validityDays: 365 * 100,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        blankPagesRequired: 2,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Indian consulate / VFS Global centre / OCI Miscellaneous Services",
        requirements: [
          "Eligibility: any person who was an Indian citizen on or after 26-Jan-1950, or was eligible to be one, or is a child / grandchild / great-grandchild of such person, or is a spouse of an OCI / Indian citizen (with at least 2 years of registered marriage)",
          "Indian-citizenship renunciation certificate (if you naturalised as a foreign citizen — required BEFORE applying for OCI)",
          "Original birth + marriage certificates of self and ancestor",
          "Proof of Indian ancestry (parent / grandparent / great-grandparent Indian passport, birth certificate, school records)",
          "Apply via ociservices.gov.in — fee USD 275 + biometric appointment at Indian consulate",
          "Re-issue OCI card whenever you renew your foreign passport before age 20 + after age 50",
          "OCI provides: lifetime visa-free entry to India, no FRRO registration regardless of stay duration, parity for most resident rights (education, banking, property except agricultural land)",
          "OCI does NOT provide: Indian citizenship, voting rights, eligibility for public office, right to acquire agricultural / plantation / farm land",
        ],
        processingTimeDaysMin: 56,
        processingTimeDaysMax: 84,
        applicationUrl: "https://ociservices.gov.in/",
        primarySourceUrl: "https://www.mha.gov.in/",
        fees: [
          { kind: "base" as const, amountMinor: 27500_00, currency: "USD", asOf: today, label: "OCI Card (lifetime, USD 275)" },
        ],
        notes: "OCI is the closest India offers to dual citizenship (India does not formally permit dual citizenship under Constitution Article 9). Lifetime status, but the card must be re-issued each time you renew your foreign passport before age 20 + after age 50. Particularly common for second-generation Indian-Americans, Indo-Canadians, Indo-Brits using it for extended India stays + business + education.",
      });

      // ─── 8. Visa on Arrival (VOA) for JP / KR / AE ───
      if (VOA_ELIGIBLE.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "IN",
          purpose: "tourism",
          status: "visa_on_arrival",
          label: "Visa on Arrival (VOA) — India",
          maxStayDays: 60,
          validityDays: 60,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 6,
          blankPagesRequired: 2,
          onwardTicketRequired: true,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "On arrival at designated Indian airport",
          requirements: [
            "Citizen of Japan, South Korea, or UAE only",
            "Travel for tourism, business meetings, medical treatment, or conference (single entry)",
            "Available at six designated airports: Bengaluru, Chennai, Delhi, Hyderabad, Kolkata, Mumbai",
            "Maximum 2 VOAs per calendar year per passport",
            "PROHIBITED at land borders + seaports (VOA is airport-only)",
            "Onward ticket + accommodation evidence required at immigration",
          ],
          processingTimeDaysMin: 0,
          processingTimeDaysMax: 0,
          applicationUrl: BOI_URL,
          primarySourceUrl: BOI_URL,
          fees: [
            { kind: "base" as const, amountMinor: 200000, currency: "INR", asOf: today, label: "VOA fee (INR 2,000, payable on arrival)" },
          ],
          notes: "VOA is restricted to Japanese, South Korean, and Emirati passport holders only — a special bilateral arrangement extended progressively (Japan 2014, South Korea 2018, UAE 2023). All other travellers use the e-Tourist Visa or embassy-issued Tourist Visa. Maximum 2 VOAs per year — for more frequent visits, switch to the e-Tourist or regular Tourist Visa.",
        });
      }
    }

    return { records };
  },
};
