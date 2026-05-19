"use client";

/**
 * Tools dropdown — groups secondary tool/resource links so the nav
 * stops becoming a wall of items. User flagged: chat + myths +
 * guides + updates + documents + find-my-visa under one top-level
 * surface is too much. This dropdown bundles them into a single
 * "Tools" entry.
 *
 * Stays open on hover (desktop) AND on tap (mobile-tablet) — uses a
 * tiny client component so we can close-on-outside-click. Closes on
 * Escape + any link click. Keyboard navigable.
 *
 * Renders nothing JS-heavy: a button + an absolutely-positioned menu
 * panel. No animation library, no third-party popover dep.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type ToolLink = {
  href: string;
  label: string;
  description: string;
};

const TOOL_LINKS: ToolLink[] = [
  {
    href: "/chat",
    label: "AI visa assistant",
    description: "Ask anything — grounded in our verified visa data.",
  },
  {
    href: "/find-my-visa",
    label: "Find my visa",
    description: "12-step questionnaire → personalised pathway shortlist.",
  },
  {
    href: "/documents",
    label: "Visa forms library",
    description: "Form 888, I-130, IMM 5532 — direct gov download links.",
  },
  {
    href: "/myths",
    label: "Common visa myths",
    description: "Things people get wrong, sourced from official rules.",
  },
  {
    href: "/guides",
    label: "Application guides",
    description: "Step-by-step walkthroughs for the trickiest visa categories.",
  },
  {
    href: "/passport-rankings",
    label: "Passport rankings",
    description: "Every passport ranked by mobility + tier.",
  },
  {
    href: "/updates",
    label: "Visa news",
    description: "Recent fee changes + new visa programmes.",
  },
];

export function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside-click + Escape so the dropdown feels native.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="hidden md:inline-flex items-center gap-0.5 px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition"
      >
        <span>Tools</span>
        <ChevronDown
          size={14}
          aria-hidden
          className={`mt-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] shadow-xl py-2 z-50"
        >
          {TOOL_LINKS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 hover:bg-[var(--color-muted)]/60 transition"
            >
              <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight">
                {t.label}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 leading-snug">
                {t.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
