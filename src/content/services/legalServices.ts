/**
 * Immigration lawyers, migration agents, and cross-border tax accountants.
 *
 * Listings here are EDITORIAL — we don't accept money to bump a firm up
 * the rank. The intent is to surface a tiny handful of credible options
 * per major destination; users with complex cases (appeals, refusal
 * histories, denaturalisation, sponsor disputes) should always consult
 * a regulated professional.
 */
import type { RelocationService } from "@/lib/services";

export const LEGAL_SERVICES: RelocationService[] = [
  {
    id: "ls-boundless-us",
    category: "legal_services",
    provider: "Boundless Immigration",
    description:
      "US immigration platform combining attorney-reviewed marriage-based and employment-based applications with automated form prep. Useful for CR-1, IR-1, K-1, and adjustment-of-status cases.",
    url: "https://www.boundless.com/",
    affiliate: true,
    globalAvailable: true,
    destinationIso2List: ["US"],
    purposes: ["work", "family"],
    badge: "recommended",
    feeNote: "From $995 + USCIS fees",
    cta: "Start a case",
  },
  {
    id: "ls-velocity-global",
    category: "legal_services",
    provider: "Velocity Global / Atlas",
    description:
      "Global Employer-of-Record (EOR) that sponsors work-permit applications in 180+ countries for companies hiring abroad. The right path when a company can't open a local entity but still wants to hire someone.",
    url: "https://velocityglobal.com/",
    affiliate: true,
    globalAvailable: true,
    purposes: ["work"],
    cta: "Talk to an EOR",
  },
  {
    id: "ls-fragomen",
    category: "legal_services",
    provider: "Fragomen",
    description:
      "Largest specialised immigration law firm. Handles corporate transfers, complex appeals, and high-net-worth investor visas in 60+ countries.",
    url: "https://www.fragomen.com/",
    affiliate: false,
    globalAvailable: true,
    badge: "recommended",
    purposes: ["work", "family"],
    cta: "Find an office",
  },
  {
    id: "ls-migrationexpert-au",
    category: "legal_services",
    provider: "Migration Expert (AU registered agents)",
    description:
      "Directory of MARA-registered Australian migration agents. Australia requires immigration advice to come from a registered agent — using an unregistered consultant is illegal.",
    url: "https://www.migrationexpert.com/au/visa/",
    affiliate: true,
    globalAvailable: false,
    destinationIso2List: ["AU"],
    purposes: ["work", "study", "family"],
    badge: "official",
    cta: "Find a MARA agent",
  },
  {
    id: "ls-sterling-uk",
    category: "legal_services",
    provider: "Sterling Law (UK OISC)",
    description:
      "UK immigration law firm regulated by the Office of the Immigration Services Commissioner. Skilled Worker, Spouse, Family, and ILR routes.",
    url: "https://sterling-law.co.uk/",
    affiliate: false,
    globalAvailable: false,
    destinationIso2List: ["GB"],
    purposes: ["work", "family"],
    cta: "Book a consultation",
  },
  {
    id: "ls-greenback-tax",
    category: "legal_services",
    provider: "Greenback Expat Tax Services",
    description:
      "Specialist tax accountants for US citizens living abroad — handles FBAR, FATCA, foreign-earned-income exclusion, and double-taxation treaty positions.",
    url: "https://www.greenbacktaxservices.com/",
    affiliate: true,
    globalAvailable: true,
    passportIso2List: ["US"],
    badge: "recommended",
    cta: "Get a tax quote",
  },
  {
    id: "ls-bright-tax",
    category: "legal_services",
    provider: "Bright!Tax",
    description:
      "US expat-tax filing service, particularly strong for digital-nomad and dual-status filings. Files state, federal, and treaty positions in one engagement.",
    url: "https://brighttax.com/",
    affiliate: true,
    globalAvailable: true,
    passportIso2List: ["US"],
    cta: "File expat taxes",
  },
];
