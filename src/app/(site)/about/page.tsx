import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHero } from "@/components/PageHero";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description: `${SITE.name} aggregates official visa information so travelers can compare options and act on real sources. Here's how we source, verify, and confidence-rate every answer.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "How it works" }]} />
      <PageHero
        kicker="How it works"
        title={`${SITE.name} aggregates the world's visa rules`}
        accent="."
        subtitle="Government sources, normalised into one comparable shape — with a primary-source link, a confidence indicator, and the date we last verified the data on every answer."
        heroIso2="GR"
        variant="full"
      />
      <div className="prose prose-neutral dark:prose-invert max-w-none">

      <h2>Where the data comes from</h2>
      <p>
        We layer three categories of sources, weighted by authority on each field:
      </p>
      <ul>
        <li>
          <strong>Direct government scrapes</strong> — ministry of foreign affairs and immigration
          service pages. These are the authoritative sources for visa fees, processing times, and
          application URLs.
        </li>
        <li>
          <strong>Embassy sites in the origin country</strong> — embassies often publish operational
          detail (appointment booking, document checklists) that the home ministry omits.
        </li>
        <li>
          <strong>Wikipedia and Wikidata</strong> — used as a coverage layer for cells we don&apos;t
          yet directly source. Lower confidence weight; never load-bearing for fees or processing
          time.
        </li>
      </ul>

      <h2>How we measure confidence</h2>
      <p>
        Every answer carries a <strong>correctness</strong> rating (cross-source agreement,
        weighted by authority on the specific field) and a <strong>freshness</strong> rating (how
        recently we verified the answer against a primary source — not how recently we
        crawled). We display the worse of the two as a bucket: <em>High</em>, <em>Medium</em>,
        <em>Low</em>, or <em>Unverified</em>.
      </p>
      <p>
        We never display confidence as a percentage. &ldquo;94% confident&rdquo; implies precision
        the data does not have.
      </p>

      <h2>What we deliberately don&apos;t do</h2>
      <ul>
        <li>
          <strong>We don&apos;t process visa applications.</strong> Apply directly with the
          government, or pay your local embassy fee. We will never charge a service fee or rush
          fee, because that creates an incentive to be flashy rather than right.
        </li>
        <li>
          <strong>We don&apos;t replace embassy verification.</strong> A valid visa permits entry
          subject to officer discretion at the border. For dual nationals, complex travel history,
          or unusual cases, the embassy is the authoritative source.
        </li>
        <li>
          <strong>We don&apos;t fake freshness.</strong> If we last verified an answer six months
          ago, it reads as &ldquo;Unverified&rdquo; — even if the underlying record hasn&apos;t
          changed. The user should know we haven&apos;t recently checked.
        </li>
      </ul>

      <h2>Found something wrong?</h2>
      <p>
        Every result card has a &ldquo;Report incorrect info&rdquo; link. We triage user reports
        within a documented window and update or correct the underlying record.
      </p>
      </div>
    </main>
  );
}
