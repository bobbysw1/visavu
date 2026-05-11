/**
 * Change-alert email opt-in. Single-field form. No accounts.
 *
 * Promise to the user: ONE email when the policy for their (passport,
 * destination) cell changes. Plus a confirmation email on signup. Nothing
 * else, ever. The unsubscribe URL is signed with the same token.
 *
 * The actual change-detection wires to source_records hash diffs (separate
 * job; not implemented here). This endpoint only collects opt-ins.
 */
import { NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";

export const runtime = "nodejs";

function signToken(payload: { id: number; email: string }): string {
  const secret = process.env.ALERT_TOKEN_SECRET ?? "dev-only-not-secret";
  const data = `${payload.id}:${payload.email}`;
  return crypto.createHmac("sha256", secret).update(data).digest("base64url").slice(0, 24);
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

export async function POST(req: Request) {
  let payload: { email?: string; passport?: string; destination?: string; purpose?: string };
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = {
        email: String(form.get("email") ?? ""),
        passport: String(form.get("passport") ?? ""),
        destination: String(form.get("destination") ?? ""),
        purpose: String(form.get("purpose") ?? "") || undefined,
      };
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const passport = String(payload.passport ?? "").trim().toUpperCase();
  const destination = String(payload.destination ?? "").trim().toUpperCase();
  const purpose = payload.purpose ? String(payload.purpose).trim() : null;

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }
  if (passport.length !== 2 || destination.length !== 2) {
    return NextResponse.json({ ok: false, error: "Invalid passport or destination code" }, { status: 400 });
  }

  // Idempotent — if a confirmed subscription for this combo exists, return ok.
  const existing = await db
    .select({ id: schema.userAlertSubscriptions.id, confirmedAt: schema.userAlertSubscriptions.confirmedAt })
    .from(schema.userAlertSubscriptions)
    .where(
      and(
        eq(schema.userAlertSubscriptions.email, email),
        eq(schema.userAlertSubscriptions.passportIso2, passport),
        eq(schema.userAlertSubscriptions.destinationIso2, destination),
      ),
    )
    .limit(1);

  let id: number;
  let token: string;
  if (existing.length > 0) {
    id = existing[0].id;
    token = signToken({ id, email });
    if (existing[0].confirmedAt) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    // Pending — refresh token.
    await db
      .update(schema.userAlertSubscriptions)
      .set({ confirmationToken: token })
      .where(eq(schema.userAlertSubscriptions.id, id));
  } else {
    const inserted = await db
      .insert(schema.userAlertSubscriptions)
      .values({
        email,
        passportIso2: passport,
        destinationIso2: destination,
        purpose,
        confirmationToken: "pending",
      })
      .returning({ id: schema.userAlertSubscriptions.id });
    id = inserted[0].id;
    token = signToken({ id, email });
    await db
      .update(schema.userAlertSubscriptions)
      .set({ confirmationToken: token })
      .where(eq(schema.userAlertSubscriptions.id, id));
  }

  // TODO: send confirmation email via Resend / Postmark when RESEND_API_KEY is set.
  // For now, we return the confirm URL in the response so the dev flow works.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const confirmUrl = `${baseUrl}/api/subscribe/confirm?id=${id}&token=${token}`;

  return NextResponse.json({
    ok: true,
    pendingConfirmation: true,
    devConfirmUrl: process.env.RESEND_API_KEY ? null : confirmUrl,
  });
}
