"use client";

/**
 * Client-side scroll + highlight for the per-purpose editorial blocks on the
 * /destination/[iso] page (and /[passport]/[destination] when it adopts the
 * same id convention).
 *
 * Behaviour:
 *   1. Read ?purpose=tourism|work|study|family from the URL.
 *   2. Find an element with id="purpose-<value>" and scrollIntoView() it.
 *   3. Add a brief ring/ink-border highlight class to the matched element.
 *
 * Falls back silently if the element isn't on the page. Idempotent — runs
 * once per pathname change (so navigating back doesn't re-trigger weirdly).
 *
 * Why a client component:
 *   The destination page is `force-static` so it can't read searchParams
 *   server-side without opting out of static generation. A small client
 *   component is the right unit to handle the query-driven scroll behaviour
 *   without losing the build-time render cache.
 */

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";

const VALID = new Set(["tourism", "work", "study", "family", "business", "transit", "diplomatic"]);

export function PurposeBlockScroller() {
  const search = useSearchParams();
  const pathname = usePathname();
  const ranForRef = useRef<string | null>(null);

  useEffect(() => {
    const purpose = search.get("purpose");
    if (!purpose || !VALID.has(purpose)) return;

    // De-dupe: only run once per (pathname + purpose) so back-nav doesn't
    // re-highlight.
    const key = `${pathname}::${purpose}`;
    if (ranForRef.current === key) return;
    ranForRef.current = key;

    const target = document.getElementById(`purpose-${purpose}`);
    if (!target) return;

    // Defer one tick so any layout / image-loading settles first.
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Highlight ring — pulled from the brand ink colour. Use inline class
      // toggles so we don't depend on Tailwind purge picking up dynamic
      // class names. Auto-clear after 3.5s so it's a nudge, not a stain.
      target.classList.add(
        "ring-2",
        "ring-[var(--color-ink)]",
        "ring-offset-2",
        "ring-offset-[var(--color-paper)]",
      );
      setTimeout(() => {
        target.classList.remove("ring-2", "ring-[var(--color-ink)]", "ring-offset-2", "ring-offset-[var(--color-paper)]");
      }, 3500);
    });
  }, [search, pathname]);

  return null;
}
