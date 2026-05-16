import Link from "next/link";
import type { Metadata } from "next";
import { guidesByDate } from "@/content/guides";
import { absoluteUrl } from "@/lib/site";
import { getCountryPhotoSync } from "@/lib/pexels";

export const metadata: Metadata = {
  title: "Guides — visa policy explained",
  description:
    "Editorial guides on the visa policies that matter — ETIAS, UK ETA, Schengen EES, Working Holiday visas, Digital Nomad visas, and the recent reciprocity reversals.",
  alternates: {
    canonical: absoluteUrl("/guides"),
    types: { "application/rss+xml": absoluteUrl("/guides.xml") },
  },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

export default function GuidesIndex() {
  const guides = guidesByDate();

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-12">
        <p className="kicker mb-3">Editorial</p>
        <h1 className="billboard mb-5 max-w-2xl">Guides<span className="text-[var(--color-accent)]">.</span></h1>
        <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed max-w-2xl">
          Long-form pieces on the visa policies travellers ask about most. Live data tables
          pulled from the same database that powers the rest of the site.
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-4">
          <Link href="/guides.xml" className="underline underline-offset-4 hover:no-underline">RSS feed</Link>
          {" · "}
          <Link href="/methodology" className="underline underline-offset-4 hover:no-underline">methodology</Link>
        </p>
      </header>

      <ol className="space-y-px bg-[var(--color-rule)] border-y border-[var(--color-rule)]">
        {guides.map(({ frontmatter }) => {
          const photo = frontmatter.heroIso2 ? getCountryPhotoSync(frontmatter.heroIso2) : null;
          return (
            <li key={frontmatter.slug} className="bg-[var(--color-paper)]">
              <Link
                href={`/guides/${frontmatter.slug}`}
                className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-4 sm:gap-6 p-2 sm:p-4 hover:bg-[var(--color-paper-elev)] transition group"
              >
                {photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full sm:w-48 h-32 sm:h-32 object-cover rounded-md ring-1 ring-black/5 dark:ring-white/10"
                  />
                ) : (
                  <div className="w-full sm:w-48 h-32 sm:h-32 rounded-md bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-950/40 dark:to-sky-950/40 ring-1 ring-black/5 dark:ring-white/10" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                    <h2 className="serif-display text-xl sm:text-2xl font-medium leading-tight group-hover:underline underline-offset-4 decoration-1">
                      {frontmatter.title}
                    </h2>
                    <span className="text-xs text-[var(--color-ink-muted)] tabular shrink-0">
                      {fmtDate(frontmatter.publishedAt)} · {frontmatter.readingMinutes} min
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-ink)]/85 leading-relaxed mb-3 max-w-2xl">
                    {frontmatter.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {frontmatter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block text-[11px] px-2 py-0.5 rounded bg-[var(--color-muted)] text-[var(--color-ink-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
