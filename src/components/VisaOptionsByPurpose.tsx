"use client";

/**
 * Visa-options panel for the result page.
 *
 * Two-tier grouping:
 *   1. Standard PURPOSE groups (Work / Tourism / Study / Family / Business
 *      / Transit) — every option whose pathway isn't "unique" lives here.
 *   2. UNIQUE PATHWAY groups at the bottom (Investor / Golden, Digital
 *      Nomad, Entrepreneur / Startup, Retirement) — separated out so
 *      they don't clutter the standard purpose groups. A Golden Visa
 *      may be tagged `purpose=work` in our data, but mentally it's a
 *      different category — surfaced as its own bottom group.
 *
 * ALL groups are collapsed by default. The user expands the categories
 * they're actually interested in. No auto-open even for Tourism — the
 * compact answer band at the top of the page already tells them the
 * primary status; this list is for browsing alternatives.
 *
 * Profile filter widening still applies: picking "Doctor" pulls in work
 * + skilled-migration options from across all purposes and lists them.
 * Those still appear in their PURPOSE group below — no auto-expansion.
 */
import { useMemo, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { ResolvedVisaOption, Purpose, VisaStatus } from "@/lib/types";
import type { Locale } from "@/i18n/t";
import { PURPOSE_LABEL } from "@/lib/types";
import { ResultCard } from "./ResultCard";
import {
  classifyAll,
  sortForProfile,
  groupByPathway,
  type ClassifiedOption,
} from "@/lib/profileMatching";
import { PATHWAY_META, isProfile, type Profile, type PathwayCategory } from "@/lib/profiles";
import { useSearchParams } from "next/navigation";

// Standard purposes (top of list, in this order).
const PURPOSE_ORDER: Purpose[] = ["work", "tourism", "study", "family", "business", "transit", "diplomatic"];

// "Unique" pathway categories that get their own group at the bottom,
// regardless of the option's declared purpose. A Golden Visa flagged
// purpose=work belongs in `investor_golden` here, not in the Work group
// above.
const UNIQUE_PATHWAYS: PathwayCategory[] = [
  "investor_golden",
  "digital_nomad",
  "entrepreneur_startup",
  "retirement",
];

const PURPOSE_DESCRIPTION: Record<Purpose, string> = {
  tourism: "Holidays, sightseeing, visiting friends. Short stays only.",
  business: "Meetings, conferences, signing deals. No local employment.",
  transit: "Changing flights, brief stopovers, no overnight stay required.",
  work: "Job offers, contracts, skilled migration, sponsored employment.",
  study: "University, college, language school, exchange programmes.",
  family: "Spouse, partner, dependants, family reunification.",
  diplomatic: "Diplomatic, official, or service passport holders.",
};

const PURPOSE_EMOJI: Record<Purpose, string> = {
  tourism: "🧳",
  business: "💼",
  transit: "🛫",
  work: "🛠️",
  study: "🎓",
  family: "💞",
  diplomatic: "🪪",
};

const PATHWAY_EMOJI: Record<PathwayCategory, string> = {
  investor_golden: "💎",
  digital_nomad: "💻",
  entrepreneur_startup: "🚀",
  retirement: "🌅",
  skilled_migration: "🛠️",
  sponsored_work: "🛠️",
  tourism: "🧳",
  family: "💞",
  study: "🎓",
  transit_other: "🪪",
};

export function VisaOptionsByPurpose({
  options,
  baselineTourismStatus,
  passportIso2,
  destinationIso2,
  locale,
}: {
  options: ResolvedVisaOption[];
  baselineTourismStatus: VisaStatus | null;
  passportIso2: string;
  destinationIso2: string;
  locale: Locale;
}) {
  const params = useSearchParams();
  const profileParam = params.get("profile");
  const profile: Profile | null = profileParam && isProfile(profileParam) ? profileParam : null;

  // Sort + classify once. Profile-relevant options end up in `primary`;
  // everything else in `secondary`. Then split into:
  //   (a) standard PURPOSE buckets — for options whose pathway is one of
  //       the "standard" categories (tourism / sponsored_work / skilled_
  //       migration / study / family / transit_other).
  //   (b) UNIQUE PATHWAY buckets — Golden / DigitalNomad / Startup /
  //       Retirement. These get their own groups at the bottom.
  const { primaryByPurpose, uniqueByPathway, secondary } = useMemo(() => {
    const classified = classifyAll(options);
    const { primary, secondary: sec } = sortForProfile(classified, profile);

    const byPurpose = new Map<Purpose, ClassifiedOption[]>();
    const byPathway = new Map<PathwayCategory, ClassifiedOption[]>();

    for (const item of primary) {
      if (UNIQUE_PATHWAYS.includes(item.classification.pathway)) {
        const list = byPathway.get(item.classification.pathway) ?? [];
        list.push(item);
        byPathway.set(item.classification.pathway, list);
      } else {
        const list = byPurpose.get(item.option.purpose) ?? [];
        list.push(item);
        byPurpose.set(item.option.purpose, list);
      }
    }
    return { primaryByPurpose: byPurpose, uniqueByPathway: byPathway, secondary: sec };
  }, [options, profile]);

  const visiblePurposes = PURPOSE_ORDER.filter((p) => (primaryByPurpose.get(p)?.length ?? 0) > 0);
  const visibleUnique = UNIQUE_PATHWAYS.filter((p) => (uniqueByPathway.get(p)?.length ?? 0) > 0);

  if (options.length === 0) return null;

  return (
    <section className="space-y-3">
      {profile && (
        <p className="rounded-lg px-3 py-2 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 flex items-start gap-2">
          <Sparkles size={12} className="shrink-0 mt-0.5" aria-hidden />
          <span>
            Showing visas relevant to your profile across <strong>all categories</strong>. Clear the
            filter in &quot;Narrow your search&quot; above to revert.
          </span>
        </p>
      )}

      {/* Standard purpose groups — all collapsed by default. */}
      {visiblePurposes.map((purpose) => {
        const items = primaryByPurpose.get(purpose)!;
        return (
          <PurposeGroup
            key={purpose}
            kind="purpose"
            purpose={purpose}
            items={items}
            baselineTourismStatus={baselineTourismStatus}
            locale={locale}
            passportIso2={passportIso2}
            destinationIso2={destinationIso2}
          />
        );
      })}

      {/* "Unique" pathway groups at the BOTTOM. Visually distinct so users
          recognise these are different beasts from the standard purposes. */}
      {visibleUnique.length > 0 && (
        <div className="mt-5 pt-5 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400">
            Unique visa pathways
          </p>
          {visibleUnique.map((pathway) => {
            const items = uniqueByPathway.get(pathway)!;
            return (
              <PurposeGroup
                key={pathway}
                kind="pathway"
                pathway={pathway}
                items={items}
                baselineTourismStatus={baselineTourismStatus}
                locale={locale}
                passportIso2={passportIso2}
                destinationIso2={destinationIso2}
              />
            );
          })}
        </div>
      )}

      {secondary.length > 0 && (
        <details className="group rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Other routes that don&apos;t match your filter ({secondary.length})
            </span>
            <ChevronDown
              size={14}
              aria-hidden
              className="text-neutral-500 group-open:rotate-180 transition"
            />
          </summary>
          <div className="px-4 py-4 space-y-3 border-t border-neutral-200 dark:border-neutral-800">
            {secondary.map(({ option }) => (
              <ResultCard
                key={option.id}
                option={option}
                baselineTourismStatus={baselineTourismStatus}
                locale={locale}
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

type PurposeGroupProps = {
  items: ClassifiedOption[];
  baselineTourismStatus: VisaStatus | null;
  locale: Locale;
  passportIso2: string;
  destinationIso2: string;
} & (
  | { kind: "purpose"; purpose: Purpose }
  | { kind: "pathway"; pathway: PathwayCategory }
);

function PurposeGroup(props: PurposeGroupProps) {
  // All groups start closed — user opens whichever categories they
  // want to browse. Same for unique pathways (Golden / Nomad / etc.).
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => groupByPathway(props.items), [props.items]);

  const emoji = props.kind === "purpose" ? PURPOSE_EMOJI[props.purpose] : PATHWAY_EMOJI[props.pathway];
  const title =
    props.kind === "purpose"
      ? PURPOSE_LABEL[props.purpose]
      : PATHWAY_META[props.pathway].label;
  const description =
    props.kind === "purpose"
      ? PURPOSE_DESCRIPTION[props.purpose]
      : PATHWAY_META[props.pathway].description;
  const headline = props.items[0]?.option;

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-4 sm:px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-xl leading-none shrink-0 mt-0.5" aria-hidden>
            {emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-base">{title}</h3>
              <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {props.items.length} option{props.items.length === 1 ? "" : "s"}
              </span>
            </div>
            {!open && headline ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                e.g. <span className="font-medium text-neutral-700 dark:text-neutral-200">{headline.label}</span>
              </p>
            ) : (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 text-neutral-500 transition mt-1 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          {grouped.map((group) => {
            const meta = PATHWAY_META[group.pathway];
            return (
              <div key={group.pathway}>
                {/* Sub-header only renders when a group contains multiple pathways. */}
                {grouped.length > 1 && (
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                    {meta.label}
                  </p>
                )}
                <div className="space-y-3">
                  {group.items.map(({ option }) => (
                    <ResultCard
                      key={option.id}
                      option={option}
                      baselineTourismStatus={props.baselineTourismStatus}
                      locale={props.locale}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
