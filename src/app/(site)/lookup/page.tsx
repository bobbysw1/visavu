/**
 * Server-side redirect endpoint for no-JS form submission. The LookupForm
 * client component uses router.push for instant transitions when JS is
 * available; for users with JS disabled (corporate firewalls, slow
 * connections, screen readers) the form's `action="/lookup"` ensures a
 * normal HTTP submit still resolves to the right result page.
 *
 * Read passport / destination / purpose / sub from search params, validate,
 * redirect.
 */
import { redirect, notFound } from "next/navigation";
import { COUNTRY_LIST } from "@/lib/countries";
import { isValidPurpose } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LookupRedirect({
  searchParams,
}: {
  searchParams: Promise<{ passport?: string; destination?: string; purpose?: string; sub?: string }>;
}) {
  const sp = await searchParams;
  const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));

  const passport = sp.passport?.toUpperCase();
  const destination = sp.destination?.toUpperCase();
  if (!passport || !destination || !validIso.has(passport) || !validIso.has(destination)) {
    notFound();
  }

  const params = new URLSearchParams();
  if (sp.purpose && isValidPurpose(sp.purpose)) params.set("purpose", sp.purpose);
  if (sp.sub) params.set("sub", sp.sub);
  const qs = params.toString();

  redirect(`/${passport.toLowerCase()}/${destination.toLowerCase()}${qs ? "?" + qs : ""}`);
}
