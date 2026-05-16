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
    title: "Relocation services",
    description:
      "Everything-but-the-visa: insurance, vaccinations, biometrics, medical checks, passport photos, and legal services.",
    url: absoluteUrl("/services"),
    images: [
      {
        url: absoluteUrl("/og?title=Relocation+services&kicker=Visavu"),
        width: 1200,
        height: 630,
        alt: "Visavu — Relocation services",
      },
    ],
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

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-10">
          <p className="kicker mb-3">Directory</p>
          <h1 className="billboard mb-5 max-w-2xl">Relocation services<span className="text-[var(--color-accent)]">.</span></h1>
          <p className="text-base sm:text-lg text-[var(--color-ink)]/85 leading-relaxed max-w-2xl">
            Once you know what visa you need, the natural next questions are: insurance, shots,
            biometrics, medical exam, passport photos, lawyer. Visavu surfaces a curated handful
            of providers in each category — affiliate cards earn us a small commission to keep
            the visa tool free.{" "}
            <Link href="/disclosure" className="underline underline-offset-4 hover:no-underline text-[var(--color-ink)]">
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
                className="ink-card p-5 hover:border-[var(--color-ink)] transition block"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h2 className="serif-display text-xl font-medium">{meta.label}</h2>
                  <span className="kicker tabular">
                    {counts[cat]} provider{counts[cat] === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-ink)]/85 mb-2">
                  {meta.tagline}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] leading-snug line-clamp-3">
                  {meta.description}
                </p>
                <p className="mt-3 text-xs font-medium text-[var(--color-ink)]">
                  Browse providers →
                </p>
              </Link>
            );
          })}
        </div>

        <section className="mt-16">
          <p className="kicker mb-3">Editorial policy</p>
          <h2 className="section-h2 mb-5">How we choose providers.</h2>
          <ul className="text-base text-[var(--color-ink)]/85 space-y-3 max-w-2xl">
            <li className="border-l-2 border-[var(--color-ink)] pl-4 py-0.5">
              <strong className="serif-display text-lg">Affiliate listings</strong> — earn Visavu a referral when you sign up. We pick
              providers we&apos;d use ourselves; we don&apos;t accept money to bump rank.
            </li>
            <li className="border-l-2 border-[var(--color-ink)] pl-4 py-0.5">
              <strong className="serif-display text-lg">Official links</strong> — go to government immigration authorities or
              authorised panel directories. Informational, not monetised.
            </li>
            <li className="border-l-2 border-[var(--color-ink)] pl-4 py-0.5">
              <strong className="serif-display text-lg">Recommended badges</strong> — flag the editorial top pick when there&apos;s a
              clear standout for the route.
            </li>
            <li className="border-l-2 border-[var(--color-accent)] pl-4 py-0.5">
              <strong className="serif-display text-lg">We don&apos;t list visa-application services</strong> — the visa info above
              is the product, and we won&apos;t compromise its independence.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
