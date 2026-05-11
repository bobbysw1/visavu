import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description: `${SITE.name} aggregates official visa information so travelers can compare options and act on real sources. Here's how we source, verify, and confidence-rate every answer.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <Breadcrumbs crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "How it works" }]} />
      <h1>How {SITE.name} works</h1>
      <p className="lead text-lg text-neutral-600 dark:text-neutral-400">
        We are an information aggregator. We pull visa rules from official government sources,
        normalize them into a single comparable shape, and surface every answer with a primary
        source link, a confidence indicator, and the date we last verified the data.
      </p>

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
    </main>
  );
}
