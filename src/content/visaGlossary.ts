/**
 * Visa-vocab glossary — acronyms and named bodies that appear in visa
 * requirement lists with no context. Every entry has a one-sentence
 * explanation + a link to the AUTHORITATIVE source (government portal
 * or named regulatory body) so users can verify themselves.
 *
 * Why this exists: the requirements section was showing strings like
 * "MLTSSL · Skills Assessment from Engineers Australia, ACS, CPA,
 * VETASSESS" with zero links. Users had no way to know what MLTSSL is
 * or how to start the assessment. Each term here gets wrapped in an
 * inline link by the GlossaryText component.
 *
 * Add a new term by adding an entry here. The matcher is case-insensitive
 * but matches whole words (or specific acronyms) only.
 */

export type GlossaryEntry = {
  /** Canonical term as it appears in copy. Matcher is case-insensitive
   *  but uses word boundaries. */
  term: string;
  /** Optional aliases (regex-safe whole strings) — e.g. "MLTSSL" + its
   *  expansion "Medium and Long-term Strategic Skills List". */
  aliases?: string[];
  /** One-line tooltip + screen-reader label. */
  tooltip: string;
  /** Authoritative government / regulator URL. */
  url: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  // ---- Australia (skilled migration) ----
  {
    term: "MLTSSL",
    aliases: ["Medium and Long-term Strategic Skills List"],
    tooltip: "Australia's Medium and Long-term Strategic Skills List — the in-demand occupations eligible for the Subclass 189, 190 and 491 skilled-migration visas.",
    url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
  },
  {
    term: "STSOL",
    aliases: ["Short-term Skilled Occupation List"],
    tooltip: "Australia's Short-term Skilled Occupation List — used by the Subclass 482 temporary skill shortage visa.",
    url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
  },
  {
    term: "Engineers Australia",
    tooltip: "The assessing authority that verifies engineering qualifications for Australian skilled-migration visas.",
    url: "https://www.engineersaustralia.org.au/program/migration-skills-assessment",
  },
  {
    term: "ACS",
    aliases: ["Australian Computer Society"],
    tooltip: "Australian Computer Society — the assessing authority for IT / computing occupations on the Australian skilled-migration lists.",
    url: "https://www.acs.org.au/migrationskillsassessment.html",
  },
  {
    term: "CPA Australia",
    tooltip: "CPA Australia — one of the three assessing authorities for accounting occupations applying for Australian skilled migration.",
    url: "https://www.cpaaustralia.com.au/become-a-cpa/migration-assessment",
  },
  {
    term: "VETASSESS",
    tooltip: "VETASSESS — the assessing authority covering 360+ professional and trade occupations not handled by industry-specific bodies.",
    url: "https://www.vetassess.com.au/",
  },
  {
    term: "Subclass 189",
    tooltip: "Australia's Skilled Independent visa — points-based PR-on-arrival route, no employer sponsorship required.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
  },
  {
    term: "Subclass 190",
    tooltip: "Australia's Skilled Nominated visa — points-based PR-on-arrival with state nomination.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
  },
  {
    term: "Subclass 482",
    tooltip: "Australia's Temporary Skill Shortage visa — employer-sponsored work permit for 2-4 years, can lead to PR.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482",
  },
  {
    term: "Subclass 500",
    tooltip: "Australia's Student visa for full-time CRICOS-registered courses.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  {
    term: "Subclass 417",
    tooltip: "Australia's Working Holiday visa — first-year UK/EU/EEA passport holders aged 18–30.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417",
  },
  {
    term: "Subclass 462",
    tooltip: "Australia's Work and Holiday visa — separate from 417; covers US, Canada, Argentina, China, etc.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
  },
  {
    term: "Skillselect",
    aliases: ["SkillSelect"],
    tooltip: "Australia's online portal where skilled-migration candidates submit an Expression of Interest (EOI).",
    url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect",
  },

  // ---- UK ----
  {
    term: "Skilled Worker visa",
    tooltip: "The UK's primary employer-sponsored work visa; replaced Tier 2 General in late 2020.",
    url: "https://www.gov.uk/skilled-worker-visa",
  },
  {
    term: "Certificate of Sponsorship",
    aliases: ["CoS"],
    tooltip: "The reference number issued by a UK Home Office-licensed sponsor that a Skilled Worker applicant uses to apply.",
    url: "https://www.gov.uk/uk-visa-sponsorship-employers/certificates-of-sponsorship",
  },
  {
    term: "ILR",
    aliases: ["Indefinite Leave to Remain"],
    tooltip: "Indefinite Leave to Remain — the UK's permanent residence status.",
    url: "https://www.gov.uk/indefinite-leave-to-remain",
  },
  {
    term: "Innovator Founder",
    tooltip: "The UK's entrepreneur visa for endorsed business founders.",
    url: "https://www.gov.uk/innovator-founder-visa",
  },

  // ---- Canada ----
  {
    term: "Express Entry",
    tooltip: "Canada's online intake system for the Federal Skilled Worker, Federal Skilled Trades, and Canadian Experience Class PR programmes.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
  },
  {
    term: "CRS",
    aliases: ["Comprehensive Ranking System"],
    tooltip: "Canada's Comprehensive Ranking System — the points scoring used in Express Entry draws.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system.html",
  },
  {
    term: "NOC",
    aliases: ["National Occupational Classification"],
    tooltip: "Canada's National Occupational Classification — the standard occupation taxonomy used to determine Express Entry eligibility.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/find-national-occupation-code.html",
  },
  {
    term: "PNP",
    aliases: ["Provincial Nominee Program"],
    tooltip: "Canada's Provincial Nominee Program — each province runs its own skilled-migration stream feeding into Express Entry.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html",
  },

  // ---- USA ----
  {
    term: "H-1B",
    tooltip: "The US specialty-occupation work visa, capped by lottery for most applicants.",
    url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models",
  },
  {
    term: "Green Card",
    aliases: ["LPR", "Lawful Permanent Resident"],
    tooltip: "Permanent residency in the United States.",
    url: "https://www.uscis.gov/green-card",
  },
  {
    term: "USCIS",
    tooltip: "United States Citizenship and Immigration Services — the federal agency that processes US visa, asylum, and naturalisation applications.",
    url: "https://www.uscis.gov/",
  },
  {
    term: "EB-5",
    tooltip: "The US Immigrant Investor Program — direct path to a green card via qualifying investment.",
    url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program",
  },

  // ---- EU ----
  {
    term: "EU Blue Card",
    aliases: ["Blue Card"],
    tooltip: "EU-wide work + residence permit for highly-qualified non-EU nationals.",
    url: "https://immigration-portal.ec.europa.eu/",
  },
  {
    term: "Schengen",
    aliases: ["Schengen Area"],
    tooltip: "The 27-country zone with no internal border checks. A Schengen visa lets you enter any member state.",
    url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa_en",
  },

  // ---- NZ ----
  {
    term: "Skilled Migrant Category",
    aliases: ["SMC"],
    tooltip: "New Zealand's points-based PR visa for skilled workers.",
    url: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/skilled-migrant-category-resident-visa",
  },

  // ---- Singapore ----
  {
    term: "Employment Pass",
    aliases: ["EP"],
    tooltip: "Singapore's main employer-sponsored work visa for professionals and managers.",
    url: "https://www.mom.gov.sg/passes-and-permits/employment-pass",
  },

  // ---- Generic ----
  {
    term: "IELTS",
    tooltip: "International English Language Testing System — the most widely-accepted English-proficiency test for visa purposes.",
    url: "https://www.ielts.org/",
  },
  {
    term: "TOEFL",
    tooltip: "Test of English as a Foreign Language — the US-developed English-proficiency test.",
    url: "https://www.ets.org/toefl",
  },
  {
    term: "Apostille",
    tooltip: "An international certification under the Hague Convention that authenticates a document for use in another country.",
    url: "https://www.hcch.net/en/instruments/conventions/specialised-sections/apostille",
  },
];

