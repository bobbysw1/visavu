import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "visa-refusal-what-next",
  title: "Visa refusal: when to reapply, when to appeal, when to switch route",
  summary:
    "A refusal isn't always the end. Some are appealable; some are best handled by a clean reapplication; some signal that the route was wrong and you need to switch. Here's how to read the refusal letter and pick the right next move.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Refusal", "Appeal", "Reapplication", "Strategy"],
  readingMinutes: 9,
  heroIso2: "GB",
};

export default function VisaRefusalGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        A visa refusal is bad news but not always game-over. Some categories have explicit
        appeal rights; others don&apos;t, but a strategic reapplication addressing the refusal
        grounds often succeeds. The wrong move — reapplying immediately without changes,
        appealing a non-appealable refusal, abandoning a valid route — costs months and
        thousands of pounds. This guide walks through the decision tree.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>Read the refusal letter carefully.</strong> The legal basis (Section /
          paragraph / regulation) tells you whether it&apos;s appealable. The reasoning gives
          you the lever for reapplication.
        </li>
        <li>
          <strong>Appeal when:</strong> the refusal is on a category with statutory appeal
          rights (UK Family / Human Rights cases; many EU long-stay categories; some US
          waivers), AND the refusal reasoning misapplies the law or facts.
        </li>
        <li>
          <strong>Reapply (clean application) when:</strong> the refusal cites missing
          evidence, weak documentation, or specific points you can now address. Reapplications
          are typically faster than appeals.
        </li>
        <li>
          <strong>Switch route when:</strong> the refusal reveals you don&apos;t meet the
          underlying eligibility (income too low, qualification mismatch, prior immigration
          violation). No amount of resubmission solves a structural problem.
        </li>
        <li>
          <strong>Bring a lawyer when:</strong> 214(b) refusals in the US, family / human-
          rights cases anywhere, repeated refusals, criminality / inadmissibility issues, or
          appeals filed on tight deadlines.
        </li>
      </ul>

      <h2>Reading the refusal letter</h2>
      <p>
        Every refusal letter has two operative parts: (1) the legal basis — the specific
        rule the application failed under, and (2) the reasoning — the case-officer&apos;s
        explanation of why the facts didn&apos;t meet the rule.
      </p>
      <p>
        <strong>Legal basis tells you whether appeal is available.</strong> Examples:
      </p>
      <ul>
        <li>
          UK Section 320 paragraph 7B refusal → no appeal right (but reapplication permitted
          on different grounds)
        </li>
        <li>UK Family visa refusal → appeal right to the First-tier Tribunal</li>
        <li>UK Human Rights Article 8 refusal → appeal right</li>
        <li>
          US Section 214(b) refusal → no appeal (only reapplication with material change of
          circumstances)
        </li>
        <li>
          US Section 221(g) administrative processing → not a refusal; awaiting documentation
          or background check
        </li>
        <li>
          Schengen Type C refusal → appeal right to the issuing member-state authority
          (process varies by country)
        </li>
        <li>
          Canada IRCC refusal on visitor visa → no appeal in most cases (judicial review at
          Federal Court is the alternative)
        </li>
      </ul>
      <p>
        <strong>Reasoning tells you what to fix.</strong> Common reasoning patterns:
      </p>
      <ul>
        <li>
          &ldquo;Insufficient ties to home country&rdquo; — needs employer letter + property +
          family commitments + prior compliant travel.
        </li>
        <li>
          &ldquo;Discrepancy in documentation&rdquo; — needs a clear single narrative across
          all supporting documents.
        </li>
        <li>
          &ldquo;Insufficient financial capacity&rdquo; — needs 6+ months of consistent income
          evidence, not single-snapshot bank statements.
        </li>
        <li>
          &ldquo;Genuine intent not established&rdquo; — needs detailed itinerary, return
          plan, and specific purpose for the trip.
        </li>
      </ul>

      <h2>Appeal: when it&apos;s the right move</h2>
      <p>
        Appeal when (a) the category has statutory appeal rights, and (b) the refusal
        reasoning misapplies the law or the facts. Most appeals are not free-standing — they
        require professional legal representation to succeed. Costs and timelines vary
        widely:
      </p>
      <ul>
        <li>
          <strong>UK First-tier Tribunal (Immigration):</strong> £80 / £140 fee depending on
          hearing type; 6-18 months to hearing; ~40% allowed-overall rate. Family / human-
          rights cases are the most common.
        </li>
        <li>
          <strong>US AAO (Administrative Appeals Office):</strong> $675 fee; 6-12 months
          decision; success rates vary by category but are typically below 20%.
        </li>
        <li>
          <strong>Canada Federal Court Judicial Review:</strong> CAD$75 filing + CAD$200-400
          for completed leave application; 6-12 months from filing to hearing; ~15-25%
          success rate for most categories.
        </li>
        <li>
          <strong>Schengen Type C appeal:</strong> Varies by member state. France: appeal
          within 2 months to TA (Tribunal Administratif), no fee. Germany: Widerspruch within
          1 month then court if needed. Timelines 6-18 months.
        </li>
      </ul>
      <p>
        Even when an appeal succeeds, the timeline often makes the original travel purpose
        moot. Most successful appellants then reapply or proceed under the appeal judgment as
        leverage in subsequent applications.
      </p>

      <h2>Reapplication: usually the better first move</h2>
      <p>
        For most non-family / non-human-rights cases, reapplication is faster and more
        cost-effective than appeal. The key is materially changed circumstances or
        substantially improved documentation:
      </p>
      <ol>
        <li>
          Wait at least 3-6 months after the refusal (longer for serious refusals). Immediate
          resubmission of identical documentation triggers automatic refusal.
        </li>
        <li>
          Build a documentation set that explicitly addresses each refusal ground. If &ldquo;
          insufficient ties&rdquo;: more employer/property/family evidence. If &ldquo;
          insufficient funds&rdquo;: 12 months of cleaner financial history.
        </li>
        <li>
          Disclose the prior refusal in the new application. UK, US, Canada, Australia all
          require disclosure of prior visa refusals globally — not just from the destination
          country. Failure to disclose is misrepresentation, leading to automatic refusal
          plus potential 5-10 year bans.
        </li>
        <li>
          Add a cover letter addressing the refusal reasoning directly. Most case officers
          have the prior decision visible; a clear narrative explaining what&apos;s changed
          accelerates the decision.
        </li>
        <li>
          Consider a different visa application centre / consulate where appropriate (e.g.
          third-country interview for US B-visa from high-wait Manila or Lagos posts).
        </li>
      </ol>

      <h2>Switching route: when the original was wrong</h2>
      <p>
        Sometimes the refusal reveals you don&apos;t meet the underlying category. No amount
        of reapplication or appeal fixes this — you need a different route. Signals:
      </p>
      <ul>
        <li>
          <strong>UK Skilled Worker refusal due to salary below £38,700:</strong> the route
          isn&apos;t available at your salary; consider a shortage-occupation role, Global
          Talent, Innovator Founder, or a different destination.
        </li>
        <li>
          <strong>Express Entry profile creating but no ITA after 12+ months:</strong> CRS
          score isn&apos;t competitive; consider PNP nomination (boosts CRS by 600 points) or
          shift to a different country.
        </li>
        <li>
          <strong>Spanish DNV refusal due to income source structure:</strong> the
          self-employment structure doesn&apos;t meet the &ldquo;non-Spanish-client&rdquo;
          test; restructure or shift to a different long-stay category.
        </li>
        <li>
          <strong>Multiple US B-visa refusals under 214(b):</strong> the home-country ties
          aren&apos;t establishing immigrant intent rebuttal; consider whether you should
          pursue an immigrant visa (CR-1, K-1, EB-class) instead of repeatedly applying for
          temporary visas.
        </li>
      </ul>
      <p>
        Switching route is often the lowest-risk, highest-success move. Visa-application
        cycling on a dead-end category accumulates refusals that prejudice future
        applications.
      </p>

      <h2>When a lawyer earns the fee</h2>
      <ul>
        <li>
          <strong>UK Family / Article 8 appeals:</strong> Specialist immigration solicitor or
          barrister; £1,000-5,000 end-to-end depending on complexity. Worth it given hearing
          dynamics.
        </li>
        <li>
          <strong>US 214(b) repeated refusals:</strong> Immigration attorney can identify
          patterns and craft material-change arguments. $500-3,000 for consultation and
          strategy.
        </li>
        <li>
          <strong>Inadmissibility / criminality / misrepresentation cases:</strong> Always
          requires specialist counsel. These cases involve permanent bars; strategic waivers
          (e.g. US I-601, I-601A; UK paragraph 320 representations) are technical.
        </li>
        <li>
          <strong>Canadian Federal Court judicial review:</strong> Must be lawyer-led;
          CAD$3,000-10,000 depending on case complexity.
        </li>
        <li>
          <strong>Schengen appeals across multiple member states:</strong> French / German /
          Italian administrative-law specialists for the specific member state involved.
        </li>
      </ul>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Country-specific deadlines for appeal filing (these are short — typically 14-90 days
        from refusal; missing the window forecloses the option), specific case strategy for
        humanitarian / asylum claims, or the interaction of refusals with concurrent
        applications in other countries (most modern immigration systems share refusal data
        via Interpol or bilateral channels). These are areas where qualified immigration
        counsel earns the fee.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: UK Immigration Rules paragraph 320 (general grounds for refusal),
        UK Immigration and Asylum Act 1999 appeal rights, US Foreign Affairs Manual 9 FAM
        302 (visa ineligibilities), USCIS AAO procedures, IRCC Judicial Review framework,
        Schengen Visa Code (Regulation (EC) 810/2009 Article 32 appeals). Last updated
        2026-05.
      </p>
    </article>
  );
}
