/**
 * Map a resolved visa option to (pathway category, profile fits).
 *
 * Strategy: a list of pattern rules tested in order. Each rule asserts
 * the option matches a known route (UK Skilled Worker, ES Digital Nomad,
 * PT D7, etc.) by purpose / label / metadata signals, and returns the
 * pathway category + profile-fit weights.
 *
 * Rules are intentionally pattern-driven rather than adapter-id-driven
 * because ResolvedVisaOption doesn't carry adapter provenance. Adding a
 * new adapter only requires adding a rule here when the new visa needs
 * special pathway treatment; otherwise it falls through to the purpose-
 * based defaults.
 *
 * Test coverage in profileMatching.test.ts pins the classification of
 * every named route in our 28-adapter set.
 */
import type { ResolvedVisaOption, WorkVisaMetadata } from "./types";
import type { Profile, PathwayCategory } from "./profiles";
import { PROFILE_PATHWAY_PRIORITY } from "./profiles";

export type ProfileFitWeight = 3 | 2 | 1; // strong | good | possible

export type ProfileClassification = {
  pathway: PathwayCategory;
  /** Map of profile → fit weight. Higher = better fit. Profiles not
   *  listed have no meaningful fit. */
  profiles: Partial<Record<Profile, ProfileFitWeight>>;
};

type Rule = {
  id: string;
  match: (opt: ResolvedVisaOption) => boolean;
  classification: ProfileClassification;
};

const RULES: Rule[] = [
  // ---- Digital nomad visas (must come BEFORE generic work) ----
  {
    id: "digital-nomad",
    match: (o) =>
      /digital nomad|nomad visa|remote worker|telework|teletrabajo|digital work/i.test(o.label),
    classification: {
      pathway: "digital_nomad",
      profiles: { digital_nomad: 3, remote_worker: 3, engineer: 2, entrepreneur: 2 },
    },
  },

  // ---- Retirement / passive income ----
  {
    id: "retirement-passive",
    match: (o) =>
      /\bD7\b|d-?7 visa|passive income|retirement visa|retiree|jubilado|rentista|pensionado|MM2H|Malaysia My Second Home|LTR (?:wealthy|retiree)/i.test(o.label),
    classification: {
      pathway: "retirement",
      profiles: { retiree: 3, hnwi: 2, remote_worker: 2, digital_nomad: 1 },
    },
  },

  // ---- Investor / Golden visas ----
  {
    id: "golden-investor",
    match: (o) =>
      /golden visa|investor visa|investment visa|tier 1 (?:investor)|wealthy global citizen|EB-?5|significant investor|innovation\s*\+?\s*investment|capital investment|investor pioneer/i.test(o.label),
    classification: {
      pathway: "investor_golden",
      profiles: { hnwi: 3, investor: 3, entrepreneur: 2, retiree: 1 },
    },
  },

  // ---- Entrepreneur / startup ----
  {
    id: "startup-entrepreneur",
    match: (o) =>
      /startup visa|innovator|entrepreneur|business owner|self[-\s]?employed|founder|emprendedor|tech\.?\s*talent/i.test(o.label),
    classification: {
      pathway: "entrepreneur_startup",
      profiles: { entrepreneur: 3, investor: 2, hnwi: 2, engineer: 1 },
    },
  },

  // ---- Family ----
  {
    id: "family",
    match: (o) =>
      o.purpose === "family" ||
      /spouse|partner|parent|dependant|family|reunification|CR-?1|IR-?1|K-?1/i.test(o.label),
    classification: {
      pathway: "family",
      profiles: {},
    },
  },

  // ---- Study ----
  {
    id: "study",
    match: (o) =>
      o.purpose === "study" ||
      /\bstudent\b|study visa|Subclass 500|Tier 4|F-?1 visa|D[\s-]?2(?:\s|\b)|college visa/i.test(o.label),
    classification: {
      pathway: "study",
      profiles: { student: 3, high_school_graduate: 2 },
    },
  },

  // ---- Points-based skilled migration (PR-track) ----
  {
    id: "skilled-migration",
    match: (o) => {
      if (
        /skilled migrant|express entry|federal skilled|Subclass 189|Subclass 190|Skilled Independent|Skilled Nominated|Talent Passport|CARICOM skilled national|Skilled Worker visa|tier 2.*general|skilled migration|points test|critical skills|hochqualifizierte/i.test(
          o.label,
        )
      )
        return true;
      if (o.purpose === "work" && o.purposeMetadata) {
        const m = o.purposeMetadata as unknown as WorkVisaMetadata;
        // PR-track without a sponsor lock-in is the skilled-migration tell.
        if (m.routeToSettlement && !m.sponsorshipRequired) return true;
      }
      return false;
    },
    classification: {
      pathway: "skilled_migration",
      profiles: {
        engineer: 3,
        doctor: 3,
        trade_worker: 2,
        entrepreneur: 1,
      },
    },
  },

  // ---- Specified Skilled Worker (Japan SSW) — typically trades + service ----
  {
    id: "ssw-japan",
    match: (o) => /specified skilled|SSW(?:i|ii)?\b/i.test(o.label),
    classification: {
      pathway: "sponsored_work",
      profiles: { trade_worker: 3, doctor: 2, high_school_graduate: 2 },
    },
  },

  // ---- High-skilled work permits (Blue Card, H-1B, Employment Pass) ----
  {
    id: "high-skill-sponsored",
    match: (o) =>
      /blue card|H-?1B|Employment Pass|S Pass|HSP|Tier 2 \(general\)|Skilled Worker(?: \(Tier 2\))?|TN visa|O-?1 visa/i.test(
        o.label,
      ),
    classification: {
      pathway: "sponsored_work",
      profiles: {
        engineer: 3,
        doctor: 3,
        trade_worker: 1,
        entrepreneur: 1,
      },
    },
  },

  // ---- Generic sponsored work ----
  {
    id: "generic-sponsored-work",
    match: (o) => {
      if (o.purpose !== "work") return false;
      const m = o.purposeMetadata as unknown as WorkVisaMetadata | null;
      return Boolean(m?.sponsorshipRequired || m?.jobOfferRequired);
    },
    classification: {
      pathway: "sponsored_work",
      profiles: {
        engineer: 2,
        doctor: 2,
        trade_worker: 2,
        high_school_graduate: 1,
      },
    },
  },

  // ---- Tourism / short-stay / business / transit ----
  {
    id: "tourism-or-transit",
    match: (o) =>
      o.purpose === "tourism" ||
      o.purpose === "business" ||
      o.purpose === "transit" ||
      /\beTA\b|\bESTA\b|\bETIAS\b|visa[-\s]?free|Schengen short|B[12]\/?B[12]|visitor visa|short[-\s]?stay|NZeTA|eVisitor|tourist/i.test(
        o.label,
      ),
    classification: {
      pathway: "tourism",
      profiles: {},
    },
  },

  // ---- Diplomatic / official ----
  {
    id: "diplomatic",
    match: (o) => o.purpose === "diplomatic",
    classification: {
      pathway: "transit_other",
      profiles: {},
    },
  },
];