// Pre-build the matcher list, longest-first so multi-word terms ("EU
// Blue Card", "Engineers Australia") match before single-word ones ("EU",
// "Engineers"). Case-insensitive whole-word matching.
const ENTRIES_WITH_MATCHERS = (() => {
  const list: { entry: GlossaryEntry; matcher: RegExp }[] = [];
  for (const entry of GLOSSARY) {
    const variants = [entry.term, ...(entry.aliases ?? [])];
    for (const variant of variants) {
      // Word-boundary on both sides for normal words; lookahead for
      // mid-word characters (so "Subclass 482" still matches when followed
      // by punctuation).
      const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      list.push({
        entry,
        matcher: new RegExp(`\\b(${escaped})\\b`, "i"),
      });
    }
  }
  // Longest first so "EU Blue Card" matches before "EU".
  list.sort((a, b) => b.entry.term.length - a.entry.term.length);
  return list;
})();

/**
 * Find the first glossary entry that appears in `text`. Returns null
 * when no entry matches. Public so unit tests can pin behaviour.
 */
export function firstGlossaryMatch(text: string): { entry: GlossaryEntry; index: number; length: number } | null {
  let best: { entry: GlossaryEntry; index: number; length: number } | null = null;
  for (const { entry, matcher } of ENTRIES_WITH_MATCHERS) {
    const m = matcher.exec(text);
    if (!m) continue;
    if (m.index == null) continue;
    if (best == null || m.index < best.index) {
      best = { entry, index: m.index, length: m[0].length };
    }
  }
  return best;
}
