import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE, absoluteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ChatInterface } from "@/components/ChatInterface";

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

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 min-h-[80vh]">
      <Breadcrumbs crumbs={crumbs} />

      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ask Visavu</h1>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Visa questions, answered from {SITE.name}'s verified data plus
          general policy knowledge. The assistant cites sources and won't
          guess. Refuses to advise on asylum, deportation, criminal records,
          or how to present a specific application — those need a registered
          adviser.
        </p>
      </header>

      <Suspense fallback={<div className="text-sm text-neutral-500">Loading chat…</div>}>
        <ChatInterface />
      </Suspense>

      <footer className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-auto">
        General information only. Visa rules change. Verify with the
        destination's immigration authority before acting on anything here.
      </footer>
    </div>
  );
}
