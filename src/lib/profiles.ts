/**
 * User profiles + pathway categories for intelligent visa filtering.
 *
 * "Profiles" describe WHO the applicant is (doctor, engineer, retiree...).
 * "Pathways" describe what KIND OF VISA each option is (sponsored work,
 * skilled migration, investor / golden, digital nomad, study, family,
 * retirement, entrepreneur, tourism).
 *
 * Each resolved visa option gets exactly one pathway category and a set
 * of profile fits. When a user filters by profile, we sort the options
 * so high-fit pathways surface first and low-fit pathways drop down.
 *
 * Why this matters: the Dubai Golden Visa and a UK Skilled Worker visa
 * shouldn't sit side-by-side in a flat list — they answer different
 * questions ("I have $$$ to invest" vs "I have a job offer"). Pathway
 * grouping makes that distinction structural rather than visual.
 */

export type Profile =
  | "doctor"
  | "engineer"
  | "hnwi"
  | "investor"
  | "digital_nomad"
  | "trade_worker"
  | "student"
  | "high_school_graduate"
  | "entrepreneur"
  | "remote_worker"
  | "retiree";

export const PROFILES: Profile[] = [
  "doctor",
  "engineer",
  "hnwi",
  "investor",
  "digital_nomad",
  "trade_worker",
  "student",
  "high_school_graduate",
  "entrepreneur",
  "remote_worker",
  "retiree",
];

export type ProfileMeta = {
  id: Profile;
  label: string;
  emoji: string;
  description: string;
};

export const PROFILE_META: Record<Profile, ProfileMeta> = {
  doctor: {
    id: "doctor",
    label: "Doctor / healthcare",
    emoji: "🩺",
    description: "Physicians, nurses, allied health professionals — typically eligible for skilled-migration and sponsored-work routes.",
  },
  engineer: {
    id: "engineer",
    label: "Engineer",
    emoji: "🛠️",
    description: "Software, mechanical, electrical, civil engineering and other STEM occupations — primary fit for skilled migration and tech-sponsored work permits.",
  },
  hnwi: {
    id: "hnwi",
    label: "High net worth",
    emoji: "💎",
    description: "Significant liquid wealth or assets — golden-visa, investor, and retirement-by-passive-income routes are the natural fit.",
  },
  investor: {
    id: "investor",
    label: "Investor",
    emoji: "📈",
    description: "Capital deployable into real estate, government bonds, or operating businesses — investment-residency programmes.",
  },
  digital_nomad: {
    id: "digital_nomad",
    label: "Digital nomad",
    emoji: "🧳",
    description: "Remote employment paid from outside the destination — fits the new generation of dedicated digital-nomad visas.",
  },
  trade_worker: {
    id: "trade_worker",
    label: "Trade worker",
    emoji: "🔧",
    description: "Electricians, plumbers, welders, mechanics, builders — typically eligible for skilled-migration occupation lists and trade-specific sponsorship routes.",
  },
  student: {
    id: "student",
    label: "Student",
    emoji: "🎓",
    description: "Enrolled or accepted at a tertiary institution — student visas plus post-study work routes.",
  },
  high_school_graduate: {
    id: "high_school_graduate",
    label: "High-school graduate",
    emoji: "📚",
    description: "Recent secondary-school graduate without a degree yet — student, working-holiday, and entry-level sponsored routes.",
  },
  entrepreneur: {
    id: "entrepreneur",
    label: "Entrepreneur",
    emoji: "🚀",
    description: "Starting or relocating a business — startup, innovator, and self-employed visa routes.",
  },
  remote_worker: {
    id: "remote_worker",
    label: "Remote worker",
    emoji: "💻",
    description: "Salaried employee of a company outside the destination — digital-nomad visas plus passive-income / retirement routes.",
  },
  retiree: {
    id: "retiree",
    label: "Retiree",
    emoji: "🌅",
    description: "Drawing pension or passive income — retirement and passive-income residency routes (D7, MM2H, LTR, Golden visa).",
  },
};

// ---- Pathway categories ----

