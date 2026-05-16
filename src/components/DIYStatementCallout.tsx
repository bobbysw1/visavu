/**
 * DIY personal-statement callout — surfaces the /guides/diy-personal-statement
 * guide on result pages for high-stakes purposes (family / work / study).
 *
 * The single biggest money-saving lever for routine visa applications is
 * not paying £500–£3,000 for a solicitor to write your personal statement
 * when an AI prompt + the right skeleton gets you 90% of the way there.
 * This callout makes that path discoverable.
 *
 * Tone: helpful friend who's been through the process, not aggressive
 * upsell. Linked guide does the actual teaching.
 */
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Purpose } from "@/lib/types";

const HIGH_STAKES: Purpose[] = ["family", "work", "study"];

export function DIYStatementCallout({ purpose }: { purpose: Purpose }) {
  if (!HIGH_STAKES.includes(purpose)) return null;

  const verb =
    purpose === "family"
      ? "your partner-visa personal statement"
      : purpose === "work"
      ? "your work-visa letter of intent"
      : "your student-visa statement of purpose";

  return (
    <Link
      href="/guides/diy-personal-statement"
      className="block rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-blue-50/40 dark:from-emerald-950/30 dark:via-neutral-950 dark:to-blue-950/20 p-5 hover:border-emerald-400 dark:hover:border-emerald-700 transition"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 rounded-full bg-emerald-600 text-white p-2">
          <Sparkles size={14} aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300 mb-1">
            Save £500–£3,000 on lawyer fees
          </p>
          <p className="font-semibold text-base sm:text-lg leading-tight mb-1.5">
            Write {verb} yourself — we&apos;ll show you how.
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
            Six-section skeleton caseworkers actually want, copy-paste AI prompt for Claude /
            ChatGPT to neaten your draft, the exact legal phrases each authority looks for, and
            a clear list of when you SHOULD pay a lawyer instead.
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Open the DIY guide
            <ArrowRight size={13} aria-hidden />
          </p>
        </div>
      </div>
    </Link>
  );
}
