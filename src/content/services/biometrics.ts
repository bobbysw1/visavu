/**
 * Biometrics appointment providers — the visa application centres that
 * handle the fingerprint + photo step on behalf of embassies. Informational
 * (we don't earn referrals from them), but extremely useful to surface on
 * embassy-visa routes because the right centre is non-obvious.
 */
import type { RelocationService } from "@/lib/services";

export const BIOMETRICS: RelocationService[] = [
  {
    id: "bi-vfs-global",
    category: "biometrics",
    provider: "VFS Global",
    description:
      "World's largest outsourced visa-application-centre operator. Handles biometrics + document submission for 60+ destination governments including UK, Canada, Schengen states, Australia, India, and South Africa.",
    url: "https://visa.vfsglobal.com/",
    affiliate: false,
    globalAvailable: true,
    badge: "official",
    destinationIso2List: ["GB", "CA", "AU", "IN", "ZA", "IE", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "PT", "FI", "DK", "SE", "NO", "PL", "CZ", "HU"],
    cta: "Find your VAC",
  },
  {
    id: "bi-tlscontact",
    category: "biometrics",
    provider: "TLScontact",
    description:
      "Visa-centre operator used by France, Switzerland, the UK (in many origin countries), and others. Books biometrics, accepts fees, and forwards the application to the embassy.",
    url: "https://www.tlscontact.com/",
    affiliate: false,
    globalAvailable: true,
    badge: "official",
    destinationIso2List: ["FR", "CH", "GB", "BE", "AT", "ES", "DE", "IT", "DK", "NO", "SE"],
    cta: "Book at TLScontact",
  },
  {
    id: "bi-bls-international",
    category: "biometrics",
    provider: "BLS International",
    description:
      "Visa-centre operator handling Spain, Portugal, Italy (in some markets), and several Gulf-state biometrics. Required step for many Schengen routes.",
    url: "https://www.blsinternational.com/",
    affiliate: false,
    globalAvailable: true,
    badge: "official",
    destinationIso2List: ["ES", "PT", "IT", "AE", "QA"],
    cta: "Find a BLS centre",
  },
  {
    id: "bi-cgi-federal",
    category: "biometrics",
    provider: "CGI Federal (US Visa)",
    description:
      "Operates the US visa appointment system in most countries. Books the consular interview and (where required) the OFC (Off-site Facility) fingerprint step.",
    url: "https://ais.usvisa-info.com/",
    affiliate: false,
    globalAvailable: true,
    badge: "official",
    destinationIso2List: ["US"],
    cta: "Book US visa appointment",
  },
  {
    id: "bi-uscis-asc",
    category: "biometrics",
    provider: "USCIS Application Support Centers",
    description:
      "Official US biometrics centres for adjustment-of-status, naturalisation, and asylum applicants already in the US. Appointment scheduled by USCIS after your application is filed.",
    url: "https://www.uscis.gov/about-us/find-a-uscis-office/field-offices",
    affiliate: false,
    globalAvailable: false,
    badge: "official",
    destinationIso2List: ["US"],
    purposes: ["work", "study", "family"],
    cta: "Find an ASC",
  },
  {
    id: "bi-vfs-uk-eta",
    category: "biometrics",
    provider: "UKVI Biometric Enrolment (UK ETA)",
    description:
      "Some UK ETA / visa routes require an in-person biometric step at UK Visa & Citizenship Application Services (UKVCAS) for applicants already in the UK.",
    url: "https://www.gov.uk/biometric-residence-permits",
    affiliate: false,
    globalAvailable: false,
    destinationIso2List: ["GB"],
    badge: "official",
    cta: "Read UKVI guidance",
  },
];
