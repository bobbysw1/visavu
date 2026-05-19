import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 86_400;

export const metadata: Metadata = {
  title: "Paid consultation — get real visa advice from a registered adviser",
  description:
    "Book a paid, time-boxed consultation with a registered immigration adviser. Get specific answers in writing, not a sales call. Flat fee, no upsell.",
  alternates: { canonical: absoluteUrl("/consultation") },
  openGraph: {
    title: "Paid consultation — Visavu",
    description: "Real visa advice. Time-boxed. Flat fee. Not a sales call.",
    url: absoluteUrl("/consultation"),
  },
};

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/consultation", label: "Consultation" },
];

export default function ConsultationLandingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <Breadcrumbs crumbs={crumbs} />

      <header className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Get real visa advice — not a sales call</h1>
        <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
          Most &ldquo;free consultations&rdquo; from immigration law firms are sales meetings.
          They listen to your situation to quote you a price — not to give you answers.
          <strong> {SITE.name}&apos;s paid consultation is the opposite.</strong> Flat fee, time-boxed, you keep the written summary.
        </p>
      </header>

      {/* Honest upfront state — the consultation flow is described
          below, but we haven't yet onboarded the first cohort of
          registered advisers. Better to surface that now than have
          users click Book and hit dead air. The "Get featured" CTA
          recruits advisers in parallel. */}
      <section className="rounded-xl border-2 border-dashed border-[var(--color-rule-strong)] bg-[var(--color-muted)]/40 p-5 sm:p-6 space-y-3">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[var(--color-ink-muted)]">
          Coming soon — first cohort opens shortly
        </p>
        <p className="text-sm sm:text-base text-[var(--color-ink)] leading-relaxed">
          Visavu is recruiting the first cohort of vetted IAA-registered
          (UK), MARA-registered (AU), CICC-registered (CA), and US
          bar-admitted advisers. Until cohort 1 goes live, the booking
          form below collects your situation so we can match you to an
          adviser the moment they&apos;re onboarded.
        </p>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          <strong className="text-[var(--color-ink)]">Are you a registered immigration adviser?</strong>{" "}
          We&apos;re shortlisting now — registration documents must be
          current and we verify with the regulator before listing.{" "}
          <Link
            href="/contact?subject=featured-listing&slot=uk-immigration-adviser"
            className="underline underline-offset-2 hover:no-underline text-[var(--color-ink)] font-medium"
          >
            Get featured here →
          </Link>
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-6 space-y-4">
        <h2 className="text-xl font-semibold">How it&apos;s different</h2>
        <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-200">
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold shrink-0">→</span>
            <span><strong>Real adviser, registered in your jurisdiction.</strong> UK IAA-registered immigration adviser, AU MARA, CA CICC, or US bar-admitted attorney depending on your case. We verify the registration at onboarding.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold shrink-0">→</span>
            <span><strong>Time-boxed.</strong> 30 minutes (written-summary chat) or 60 minutes (video call). Starts on time, ends on time, advice is the deliverable.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold shrink-0">→</span>
            <span><strong>Specific to your situation.</strong> You complete an intake form before the call so the adviser arrives prepared. No re-explaining your story to a paralegal.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold shrink-0">→</span>
            <span><strong>Written summary you can use.</strong> PDF with the recommended route, requirements, timeline, fees, plus 7 days of follow-up Q&amp;A.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold shrink-0">→</span>
            <span><strong>No upsell.</strong> If the adviser determines your case is DIY-able, they say so and tell you how.</span>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 space-y-2">
            <p className="kicker text-xs uppercase tracking-wider text-neutral-500">Quick consult</p>
            <p className="text-3xl font-semibold">£150</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              30 minutes async written chat. Best for simple &ldquo;which route fits me?&rdquo; questions. Within 24 hours.
            </p>
          </div>
          <div className="rounded-lg border-2 border-blue-500 dark:border-blue-400 p-5 space-y-2 bg-blue-50/60 dark:bg-blue-950/30">
            <p className="kicker text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300">Full consult</p>
            <p className="text-3xl font-semibold">£300</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              60-minute video call + written PDF action plan + 7-day follow-up. Best for complex cases — multi-jurisdiction, family routes, switches.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What you get either way</h2>
        <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          <li>• Recommended visa route(s) with rationale</li>
          <li>• Document checklist specific to your nationality + destination</li>
          <li>• Realistic timeline + fee estimate</li>
          <li>• Risk flags — what could refuse you</li>
          <li>• What to do if refused (appeal vs re-apply)</li>
          <li>• Written PDF you can reuse and reference</li>
        </ul>
      </section>

      <section className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-6 space-y-3">
        <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">When to skip the consultation</h2>
        <p className="text-sm text-amber-900/90 dark:text-amber-200/90">
          If your situation is straightforward — visa-free tourism for a strong passport,
          a well-documented work visa with a sponsor handling paperwork, or a published
          route you can follow from the destination&apos;s .gov page — you may not need this.
          Use <Link href="/find-my-visa" className="underline">Find my visa</Link> or
          the <Link href="/chat" className="underline">AI assistant</Link> first.
          The consultation is for when general information isn&apos;t enough.
        </p>
      </section>

      <div className="text-center">
        <Link
          href="/consultation/book"
          className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-8 py-4 transition"
        >
          Book a consultation →
        </Link>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Intake form takes about 3 minutes. We respond within 24 hours with available slots.
        </p>
      </div>

      <footer className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <p>
          Visavu acts as a marketplace and referral platform; it does not itself provide
          immigration advice. All consultations are delivered by independently-registered
          advisers in the appropriate jurisdiction. Visavu&apos;s AI assistant is
          information-only and is never a substitute for advice from a registered professional.
        </p>
      </footer>
    </div>
  );
}
