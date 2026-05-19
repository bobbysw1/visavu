import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE, absoluteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ChatInterface } from "@/components/ChatInterface";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export const metadata: Metadata = {
  title: "Ask Visavu — AI visa assistant",
  description:
    "Ask Visavu's AI assistant any visa question. Grounded in verified government data, with sources cited. General information, not legal advice.",
  alternates: { canonical: absoluteUrl("/chat") },
  openGraph: {
    title: "Ask Visavu — AI visa assistant",
    description: "Visa answers grounded in verified gov data.",
    url: absoluteUrl("/chat"),
  },
};

export const dynamic = "force-dynamic";

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Ask Visavu" },
];

const TRUST_POINTS: Array<{ label: string; sub: string; icon: string }> = [
  {
    icon: "🔍",
    label: "Grounded in data",
    sub: "Answers cite the verified gov-source routes we surface site-wide.",
  },
  {
    icon: "🛑",
    label: "Refuses bad asks",
    sub: "Won't advise on asylum, fraud, deportation, or how to present a case — those need a regulated adviser.",
  },
  {
    icon: "🧭",
    label: "Tells you when it's unsure",
    sub: "Says \"I don't know\" instead of guessing — and points to where you can verify.",
  },
];

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 min-h-[80vh]">
      <Breadcrumbs crumbs={crumbs} />

      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-accent)] bg-[var(--color-muted)] border border-[var(--color-rule)] rounded-full px-2.5 py-1">
          <span className="size-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          AI assistant — beta
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">Ask {SITE.name}</h1>
        <p className="text-base text-[var(--color-ink-muted)] max-w-2xl">
          Visa questions, answered from verified government data plus general
          policy knowledge. Cites sources, refuses to guess, and skips the
          stuff that needs a regulated adviser.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 -mt-1">
        {TRUST_POINTS.map((p) => (
          <div
            key={p.label}
            className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-3 space-y-1"
          >
            <div className="text-xl leading-none" aria-hidden="true">{p.icon}</div>
            <div className="text-sm font-medium text-[var(--color-ink)]">{p.label}</div>
            <p className="text-xs text-[var(--color-ink-muted)] leading-snug">{p.sub}</p>
          </div>
        ))}
      </div>

      <DisclaimerBanner tone="info" />

      <Suspense fallback={<div className="text-sm text-[var(--color-ink-muted)]">Loading chat…</div>}>
        <ChatInterface />
      </Suspense>

      <footer className="text-xs text-[var(--color-ink-muted)] border-t border-[var(--color-rule)] pt-4 mt-auto">
        General information only. Visa rules change. Verify with the
        destination&apos;s immigration authority before acting on anything here.
        For an OISC- or OCG-registered adviser, see{" "}
        <a href="/consultation" className="underline hover:text-[var(--color-ink)]">
          our consultation form
        </a>.
      </footer>
    </div>
  );
}
