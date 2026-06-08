import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { userDb, schema } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { isValidPurpose } from "@/lib/types";

// Per-visitor watchlist state for the "Watch this route" button.
//
// WHY THIS EXISTS: the /[passport]/[destination] pages number ~235k and must
// stay ISR-cached (one cheap saved copy per URL, reused for an hour). Reading
// the login cookie *inside* those pages forces Next to rebuild every page on
// every request — which is exactly what caused the 39× function-CPU spike when
// a crawler walked the sitemap. So the cookie read lives here instead: this
// tiny endpoint is only ever called by a real browser after the page hydrates
// (crawlers don't run JS), so the expensive pages stay static and only genuine
// interactive visitors trigger this lightweight per-user lookup.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const p = String(sp.get("p") ?? "").toUpperCase();
  const d = String(sp.get("d") ?? "").toUpperCase();
  const rawPurpose = String(sp.get("purpose") ?? "tourism");

  if (!p || !d || !isValidPurpose(rawPurpose)) {
    return NextResponse.json({ signedIn: false, watching: false }, { status: 400 });
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ signedIn: false, watching: false });
    }
    const rows = await userDb
      .select({ id: schema.watchlistSubscriptions.id })
      .from(schema.watchlistSubscriptions)
      .where(
        and(
          eq(schema.watchlistSubscriptions.userId, user.id),
          eq(schema.watchlistSubscriptions.passportIso2, p),
          eq(schema.watchlistSubscriptions.destinationIso2, d),
          eq(schema.watchlistSubscriptions.purpose, rawPurpose),
        ),
      )
      .limit(1);
    return NextResponse.json({ signedIn: true, watching: rows.length > 0 });
  } catch {
    // DB unavailable / cookie unparseable — degrade to anonymous.
    return NextResponse.json({ signedIn: false, watching: false });
  }
}
