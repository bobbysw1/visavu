/**
 * Vaccination guidance is INFORMATIONAL, not affiliate. We link the
 * national health authority that publishes the country-specific schedule.
 * Yellow Fever certificate is mandatory entry condition from some routes —
 * we link the WHO source for that too.
 */
import type { RelocationService } from "@/lib/services";

export const VACCINATIONS: RelocationService[] = [
  {
    id: "vx-cdc-yellow-book",
    category: "vaccinations",
    provider: "CDC Yellow Book (US)",
    description:
      "Authoritative US CDC guidance: required + recommended vaccinations and prophylaxis by destination, plus advisories on outbreaks, food/water safety, and traveller's diarrhoea.",
    url: "https://wwwnc.cdc.gov/travel/destinations/list",
    affiliate: false,
    globalAvailable: true,
    badge: "official",
    cta: "Look up destination",
  },
  {
    id: "vx-nhs-fit-for-travel",
    category: "vaccinations",
    provider: "NHS Fit for Travel (UK)",
    description:
      "UK National Travel Health Network's country-by-country vaccination + malaria advice. Authoritative for UK residents; covers routine, recommended, and certificate-mandatory shots.",
    url: "https://www.fitfortravel.nhs.uk/destinations",
    affiliate: false,
    globalAvailable: true,
    passportIso2List: ["GB"],
    badge: "official",
    cta: "Browse destinations",
  },
  {
    id: "vx-smartraveller",
    category: "vaccinations",
    provider: "Australian Smartraveller",
    description:
      "DFAT travel health guidance for Australians, with country pages covering required and recommended vaccinations plus health-system risk levels.",
    url: "https://www.smartraveller.gov.au/destinations",
    affiliate: false,
    globalAvailable: true,
    passportIso2List: ["AU"],
    badge: "official",
    cta: "Open destination guide",
  },
  {
    id: "vx-iamat",
    category: "vaccinations",
    provider: "IAMAT World Immunisation Chart",
    description:
      "International Association for Medical Assistance to Travellers — non-profit reference covering required vaccinations and yellow-fever endemic zones in plain English.",
    url: "https://www.iamat.org/risks/world-immunization-chart",
    affiliate: false,
    globalAvailable: true,
    cta: "Open chart",
  },
  {
    id: "vx-who-yellow-fever",
    category: "vaccinations",
    provider: "WHO Yellow Fever Country List",
    description:
      "WHO's definitive list of countries with Yellow Fever vaccination entry requirements. Carrying a valid International Certificate of Vaccination (ICVP) is a hard entry condition on these routes.",
    url: "https://www.who.int/teams/health-product-and-policy-standards/standards-and-specifications/vaccine-standardization/yellow-fever",
    affiliate: false,
    globalAvailable: true,
    badge: "official",
    cta: "Read the YF guidance",
  },
];
