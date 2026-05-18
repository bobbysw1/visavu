import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";
import { allMythSlugs, mythBySlug, VERDICT_LABEL, type Verdict } from "@/content/myths";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86_400;

export function generateStaticParams() {
  return allMythSlugs().map((slug) => ({ slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const myth = mythBySlug(slug);
  if (!myth) return { title: "Not found" };
  const title = `${myth.question} — Visavu`;
  return {
    title,
    description: myth.metaDescription,
    alternates: { canonical: absoluteUrl(`/myths/${slug}`) },
    openGraph: {
      title: myth.question,
      description: myth.metaDescription,
      url: absoluteUrl(`/myths/${slug}`),
      images: [
        {
          url: absoluteUrl(`/og?title=${encodeURIComponent(myth.question)}&kicker=${encodeURIComponent("Visavu — Myths & rumours")}`),
          width: 1200,
          height: 630,
          alt: myth.question,
        },
      ],
    },
  };
}

const VERDICT_TONE: Record<Verdict, { badge: string; bar: string }> = {
  false: { badge: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200", bar: "border-red-500" },
  mostly_false: { badge: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200", bar: "border-orange-500" },
  partial: { badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200", bar: "border-amber-500" },
  true_but: { badge: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200", bar: "border-sky-500" },
  depends: { badge: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200", bar: "border-neutral-500" },
};

export default async function MythDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const myth = mythBySlug(slug);
  if (!myth) notFound();

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/myths", label: "Myths & rumours" },
    { href: `/myths/${slug}`, label: myth.question },
  ];

  const tone = VERDICT_TONE[myth.verdict];

  // Question + Answer JSON-LD for rich-results eligibility.
  const qaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Question",
    name: myth.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${VERDICT_LABEL[myth.verdict]}. ${myth.headline} ${myth.truth}`,
      url: absoluteUrl(`/myths/${slug}`),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaJsonLd) }} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <Breadcrumbs crumbs={crumbs} />

        <DisclaimerBanner tone="info" compact />

        <header className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${tone.badge}`}>
              Verdict: {VERDICT_LABEL[myth.verdict]}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Last verified {myth.lastVerified}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">{myth.question}</h1>
          <p className={`text-lg leading-relaxed border-l-4 pl-4 ${tone.bar} text-neutral-800 dark:text-neutral-200`}>
            {myth.headline}
          </p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>The truth</h2>
          <p className="whitespace-pre-wrap leading-relaxed">{myth.truth}</p>

          <h2>Why this rumour persists</h2>
          <p className="whitespace-pre-wrap leading-relaxed">{myth.whyExists}</p>

          <h2>What to actually do</h2>
          <ul>
            {myth.whatToDo.map((step, i) => <li key={i}>{step}</li>)}
          </ul>

          {myth.countryNotes && myth.countryNotes.length > 0 && (
            <>
              <h2>Country-specific notes</h2>
              <ul>
                {myth.countryNotes.map((note, i) => (
                  <li key={i}>
                    <strong>{note.country}:</strong> {note.note}
                  </li>
                ))}
              </ul>
            </>
          )}

          {myth.relatedRoutes && myth.relatedRoutes.length > 0 && (
            <>
              <h2>Related visa routes on Visavu</h2>
              <ul>
                {myth.relatedRoutes.map((route, i) => (
                  <li key={i}>
                    <Link href={route.href} className="text-blue-700 dark:text-blue-300 hover:underline">{route.label}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2>Sources</h2>
          <ul>
            {myth.sources.map((src, i) => (
              <li key={i}>
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline">
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-5 space-y-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Need a verified answer for your specific situation?</h3>
          <p className="text-sm text-blue-900/90 dark:text-blue-200/90">
            General information about immigration policy is helpful for orientation,
            but every case has details that affect the outcome. A paid time-boxed
            consultation with a registered immigration adviser (UK IAA, AU MARA, CA CICC,
            US bar-admitted attorney) gets you specific answers in writing.
          </p>
          <Link href="/find-my-visa" className="inline-block rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2">
            Start with the personalised visa finder
          </Link>
        </aside>

        <footer className="text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-6 space-y-2">
          <p>
            This entry is general information, not legal advice. Immigration rules change.
            Verify against the destination's official immigration authority before
            making any decision. Sources last reviewed {myth.lastVerified}.
          </p>
          <p>
            Spot something wrong? Email <a href={`mailto:${SITE.contactEmail}`} className="text-blue-700 dark:text-blue-300 hover:underline">{SITE.contactEmail}</a> with a source URL.
          </p>
          <p>
            <Link href="/myths" className="text-blue-700 dark:text-blue-300 hover:underline">← All myths</Link>
          </p>
        </footer>
      </article>
    </>
  );
}
