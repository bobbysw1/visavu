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
import { PARENT_PASSPORT, COUNTRY_CODE_ALIASES } from "@/lib/countries";

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

export const config = {
  matcher: [
    "/admin/:path*",
    // Non-issuing-territory passport URLs — redirected to parent country.
    // The matcher is intentionally broad (any /passport/[iso]); the
    // PARENT_PASSPORT lookup filters down to just the iso2s that need
    // redirecting. Static pages for actually-issuing countries pass
    // through to the Next.js route handler as before. Broadened to
    // 2-or-3 chars so we also catch alias paths like /passport/uk
    // (→ gb), /passport/usa (→ us), /passport/uae (→ ae), and
    // alpha-3 codes (deu, fra, jpn) that need redirecting to alpha-2.
    "/passport/:iso((?:[a-zA-Z]{2,3}))",
    // Pair pages: catch ALL /:iso/... requests where iso is 2 OR 3
    // chars (iso2 + alpha-3 aliases like /usa/au, /uk/jp, /uae/de).
    // Handler routes: parent-passport iso → redirect to parent;
    // alias iso → redirect to canonical iso2; canonical iso2 → fall
    // through to the page handler unchanged.
    "/:iso((?:[a-zA-Z]{2,3}))/:rest*",
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

  // 2. /passport/[iso] redirect — three cases handled in priority:
  //    (a) Alpha-3 or informal alias (uk, usa, uae, deu, fra, jpn…)
  //        → 301 to the canonical alpha-2 form. People type "uk" far
  //        more than "gb" — before this redirect /passport/uk 404'd.
  //    (b) Non-issuing territory (Curaçao → NL, Bermuda → GB, etc.)
  //        → 301 to the parent passport with ?from=<iso> hint.
  //    (c) Canonical alpha-2 → fall through to the page handler.
  const passportMatch = pathname.match(/^\/passport\/([a-z]{2,3})\/?$/i);
  if (passportMatch) {
    const raw = passportMatch[1].toUpperCase();
    // (a) Alias lookup — covers all alpha-3 codes + uk/usa/uae/eng
    const aliased = COUNTRY_CODE_ALIASES[raw];
    if (aliased) {
      const url = req.nextUrl.clone();
      url.pathname = `/passport/${aliased.toLowerCase()}`;
      return NextResponse.redirect(url, 301);
    }
    // (b) Non-issuing territory → parent
    const parent = PARENT_PASSPORT[raw];
    if (parent) {
      const url = req.nextUrl.clone();
      url.pathname = `/passport/${parent.toLowerCase()}`;
      url.searchParams.set("from", raw.toLowerCase());
      return NextResponse.redirect(url, 301);
    }
  }

  // 2b. /[iso]/[dest] and /[iso]/[dest]/[purpose] redirects.
  //     Three cases same as #2:
  //     (a) Alias (uk/usa/uae/alpha-3) → 301 to canonical iso2 form
  //         e.g. /uk/au → /gb/au, /usa/jp/work → /us/jp/work
  //     (b) Non-issuing territory iso → 301 to parent
  //         e.g. /sh/tr/transit → /gb/tr/transit?from=sh
  //     (c) Canonical iso2 → fall through unchanged
  //     IMPORTANT: the destination iso (second segment) stays raw —
  //     it's a destination not a passport, so PARENT_PASSPORT
  //     redirection isn't applicable. (Aliases on dest are a future
  //     polish; rarely typed.)
  const pairMatch = pathname.match(/^\/([a-z]{2,3})(\/.*)?$/i);
  if (pairMatch) {
    const raw = pairMatch[1].toUpperCase();
    const rest = pairMatch[2] ?? "";
    // (a) Alias → canonical iso2
    const aliased = COUNTRY_CODE_ALIASES[raw];
    if (aliased) {
      const url = req.nextUrl.clone();
      url.pathname = `/${aliased.toLowerCase()}${rest}`;
      return NextResponse.redirect(url, 301);
    }
    // (b) Non-issuing territory → parent
    const parent = PARENT_PASSPORT[raw];
    if (parent) {
      const url = req.nextUrl.clone();
      url.pathname = `/${parent.toLowerCase()}${rest}`;
      url.searchParams.set("from", raw.toLowerCase());
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
