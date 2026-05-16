/**
 * Canonical route URL builder for internal links.
 *
 * Why this exists: the result page `/[passport]/[destination]` accepts
 * the purpose either as a path segment (`/gb/au/work`) OR as a query
 * param (`/gb/au?purpose=work`). The path form is the CANONICAL — see
 * generateMetadata in the result page + the sitemap.
 *
 * Until this helper existed, ~10 components built links by hand using
 * the `?purpose=` query form. Googlebot followed those internal links
 * and ended up crawling the non-canonical URL — every one of which was
 * subsequently reported under "Crawled — currently not indexed" because
 * Google saw it as a duplicate of the canonical path-form URL.
 *
 * Centralising the build here makes the canonical version impossible
 * to forget.
 */
import type { Purpose } from "./types";

export function routeHref(
  passportIso2: string,
  destinationIso2: string,
  purpose?: Purpose | string | null,
): string {
  const p = passportIso2.toLowerCase();
  const d = destinationIso2.toLowerCase();
  // Tourism is the default — canonical is the bare pair URL with no
  // purpose segment. Every other purpose uses the path form.
  if (!purpose || purpose === "tourism") return `/${p}/${d}`;
  return `/${p}/${d}/${purpose}`;
}
