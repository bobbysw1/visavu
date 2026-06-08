import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidPurpose } from "@/lib/types";
import { buildPairMetadata, PairContent } from "../pairContent";

// Per-purpose pair page — e.g. /us/jp/work, /us/jp/study, /us/jp/business.
// The purpose comes from the URL PATH (a route param), NOT a query string.
// That is deliberate: path params are part of the cache key, so each
// purpose variant is statically rendered once and reused for an hour (ISR),
// exactly like the bare tourism page. Reading the purpose from `?purpose=`
// (the old approach) forced every request to rebuild from scratch and was a
// cause of the function-CPU spikes. See pairContent.tsx for the full story.
//
// force-static + revalidate makes each purpose variant render on first request
// and then cache (ISR), the same as the bare pair page. We don't prebuild
// params (there are hundreds of thousands), so dynamicParams stays true
// (default) and variants are generated on demand the first time they're hit.
export const dynamic = "force-static";
export const revalidate = 3600;

type Params = { passport: string; destination: string; purpose: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { passport, destination, purpose } = await params;
  if (!isValidPurpose(purpose)) return { title: "Not found" };
  return buildPairMetadata(passport, destination, purpose);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { passport, destination, purpose } = await params;

  // Tourism is canonicalised to the bare /[passport]/[destination] URL via a
  // 301 in next.config, so "tourism" never reaches this route in practice.
  // Any non-purpose third segment (e.g. /us/jp/banana) 404s.
  if (!isValidPurpose(purpose) || purpose === "tourism") notFound();

  return <PairContent passport={passport} destination={destination} purpose={purpose} />;
}
