/**
 * Inline forms panel rendered on /[passport]/[destination] result
 * pages. Surfaces the curated visa forms that match the page's
 * (destination, purpose, visa-label) tuple — so an applicant looking
 * at the AU Partner visa page sees Form 888 + Form 47SP immediately,
 * a UK Spouse applicant sees Appendix FM-SE, etc.
 *
 * Three behaviours depending on data + visa status:
 *
 *   1. Curated forms match → render the full forms list with download
 *      buttons (the default case for top-tier routes).
 *
 *   2. No curated match BUT the visa is visa-free / visa-on-arrival
 *      / eTA — render an explicit "No forms needed" panel explaining
 *      what the applicant does at the border (e.g. fill an FMM at
 *      MX, an Arrival Card at TH). Critically NOT silent — users
 *      misread silence as missing data.
 *
 *   3. No curated match AND the visa requires an embassy application
 *      — render null. We have a genuine coverage gap; better to hide
 *      the section than promise data we don't have.
 */
import Link from "next/link";
import type { Purpose, VisaStatus } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { formsForRoute, type FormsEntry, type VisaForm } from "@/content/visaForms";

const STAGE_TONE: Record<VisaForm["stage"], string> = {
  before_applying:
    "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  with_application:
    "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
  after_decision:
    "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

const STAGE_LABEL: Record<VisaForm["stage"], string> = {
  before_applying: "Before applying",
  with_application: "Submit with application",
  after_decision: "After decision",
};

export function FormsPanel({
  destinationIso2,
  purpose,
  visaLabel,
  passportIso2,
  visaStatus,
}: {
  destinationIso2: string;
  purpose: Purpose;
  visaLabel: string;
  /** Caller passes the applicant's passport so the "no forms needed"
   *  copy can address them by nationality ("Danish citizens..."). */
  passportIso2?: string;
  /** Caller passes the resolved visa status — needed to render the
   *  visa-free-no-forms variant instead of silently hiding. */
  visaStatus?: VisaStatus | null;
}) {
  const entries = formsForRoute(destinationIso2, purpose, visaLabel);

  // No curated forms but the visa is visa-free / VoA / eTA — render
  // the explicit "no forms needed" panel so users don't misread the
  // silence as missing data.
  if (entries.length === 0) {
    if (
      visaStatus === "visa_free" ||
      visaStatus === "visa_free_with_eta" ||
      visaStatus === "visa_on_arrival"
    ) {
      return (
        <NoFormsNeededPanel
          destinationIso2={destinationIso2}
          passportIso2={passportIso2}
          visaStatus={visaStatus}
        />
      );
    }
    return null;
  }

  // Usually 1 entry per route; render only the first matching programme
  // to keep the panel focused. The /documents page links to the full set.
  const entry = entries[0];

  return (
    <section
      id="forms"
      aria-label="Government forms you'll need"
      className="mt-8 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden scroll-mt-32"
    >
      <header className="px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--color-rule)]">
        <p className="kicker">Forms you&apos;ll download</p>
        <h2 className="serif-display text-xl sm:text-2xl font-medium text-[var(--color-ink)] mt-1">
          {entry.programmeLabel}
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1.5">
          Direct links to the official government download pages for every form
          in this application. No third-party mirrors.
        </p>
      </header>

      <ul role="list" className="divide-y divide-[var(--color-rule)]">
        {entry.forms.map((form) => (
          <li key={form.code} className="px-5 sm:px-6 py-4">
            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1">
                  {form.code}
                </p>
                <p className="font-semibold text-[var(--color-ink)] leading-snug">
                  {form.name}
                </p>
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
            <a
              href={form.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-1.5 rounded-full
                border border-[var(--color-ink)] text-[var(--color-ink)]
                hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]
                text-xs font-semibold px-3.5 py-1.5 transition
              "
            >
              Download official PDF ↗
            </a>
          </li>
        ))}
      </ul>

      <footer className="px-5 sm:px-6 py-3 border-t border-[var(--color-rule)] bg-[var(--color-muted)]/30 flex items-center justify-between gap-2 text-xs flex-wrap">
        <span className="text-[var(--color-ink-muted)]">
          Filed via:{" "}
          <a
            href={entry.applicationPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-[var(--color-ink)]"
          >
            official application portal ↗
          </a>
        </span>
        <Link
          href={`/documents/${destinationIso2.toLowerCase()}`}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
        >
          All {entry.programmeLabel.split(" — ")[0]} forms →
        </Link>
      </footer>
    </section>
  );
}

/**
 * Per-destination border-form info for the visa-free / VoA / eTA case.
 * Most countries that don't require a pre-arrival visa still hand you a
 * paper or digital entry card on landing — Mexico's FMM, Thailand's
 * Arrival Card (TM6), Indonesia's e-CD, Vietnam's e-Visa pre-form, etc.
 * Curated for the top destinations; rest fall through to generic copy.
 */
const BORDER_FORM_BY_DEST: Record<
  string,
  { name: string; description: string; preFillUrl?: string }
> = {
  MX: { name: "FMM (Forma Migratoria Múltiple)", description: "Free entry permit issued on arrival to all visa-exempt visitors. Pre-fill at INM's online portal to skip the airport queue.", preFillUrl: "https://www.inm.gob.mx/fmme/publico/en/solicitud.html" },
  TH: { name: "TM6 Arrival Card", description: "Suspended for visa-exempt travellers since 2022 — re-introduction signposted but not yet active. Currently no paper card required on arrival.", preFillUrl: "https://www.immigration.go.th/" },
  ID: { name: "e-Customs Declaration (e-CD)", description: "Free online form pre-fillable up to 3 days before arrival. Generates a QR code presented at Indonesian customs.", preFillUrl: "https://ecd.beacukai.go.id/" },
  US: { name: "ESTA authorisation (Visa Waiver Program)", description: "USD 21 fee, valid 2 years, multiple entries. Apply at esta.cbp.dhs.gov at least 72 hours before travel.", preFillUrl: "https://esta.cbp.dhs.gov/" },
  GB: { name: "UK ETA", description: "£10 fee, valid 2 years, multiple entries. Apply via gov.uk before boarding.", preFillUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
  CA: { name: "Canada eTA", description: "CAD $7 fee, valid 5 years, multiple entries. Apply at canada.ca before boarding.", preFillUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/apply.html" },
  AU: { name: "Australia ETA or eVisitor (subclass 651)", description: "ETA is AUD $20 (most non-EU visa-exempt nationalities); eVisitor 651 is free (EU/UK/Schengen). Apply via the official app or website before boarding.", preFillUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601" },
  NZ: { name: "NZeTA + IVL", description: "NZD $23 NZeTA + NZD $100 International Visitor Conservation & Tourism Levy. Apply via the NZeTA app or website.", preFillUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta" },
  KR: { name: "K-ETA", description: "KRW 10,000 fee, valid 3 years, multiple entries. Apply at k-eta.go.kr at least 72 hours before travel.", preFillUrl: "https://www.k-eta.go.kr/" },
  // EU Schengen — ETIAS launches 2026
  DE: { name: "ETIAS (from 2026)", description: "EU's pre-travel authorisation for visa-exempt visitors. €7 fee, valid 3 years. Will apply to entry into any of the 27 Schengen countries.", preFillUrl: "https://travel-europe.europa.eu/etias_en" },
};

function NoFormsNeededPanel({
  destinationIso2,
  passportIso2,
  visaStatus,
}: {
  destinationIso2: string;
  passportIso2?: string;
  visaStatus: VisaStatus;
}) {
  const destName = nameFor(destinationIso2);
  const nationality = passportIso2 ? nationalityFor(passportIso2) : "you";
  const border = BORDER_FORM_BY_DEST[destinationIso2.toUpperCase()];

  // Phrasing varies by status — visa-free is "nothing in advance" tone,
  // VoA is "fill on arrival" tone, ETA is "online before boarding" tone.
  const headline =
    visaStatus === "visa_free"
      ? `No visa or forms needed for ${nationality} citizens.`
      : visaStatus === "visa_free_with_eta"
      ? `No paper forms — just the electronic travel authorisation.`
      : `No advance forms — issued on arrival.`;

  return (
    <section
      id="forms"
      aria-label={`No visa forms needed for ${destName}`}
      className="mt-8 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden scroll-mt-32"
    >
      <header className="px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--color-rule)]">
        <p className="kicker">Documents on this route</p>
        <h2 className="serif-display text-xl sm:text-2xl font-medium text-[var(--color-ink)] mt-1">
          {headline}
        </h2>
      </header>

      <div className="px-5 sm:px-6 py-5">
        {border ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-1">
                {border.name}
              </p>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {border.description}
              </p>
            </div>
            {border.preFillUrl && (
              <a
                href={border.preFillUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-1.5 rounded-full
                  border border-[var(--color-ink)] text-[var(--color-ink)]
                  hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]
                  text-xs font-semibold px-3.5 py-1.5 transition
                "
              >
                Pre-fill at official site ↗
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {visaStatus === "visa_on_arrival"
              ? `Your visa is issued at the ${destName} border on arrival — typically against a payment in local currency or USD. Bring your passport (6+ months valid), onward ticket, and the visa fee in cash.`
              : `${nationality === "you" ? "You" : nationality + " citizens"} can enter ${destName} without a pre-arranged visa. The destination authority will stamp your passport on arrival — no forms to download in advance.`}
          </p>
        )}
      </div>

      <footer className="px-5 sm:px-6 py-3 border-t border-[var(--color-rule)] bg-[var(--color-muted)]/30 text-xs text-[var(--color-ink-muted)]">
        Planning a longer stay? Long-stay visas (work, study, family,
        retirement) need a separate application — check the{" "}
        <Link
          href={`/documents/${destinationIso2.toLowerCase()}`}
          className="underline hover:no-underline text-[var(--color-ink)]"
        >
          {destName} long-stay forms
        </Link>
        .
      </footer>
    </section>
  );
}
