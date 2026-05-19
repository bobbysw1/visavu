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

/**
 * Curated per-visa AI-polish prompt library.
 *
 * Each entry is tuned to the actual evidence + tone the named
 * caseworker is looking for — Australian DHA partner-visa case
 * officers want chronological cohabitation evidence linked to
 * Form 888 declarations; UK ECOs want the Appendix FM financial
 * requirement spelled out with named documents; US NVC officers
 * want bona-fide-marriage narrative for I-130 + the I-864
 * affidavit numbers reconciled. Generic "polish my application"
 * prompts can't produce this — these are the nuances.
 *
 * Keep entries to the top-traffic visa routes; the long tail is
 * handled by the chat assistant which can compose ad-hoc prompts.
 */
type VisaPrompt = {
  id: string;
  iso: string;
  label: string;
  context: string;
  prompt: string;
};

const VISA_PROMPTS: VisaPrompt[] = [
  {
    id: "au-partner-820",
    iso: "AU",
    label: "Australia — Partner Visa 820/801 + 309/100 (Form 888 + relationship narrative)",
    context:
      "DHA case officers want chronological, source-cited cohabitation evidence (lease, joint utilities, joint finances, photos, travel, social recognition) — not romantic prose. Form 888 statutory declarations from witnesses must each tell the officer how the witness knows the couple and on what occasions.",
    prompt: `I'm preparing an Australian Partner Visa Subclass [820/801 onshore | 309/100 offshore]
application under Migration Regulations Schedule 2. Below is my draft
[relationship statement / Form 888 statutory declaration / cohabitation timeline].

Tighten it for a Department of Home Affairs case officer assessing genuineness
under the four statutory pillars (financial aspects, nature of household,
social aspects, nature of commitment):

  - Re-order chronologically (date — event — corroborating evidence) so the
    officer can map claims to attached evidence without hunting.
  - Strip all romantic/emotive language. DHA officers explicitly discount it.
    Replace with concrete facts: joint lease dates, joint bank account opening
    date, joint bills in both names, travel dates with both passports stamped.
  - For Form 888 witness declarations, ensure the witness states (a) how long
    they have known each party, (b) the specific occasions they have witnessed
    the relationship, (c) why they believe the relationship is genuine — in
    that order. Officers reject Form 888s that read like character references.
  - Flag any 12-month-cohabitation gap (for de facto), any inconsistency with
    the Form 47SP timeline, and any claim not backed by an attached document.
  - Keep my actual voice. Edit, don't ghostwrite.

Aim for: relationship statement ~1500 words, each Form 888 ~400-600 words.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "uk-spouse-fm",
    iso: "GB",
    label: "UK — Spouse / Partner Visa (Appendix FM + Appendix FM-SE financial evidence)",
    context:
      "UK Entry Clearance Officers apply the Appendix FM-SE financial requirement mechanically — Category A salaried = 6 months payslips + bank statements showing the salary credited + employer letter on letterhead dated within 28 days. Get one document wrong and you get a refusal with a 28-day reapplication window.",
    prompt: `I'm preparing a UK [Spouse / Unmarried Partner / Fiancé] visa application
under Appendix FM (Family Members) of the Immigration Rules. Below is my draft
[relationship statement / sponsor letter / Appendix FM-SE financial evidence
covering letter].

Tighten it for a UKVI Entry Clearance Officer applying the rules mechanically:

  - For the financial requirement section, name the specific Category
    (A — salaried, B — variable salaried, D — cash savings ≥ £88,500, F/G —
    self-employment) and list each Appendix FM-SE paragraph 2 document by
    name (payslips, bank statements, employer letter, P60). ECOs refuse on
    missing-named-document, not on insufficient money.
  - For the relationship section, address the four genuineness factors:
    duration, knowledge of each other's circumstances, plans for living
    together in the UK, intention to live together permanently.
  - Flag any 30-day window where the sponsor's earnings dropped below the
    £29,000 (or post-2024 £38,700 once phased) minimum — ECOs spot this.
  - Confirm the English language requirement is met by named test + date
    or by exempting nationality + qualification.
  - Plain UK English. No US spellings. No legal advocacy — just clear
    factual statements aligned to the rules.

Aim for: relationship statement ~800 words, financial covering letter
~400 words referencing each document by paragraph number.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "uk-skilled-worker",
    iso: "GB",
    label: "UK — Skilled Worker visa (Certificate of Sponsorship cover + personal statement)",
    context:
      "Skilled Worker is points-based: 70 points = job offer (20) + sponsor licence (20) + skill level RQF 3+ (20) + English (10). Plus salary threshold currently £38,700 (with going-rate exceptions). The cover letter should map evidence to each point.",
    prompt: `I'm preparing a UK Skilled Worker visa application. My sponsor has issued
a Certificate of Sponsorship under occupation code [SOC code, e.g. 2136
Programmers and software development professionals] at salary £[amount].

Below is my draft [personal statement / cover letter / supplementary
information].

Tighten it for a UKVI caseworker scoring the application against the
70-point threshold:

  - Map evidence explicitly to each tradeable + non-tradeable point: CoS
    number, sponsor licence number, occupation skill level (RQF 3+),
    salary vs going rate, English language (test or exemption).
  - For salary, state both the actual salary and the applicable going
    rate (per the published occupation-code table) and the higher of the
    two thresholds being met. Do not claim a "going rate" tradeable point
    if not eligible — it's the #1 refusal reason.
  - Flag any gap between visa start date and CoS start date >3 months.
  - Confirm maintenance funds (£1,270 held 28 days, unless A-rated
    sponsor certifies on CoS).
  - Plain UK English, no marketing language about the role.

Aim for: ~500-700 words.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "us-k1-fiance",
    iso: "US",
    label: "US — K-1 Fiancé(e) visa (I-129F + bona-fide-relationship evidence)",
    context:
      "USCIS + the consular officer at the embassy interview both want bona-fide-relationship proof: in-person meeting within 2 years (with proof — passport stamps, hotel receipts, flight itineraries), intent to marry within 90 days of entry, and freedom to marry (divorce decrees if prior marriage). Statement should be petitioner-narrated.",
    prompt: `I'm preparing a US K-1 Fiancé(e) visa application. The US citizen
petitioner is filing Form I-129F with USCIS, after which the beneficiary will
be interviewed at the US embassy in [country].

Below is my draft [petitioner's statement of meeting + relationship /
beneficiary's letter of intent to marry / cover letter for I-129F packet].

Tighten it for a USCIS officer + consular officer assessing bona fides:

  - Establish the in-person-meeting-within-2-years requirement up front
    with dates and corroborating evidence (passport stamps, flight
    itineraries, hotel bookings). This is the threshold question.
  - Narrate how the relationship developed: how you met, frequency of
    communication, in-person visits, family/friends who know the couple.
  - State both parties' freedom to marry — if either has a prior marriage,
    name the divorce decree + date.
  - State intent to marry within 90 days of K-1 entry, named city/county
    where the marriage will take place.
  - Avoid red flags consular officers train on: large age gap with no
    explanation, no shared language without explanation, no in-person time,
    rapid escalation. If any of these are present, address them factually
    rather than hoping the officer doesn't notice.
  - US English. Direct, factual, chronological.

Aim for: petitioner statement ~800-1200 words.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "us-i130-spouse",
    iso: "US",
    label: "US — I-130 Spouse Petition + I-864 Affidavit of Support",
    context:
      "I-130 establishes the bona fide marriage; I-864 is the financial commitment from the US-citizen sponsor (must be at 125% of poverty guidelines for household size). Numbers on the I-864 must reconcile with tax transcripts.",
    prompt: `I'm preparing a US I-130 Petition for Alien Relative for my spouse, plus
the I-864 Affidavit of Support. Below is my draft [bona-fide marriage
narrative / I-864 cover letter explaining the numbers].

Tighten it for a USCIS officer + NVC reviewer:

  - Bona-fide marriage narrative: cover (a) how/when met, (b) courtship +
    cohabitation timeline, (c) joint life evidence (joint lease, joint bank
    accounts, joint utilities, joint tax filing, joint health insurance,
    photos with shared family/friends, travel together). Each claim must
    map to an attached exhibit.
  - I-864 narrative: state household size including the intending immigrant,
    state the 125% poverty guideline number for that household size for the
    current year, state current annual income, state which of the last 3
    tax-year transcripts are attached and reconcile to the income claim.
  - If using a joint sponsor or assets, explain the substitution mechanic
    explicitly (3:1 asset-to-income ratio for spouses; 5:1 for others).
  - Flag any income drop > 20% between tax-year transcripts; NVC will ask.
  - No advocacy / no emotional appeals. Numbers reconciled, evidence cited.

Aim for: bona-fide marriage narrative ~1000-1500 words; I-864 cover letter
~400 words.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "ca-express-entry-loe",
    iso: "CA",
    label: "Canada — Express Entry Letter of Explanation (LOE)",
    context:
      "IRCC officers are well known for refusing on missing-document or unexplained-gap grounds. The LOE pre-empts the predictable concerns: address gaps in work history, explain any awards letter reference codes, justify NOC code selection, explain education credential assessment (ECA) mapping.",
    prompt: `I'm preparing an Express Entry application with [CRS score] under
[Federal Skilled Worker / Canadian Experience Class / Federal Skilled Trades].
My NOC TEER classification is [code, e.g. 21231 Software engineers]; my
primary occupation evidence is [employer reference letter / contract / pay
records].

Below is my draft Letter of Explanation (LOE) for the application.

Tighten it for an IRCC officer reviewing the e-APR:

  - Pre-empt the predictable refusal reasons: (a) work-history gaps > 30
    days, (b) NOC TEER selection vs job-duty match, (c) ECA report mapping
    to claimed education, (d) any IELTS/CELPIP score discrepancy with
    claimed language points, (e) settlement funds source if claimed.
  - For NOC alignment, quote the actual NOC lead statement + main duties
    and map your employer reference letter to each duty using the same
    language. Officers compare these verbatim.
  - For settlement funds, explain the source if not your own salary
    (gift letter, sale of property — with documents).
  - For any criminal-history / medical disclosure, address upfront with
    facts — concealment is a 5-year ban.
  - Tone: formal, factual, paragraph-numbered. Canadian English.

Aim for: ~600-1000 words depending on complexity.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "ca-spousal-sponsorship",
    iso: "CA",
    label: "Canada — Spousal Sponsorship (IMM 5532 Relationship Information)",
    context:
      "IMM 5532 asks the sponsor + applicant to independently describe how the relationship started, key dates, and shared knowledge. IRCC compares the two answers — inconsistencies trigger a Procedural Fairness Letter.",
    prompt: `I'm preparing a Canadian Spousal Sponsorship application
[inland — open work permit eligible / outland]. The IMM 5532 Relationship
Information form requires independent narratives from sponsor + applicant.

Below is my draft [IMM 5532 narrative / sponsor letter / Schedule A].

Tighten it for an IRCC officer comparing sponsor + applicant answers:

  - For IMM 5532 specifically: ensure the chronology of first meeting,
    progression of the relationship, and decision to marry/cohabit is
    consistent down to the dates and locations. IRCC cross-references
    sponsor + applicant copies; inconsistencies trigger a Procedural
    Fairness Letter or refusal for misrepresentation.
  - Provide concrete evidence of genuineness IRCC asks for: joint
    finances (joint accounts with statements showing both names), joint
    residence (lease + utility bills in both names), travel together
    (boarding passes/passport stamps), family recognition (declarations
    from each side's family), and ongoing communication (call logs,
    chat history samples — not screenshots of love messages, but
    routine daily-life conversation).
  - Address any complicating factors directly: prior marriages (with
    divorce decrees), age gap, cultural-arranged-marriage pattern,
    rapid timeline, no cohabitation — IRCC officers train on these and
    silence on them reads as concealment.
  - Plain Canadian English. No legal language unless quoting IRPA.

Aim for: each IMM 5532 narrative ~800-1200 words.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "schengen-visit",
    iso: "FR",
    label: "Schengen visa — cover letter + intent-to-return evidence",
    context:
      "Schengen consulates (esp. France, Germany, Italy, Spain, Netherlands) refuse on insufficient ties-to-home / unclear travel purpose. The cover letter should pre-empt both. Format: dated, addressed to the consulate, signed.",
    prompt: `I'm preparing a Schengen short-stay visa application (Type C, max 90
days in 180) to the [country, e.g. France] consulate, primary purpose
[tourism / business / family visit]. Travel dates: [DD/MM/YYYY] to [DD/MM/YYYY].

Below is my draft cover letter.

Tighten it for a Schengen consular officer applying the EU Visa Code
(Regulation 810/2009) and pre-empt the two main refusal grounds — Article
32(1)(b) (purpose + conditions of stay not justified) and Article 32(1)(b)
(intention to leave before visa expires not established):

  - Header: addressed to the [country] embassy/consulate in [home city],
    dated, signed at the end.
  - State purpose unambiguously in the first paragraph with named places +
    dates aligned to the booked itinerary (hotels, flights — name the
    booking refs).
  - Establish ties to home country with named, verifiable evidence: current
    employer (letter attached confirming leave dates + return), property/
    rental, dependants, ongoing study, business obligations.
  - State who is paying — self / sponsor — and reference the attached
    bank statements (last 3 months) showing the requested funds covering
    €[amount] (≥ €50-100 per day depending on country guidance).
  - State travel insurance: provider, policy number, coverage ≥ €30,000,
    valid across all Schengen states for the requested dates.
  - For family-visit applications: name the host, attach the host's
    invitation letter + proof of legal residence + proof of relationship.
  - Tone: formal, concise, factual. One page maximum.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "nz-resident-svc",
    iso: "NZ",
    label: "New Zealand — Skilled Migrant Category EOI + ITA application",
    context:
      "INZ reformatted SMC to a 6-points threshold in late 2023. Officers want the points claim mapped to the qualifying basis: registration, qualification, NZ work experience, or income.",
    prompt: `I'm preparing a New Zealand Skilled Migrant Category Resident Visa
application. My EOI claims [N] points under [Pathway 1 — NZ-registered
occupation / Pathway 2 — qualification / Pathway 3 — NZ work experience /
Pathway 4 — income].

Below is my draft [personal statement / cover letter / supplementary
evidence document].

Tighten it for an INZ officer assessing the points claim:

  - Map every claimed point to its documentary basis: registration
    certificate + scope of practice (Pathway 1), NZQA qualification
    recognition (Pathway 2), IRD records of NZ employment + employer
    letter (Pathway 3), salary records (Pathway 4).
  - For occupation claims, ensure the role matches the ANZSCO code at
    Skill Level 1, 2, or 3 with the actual day-to-day duties stated in
    the employer reference letter — INZ verifies match against ANZSCO
    description.
  - Address health + character pro-actively: state medicals + police
    certificates from each country lived >12 months in last 10 years.
  - For partner / dependent inclusion, name each and state the
    qualifying relationship + supporting evidence.
  - NZ English. Direct, no legal advocacy.

Aim for: ~600-1000 words.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
  {
    id: "au-skilled-189",
    iso: "AU",
    label: "Australia — Skilled Independent 189 (skill assessment + Form 80)",
    context:
      "DHA officers want consistency between the skill assessment report (e.g. ACS for IT, Engineers Australia for engineers), Form 80 (10-year history), and your employment evidence. Form 80 inconsistencies are the #1 refusal trigger.",
    prompt: `I'm preparing an Australian Skilled Independent Subclass 189 application
following a positive [skills assessing authority, e.g. ACS / Engineers
Australia / VETASSESS] assessment for occupation code [ANZSCO code]. My
points-test claim is [N] points.

Below is my draft [Form 80 sections / personal statement / supplementary
information on employment].

Tighten it for a DHA case officer cross-referencing the skills assessment,
Form 80, and employment evidence:

  - Form 80 demands 10-year address + employment + travel history. Ensure
    NO gaps > 14 days unexplained. Ensure each employer matches the
    employer named in the skills assessment with identical dates.
  - For points claims (age, English, skilled employment, qualifications,
    Australian study, partner skills, NAATI, regional study, professional
    year), map each to documentary evidence by name + date issued.
  - For overseas-skilled-employment points (max 15), ensure each role
    claimed is at the same/closely related ANZSCO code as the assessed
    occupation — DHA discounts roles outside scope.
  - Address any prior visa refusal/cancellation in any country up front —
    Question 22 of Form 80 is a known refusal trap for omissions.
  - Plain Australian English. Factual. No advocacy.

Aim for: supplementary explanation ~500-800 words; Form 80 entries should
match attached documents exactly.

Here's my draft:

[PASTE YOUR TEXT HERE]`,
  },
];

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

      {/* ── 3. AI-POLISH PROMPT LIBRARY ──
          Rewritten per user feedback: no amber border / no big callout
          box / not a single master prompt. Plain-text intro that
          explains the value, followed by a quiet collapsible library
          of per-visa prompts — each tuned to the actual evidence
          requirements + tone caseworkers expect for that specific
          subclass. Generic "polish my application" prompts are AI
          slop; partner-visa relationship narratives have completely
          different requirements from skilled-worker cover letters or
          Schengen visit declarations. */}
      <section id="ai-polish" className="mb-14">
        <p className="kicker">AI polish</p>
        <h2 className="serif-display text-2xl sm:text-3xl mt-1 mb-3 font-medium">
          Use AI to tighten your written sections
        </h2>
        <p className="text-[var(--color-ink-muted)] leading-relaxed max-w-3xl mb-3">
          For relatively straightforward cases, you can save thousands on
          lawyer fees by using AI to polish the prose sections of your
          application — personal statements, relationship narratives,
          sponsor declarations, cover letters. Caseworkers read thousands
          of these; tight, plain prose gets approved, rambling drafts get
          sent back for more evidence. Any capable AI works —{" "}
          <a href="https://claude.ai" target="_blank" rel="noopener" className="underline hover:no-underline text-[var(--color-ink)]">Claude</a>,
          ChatGPT, Gemini, Mistral — all have free tiers.
        </p>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed max-w-3xl mb-5">
          Below are visa-specific prompts. Generic prompts produce generic
          output — these are written for the actual evidence the named
          caseworker is looking for.
        </p>

        <ul className="divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)]">
          {VISA_PROMPTS.map((p) => (
            <li key={p.id}>
              <details className="group">
                <summary className="cursor-pointer py-3 flex items-baseline justify-between gap-3 hover:text-[var(--color-ink)] transition list-none">
                  <span className="flex items-baseline gap-2 min-w-0">
                    <span className="text-base leading-none" aria-hidden>
                      {flagEmoji(p.iso)}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-ink)] truncate">
                      {p.label}
                    </span>
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)] shrink-0 group-open:hidden">
                    Show prompt →
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)] shrink-0 hidden group-open:inline">
                    Hide
                  </span>
                </summary>
                <div className="pb-4 pl-6">
                  <p className="text-xs text-[var(--color-ink-muted)] mb-2 leading-relaxed">
                    {p.context}
                  </p>
                  <pre className="text-xs leading-relaxed text-[var(--color-ink)] whitespace-pre-wrap font-mono bg-[var(--color-muted)]/40 p-3 rounded">
{p.prompt}
                  </pre>
                </div>
              </details>
            </li>
          ))}
        </ul>

        <p className="text-xs text-[var(--color-ink-muted)] italic mt-4 max-w-3xl">
          For complex cases — refusal history, criminal record, prior
          overstay, sham-marriage flags, appeals — hire a regulated
          immigration adviser. For everything else, documentation quality
          matters more than legal representation.
        </p>
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
