/**
 * Immigration medical examinations — required on most skilled / long-stay
 * visas for AU, CA, NZ, UK, and US. Only authorised panel physicians can
 * sign these off; finding the right one in your home city is half the work.
 */
import type { RelocationService } from "@/lib/services";

export const MEDICAL_CHECKS: RelocationService[] = [
  {
    id: "mc-australia-panel",
    category: "medical_checks",
    provider: "Australian Home Affairs panel physicians",
    description:
      "Authoritative list of panel physicians and approved clinics worldwide that can perform the Health Examination (Subclass 482, 500, 189, 190, 500, 600, 802).",
    url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/health/find-an-approved-clinic-or-doctor",
    affiliate: false,
    globalAvailable: true,
    destinationIso2List: ["AU"],
    purposes: ["work", "study", "family"],
    badge: "official",
    cta: "Find a panel clinic",
  },
  {
    id: "mc-canada-panel",
    category: "medical_checks",
    provider: "Canada IRCC panel physicians",
    description:
      "IRCC's worldwide directory of panel physicians authorised to perform Canada immigration medicals. Required for permanent residence, most work permits, and study permits over 6 months.",
    url: "https://secure.cic.gc.ca/pp-md/pp-list.aspx",
    affiliate: false,
    globalAvailable: true,
    destinationIso2List: ["CA"],
    purposes: ["work", "study", "family"],
    badge: "official",
    cta: "Search by country",
  },
  {
    id: "mc-nz-panel",
    category: "medical_checks",
    provider: "New Zealand INZ panel physicians",
    description:
      "INZ's list of approved Panel Physicians worldwide. Required for Resident Visa (including Skilled Migrant Category) and most work-to-residence routes.",
    url: "https://www.immigration.govt.nz/new-zealand-visas/preparing-a-visa-application/your-health/panel-physicians",
    affiliate: false,
    globalAvailable: true,
    destinationIso2List: ["NZ"],
    purposes: ["work", "study", "family"],
    badge: "official",
    cta: "Find an INZ panel doctor",
  },
  {
    id: "mc-uk-tb-test",
    category: "medical_checks",
    provider: "UKVI TB testing clinics",
    description:
      "List of UKVI-approved tuberculosis testing clinics in high-incidence countries. Required for UK visa applications over 6 months from approximately 100 listed countries.",
    url: "https://www.gov.uk/tb-test-visa",
    affiliate: false,
    globalAvailable: true,
    destinationIso2List: ["GB"],
    purposes: ["work", "study", "family"],
    badge: "official",
    cta: "Find a UKVI TB clinic",
  },
  {
    id: "mc-us-panel-civil-surgeon",
    category: "medical_checks",
    provider: "USCIS Civil Surgeons (Form I-693)",
    description:
      "USCIS-designated civil surgeons in the US who can sign Form I-693 for adjustment-of-status applicants. Required for green-card applications.",
    url: "https://my.uscis.gov/findadoctor",
    affiliate: false,
    globalAvailable: false,
    destinationIso2List: ["US"],
    purposes: ["work", "family"],
    badge: "official",
    cta: "Find a Civil Surgeon",
  },
  {
    id: "mc-us-panel-physician-overseas",
    category: "medical_checks",
    provider: "US Embassy Panel Physicians (overseas)",
    description:
      "Embassy-designated panel physicians abroad for immigrant-visa medical exams (CR-1, IR-1, DV, K-1). Physician list is published by each US embassy.",
    url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-and-supporting-documents/step-6-complete-medical-examination.html",
    affiliate: false,
    globalAvailable: true,
    destinationIso2List: ["US"],
    purposes: ["work", "family"],
    badge: "official",
    cta: "Read State Dept guidance",
  },
];
