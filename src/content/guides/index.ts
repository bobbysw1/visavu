/**
 * Editorial guides registry. Each entry is the union of frontmatter +
 * a server-rendered React component. The /guides index page reads
 * frontmatter; /guides/[slug] reads the component.
 */
import * as etias from "./etias-2026-explained";
import * as ukEta from "./uk-eta-2025-explained";
import * as schengenEes from "./schengen-ees-explained";
import * as brazil from "./brazil-reintroduces-visas-2025";
import * as workingHoliday from "./working-holiday-visas-complete-guide";
import * as digitalNomad from "./digital-nomad-visas-how-to-choose";
import * as diyPersonalStatement from "./diy-personal-statement";
// P19 expansion — 8 new long-form editorial guides (a ninth was added covering
// the bilateral Working-Holiday-by-passport table, a tenth the ETA-systems
// map, an eleventh the family-spouse checklist, a twelfth the DNV
// head-to-head).
import * as schengen90180 from "./schengen-90-180-rule";
import * as goldenVisa2026 from "./golden-visa-2026";
import * as sanctions2022to2026 from "./sanctions-visa-access-2022-2026";
import * as skilledMigrationCompared from "./express-entry-vs-skilled-worker-vs-482";
import * as retirementUnder1000 from "./retirement-visas-under-1000";
import * as prCitizenshipTimelines from "./pr-citizenship-timelines";
import * as visaRefusal from "./visa-refusal-what-next";
import * as investorUnder500k from "./investor-visas-under-500k";
import * as familyVisaChecklist from "./family-spouse-visa-checklist";
import * as dnvCompared from "./dnv-portugal-spain-estonia-croatia";
import * as whvByPassport from "./working-holiday-by-passport-2026";
import * as etaSystemsCompared from "./eta-systems-compared-2026";
import type { GuideModule } from "./types";

export const GUIDES: GuideModule[] = [
  etias as unknown as GuideModule,
  ukEta as unknown as GuideModule,
  schengenEes as unknown as GuideModule,
  brazil as unknown as GuideModule,
  workingHoliday as unknown as GuideModule,
  digitalNomad as unknown as GuideModule,
  diyPersonalStatement as unknown as GuideModule,
  schengen90180 as unknown as GuideModule,
  goldenVisa2026 as unknown as GuideModule,
  sanctions2022to2026 as unknown as GuideModule,
  skilledMigrationCompared as unknown as GuideModule,
  retirementUnder1000 as unknown as GuideModule,
  prCitizenshipTimelines as unknown as GuideModule,
  visaRefusal as unknown as GuideModule,
  investorUnder500k as unknown as GuideModule,
  familyVisaChecklist as unknown as GuideModule,
  dnvCompared as unknown as GuideModule,
  whvByPassport as unknown as GuideModule,
  etaSystemsCompared as unknown as GuideModule,
];

export function guideBySlug(slug: string): GuideModule | undefined {
  return GUIDES.find((g) => g.frontmatter.slug === slug);
}

/** Reverse-chronological by publishedAt. */
export function guidesByDate(): GuideModule[] {
  return [...GUIDES].sort((a, b) =>
    b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt),
  );
}
