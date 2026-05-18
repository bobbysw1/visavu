/**
 * Consultation intake endpoint.
 *
 * Receives a structured intake form and routes it to the consultation
 * inbox. Email delivery via Resend when RESEND_API_KEY is set; otherwise
 * logs the intake to the server console (visible in Vercel logs) so
 * nothing is lost during the bootstrap phase before email is wired.
 *
 * Why no DB write: PGlite at runtime is loaded from a static snapshot
 * tarball on cold start, and writes don't persist beyond the process
 * lifetime. Email + Vercel logs are durable; the DB isn't. Move to
 * a real Postgres + Stripe + scheduling workflow when volumes justify.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Intake = {
  email?: string;
  name?: string;
  tier?: string;
  passportIso2?: string;
  destinationIso2?: string;
  goal?: string;
  currentStatus?: string;
  education?: string;
  workExperience?: string;
  income?: string;
  family?: string;
  criminalRecord?: string;
  timeline?: string;
  budget?: string;
  notes?: string;
};

export async function POST(request: NextRequest) {
  let body: Intake;
  try {
    body = (await request.json()) as Intake;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();

  // Format the intake as a plain-text email body — easiest to read in
  // an inbox, also doubles as a sensible log line.
  const lines: string[] = [
    `New consultation intake — ${submittedAt}`,
    "",
    `From:      ${body.name || "(no name)"} <${body.email}>`,
    `Tier:      ${body.tier || "(not chosen)"}`,
    "",
    `Passport:  ${body.passportIso2 || "(blank)"}`,
    `Dest:      ${body.destinationIso2 || "(blank)"}`,
    `Goal:      ${body.goal || "(blank)"}`,
    "",
    `Current:   ${body.currentStatus || "(blank)"}`,
    `Education: ${body.education || "(blank)"}`,
    `Work:      ${body.workExperience || "(blank)"}`,
    `Income:    ${body.income || "(blank)"}`,
    `Family:    ${body.family || "(blank)"}`,
    `Criminal:  ${body.criminalRecord || "(blank)"}`,
    `Timeline:  ${body.timeline || "(blank)"}`,
    `Budget:    ${body.budget || "(blank)"}`,
    "",
    "Notes:",
    body.notes || "(none)",
    "",
    "—",
    `Submitted via ${SITE.url}/consultation/book`,
  ];
  const text = lines.join("\n");

  // Always log so the intake is captured even when email isn't set up.
  console.log("[consultation-intake]", text);

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: `Visavu <${SITE.contactEmail}>`,
          to: SITE.contactEmail,
          reply_to: body.email,
          subject: `Consultation intake — ${body.passportIso2 ?? "??"} → ${body.destinationIso2 ?? "??"} (${body.tier ?? "tier?"})`,
          text,
        }),
      });
      if (!res.ok) {
        // Still return 200 to the user — the intake is in the logs.
        const errText = await res.text();
        console.error("[consultation-intake] Resend send failed", res.status, errText);
      }
    } catch (err) {
      console.error("[consultation-intake] Resend exception", err);
    }
  }

  // User-facing confirmation auto-reply (only when Resend is configured).
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: `Visavu <${SITE.contactEmail}>`,
          to: body.email,
          subject: "We received your consultation intake",
          text:
            `Hi${body.name ? " " + body.name : ""},\n\n` +
            `Thanks for reaching out to Visavu. We've received your intake and will be in touch within 24 hours with available slots and a payment link.\n\n` +
            `If you need to add anything in the meantime, just reply to this email.\n\n` +
            `— Visavu\n${SITE.url}`,
        }),
      });
    } catch {
      // ignore auto-reply failures
    }
  }

  return NextResponse.json({ ok: true });
}
