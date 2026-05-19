"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
  /** Multiple-choice pills the assistant offered for clarification.
   *  Cleared from previous messages when a new turn lands. */
  clarifyingOptions?: string[];
};

const STORAGE_KEY = "visavu.chat.v1"; // shares state with the full /chat page
const DISMISS_STORAGE_KEY = "visavu.chat.floating.dismissedAt";

const SEED_PROMPTS = [
  "Can I work remotely in Portugal on a tourist visa?",
  "Does my UK passport need an ETA for the US?",
  "What's the cheapest Golden Visa in Europe?",
];

/**
 * Floating chat launcher — pinned bottom-right on every site page.
 *
 * Collapsed: a small chat-bubble button (always visible).
 * Expanded: a compact chat panel (smaller than the full /chat page UI)
 *           that talks to /api/chat and persists conversation in the
 *           same localStorage bucket as the /chat page (so the user's
 *           thread carries between the two surfaces).
 *
 * Hidden on /chat itself (would be redundant) and on /embed/* routes
 * (third-party embeds shouldn't carry our chrome).
 */
export function FloatingChatLauncher() {
  const [open, setOpen] = useState(false);
  const [hideForPath, setHideForPath] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Hide on /chat (redundant) and on embed routes.
  useEffect(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path === "/chat" || path.startsWith("/embed/") || path.startsWith("/admin/")) {
      setHideForPath(true);
    }
  }, []);

  // Load persisted history.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setMessages(JSON.parse(stored) as Message[]);
    } catch { /* ignore */ }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, busy, open]);

  // Escape closes when open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (hideForPath) return null;

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setBusy(true);

    try {
      // Read/persist session id so the server can stitch follow-up
      // messages onto the same conversation row (used by the chat
      // rate-limit + abuse-review system).
      let sessionId: string | null = null;
      try {
        sessionId = localStorage.getItem("visavu.chat.session");
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
        clarifying?: { options?: string[] };
      };
      const reply = data.reply ?? data.error ?? "Sorry — the assistant didn't return a reply.";
      if (data.sessionId) {
        try {
          localStorage.setItem("visavu.chat.session", data.sessionId);
        } catch {
          /* ignore */
        }
      }
      // Clear stale clarifying pills from previous assistant messages —
      // only the latest assistant turn should ever show pills.
      setMessages((m) => [
        ...m.map((msg) =>
          msg.role === "assistant" ? { ...msg, clarifyingOptions: undefined } : msg,
        ),
        { role: "assistant", content: reply, clarifyingOptions: data.clarifying?.options },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      setMessages((m) => [...m, { role: "assistant", content: `Sorry, something went wrong: ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Collapsed state — small button bottom-right
  // ─────────────────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Visavu chat assistant"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] hover:opacity-90 text-[var(--color-paper)] shadow-lg shadow-black/15 transition px-4 py-3 text-sm font-semibold"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12c0 4.418-4.03 8-9 8-1.355 0-2.64-.27-3.79-.756L3 21l1.757-4.31C3.654 15.292 3 13.717 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Ask Visavu</span>
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Expanded state — compact chat panel
  // ─────────────────────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-label="Visavu chat assistant"
      className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[calc(100vh-2rem)] sm:max-h-[600px] flex flex-col rounded-xl shadow-2xl shadow-black/15 border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden"
    >
      {/* HEADER */}
      <div className="shrink-0 flex items-center justify-between gap-2 border-b border-[var(--color-rule)] px-3 py-2.5 bg-[var(--color-muted)]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
          <p className="text-sm font-semibold truncate text-[var(--color-ink)]">Ask Visavu</p>
        </div>
        <Link
          href="/chat"
          className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hidden sm:inline"
        >
          Open full →
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="ml-1 p-1 rounded text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--color-paper)] min-h-[200px]"
      >
        {messages.length === 0 ? (
          <div className="text-xs space-y-2 text-[var(--color-ink-muted)]">
            <p>Try asking:</p>
            <ul className="space-y-1.5">
              {SEED_PROMPTS.map((q, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => void send(q)}
                    className="text-left text-[var(--color-ink)] underline decoration-[var(--color-rule-strong)] hover:decoration-[var(--color-ink)] underline-offset-2"
                  >
                    “{q}”
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="space-y-1.5">
              <div
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-[var(--color-ink)] text-[var(--color-paper)] px-3 py-2 text-xs whitespace-pre-wrap"
                    : "mr-auto max-w-[90%] rounded-lg bg-[var(--color-paper-elev)] border border-[var(--color-rule)] px-3 py-2 text-xs whitespace-pre-wrap text-[var(--color-ink)]"
                }
              >
                {m.content}
              </div>
              {/* Clarifying pill buttons — click sends the option text
                  as the next user message. Same UX as full /chat page. */}
              {m.role === "assistant" && m.clarifyingOptions && m.clarifyingOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.clarifyingOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => void send(opt)}
                      disabled={busy}
                      className="
                        px-2.5 py-1 rounded-full text-[11px] font-medium
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
            </div>
          ))
        )}
        {busy && (
          <div className="mr-auto rounded-lg bg-[var(--color-paper-elev)] border border-[var(--color-rule)] px-3 py-2 text-xs text-[var(--color-ink-muted)] italic">
            Thinking…
          </div>
        )}
      </div>

      {/* INPUT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="shrink-0 border-t border-[var(--color-rule)] p-2.5 bg-[var(--color-paper-elev)]"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            placeholder="Ask a visa question…"
            aria-label="Type your question"
            className="flex-1 min-w-0 rounded-lg border border-[var(--color-rule-strong)] bg-[var(--color-paper)] text-[var(--color-ink)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--color-ink)] resize-none max-h-24"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="shrink-0 rounded-full bg-[var(--color-ink)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-paper)] font-semibold px-3.5 py-1.5 text-xs transition"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-ink-muted)] mt-1.5">
          General information, not legal advice. <Link href="/disclaimer" className="underline">Disclaimer</Link>
        </p>
      </form>
    </div>
  );
}
