"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "visavu.chat.v1";

/**
 * Visavu chat — client UI talking to /api/chat.
 *
 * Persists conversation to localStorage so refresh doesn't lose it.
 * If ?q= is in the URL on first load, auto-submits that as the opening
 * message (used by the homepage ChatBar widget).
 */
export function ChatInterface() {
  const search = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load persisted history on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setMessages(JSON.parse(stored) as Message[]);
    } catch {
      // ignore
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

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
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply = data.reply ?? data.error ?? "Sorry — the assistant didn't return a reply.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      setMessages((m) => [...m, { role: "assistant", content: `Sorry, something went wrong: ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  const clear = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 min-h-[300px] max-h-[60vh]"
      >
        {messages.length === 0 && (
          <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-3">
            <p>Try asking:</p>
            <ul className="space-y-1.5">
              {[
                "Can I work remotely in Portugal on a tourist visa?",
                "What visa do I need to move to Canada from India?",
                "Does my UK passport need an ETA for the US?",
                "How long can I stay in Schengen on the 90/180 rule?",
              ].map((q, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => void send(q)}
                    className="text-left text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    “{q}”
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[90%] sm:max-w-[80%] rounded-lg bg-blue-600 text-white px-3.5 py-2.5 text-sm whitespace-pre-wrap"
                : "mr-auto max-w-[95%] sm:max-w-[85%] rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-sm whitespace-pre-wrap"
            }
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="mr-auto rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3.5 py-2.5 text-sm text-neutral-500 italic">
            Thinking…
          </div>
        )}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Type a visa question…"
          aria-label="Type your question"
          className="flex-1 min-w-0 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 text-white font-semibold px-4 py-2 text-sm transition"
        >
          Send
        </button>
      </form>

      {/* Footer actions */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        {messages.length > 0 ? (
          <button onClick={clear} className="hover:text-neutral-700 dark:hover:text-neutral-200">Clear conversation</button>
        ) : <span />}
        <Link href="/find-my-visa" className="hover:text-neutral-700 dark:hover:text-neutral-200">
          Want a structured intake instead? →
        </Link>
      </div>
    </div>
  );
}
