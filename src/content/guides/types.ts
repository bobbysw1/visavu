/**
 * Editorial guide module type. Each guide is a TypeScript file (not MDX —
 * we want React component composition for live-data tables and don't need
 * the MDX dependency tree). Each module exports a `frontmatter` object and
 * a default React component.
 */
export type GuideFrontmatter = {
  slug: string;
  title: string;
  /** One-line description shown on /guides index + meta description. */
  summary: string;
  /** Author byline shown on the guide and in JSON-LD. */
  author: string;
  /** Publication date (ISO). Used in JSON-LD + RSS. */
  publishedAt: string;
  /** Last meaningful edit (ISO). Used in JSON-LD + on-page "updated" line. */
  modifiedAt: string;
  /** Tags for grouping on the index page. */
  tags: string[];
  /** Estimated reading time in minutes (rounded up). */
  readingMinutes: number;
  /** ISO 3166-1 alpha-2 of the country whose hero photo represents this
   *  guide. We reuse the curated `public/heroes/` set so guides get
   *  real photography without a second sourcing pipeline. Falls back to
   *  a neutral gradient if the manifest entry is missing. */
  heroIso2?: string;
};

import type { ComponentType } from "react";

export type GuideModule = {
  frontmatter: GuideFrontmatter;
  default: ComponentType;
};
