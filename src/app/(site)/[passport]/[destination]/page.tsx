import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { AlternativesPanel } from "@/components/AlternativesPanel";
// ObstaclesPanel was removed — its content now feeds ResultBannerStack
// (single-banner zone) and the inline disclosure on each ResultCard.
import { DirectAnswerCard } from "@/components/DirectAnswerCard";
import { EmptyStateCard } from "@/components/EmptyStateCard";
// PolicyChangeBanner content now feeds ResultBannerStack — kept available
// for future inline use via the policyChangesFor() helper.
import { DualPassportHint } from "@/components/DualPassportHint";
import { AlertOptIn } from "@/components/AlertOptIn";
import { ResultBannerStack } from "@/components/ResultBannerStack";
import { RouteHero } from "@/components/RouteHero";
import { VisaPrepTimeline } from "@/components/VisaPrepTimeline";
import { VisaApplicationAdvice } from "@/components/VisaApplicationAdvice";
import { getCountryPhoto } from "@/lib/pexels";
import { policyChangesFor } from "@/content/recentPolicyChanges";
import { assessRealism } from "@/lib/realism";
import { easierPassportsFor } from "@/lib/coverage";
import {
  isSupportedLocale,
  type Locale,
  isRtl,
} from "@/i18n/t";
import { SourcesPanel } from "@/components/SourcesPanel";
import { TravelAdjacentRail } from "@/components/TravelAdjacentRail";
import { RelocationServicesPanel } from "@/components/RelocationServicesPanel";
import { EmbassyLocator } from "@/components/EmbassyLocator";
import { DIYStatementCallout } from "@/components/DIYStatementCallout";
import { DestinationSidebar } from "@/components/DestinationSidebar";
import { VisaOptionsByPurpose } from "@/components/VisaOptionsByPurpose";
import { RefineSearchPanel } from "@/components/RefineSearchPanel";
import { assessDifficulty } from "@/lib/difficulty";
import { isProfile, type Profile } from "@/lib/profiles";
import { RelatedRoutesRail } from "@/components/RelatedRoutesRail";
import { obstaclesFor } from "@/content/obstacles";
import { COUNTRY_LIST, flagEmoji, nameFor } from "@/lib/countries";
import { Flag } from "@/components/Flag";
import { nationalityFor } from "@/lib/nationalities";
import { resolveRoute } from "@/lib/resolver";
import {
  type Purpose,
  type ResolvedVisaOption,
  PURPOSE_LABEL,
  PURPOSE_CATEGORY,
  isValidPurpose,
} from "@/lib/types";
import { SITE, absoluteUrl } from "@/lib/site";

type Params = { passport: string; destination: string };
type Search = { purpose?: string; lang?: string; currency?: string; profile?: string };

function normalize(iso2: string): string | null {
  const upper = iso2.toUpperCase();
  return COUNTRY_LIST.some((c) => c.iso2 === upper) ? upper : null;
}

// Question-form H1 matches how people actually search ("can a German travel
// to Japan?") rather than the database-y "German passport → Japan".
function questionH1(p: string, d: string, purpose: Purpose): string {
  const nat = nationalityFor(p);
  const dest = destinationWithArticle(d);
  const a = articleFor(nat);
  switch (purpose) {
    case "tourism":
      return `Can ${a} ${nat} traveller visit ${dest}?`;
    case "business":
      return `Can ${a} ${nat} visit ${dest} for business?`;
    case "transit":
      return `Can ${a} ${nat} transit through ${dest}?`;
    case "work":
      return `Can ${a} ${nat} traveller work in ${dest}?`;
    case "study":
      return `Can ${a} ${nat} traveller study in ${dest}?`;
    case "family":
      return `Can ${a} ${nat} traveller move to ${dest} with family?`;
    case "diplomatic":
      return `Diplomatic-passport entry from ${nat} to ${dest}`;
  }
}

/** Country names that take the definite article in English ("the United Kingdom",
 *  "the Netherlands"). Most countries don't — so default is bare name. */
