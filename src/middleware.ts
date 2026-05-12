/**
 * Middleware handles two unrelated concerns:
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
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  // /admin/* AND any path that might be a WordPress legacy URL.
  matcher: [
    "/admin/:path*",
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

  // 2. /admin/* gate.
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
