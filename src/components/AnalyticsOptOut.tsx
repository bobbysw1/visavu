"use client";

/**
 * Opt-out toggle for site analytics. Lives on /cookies (and anywhere
 * else it's useful — footer link goes to /cookies#analytics-control).
 *
 * Default state: analytics ENABLED. Clicking "Opt out" sets the
 * localStorage flag, immediately neutralises Plausible + GA on the
 * current page, and persists across reloads. Clicking "Opt back in"
 * removes the flag and reloads so the scripts initialise normally.
 */
import { useEffect, useState } from "react";
import { Check, BellOff, BellRing } from "lucide-react";
import { OPT_OUT_KEY } from "@/lib/analyticsConsent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-JVHR3D6YJQ";

export function AnalyticsOptOut() {
  const [optedOut, setOptedOut] = useState<boolean | null>(null); // null = pre-hydration

  useEffect(() => {
    try {
      setOptedOut(window.localStorage.getItem(OPT_OUT_KEY) === "true");
    } catch {
      setOptedOut(false);
    }
  }, []);

  function optOut() {
    try {
      window.localStorage.setItem(OPT_OUT_KEY, "true");
    } catch {
      /* ignore */
    }
    // Neutralise immediately for the rest of this session.
    type GADisable = Record<string, boolean>;
    type VisavuWin = Window & {
      __visavu_optout?: boolean;
      plausible?: (...args: unknown[]) => void;
    };
    const w = window as unknown as VisavuWin & GADisable;
    w[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    w.__visavu_optout = true;
    w.plausible = () => {};
    setOptedOut(true);
  }

  function optIn() {
    try {
      window.localStorage.removeItem(OPT_OUT_KEY);
    } catch {
      /* ignore */
    }
    // Reload so the analytics scripts re-initialise cleanly.
    window.location.reload();
  }

  if (optedOut === null) {
    return (
      <div className="not-prose rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-sm text-neutral-500">
        Loading consent status…
      </div>
    );
  }

  return (
    <div
      id="analytics-control"
      className="not-prose rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-5"
    >
      <div className="flex items-start gap-3">
        <span
          className={`shrink-0 rounded-full p-2 ${
            optedOut
              ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {optedOut ? <BellOff size={16} aria-hidden /> : <BellRing size={16} aria-hidden />}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">
            {optedOut ? "Analytics are off on this device." : "Analytics are on (default)."}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {optedOut
              ? "Plausible and Google Analytics are disabled on this browser. We won't see your page views or events. The setting is stored locally — clearing site data will reset it."
              : "We use Plausible (cookie-free, no cross-site identifiers) and Google Analytics 4 to understand which pages help and which don't. You can switch them off any time — we don't gate any content behind tracking."}
          </p>

          {optedOut ? (
            <button
              type="button"
              onClick={optIn}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check size={12} aria-hidden />
              Opt back in
            </button>
          ) : (
            <button
              type="button"
              onClick={optOut}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900"
            >
              <BellOff size={12} aria-hidden />
              Opt out of analytics
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
