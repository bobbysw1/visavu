"use client";

/**
 * Visa-options panel for the result page.
 *
 * Groups visa options by PURPOSE first (Tourism / Work / Study / Family /
 * Business / Transit) then by PATHWAY within each purpose. Each purpose
 * group is a collapsible card — Tourism is expanded by default (most
 * common intent), the rest open on click.
 *
 * When the user picks a profile filter ("Doctor", "High-school graduate"),
 * the most-relevant purpose group is auto-opened in addition to Tourism
 * so the user sees their actual options without an extra click.
 */
import { useMemo, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { ResolvedVisaOption, Purpose, VisaStatus } from "@/lib/types";
import type { Locale } from "@/i18n/t";
import { PURPOSE_LABEL } from "@/lib/types";
import { ResultCard } from "./ResultCard";
import { ProfileFilter } from "./ProfileFilter";
import {
  classifyAll,
  sortForProfile,
  groupByPathway,
  type ClassifiedOption,
} from "@/lib/profileMatching";
import { PATHWAY_META, isProfile, type Profile } from "@/lib/profiles";
import { useSearchParams } from "next/navigation";

const PURPOSE_ORDER: Purpose[] = ["tourism", "business", "transit", "work", "study", "family", "diplomatic"];

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

// Which purpose group should auto-open for each profile (in addition to
// Tourism). Reflects the most-likely visa pathway someone with that
// profile is actually researching.
const PROFILE_AUTO_OPEN: Record<Profile, Purpose | null> = {
  doctor: "work",
  engineer: "work",
  trade_worker: "work",
  hnwi: "work",
  investor: "work",
  digital_nomad: "work",
  remote_worker: "work",
  student: "study",
  high_school_graduate: "work",
  entrepreneur: "work",
  retiree: "family",
};

export function VisaOptionsByPurpose({
  options,
  baselineTourismStatus,
  passportIso2,
  destinationIso2,
  locale,
  userCurrency,
  secondaryCurrency,
}: {
  options: ResolvedVisaOption[];
  baselineTourismStatus: VisaStatus | null;
  passportIso2: string;
  destinationIso2: string;
  locale: Locale;
  userCurrency: string | null;
  secondaryCurrency: string | null;
}) {
  const params = useSearchParams();
  const profileParam = params.get("profile");
  const profile: Profile | null = profileParam && isProfile(profileParam) ? profileParam : null;

  // Sort + classify once. Sorting widens to include profile-relevant
  // options in `primary`; everything else stays in `secondary`.
  const { primaryByPurpose, secondary } = useMemo(() => {
    const classified = classifyAll(options);
    const { primary, secondary: sec } = sortForProfile(classified, profile);
    const map = new Map<Purpose, ClassifiedOption[]>();
    for (const item of primary) {
      const list = map.get(item.option.purpose) ?? [];
      list.push(item);
      map.set(item.option.purpose, list);
    }
    return { primaryByPurpose: map, secondary: sec };
  }, [options, profile]);

  // Auto-open Tourism + the profile's most-relevant purpose.
  const autoOpen = useMemo(() => {
    const open = new Set<Purpose>(["tourism"]);
    if (profile) {
      const want = PROFILE_AUTO_OPEN[profile];
      if (want) open.add(want);
    }
    // If profile is set and Tourism has no fit, prefer the profile's purpose
    // as the first-paint default instead.
    return open;
  }, [profile]);

  // Build the visible purpose groups in priority order.
  const visiblePurposes = PURPOSE_ORDER.filter((p) => (primaryByPurpose.get(p)?.length ?? 0) > 0);

  if (options.length === 0) return null;

  return (
    <section className="space-y-4">
      <ProfileFilter initial={profile} />

      {profile && (
        <p className="rounded-xl px-4 py-3 text-sm bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 flex items-start gap-2">
          <Sparkles size={14} className="shrink-0 mt-0.5" aria-hidden />
          <span>
            Showing visas relevant to your profile across <strong>all visa types</strong>, not
            just the one your URL points at. Clear the filter above to see only tourism.
          </span>
        </p>
      )}

      {visiblePurposes.map((purpose) => {
        const items = primaryByPurpose.get(purpose)!;
        return (
          <PurposeGroup
            key={purpose}
            purpose={purpose}
            items={items}
            openByDefault={autoOpen.has(purpose)}
            baselineTourismStatus={baselineTourismStatus}
            locale={locale}
            userCurrency={userCurrency}
            secondaryCurrency={secondaryCurrency}
            passportIso2={passportIso2}
            destinationIso2={destinationIso2}
          />
        );
      })}

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
                userCurrency={userCurrency}
                secondaryCurrency={secondaryCurrency}
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function PurposeGroup({
  purpose,
  items,
  openByDefault,
  baselineTourismStatus,
  locale,
  userCurrency,
  secondaryCurrency,
}: {
  purpose: Purpose;
  items: ClassifiedOption[];
  openByDefault: boolean;
  baselineTourismStatus: VisaStatus | null;
  locale: Locale;
  userCurrency: string | null;
  secondaryCurrency: string | null;
  passportIso2: string;
  destinationIso2: string;
}) {
  const [open, setOpen] = useState(openByDefault);
  const grouped = useMemo(() => groupByPathway(items), [items]);

  // Headline preview = best option in the group (highest-status / lowest difficulty).
  const headline = items[0]?.option;

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-2xl leading-none shrink-0 mt-0.5" aria-hidden>
            {PURPOSE_EMOJI[purpose]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg">{PURPOSE_LABEL[purpose]}</h3>
              <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {items.length} option{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
              {PURPOSE_DESCRIPTION[purpose]}
            </p>
            {!open && headline && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 truncate">
                Best fit: <span className="font-medium text-neutral-700 dark:text-neutral-200">{headline.label}</span>
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
                {/* Pathway sub-header only renders when a purpose contains multiple pathways. */}
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
                      baselineTourismStatus={baselineTourismStatus}
                      locale={locale}
                      userCurrency={userCurrency}
                      secondaryCurrency={secondaryCurrency}
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
