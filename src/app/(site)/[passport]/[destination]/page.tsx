import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { AlternativesPanel } from "@/components/AlternativesPanel";
// ObstaclesPanel was removed — its content now feeds ResultBannerStack
// (single-banner zone) and the inline disclosure on each ResultCard.
import { EditorialBillboard } from "@/components/EditorialBillboard";
import { EmptyStateCard } from "@/components/EmptyStateCard";
// PolicyChangeBanner content now feeds ResultBannerStack — kept available
// for future inline use via the policyChangesFor() helper.
import { DualPassportHint } from "@/components/DualPassportHint";
import { AlertOptIn } from "@/components/AlertOptIn";
import { PassportApplicantPanel } from "@/components/PassportApplicantPanel";
import { ResultBannerStack } from "@/components/ResultBannerStack";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { pairIntroFor } from "@/content/pairIntros";
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
import { UsReciprocityPanel } from "@/components/UsReciprocityPanel";
import { WatchRouteButton } from "@/components/WatchRouteButton";
import { watchRouteAction, unwatchRouteAction } from "./watchActions";
import { currentUser } from "@/lib/auth";
// Pair page renders mostly visa data (db) but ALSO checks the signed-in
// user's watchlist subscriptions — that single query needs userDb so
// the result is consistent with what watchActions wrote.
import { db, userDb, schema } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { COUNTRY_LIST, flagEmoji, issuesPassport, nameFor } from "@/lib/countries";
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

/** Origin side of /[passport]/[destination] must be a passport-issuing
 *  country — otherwise we'd serve "AQ passport visa requirements for visiting
 *  JP" type nonsense. Destination side stays broad. */
