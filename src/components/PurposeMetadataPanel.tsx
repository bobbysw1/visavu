/**
 * Purpose-specific detail panel. Each visa category has fields that don't
 * apply to others — work has salary thresholds + sponsor, study has institution
 * + financial proof, family has sponsor income + relationship types.
 *
 * Rendered into ResultCard when a non-null purposeMetadata is present.
 */
import type {
  Purpose,
  WorkVisaMetadata,
  StudyVisaMetadata,
  FamilyVisaMetadata,
  DiplomaticVisaMetadata,
} from "@/lib/types";
import { Money } from "./Money";

const RELATIONSHIP_LABEL: Record<string, string> = {
  spouse: "Spouse",
  partner: "Partner / civil partner",
  child: "Child",
  parent: "Parent",
  dependent: "Dependent",
};

export function PurposeMetadataPanel({
  purpose,
  metadata,
}: {
  purpose: Purpose;
  metadata: Record<string, unknown> | null;
}) {
  if (!metadata) return null;

  if (purpose === "work") {
    const m = metadata as WorkVisaMetadata;
    const items: { label: string; value: React.ReactNode }[] = [];
    if (m.sponsorshipRequired !== undefined)
      items.push({ label: "Sponsorship", value: m.sponsorshipRequired ? "Required" : "Not required" });
    if (m.sponsorType)
      items.push({
        label: "Sponsor type",
        value:
          m.sponsorType === "employer"
            ? "Licensed employer"
            : m.sponsorType === "self"
            ? "Self-sponsored"
            : "Investor",
      });
    if (m.salaryThresholdMinor && m.salaryCurrency)
      items.push({
        label: "Minimum salary",
        value: (
          <>
            <Money amountMinor={m.salaryThresholdMinor} currency={m.salaryCurrency} />
            {" / year"}
          </>
        ),
      });
    if (m.jobOfferRequired !== undefined)
      items.push({ label: "Job offer", value: m.jobOfferRequired ? "Required" : "Not required" });
    if (m.workPermitDays) items.push({ label: "Permit length", value: `${m.workPermitDays} days` });
    if (m.routeToSettlement !== undefined)
      items.push({
        label: "Path to settlement",
        value: m.routeToSettlement ? "Yes" : "No",
      });

    return (
      <Section title="Work visa details" tone="violet">
        <DetailGrid items={items} />
        {m.eligibleOccupations && m.eligibleOccupations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Eligible occupations (sample)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {m.eligibleOccupations.slice(0, 12).map((occ) => (
                <span
                  key={occ}
                  className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  {occ}
                </span>
              ))}
              {m.eligibleOccupations.length > 12 && (
                <span className="text-xs px-2 py-1 rounded text-neutral-500">
                  +{m.eligibleOccupations.length - 12} more
                </span>
              )}
            </div>
          </div>
        )}
      </Section>
    );
  }

  if (purpose === "study") {
    const m = metadata as StudyVisaMetadata;
    const items: { label: string; value: React.ReactNode }[] = [];
    if (m.institutionAccreditationRequired !== undefined)
      items.push({
        label: "Institution accreditation",
        value: m.institutionAccreditationRequired ? "Required" : "Not required",
      });
    if (m.courseDurationMonths)
      items.push({ label: "Course length", value: `${m.courseDurationMonths} months` });
    if (m.financialProofMonthlyMinor && m.financialProofCurrency)
      items.push({
        label: "Financial proof (monthly)",
        value: (
          <Money
            amountMinor={m.financialProofMonthlyMinor}
            currency={m.financialProofCurrency}
          />
        ),
      });
    if (m.partTimeWorkAllowedHours !== undefined)
      items.push({
        label: "Part-time work",
        value: m.partTimeWorkAllowedHours
          ? `Up to ${m.partTimeWorkAllowedHours} hours/week`
          : "Not permitted",
      });
    if (m.englishRequirement)
      items.push({ label: "English requirement", value: m.englishRequirement });

    return (
      <Section title="Student visa details" tone="emerald">
        <DetailGrid items={items} />
      </Section>
    );
  }

  if (purpose === "family") {
    const m = metadata as FamilyVisaMetadata;
    const items: { label: string; value: React.ReactNode }[] = [];
    if (m.relationshipTypes && m.relationshipTypes.length > 0)
      items.push({
        label: "Eligible relationships",
        value: m.relationshipTypes.map((r) => RELATIONSHIP_LABEL[r] ?? r).join(", "),
      });
    if (m.sponsorIncomeThresholdMinor && m.sponsorIncomeCurrency)
      items.push({
        label: "Sponsor income threshold",
        value: (
          <>
            <Money
              amountMinor={m.sponsorIncomeThresholdMinor}
              currency={m.sponsorIncomeCurrency}
            />
            {" / year"}
          </>
        ),
      });
    if (m.sponsorMustBeCitizenOrResident !== undefined)
      items.push({
        label: "Sponsor status",
        value: m.sponsorMustBeCitizenOrResident
          ? "Citizen or settled resident required"
          : "Sponsor status not specified",
      });
    if (m.cohabitationProofRequired !== undefined)
      items.push({
        label: "Cohabitation proof",
        value: m.cohabitationProofRequired ? "Required" : "Not required",
      });
    if (m.routeToSettlement !== undefined)
      items.push({
        label: "Path to settlement",
        value: m.routeToSettlement ? "Yes" : "No",
      });

    return (
      <Section title="Partner / family visa details" tone="rose">
        <DetailGrid items={items} />
      </Section>
    );
  }

  if (purpose === "diplomatic") {
    const m = metadata as DiplomaticVisaMetadata;
    const items: { label: string; value: React.ReactNode }[] = [];
    if (m.authorizationLetterRequired !== undefined)
      items.push({
        label: "Authorisation letter",
        value: m.authorizationLetterRequired ? "Required (issuing ministry)" : "Not required",
      });
    if (m.accreditedMissionRequired !== undefined)
      items.push({
        label: "Accredited mission",
        value: m.accreditedMissionRequired ? "Required" : "Not required",
      });
    if (m.feeWaived !== undefined)
      items.push({ label: "Fee", value: m.feeWaived ? "Waived" : "Standard fee applies" });

    return (
      <Section title="Diplomatic visa details" tone="slate">
        <DetailGrid items={items} />
      </Section>
    );
  }

  return null;
}

const TONE_BORDER: Record<string, string> = {
  violet: "border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20",
  emerald: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20",
  rose: "border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20",
  slate: "border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40",
};

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "violet" | "emerald" | "rose" | "slate";
  children: React.ReactNode;
}) {
  return (
    <section className={`mb-5 p-4 rounded-lg border ${TONE_BORDER[tone]}`}>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      {children}
    </section>
  );
}

function DetailGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  if (items.length === 0) return null;
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {items.map((it) => (
        <div key={it.label} className="flex justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 sm:border-0 py-1">
          <dt className="text-neutral-500 dark:text-neutral-400">{it.label}</dt>
          <dd className="font-medium text-right">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
