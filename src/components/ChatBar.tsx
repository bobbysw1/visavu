"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "Can I work remotely in Portugal on a tourist visa?",
  "What visa do I need to move to Canada from India?",
  "Does my UK passport need an ETA for the US?",
  "How long can I stay in Schengen on the 90/180 rule?",
  "What's the cheapest Golden Visa in Europe?",
];

/**
 * Homepage chat bar — a single input that opens /chat with the query
 * pre-filled. Rotates an example placeholder every few seconds so users
 * see the conversational framing.
 */
export function ChatBar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [exampleIdx, setExampleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  };

  const inputClass =
    tone === "dark"
      ? "bg-white/95 text-neutral-900 placeholder:text-neutral-500 border-white/30 focus:border-white"
      : "bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-300 focus:border-blue-500";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={EXAMPLES[exampleIdx]}
          aria-label="Ask Visavu a visa question"
          className={`flex-1 min-w-0 rounded-lg px-4 py-3 text-base border outline-none transition ${inputClass}`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 text-base transition"
        >
          Ask
        </button>
      </div>
      <p
        className={`text-xs mt-2 ${
          tone === "dark" ? "text-white/70" : "text-neutral-500"
        }`}
      >
        Visavu's AI assistant answers from verified gov data. General information,
        not legal advice.
      </p>
    </form>
  );
}
