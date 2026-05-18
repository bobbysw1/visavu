import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Booking received — Visavu",
  description: "We've received your intake form. Next steps inside.",
  alternates: { canonical: absoluteUrl("/consultation/booked") },
};

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/consultation", label: "Consultation" },
  { href: "/consultation/booked", label: "Booked" },
];

export default function ConsultationBookedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-center">
      <Breadcrumbs crumbs={crumbs} />

      <div className="space-y-4 mt-8">
        <div className="text-6xl">✓</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Got it. Thank you.</h1>
        <p className="text-lg text-neutral-700 dark:text-neutral-300">
          We&apos;ve received your intake form and will be in touch within 24 hours
          with available consultation slots and the payment link.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-6 text-left space-y-3">
        <h2 className="font-semibold">What happens next</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          <li>We match your case to a registered adviser in the appropriate jurisdiction (UK IAA, AU MARA, CA CICC, US bar)</li>
          <li>The adviser reviews your intake before the call</li>
          <li>You receive 2-3 proposed time slots by email + a Stripe payment link</li>
          <li>Pay → confirm slot → consultation happens → written summary delivered within 48 hours</li>
        </ol>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Meanwhile, you can continue browsing:
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/chat" className="rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2 text-sm">Ask Visavu (AI)</Link>
          <Link href="/find-my-visa" className="rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2 text-sm">Find my visa</Link>
          <Link href="/myths" className="rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2 text-sm">Myths &amp; rumours</Link>
        </div>
      </div>
    </div>
  );
}
