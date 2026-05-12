"use client";

/**
 * Tiny social-proof / insights banner. Pinned bottom-left, dismissible,
 * mobile-friendly. Rotates through a small set of messages every ~8s.
 *
 * Honesty policy: we do NOT fabricate user counts ("124 people searched
 * today" when we have no analytics-side number). Every message is either
 * (a) a real number passed in from the server's siteStats() query, or
 * (b) a curated fact about a specific visa route taken from our verified
 * dataset. Both are defensible if a user asks "where did that number
 * come from?" — the alternative (inventing live-activity counts) trades
 * trust for short-term FOMO, and Visavu's whole positioning is trust.
 *
 * Dismissal persists for 7 days in localStorage so a returning user who
 * already closed it doesn't see it again the same week.
 */
import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

const DISMISS_KEY = "visavu:social-proof-dismissed-until";
const ROTATE_MS = 8_000;
const HIDE_AFTER_MS = 90_000; // auto-hide after 90s of inactivity

type Message = {
  id: string;
  emoji: string;
  text: string;
};

const CURATED: Message[] = [
  { id: "pt-d7", emoji: "🇵🇹", text: "Portugal D7 — €820/month passive income unlocks 1-yr residence" },
  { id: "es-dn", emoji: "🇪🇸", text: "Spain Digital Nomad — 1-yr visa, renewable up to 5 yrs" },
  { id: "ca-ee", emoji: "🇨🇦", text: "Canada Express Entry — direct PR for skilled migrants" },
  { id: "uk-sw", emoji: "🇬🇧", text: "UK Skilled Worker — ILR after 5 yrs on most routes" },
  { id: "ae-gold", emoji: "🇦🇪", text: "UAE Golden Visa — 5 or 10-yr renewable, 0% income tax" },
  { id: "nz-smc", emoji: "🇳🇿", text: "New Zealand SMC — direct Resident Visa for ≥160 occupation points" },
  { id: "de-bc", emoji: "🇩🇪", text: "Germany EU Blue Card — PR after 33 mos with B1 German" },
  { id: "fr-tp", emoji: "🇫🇷", text: "France Talent Passport — 4-yr renewable for high-skill roles" },
  { id: "jp-ssw", emoji: "🇯🇵", text: "Japan SSW — 14 sectors with English-language exams" },
  { id: "sg-ep", emoji: "🇸🇬", text: "Singapore EP — minimum SGD 5,000 monthly salary" },
];

export function SocialProofBanner({
  totalRecords,
  distinctDestinations,
  distinctPassports,
}: {
  totalRecords?: number;
  distinctDestinations?: number;
  distinctPassports?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  // Build the rotation: real verifiable stats first, then curated facts.
  const messages: Message[] = [];
  if (totalRecords && totalRecords > 0) {
    messages.push({
      id: "stat-records",
      emoji: "✅",
      text: `${totalRecords.toLocaleString()} visa rules verified · sourced from government portals`,
    });
  }
  if (distinctDestinations && distinctDestinations > 0 && distinctPassports && distinctPassports > 0) {
    messages.push({
      id: "stat-coverage",
      emoji: "🌐",
      text: `${distinctPassports} passports · ${distinctDestinations} destinations covered`,
    });
  }
  messages.push(...CURATED);

  // Mount: hydrate dismissal, show after a small delay so it doesn't
  // compete with the hero on first paint.
  useEffect(() => {
    try {
      const until = window.localStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < Number(until)) return;
    } catch {
      /* ignore */
    }
    // Pick a stable random starting index so concurrent users see
    // different first-messages — gives a sense of liveness without
    // fabricating activity.
    setIdx(Math.floor(Math.random() * messages.length));
    const showT = window.setTimeout(() => setVisible(true), 1500);
    const hideT = window.setTimeout(() => setVisible(false), HIDE_AFTER_MS);
    return () => {
      window.clearTimeout(showT);
      window.clearTimeout(hideT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotation loop while visible.
  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [visible, messages.length]);

  function dismiss() {
    setVisible(false);
    try {
      const until = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      window.localStorage.setItem(DISMISS_KEY, String(until));
    } catch {
      /* ignore */
    }
  }

  if (!visible || messages.length === 0) return null;
  const m = messages[idx % messages.length];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 z-40 max-w-[20rem] sm:max-w-sm pointer-events-auto"
    >
      <div className="flex items-start gap-2 rounded-full pl-3 pr-1.5 py-1.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border border-neutral-200 dark:border-neutral-800 shadow-lg text-xs">
        <Sparkles
          size={12}
          aria-hidden
          className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
        />
        <p className="flex-1 min-w-0 leading-snug text-neutral-800 dark:text-neutral-100">
          <span className="mr-1" aria-hidden>{m.emoji}</span>
          <span className="truncate">{m.text}</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss insights banner"
          className="shrink-0 rounded-full w-5 h-5 inline-flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X size={11} aria-hidden />
        </button>
      </div>
    </div>
  );
}
