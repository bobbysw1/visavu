import type { Metadata } from "next";
import { buildPairMetadata, PairContent } from "./pairContent";

// Bare pair page — e.g. /us/jp. Tourism is the default ("canonical") purpose,
// so the bare URL renders the tourism view. Other purposes live at the path
// form /us/jp/work etc. (the [purpose] sub-route).
//
// This file reads ONLY the path params (passport + destination) — never
// searchParams, cookies, or headers — so each page is statically rendered once
// and reused for an hour (ISR). That is the fix for the function-CPU spikes:
// a sitemap crawl now hits cheap saved copies instead of triggering a fresh
// rebuild on every request. See pairContent.tsx for the full rationale.
//
// force-static: there are ~235k pair URLs, far too many to prebuild at build
// time, so we don't define generateStaticParams. Without force-static a dynamic
// route segment ([passport]) defaults to per-request rendering. force-static
// tells Next to render each URL on first request and then CACHE it (ISR), which
// is exactly the behaviour we want. dynamicParams defaults to true, so any
// passport/destination is generated on demand the first time it's visited.
export const dynamic = "force-static";
// 24h matches the s-maxage CDN cache header in next.config.ts headers().
// Underlying visa data only refreshes monthly (see cron schedule), so a
// 1h revalidate (the old value) meant every one of the ~235k pair URLs
// went stale and re-rendered on the next crawler hit every single hour —
// the dominant source of origin transfer/ISR reads.
export const revalidate = 86400;

type Params = { passport: string; destination: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { passport, destination } = await params;
  return buildPairMetadata(passport, destination, "tourism");
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { passport, destination } = await params;
  return <PairContent passport={passport} destination={destination} purpose="tourism" />;
}
