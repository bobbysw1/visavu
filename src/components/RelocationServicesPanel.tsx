"use client";

/**
 * Relocation services panel — renders the seven service categories that
 * matter once a user has the visa answer (travel insurance, health
 * insurance, vaccinations, biometrics, medical checks, passport photos,
 * legal). Route-aware: filters each category to providers that serve the
 * passport + destination + purpose at hand.
 *
 * Revenue: affiliate cards carry a `data-event-*` payload that the
 * Plausible script ships as `ServiceClicked`. Authoritative / informational
 * links also fire the event for analytics — `data-event-affiliate` flags
 * whether the click was monetisable.
 *
 * Liability: cards are clearly labelled "Sponsored" when affiliate,
 * "Official" when from a government source. Visa-application services are
 * intentionally absent (the existing /disclosure page covers why).
 */
import { useState } from "react";
import Link from "next/link";
import {
  servicesFor,
  CATEGORY_META,
  SERVICE_CATEGORIES,
  affiliateUrl,
  type ServiceCategory,
  type RelocationService,
} from "@/lib/services";
import { ALL_SERVICES } from "@/content/services";
import type { Purpose } from "@/lib/types";
import { nameFor } from "@/lib/countries";

const DEFAULT_LIMIT = 3;

export function RelocationServicesPanel({
  passportIso2,
  destinationIso2,
  purpose,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
}) {
  // Precompute matches per category once so we can show counts on the chips.
  const byCategory: Record<ServiceCategory, RelocationService[]> = {} as Record<
    ServiceCategory,
    RelocationService[]
  >;
  for (const cat of SERVICE_CATEGORIES) {
    byCategory[cat] = servicesFor(ALL_SERVICES, {
      passportIso2,
      destinationIso2,
      purpose,
      category: cat,
    });
  }

  // Categories with at least one match come first; empty categories are
  // shown disabled so the user knows the section exists but didn't filter
  // anything in for this route.
  const nonEmpty = SERVICE_CATEGORIES.filter((c) => byCategory[c].length > 0);
  const empty = SERVICE_CATEGORIES.filter((c) => byCategory[c].length === 0);

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(
    nonEmpty[0] ?? "travel_insurance",
  );
  const [showAll, setShowAll] = useState(false);

  const active = byCategory[activeCategory];
  const meta = CATEGORY_META[activeCategory];
  const visible = showAll ? active : active.slice(0, DEFAULT_LIMIT);
  const hasMore = active.length > DEFAULT_LIMIT;

  return (
    <section className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold">
          Relocation services
        </p>
        <h3 className="font-semibold text-base sm:text-lg mt-1 mb-1">
          Everything else you&apos;ll need for {nameFor(destinationIso2)}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Sponsored cards earn us a small commission — it keeps the visa tool free. Official and
          informational links don&apos;t.{" "}
          <Link href="/disclosure" className="underline hover:no-underline">
            Our commercial policy →
          </Link>
        </p>
      </header>

      {/* Category chip row */}
      <div
        className="flex flex-wrap gap-2 mb-5"
        role="tablist"
        aria-label="Service categories"
      >
        {nonEmpty.map((cat) => {
          const on = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setActiveCategory(cat);
                setShowAll(false);
              }}
              title={CATEGORY_META[cat].description}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                on
                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100"
                  : "bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              }`}
            >
              {CATEGORY_META[cat].label}
              <span className="ml-1.5 text-[10px] font-mono opacity-70">{byCategory[cat].length}</span>
            </button>
          );
        })}
        {empty.map((cat) => (
          <span
            key={cat}
            title={`No curated providers for this route under "${CATEGORY_META[cat].label}" yet.`}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
          >
            {CATEGORY_META[cat].label}
            <span className="ml-1.5 text-[10px] font-mono">—</span>
          </span>
        ))}
      </div>

      {/* Active category card */}
      <div
        className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5"
        role="tabpanel"
        aria-label={`${meta.label} services`}
      >
        <header className="mb-3">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="font-semibold text-sm sm:text-base">{meta.label}</h4>
            <Link
              href={`/services/${meta.slug}`}
              className="text-xs text-blue-700 dark:text-blue-400 underline hover:no-underline"
            >
              All providers →
            </Link>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{meta.description}</p>
        </header>

        {active.length === 0 ? (
          <p className="text-sm text-neutral-500 italic py-3">
            No curated providers for this route yet. Check the{" "}
            <Link href={`/services/${meta.slug}`} className="underline">
              full {meta.label.toLowerCase()} directory
            </Link>{" "}
            for global options.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visible.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  passportIso2={passportIso2}
                  destinationIso2={destinationIso2}
                  purpose={purpose}
                />
              ))}
            </div>
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                {showAll ? "Show fewer" : `Show ${active.length - DEFAULT_LIMIT} more`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const BADGE_TONE: Record<NonNullable<RelocationService["badge"]>, string> = {
  recommended: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  official: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
  value: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
  global: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200",
};

const BADGE_LABEL: Record<NonNullable<RelocationService["badge"]>, string> = {
  recommended: "Recommended",
  official: "Official",
  value: "Value pick",
  global: "Global",
};

export function ServiceCard({
  service,
  passportIso2,
  destinationIso2,
  purpose,
}: {
  service: RelocationService;
  passportIso2?: string;
  destinationIso2?: string;
  purpose?: Purpose;
}) {
  const href = service.affiliate
    ? affiliateUrl(service.url, {
        passportIso2,
        destinationIso2,
        purpose,
        campaign: service.category,
      })
    : service.url;

  return (
    <a
      href={href}
      target="_blank"
      rel={service.affiliate ? "noreferrer noopener sponsored" : "noreferrer noopener"}
      className="plausible-event-name=ServiceClicked block p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition bg-white dark:bg-neutral-950"
      data-event-category={service.category}
      data-event-provider={service.id}
      data-event-affiliate={service.affiliate ? "yes" : "no"}
      data-event-destination={destinationIso2 ?? ""}
      data-event-passport={passportIso2 ?? ""}
      data-event-purpose={purpose ?? ""}
      title={service.description}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-semibold text-sm leading-tight">{service.provider}</p>
        {service.badge && (
          <span
            className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${BADGE_TONE[service.badge]}`}
          >
            {BADGE_LABEL[service.badge]}
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 leading-snug line-clamp-3">
        {service.description}
      </p>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span
          className={`font-medium ${
            service.affiliate
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {service.affiliate ? "Sponsored" : "Information"}
          {service.feeNote && (
            <span className="ml-1.5 text-neutral-400 dark:text-neutral-500">· {service.feeNote}</span>
          )}
        </span>
        <span className="text-blue-700 dark:text-blue-400 font-medium">
          {service.cta ?? "Open service"} →
        </span>
      </div>
    </a>
  );
}
