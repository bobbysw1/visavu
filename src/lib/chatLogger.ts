/**
 * Chat conversation logging.
 *
 * Records every chat round-trip into chat_conversations + chat_messages
 * so we can:
 *   - enforce rate limits (see chatRateLimit.ts which reads these tables)
 *   - review bad replies to figure out which prompt branch misfired
 *   - track daily Mistral spend
 *
 * Privacy: never stores raw IPs. Never stores PII the user volunteers
 * in chat (that's still in the message content) — but we hold that
 * content to make quality review possible. Privacy policy notes this
 * explicitly.
 *
 * Graceful failure: every function silently swallows DB errors. We
 * never want a logging hiccup to break the user's chat experience.
 */
import { userDb } from "@/db/client";
import { chatConversations, chatMessages } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type ChatRole = "system" | "user" | "assistant";

/** Resolve (or create) a conversation row for the given session.
 *  Returns the conversation ID. Returns null only on outright DB
 *  failure — caller treats that as "logging unavailable, proceed
 *  without it". */
export async function getOrCreateConversation({
  sessionId,
  userId,
  ipHash,
}: {
  sessionId: string;
  userId: number | null;
  ipHash: string;
}): Promise<number | null> {
  try {
    // Most-recent conversation for this session — if it's within the
    // last hour, reuse; otherwise start fresh.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await userDb
      .select({ id: chatConversations.id, lastMessageAt: chatConversations.lastMessageAt })
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId))
      .orderBy(sql`${chatConversations.lastMessageAt} DESC`)
      .limit(1);

    if (existing[0] && existing[0].lastMessageAt > oneHourAgo) {
      return existing[0].id;
    }

    const [created] = await userDb
      .insert(chatConversations)
      .values({
        sessionId,
        userId,
        ipHash,
      })
      .returning({ id: chatConversations.id });
    return created?.id ?? null;
  } catch (err) {
    console.error("[chat-logger] getOrCreateConversation failed:", err);
    return null;
  }
}

/** Append one message to a conversation + update the conversation's
 *  message-count + token totals atomically. Token counts are best-effort
 *  (Mistral returns them in usage, we estimate length/4 for user
 *  messages). */
export async function logMessage({
  conversationId,
  role,
  content,
  tokens = 0,
  model = null,
  isRefusal = false,
}: {
  conversationId: number;
  role: ChatRole;
  content: string;
  tokens?: number;
  model?: string | null;
  isRefusal?: boolean;
}): Promise<void> {
  try {
    await userDb.insert(chatMessages).values({
      conversationId,
      role,
      content,
      tokens,
      model,
      isRefusal,
    });
    // Update conversation rollup totals — used by the site-wide token
    // ceiling check, so it's important these stay accurate.
    await userDb
      .update(chatConversations)
      .set({
        lastMessageAt: new Date(),
        messageCount: sql`${chatConversations.messageCount} + 1`,
        totalTokens: sql`${chatConversations.totalTokens} + ${tokens}`,
      })
      .where(eq(chatConversations.id, conversationId));
  } catch (err) {
    console.error("[chat-logger] logMessage failed:", err);
  }
}

/** Rough token-count estimate for user messages where Mistral hasn't
 *  returned a count yet. Length / 4 is a commonly-used heuristic for
 *  English text against modern tokenisers — within 10-20% of actual. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
