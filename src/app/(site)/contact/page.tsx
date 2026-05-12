import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Mail, FileSearch, Briefcase, Newspaper, Shield } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name} — report incorrect visa info, press enquiries, partnerships, and general questions.`,
  alternates: { canonical: absoluteUrl("/contact") },
  robots: { index: true, follow: true },
};

// Single inbox for now — segmented by subject line. Avoids the trust signal
// problem of "Contact Us" pages with no real way to reach a human.
const CONTACT_EMAIL = "hello@visavu.com";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/contact", label: "Contact" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Get in touch
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
          {SITE.name} is run by a small team. We answer real messages from real people. We do
          not respond to mass outreach, automated pitches, or link-building requests.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-6">
        <div className="flex items-start gap-3">
          <Mail
            size={22}
            aria-hidden="true"
            className="shrink-0 mt-0.5 text-blue-700 dark:text-blue-300"
          />
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Email us
            </p>
            <p className="text-base">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-mono text-blue-700 dark:text-blue-300 underline underline-offset-4 break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed">
              Please use a clear subject line so we can prioritise (see categories below). We
              aim to reply within 3 working days; corrections to visa data are usually faster.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What you can write to us about
        </h2>

        <ContactCategory
          icon={<AlertCircle size={20} aria-hidden="true" />}
          subject="Correction: [route or page URL]"
          title="Report incorrect visa info"
          tone="emerald"
        >
          Spotted a wrong fee, outdated rule, or missing visa class? Tell us the page URL and
          what should be different. If you can include a primary-source link (government
          website), even better. We triage these first — accuracy is the whole point of the
          site.
        </ContactCategory>

        <ContactCategory
          icon={<FileSearch size={20} aria-hidden="true" />}
          subject="Question about [route]"
          title="Question about a specific route"
          tone="neutral"
        >
          We can&apos;t give individual immigration advice, but if a page is unclear or
          contradicts a source you have, we want to hear about it.
        </ContactCategory>

        <ContactCategory
          icon={<Newspaper size={20} aria-hidden="true" />}
          subject="Press: [your outlet]"
          title="Press &amp; data journalism"
          tone="neutral"
        >
          Working on a story about visa policy, migration trends, or programmatic visa data?
          We&apos;re happy to provide aggregated figures, methodology notes, or quotes. Please
          include your outlet, deadline, and a brief on the angle.
        </ContactCategory>

        <ContactCategory
          icon={<Briefcase size={20} aria-hidden="true" />}
          subject="Partnership: [your company]"
          title="Partnerships &amp; data licensing"
          tone="neutral"
        >
          We can discuss embedded widgets, B2B data licensing, and affiliate arrangements that
          align with our no-upsell editorial posture. Please describe the scope and approximate
          volume; we&apos;re selective about which partners we work with.
        </ContactCategory>

        <ContactCategory
          icon={<Shield size={20} aria-hidden="true" />}
          subject="Privacy / data request"
          title="Privacy &amp; data-rights requests"
          tone="neutral"
        >
          GDPR / UK GDPR / CCPA access, erasure, or correction requests. See our{" "}
          <Link href="/privacy" className="text-blue-700 dark:text-blue-300 underline">
            Privacy Policy
          </Link>{" "}
          for what we hold. We respond to verified requests within 30 days.
        </ContactCategory>
      </section>

      <section className="mt-10 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-5">
        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
          We cannot help with
        </h2>
        <ul className="text-sm text-amber-900/90 dark:text-amber-100/90 space-y-1 leading-relaxed">
          <li>
            Individual visa applications — we don&apos;t process applications. Apply directly
            with the destination&apos;s embassy or use a regulated immigration adviser (UK: OISC
            / SRA; AU: MARA; CA: ICCRC; US: bar-admitted attorney).
          </li>
          <li>
            Personal immigration advice for your specific case — see our{" "}
            <Link
              href="/disclaimer"
              className="underline underline-offset-2 font-medium"
            >
              Disclaimer
            </Link>
            .
          </li>
          <li>Sponsorship offers, job offers, or letters of invitation.</li>
          <li>
            Status updates on a visa application you submitted to a government — that&apos;s
            with the issuing authority, not us.
          </li>
          <li>Mass cold-outreach for SEO link building, guest posts, or sponsored content.</li>
        </ul>
      </section>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-8 italic">
        Postal address available on written request for legal correspondence only.
      </p>
    </main>
  );
}

function ContactCategory({
  icon,
  subject,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  subject: string;
  title: string;
  tone: "emerald" | "neutral";
  children: React.ReactNode;
}) {
  const border =
    tone === "emerald"
      ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/15"
      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900";
  const iconTone =
    tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-neutral-600 dark:text-neutral-400";

  return (
    <div className={`rounded-xl border ${border} p-5`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${iconTone}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">
            {title}
          </h3>
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-2">
            Subject: {subject}
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
