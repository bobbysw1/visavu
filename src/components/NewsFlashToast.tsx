"use client";

/**
 * Visa-news ticker — thin, full-width bar pinned to the bottom of
 * the viewport. Inspired by Sky Sports News' bottom ticker: subtle,
 * editorial, doesn't shout.
 *
 * Replaced the original boxy bottom-left toast (looked like a popup
 * ad) with this slimmer design per user feedback "thin, classy,
 * Sky Sports News-style."
 *
 * Layout (single row, ~36-40px tall):
 *   [● VISA NEWS ·]  [flag] [headline · auto-rotates]  [1/3] [↗] [×]
 *
 * UX rules:
 *   - Single line of text — fades between items every 8s
 *   - Pulsing accent dot only on urgency=high items
 *   - "Source" link sits inline (no click stealing the headline tap)
 *   - Dismiss per-item via localStorage (won't re-show to same user)
 *   - Right-padded to clear FloatingChatLauncher (bottom-right 56px)
 *   - 1.5s mount delay so it doesn't fight initial paint
 *   - Hides when no live items or all dismissed
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { flagEmoji, nameFor } from "@/lib/countries";
import { activePolicyNews, type ManualPolicyNews } from "@/content/manualPolicyNews";
import { verificationFor } from "@/lib/newsVerification";

const DISMISSED_KEY = "visavu.news.dismissed";
const ROTATION_MS = 8_000;
const MOUNT_DELAY_MS = 1_500;
const FADE_MS = 400;

type Dismissed = Record<string, number>;

function loadDismissed(): Dismissed {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as Dismissed) : {};
  } catch {
    return {};
  }
}

function persistDismissed(d: Dismissed): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function NewsFlashToast() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState<Dismissed>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

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
    return undismissed.sort((a, b) => {
      const ua = a.urgency === "high" ? 0 : 1;
      const ub = b.urgency === "high" ? 0 : 1;
      if (ua !== ub) return ua - ub;
      return b.date.localeCompare(a.date);
    });
  }, [dismissed]);

  // Cross-fade between items every ROTATION_MS.
  useEffect(() => {
    if (visible.length <= 1) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % visible.length);
        setFading(false);
      }, FADE_MS);
    }, ROTATION_MS);
    return () => clearInterval(t);
  }, [visible.length]);

  // Keep activeIdx in-bounds when items dismissed mid-rotation.
  useEffect(() => {
    if (activeIdx >= visible.length && visible.length > 0) setActiveIdx(0);
  }, [visible.length, activeIdx]);

  if (!mounted || visible.length === 0) return null;
  const item = visible[activeIdx];
  if (!item) return null;

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

  const verified = verificationFor(item.id).status === "verified";

  return (
    <div
      role="status"
      aria-live="polite"
      // Full-width thin bar pinned to viewport bottom. Right padding
      // clears the FloatingChatLauncher bubble (bottom-4 right-4,
      // ~56-64px diameter); enough room for chat to sit clear.
      className="
        fixed bottom-0 left-0 right-0 z-30
        border-t border-[var(--color-rule)] bg-[var(--color-paper)]/95 backdrop-blur
        text-[12px] sm:text-[13px] text-[var(--color-ink)]
        animate-in slide-in-from-bottom-2 fade-in duration-500
      "
    >
      <div className="mx-auto max-w-7xl pl-3 sm:pl-5 pr-20 sm:pr-24">
        <div className="flex items-center gap-2.5 sm:gap-4 h-9 sm:h-10">
          {/* Kicker — small uppercase brand label + pulsing dot for urgency.
              Pulsing only when urgency=high so routine news doesn't twitch. */}
          <span className="flex items-center gap-1.5 shrink-0">
            <span
              aria-hidden
              className={`
                inline-block h-1.5 w-1.5 rounded-full
                ${item.urgency === "high" ? "bg-red-500 animate-pulse" : "bg-[var(--color-accent)]"}
              `}
            />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-ink-muted)]">
              Visa News
            </span>
            <span aria-hidden className="text-[var(--color-rule-strong)] hidden sm:inline">·</span>
          </span>

          {/* Headline — flex-1 truncate so a long title stays one line.
              Wrapper has the cross-fade opacity transition. */}
          <Link
            href={href}
            className={`
              flex-1 min-w-0 flex items-center gap-2
              hover:text-[var(--color-ink)] hover:underline underline-offset-4
              decoration-[var(--color-rule-strong)] transition-opacity
              ${fading ? "opacity-0" : "opacity-100"}
            `}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            {item.destinationIso2 && (
              <span className="text-sm leading-none shrink-0" aria-hidden>
                {flagEmoji(item.destinationIso2)}
              </span>
            )}
            <span className="hidden sm:inline text-[10px] uppercase tracking-wide font-bold text-[var(--color-ink-muted)] shrink-0">
              {item.destinationName ?? (item.destinationIso2 ? nameFor(item.destinationIso2) : "Global")}
            </span>
            <span className="truncate font-medium">{item.title}</span>
          </Link>

          {/* Source + verified inline — small, doesn't distract */}
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={verified ? "Source verified" : "Source"}
              className="hidden md:inline text-[10px] uppercase tracking-wider font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] shrink-0"
            >
              {verified ? "Verified ↗" : "Source ↗"}
            </a>
          )}

          {/* Rotation indicator + dismiss */}
          {visible.length > 1 && (
            <span className="text-[10px] tabular-nums text-[var(--color-ink-muted)] shrink-0 hidden sm:inline">
              {activeIdx + 1}/{visible.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={`Dismiss: ${item.title}`}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-muted)]/60 transition text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
