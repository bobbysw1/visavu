/**
 * Admin chat-review dashboard.
 *
 * Pulls the most-recent chat_conversations + their messages from
 * userDb so we can spot bad replies, abusive patterns, and prompt
 * tuning opportunities. Gated by the admin-token middleware (same
 * mechanism as /admin/sources, /admin/review-queue etc).
 *
 * Filters supported via query string:
 *   ?window=24h|7d|30d         — time window (default 24h)
 *   ?type=all|refusals|tokens  — show all, refusals only, or
 *                                conversations sorted by token spend
 *   ?ip=<prefix>               — filter by ip-hash prefix (first 8
 *                                chars, useful for tracking a single
 *                                actor across conversations)
 *
 * Not paginated yet — capped at 100 most-recent conversations so the
 * page stays fast. If we ever need more than that, add pagination
 * + a date-range picker.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, gte, like, sql } from "drizzle-orm";
import { userDb, schema } from "@/db/client";

export const metadata: Metadata = {
  title: "Admin · Chat review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Window = "24h" | "7d" | "30d";
type View = "all" | "refusals" | "tokens";

function windowSince(w: Window): Date {
  const now = Date.now();
  switch (w) {
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

type ConversationRow = {
  id: number;
  sessionId: string;
  ipHash: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  totalTokens: number;
};

type MessageRow = {
  id: number;
  conversationId: number;
  role: "system" | "user" | "assistant";
  content: string;
  tokens: number;
  model: string | null;
  isRefusal: boolean;
  createdAt: Date;
};

async function loadData({
  window: w,
  view,
  ipPrefix,
}: {
  window: Window;
  view: View;
  ipPrefix: string | null;
}): Promise<{
  conversations: ConversationRow[];
  messagesByConv: Map<number, MessageRow[]>;
  totals: {
    conversations: number;
    messages: number;
    totalTokens: number;
    refusals: number;
  };
}> {
  const since = windowSince(w);
  const conditions = [gte(schema.chatConversations.lastMessageAt, since)];
  if (ipPrefix) {
    conditions.push(like(schema.chatConversations.ipHash, `${ipPrefix}%`));
  }

  const baseOrder =
    view === "tokens"
      ? desc(schema.chatConversations.totalTokens)
      : desc(schema.chatConversations.lastMessageAt);

  const convs = (await userDb
    .select({
      id: schema.chatConversations.id,
      sessionId: schema.chatConversations.sessionId,
      ipHash: schema.chatConversations.ipHash,
      startedAt: schema.chatConversations.startedAt,
      lastMessageAt: schema.chatConversations.lastMessageAt,
      messageCount: schema.chatConversations.messageCount,
      totalTokens: schema.chatConversations.totalTokens,
    })
    .from(schema.chatConversations)
    .where(and(...conditions))
    .orderBy(baseOrder)
    .limit(100)) as ConversationRow[];

  // For "refusals" view we want conversations that contained at
  // least one refusal — join via messages.is_refusal.
  let visibleConvs = convs;
  if (view === "refusals" && convs.length > 0) {
    const ids = convs.map((c) => c.id);
    const refusalConvs = await userDb
      .selectDistinct({ conversationId: schema.chatMessages.conversationId })
      .from(schema.chatMessages)
      .where(
        and(
          eq(schema.chatMessages.isRefusal, true),
          sql`${schema.chatMessages.conversationId} = ANY(${ids})`,
        ),
      );
    const refusalIds = new Set(refusalConvs.map((r) => r.conversationId));
    visibleConvs = convs.filter((c) => refusalIds.has(c.id));
  }

  // Load every message for the visible conversations in one query.
  const messagesByConv = new Map<number, MessageRow[]>();
  if (visibleConvs.length > 0) {
    const ids = visibleConvs.map((c) => c.id);
    const msgs = (await userDb
      .select()
      .from(schema.chatMessages)
      .where(sql`${schema.chatMessages.conversationId} = ANY(${ids})`)
      .orderBy(schema.chatMessages.createdAt)) as MessageRow[];
    for (const m of msgs) {
      const arr = messagesByConv.get(m.conversationId) ?? [];
      arr.push(m);
      messagesByConv.set(m.conversationId, arr);
    }
  }

  // Aggregate totals across the WHOLE window (not just visible
  // conversations), so the totals row reflects real volume even
  // when filtered to refusals.
  const totalsRow = await userDb
    .select({
      conversations: sql<number>`count(distinct ${schema.chatConversations.id})::int`,
      messages: sql<number>`coalesce(sum(${schema.chatConversations.messageCount}), 0)::int`,
      totalTokens: sql<number>`coalesce(sum(${schema.chatConversations.totalTokens}), 0)::int`,
    })
    .from(schema.chatConversations)
    .where(and(...conditions));
  const refusalsCount = await userDb
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.chatMessages)
    .innerJoin(
      schema.chatConversations,
      eq(schema.chatMessages.conversationId, schema.chatConversations.id),
    )
    .where(
      and(
        eq(schema.chatMessages.isRefusal, true),
        gte(schema.chatConversations.lastMessageAt, since),
        ...(ipPrefix
          ? [like(schema.chatConversations.ipHash, `${ipPrefix}%`)]
          : []),
      ),
    );

  return {
    conversations: visibleConvs,
    messagesByConv,
    totals: {
      conversations: totalsRow[0]?.conversations ?? 0,
      messages: totalsRow[0]?.messages ?? 0,
      totalTokens: totalsRow[0]?.totalTokens ?? 0,
      refusals: refusalsCount[0]?.count ?? 0,
    },
  };
}

/* Rough Mistral Large cost estimate at $4/M tokens for input + $12/M
 * tokens for output (May 2026 pricing). We can't separate input/output
 * precisely from our denormalised total — assume 70/30 split which
 * matches typical chat traffic.
 */
