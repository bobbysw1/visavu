import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";
import { MYTHS, VERDICT_LABEL, VERDICT_BLURB, type Verdict } from "@/content/myths";

export const dynamic = "force-static";
export const revalidate = 86_400;

export const metadata: Metadata = {
  title: "Immigration myths & rumours — what's actually true",
  description:
    "Twenty of the most common immigration rumours, fact-checked against government sources. Marriage visas, birthright citizenship, overstays, tourist-visa work, Golden Visas, the Schengen 90/180 rule, and more — with verdicts and what to actually do.",
  alternates: { canonical: absoluteUrl("/myths") },
  openGraph: {
    title: "Immigration myths & rumours — what's actually true",
    description:
      "Twenty common immigration rumours, fact-checked against government sources. Verdicts, plain-English truth, and what to do.",
    url: absoluteUrl("/myths"),
    images: [
      {
        url: absoluteUrl("/og?title=Immigration+myths+%26+rumours&kicker=Visavu"),
        width: 1200,
        height: 630,
        alt: "Visavu — Immigration myths & rumours",
      },
    ],
  },
};

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/myths", label: "Myths & rumours" },
];

const VERDICT_TONE: Record<Verdict, { badge: string; dot: string }> = {
  false: { badge: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200", dot: "bg-red-500" },
  mostly_false: { badge: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200", dot: "bg-orange-500" },
  partial: { badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200", dot: "bg-amber-500" },
  true_but: { badge: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200", dot: "bg-sky-500" },
  depends: { badge: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200", dot: "bg-neutral-500" },
};

export default function MythsIndexPage() {
  // ItemList JSON-LD so SERPs surface this as a curated list.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: MYTHS.length,
    itemListElement: MYTHS.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.question,
      url: absoluteUrl(`/myths/${m.slug}`),
    })),
  };

  // FAQ JSON-LD — each myth's question + verdict headline becomes a Q&A
  // for rich-results eligibility.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MYTHS.map((m) => ({
      "@type": "Question",
      name: m.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${VERDICT_LABEL[m.verdict]}. ${m.headline}`,
      },
    })),
  };

  // Group by verdict for the at-a-glance section.
  const byVerdict: Record<Verdict, typeof MYTHS> = {
    false: [], mostly_false: [], partial: [], true_but: [], depends: [],
  };
  for (const m of MYTHS) byVerdict[m.verdict].push(m);
  const verdictOrder: Verdict[] = ["false", "mostly_false", "partial", "true_but", "depends"];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <Breadcrumbs crumbs={crumbs} />

        <header className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Immigration myths &amp; rumours</h1>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Twenty of the most common immigration claims people repeat — fact-checked against
            government sources (gov.uk, USCIS, ec.europa.eu, IRCC, MARA, MFAs of destination
            countries). Each entry has a verdict, the plain-English truth, why the rumour
            persists, and what to actually do. <strong>Wikipedia is not used as a source.</strong>
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This is general information, not legal advice. Immigration rules change.
            Verify with the destination's official immigration authority or speak to a
            registered immigration adviser before relying on any of this for an
            application.
          </p>
        </header>

        {/* Quick legend */}
        <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/40">
          <h2 className="text-base font-semibold mb-3">Verdict key</h2>
          <ul className="space-y-2 text-sm">
            {verdictOrder.map((v) => (
              <li key={v} className="flex items-start gap-3">
                <span className={`inline-block w-2.5 h-2.5 rounded-full mt-1.5 ${VERDICT_TONE[v].dot}`} />
                <span><strong>{VERDICT_LABEL[v]}</strong> — {VERDICT_BLURB[v]}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Grid of myths */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">All twenty</h2>
          <ul className="space-y-3">
            {MYTHS.map((m) => {
              const tone = VERDICT_TONE[m.verdict];
              return (
                <li key={m.slug}>
                  <Link
                    href={`/myths/${m.slug}`}
                    className="block rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-400 dark:hover:border-blue-600 transition group"
                  >
                    <div className="flex items-start gap-4">
                      <span className={`shrink-0 inline-block px-2.5 py-1 text-xs font-semibold rounded ${tone.badge}`}>
                        {VERDICT_LABEL[m.verdict]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {m.question}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                          {m.headline}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-6 space-y-2">
          <p>
            Spot something wrong? Email <a href={`mailto:${SITE.contactEmail}`} className="text-blue-700 dark:text-blue-300 hover:underline">{SITE.contactEmail}</a> with a source URL and we'll re-verify.
          </p>
          <p>
            Last full review: {new Date().toISOString().slice(0, 10)}. We re-verify every entry quarterly.
          </p>
        </footer>
      </div>
    </>
  );
}