const DEFINITE_ARTICLE_DESTINATIONS = new Set([
  "GB", "US", "AE", "NL", "PH", "BS", "DO", "GM", "MV", "MH", "SB", "CD", "CG", "CZ", "VG", "KY",
  "TC", "VI", "FK", "CK", "VA",
]);

function destinationWithArticle(iso2: string): string {
  const name = nameFor(iso2);
  if (DEFINITE_ARTICLE_DESTINATIONS.has(iso2.toUpperCase())) return `the ${name}`;
  return name;
}

/** Indefinite article picker that handles the common nationality demonyms.
 *  Most start with a clear vowel or consonant; the only frequent trap is
 *  silent-h ("an Honduran" is wrong — Honduran is "a Honduran"). We only
 *  need vowel/consonant first letter to cover the demonym set we use. */
function articleFor(word: string): "a" | "an" {
  const first = word.trim().charAt(0).toLowerCase();
  return ["a", "e", "i", "o", "u"].includes(first) ? "an" : "a";
}

function purposeFrom(s: string | undefined): Purpose {
  return s && isValidPurpose(s) ? s : "tourism";
}

/**
 * React-cache'd wrapper around resolveRoute so both generateMetadata and
 * the page component can call it with the same inputs without paying
 * the DB cost twice. Cache scope is a single request/render.
 */
const cachedResolveRoute = cache(async (p: string, d: string, purpose: Purpose) => {
  try {
    return await resolveRoute({ passportIso2: p, destinationIso2: d, purpose });
  } catch {
    return null;
  }
});

// Title patterns vary by purpose so we capture the long-tail SEO terms users
// actually search for. "X to Y visa requirements" works for tourism, but for
// work/study/family people search "X to Y work visa", "Y student visa from X",
// "Y partner visa from X", etc.
function titleFor(p: string, d: string, purpose: Purpose): string {
  const adj = nationalityFor(p);
  const dest = nameFor(d);
  switch (purpose) {
    case "tourism":
      return `${dest} tourist visa for ${adj} passport holders`;
    case "business":
      return `${dest} business visa for ${adj} passport holders`;
    case "transit":
      return `${dest} transit visa for ${adj} passport holders`;
    case "work":
      return `${dest} work visa for ${adj} passport holders`;
    case "study":
      return `${dest} student visa for ${adj} passport holders`;
    case "family":
      return `${dest} partner & family visa for ${adj} passport holders`;
    case "diplomatic":
      return `${dest} diplomatic visa for ${adj} passport holders`;
  }
}

function descriptionFor(p: string, d: string, purpose: Purpose): string {
  const purposePhrase = purpose === "tourism" ? "tourist" : PURPOSE_LABEL[purpose].toLowerCase();
  return `Do ${nationalityFor(p)} passport holders need a ${purposePhrase} visa to ${nameFor(d)}? See visa type, cost, processing time, and required documents — sourced from official government data with a primary-source link on every answer.`;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { passport, destination } = await params;
  const sp = await searchParams;
  const p = normalize(passport);
  const d = normalize(destination);
  if (!p || !d) return { title: "Not found" };

  const purpose = purposeFrom(sp.purpose);
  const title = titleFor(p, d, purpose);
  const description = descriptionFor(p, d, purpose);
  // Canonical path-form URL — /us/jp/study is shareable and survives every
  // messaging-app URL preview. Tourism is the default purpose so we keep
  // its canonical as the bare /us/jp form.
  const canonical = absoluteUrl(
    purpose === "tourism"
      ? `/${p.toLowerCase()}/${d.toLowerCase()}`
      : `/${p.toLowerCase()}/${d.toLowerCase()}/${purpose}`,
  );

  // Thin-page detection — when the resolver returns zero options, the
  // page renders a boilerplate "no data yet" fallback. Telling Google to
  // skip indexing these is the right move: a large index of thin pages
  // hurts overall site quality signals (Google's been demoting these in
  // "Crawled — currently not indexed"). When the resolver throws or is
  // unreachable, we default to letting indexing through — better safe.
  const route = await cachedResolveRoute(p, d, purpose);
  const hasContent = !route || route.primary.length > 0;
  const robotsMeta = hasContent
    ? undefined
    : { index: false as const, follow: true as const };

  return {
    title,
    description,
    ...(robotsMeta ? { robots: robotsMeta } : {}),
    alternates: {
      canonical,
      types: {
        // Platforms with oEmbed auto-discovery (Substack, WordPress, Notion,
        // Medium) pick this up and render an iframe card when this URL is
        // pasted as a link.
        "application/json+oembed": absoluteUrl(
          `/api/oembed?url=${encodeURIComponent(canonical)}`,
        ),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: absoluteUrl(`/og?from=${p}&to=${d}&purpose=${purpose}`), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(`/og?from=${p}&to=${d}&purpose=${purpose}`)],
    },
  };
}

