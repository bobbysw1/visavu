"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
  ts?: number;
  /** When the assistant returned a clarifying question, the options
   *  array drives the multiple-choice pill row below the message.
   *  Clicking a pill submits the option text verbatim as the next
   *  user message. Cleared from subsequent messages once the user
   *  has answered (don't re-render stale pills after the turn). */
  clarifyingOptions?: string[];
};

const STORAGE_KEY = "visavu.chat.v1";
/** Conversation/session identifier persisted in localStorage so the
 *  server can stitch follow-up messages onto the same conversation
 *  row for abuse review + token rollup. Not PII — just a UUID. */
const SESSION_KEY = "visavu.chat.session";

/**
 * Visavu chat — client UI talking to /api/chat.
 *
 * Persists conversation to localStorage so refresh doesn't lose it.
 * If ?q= is in the URL on first load, auto-submits that as the opening
 * message (used by the homepage ChatBar widget).
 *
 * Polish: categorised empty-state suggestions, animated typing indicator,
 * inline link autolinking, role avatars, copy-to-clipboard on assistant
 * replies, auto-resizing textarea, accessible labels.
 */

const SUGGESTION_CATEGORIES: Array<{
  label: string;
  emoji: string;
  examples: string[];
}> = [
  {
    label: "Short stays",
    emoji: "🛂",
    examples: [
      "Does my UK passport need an ETA for the US?",
      "How long can I stay in Schengen on the 90/180 rule?",
      "Do I need a visa for Japan as an Indian citizen?",
    ],
  },
  {
    label: "Work routes",
    emoji: "💼",
    examples: [
      "What visa do I need to move to Canada from India?",
      "Can I work remotely in Portugal on a tourist visa?",
      "Is my software-engineer job on Australia's skill list?",
    ],
  },
  {
    label: "Long stays",
    emoji: "🏠",
    examples: [
      "What's the cheapest digital-nomad visa in Europe?",
      "How does Spain's Non-Lucrative Visa work?",
      "Can I retire in Thailand on £1,500 a month?",
    ],
  },
  {
    label: "Family & study",
    emoji: "🎓",
    examples: [
      "What's the UK spouse-visa income requirement?",
      "How do I apply for an F-1 student visa for the US?",
      "Can my partner work on a UK student visa dependant?",
    ],
  },
];

