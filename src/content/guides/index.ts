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
import type { GuideModule } from "./types";

export const GUIDES: GuideModule[] = [
  etias as unknown as GuideModule,
  ukEta as unknown as GuideModule,
  schengenEes as unknown as GuideModule,
  brazil as unknown as GuideModule,
  workingHoliday as unknown as GuideModule,
  digitalNomad as unknown as GuideModule,
  diyPersonalStatement as unknown as GuideModule,
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
