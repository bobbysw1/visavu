import type { Adapter } from "../base/Adapter";
import { usVisaWaiverProgramAdapter } from "./us_visa_waiver_program";
import { usB1B2Adapter } from "./us_b1b2";
import { usH1bAdapter } from "./us_h1b";
import { ukSkilledWorkerAdapter } from "./uk_skilled_worker";
import { ukStudentAdapter } from "./uk_student";
import { ukSpouseAdapter } from "./uk_spouse";
import { ukEtaAdapter } from "./uk_eta";
import { auSubclass500Adapter } from "./au_subclass_500";
import { auSubclass482Adapter } from "./au_subclass_482";
import { auSubclass601Adapter } from "./au_subclass_601";
import { australiaEvisitorAdapter } from "./au_evisitor";
import { caExpressEntryAdapter } from "./ca_express_entry";
import { canadaEtaAdapter } from "./ca_eta";
import { schengenShortStayAdapter } from "./schengen_short_stay";
import { ecowasFreeMovementAdapter } from "./ecowas_free_movement";
import { caricomCsmeAdapter } from "./caricom_csme";
import { caricomSkilledNationalAdapter } from "./caricom_skilled_national";
import { mercosurFreeMovementAdapter } from "./mercosur_residency";
import { gccFreeMovementAdapter } from "./gcc_free_movement";
import { germanyBlueCardAdapter } from "./de_blue_card";
import { jpSpecifiedSkilledWorkerAdapter } from "./jp_ssw";
import { japanShortStayAdapter } from "./jp_short_stay";
import { spainDigitalNomadAdapter } from "./es_digital_nomad";
import { portugalD7Adapter } from "./pt_d7";
import { franceTalentPassportAdapter } from "./fr_talent_passport";
import { singaporeEmploymentPassAdapter } from "./sg_employment_pass";
import { newZealandSkilledMigrantAdapter } from "./nz_skilled_migrant";
import { newZealandNzetaAdapter } from "./nz_nzeta";
import { wikipediaLongTailAdapter } from "./wikipedia_long_tail";
import { workingHolidayAdapter } from "./working_holiday";
import { japanSpecialVisasAdapter } from "./jp_special_visas";
import { usGoldCardAdapter } from "./us_gold_card";
import { globalDigitalNomadAdapter } from "./global_digital_nomad";
import { caribbeanCbiAdapter } from "./caribbean_cbi";
import { globalTalentVisasAdapter } from "./global_talent_visas";
import { thailandSuiteAdapter } from "./thailand_suite";
import { vietnamSuiteAdapter } from "./vietnam_suite";
import { topDestinationGapsAdapter } from "./top_destination_gaps";
import { totalCoverageUkUsAdapter } from "./total_coverage_uk_us";
import { totalCoverageCaAuNzAdapter } from "./total_coverage_ca_au_nz";
import { totalCoverageAsiaAdapter } from "./total_coverage_asia";
import { totalCoverageEuAdapter } from "./total_coverage_eu";
import { totalCoverageAncestryAdapter } from "./total_coverage_ancestry";
import { totalCoveragePropertyAdapter } from "./total_coverage_property";
import { totalCoverageCheapPrAdapter } from "./total_coverage_cheap_pr";
import { totalCoverageTerritoriesAdapter } from "./total_coverage_territories";
import { totalCoverageStudyAdapter } from "./total_coverage_study";
import { totalCoverageBusinessAdapter } from "./total_coverage_business";
import { totalCoverageTransitAdapter } from "./total_coverage_transit";

// Central registry. New adapters get appended here and inherit the scheduler,
// diffing, and confidence pipeline for free.
export const ADAPTERS: Adapter[] = [
  usVisaWaiverProgramAdapter,
  usB1B2Adapter,
  usH1bAdapter,
  ukSkilledWorkerAdapter,
  ukStudentAdapter,
  ukSpouseAdapter,
  ukEtaAdapter,
  auSubclass500Adapter,
  auSubclass482Adapter,
  auSubclass601Adapter,
  australiaEvisitorAdapter,
  caExpressEntryAdapter,
  canadaEtaAdapter,
  germanyBlueCardAdapter,
  jpSpecifiedSkilledWorkerAdapter,
  japanShortStayAdapter,
  spainDigitalNomadAdapter,
  portugalD7Adapter,
  franceTalentPassportAdapter,
  singaporeEmploymentPassAdapter,
  newZealandSkilledMigrantAdapter,
  newZealandNzetaAdapter,
  schengenShortStayAdapter,
  ecowasFreeMovementAdapter,
  caricomCsmeAdapter,
  caricomSkilledNationalAdapter,
  mercosurFreeMovementAdapter,
  gccFreeMovementAdapter,
  wikipediaLongTailAdapter,
  workingHolidayAdapter,
  japanSpecialVisasAdapter,
  usGoldCardAdapter,
  globalDigitalNomadAdapter,
  caribbeanCbiAdapter,
  globalTalentVisasAdapter,
  thailandSuiteAdapter,
  vietnamSuiteAdapter,
  topDestinationGapsAdapter,
  totalCoverageUkUsAdapter,
  totalCoverageCaAuNzAdapter,
  totalCoverageAsiaAdapter,
  totalCoverageEuAdapter,
  totalCoverageAncestryAdapter,
  totalCoveragePropertyAdapter,
  totalCoverageCheapPrAdapter,
  totalCoverageTerritoriesAdapter,
  totalCoverageStudyAdapter,
  totalCoverageBusinessAdapter,
  totalCoverageTransitAdapter,
];

export function adapterById(id: string): Adapter | undefined {
  return ADAPTERS.find((a) => a.metadata.id === id);
}
