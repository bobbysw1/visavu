import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";
import {
  SERVICE_CATEGORIES,
  CATEGORY_META,
  servicesFor,
} from "@/lib/services";
import { ALL_SERVICES } from "@/content/services";

export const metadata: Metadata = {
  title: "Relocation services — insurance, vaccinations, biometrics, legal",
  description:
    "Curated directory of relocation services that pair with your visa: travel and health insurance, required vaccinations, biometrics appointment centres, medical-check panel physicians, passport photo providers, and immigration lawyers.",
  alternates: { canonical: absoluteUrl("/services") },
  openGraph: {
    title: `Relocation services — ${SITE.name}`,
    description:
      "Everything-but-the-visa: insurance, vaccinations, biometrics, medical checks, passport photos, and legal services.",
    url: absoluteUrl("/services"),
  },
};

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
];

export default function ServicesIndexPage() {
  const counts: Record<string, number> = {};
  for (const cat of SERVICE_CATEGORIES) {
    counts[cat] = servicesFor(ALL_SERVICES, { category: cat }).length;
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: SERVICE_CATEGORIES.length,
    itemListElement: SERVICE_CATEGORIES.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/services/${CATEGORY_META[cat].slug}`,
      name: CATEGORY_META[cat].label,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Relocation services directory
          </h1>
          <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Once you know what visa you need, the natural next questions are: insurance, shots,
            biometrics, medical exam, passport photos, lawyer. Visavu surfaces a curated handful
            of providers in each category — affiliate cards earn us a small commission to keep
            the visa tool free.{" "}
            <Link href="/disclosure" className="underline hover:no-underline">
              See our commercial policy
            </Link>
            .
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICE_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Link
                key={cat}
                href={`/services/${meta.slug}`}
                className="block p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition bg-white dark:bg-neutral-900"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h2 className="font-semibold text-base">{meta.label}</h2>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {counts[cat]} provider{counts[cat] === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {meta.tagline}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-3">
                  {meta.description}
                </p>
                <p className="mt-3 text-xs font-medium text-blue-700 dark:text-blue-400">
                  Browse providers →
                </p>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <h2 className="text-base font-semibold mb-2">How we choose providers</h2>
          <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1.5 list-disc list-inside marker:text-neutral-400">
            <li>
              <strong>Affiliate listings</strong> earn Visavu a referral when you sign up. We pick
              providers we&apos;d use ourselves; we don&apos;t accept money to bump rank.
            </li>
            <li>
              <strong>Official links</strong> go to government immigration authorities or
              authorised panel directories — informational, not monetised.
            </li>
            <li>
              <strong>Recommended badges</strong> flag the editorial top pick when there&apos;s a
              clear standout for the route.
            </li>
            <li>
              <strong>We don&apos;t list visa-application services</strong> — the visa info above
              is the product, and we won&apos;t compromise its independence.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