export type PathwayCategory =
  | "tourism"
  | "digital_nomad"
  | "skilled_migration"
  | "sponsored_work"
  | "investor_golden"
  | "entrepreneur_startup"
  | "family"
  | "study"
  | "retirement"
  | "transit_other";

export const PATHWAY_ORDER: PathwayCategory[] = [
  "skilled_migration",
  "sponsored_work",
  "investor_golden",
  "entrepreneur_startup",
  "digital_nomad",
  "retirement",
  "study",
  "family",
  "tourism",
  "transit_other",
];

export type PathwayMeta = {
  id: PathwayCategory;
  label: string;
  /** Short blurb explaining what this pathway is. */
  description: string;
  /** Tailwind colour family used for chips + section accents. */
  tone: "emerald" | "blue" | "violet" | "orange" | "sky" | "rose" | "neutral";
};

export const PATHWAY_META: Record<PathwayCategory, PathwayMeta> = {
  skilled_migration: {
    id: "skilled_migration",
    label: "Skilled migration",
    description: "Points-based or occupation-list routes that lead directly to permanent residency. Best for in-demand professionals: engineers, doctors, IT, trades.",
    tone: "emerald",
  },
  sponsored_work: {
    id: "sponsored_work",
    label: "Sponsored work",
    description: "Employer-sponsored work permits that require a confirmed job offer. The most common path for skilled workers without a residency-track option.",
    tone: "blue",
  },
  investor_golden: {
    id: "investor_golden",
    label: "Investment / Golden visa",
    description: "Residency in exchange for an investment — real estate, government bonds, fund subscriptions, or qualifying business spend. Designed for high-net-worth applicants.",
    tone: "violet",
  },
  entrepreneur_startup: {
    id: "entrepreneur_startup",
    label: "Entrepreneur / Startup",
    description: "Founder, self-employed, innovator, and startup-track visas. For people relocating to build a business.",
    tone: "orange",
  },
  digital_nomad: {
    id: "digital_nomad",
    label: "Digital nomad",
    description: "Dedicated remote-worker visas for income earned outside the destination. Typically 1–5 year stays without local employment rights.",
    tone: "sky",
  },
  retirement: {
    id: "retirement",
    label: "Retirement / Passive income",
    description: "Long-stay residency for retirees and passive-income earners. Often with favourable tax treatment.",
    tone: "rose",
  },
  study: {
    id: "study",
    label: "Study",
    description: "Student visas with linked post-study work rights where applicable.",
    tone: "violet",
  },
  family: {
    id: "family",
    label: "Family",
    description: "Spouse, partner, dependant, and parent reunion visas.",
    tone: "rose",
  },
  tourism: {
    id: "tourism",
    label: "Tourism / Short stay",
    description: "Visa-free, eTA, e-Visa, and embassy short-stay routes for tourism, business, or transit visits.",
    tone: "neutral",
  },
  transit_other: {
    id: "transit_other",
    label: "Other",
    description: "Visa types that don't sit neatly in any other pathway.",
    tone: "neutral",
  },
};

// ---- Profile → preferred pathways ----
//
// Drives the sort order when a user picks a profile: pathways earlier
// in the list float to the top. Within a pathway, ordering still
// respects the per-option profile fit weight.

export const PROFILE_PATHWAY_PRIORITY: Record<Profile, PathwayCategory[]> = {
  doctor: ["skilled_migration", "sponsored_work", "study", "family"],
  engineer: ["skilled_migration", "sponsored_work", "digital_nomad", "entrepreneur_startup"],
  hnwi: ["investor_golden", "retirement", "entrepreneur_startup"],
  investor: ["investor_golden", "entrepreneur_startup", "retirement"],
  digital_nomad: ["digital_nomad", "retirement", "sponsored_work"],
  trade_worker: ["skilled_migration", "sponsored_work"],
  student: ["study", "sponsored_work"],
  high_school_graduate: ["study", "sponsored_work", "tourism"],
  entrepreneur: ["entrepreneur_startup", "investor_golden", "skilled_migration"],
  remote_worker: ["digital_nomad", "retirement", "sponsored_work"],
  retiree: ["retirement", "investor_golden", "digital_nomad"],
};

export function isProfile(v: string): v is Profile {
  return (PROFILES as string[]).includes(v);
}
