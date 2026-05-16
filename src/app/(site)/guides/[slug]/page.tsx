import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, guideBySlug } from "@/content/guides";
import { absoluteUrl, SITE } from "@/lib/site";
import { breadcrumbJsonLd, Breadcrumbs } from "@/components/Breadcrumbs";
import { getCountryPhoto } from "@/lib/pexels";

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
    title: frontmatter.title,
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
      images: [
        {
          url: absoluteUrl(
            `/og?title=${encodeURIComponent(frontmatter.title)}&kicker=${encodeURIComponent("Guide")}`,
          ),
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.summary,
      images: [
        absoluteUrl(
          `/og?title=${encodeURIComponent(frontmatter.title)}&kicker=${encodeURIComponent("Guide")}`,
        ),
      ],
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
  const photo = frontmatter.heroIso2 ? await getCountryPhoto(frontmatter.heroIso2) : null;

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

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-10">
          <p className="kicker mb-4">{frontmatter.tags[0] ?? "Editorial"}</p>
          <h1 className="serif-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-5">
            {frontmatter.title}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-ink-muted)] leading-relaxed mb-5 max-w-2xl">
            {frontmatter.summary}
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] tabular pt-3 border-t border-[var(--color-rule)]">
            Published {fmtDate(frontmatter.publishedAt)}
            {frontmatter.publishedAt !== frontmatter.modifiedAt && (
              <> · Updated {fmtDate(frontmatter.modifiedAt)}</>
            )}
            {" · "}
            {frontmatter.readingMinutes} min read · By {frontmatter.author}
          </p>
        </header>

        {photo && (
          <figure className="mb-10 -mx-4 sm:mx-0">
            <div className="relative aspect-[16/9]">
              {/* Guide hero is the LCP element on /guides/[slug] — give
                  it priority for WebP srcset + preload. */}
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                priority
                sizes="(min-width: 768px) 48rem, 100vw"
                className="object-cover sm:rounded-xl ring-1 ring-black/5 dark:ring-white/10"
              />
              <a
                href={photo.pexelsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wider font-semibold text-white bg-black/70 backdrop-blur px-2 py-1 rounded shadow-md hover:bg-black/85 transition"
              >
                Photo: {photo.photographer} · Pexels
              </a>
            </div>
          </figure>
        )}

        <div className="editorial-body">
          <Body />
        </div>

        <footer className="mt-16 pt-6 border-t border-[var(--color-rule)] text-sm text-[var(--color-ink-muted)]">
          <p>
            Read more in{" "}
            <Link href="/guides" className="text-[var(--color-ink)] underline underline-offset-4 hover:no-underline">
              guides
            </Link>{" "}
            · See our{" "}
            <Link href="/methodology" className="underline underline-offset-4 hover:no-underline">
              data methodology
            </Link>{" "}
            ·{" "}
            <Link href="/finder" className="underline underline-offset-4 hover:no-underline">
              Look up your route
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
