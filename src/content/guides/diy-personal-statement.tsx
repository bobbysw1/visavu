import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "diy-personal-statement",
  title: "Write your visa personal statement yourself — save £500–£3,000 on lawyer fees",
  summary:
    "Step-by-step guide to writing the personal statement / letter of intent for partner, work, study and skilled-migration visas. Includes a copy-paste prompt for Claude or ChatGPT, the six-section skeleton caseworkers actually want, and the exact phrases that change refusal rates.",
  author: "Visavu editorial",
  publishedAt: "2026-05-16",
  modifiedAt: "2026-05-16",
  tags: ["DIY application", "Personal statement", "Money-saving"],
  readingMinutes: 12,
  // No single country owns the personal-statement topic; use the UK
  // hero since UK Spouse / Skilled Worker drove a lot of the source
  // research behind this guide.
  heroIso2: "GB",
};

export default function DIYPersonalStatementGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        The single biggest cost in most visa applications isn&apos;t the government fee — it&apos;s
        the £500–£3,000 a UK immigration solicitor will charge to write your personal statement.
        That fee is real value when your case is complex (criminal record, prior refusals, weird
        sponsor income, dependent children from different relationships) but for a routine
        application it&apos;s pure margin. This guide shows you how to write the statement yourself
        with help from Claude or any other capable AI, and ship an application a caseworker is
        going to wave through.
      </p>

      <h2>Why personal statements matter</h2>
      <p>
        Caseworkers see thousands of applications. They have a checklist and they have a feel for
        what a genuine application looks like. The personal statement does two jobs: it walks the
        caseworker through the evidence bundle in a logical order, and it pre-empts the questions
        a sceptical reader is going to ask. A confused or contradictory statement does damage
        that strong evidence can&apos;t fully undo.
      </p>
      <p>
        For partner / spouse visas, the statement is essentially your defence against the
        marriage-of-convenience accusation that every caseworker is trained to look for. For work
        / skilled-migration visas, the statement explains how your CV maps onto the role and why
        you specifically (not someone cheaper from the local labour market) are the right hire.
        For study visas, it shows the consular officer you&apos;ll go home after the course ends —
        the &ldquo;genuine student&rdquo; test that has tripped up countless qualified applicants.
      </p>

      <h2>The six-section skeleton that works for every visa type</h2>
      <p>
        Caseworkers want a linear narrative with concrete dates. Vague timelines and feelings
        beat nothing, but they don&apos;t beat &ldquo;in March 2022 I started a Master&apos;s at Imperial; I
        moved into my partner&apos;s flat in Wimbledon on 12 August 2022; we registered our
        relationship on 4 February 2024; our joint Wise account was opened on 22 April 2024.&rdquo;
        Specificity is what reads as truth.
      </p>

      <h3>1. How we met / how I encountered this opportunity</h3>
      <p>
        Date, place, context. Lead with the concrete moment. For partner visas: introduction
        circumstances (mutual friend, dating app, study abroad, work — all fine, just specify).
        For work visas: how the role was advertised, when you first interviewed, when the offer
        arrived. For study visas: when you started researching the course, why this specific
        institution.
      </p>

      <h3>2. Development — the dated timeline of milestones</h3>
      <p>
        For relationships: first date, first official couple status, first meeting of each
        other&apos;s families, first long trip together. For work: how the role evolved through
        interview rounds, salary negotiation, start date. For study: institution shortlist,
        offer received, deposit paid, accommodation arranged. Annotate every milestone with the
        exact month and year. Long-distance or remote periods need explicit handling — say
        plainly what kept the relationship / arrangement intact during gaps.
      </p>

      <h3>3. The substantive proof point</h3>
      <p>
        For partner visas: cohabitation start (precise date, address), tenancy / mortgage
        arrangement, joint financial pooling. For work: CV-to-role match, why your specific
        skills justify the salary, prior employer references. For study: financial sponsor, course
        cost breakdown, accommodation arranged, prior academic record.
      </p>

      <h3>4. The destination-specific evidence</h3>
      <p>
        What does your application bring that aligns with the destination&apos;s rules? For UK Spouse:
        you meet the £29,000 financial requirement (or savings substitute). For Australian Partner:
        you&apos;ve registered the relationship with NSW BDM (state register) OR you have 12+ months of
        documented cohabitation. For US CR-1: legally valid marriage in a recognised jurisdiction
        with bona-fide evidence. For Canadian Express Entry: CRS score with the breakdown.
      </p>

      <h3>5. Future plans — where you&apos;ll live and what you&apos;ll do</h3>
      <p>
        Concrete plans beat vague intent. Where exactly will you live (city + ideally specific
        address arranged)? What will you do for income / study / family setup? &ldquo;Sponsor&apos;s
        parents live in Brisbane and need care; sponsor&apos;s existing accounting role at PwC
        Brisbane has been confirmed for an October start; we&apos;ve signed a 12-month lease at [X]
        from September 1&rdquo; lands far better than &ldquo;we want to build our life there.&rdquo;
      </p>

      <h3>6. Long-term commitment — using the destination authority&apos;s exact phrasing</h3>
      <p>
        Every immigration authority has specific legal terminology for the test you&apos;re meeting.
        Copying that exact phrase tells the caseworker you&apos;ve read the rules. Here are the ones
        worth memorising:
      </p>
      <ul>
        <li>
          <strong>UK Home Office (partner / spouse):</strong> &ldquo;Our relationship is genuine and
          subsisting and we intend to live together permanently in the United Kingdom.&rdquo; Appendix
          FM E-LTRP.1.7.
        </li>
        <li>
          <strong>Australia Department of Home Affairs (partner):</strong> &ldquo;Mutual commitment to
          a shared life together to the exclusion of all others, on a genuine and continuing
          basis.&rdquo;
        </li>
        <li>
          <strong>USCIS (spouse):</strong> &ldquo;Bona fide marriage entered into in good faith and not
          solely for immigration purposes.&rdquo;
        </li>
        <li>
          <strong>IRCC (Canadian spousal sponsorship):</strong> &ldquo;Genuine relationship... entered
          into in good faith and not primarily for the purpose of acquiring permanent resident
          status.&rdquo; (Section 4 of IRPA Regulations.)
        </li>
        <li>
          <strong>NZ Immigration (partnership-based):</strong> &ldquo;Living together in a genuine and
          stable partnership.&rdquo;
        </li>
      </ul>

      <h2>The AI-assisted workflow that saves you £1,000+</h2>
      <p>
        The single biggest unlock for self-filers is using a capable AI (Claude, ChatGPT,
        Gemini) to neaten up your draft. The model isn&apos;t replacing your judgement — it&apos;s
        replacing the £200/hour solicitor who would otherwise rewrite your awkward sentences.
        Here&apos;s the workflow:
      </p>

      <h3>Step 1 — Write the bare bones yourself (30 minutes)</h3>
      <p>
        Open a doc. Type out each of the six sections in plain language as if explaining to a
        friend. Don&apos;t worry about prose quality. Get every concrete date, address, and
        circumstance on the page. This is the part only you can do.
      </p>

      <h3>Step 2 — Upload to Claude with this prompt</h3>
      <p>
        Copy this prompt into Claude (or ChatGPT / Gemini), then paste your draft below it.
        Attach your evidence-list spreadsheet if you have one — the AI will use it to suggest
        where to add cross-references.
      </p>
      <blockquote className="not-prose bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 my-4 text-sm font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">{`I am applying for a [VISA TYPE — e.g. UK Spouse, Australia Partner Subclass 309, US CR-1] visa. Below is the draft of my personal statement / letter of intent. The destination's legal test for this visa type is: [PASTE THE EXACT PHRASE FROM ABOVE, e.g. "genuine and subsisting relationship... intent to live together permanently in the United Kingdom"].

Please do three things:

1. Edit my draft for clarity and concision while keeping EVERY concrete date, address, name, and amount intact. Do NOT invent facts I haven't given you.

2. Restructure into the six-section skeleton:
   1. How we met / how this opportunity arose
   2. Dated timeline of milestones
   3. Substantive proof point (cohabitation / role match / financial fit)
   4. Destination-specific evidence
   5. Concrete future plans
   6. Long-term commitment closing — incorporate the destination's exact legal phrase verbatim

3. Flag any vague claims that would weaken the application and tell me what specific evidence I should add OR what I should soften the language to.

Then output the revised statement. Don't add a preamble or sign-off — caseworkers want a tight, factual narrative, not an essay.

Here's my draft:

[PASTE YOUR DRAFT BELOW]`}</blockquote>

      <h3>Step 3 — Review every edit before accepting</h3>
      <p>
        The AI may smooth over a detail you actually needed to keep specific (a date,
        a name, the exact amount of an expense). Read its output side-by-side with your draft
        and reject any change that makes the statement vaguer. AI tends to default to formal
        register; if your relationship sounds robotic in the rewrite, push back: &ldquo;rewrite
        section 2 in a warmer, less formal tone while keeping every date intact.&rdquo;
      </p>

      <h3>Step 4 — Sanity-check against the evidence bundle</h3>
      <p>
        Open every claim in the statement against an evidence document. If you say &ldquo;we
        opened our joint Wise account in April 2024&rdquo; make sure the statement of that
        account is in the bundle. If you say &ldquo;sponsor&apos;s salary is £35,000&rdquo;
        make sure the P60 / payslips support it. Caseworkers cross-reference; a statement
        claim that&apos;s NOT corroborated by a document is worse than not making the claim.
      </p>

      <h3>Step 5 — When to stop and hire a lawyer instead</h3>
      <p>
        Not every case is DIY-safe. Spend the £1,500 on a regulated immigration solicitor if:
      </p>
      <ul>
        <li>You have a prior visa refusal or overstay anywhere in the world.</li>
        <li>You have a criminal record on either side, even minor (drink-driving, public order).</li>
        <li>The sponsor&apos;s income doesn&apos;t cleanly meet the threshold (mixed self-employment +
          employment, recent job change, business owner, overseas income).</li>
        <li>You have dependent children from a previous relationship with international custody
          considerations.</li>
        <li>Your relationship doesn&apos;t cleanly meet the 12-month / 2-year / marriage thresholds and
          you&apos;re relying on &ldquo;compelling circumstances&rdquo; or conjugal-partner grounds.</li>
      </ul>
      <p>
        We list regulated immigration lawyers in our{" "}
        <Link href="/services/legal-services" className="underline">legal services directory</Link> —
        these are OISC / MARA / MIA / SRA-regulated firms with public reviews and clear fee
        schedules.
      </p>

      <h2>What carries weight in caseworker review</h2>
      <p>
        Adjudicators evaluate evidence in roughly this order. Spend more time on the items at
        the top.
      </p>
      <ol>
        <li>
          <strong>Binary eligibility</strong> — does the sponsor meet the income test? Is the
          marriage legally valid? Is the role a genuine vacancy at threshold pay? If you fail
          here, nothing else matters.
        </li>
        <li>
          <strong>Relationship-duration proof</strong> — for partner visas: marriage certificate or
          2-year cohabitation evidence (joint tenancy, joint bills going back 24 months).
        </li>
        <li>
          <strong>Document spread across categories</strong> — joint financial + joint household +
          social + communication. Five categories with three proof points each beats fifty
          photos and nothing else.
        </li>
        <li>
          <strong>Personal statement coherence</strong> — does every claim cross-reference a
          document? Is the timeline internally consistent?
        </li>
        <li>
          <strong>Police certificates from every long-term residence</strong> — missing one is a
          common refusal reason that costs months.
        </li>
        <li>
          <strong>Medical exam validity</strong> — for routes that require it, complete it close
          to submission (most medicals are valid 12 months).
        </li>
      </ol>

      <h2>Common money-wasting mistakes</h2>
      <ul>
        <li>Paying for translations of documents already in the destination&apos;s official
          language. UK / US / Australian English documents don&apos;t need translating for the
          UK / US / Australian authorities.</li>
        <li>Paying for &ldquo;priority processing&rdquo; on a partner visa that gains you 2 weeks. Worth
          it on time-sensitive routes (student visa with course start, work visa with contract
          start). Rarely worth it on partner where the relationship isn&apos;t going anywhere.</li>
        <li>Hiring a full-service immigration consultant when you really need a one-hour paid
          consultation to sanity-check the documents you&apos;ve gathered yourself. Most regulated
          firms offer £100-£300 paid hours.</li>
        <li>Posting documents to slow channels. Use ACRO Premium (£95, 2 days) instead of
          standard (£55, 10 days) for the UK police certificate. Use FBI Channeler ($50, 1-3
          days) instead of FBI Mail (2-3 months) for the US police clearance.</li>
        <li>Submitting too early. Most partner visas are valid 30 days from grant. Apply too
          early and you re-pay the fee if you can&apos;t enter in time. Calculate
          processing-time-from-submission backwards from your intended entry date and apply on
          that date plus a 2-week safety margin.</li>
      </ul>

      <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400 italic">
        Nothing in this guide is legal advice. It&apos;s the kind of help a friend who&apos;d been through
        the process themselves would give you. If your case is genuinely complex, speak to a
        regulated immigration adviser — see our{" "}
        <Link href="/services/legal-services" className="underline">legal services directory</Link>.
      </p>
    </article>
  );
}
