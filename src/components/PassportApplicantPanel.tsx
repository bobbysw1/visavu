/**
 * Per-applicant documentation panel for the pair page.
 *
 * The user-flagged architectural problem: a British applicant looking at
 * "Spain Non-Lucrative Visa" was seeing generic requirements ("police
 * clearance", "apostilled birth certificate") — same as a US, Indian,
 * Australian applicant. Reality is each nationality has its own concrete
 * process, fee, and processing time for those documents. ACRO vs FBI vs
 * Polizeiliches Führungszeugnis vs PCC.
 *
 * This component reads PASSPORT_PROFILES[passport] and renders the
 * applicant-specific layer that supplements the destination's visa rules.
 *
 * Renders on /[passport]/[destination] pages and /[passport]/[destination]/[purpose]
 * pages — anywhere the route is known. Compact two-column on desktop,
 * stacked on mobile. Hides if no profile exists for the passport (long-tail
 * applicant nationalities fall back to a "Your documentation tips" generic
 * link to /guides/document-prep instead).
 */

import { passportProfileFor } from "@/content/passportProfiles";
import { nameFor } from "@/lib/countries";

export function PassportApplicantPanel({ passportIso2 }: { passportIso2: string }) {
  const profile = passportProfileFor(passportIso2);
  if (!profile) {
    // No detailed profile yet for this nationality — render a generic
    // helper panel pointing at the right authority types so the user
    // isn't left with NO guidance.
    return (
      <section className="mt-8 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 space-y-2">
          <p className="kicker">For {nameFor(passportIso2)} applicants</p>
          <p className="text-sm text-[var(--color-ink)] leading-relaxed">
            Detailed per-document process for the {nameFor(passportIso2)} passport (police clearance, apostille,
            tax records, translator accreditation) isn&apos;t in our index yet. The generic mapping below
            applies to most jurisdictions — verify with the destination&apos;s consulate.
          </p>
          <ul className="text-xs text-[var(--color-ink-muted)] leading-relaxed list-disc pl-5 space-y-0.5">
            <li>Police clearance — your national police authority or interior ministry</li>
            <li>Apostille or legalisation — your ministry of foreign affairs (if your country is a Hague signatory) or destination embassy (if not)</li>
            <li>Tax records — your national tax authority&apos;s annual return + assessment</li>
            <li>Translation — court-sworn translator or notary public certified</li>
          </ul>
          <p className="text-xs text-[var(--color-ink-muted)] italic pt-1">
            Email contact@visavu.com if you want us to prioritise a detailed profile for{" "}
            {nameFor(passportIso2)}.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={`Documentation steps for ${profile.country} applicants`}
      className="mt-8 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden"
    >
      <header className="px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--color-rule)]">
        <p className="kicker">For {profile.country} applicants specifically</p>
        <h2 className="serif-display text-xl sm:text-2xl font-medium text-[var(--color-ink)] mt-1">
          Your documentation process at a glance.
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1.5">
          What the generic requirements above actually mean for you in {profile.country} — the
          exact agency, fee, and processing time for each.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-rule)]">
        {/* Background check */}
        <Card title="Police / background check" body={profile.backgroundCheck.name} subtitle={profile.backgroundCheck.issuer}>
          <KV label="Fee" value={profile.backgroundCheck.fee} />
          <KV label="Processing" value={profile.backgroundCheck.processingTime} />
          {profile.backgroundCheck.notes && <Note>{profile.backgroundCheck.notes}</Note>}
          <SourceLink href={profile.backgroundCheck.url}>Official site</SourceLink>
        </Card>

        {/* Apostille */}
        <Card
          title="Apostille / legalisation"
          body={profile.apostille.hagueSignatory ? "Hague Apostille (single-step)" : "Embassy legalisation (multi-step)"}
          subtitle={profile.apostille.issuer}
        >
          <KV label="Fee" value={profile.apostille.fee} />
          <KV label="Processing" value={profile.apostille.processingTime} />
          {profile.apostille.notes && <Note>{profile.apostille.notes}</Note>}
          <SourceLink href={profile.apostille.url}>Official site</SourceLink>
        </Card>

        {/* Tax records */}
        <Card title="Tax records / income proof" body={profile.taxRecords.name} subtitle={profile.taxRecords.issuer}>
          {profile.taxRecords.notes && <Note>{profile.taxRecords.notes}</Note>}
          <SourceLink href={profile.taxRecords.url}>Official site</SourceLink>
        </Card>

        {/* Translation */}
        <Card title="Certified translation" body={profile.translation.accreditation} subtitle="Sworn / certified translator">
          <Note>{profile.translation.notes}</Note>
        </Card>
      </div>

      {/* Footer with civil-docs reference + currency note */}
      <div className="px-5 sm:px-6 py-4 border-t border-[var(--color-rule)] bg-[var(--color-muted)]/40 text-xs text-[var(--color-ink-muted)] leading-relaxed">
        <p>
          <strong className="text-[var(--color-ink)]">Standard civil documents you&apos;ll often need:</strong>{" "}
          {profile.standardCivilDocuments.slice(0, 5).join("; ")}
          {profile.standardCivilDocuments.length > 5 ? "; …" : "."}
        </p>
        <p className="mt-2">
          Fees on the destination&apos;s visa page are typically quoted in the destination
          currency. Your preferred currency for budgeting: <strong className="text-[var(--color-ink)]">{profile.preferredCurrency}</strong>.
          {" "}
          {profile.consulateGeography && (
            <span><strong className="text-[var(--color-ink)]">Where to apply:</strong> {profile.consulateGeography}</span>
          )}
        </p>
        {profile.generalNotes && (
          <p className="mt-2 italic">{profile.generalNotes}</p>
        )}
      </div>
    </section>
  );
}

function Card({
  title,
  body,
  subtitle,
  children,
}: {
  title: string;
  body: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-paper-elev)] px-5 sm:px-6 py-4 space-y-2">
      <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">{title}</p>
      <p className="text-sm font-medium text-[var(--color-ink)] leading-snug">{body}</p>
      {subtitle && <p className="text-xs text-[var(--color-ink-muted)]">{subtitle}</p>}
      {children && <div className="space-y-1 pt-1">{children}</div>}
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="text-xs text-[var(--color-ink-muted)]">
      <span className="font-medium text-[var(--color-ink)]">{label}:</span> {value}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed italic pt-0.5">{children}</p>
  );
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-xs text-[var(--color-ink)] underline decoration-[var(--color-rule-strong)] underline-offset-2 hover:decoration-[var(--color-ink)]"
    >
      {children} →
    </a>
  );
}

/** Brief inline reminder for chat / API consumers — a single-paragraph
 *  string summarising the applicant's documentation context.
 *  Used by the AI chat synthesis to ground answers in the right process. */
export function applicantContextSentence(passportIso2: string): string {
  const profile = passportProfileFor(passportIso2);
  if (!profile) return "";
  return (
    `For ${profile.country} applicants specifically: police check = ${profile.backgroundCheck.name} (${profile.backgroundCheck.issuer}, ${profile.backgroundCheck.fee ?? "see official site"}, ${profile.backgroundCheck.processingTime ?? "varies"}). ` +
    `Apostille = ${profile.apostille.hagueSignatory ? "Hague single-step" : "embassy legalisation multi-step"} via ${profile.apostille.issuer} (${profile.apostille.fee ?? "see official site"}). ` +
    `Translations: ${profile.translation.accreditation}. ` +
    `${nameFor(passportIso2)} consulate notes: ${profile.consulateGeography}`
  );
}
