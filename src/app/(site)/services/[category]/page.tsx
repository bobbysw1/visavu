import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ServiceCard } from "@/components/RelocationServicesPanel";
import { ServiceCategoryIcon } from "@/components/ServiceCategoryIcon";
import { SITE, absoluteUrl } from "@/lib/site";
import {
  SERVICE_CATEGORIES,
  CATEGORY_META,
  servicesFor,
  type ServiceCategory,
} from "@/lib/services";
import { ALL_SERVICES } from "@/content/services";

const SLUG_TO_CATEGORY: Record<string, ServiceCategory> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [CATEGORY_META[c].slug, c]),
);

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map((c) => ({ category: CATEGORY_META[c].slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> },
): Promise<Metadata> {
  const { category: slug } = await params;
  const category = SLUG_TO_CATEGORY[slug];
  if (!category) return { title: "Not found" };
  const meta = CATEGORY_META[category];
  return {
    title: `${meta.label} — relocation services`,
    description: meta.description,
    alternates: { canonical: absoluteUrl(`/services/${meta.slug}`) },
    openGraph: {
      title: `${meta.label} — relocation services`,
      description: meta.tagline,
      url: absoluteUrl(`/services/${meta.slug}`),
      images: [
        {
          url: absoluteUrl(`/og?title=${encodeURIComponent(meta.label)}&kicker=${encodeURIComponent("Services")}`),
          width: 1200,
          height: 630,
          alt: `${meta.label} — relocation services`,
        },
      ],
    },
  };
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = SLUG_TO_CATEGORY[slug];
  if (!category) notFound();

  const meta = CATEGORY_META[category];
  const services = servicesFor(ALL_SERVICES, { category });

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: `/services/${meta.slug}`, label: meta.label },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-8 flex flex-col sm:flex-row sm:items-start gap-5">
          <ServiceCategoryIcon category={category} size={40} className="!p-4" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold mb-2">
              Relocation services
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{meta.label}</h1>
            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
              {meta.tagline}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {meta.description}
            </p>
            {meta.affiliateSafe && (
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                Cards marked <em>Sponsored</em> earn Visavu a referral.{" "}
                <Link href="/disclosure" className="underline hover:no-underline">
                  Our commercial policy →
                </Link>
              </p>
            )}
            {!meta.affiliateSafe && (
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                Informational only — links go to government authorities or non-profit registries.
              </p>
            )}
          </div>
        </header>

        {services.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">
            No providers in this category yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-base font-semibold mb-3">Other relocation services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICE_CATEGORIES.filter((c) => c !== category).map((c) => (
              <Link
                key={c}
                href={`/services/${CATEGORY_META[c].slug}`}
                className="text-sm px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
              >
                {CATEGORY_META[c].label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
