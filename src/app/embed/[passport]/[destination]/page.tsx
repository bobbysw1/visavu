/**
 * Embeddable result card. Designed for iframe inclusion on travel blogs and
 * partner sites — no header, no footer, just the result card and a small
 * attribution link. Auto-posts its height to the parent so the embedding
 * site can size the iframe.
 *
 *   <iframe src="https://visavu.com/embed/de/jp?purpose=tourism" />
 *
 * The page sets `X-Frame-Options: ALLOWALL` (via the response headers
 * configured in `next.config.ts`) and renders without site chrome.
 */
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { COUNTRY_LIST, flagEmoji, nameFor } from "@/lib/countries";
import { resolveRoute } from "@/lib/resolver";
import {
  type Purpose,
  type ResolvedVisaOption,
  PURPOSE_LABEL,
  isValidPurpose,
} from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";
import { absoluteUrl, SITE } from "@/lib/site";

type Params = { passport: string; destination: string };
type Search = { purpose?: string };

function normalize(iso2: string): string | null {
  const upper = iso2.toUpperCase();
  return COUNTRY_LIST.some((c) => c.iso2 === upper) ? upper : null;
}

function purposeFrom(s: string | undefined): Purpose {
  return s && isValidPurpose(s) ? s : "tourism";
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
  const p = normalize(passport);
  const d = normalize(destination);
  if (!p || !d) return { title: "Visa lookup embed" };
  const purpose = purposeFrom(sp.purpose);
  return {
    title: `${nameFor(p)} → ${nameFor(d)} (${PURPOSE_LABEL[purpose]})`,
    robots: { index: false, follow: false }, // embed pages aren't independently indexed
  };
}

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { passport, destination } = await params;
  const sp = await searchParams;
  const p = normalize(passport);
  const d = normalize(destination);
  if (!p || !d) notFound();

  const purpose = purposeFrom(sp.purpose);

  let options: ResolvedVisaOption[] = [];
  try {
    const route = await resolveRoute({ passportIso2: p, destinationIso2: d, purpose });
    options = route.primary;
  } catch {
    // DB unavailable — render empty state.
  }

  return (
    <main className="p-3 bg-white dark:bg-neutral-950 min-h-[1px]">
      <header className="flex items-center gap-2 mb-3 text-sm">
        <span className="text-2xl" aria-hidden>{flagEmoji(p)}</span>
        <span className="text-neutral-400 dark:text-neutral-600">→</span>
        <span className="text-2xl" aria-hidden>{flagEmoji(d)}</span>
        <span className="font-semibold ml-1 truncate">
          {nameFor(p)} → {nameFor(d)}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
          ({PURPOSE_LABEL[purpose]})
        </span>
      </header>

      {options.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-sm text-neutral-700 dark:text-neutral-300">
          We don&apos;t yet have verified data for this combination.{" "}
          <a
            href={absoluteUrl(`/${p.toLowerCase()}/${d.toLowerCase()}?purpose=${purpose}`)}
            target="_top"
            className="text-blue-700 dark:text-blue-400 underline"
          >
            See the full lookup →
          </a>
        </div>
      ) : (
        <ResultCard option={options[0]} />
      )}

      <footer className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <span>
          Data:{" "}
          <a
            href={absoluteUrl(`/${p.toLowerCase()}/${d.toLowerCase()}?purpose=${purpose}`)}
            target="_top"
            className="underline hover:no-underline"
          >
            {SITE.name}
          </a>{" "}
          · primary-source linked above
        </span>
      </footer>

      {/* Auto-post height to parent so embedders can size the iframe.
          Compatible with iframe-resizer if the embedding site uses it. */}
      <Script id="embed-height" strategy="afterInteractive">{`
        (function() {
          function post() {
            try {
              var h = document.documentElement.scrollHeight || document.body.scrollHeight;
              window.parent.postMessage({ type: "visaLookupEmbed", height: h }, "*");
            } catch(_) {}
          }
          var id = setInterval(post, 500);
          window.addEventListener("load", post);
          window.addEventListener("resize", post);
          setTimeout(function() { clearInterval(id); }, 5000);
        })();
      `}</Script>
    </main>
  );
}
