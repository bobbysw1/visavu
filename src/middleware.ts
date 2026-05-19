/**
 * Middleware handles three unrelated concerns:
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

export const config = {
  matcher: [
    "/admin/:path*",
    // Non-issuing-territory passport URLs — redirected to parent country.
    // The matcher is intentionally broad (any /passport/[iso]); the
    // PARENT_PASSPORT lookup filters down to just the iso2s that need
    // redirecting. Static pages for actually-issuing countries pass
    // through to the Next.js route handler as before.
    "/passport/:iso",
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
