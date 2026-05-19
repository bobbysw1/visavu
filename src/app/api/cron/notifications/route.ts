/**
 * Vercel Cron endpoint — diff-detection + notification engine.
 *
 * Runs nightly after the adapter-refresh cron (P27). Reads recent
 * source_records diffs, joins to watchlist_subscriptions on (passport,
 * destination, purpose), and enqueues notification_events for each
 * matched (user × subscription × change).
 *
 * Email delivery is handled separately — this endpoint only enqueues.
 * A second cron job (or the same nightly run after enqueue) reads
 * unsent notification_events, calls the email provider, and stamps
 * sent_at on success.
 *
 * Auth: Bearer CRON_SECRET, same as /api/cron/refresh.
 */
import type { NextRequest } from "next/server";
// Mixed cron: reads visa_options (visa-data PGlite) AND reads/writes
// watchlistSubscriptions + notificationEvents (user-data Postgres when
// DATABASE_URL is set). Import both clients and route per-query.
import { db, userDb, schema } from "@/db/client";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Purpose } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnqueueSummary = {
  diffsSince: string;
  diffsFound: number;
  matchedSubscriptions: number;
  notificationsEnqueued: number;
  emailsSent: number;
  emailsFailed: number;
};

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look back 25 hours so an off-by-1-hour cron schedule doesn't miss a
  // diff. Each notification carries its own subscription_id so dedup is
  // straightforward — and the unique index on (user_id, sub_id, source)
  // prevents double-sends across overlapping windows.
  const since = new Date(Date.now() - 25 * 60 * 60 * 1000);
  const summary: EnqueueSummary = {
    diffsSince: since.toISOString(),
    diffsFound: 0,
    matchedSubscriptions: 0,
    notificationsEnqueued: 0,
    emailsSent: 0,
    emailsFailed: 0,
  };

  try {
    // 1. Recent visa_option diffs — using lastFetchedAt as the proxy. A
    // proper diff would compare against the previous source_record hash;
    // for the v1 scaffold we treat any record touched in the window as a
    // potential trigger.
    const touched = await db.execute<{ id: number; passport_id: number; destination_iso2: string; purpose: string }>(
      sql`
        SELECT id, passport_id, destination_iso2, purpose
        FROM visa_options
        WHERE last_fetched_at > ${since}
      `,
    );
    const rows = (touched as unknown as { rows?: typeof touched }).rows ?? touched;
    summary.diffsFound = Array.isArray(rows) ? rows.length : 0;

    if (summary.diffsFound === 0) {
      return Response.json(summary);
    }

    // 2. Match each diff to watchlist_subscriptions. Resolve passport_id
    // → issuerIso2 via the passports table since subscriptions key on
    // ISO2.
    for (const row of rows as Array<{
      id: number;
      passport_id: number;
      destination_iso2: string;
      purpose: string;
    }>) {
      const passport = await db
        .select({ iso: schema.passports.issuerIso2 })
        .from(schema.passports)
        .where(eq(schema.passports.id, row.passport_id))
        .limit(1);
      if (passport.length === 0) continue;

      // Subscriptions + notifications live in user-data Postgres (userDb)
      // when DATABASE_URL is set, so writes survive Vercel function recycles.
      const subs = await userDb
        .select({ id: schema.watchlistSubscriptions.id, userId: schema.watchlistSubscriptions.userId })
        .from(schema.watchlistSubscriptions)
        .where(
          and(
            eq(schema.watchlistSubscriptions.passportIso2, passport[0].iso),
            eq(schema.watchlistSubscriptions.destinationIso2, row.destination_iso2),
            eq(schema.watchlistSubscriptions.purpose, row.purpose as Purpose),
          ),
        );
      summary.matchedSubscriptions += subs.length;

      for (const sub of subs) {
        await userDb.insert(schema.notificationEvents).values({
          userId: sub.userId,
          subscriptionId: sub.id,
          kind: "rule_change",
          payload: {
            passportIso2: passport[0].iso,
            destinationIso2: row.destination_iso2,
            purpose: row.purpose,
            visaOptionId: row.id,
            detectedAt: new Date().toISOString(),
          },
        });
        summary.notificationsEnqueued++;
      }
    }

    // 3. Send emails for any still-unsent notifications. Email delivery
    // is best-effort — failures get retried on the next run because
    // sent_at stays NULL.
    if (process.env.RESEND_API_KEY) {
      const unsent = await db
        .select({
          id: schema.notificationEvents.id,
          userId: schema.notificationEvents.userId,
          payload: schema.notificationEvents.payload,
        })
        .from(schema.notificationEvents)
        .where(isNull(schema.notificationEvents.sentAt));
      for (const n of unsent) {
        const userRow = await db
          .select({ email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, n.userId))
          .limit(1);
        if (userRow.length === 0) continue;
        const sent = await sendChangeEmail(userRow[0].email, n.payload as Record<string, unknown>);
        if (sent) {
          await db
            .update(schema.notificationEvents)
            .set({ sentAt: new Date() })
            .where(eq(schema.notificationEvents.id, n.id));
          summary.emailsSent++;
        } else {
          summary.emailsFailed++;
        }
      }
    }
  } catch (err) {
    return Response.json(
      { ...summary, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  return Response.json(summary);
}

async function sendChangeEmail(
  to: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const passport = String(payload.passportIso2 ?? "");
  const destination = String(payload.destinationIso2 ?? "");
  const purpose = String(payload.purpose ?? "tourism");
  const url = `https://visavu.com/${passport.toLowerCase()}/${destination.toLowerCase()}?purpose=${purpose}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Visavu <noreply@visavu.com>",
        to,
        subject: `Visa change detected: ${passport} → ${destination}`,
        text:
          `We've detected a change on the visa rules for ${passport} → ${destination} ` +
          `(${purpose}). See the current data: ${url}\n\n` +
          `Manage your subscriptions: https://visavu.com/account`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
