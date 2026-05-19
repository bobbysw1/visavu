/**
 * Middleware handles four unrelated concerns:
 *
 * 1. WordPress 410 Gone (visavu.com was previously a Vietnamese WordPress
 *    visa-service site, 2024–early 2025). Crawlers still hold the old URLs
 *    in their index. For paths we can sensibly redirect we use 301s in
 *    next.config.ts; for pure WordPress system paths (no new equivalent) we
 *    return HTTP 410 Gone here — the strongest "permanently removed" signal
 *    which de-indexes faster than a 404. Also catches drive-by vulnerability
 *    scanners hitting common WordPress URLs on every domain.
 *
 * 2. /admin/* gate — requires ADMIN_TOKEN env var to be set AND matched via
 *    ?key= query or admin_token cookie. If unset, /admin/* 404s entirely.
 *
 * 3. /passport/[iso] redirect for non-issuing territories — Curaçao
 *    residents use Dutch passports, Réunion uses French, Bermuda uses
 *    British (BOTC variant). Rather than 404 those URLs we redirect to
 *    the parent country's passport page so users see useful rules
 *    instead of a dead end. PARENT_PASSPORT lives in lib/countries.
 *
 * 4. /[iso]/[dest] AND /[iso]/[dest]/[purpose] redirect when the origin
 *    iso is a non-issuing territory — same problem as #3 but on the
 *    pair pages instead of the per-passport overview. Before this fix,
 *    Google had ~256 indexed URLs like /sh/tr/transit, /cw/us/work,
 *    /re/de/study that the pair-page handler 404'd because
 *    `normalizeOrigin("sh")` rejects non-passport-issuing ISOs. Now we
 *    301-redirect to the parent iso version with the rest of the path
 *    preserved (and a ?from=<original> hint so the destination page
 *    could surface a "we redirected from <territory>" callout later).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PARENT_PASSPORT } from "@/lib/countries";

// WordPress + opportunistic-scanner paths — return 410 Gone.
const GONE_PATTERNS: RegExp[] = [
  /^\/wp-admin(?:\/|$)/,
  /^\/wp-content(?:\/|$)/,
  /^\/wp-includes(?:\/|$)/,
  /^\/wp-json(?:\/|$)/,
  /^\/wp-login\.php$/,
  /^\/wp-cron\.php$/,
  /^\/wp-config\.php$/,
  /^\/wp-config-sample\.php$/,
  /^\/xmlrpc\.php$/,
  /^\/wlwmanifest\.xml$/,
  /^\/readme\.html$/,
  /^\/license\.txt$/,
];

// Iso pattern for the pair-redirect matcher — must match the actual
// non-issuing iso codes we need to catch. Hard-coded as a regex group
// rather than wildcarding `:iso([a-z]{2})` to avoid catching the
// 100+ legitimate /xx/yy pair routes on every request. List built
// from PARENT_PASSPORT keys in lib/countries.ts; if you add a new
// non-issuing territory there, also add it to this regex.
// Build from PARENT_PASSPORT keys in lib/countries.ts — keep these in
// sync. Listed inline rather than imported so the matcher is a static
// string Next.js can compile at build time.
const NON_ISSUING_PAIR_MATCHER =
  "/:iso(ai|as|aw|ax|bl|bm|bq|cc|ck|cw|cx|fk|fo|gf|gg|gl|gp|gu|im|je|ky|mf|mp|mq|ms|nc|nf|nu|pf|pm|pn|pr|re|sh|sj|sx|tc|tk|vg|vi|wf|yt)/:rest*";

export const config = {
  matcher: [
    "/admin/:path*",
    // Non-issuing-territory passport URLs — redirected to parent country.
    // The matcher is intentionally broad (any /passport/[iso]); the
    // PARENT_PASSPORT lookup filters down to just the iso2s that need
    // redirecting. Static pages for actually-issuing countries pass
    // through to the Next.js route handler as before.
    "/passport/:iso",
    // Non-issuing-territory pair URLs — same fix as /passport/[iso]
    // but for /[iso]/[dest] and /[iso]/[dest]/[purpose]. Hard-coded
    // iso list (not a generic :iso([a-z]{2}) wildcard) keeps the
    // matcher cheap on every legitimate pair-page request.
    NON_ISSUING_PAIR_MATCHER,
    // WordPress legacy URLs — 410 Gone.
    "/wp-admin/:path*",
    "/wp-content/:path*",
    "/wp-includes/:path*",
    "/wp-json/:path*",
    "/wp-login.php",
    "/wp-cron.php",
    "/wp-config.php",
    "/wp-config-sample.php",
    "/xmlrpc.php",
    "/wlwmanifest.xml",
    "/readme.html",
    "/license.txt",
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. WordPress 410 handler — checked first so admin-token logic only runs
  //    on actual /admin/* paths.
  for (const pattern of GONE_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(null, {
        status: 410,
        headers: {
          "Cache-Control": "public, max-age=2592000, s-maxage=2592000",
        },
      });
    }
  }

  // 2. /passport/[iso] redirect for non-issuing territories.
  //    Curaçao residents use Dutch passports, etc. We 301 to the parent
  //    country's passport page with a ?from=<iso> hint so the destination
  //    page could optionally surface a "redirected from Curaçao because
  //    Curaçao residents carry Dutch passports" note. The 301 is permanent
  //    so Google consolidates the SEO weight onto the parent URL.
  const passportMatch = pathname.match(/^\/passport\/([a-z]{2})\/?$/i);
  if (passportMatch) {
    const iso = passportMatch[1].toUpperCase();
    const parent = PARENT_PASSPORT[iso];
    if (parent) {
      const url = req.nextUrl.clone();
      url.pathname = `/passport/${parent.toLowerCase()}`;
      url.searchParams.set("from", iso.toLowerCase());
      return NextResponse.redirect(url, 301);
    }
  }

  // 2b. /[iso]/[dest] and /[iso]/[dest]/[purpose] redirect for
  //     non-issuing territories. Same problem as #2 but on the pair
  //     pages. Pattern: extract the first path segment; if it's a
  //     2-letter iso AND in PARENT_PASSPORT, swap it for the parent
  //     iso and 301. The rest of the path (destination + optional
  //     purpose + querystring) is preserved as-is. Without this,
  //     URLs like /sh/tr/transit, /cw/us/work, /re/de/study
  //     (Google has ~256 of these indexed) fell through to the
  //     pair-page handler which 404'd on the non-issuing iso.
  const pairMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/i);
  if (pairMatch) {
    const iso = pairMatch[1].toUpperCase();
    const parent = PARENT_PASSPORT[iso];
    if (parent) {
      const url = req.nextUrl.clone();
      url.pathname = `/${parent.toLowerCase()}${pairMatch[2] ?? ""}`;
      url.searchParams.set("from", iso.toLowerCase());
      return NextResponse.redirect(url, 301);
    }
  }

  // 3. /admin/* gate.
  if (pathname.startsWith("/admin")) {
    const token = process.env.ADMIN_TOKEN;
    if (!token) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const queryKey = req.nextUrl.searchParams.get("key");
    const cookieKey = req.cookies.get("admin_token")?.value;

    if (queryKey === token) {
      const res = NextResponse.next();
      res.cookies.set("admin_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/admin",
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return res;
    }

    if (cookieKey === token) {
      return NextResponse.next();
    }

    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}
