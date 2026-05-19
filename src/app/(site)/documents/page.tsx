/**
 * /documents — index of every curated visa-forms entry.
 *
 * Grouped by destination, each card lists the programme name + the
 * number of curated forms + a direct link to the dedicated
 * destination-forms page (/documents/[iso]) for the full list with
 * download buttons.
 *
 * Also surfaces the "AI polish your forms" prompt that previously
 * lived as a standalone ClaudeTipCallout — now contextualised next
 * to the forms it actually applies to. The user explicitly asked to
 * integrate the prompt here rather than promote it as a banner.
 */
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import { flagEmoji, nameFor } from "@/lib/countries";
import { VISA_FORMS, destinationsWithForms } from "@/content/visaForms";

export const metadata = {
  title: "Visa forms library — download the actual government PDFs",
  description:
    "Curated index of the most-used visa application forms with direct links to the official government download pages. Australia Form 888, US I-130 / I-129F, UK Appendix FM-SE, Canada IMM 5532, Schengen application — everything for the top visa categories.",
  alternates: { canonical: absoluteUrl("/documents") },
};

export default function DocumentsHubPage() {
  const destIsos = destinationsWithForms();
  const totalForms = VISA_FORMS.reduce((acc, e) => acc + e.forms.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <p className="kicker">Visa forms library</p>
        <h1 className="serif-display text-4xl sm:text-5xl mt-2 mb-4">
          The actual government PDFs, with direct links.
        </h1>
        <p className="text-[var(--color-ink-muted)] text-lg leading-relaxed">
          Every visa programme has a stack of specific forms — Australia&apos;s
          Form 888 statutory declaration, the US I-130, Canada&apos;s IMM 5532
          relationship form, the UK&apos;s Appendix FM-SE financial rules. We
          link directly to the official government download page so you skip
          the consultant fee for &quot;here&apos;s the form&quot;.
        </p>
        <p className="text-sm text-[var(--color-ink-muted)] mt-3">
          {totalForms} curated forms across {destIsos.length} destinations.
          Re-verified quarterly against the official sources.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {destIsos.map((iso) => {
          const entries = VISA_FORMS.filter((e) => e.destinationIso2 === iso);
          const formCount = entries.reduce((acc, e) => acc + e.forms.length, 0);
          return (
            <Link
              key={iso}
              href={`/documents/${iso.toLowerCase()}`}
              className="
                block rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)]
                p-5 hover:border-[var(--color-ink)] hover:shadow-md transition group
              "
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl leading-none shrink-0" aria-hidden>
                  {flagEmoji(iso)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-lg text-[var(--color-ink)] leading-tight">
                    {nameFor(iso)}
                  </h2>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {entries.length} programme{entries.length === 1 ? "" : "s"} ·{" "}
                    {formCount} form{formCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm text-[var(--color-ink-muted)]">
                {entries.slice(0, 3).map((e) => (
                  <li key={e.programmeLabel} className="leading-snug">
                    — {e.programmeLabel.replace(/^[A-Za-z ]+ — /, "")}
                  </li>
                ))}
              </ul>
              <p className="text-xs font-medium text-[var(--color-ink)] mt-3 group-hover:underline underline-offset-2">
                View {nameFor(iso)} forms →
              </p>
            </Link>
          );
        })}
      </div>

      {/* ──── AI-polish-your-application prompt — contextualised here
              rather than as a banner pitch on every page. Surfaces only
              once, alongside the actual forms it helps with. */}
      <section className="mt-14 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-muted)]/40 p-6 sm:p-8">
        <p className="kicker mb-2">Polish before you submit</p>
        <h2 className="serif-display text-2xl sm:text-3xl font-medium mb-3 text-[var(--color-ink)]">
          A free way to tighten your application
        </h2>
        <p className="text-[var(--color-ink-muted)] leading-relaxed mb-4">
          Once you&apos;ve filled in the forms above, paste your draft
          personal-statement, relationship narrative, or sponsor declaration
          into any capable AI (Claude, ChatGPT, Mistral, Gemini — all have free
          tiers) and ask it to tighten the language to what caseworkers expect.
          The forms themselves are mechanical; the prose you attach is where
          most refusals happen.
        </p>
        <details className="rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] p-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink)]">
            The exact prompt to paste
          </summary>
          <pre className="mt-3 text-xs leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-wrap font-mono bg-[var(--color-muted)]/40 p-4 rounded">
{`I'm preparing a [destination — e.g. Australian Partner Visa Subclass 820]
application. Below is my draft [personal statement / relationship narrative
/ sponsor declaration]. Tighten it for a [destination] case officer:

  - Cut filler and repetition.
  - Match the structured, plain-prose tone caseworkers expect (no flowery
    language, no advocacy, no padding).
  - Flag anything missing that the officer will ask about (timeline gaps,
    inconsistent dates, unsupported claims).
  - Keep my actual voice — don't make it sound generated. Edit, don't
    re-write.
  - Aim for [target word count, e.g. ~600 words for an AU Form 888 stat-dec].

Here's my draft:

[PASTE YOUR TEXT HERE]`}
          </pre>
        </details>
        <p className="text-xs text-[var(--color-ink-muted)] italic mt-4">
          For complex cases (refusal history, criminal record, prior overstay,
          sham-marriage concern) hire a regulated immigration adviser. For
          everything else, documentation quality matters more than legal
          representation.
        </p>
      </section>

      <div className="mt-10 pt-8 border-t border-[var(--color-rule)] text-sm text-[var(--color-ink-muted)]">
        <p>
          Don&apos;t see your destination?{" "}
          <Link href="/contact" className="underline hover:no-underline">
            Tell us
          </Link>{" "}
          — we add curated forms libraries based on user demand.
        </p>
      </div>
    </div>
  );
}
