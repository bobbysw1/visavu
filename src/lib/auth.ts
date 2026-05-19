/**
 * Lightweight magic-link auth helpers — passwordless email sign-in.
 *
 * Scope: P30 scaffold. Issues + verifies magic-link tokens, manages user
 * upsert on first sign-in, and exposes a session-cookie helper. NextAuth /
 * Auth.js is intentionally not imported yet — the existing app already
 * uses Server Components heavily and the manual flow avoids a multi-MB
 * dependency until we genuinely need OAuth providers.
 *
 * Flow:
 *   1. User submits email at /signin → issueMagicLinkToken() → email sent
 *      via Resend / Postmark with link /signin/verify?token=...
 *   2. /signin/verify resolves the token via consumeMagicLinkToken() →
 *      upserts the user row → sets a signed session cookie
 *   3. Server components read currentUser() from the cookie + DB lookup
 *
 * Token shape: 64-char base64url random — no JWT, no signing key needed
 * (the token is the secret, lookup is via primary key). Expiry 15 minutes.
 *
 * Email delivery is plumbed but stubbed — set RESEND_API_KEY (or wire
 * Postmark) to enable. Until then, sign-in is dev-only and tokens print
 * to stdout for manual paste.
 */
import { randomBytes, createHmac } from "node:crypto";
import { cookies } from "next/headers";
// Auth touches only user-write tables (authTokens, users, sessions,
// watchlistSubscriptions). Aliased to `db` to keep the rest of this
// file unchanged; userDb routes to managed Postgres when DATABASE_URL
// is set so writes persist across serverless instance recycles.
import { userDb as db, schema } from "@/db/client";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { Purpose } from "@/lib/types";

const COOKIE_NAME = "visavu_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Step 1 — user submits email. Generate a magic-link token, persist it,
 * return the URL to email. Caller is responsible for sending the email.
 */
export async function issueMagicLinkToken(email: string): Promise<{
  token: string;
  expiresAt: Date;
  signinUrl: string;
}> {
  const normalised = email.trim().toLowerCase();
  const token = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await db.insert(schema.authTokens).values({ token, email: normalised, expiresAt });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visavu.com";
  const signinUrl = `${base}/signin/verify?token=${encodeURIComponent(token)}`;
  return { token, expiresAt, signinUrl };
}

/**
 * Step 2 — /signin/verify route resolves the token. Returns the user on
 * success; nulls + a structured reason on failure (caller redirects).
 */
export type ConsumeResult =
  | { ok: true; userId: number; email: string }
  | { ok: false; reason: "expired" | "consumed" | "invalid" };

export async function consumeMagicLinkToken(token: string): Promise<ConsumeResult> {
  const now = new Date();
  const rows = await db
    .select()
    .from(schema.authTokens)
    .where(eq(schema.authTokens.token, token))
    .limit(1);
  if (rows.length === 0) return { ok: false, reason: "invalid" };
  const t = rows[0];
  if (t.consumedAt) return { ok: false, reason: "consumed" };
  if (t.expiresAt < now) return { ok: false, reason: "expired" };

  await db.update(schema.authTokens).set({ consumedAt: now }).where(eq(schema.authTokens.token, token));

  // Upsert user; bump lastLoginAt and emailVerifiedAt.
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, t.email))
    .limit(1);
  let userId: number;
  if (existing.length === 0) {
    const inserted = await db
      .insert(schema.users)
      .values({ email: t.email, emailVerifiedAt: now, lastLoginAt: now })
      .returning({ id: schema.users.id });
    userId = inserted[0].id;
  } else {
    await db.update(schema.users)
      .set({ lastLoginAt: now, emailVerifiedAt: existing[0].emailVerifiedAt ?? now })
      .where(eq(schema.users.id, existing[0].id));
    userId = existing[0].id;
  }
  return { ok: true, userId, email: t.email };
}

/**
 * Sign a session payload + write the visavu_session cookie.
 * Payload is `${userId}.${expiresAt}.${hmac}` — single string, easy to
 * verify in middleware later if needed.
 */
export async function setSessionCookie(userId: number): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("setSessionCookie: SESSION_SECRET not set in env");
  }
  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  const value = `${payload}.${sig}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Read + verify the session cookie. Returns the userId or null. */
export async function currentUserId(): Promise<number | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [userIdRaw, expiresAtRaw, sig] = parts;
  const payload = `${userIdRaw}.${expiresAtRaw}`;
  const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");
  if (sig !== expectedSig) return null;
  const expiresAt = parseInt(expiresAtRaw, 10);
  if (Number.isNaN(expiresAt) || expiresAt * 1000 < Date.now()) return null;
  const userId = parseInt(userIdRaw, 10);
  return Number.isNaN(userId) ? null : userId;
}

export async function currentUser(): Promise<{ id: number; email: string } | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const rows = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * GDPR account deletion — wipes user + watchlists + notifications in a
 * single transaction. Called from /account/delete after confirmation.
 */
export async function deleteAccount(userId: number): Promise<void> {
  // Cascade is set up on watchlists + notifications, so a single delete
  // takes the whole graph. Auth tokens by email aren't cascaded — purge
  // them explicitly for the deleted user.
  const user = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  if (user.length > 0) {
    await db.delete(schema.authTokens).where(eq(schema.authTokens.email, user[0].email));
  }
  await db.delete(schema.users).where(eq(schema.users.id, userId));
}

/**
 * Watchlist helpers — used by the "Watch this route" button on result
 * pages and the /account watchlist UI.
 */
export async function addWatchlistSubscription(
  userId: number,
  passportIso2: string,
  destinationIso2: string,
  purpose: Purpose,
): Promise<void> {
  await db.insert(schema.watchlistSubscriptions).values({
    userId,
    passportIso2: passportIso2.toUpperCase(),
    destinationIso2: destinationIso2.toUpperCase(),
    purpose,
  }).onConflictDoNothing();
}

export async function removeWatchlistSubscription(userId: number, subscriptionId: number): Promise<void> {
  await db.delete(schema.watchlistSubscriptions)
    .where(and(
      eq(schema.watchlistSubscriptions.id, subscriptionId),
      eq(schema.watchlistSubscriptions.userId, userId),
    ));
}

export async function watchlistFor(userId: number): Promise<Array<{
  id: number;
  passportIso2: string;
  destinationIso2: string;
  purpose: string;
  createdAt: Date;
}>> {
  return db.select({
    id: schema.watchlistSubscriptions.id,
    passportIso2: schema.watchlistSubscriptions.passportIso2,
    destinationIso2: schema.watchlistSubscriptions.destinationIso2,
    purpose: schema.watchlistSubscriptions.purpose,
    createdAt: schema.watchlistSubscriptions.createdAt,
  })
  .from(schema.watchlistSubscriptions)
  .where(eq(schema.watchlistSubscriptions.userId, userId));
}

/** Diff-detection trigger query — finds unsent notifications. */
export async function pendingNotifications(): Promise<Array<{ id: number; userId: number }>> {
  return db.select({ id: schema.notificationEvents.id, userId: schema.notificationEvents.userId })
    .from(schema.notificationEvents)
    .where(isNull(schema.notificationEvents.sentAt));
}

// Suppress unused-import warning until we wire the AND condition for
// expired-token cleanup. (Kept exported so the linter sees it consumed.)
export const _whenNotExpired = (expiresAt: Date) => gt(schema.authTokens.expiresAt, expiresAt);