/**
 * Inline formatter — handles **bold**, *italic*, [markdown links](url),
 * and bare URLs.
 *
 * Link rendering differentiates visavu.com URLs (rendered as pill-style
 * inline buttons with a → arrow — they're CTAs into our own pages) from
 * external/government URLs (rendered as subtle underlined links). The
 * visual difference makes our own internal links feel like clickable
 * actions rather than reference cruft, which substantially lifts CTR
 * back into site content from chat answers.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Combined pattern: **bold** | *italic* | [label](url) | bare URL
  const re = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s)\]]+)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const tok = m[0];
    if (tok.startsWith("**") && tok.endsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-semibold text-[var(--color-ink)]">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*") && tok.endsWith("*") && !tok.startsWith("**")) {
      parts.push(<em key={`${keyPrefix}-i${i++}`}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("[")) {
      // [label](url) — markdown link with custom label
      const label = m[2];
      const url = m[3];
      parts.push(renderLink(url, label, `${keyPrefix}-l${i++}`));
    } else {
      // Bare URL
      const url = tok.replace(/[.,;)]+$/, "");
      parts.push(renderLink(url, url, `${keyPrefix}-u${i++}`));
    }
    last = idx + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderLink(url: string, label: string, key: string): React.ReactNode {
  // Internal Visavu CTA — render as pill-button (more clickable).
  // Visible label strips the protocol/domain when the URL was bare; if
  // the model used [text](url) we trust the chosen label.
  const isInternal = /^https?:\/\/(www\.)?visavu\.com/i.test(url);
  if (isInternal) {
    const cleanLabel =
      label === url
        ? url.replace(/^https?:\/\/(www\.)?visavu\.com/i, "visavu.com")
        : label;
    return (
      <Link
        key={key}
        href={url.replace(/^https?:\/\/(www\.)?visavu\.com/i, "")}
        className="inline-flex items-center gap-0.5 align-baseline rounded-md bg-[var(--color-muted)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] border border-[var(--color-rule-strong)] hover:border-[var(--color-ink)] text-[var(--color-ink)] font-medium px-1.5 py-px text-[12.5px] transition mx-0.5"
      >
        {cleanLabel}
        <span aria-hidden className="text-[10px] opacity-70">↗</span>
      </Link>
    );
  }
  // External / government — subtle underlined link.
  const visible = label === url ? url.replace(/^https?:\/\//, "") : label;
  return (
    <a
      key={key}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-ink)] underline decoration-[var(--color-rule-strong)] decoration-1 underline-offset-2 hover:decoration-[var(--color-ink)]"
    >
      {visible}
    </a>
  );
}

/**
 * Markdown-ish renderer for assistant replies.
 *
 * Block types supported:
 *   - ## / ### Headers — rendered with real visual hierarchy
 *     (bigger, bolder, top spacing). "## 1. Foo" / "## N. Foo" patterns
 *     get a circular numbered badge prefix so the multi-option overview
 *     answers look like a structured list rather than a wall of headers.
 *   - - / * / • bullets — accent-coloured ▸ markers (cleaner than the
 *     default browser disc, more on-brand).
 *   - **bold** / *italic* / [label](url) / bare URL via renderInline.
 *   - Paragraphs separated by blank lines.
 *
 * Deliberately NOT supported: tables, code blocks, images. The chat
 * doesn't generate those (system prompt steers away from them).
 */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let buf: string[] = [];
  let bullets: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (buf.length === 0) return;
    const joined = buf.join(" ").trim();
    if (joined) {
      blocks.push(
        <p key={`p${key++}`} className="leading-relaxed text-[var(--color-ink)]/90">
          {renderInline(joined, `p${key}`)}
        </p>,
      );
    }
    buf = [];
  }
  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`u${key++}`} className="my-1 space-y-1.5">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="leading-relaxed text-[var(--color-ink)]/90 pl-5 relative before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-[var(--color-accent)] before:font-bold"
          >
            {renderInline(b, `u${key}-${i}`)}
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) {
      flushParagraph();
      flushBullets();
      continue;
    }
    // Headers — capture level (## vs ###) + content
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flushParagraph();
      flushBullets();
      const level = h[1].length;
      const content = h[2];
      // Numbered header — "## 1. Foo" / "## 2. Bar" — render with badge
      const numbered = content.match(/^(\d+)\.\s+(.+)$/);
      if (numbered && level === 2) {
        blocks.push(
          <div
            key={`h${key++}`}
            className="flex items-baseline gap-2.5 mt-4 first:mt-0 pb-1 border-b border-[var(--color-rule)]"
          >
            <span className="shrink-0 inline-flex items-center justify-center size-5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] text-[10.5px] font-bold tabular-nums leading-none translate-y-px">
              {numbered[1]}
            </span>
            <h3 className="text-[15px] font-semibold text-[var(--color-ink)] tracking-tight">
              {renderInline(numbered[2], `h${key}`)}
            </h3>
          </div>,
        );
        continue;
      }
      // Plain ## header — top-rule + bolder text
      if (level === 2) {
        blocks.push(
          <h3
            key={`h${key++}`}
            className="text-[15px] font-semibold text-[var(--color-ink)] mt-4 first:mt-0 pb-1 border-b border-[var(--color-rule)] tracking-tight"
          >
            {renderInline(content, `h${key}`)}
          </h3>,
        );
        continue;
      }
      // ### header — lighter
      blocks.push(
        <h4
          key={`h${key++}`}
          className="text-[13.5px] font-semibold text-[var(--color-ink)] mt-3 first:mt-0 uppercase tracking-wide"
        >
          {renderInline(content, `h${key}`)}
        </h4>,
      );
      continue;
    }
    // Bullets — "- " or "* " or "• "
    const b = line.match(/^\s*(?:[-*•])\s+(.+)$/);
    if (b) {
      flushParagraph();
      bullets.push(b[1]);
      continue;
    }
    flushBullets();
    buf.push(line);
  }
  flushParagraph();
  flushBullets();

  return <>{blocks}</>;
}

function RoleAvatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div
        aria-hidden="true"
        className="size-7 shrink-0 rounded-full bg-[var(--color-muted)] border border-[var(--color-rule-strong)] text-[var(--color-ink)] grid place-items-center text-[10px] font-semibold"
      >
        You
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="size-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-accent)] text-[var(--color-paper)] grid place-items-center text-sm font-serif italic shadow-sm ring-2 ring-[var(--color-paper)]"
      title="Visavu AI"
    >
      V
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Assistant is typing">
      <span className="inline-block size-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="inline-block size-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="inline-block size-1.5 rounded-full bg-neutral-500 animate-bounce" />
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition"
      aria-label="Copy reply to clipboard"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export function ChatInterface() {
  const search = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load persisted history on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setMessages(JSON.parse(stored) as Message[]);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Auto-resize textarea on input change.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Auto-submit ?q= on first mount.
  useEffect(() => {
    if (autoSubmitted) return;
    const q = search.get("q");
    if (q && q.trim()) {
      setAutoSubmitted(true);
      void send(q.trim());
    } else {
      setAutoSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, autoSubmitted]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text, ts: Date.now() },
    ];
    setMessages(newMessages);
    setInput("");
    setBusy(true);

    try {
      // Read existing session id (if any) so follow-ups continue the
      // same server-side conversation row. If absent, the server
      // generates one + returns it in the response, and we persist it.
      let sessionId: string | null = null;
      try {
        sessionId = localStorage.getItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId: sessionId ?? undefined }),
      });
      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        sessionId?: string;
        type?: string;
        clarifying?: { options?: string[] };
      };
      const reply = data.reply ?? data.error ?? "Sorry — the assistant didn't return a reply.";
      // Persist whatever the server returned so the next request
      // stitches onto the same conversation row.
      if (data.sessionId) {
        try {
          localStorage.setItem(SESSION_KEY, data.sessionId);
        } catch {
          /* ignore */
        }
      }
      // Strip clarifying pills from any previous assistant message
      // before adding the new turn — only the most recent assistant
      // message should ever offer clarifying options. Otherwise stale
      // pill rows pile up as the conversation progresses.
      setMessages((m) => [
        ...m.map((msg) => (msg.role === "assistant" ? { ...msg, clarifyingOptions: undefined } : msg)),
        {
          role: "assistant",
          content: reply,
          ts: Date.now(),
          clarifyingOptions: data.clarifying?.options,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, something went wrong: ${msg}`, ts: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const clear = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Also drop the session id so the next message starts a fresh
      // conversation row (matches the user's "clear" expectation).
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  };

  const hasMessages = messages.length > 0;

  // Show suggested follow-ups after first assistant reply.
  const followUps = useMemo<string[]>(() => {
    if (!hasMessages || busy) return [];
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return [];
    return [
      "What documents do I need?",
      "How long does processing take?",
      "What are the most common reasons for refusal?",
    ];
  }, [messages, busy, hasMessages]);

  return (
    <div className="flex flex-col gap-4">
      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-4 sm:p-5 min-h-[320px] max-h-[60vh] shadow-sm"
      >
        {!hasMessages && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <RoleAvatar role="assistant" />
              <div className="flex-1 text-sm text-[var(--color-ink)]">
                <p className="font-medium mb-1">
                  Hi, I&apos;m Visavu.
                </p>
                <p className="text-[var(--color-ink-muted)] leading-relaxed">
                  Ask me anything about visas, work routes, study options, or
                  short-stay rules. I&apos;ll cite my sources and won&apos;t
                  guess — if I don&apos;t know, I&apos;ll say so.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTION_CATEGORIES.map((cat) => (
                <div
                  key={cat.label}
                  className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-3.5 space-y-2.5 hover:border-[var(--color-rule-strong)] hover:shadow-sm transition"
                >
                  <div className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="text-base leading-none">{cat.emoji}</span>
                    {cat.label}
                  </div>
                  <ul className="space-y-1.5">
                    {cat.examples.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => void send(q)}
                          className="text-left text-sm text-[var(--color-ink)]/85 hover:text-[var(--color-ink)] hover:translate-x-0.5 transition group flex items-start gap-1.5"
                        >
                          <span className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">→</span>
                          <span className="underline decoration-[var(--color-rule)] underline-offset-4 group-hover:decoration-[var(--color-ink)]">
                            {q}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="space-y-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${m.role === "user" ? "flex flex-row-reverse gap-2.5" : "flex gap-3"} chat-msg-in`}
              >
                <RoleAvatar role={m.role} />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[90%] sm:max-w-[80%] rounded-2xl rounded-tr-sm bg-[var(--color-ink)] text-[var(--color-paper)] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words shadow-sm"
                        : "mr-auto max-w-full sm:max-w-[92%] rounded-2xl rounded-tl-sm bg-[var(--color-paper-elev)] text-[var(--color-ink)] px-5 py-4 text-[14.5px] break-words space-y-3 ring-1 ring-[var(--color-rule)]/60"
                    }
                  >
                    {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                  </div>
                  {/* Clarifying-question pills — rendered when the
                      assistant returned options. Click submits the
                      pill text verbatim as the user's next message.
                      Disabled while another request is in flight
                      (busy) so users can't double-fire. */}
                  {m.role === "assistant" && m.clarifyingOptions && m.clarifyingOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-1">
                      {m.clarifyingOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => void send(opt)}
                          disabled={busy}
                          className="
                            px-3 py-1.5 rounded-full text-xs font-medium
                            border border-[var(--color-rule-strong)] bg-[var(--color-paper)]
                            text-[var(--color-ink)] hover:bg-[var(--color-ink)]
                            hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]
                            transition disabled:opacity-50 disabled:cursor-not-allowed
                          "
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-3 pl-1">
                      <CopyButton text={m.content} />
                      {m.ts && (
                        <span className="text-[10px] text-neutral-400" suppressHydrationWarning>
                          {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-3 chat-msg-in">
                <RoleAvatar role="assistant" />
                <div className="mr-auto rounded-2xl rounded-tl-sm bg-[var(--color-paper-elev)] ring-1 ring-[var(--color-rule)]/60 px-4 py-3 text-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            {followUps.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-10 pt-1">
                {followUps.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="text-xs rounded-full border border-[var(--color-rule-strong)] bg-[var(--color-paper)] hover:bg-[var(--color-muted)] hover:border-[var(--color-ink)] text-[var(--color-ink)] px-3 py-1.5 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Single persistent disclaimer line — replaces the per-message
          disclaimer the API used to stamp on every reply. One line, one
          place, always visible above the input. */}
      <p className="text-[11px] text-[var(--color-ink-muted)] text-center -mb-1">
        General information, not legal advice. Visa rules change — verify with the
        destination&apos;s immigration authority before acting.{" "}
        <Link href="/disclaimer" className="underline hover:text-[var(--color-ink)]">
          More
        </Link>
      </p>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2 rounded-xl border border-[var(--color-rule-strong)] bg-[var(--color-paper-elev)] focus-within:border-[var(--color-ink)] focus-within:ring-2 focus-within:ring-[var(--color-ink)]/10 transition px-2 py-1.5 shadow-sm"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          placeholder="Ask a visa question…  (Shift+Enter for newline)"
          aria-label="Type your question"
          className="flex-1 min-w-0 bg-transparent text-[var(--color-ink)] px-2 py-2 text-sm outline-none resize-none placeholder:text-[var(--color-ink-muted)] max-h-[200px]"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 rounded-full bg-[var(--color-ink)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-paper)] font-semibold px-4 py-2 text-sm transition"
          aria-label="Send message"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>

      {/* Footer actions */}
      <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
        {hasMessages ? (
          <button
            onClick={clear}
            className="hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
          >
            Clear conversation
          </button>
        ) : (
          <span />
        )}
        <Link
          href="/find-my-visa"
          className="hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
        >
          Want a structured intake instead? →
        </Link>
      </div>
    </div>
  );
}