function normalizeOrigin(iso2: string): string | null {
  const upper = normalize(iso2);
  return upper && issuesPassport(upper) ? upper : null;
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
  const p = normalizeOrigin(passport);
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
  const p = normalizeOrigin(passport);
  const d = normalize(destination);
  if (!p || !d) notFound();

  const purpose = purposeFrom(sp.purpose);
  const category = PURPOSE_CATEGORY[purpose];
  const profile: Profile | null = sp.profile && isProfile(sp.profile) ? sp.profile : null;

  // Cost optimisation: no per-request headers()/cookies() reads here. The
  // page is ISR-cached by Vercel based on its URL (passport + destination +
  // purpose searchParam), so per-visitor variation (locale, currency) is
  // resolved on the CLIENT — the <Money> component inside each ResultCard
  // reads the vl_currency cookie at hydration time and renders the native
  // amount + a converted "(≈ £X)" hint when the user has picked a different
  // currency via the header switcher.
  const locale: Locale = sp.lang && isSupportedLocale(sp.lang) ? sp.lang : "en";

  // Auth + watchlist state for the "Watch this route" button. Anonymous
  // visitors see a sign-in CTA; signed-in users see the toggle.
  let signedInUser: { id: number; email: string } | null = null;
  let alreadyWatching = false;
  try {
    signedInUser = await currentUser();
    if (signedInUser) {
      // userDb routes to managed Postgres when DATABASE_URL is set so
      // the read sees whatever watchActions just wrote.
      const rows = await userDb
        .select({ id: schema.watchlistSubscriptions.id })
        .from(schema.watchlistSubscriptions)
        .where(
          and(
            eq(schema.watchlistSubscriptions.userId, signedInUser.id),
            eq(schema.watchlistSubscriptions.passportIso2, p),
            eq(schema.watchlistSubscriptions.destinationIso2, d),
            eq(schema.watchlistSubscriptions.purpose, purpose),
          ),
        )
        .limit(1);
      alreadyWatching = rows.length > 0;
    }
  } catch {
    // DB unavailable / cookies not parseable — render as anonymous.
  }

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

  // Destination hero photo (Pexels-sourced, served locally) for the
  // EditorialBillboard atmospheric backdrop. May be null — Billboard
  // degrades gracefully without a photo.
  const destinationPhoto = await getCountryPhoto(d);

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

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8" dir={isRtl(locale) ? "rtl" : "ltr"} lang={locale}>
        <Breadcrumbs crumbs={crumbs} />

        {/* ─── EDITORIAL BILLBOARD ───
            Full-bleed atmospheric photo + serif headline + status pill +
            4-cell metric strip. Replaces RouteHero + DirectAnswerCard.
            Carries the entire above-the-fold answer in one band. */}
        <EditorialBillboard
          passportIso2={p}
          destinationIso2={d}
          purpose={purpose}
          options={options}
          baselineTourismStatus={baselineTourismStatus}
          destinationPhoto={destinationPhoto}
          headline={questionH1(p, d, purpose)}
        />

        {/* Highest-severity warnings (sanctions, suspended programmes, recent
            policy reversals) — full-width band beneath the billboard so it's
            unmissable even on long pages. */}
        <ResultBannerStack
          obstacles={obstacles}
          policyChanges={policyChangesFor(p, d, purpose)}
          realism={primary ? assessRealism(primary, obstacles, baselineTourismStatus) : null}
        />

        <div className="my-6">
          <DisclaimerBanner tone="amber" compact />
        </div>

        {/* Curated pair-level framing paragraph for top-traffic routes.
            Adds narrative context (bilateral agreements, diaspora, professional
            pipelines, refusal patterns) above the structured visa cards. */}
        {(() => {
          const pairIntro = pairIntroFor(p, d);
          if (!pairIntro) return null;
          return (
            <section className="ink-card p-5 sm:p-6 mb-6 border-l-4 border-l-[var(--color-accent)]">
              <p className="kicker text-xs uppercase tracking-wider mb-2 text-[var(--color-ink-muted)]">
                The story of {nameFor(p)} → {nameFor(d)}
              </p>
              <p className="text-base leading-relaxed text-[var(--color-ink)]">{pairIntro}</p>
            </section>
          );
        })()}

        {category === "long_stay" && (
          <div className="mb-8 ink-card p-5 text-sm border-l-4 border-l-[var(--color-accent)]">
            <p className="serif-display text-lg font-medium mb-1">
              {PURPOSE_LABEL[purpose]} visas have major life consequences.
            </p>
            <p className="text-[var(--color-ink)]/80 leading-relaxed">
              Long-stay visa decisions affect your right to live, work, study, or remain with
              family. Always verify with a qualified immigration adviser or the destination&apos;s
              embassy before making travel, employment, or relocation decisions.
            </p>
          </div>
        )}

        {category === "official" && (
          <div className="mb-8 ink-card p-5 text-sm">
            <p className="serif-display text-lg font-medium mb-1">Diplomatic visa.</p>
            <p className="text-[var(--color-ink)]/80 leading-relaxed">
              Diplomatic visa applications go through the issuing country&apos;s ministry of foreign
              affairs. The mission/embassy in {nameFor(d)} coordinates accreditation. Standard
              tourist visa rules do not apply.
            </p>
          </div>
        )}

        {resolverError && (
          <div className="ink-card p-5 text-sm mb-8 border-l-4 border-l-amber-500">
            <p className="font-medium mb-1">Lookup is temporarily unavailable.</p>
            <p className="text-[var(--color-ink-muted)] text-xs">{resolverError}</p>
          </div>
        )}

        {/* 2-col editorial layout: main answer column on the left, sticky
            destination sidebar on the right. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          {/* MAIN COLUMN */}
          <div className="min-w-0 space-y-12">

            {/* ─── REFINE SEARCH + WATCH ROUTE ───
                Refine panel (collapsed) on the left; watch-route button
                aligned right. Signed-in users get a toggle; anonymous
                see a sign-in CTA. */}
            <div className="space-y-3">
              <RefineSearchPanel
                passportIso2={p}
                destinationIso2={d}
                purpose={purpose}
                profile={profile}
              />
              <div className="flex justify-end">
                <WatchRouteButton
                  passportIso2={p}
                  destinationIso2={d}
                  purpose={purpose}
                  signedIn={signedInUser !== null}
                  alreadyWatching={alreadyWatching}
                  onWatch={watchRouteAction}
                  onUnwatch={unwatchRouteAction}
                />
              </div>
            </div>

            {!resolverError && options.length === 0 && (
              <EmptyStateCard passportIso2={p} destinationIso2={d} purpose={purpose} />
            )}

            {/* ─── VISA OPTIONS ───
                The meat of the page. Each option rendered as an editorial
                card via VisaOptionsByPurpose → ResultCard. */}
            {options.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
                  <h2 className="section-h2">Your visa options</h2>
                  <span className="kicker">
                    {options.length} {options.length === 1 ? "route" : "routes"} available
                  </span>
                </div>
                <VisaOptionsByPurpose
                  options={options}
                  baselineTourismStatus={baselineTourismStatus}
                  passportIso2={p}
                  destinationIso2={d}
                  locale={locale}
                />
              </section>
            )}

            {/* ─── DO THIS NEXT — application timeline ───
                Surfaced visibly (not folded) because timing the prep window
                is one of the most frequent user pain points. Only for
                routes that actually require an application. */}
            {options.length > 0 && purpose !== "diplomatic" && primary?.status !== "refused" &&
              primary?.status !== "visa_free" && (
                <section>
                  <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
                    <h2 className="section-h2">Do this next</h2>
                    <span className="kicker">application timeline</span>
                  </div>
                  <VisaPrepTimeline
                    destinationIso2={d}
                    passportIso2={p}
                    purpose={purpose}
                    status={primary?.status ?? (category === "long_stay" ? "embassy_visa" : "e_visa")}
                  />
                </section>
              )}

            {/* ─── ROUTE-SPECIFIC ADVICE ───
                The hand-written or per-purpose AdviceBlock — what carries
                weight, money-saving tips, lawyer triage, personal-statement
                skeleton. Renders only when the route actually needs a visa. */}
            {options.length > 0 && (
              <VisaApplicationAdvice
                purpose={purpose}
                passportIso2={p}
                destinationIso2={d}
                primaryStatus={primary?.status ?? null}
              />
            )}

            {/* ─── DIY personal-statement callout ───
                Surfaces the single biggest money-saving lever for
                family / work / study applications. */}
            {options.length > 0 && (
              <DIYStatementCallout purpose={purpose} />
            )}

            {/* ─── Embassy + VAC locator ───
                Only when the visa actually requires an in-person step. */}
            {(primary?.status === "embassy_visa" || primary?.status === "restricted") && (
              <EmbassyLocator passportIso2={p} destinationIso2={d} />
            )}

            {/* ─── Per-applicant documentation panel ───
                Renders the country-specific process for the applicant's
                passport (e.g. ACRO for UK, FBI for US). Closes the gap
                where generic "police clearance" rendered identically
                for every nationality. */}
            <PassportApplicantPanel passportIso2={p} />

            {/* ─── Get notified ─── */}
            {options.length > 0 && (
              <AlertOptIn passportIso2={p} destinationIso2={d} purpose={purpose} />
            )}

            {/* ─── ALTERNATIVES + DEEP DETAIL ───
                Folded by default. Most users don't need the alternatives
                + sources panels but power-users / sceptics do. */}
            <div className="space-y-3">
              {showDualHint && easierPassports.length > 0 && (
                <DualPassportHint destinationIso2={d} options={easierPassports} />
              )}

              <details className="ink-card overflow-hidden">
                <summary className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-[var(--color-muted)]/40 transition">
                  <div>
                    <h3 className="serif-display text-xl font-medium">Alternative routes</h3>
                    <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                      If this visa doesn&apos;t work for you — adjacent passports, related
                      destinations, second-best routes.
                    </p>
                  </div>
                  <span className="chev text-[var(--color-ink-muted)]">▾</span>
                </summary>
                <div className="px-6 pb-6 border-t border-[var(--color-rule)] pt-5 space-y-6">
                  <AlternativesPanel
                    passportIso2={p}
                    destinationIso2={d}
                    alternatives={alternatives}
                  />
                  <RelatedRoutesRail passportIso2={p} destinationIso2={d} purpose={purpose} />
                </div>
              </details>

              <details className="ink-card overflow-hidden">
                <summary className="px-6 py-5 flex items-center justify-between gap-4 hover:bg-[var(--color-muted)]/40 transition">
                  <div>
                    <h3 className="serif-display text-xl font-medium">Sources &amp; verification</h3>
                    <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                      Every claim above traced to an official government source.
                    </p>
                  </div>
                  <span className="chev text-[var(--color-ink-muted)]">▾</span>
                </summary>
                <div className="px-6 pb-6 border-t border-[var(--color-rule)] pt-5">
                  <SourcesPanel passportIso2={p} destinationIso2={d} options={options} />
                </div>
              </details>

              {/* US reciprocity panel — renders only when destination is US
                  and the passport has a curated entry. Captures the
                  per-nationality fee / validity / entries that the State
                  Department's reciprocity schedule sets, plus narrative
                  about what the bilateral rules actually mean in practice. */}
              {d === "US" && <UsReciprocityPanel passportIso2={p} />}
            </div>

            {/* ─── WHILE YOU'RE HERE ───
                Affiliate strip — relocation services (legal / insurance /
                medical) and travel-adjacent (eSIM / flights). Inline cards
                in editorial style. */}
            <section className="border-t border-[var(--color-rule)] pt-8">
              <p className="kicker mb-4">While you&apos;re here</p>
              <RelocationServicesPanel passportIso2={p} destinationIso2={d} purpose={purpose} />
              <div className="mt-6">
                <TravelAdjacentRail destinationIso2={d} />
              </div>
            </section>
          </div>

          {/* ─── SIDEBAR ───
              Sticky on desktop, stacks below main column on mobile. */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <DestinationSidebar
              destinationIso2={d}
              passportIso2={p}
              difficulty={primary ? assessDifficulty(primary, baselineTourismStatus) : null}
              processingDaysMin={primary?.processingTimeDaysMin ?? null}
              processingDaysMax={primary?.processingTimeDaysMax ?? null}
            />
          </aside>
        </div>

        <p className="mt-12 text-xs text-[var(--color-ink-muted)] italic max-w-2xl serif-display">
          Informational only. A valid visa permits entry subject to officer discretion at the
          border. Always verify with the destination&apos;s embassy or official source before
          travel, employment, or relocation.
        </p>
      </main>
    </>
  );
}
