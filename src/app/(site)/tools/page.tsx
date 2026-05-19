/**
 * /tools — single consolidated page bundling every user-facing
 * tool/resource on the site: AI chat, visa forms library, myths,
 * application guides, the Claude prompt + claude.ai link, the
 * smart questionnaire, and an info section that explains how each
 * tool fits together.
 *
 * The user explicitly asked for this — myths + chat + Claude
 * recommendation + info, all on one page, so they're not scattered
 * across the nav. The Tools dropdown in the header now points here
 * as well as keeping the individual destinations.
 */
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import { flagEmoji } from "@/lib/countries";
import { VISA_FORMS, destinationsWithForms } from "@/content/visaForms";
import { MYTHS } from "@/content/myths";
import { GUIDES } from "@/content/guides";

export const metadata = {
  title: "Visa tools — AI assistant, forms library, myths, guides",
  description:
    "Every Visavu tool in one place: the AI visa assistant, the curated forms library with direct gov download links, the visa-myths fact-check, application guides, and the personalised questionnaire.",
  alternates: { canonical: absoluteUrl("/tools") },
};

export default function ToolsPage() {
  const destIsos = destinationsWithForms();
  const totalForms = VISA_FORMS.reduce((acc, e) => acc + e.forms.length, 0);
  const recentMyths = MYTHS.slice(0, 6);
  const featuredGuides = GUIDES.slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-12">
        <p className="kicker">Tools</p>
        <h1 className="serif-display text-4xl sm:text-5xl mt-2 mb-4">
          Every Visavu tool, in one place.
        </h1>
        <p className="text-[var(--color-ink-muted)] text-lg leading-relaxed max-w-3xl">
          The AI assistant, the forms library, the myths fact-check, the
          application guides, the personalised questionnaire, the visa-news
          digest, and the free-AI-document-polish prompt. Everything you need
          for an unaided visa application, with no consultant fee.
        </p>
      </header>

      {/* ── 1. AI VISA ASSISTANT ── */}
      <section id="chat" className="mb-14">
        <div className="rounded-2xl border border-[var(--color-rule)] bg-gradient-to-br from-[var(--color-paper-elev)] to-[var(--color-muted)]/40 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="min-w-0">
              <p className="kicker">AI assistant</p>
              <h2 className="serif-display text-2xl sm:text-3xl mt-1 font-medium">
                Ask anything — grounded in our verified visa data
              </h2>
            </div>
            <Link
              href="/chat"
              className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2 text-sm font-semibold hover:opacity-90 transition"
            >
              Open chat →
            </Link>
          </div>
          <p className="text-[var(--color-ink-muted)] leading-relaxed mb-3">
            Vague questions get clarifying questions back, not generic visa
            lists. Specific questions get specific answers with the visa code,
            fee in your local currency, processing time, and a link back to
            our verified destination page. Won&apos;t link to competitors,
            won&apos;t invent fees, will refuse asylum/criminal-record cases
            and refer to a regulated adviser.
          </p>
          <div className="text-xs text-[var(--color-ink-muted)] flex flex-wrap gap-3">
            <span>· Powered by Mistral Large</span>
            <span>· Bilateral-context aware (FTA / Schengen / Mercosur / CPLP)</span>
            <span>· Links only to visavu.com + official .gov sources</span>
          </div>
        </div>
      </section>

      {/* ── 2. FORMS LIBRARY ── */}
      <section id="forms" className="mb-14">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="kicker">Forms library</p>
            <h2 className="serif-display text-2xl sm:text-3xl mt-1 font-medium">
              {totalForms} government PDFs across {destIsos.length} destinations
            </h2>
          </div>
          <Link
            href="/documents"
            className="text-sm font-medium text-[var(--color-ink)] hover:opacity-80 underline-offset-2 hover:underline"
          >
            Browse all →
          </Link>
        </div>
        <p className="text-[var(--color-ink-muted)] leading-relaxed mb-5 max-w-3xl">
          Every entry points at the OFFICIAL government download page — Form
          888 for Australian partner-visa stat-decs, I-130 for US family
          immigration, IMM 5532 for Canadian spousal sponsorship, Appendix
          FM-SE for UK family financials. Skip the consultant fee for
          &quot;here&apos;s the form&quot;.
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {destIsos.map((iso) => {
            const entries = VISA_FORMS.filter((e) => e.destinationIso2 === iso);
            const count = entries.reduce((acc, e) => acc + e.forms.length, 0);
            return (
              <li key={iso}>
                <Link
                  href={`/documents/${iso.toLowerCase()}`}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-elev)] px-3 py-2 hover:border-[var(--color-ink)] hover:shadow-sm transition text-sm"
                >
                  <span className="text-lg leading-none" aria-hidden>{flagEmoji(iso)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-[var(--color-ink)] truncate">{iso}</span>
                    <span className="block text-[10px] text-[var(--color-ink-muted)]">{count} forms</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 3. CLAUDE-POLISH PROMPT ── */}
      <section id="ai-polish" className="mb-14">
        <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4 flex-wrap mb-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-amber-700 dark:text-amber-300 mb-1">
                Save thousands on lawyer fees
              </p>
              <h2 className="serif-display text-2xl sm:text-3xl font-medium text-amber-950 dark:text-amber-50">
                Polish your forms before you submit
              </h2>
            </div>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600 text-amber-50 px-5 py-2 text-sm font-semibold transition"
            >
              Open Claude ↗
            </a>
          </div>
          <p className="text-amber-900/90 dark:text-amber-100/90 leading-relaxed mb-4">
            Once you&apos;ve drafted your personal statement, sponsor
            declaration, relationship narrative, or stat-dec, paste it into
            any capable AI — <a href="https://claude.ai" target="_blank" rel="noopener" className="underline font-medium hover:no-underline">Claude</a>,
            ChatGPT, Gemini, Mistral; all have free tiers — with the prompt
            below. Caseworkers read thousands of applications. Tight, plain
            prose gets approved; rambling drafts get refused or sent back for
            more evidence.
          </p>
          <details className="rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-amber-950/60 p-4">
            <summary className="cursor-pointer text-sm font-medium text-amber-950 dark:text-amber-50">
              The paste-ready prompt →
            </summary>
            <pre className="mt-3 text-xs leading-relaxed text-amber-950 dark:text-amber-50 whitespace-pre-wrap font-mono bg-amber-100/60 dark:bg-amber-950/80 p-4 rounded">
{`I'm preparing a [destination — e.g. Australian Partner Visa Subclass 820]
application. Below is my draft [personal statement / relationship narrative
/ sponsor declaration / Form 888 stat-dec]. Tighten it for a [destination]
case officer:

  - Cut filler and repetition.
  - Match the structured, plain-prose tone caseworkers expect (no flowery
    language, no advocacy, no padding).
  - Flag anything missing that the officer will ask about (timeline gaps,
    inconsistent dates, unsupported claims).
  - Keep my actual voice — don't make it sound generated. Edit, don't
    re-write.
  - Aim for [target word count, e.g. ~600 words for an AU Form 888].

Here's my draft:

[PASTE YOUR TEXT HERE]`}
            </pre>
          </details>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/80 italic mt-4">
            For complex cases (refusal history, criminal record, prior
            overstay, sham-marriage concern) hire a regulated immigration
            adviser. For everything else, documentation quality matters more
            than legal representation.
          </p>
        </div>
      </section>

      {/* ── 4. FIND MY VISA ── */}
      <section id="find-my-visa" className="mb-14">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="kicker">Personalised questionnaire</p>
            <h2 className="serif-display text-2xl sm:text-3xl mt-1 font-medium">
              Find my visa
            </h2>
          </div>
          <Link
            href="/find-my-visa"
            className="text-sm font-medium text-[var(--color-ink)] hover:opacity-80 underline-offset-2 hover:underline"
          >
            Start the wizard →
          </Link>
        </div>
        <p className="text-[var(--color-ink-muted)] leading-relaxed max-w-3xl">
          12-step questionnaire — nationality, destination, goal, education,
          occupation, income, family, languages, timeline. Smart-skip means
          short-stay tourists get 5 questions; full-relocation HNWIs get all
          12. Output: five ranked lists (best pathways / easiest / fastest /
          cheapest / best PR routes) with the specific visa names + your
          eligibility for each.
        </p>
      </section>

      {/* ── 5. MYTHS ── */}
      <section id="myths" className="mb-14">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="kicker">Myths fact-check</p>
            <h2 className="serif-display text-2xl sm:text-3xl mt-1 font-medium">
              Things people get wrong about visas
            </h2>
          </div>
          <Link
            href="/myths"
            className="text-sm font-medium text-[var(--color-ink)] hover:opacity-80 underline-offset-2 hover:underline"
          >
            All myths →
          </Link>
        </div>
        <ul className="grid sm:grid-cols-2 gap-3">
          {recentMyths.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/myths/${m.slug}`}
                className="block h-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-4 hover:border-[var(--color-ink)] hover:shadow-sm transition"
              >
                <p className="text-sm font-medium text-[var(--color-ink)] leading-snug">
                  {m.question}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-2 line-clamp-2">
                  {m.headline}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 6. GUIDES ── */}
      <section id="guides" className="mb-14">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="kicker">Application guides</p>
            <h2 className="serif-display text-2xl sm:text-3xl mt-1 font-medium">
              Step-by-step walkthroughs
            </h2>
          </div>
          <Link
            href="/guides"
            className="text-sm font-medium text-[var(--color-ink)] hover:opacity-80 underline-offset-2 hover:underline"
          >
            All guides →
          </Link>
        </div>
        <ul className="grid sm:grid-cols-2 gap-3">
          {featuredGuides.map((g) => (
            <li key={g.frontmatter.slug}>
              <Link
                href={`/guides/${g.frontmatter.slug}`}
                className="block h-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-4 hover:border-[var(--color-ink)] hover:shadow-sm transition"
              >
                <p className="text-sm font-semibold text-[var(--color-ink)] leading-snug mb-1">
                  {g.frontmatter.title}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] line-clamp-2">
                  {g.frontmatter.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 7. HOW THIS WORKS ── */}
      <section id="how-it-works" className="border-t border-[var(--color-rule)] pt-10">
        <p className="kicker mb-3">How this works</p>
        <h2 className="serif-display text-2xl sm:text-3xl mb-5 font-medium">
          The workflow we suggest
        </h2>
        <ol className="space-y-4 text-[var(--color-ink-muted)] leading-relaxed">
          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] grid place-items-center text-xs font-bold">1</span>
            <p>
              <strong className="text-[var(--color-ink)]">Start with the chat or the questionnaire.</strong> The chat is faster for specific questions
              (&quot;UK passport, 26, what&apos;s the easiest way to Australia?&quot;); the questionnaire is better when you don&apos;t know what you&apos;re looking for.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] grid place-items-center text-xs font-bold">2</span>
            <p>
              <strong className="text-[var(--color-ink)]">Read the rules on the destination + pair page.</strong> Every (passport × destination) combination
              has a dedicated page with the difficulty + realism scoring, fee, processing time, and country-specific
              obstacles surfaced by our adapters.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] grid place-items-center text-xs font-bold">3</span>
            <p>
              <strong className="text-[var(--color-ink)]">Download the actual forms from the forms library.</strong> Each visa programme has its specific
              government forms linked above. We point at the official download page so your version is always current.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] grid place-items-center text-xs font-bold">4</span>
            <p>
              <strong className="text-[var(--color-ink)]">Use Claude (or any AI) to polish your written sections.</strong> Personal statements,
              relationship narratives, sponsor declarations — paste the draft + our prompt + iterate. The forms
              themselves are mechanical; the prose is where most refusals happen.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] grid place-items-center text-xs font-bold">5</span>
            <p>
              <strong className="text-[var(--color-ink)]">Submit yourself.</strong> For 90%+ of cases this is genuinely all you need. The exceptions:
              prior refusals, criminal records, complex sham-marriage flags, or appeals — those need a regulated
              immigration adviser, not generic advice.
            </p>
          </li>
        </ol>

        <div className="mt-8 p-5 rounded-xl bg-[var(--color-muted)]/40 border border-[var(--color-rule)]">
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            <strong className="text-[var(--color-ink)]">Visavu is information, not advice.</strong> We don&apos;t
            represent you, we don&apos;t take a cut of your visa fee, we don&apos;t sell &quot;application packages&quot;.
            We&apos;re the index + the tools. Where regulated representation is genuinely required we refer out
            (IAA-registered for UK, MARA for AU, CICC for CA, state-bar-admitted attorney for US).
          </p>
        </div>
      </section>
    </div>
  );
}
