/**
 * Chat rate-limit + cost-cap.
 *
 * Three layers of throttling, each enforced BEFORE any Mistral API call
 * so a determined attacker can't burn through our budget by spamming
 * requests:
 *
 *   1. Per-IP burst (default 5/min) — stops scripted clients hammering
 *      the endpoint as fast as they can.
 *   2. Per-IP daily quota (default 20/day anonymous, 50/day signed-in)
 *      — stops one user consuming a disproportionate share of the
 *      daily budget. Limits are higher for signed-in users because we
 *      can hold them accountable if they abuse and they're more likely
 *      to be a real visa-applicant rather than an automated probe.
 *   3. Site-wide token ceiling (default 2,000,000 tokens / day across
 *      all users) — circuit-breaker. Mistral large input + output is
 *      roughly $4-5 per million tokens, so 2M tokens caps daily spend
 *      around $8-10 even if every request is at the maximum length.
 *      When the ceiling trips, anonymous users get a "service busy"
 *      message; signed-in users keep going (so a real user mid-task
 *      isn't booted) until a higher hard cap (default 4M tokens).
 *
 * All limits are env-tunable so you can dial them up if you decide to
 * sponsor the cost or hold them back if Mistral pricing changes.
 *
 * IPs are NEVER stored raw — only HMAC-SHA256(env-salt, ip). Salt is
 * `CHAT_IP_HASH_SALT` env var; if unset, falls back to a fixed
 * development salt so local dev still works (with the obvious caveat
 * that this hash is then trivially reversible).
 */
import { createHmac } from "node:crypto";
import { userDb } from "@/db/client";
import { chatConversations, chatMessages } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

// ── Tunables (env-overridable). All times in seconds. ─────────────
const ANON_DAILY_LIMIT = parseEnvInt("CHAT_ANON_DAILY_LIMIT", 20);
const SIGNED_IN_DAILY_LIMIT = parseEnvInt("CHAT_SIGNED_IN_DAILY_LIMIT", 50);
const BURST_PER_MINUTE = parseEnvInt("CHAT_BURST_PER_MINUTE", 5);
const SITE_DAILY_TOKEN_SOFT_CEILING = parseEnvInt("CHAT_DAILY_TOKEN_SOFT_CEILING", 2_000_000);
const SITE_DAILY_TOKEN_HARD_CEILING = parseEnvInt("CHAT_DAILY_TOKEN_HARD_CEILING", 4_000_000);
const DAY_SECONDS = 86_400;
const MINUTE_SECONDS = 60;

function parseEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** HMAC the IP with a server-only salt so we can rate-limit without
 *  storing reversible PII. */
export function hashIp(ip: string): string {
  const salt = process.env.CHAT_IP_HASH_SALT ?? "visavu-dev-fixed-salt-rotate-in-prod";
  return createHmac("sha256", salt).update(ip).digest("hex");
}

/** Best-effort IP extraction from the incoming request. Vercel sets
 *  x-forwarded-for; we trust the leftmost entry (the original client
 *  per the standard) and strip any port. Falls back to a constant
 *  string so anonymous-quota still works on local dev. */
export function extractIp(req: { headers: Headers }): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.replace(/:\d+$/, "");
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.replace(/:\d+$/, "");
  return "0.0.0.0";
}

export type RateLimitDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: "burst" | "daily_quota" | "site_token_ceiling";
      message: string;
      retryAfterSeconds: number;
    };

/**
 * Check whether a new message from this (ipHash, userId) should be
 * allowed through. Runs three queries in sequence; short-circuits on
 * the first failure. Failures bubble up as "allowed: true" because we
 * never want a DB hiccup to block legitimate chat (better to spend a
 * Mistral call than lose a user).
 */
