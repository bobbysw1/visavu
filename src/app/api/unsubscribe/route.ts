import { NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const token = url.searchParams.get("token");
  if (!id || !token) return NextResponse.json({ ok: false, error: "Missing id or token" }, { status: 400 });

  const rows = await db
    .select({
      id: schema.userAlertSubscriptions.id,
      confirmationToken: schema.userAlertSubscriptions.confirmationToken,
    })
    .from(schema.userAlertSubscriptions)
    .where(eq(schema.userAlertSubscriptions.id, id))
    .limit(1);

  if (rows.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (rows[0].confirmationToken !== token) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 403 });
  }

  await db
    .update(schema.userAlertSubscriptions)
    .set({ unsubscribedAt: new Date() })
    .where(eq(schema.userAlertSubscriptions.id, id));

  return NextResponse.redirect(new URL("/?unsubscribed=1", req.url));
}
