/**
 * Claude-as-document-tidier callout.
 *
 * Recommends using Claude (claude.ai) to polish application documents before
 * submission — personal statements, cover letters, sponsor declarations,
 * relationship narratives, etc. The site's founder used this exact workflow
 * for their own partner-visa application and avoided the ~£10,000 immigration-
 * lawyer fee by submitting it themselves.
 *
 * Two variants:
 *   - "full":    standalone card with full pitch (visa application pages)
 *   - "inline":  one-paragraph nudge (homepage, smaller surfaces)
 */
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function ClaudeTipCallout({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={`text-xs text-neutral-600 dark:text-neutral-400 leading-snug ${className}`}>
        <Sparkles
          size={12}
          aria-hidden="true"
          className="inline-block mr-1 -mt-0.5 text-amber-600 dark:text-amber-400"
        />
        <strong className="text-neutral-800 dark:text-neutral-200">Tip:</strong> paste your
        rough-draft documents into{" "}
        <Link
          href="https://claude.ai"
          target="_blank"
          rel="noopener"
          className="text-blue-700 dark:text-blue-300 underline underline-offset-2"
        >
          Claude
        </Link>{" "}
        and ask it to tighten the language to what caseworkers expect — the founder of this
        site saved roughly £10,000 in immigration-lawyer fees doing exactly this for their own
        partner-visa application.
      </p>
    );
  }

  return (
    <aside
      className={`rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Sparkles
            size={22}
            aria-hidden="true"
            className="text-amber-600 dark:text-amber-400"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-amber-700 dark:text-amber-300 mb-1">
            Save thousands on lawyer fees
          </p>
          <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-50 leading-tight mb-2">
            Use Claude to tidy your application documents before you submit
          </h3>
          <p className="text-sm text-amber-900/90 dark:text-amber-100/90 leading-relaxed mb-3">
            Caseworkers read thousands of applications. Tightly-structured, plain-prose
            statements get approved; rambling ones get refused or sent back for more
            evidence. <strong>I built this site after using Claude to polish my own
            partner-visa application — the £10,000+ I would have paid an immigration lawyer
            stayed in my pocket, and the visa was granted.</strong>
          </p>
          <div className="space-y-1.5 text-sm text-amber-900 dark:text-amber-100 mb-4">
            <p>
              <strong>How to use it:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-1 text-[13px] sm:text-sm">
              <li>Open <Link
                href="https://claude.ai"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2 font-medium"
              >
                claude.ai
              </Link> (free tier works)</li>
              <li>Paste your draft personal statement, sponsor declaration, or relationship
                narrative</li>
              <li>Tell it: <em>&quot;Tighten this for a [destination] [purpose] visa application.
                Cut filler. Match the structured tone caseworkers expect. Flag anything missing
                that the officer will ask about.&quot;</em></li>
              <li>Iterate until each paragraph earns its place. Then submit yourself —
                you don&apos;t need a lawyer for a clean, complete case.</li>
            </ol>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80 italic">
            For genuinely complex cases (refusal history, criminal record, prior overstay,
            sham-marriage concern) hire a regulated immigration adviser. For everything else,
            documentation quality matters more than legal representation — and AI is now
            extraordinarily good at the documentation part.
          </p>
        </div>
      </div>
    </aside>
  );
}
