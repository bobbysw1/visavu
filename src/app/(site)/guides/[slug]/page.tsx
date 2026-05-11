import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, guideBySlug } from "@/content/guides";
import { absoluteUrl, SITE } from "@/lib/site";
import { breadcrumbJsonLd, Breadcrumbs } from "@/components/Breadcrumbs";

type Params = { slug: string };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Not found" };
  const { frontmatter } = guide;
  const canonical = absoluteUrl(`/guides/${frontmatter.slug}`);
  return {
    title: `${frontmatter.title} · ${SITE.name}`,
    description: frontmatter.summary,
    alternates: { canonical },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.summary,
      url: canonical,
      type: "article",
      publishedTime: frontmatter.publishedAt,
      modifiedTime: frontmatter.modifiedAt,
      authors: [frontmatter.author],
    },
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const { frontmatter, default: Body } = guide;
  const canonical = absoluteUrl(`/guides/${frontmatter.slug}`);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.summary,
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.modifiedAt,
    author: { "@type": "Organization", name: frontmatter.author },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: canonical,
    keywords: frontmatter.tags.join(", "),
  };

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/guides", label: "Guides" },
    { href: `/guides/${frontmatter.slug}`, label: frontmatter.title },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
            {frontmatter.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-snug mb-3">
            {frontmatter.summary}
          </p>
          <p className="text-xs text-neutral-500 tabular-nums">
            Published {fmtDate(frontmatter.publishedAt)}
            {frontmatter.publishedAt !== frontmatter.modifiedAt && (
              <> · Updated {fmtDate(frontmatter.modifiedAt)}</>
            )}
            {" · "}
            {frontmatter.readingMinutes} min read · By {frontmatter.author}
          </p>
        </header>

        <div className="editorial-body">
          <Body />
        </div>

        <footer className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            Read more in{" "}
            <Link href="/guides" className="text-blue-700 dark:text-blue-400 underline">
              guides
            </Link>{" "}
            · See our{" "}
            <Link href="/methodology" className="underline hover:no-underline">
              data methodology
            </Link>{" "}
            ·{" "}
            <Link href="/finder" className="underline hover:no-underline">
              Look up your route
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