export function classify(opt: ResolvedVisaOption): ProfileClassification {
  for (const rule of RULES) {
    if (rule.match(opt)) return rule.classification;
  }
  // Fallback by purpose.
  if (opt.purpose === "work") return { pathway: "sponsored_work", profiles: { engineer: 1, doctor: 1, trade_worker: 1 } };
  if (opt.purpose === "study") return { pathway: "study", profiles: { student: 2 } };
  if (opt.purpose === "family") return { pathway: "family", profiles: {} };
  return { pathway: "transit_other", profiles: {} };
}

export type ClassifiedOption<T = ResolvedVisaOption> = {
  option: T;
  classification: ProfileClassification;
};

export function classifyAll(options: ResolvedVisaOption[]): ClassifiedOption[] {
  return options.map((option) => ({ option, classification: classify(option) }));
}

/**
 * Sort + filter classified options for a chosen profile.
 *
 * - With a profile: options without any fit drop OUT of the prioritised
 *   list (they appear under a separate "Other routes" section in the UI).
 *   Within fitting options, sort by: pathway priority for the profile,
 *   then profile fit weight, then originality of the option.
 * - Without a profile: leave the original order intact (resolver already
 *   sorts by relevance).
 */
export function sortForProfile<T>(
  list: ClassifiedOption<T>[],
  profile: Profile | null,
): { primary: ClassifiedOption<T>[]; secondary: ClassifiedOption<T>[] } {
  if (!profile) return { primary: list, secondary: [] };
  const order = PROFILE_PATHWAY_PRIORITY[profile];
  const primary: ClassifiedOption<T>[] = [];
  const secondary: ClassifiedOption<T>[] = [];
  for (const item of list) {
    const fit = item.classification.profiles[profile] ?? 0;
    const inPriority = order.includes(item.classification.pathway);
    if (fit > 0 || inPriority) primary.push(item);
    else secondary.push(item);
  }
  primary.sort((a, b) => {
    const aPath = order.indexOf(a.classification.pathway);
    const bPath = order.indexOf(b.classification.pathway);
    const aRank = aPath === -1 ? 99 : aPath;
    const bRank = bPath === -1 ? 99 : bPath;
    if (aRank !== bRank) return aRank - bRank;
    const aFit = a.classification.profiles[profile] ?? 0;
    const bFit = b.classification.profiles[profile] ?? 0;
    return bFit - aFit;
  });
  return { primary, secondary };
}

/**
 * Group classified options by pathway category, preserving the order
 * established by the input list. Empty pathways are skipped.
 */
export function groupByPathway<T>(
  list: ClassifiedOption<T>[],
): Array<{ pathway: PathwayCategory; items: ClassifiedOption<T>[] }> {
  const order: PathwayCategory[] = [];
  const map = new Map<PathwayCategory, ClassifiedOption<T>[]>();
  for (const item of list) {
    const p = item.classification.pathway;
    if (!map.has(p)) {
      map.set(p, []);
      order.push(p);
    }
    map.get(p)!.push(item);
  }
  return order.map((p) => ({ pathway: p, items: map.get(p)! }));
}
