"use client";

/**
 * Bottom-left rotating-pill widget that surfaces visa-policy news
 * (Thailand cuts visa-exempt stay, Spain digital nomad threshold
 * change, US ESTA fee bump, etc).
 *
 * Why this exists: the homepage carousel only surfaces news to
 * users who scroll all the way down. Many people land on a
 * destination or pair page and never see it. The toast pings on
 * every page so genuinely-urgent news (rule changes, new fees,
 * scheme closures) reaches users mid-research.
 *
 * UX rules — be useful, not annoying:
 *   - One pill at a time, bottom-left (opposite the floating chat).
 *   - Auto-cycle every 8 seconds if multiple items.
 *   - Dismissable per-item (X button) — persists in localStorage
 *     so the same user doesn't see the same pill twice.
 *   - Whole pill is clickable → /destination/{iso} or /updates.
 *   - urgency: "high" items shown first; routine items rotate.
 *   - Hide entirely if no live items or all dismissed.
 *   - Mounts with a short delay (1.5s) so it doesn't fight with
 *     initial page paint.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { flagEmoji, nameFor } from "@/lib/countries";
import { activePolicyNews, type ManualPolicyNews } from "@/content/manualPolicyNews";

const DISMISSED_KEY = "visavu.news.dismissed";
const ROTATION_MS = 8_000;
const MOUNT_DELAY_MS = 1_500;

type Dismissed = Record<string, number>; // id → epoch ms dismissed at

function loadDismissed(): Dismissed {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Dismissed;
  } catch {
    return {};
  }
}

function persistDismissed(d: Dismissed): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(d));
  } catch {
    /* ignore — private mode, quota, etc. */
  }
}

export function NewsFlashToast() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState<Dismissed>({});
  const [activeIdx, setActiveIdx] = useState(0);

  // Defer first paint so the toast doesn't steal attention during
  // initial page load.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), MOUNT_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setDismissed(loadDismissed());
  }, []);

  const visible = useMemo<ManualPolicyNews[]>(() => {
    const live = activePolicyNews();
    const undismissed = live.filter((n) => !dismissed[n.id]);
    // urgency:"high" items pinned to the front of the rotation.
    return undismissed.sort((a, b) => {
      const ua = a.urgency === "high" ? 0 : 1;
      const ub = b.urgency === "high" ? 0 : 1;
      if (ua !== ub) return ua - ub;
      return b.date.localeCompare(a.date);
    });
  }, [dismissed]);

  // Rotate through items every ROTATION_MS. Pause if only one item
  // (no point rotating to itself).
  useEffect(() => {
    if (visible.length <= 1) return;
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % visible.length);
    }, ROTATION_MS);
    return () => clearInterval(t);
  }, [visible.length]);

  // Keep activeIdx in-bounds when items are dismissed mid-rotation.
  useEffect(() => {
    if (activeIdx >= visible.length && visible.length > 0) {
      setActiveIdx(0);
    }
  }, [visible.length, activeIdx]);

  if (!mounted) return null;
  if (visible.length === 0) return null;

  const item = visible[activeIdx];
  if (!item) return null;

  // Click destination: per-country page for items with an iso,
  // /updates list for general items.
  const href = item.destinationIso2
    ? `/destination/${item.destinationIso2.toLowerCase()}`
    : "/updates";

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = { ...dismissed, [item.id]: Date.now() };
    setDismissed(next);
    persistDismissed(next);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      // Bottom-left so it doesn't fight with the floating chat (bottom-right).
      // sm:max-w-sm so it's a focused pill, not a full-width banner.
      className="
        fixed bottom-4 left-4 z-40 max-w-[88vw] sm:max-w-sm
        animate-in slide-in-from-bottom-2 fade-in duration-500
      "
    >
      <Link
        href={href}
        className="
          group flex items-start gap-2.5
          rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]/95
          backdrop-blur shadow-lg hover:shadow-xl hover:border-[var(--color-ink)]
          transition px-3.5 py-2.5 text-left
        "
      >
        {/* Pulsing accent dot — signals "this is news, not chrome". */}
        <span
          aria-hidden
          className={`
            mt-1 inline-block h-2 w-2 rounded-full shrink-0
            ${item.urgency === "high" ? "bg-red-500 animate-pulse" : "bg-[var(--color-accent)]"}
          `}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-[var(--color-ink-muted)] mb-0.5">
            {item.destinationIso2 ? (
              <>
                <span aria-hidden className="mr-1">{flagEmoji(item.destinationIso2)}</span>
                {item.destinationName ?? nameFor(item.destinationIso2)} · Visa news
              </>
            ) : (
              "Visa news"
            )}
          </p>
          <p className="text-sm font-medium text-[var(--color-ink)] leading-snug group-hover:underline underline-offset-2 decoration-[var(--color-rule-strong)]">
            {item.title}
          </p>
          {visible.length > 1 && (
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-1 tabular-nums">
              {activeIdx + 1}/{visible.length} · auto-rotates
            </p>
          )}
        </div>
        {/* Dismiss — separate hit area so click doesn't navigate. */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={`Dismiss news: ${item.title}`}
          className="
            shrink-0 -mr-1 -mt-1 w-6 h-6 rounded-full
            flex items-center justify-center
            text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]
            hover:bg-[var(--color-muted)]/50 transition text-sm
          "
        >
          ✕
        </button>
      </Link>
    </div>
  );
}
