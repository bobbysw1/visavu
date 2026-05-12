/**
 * Single aggregate of every RelocationService across the seven categories.
 * Add new providers by appending to the per-category file and the entry
 * automatically appears here (and on the result-page panel + /services).
 */
import type { RelocationService } from "@/lib/services";
import { TRAVEL_INSURANCE } from "./travelInsurance";
import { HEALTH_INSURANCE } from "./healthInsurance";
import { VACCINATIONS } from "./vaccinations";
import { BIOMETRICS } from "./biometrics";
import { MEDICAL_CHECKS } from "./medicalChecks";
import { PASSPORT_PHOTOS } from "./passportPhotos";
import { LEGAL_SERVICES } from "./legalServices";

export {
  TRAVEL_INSURANCE,
  HEALTH_INSURANCE,
  VACCINATIONS,
  BIOMETRICS,
  MEDICAL_CHECKS,
  PASSPORT_PHOTOS,
  LEGAL_SERVICES,
};

export const ALL_SERVICES: RelocationService[] = [
  ...TRAVEL_INSURANCE,
  ...HEALTH_INSURANCE,
  ...VACCINATIONS,
  ...BIOMETRICS,
  ...MEDICAL_CHECKS,
  ...PASSPORT_PHOTOS,
  ...LEGAL_SERVICES,
];
