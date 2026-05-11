import Link from "next/link";
import type { Metadata } from "next";
import { guidesByDate } from "@/content/guides";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Guides — visa policy explained · ${SITE.name}`,
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Guides</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Long-form pieces on the visa policies travellers ask about most. Live data tables
          pulled from the same database that powers the rest of the site.
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          <Link href="/guides.xml" className="underline hover:no-underline">RSS feed</Link>
          {" · "}
          <Link href="/methodology" className="underline hover:no-underline">methodology</Link>
        </p>
      </header>

      <ol className="space-y-4">
        {guides.map(({ frontmatter }) => (
          <li key={frontmatter.slug}>
            <Link
              href={`/guides/${frontmatter.slug}`}
              className="block p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <h2 className="text-base sm:text-lg font-semibold leading-snug">
                  {frontmatter.title}
                </h2>
                <span className="text-xs text-neutral-500 tabular-nums shrink-0">
                  {fmtDate(frontmatter.publishedAt)} · {frontmatter.readingMinutes} min
                </span>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug mb-2">
                {frontmatter.summary}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
