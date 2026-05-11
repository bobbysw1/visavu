import { NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const token = url.searchParams.get("token");
  if (!id || !token) {
    return NextResponse.json({ ok: false, error: "Missing id or token" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: schema.userAlertSubscriptions.id,
      confirmationToken: schema.userAlertSubscriptions.confirmationToken,
      confirmedAt: schema.userAlertSubscriptions.confirmedAt,
    })
    .from(schema.userAlertSubscriptions)
    .where(eq(schema.userAlertSubscriptions.id, id))
    .limit(1);

  if (rows.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (rows[0].confirmationToken !== token) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 403 });
  }

  if (!rows[0].confirmedAt) {
    await db
      .update(schema.userAlertSubscriptions)
      .set({ confirmedAt: new Date() })
      .where(eq(schema.userAlertSubscriptions.id, id));
  }

  // Send the user back to the home page with a confirmation flag.
  return NextResponse.redirect(new URL("/?subscribed=1", req.url));
}