function travelActionJsonLd(
  passportIso2: string,
  destIso2: string,
  options: ResolvedVisaOption[],
) {
  const primary = options[0];
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    name: `Travel from ${nameFor(passportIso2)} to ${nameFor(destIso2)}`,
    fromLocation: { "@type": "Country", name: nameFor(passportIso2) },
    toLocation: { "@type": "Country", name: nameFor(destIso2) },
  };
  if (primary?.fees?.length) {
    const total = primary.fees
      .filter((f) => !f.optional)
      .reduce<{ amountMinor: number; currency: string } | null>((acc, f) => {
        if (!acc) return { amountMinor: f.amountMinor, currency: f.currency };
        if (acc.currency !== f.currency) return acc;
        return { amountMinor: acc.amountMinor + f.amountMinor, currency: acc.currency };
      }, null);
    if (total) {
      node.priceSpecification = {
        "@type": "PriceSpecification",
        price: total.amountMinor / 100,
        priceCurrency: total.currency,
      };
    }
  }
  return node;
}

// Article JSON-LD — signals to LLMs (Claude, ChatGPT, Gemini, Perplexity)
// and to Google that each country-pair page is an authored, dated article,
// not a thin templated landing page. The dateModified pulls from the most
// recent verification on the underlying visa options when available, falling
// back to today. The headline matches the page <h1>, which LLMs use as the
// citation anchor.
function articleJsonLdFor(
  p: string,
  d: string,
  purpose: Purpose,
  options: ResolvedVisaOption[],
  canonicalUrl: string,
) {
  const headline = questionH1(p, d, purpose);
  const description = descriptionFor(p, d, purpose);

  // Pick latest verification date across options. Falls back to today.
  let lastVerified: string | undefined;
  for (const opt of options) {
    const v = opt.lastVerifiedAt;
    if (!v) continue;
    if (!lastVerified || v > lastVerified) lastVerified = v;
  }
  const dateModified = lastVerified ?? new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    datePublished: "2025-01-01T00:00:00.000Z",
    dateModified,
    about: [
      { "@type": "Country", name: nameFor(p) },
      { "@type": "Country", name: nameFor(d) },
    ],
    keywords: [
      `${nationalityFor(p)} ${PURPOSE_LABEL[purpose].toLowerCase()} visa`,
      `${nameFor(d)} visa`,
      `${nameFor(p)} ${nameFor(d)} visa`,
      `${PURPOSE_LABEL[purpose]} visa requirements`,
    ].join(", "),
  };
}