export async function checkRateLimit({
  ipHash,
  isSignedIn,
}: {
  ipHash: string;
  isSignedIn: boolean;
}): Promise<RateLimitDecision> {
  try {
    // ── Burst check (last 60 seconds, this IP only). ──────────────
    const burstSince = new Date(Date.now() - MINUTE_SECONDS * 1000);
    const burstRows = await userDb
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessages)
      .innerJoin(chatConversations, eq(chatMessages.conversationId, chatConversations.id))
      .where(
        and(
          eq(chatConversations.ipHash, ipHash),
          eq(chatMessages.role, "user"),
          gte(chatMessages.createdAt, burstSince),
        ),
      );
    const burstCount = burstRows[0]?.count ?? 0;
    if (burstCount >= BURST_PER_MINUTE) {
      return {
        allowed: false,
        reason: "burst",
        message: `Too many messages too quickly. Please wait a moment — chat is rate-limited to ${BURST_PER_MINUTE} messages per minute to keep costs sustainable.`,
        retryAfterSeconds: 30,
      };
    }

    // ── Daily-per-IP check (last 24h, this IP only). ──────────────
    const daySince = new Date(Date.now() - DAY_SECONDS * 1000);
    const dailyRows = await userDb
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessages)
      .innerJoin(chatConversations, eq(chatMessages.conversationId, chatConversations.id))
      .where(
        and(
          eq(chatConversations.ipHash, ipHash),
          eq(chatMessages.role, "user"),
          gte(chatMessages.createdAt, daySince),
        ),
      );
    const dailyCount = dailyRows[0]?.count ?? 0;
    const dailyCap = isSignedIn ? SIGNED_IN_DAILY_LIMIT : ANON_DAILY_LIMIT;
    if (dailyCount >= dailyCap) {
      return {
        allowed: false,
        reason: "daily_quota",
        message: isSignedIn
          ? `You've hit today's chat limit of ${SIGNED_IN_DAILY_LIMIT} messages. Try again tomorrow, or — if your case is genuinely complex — consider booking a paid consultation for a longer conversation with a registered adviser.`
          : `You've hit the anonymous daily chat limit of ${ANON_DAILY_LIMIT} messages from this connection. Sign in for a higher limit (${SIGNED_IN_DAILY_LIMIT}/day), or try again tomorrow.`,
        retryAfterSeconds: DAY_SECONDS,
      };
    }

    // ── Site-wide token ceiling (last 24h, ALL users). ────────────
    // Cheap query — sums total_tokens on conversations whose
    // last_message_at fell in the last 24h. Approximate (token sums
    // are denormalised onto the conversation row, updated after each
    // assistant reply) but plenty accurate for circuit-breaker use.
    const tokenRows = await userDb
      .select({ totalTokens: sql<number>`coalesce(sum(total_tokens), 0)::int` })
      .from(chatConversations)
      .where(gte(chatConversations.lastMessageAt, daySince));
    const dailyTokens = tokenRows[0]?.totalTokens ?? 0;

    if (dailyTokens >= SITE_DAILY_TOKEN_HARD_CEILING) {
      // Even signed-in users get cut off at the hard ceiling — at
      // this point we're losing real money.
      return {
        allowed: false,
        reason: "site_token_ceiling",
        message:
          "Visavu's chat has hit today's site-wide usage cap and is temporarily unavailable. This is a cost-control measure (the AI assistant is free for users; we cap spend so it stays that way). Try the visa lookup or forms library while you wait, or come back tomorrow.",
        retryAfterSeconds: DAY_SECONDS,
      };
    }

    if (dailyTokens >= SITE_DAILY_TOKEN_SOFT_CEILING && !isSignedIn) {
      // Soft ceiling: cut off anonymous users so signed-in users (who
      // are more likely to be mid-task) can keep going.
      return {
        allowed: false,
        reason: "site_token_ceiling",
        message:
          "Visavu's chat is at high demand today and anonymous access is temporarily paused. Sign in for continued access, or try again tomorrow.",
        retryAfterSeconds: 3600,
      };
    }

    return { allowed: true };
  } catch (err) {
    // DB errors don't gate the user — better to spend a Mistral call
    // than to falsely block. Log so we notice + can fix.
    console.error("[chat-rate-limit] DB check failed:", err);
    return { allowed: true };
  }
}
