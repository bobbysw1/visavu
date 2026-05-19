"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; hint?: string }[] = [
  { href: "/finder", label: "Where can I go?", hint: "Filter every destination by your goal" },
  { href: "/find-my-visa", label: "Find my visa", hint: "Answer a few questions, get ranked routes" },
  { href: "/chat", label: "AI visa assistant", hint: "Ask anything — grounded in our verified data" },
  { href: "/documents", label: "Visa forms library", hint: "Form 888, I-130 etc — direct gov download links" },
  { href: "/myths", label: "Myths & rumours", hint: "60+ common immigration claims, fact-checked" },
  { href: "/guides", label: "Guides", hint: "ETIAS, EES, Schengen explainers" },
  { href: "/passport-rankings", label: "Passport rankings", hint: "Every passport, sorted by access" },
  { href: "/updates", label: "Visa news", hint: "Recent fee changes + new visa programmes" },
  { href: "/services", label: "Services", hint: "Vetted relocation providers" },
  { href: "/methodology", label: "Methodology" },
  { href: "/sources", label: "Sources" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body scroll lock + Escape handler + focus on close button when opened.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu-drawer"
        aria-label="Open menu"
        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--color-ink)] hover:bg-[var(--color-paper-elev)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]/40"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="md:hidden fixed inset-0 z-50 flex motion-safe:animate-fadeIn"
        >
          {/* Backdrop */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-black/40"
          />
          {/* Drawer panel — full screen on phones */}
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-[var(--color-paper)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-rule)] px-5 py-4">
              <span className="serif-display text-xl">
                Visavu<span className="text-[var(--color-accent)]">.</span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-[var(--color-paper-elev)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]/40"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="list-none m-0 p-0 space-y-1">
                {LINKS.map((l) => {
                  const active =
                    pathname === l.href || pathname?.startsWith(l.href + "/");
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-lg px-3 py-3 transition ${
                          active
                            ? "bg-[var(--color-paper-elev)] text-[var(--color-ink)]"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-paper-elev)]"
                        }`}
                      >
                        <span className="font-medium text-base">{l.label}</span>
                        {l.hint && (
                          <span className="block text-xs text-[var(--color-ink-muted)] mt-0.5">
                            {l.hint}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