// FAQ varies by purpose. People searching for a tourist visa ask different
// questions than people searching for a partner visa.
function faqJsonLdFor(p: string, d: string, purpose: Purpose, options: ResolvedVisaOption[]) {
  const top = options[0];
  const purposePhrase = purpose === "tourism" ? "tourist" : PURPOSE_LABEL[purpose].toLowerCase();

  const baseQuestions = [
    {
      "@type": "Question",
      name: `Do ${nationalityFor(p)} passport holders need a ${purposePhrase} visa for ${nameFor(d)}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: top
          ? `${top.label}. ${
              top.maxStayDays != null ? `Maximum stay is ${top.maxStayDays} days. ` : ""
            }${top.applicationUrl ? `Apply: ${top.applicationUrl}` : ""}`
          : `We do not yet have verified data for this combination. Please consult ${nameFor(d)}'s embassy or official immigration site.`,
      },
    },
    {
      "@type": "Question",
      name: `How much does a ${nameFor(d)} ${purposePhrase} visa cost?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: top?.fees?.length
          ? `Mandatory fees total approximately ${
              (top.fees.filter((f) => !f.optional).reduce((s, f) => s + f.amountMinor, 0) / 100).toFixed(2)
            } ${top.fees[0].currency}. Service fees may apply.`
          : `Cost varies. Check the official source linked on this page for current fees.`,
      },
    },
    {
      "@type": "Question",
      name: `How long does it take to get a ${nameFor(d)} ${purposePhrase} visa?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: top?.processingTimeDaysMin
          ? `Typical processing: ${top.processingTimeDaysMin}–${top.processingTimeDaysMax} days. Allow extra time during peak seasons and for biometrics appointments.`
          : `Processing time varies. Apply well in advance of your planned travel.`,
      },
    },
  ];

  // Purpose-specific extra question.
  let extra: Record<string, unknown> | null = null;
  if (purpose === "work") {
    extra = {
      "@type": "Question",
      name: `Do I need a job offer for a ${nameFor(d)} work visa?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Most ${nameFor(d)} work visas require a confirmed job offer from a licensed sponsor. See the work visa details panel on this page for sponsor requirements and salary thresholds.`,
      },
    };
  } else if (purpose === "study") {
    extra = {
      "@type": "Question",
      name: `Can I work part-time on a ${nameFor(d)} student visa?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Many countries allow international students to work limited hours during term and full-time during vacations. The student visa details panel shows the specific hours allowed for ${nameFor(d)}.`,
      },
    };
  } else if (purpose === "family") {
    extra = {
      "@type": "Question",
      name: `What relationship qualifies for a ${nameFor(d)} partner or family visa?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${nameFor(d)} family visa eligibility typically covers spouses, civil partners, dependent children, and in some cases parents. The family visa details panel shows the specific relationship types and any sponsor income requirements.`,
      },
    };
  } else if (purpose === "diplomatic") {
    extra = {
      "@type": "Question",
      name: `Do diplomatic passport holders need a visa for ${nameFor(d)}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Diplomatic visa requirements depend on bilateral agreements and accreditation. Visa fees are commonly waived. Confirm the specific requirement with the issuing ministry of foreign affairs.`,
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: extra ? [...baseQuestions, extra] : baseQuestions,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { passport, destination } = await params;
  const sp = await searchParams;
  const p = normalize(passport);
  const d = normalize(destination);
  if (!p || !d) notFound();

  const purpose = purposeFrom(sp.purpose);
  const category = PURPOSE_CATEGORY[purpose];
  const profile: Profile | null = sp.profile && isProfile(sp.profile) ? sp.profile : null;

  // Cost optimisation: no per-request headers()/cookies() reads here. The
  // page is ISR-cached by Vercel based on its URL (passport + destination +
  // purpose searchParam), so per-visitor variation (locale, currency) is
  // resolved on the CLIENT by LocaleSwitcher + CurrencySwitcher + ResultCard
  // reading the same cookie/URL state. SSR renders the universal default;
  // hydration upgrades it.
  const locale: Locale = sp.lang && isSupportedLocale(sp.lang) ? sp.lang : "en";
  const userCurrency = "USD";
  const userSecondaryCurrency: string | null = null;

  let options: ResolvedVisaOption[] = [];
  let alternatives: Awaited<ReturnType<typeof resolveRoute>>["alternatives"] = [];
  let baselineTourismStatus: Awaited<ReturnType<typeof resolveRoute>>["baselineTourismStatus"] = null;
  let resolverError: string | null = null;
  try {
    // Reuse the cached resolver call from generateMetadata so we don't
    // pay the DB cost twice on a single render.
    const route = await cachedResolveRoute(p, d, purpose);
    if (!route) throw new Error("resolver unavailable");
    // Always surface EVERY purpose on the result page. Most users land
    // on /gb/au (no purpose param → defaults to tourism) but want to
    // see "is there a work visa for me?" too. The visa list groups by
    // purpose with all groups collapsed; the DirectAnswerCard at the
    // top still reflects the URL's primary purpose, so context
    // doesn't get lost.
    const merged = [...route.primary];
    const seen = new Set(route.primary.map((o) => o.id));
    for (const alt of route.alternatives) {
      for (const opt of alt.options) {
        if (!seen.has(opt.id)) {
          seen.add(opt.id);
          merged.push(opt);
        }
      }
    }
    options = merged;
    alternatives = route.alternatives;
    baselineTourismStatus = route.baselineTourismStatus;

    // Profile-aware widening: when a user has picked "Doctor" / "Engineer" /
    // "High-school graduate" / etc. the URL's `purpose` (often tourism by
    // default) shouldn't restrict what they see. Pull options from EVERY
    // profile-relevant purpose and merge them in. That way clicking
    // "Doctor" on /us/au surfaces work + skilled-migration visas in addition
    // to tourism, instead of just sorting two tourism rows.
    if (profile) {
      const PROFILE_PURPOSES: Record<Profile, Purpose[]> = {
        doctor: ["work", "study"],
        engineer: ["work"],
        trade_worker: ["work"],
        hnwi: ["work", "family"],
        investor: ["work"],
        digital_nomad: ["work"],
        remote_worker: ["work"],
        student: ["study"],
        high_school_graduate: ["work", "study", "tourism"],
        entrepreneur: ["work"],
        retiree: ["family", "tourism"],
      };
      const seen = new Set(options.map((o) => o.id));
      const extra = await Promise.all(
        PROFILE_PURPOSES[profile]
          .filter((extraPurpose) => extraPurpose !== purpose)
          .map(async (extraPurpose) => {
            try {
              const r = await resolveRoute({
                passportIso2: p,
                destinationIso2: d,
                purpose: extraPurpose,
              });
              return r.primary;
            } catch {
              return [] as ResolvedVisaOption[];
            }
          }),
      );
      for (const list of extra) {
        for (const opt of list) {
          if (!seen.has(opt.id)) {
            seen.add(opt.id);
            options.push(opt);
          }
        }
      }
    }
  } catch (e) {
    resolverError = e instanceof Error ? e.message : "Lookup failed";
  }

  const obstacles = obstaclesFor(p, d);

  // Fetch both country hero photos (Pexels-sourced, served locally). Either
  // can be null — RouteHero degrades gracefully when one or both are missing.
  const [passportPhoto, destinationPhoto] = await Promise.all([
    getCountryPhoto(p),
    getCountryPhoto(d),
  ]);

  // Compute the realism on the primary option to decide whether to surface
  // the dual-passport hint. Only a low-realism (uncertain / unlikely) cell
  // benefits from "have you considered your other passport?".
  const primary = options[0];
  const showDualHint = (() => {
    if (!primary) return false;
    if (primary.status === "visa_free" || primary.status === "visa_free_with_eta") return false;
    const realism = assessRealism(primary, obstacles, baselineTourismStatus);
    return realism.score < 7;
  })();
  const easierPassports = showDualHint ? await easierPassportsFor(d, p, 6) : [];

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/passport/${p.toLowerCase()}`, label: `${nameFor(p)} passport` },
    {
      href: `/${p.toLowerCase()}/${d.toLowerCase()}`,
      label: `to ${nameFor(d)}`,
    },
  ];

  // Self-canonical URL — matches what generateMetadata computes. Tourism is
  // the default purpose so its canonical is the bare pair URL.
  const articleCanonical = absoluteUrl(
    purpose === "tourism"
      ? `/${p.toLowerCase()}/${d.toLowerCase()}`
      : `/${p.toLowerCase()}/${d.toLowerCase()}/${purpose}`,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />
      {/* Article schema — declares each page as authored content with a
          dateModified. Critical for LLM citation (Claude / ChatGPT / Perplexity
          / Gemini all parse Article JSON-LD from training-data scrapes). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLdFor(p, d, purpose, options, articleCanonical)),
        }}
      />
      {options.length > 0 && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(travelActionJsonLd(p, d, options)) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdFor(p, d, purpose, options)) }}
          />
        </>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8" dir={isRtl(locale) ? "rtl" : "ltr"} lang={locale}>
        <Breadcrumbs crumbs={crumbs} />

        <RouteHero
          passportIso2={p}
          destinationIso2={d}
          passportPhoto={passportPhoto}
          destinationPhoto={destinationPhoto}
          title={questionH1(p, d, purpose)}
          subtitle={
            <>
              {PURPOSE_LABEL[purpose]} visa requirements ·{" "}
              <Link href={`/passport/${p.toLowerCase()}`} className="underline hover:no-underline">
                See all destinations for {nationalityFor(p)} travellers
              </Link>
            </>
          }
        />

        {/* Fallback header for cases where both photos are missing — keeps
            the page readable without a hero. */}
        {!passportPhoto && !destinationPhoto && (
          <header className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3 mb-6">
            <div className="flex items-center gap-2 shrink-0" aria-hidden>
              <Flag iso2={p} size={32} />
              <span className="text-neutral-300 dark:text-neutral-700 text-xl">→</span>
              <Flag iso2={d} size={32} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {questionH1(p, d, purpose)}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                {PURPOSE_LABEL[purpose]} visa requirements ·{" "}
                <Link href={`/passport/${p.toLowerCase()}`} className="underline hover:no-underline">
                  See all destinations for {nationalityFor(p)} travellers
                </Link>
              </p>
            </div>
          </header>
        )}

        {/* Highest-severity warning band — sits full-width above the 2-col
            grid so it can't be missed even if the user scrolls down the
            options column. */}
        <ResultBannerStack
          obstacles={obstacles}
          policyChanges={policyChangesFor(p, d, purpose)}
          realism={primary ? assessRealism(primary, obstacles, baselineTourismStatus) : null}
        />

        {category === "long_stay" && (
          <div className="mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-sm">
            <p className="font-semibold mb-1">{PURPOSE_LABEL[purpose]} visas have major life consequences.</p>
            <p className="text-neutral-700 dark:text-neutral-300">
              Long-stay visa decisions affect your right to live, work, study, or remain with
              family. Always verify with a qualified immigration adviser or the destination&apos;s
              embassy before making travel, employment, or relocation decisions.
            </p>
          </div>
        )}

        {category === "official" && (
          <div className="mb-6 p-4 rounded-xl border border-slate-300 bg-slate-50 dark:bg-slate-900/40 text-sm">
            <p className="font-semibold mb-1">Diplomatic visa.</p>
            <p className="text-neutral-700 dark:text-neutral-300">
              Diplomatic visa applications go through the issuing country&apos;s ministry of foreign
              affairs. The mission/embassy in {nameFor(d)} coordinates accreditation. Standard
              tourist visa rules do not apply.
            </p>
          </div>
        )}

        {resolverError && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm mb-6">
            <p className="font-medium mb-1">Lookup is temporarily unavailable.</p>
            <p className="text-neutral-700 dark:text-neutral-300 text-xs">{resolverError}</p>
          </div>
        )}

        {/* 2-column magazine layout: visa options on the LEFT (the main
            decision the user is here to make), destination context on
            the RIGHT (photo, key metrics, official entry portal). The
            sidebar is sticky on desktop so it stays visible while
            users scroll a long option list. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* MAIN COLUMN */}
          <div className="min-w-0 space-y-6">
            {/* Compact red/amber/green answer band — replaces the long
                three-paragraph block that used to live here. */}
            <DirectAnswerCard
              passportIso2={p}
              destinationIso2={d}
              purpose={purpose}
              options={options}
              baselineTourismStatus={baselineTourismStatus}
            />

            {/* "Narrow your search" — collapsed by default. Profile pills,
                prefilled passport/destination/purpose form, and a
                prominent CTA to the 12-question questionnaire. Sits
                above the visa list so users can refine before browsing. */}
            <RefineSearchPanel
              passportIso2={p}
              destinationIso2={d}
              purpose={purpose}
              profile={profile}
            />

            {!resolverError && options.length === 0 && (
              <EmptyStateCard passportIso2={p} destinationIso2={d} purpose={purpose} />
            )}

            {options.length > 0 && (
              <VisaOptionsByPurpose
                options={options}
                baselineTourismStatus={baselineTourismStatus}
                passportIso2={p}
                destinationIso2={d}
                locale={locale}
                userCurrency={userCurrency}
                secondaryCurrency={userSecondaryCurrency}
              />
            )}

            {options.length > 0 && (
              <AlertOptIn passportIso2={p} destinationIso2={d} purpose={purpose} />
            )}

            {/* DIY personal-statement guide CTA — surfaces the single
                biggest money-saving lever for high-stakes applications.
                Only renders for family / work / study (the purposes
                where a personal statement matters). */}
            {options.length > 0 && (
              <DIYStatementCallout purpose={purpose} />
            )}

            {/* Embassy + VAC locator — only when the visa actually requires
                an in-person step. */}
            {(primary?.status === "embassy_visa" || primary?.status === "restricted") && (
              <EmbassyLocator passportIso2={p} destinationIso2={d} />
            )}

            {/* Deep detail folded behind a single disclosure. */}
            <details className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition">
                <div>
                  <p className="font-semibold text-sm sm:text-base">Application prep, advice &amp; sources</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Step-by-step checklist, when to hire a lawyer, alternative routes, related country
                    pairs, and the official primary sources behind every claim above.
                  </p>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0 group-open:rotate-180 transition">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-5 space-y-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="pt-5">
                  {purpose !== "diplomatic" && primary?.status !== "refused" && (
                    <VisaPrepTimeline
                      destinationIso2={d}
                      passportIso2={p}
                      purpose={purpose}
                      status={primary?.status ?? (category === "long_stay" ? "embassy_visa" : "e_visa")}
                    />
                  )}
                </div>

                <VisaApplicationAdvice
                  purpose={purpose}
                  passportIso2={p}
                  destinationIso2={d}
                  primaryStatus={primary?.status ?? null}
                />

                {showDualHint && easierPassports.length > 0 && (
                  <DualPassportHint destinationIso2={d} options={easierPassports} />
                )}

                <AlternativesPanel
                  passportIso2={p}
                  destinationIso2={d}
                  alternatives={alternatives}
                />

                <RelatedRoutesRail passportIso2={p} destinationIso2={d} purpose={purpose} />

                <SourcesPanel passportIso2={p} destinationIso2={d} options={options} />
              </div>
            </details>

            {/* RELOCATION SERVICES first — these are content-useful (legal
                advice, insurance, medical) and earn revenue. */}
            <RelocationServicesPanel passportIso2={p} destinationIso2={d} purpose={purpose} />

            {/* SPONSORED TRAVEL RAIL last — eSIM + flights affiliate.
                Sits below relocation services per the latest UX brief. */}
            <TravelAdjacentRail destinationIso2={d} />
          </div>

          {/* SIDEBAR — sticky on desktop, top-of-page-after-options on
              mobile (renders below the main column via order in narrow
              flex). Carries the destination's photo + facts + key metrics. */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <DestinationSidebar
              destinationIso2={d}
              passportIso2={p}
              difficulty={primary ? assessDifficulty(primary, baselineTourismStatus) : null}
              processingDaysMin={primary?.processingTimeDaysMin ?? null}
              processingDaysMax={primary?.processingTimeDaysMax ?? null}
            />
          </div>
        </div>

        {/* The "try a different route" form used to live here. It's now
            inside RefineSearchPanel at the TOP of the page. */}

        <p className="mt-10 text-xs text-neutral-500 italic">
          Informational only. A valid visa permits entry subject to officer discretion at the
          border. Always verify with the destination&apos;s embassy or official source before
          travel, employment, or relocation.
        </p>
      </main>
    </>
  );
}