function estimateDailyCostUsd(tokens: number): number {
  const inputTokens = tokens * 0.7;
  const outputTokens = tokens * 0.3;
  return (inputTokens * 4 + outputTokens * 12) / 1_000_000;
}

export default async function AdminChatReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; type?: string; ip?: string }>;
}) {
  const sp = await searchParams;
  const window: Window =
    sp.window === "7d" || sp.window === "30d" ? sp.window : "24h";
  const view: View =
    sp.type === "refusals" || sp.type === "tokens" ? sp.type : "all";
  const ipPrefix = sp.ip?.trim() || null;

  let data: Awaited<ReturnType<typeof loadData>> | null = null;
  let error: string | null = null;
  try {
    data = await loadData({ window, view, ipPrefix });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold">Chat review</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Spot bad replies + tune the system prompt. Conversation log
            populated by every /api/chat call.
          </p>
        </div>
        <Link
          href="/admin/sources"
          className="text-sm text-blue-700 dark:text-blue-300 underline hover:no-underline"
        >
          ← Admin index
        </Link>
      </header>

      {/* Filter pills + totals */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">Window:</span>
          {(["24h", "7d", "30d"] as Window[]).map((w) => (
            <FilterChip
              key={w}
              href={buildHref({ window: w, type: view, ip: ipPrefix })}
              active={window === w}
            >
              {w === "24h" ? "Last 24h" : w === "7d" ? "Last 7 days" : "Last 30 days"}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">View:</span>
          {(["all", "refusals", "tokens"] as View[]).map((v) => (
            <FilterChip
              key={v}
              href={buildHref({ window, type: v, ip: ipPrefix })}
              active={view === v}
            >
              {v === "all"
                ? "All conversations"
                : v === "refusals"
                ? "Refusals only"
                : "Top token spenders"}
            </FilterChip>
          ))}
        </div>
        {ipPrefix && (
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold">IP filter:</span>
            <code className="font-mono text-xs bg-neutral-200/60 dark:bg-neutral-800/60 px-2 py-0.5 rounded">
              {ipPrefix}…
            </code>
            <Link
              href={buildHref({ window, type: view, ip: null })}
              className="text-xs underline hover:no-underline text-blue-700 dark:text-blue-300"
            >
              clear
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-sm">
          <strong>DB error:</strong> {error}
        </div>
      )}

      {data && (
        <>
          {/* Totals strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat label="Conversations" value={data.totals.conversations.toLocaleString()} />
            <Stat label="Messages" value={data.totals.messages.toLocaleString()} />
            <Stat
              label="Total tokens"
              value={data.totals.totalTokens.toLocaleString()}
              hint={`≈ $${estimateDailyCostUsd(data.totals.totalTokens).toFixed(2)} Mistral`}
            />
            <Stat
              label="Refusals"
              value={`${data.totals.refusals.toLocaleString()}${
                data.totals.messages > 0
                  ? ` (${((data.totals.refusals / data.totals.messages) * 100).toFixed(1)}%)`
                  : ""
              }`}
            />
          </div>

          {/* Conversations list */}
          <ul className="space-y-4">
            {data.conversations.length === 0 ? (
              <li className="text-sm text-neutral-500 italic">
                No conversations match these filters.
              </li>
            ) : (
              data.conversations.map((c) => {
                const msgs = data.messagesByConv.get(c.id) ?? [];
                const hasRefusal = msgs.some((m) => m.isRefusal);
                return (
                  <li
                    key={c.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden"
                  >
                    <header className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
                      <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-200">
                        #{c.id}
                      </span>
                      <span title={c.startedAt.toISOString()}>
                        {relative(c.lastMessageAt)} · {c.messageCount} msgs · {c.totalTokens.toLocaleString()} tok
                      </span>
                      <Link
                        href={buildHref({ window, type: view, ip: c.ipHash.slice(0, 8) })}
                        className="font-mono text-[10px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline-offset-2 hover:underline"
                        title={`Filter to all conversations from this IP (hash prefix ${c.ipHash.slice(0, 8)})`}
                      >
                        ip:{c.ipHash.slice(0, 8)}
                      </Link>
                      {hasRefusal && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 text-[10px] font-semibold uppercase tracking-wider">
                          refusal
                        </span>
                      )}
                    </header>
                    <details className="group">
                      <summary className="cursor-pointer px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 list-none">
                        <span className="group-open:hidden">▸ Show {msgs.length} messages</span>
                        <span className="hidden group-open:inline">▾ Collapse</span>
                      </summary>
                      <ol className="divide-y divide-neutral-100 dark:divide-neutral-900">
                        {msgs.map((m) => (
                          <li
                            key={m.id}
                            className={`px-4 py-3 ${
                              m.role === "user"
                                ? ""
                                : m.isRefusal
                                ? "bg-amber-50/40 dark:bg-amber-950/20"
                                : "bg-neutral-50/40 dark:bg-neutral-900/30"
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-2 mb-1 text-[10px] uppercase tracking-wider text-neutral-500">
                              <span>
                                {m.role}
                                {m.model && ` · ${m.model}`}
                              </span>
                              <span>{m.tokens.toLocaleString()} tok</span>
                            </div>
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                              {m.content}
                            </pre>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </main>
  );
}

/** Build a /admin/chat-review URL preserving filter state — used by
 *  the filter chips + the per-conversation "filter to this IP" link.
 *  Returns a relative href (Next Link doesn't need absolute). */
function buildHref({
  window,
  type,
  ip,
}: {
  window: Window;
  type: View;
  ip: string | null;
}): string {
  const params = new URLSearchParams();
  if (window !== "24h") params.set("window", window);
  if (type !== "all") params.set("type", type);
  if (ip) params.set("ip", ip);
  const qs = params.toString();
  return `/admin/chat-review${qs ? `?${qs}` : ""}`;
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
        active
          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
          : "bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </Link>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
      <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      {hint && (
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}

function relative(d: Date): string {
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}
