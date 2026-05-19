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

  const sortedDests = [...destIsos].sort((a, b) =>
    nameFor(a).localeCompare(nameFor(b)),
  );

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

        {/* Perspective clarifier — common user confusion is whether the
            forms are 'from your country' or 'for the country you're
            going to'. Spell it out. */}
        <div className="mt-5 rounded-lg border-l-4 border-[var(--color-accent)] bg-[var(--color-muted)]/40 px-4 py-3">
          <p className="text-sm text-[var(--color-ink)] leading-relaxed">
            <strong>What you&apos;re looking at:</strong> these are forms you
            file <em>to apply for a visa to that destination country</em>,
            regardless of your own nationality. A Danish or Indian or
            Australian applicant who wants to move to Canada all use the same
            IMM-series Canadian forms below.
          </p>
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] mt-3">
          {totalForms} curated forms across {sortedDests.length} destinations.
          Re-verified quarterly.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {sortedDests.map((iso) => {
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
                  {/* Full country name as the headline — never just the
                      iso2 code. User flagged: 'AU' on its own is confusing,
                      'Australia' is obvious. */}
                  <h2 className="font-semibold text-lg text-[var(--color-ink)] leading-tight">
                    {nameFor(iso)}
                  </h2>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    Forms to apply <em>to</em> {nameFor(iso)} ·{" "}
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

      {/* AI-polish prompt library now lives only on /tools — not duplicated
          here. Kept this page focused on the forms themselves. */}
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
