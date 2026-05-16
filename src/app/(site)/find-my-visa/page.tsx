import type { Metadata } from "next";
import { QuestionnaireWizard } from "@/components/QuestionnaireWizard";
import { PageHero } from "@/components/PageHero";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Find my visa — personalised relocation roadmap",
  description:
    "Answer twelve quick questions and Visavu returns a ranked list of best-fit visa pathways, easiest countries, fastest approvals, cheapest routes, and the shortest paths to permanent residency.",
  alternates: { canonical: absoluteUrl("/find-my-visa") },
  openGraph: {
    title: "Find my visa — personalised relocation roadmap",
    description:
      "Twelve questions in, a personalised relocation roadmap out — visa pathways tailored to your profile, capital, timeline, and long-term goals.",
    url: absoluteUrl("/find-my-visa"),
    images: [
      {
        url: absoluteUrl("/og?title=Find+my+visa&kicker=Personalised+roadmap"),
        width: 1200,
        height: 630,
        alt: "Visavu — Find my visa",
      },
    ],
  },
};

// Recommendation engine pulls data from the DB on submit — needs Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function FindMyVisaPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10">
        <PageHero
          kicker="Find my visa"
          title="A personalised relocation roadmap"
          accent="."
          subtitle="Answer twelve quick questions — best-fit visa pathways, easiest countries, fastest approvals, cheapest routes, and the shortest paths to permanent residency."
          heroIso2="PT"
          variant="full"
        />
      </div>
      <QuestionnaireWizard />
    </>
  );
}
