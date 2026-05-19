/**
 * /documents/[destination] — every curated visa form for a single
 * destination, grouped by programme.
 *
 * Generates one static page per destinationsWithForms() entry. Each
 * page renders programme cards with download buttons that link
 * directly to the government download page (NOT raw PDF — gov sites
 * rotate PDF filenames quarterly).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/site";
import { flagEmoji, nameFor } from "@/lib/countries";
import {
  formsForDestination,
  destinationsWithForms,
  type FormsEntry,
  type VisaForm,
} from "@/content/visaForms";

export const revalidate = 86400; // 1d ISR — these pages change rarely

export async function generateStaticParams() {
  return destinationsWithForms().map((iso) => ({ destination: iso.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  const iso = destination.toUpperCase();
  const entries = formsForDestination(iso);
  if (entries.length === 0) return {};
  const name = nameFor(iso);
  return {
    title: `${name} visa forms — every government PDF, with download links`,
    description: `Direct links to the official government download pages for every major ${name} visa form: ${entries.map((e) => e.programmeLabel).slice(0, 3).join(", ")} and more.`,
    alternates: { canonical: absoluteUrl(`/documents/${destination.toLowerCase()}`) },
  };
}

const STAGE_LABEL: Record<VisaForm["stage"], string> = {
  before_applying: "Before applying",
  with_application: "Submit with application",
  after_decision: "After decision",
};

const FILED_BY_LABEL: Record<VisaForm["filedBy"], string> = {
  applicant: "applicant",
  sponsor: "sponsor",
  witness: "witness",
  employer: "employer",
  joint: "applicant + sponsor jointly",
};

const STAGE_TONE: Record<VisaForm["stage"], string> = {
  before_applying:
    "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  with_application:
    "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
  after_decision:
    "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

export default async function DestinationDocumentsPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  const iso = destination.toUpperCase();
  const entries = formsForDestination(iso);
  if (entries.length === 0) notFound();
  const name = nameFor(iso);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-[var(--color-ink-muted)]">
        <Link href="/documents" className="hover:text-[var(--color-ink)] underline-offset-2 hover:underline">
          ← All visa forms
        </Link>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl leading-none" aria-hidden>
            {flagEmoji(iso)}
          </span>
          <p className="kicker">{name} forms</p>
        </div>
        <h1 className="serif-display text-3xl sm:text-4xl mb-3">
          Every {name} visa form with a direct government download link.
        </h1>
        <p className="text-[var(--color-ink-muted)] leading-relaxed">
          {entries.length} programme{entries.length === 1 ? "" : "s"} covering
          the most-used {name} visa routes. Every link below points at the
          official government download page — your form is always the
          current version.
        </p>
      </header>

      <div className="space-y-10">
        {entries.map((entry) => (
          <ProgrammeBlock key={entry.programmeLabel} entry={entry} />
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-[var(--color-rule)]">
        <p className="text-sm text-[var(--color-ink-muted)]">
          See the actual visa rules + processing times for {name} on the{" "}
          <Link
            href={`/destination/${iso.toLowerCase()}`}
            className="underline hover:no-underline text-[var(--color-ink)]"
          >
            {name} destination page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function ProgrammeBlock({ entry }: { entry: FormsEntry }) {
  return (
    <section className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] p-6">
      <header className="mb-5">
        <h2 className="font-semibold text-xl text-[var(--color-ink)] leading-snug mb-1">
          {entry.programmeLabel}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-muted)]">
          <a
            href={entry.applicationPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:no-underline"
          >
            Official application portal ↗
          </a>
          <span aria-hidden>·</span>
          <Link href={entry.programmeSlug} className="underline hover:no-underline">
            See visa rules
          </Link>
        </div>
      </header>

      {entry.notes && (
        <p className="mb-5 text-sm text-[var(--color-ink-muted)] italic leading-relaxed border-l-2 border-[var(--color-rule-strong)] pl-4">
          {entry.notes}
        </p>
      )}

      {/* Form list — two-column layout per form: A4-proportioned preview
          on the left, description + download on the right. Gov sites
          almost universally set X-Frame-Options: DENY, so the iframe
          itself usually renders blank — that's expected. The styled A4
          card behind it carries the visual weight (form code stamped
          like a real document), and a "preview may be blocked by the
          source" note explains the blank state. The actual download
          button is the primary action. Stacks to single column under
          sm: for mobile. */}
      <ul role="list" className="space-y-6">
        {entry.forms.map((form) => (
          <li
            key={form.code}
            className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] overflow-hidden"
          >
            <div className="grid sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-0">
              {/* LEFT — A4-aspect preview frame */}
              <div className="relative bg-[var(--color-muted)]/40 border-b sm:border-b-0 sm:border-r border-[var(--color-rule)] p-4">
                <div className="relative aspect-[1/1.414] w-full max-w-[260px] mx-auto rounded-md border border-[var(--color-rule-strong)] bg-white shadow-sm overflow-hidden">
                  {/* Stamped form code — visible whether the iframe
                      loads or not, since most gov endpoints block
                      embedding via X-Frame-Options. Acts as a faux
                      letterhead so the card never looks empty. */}
                  <div className="absolute inset-0 flex flex-col p-3 z-0">
                    <p className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {form.code}
                    </p>
                    <p className="font-serif text-xs text-slate-700 mt-1 leading-snug line-clamp-3">
                      {form.name}
                    </p>
                    <div className="mt-auto space-y-1">
                      <div className="h-0.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-0.5 bg-slate-200 rounded w-full" />
                      <div className="h-0.5 bg-slate-200 rounded w-5/6" />
                      <div className="h-0.5 bg-slate-200 rounded w-2/3" />
                    </div>
                    <p className="mt-3 text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                      Official source — {getTld(form.downloadUrl)}
                    </p>
                  </div>
                  {/* Iframe overlay — will render the gov page if the
                      source allows framing; otherwise stays transparent
                      so the stamped letterhead shows through. */}
                  <iframe
                    src={form.downloadUrl}
                    title={`Preview: ${form.code} — ${form.name}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    sandbox=""
                    className="absolute inset-0 w-full h-full z-10 bg-transparent"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-[10px] text-[var(--color-ink-muted)] text-center mt-2 leading-snug">
                  Preview may be blank if the official site blocks framing — the download below is always live.
                </p>
              </div>

              {/* RIGHT — description, metadata, download CTA */}
              <div className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1">
                      {form.code}
                    </p>
                    <h3 className="font-semibold text-[var(--color-ink)] leading-snug">
                      {form.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.14em] font-semibold px-2 py-1 rounded shrink-0 ${STAGE_TONE[form.stage]}`}
                  >
                    {STAGE_LABEL[form.stage]}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
                  {form.description}
                </p>
                {form.notes && (
                  <p className="text-xs text-[var(--color-ink-muted)] italic mb-3 leading-relaxed">
                    Heads up: {form.notes}
                  </p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    Filed by{" "}
                    <strong className="font-medium text-[var(--color-ink)]">
                      {FILED_BY_LABEL[form.filedBy]}
                    </strong>
                  </span>
                  <a
                    href={form.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-1.5 rounded-full
                      bg-[var(--color-ink)] hover:opacity-90 text-[var(--color-paper)]
                      text-xs font-semibold px-3.5 py-1.5 transition
                    "
                  >
                    Download from {getTld(form.downloadUrl)} ↗
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Pull a short TLD-ish label from a gov download URL so the button
 *  reads "Download from gov.au" / "Download from gov.uk" / "Download
 *  from uscis.gov" — reassuring users they're going to an official
 *  source, not a third-party mirror. */
function getTld(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    // For .gov.au / .gov.uk / .gov.in — return the last two segments
    if (host.endsWith(".gov.au")) return "au";
    if (host.endsWith(".gov.uk")) return "uk";
    if (host.endsWith(".gov.in")) return "in";
    if (host.endsWith(".gob.es")) return "es";
    if (host.endsWith(".gouv.fr")) return "fr";
    if (host.endsWith(".go.jp")) return "jp";
    if (host.endsWith(".go.kr")) return "kr";
    if (host.endsWith("canada.ca")) return "canada.ca";
    if (host.endsWith(".uscis.gov")) return "uscis.gov";
    if (host.endsWith("state.gov")) return "state.gov";
    if (host.endsWith("immigration.govt.nz")) return "immigration.govt.nz";
    if (host.endsWith("home-affairs.ec.europa.eu") || host.endsWith("europa.eu")) return "europa.eu";
    return host;
  } catch {
    return "official site";
  }
}
