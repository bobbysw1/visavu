/**
 * Admin gate. /admin/* routes require ADMIN_TOKEN to be present and to
 * match the env-configured value (URL ?key= or admin_token cookie).
 *
 * If ADMIN_TOKEN is unset, admin routes 404 — this is the "no admin"
 * configuration. The robots.txt already disallows /admin/*, so the pages
 * are not search-indexed regardless.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const queryKey = req.nextUrl.searchParams.get("key");
  const cookieKey = req.cookies.get("admin_token")?.value;

  if (queryKey === token) {
    // Persist as cookie so subsequent /admin/* navigations don't need ?key.
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
