"use client";

/**
 * "Not sure?" wizard. A short multi-step questionnaire that recommends a
 * specific Purpose + sub-purpose based on the user's situation. Designed for
 * users who Google something like "I'm a Latvian in NZ, what visa do I need
 * for my American boyfriend?" and don't know whether their case is Family,
 * Work, or something else.
 *
 * Each step is a simple Q with 2-4 options. The last step renders a tailored
 * recommendation card with one or two suggested visa categories and a "Take
 * me there" button that closes the wizard with the chosen purpose+sub.
 *
 * Pure client logic, no API calls — the decision tree is deterministic.
 */
import { useState } from "react";
import type { Purpose } from "@/lib/types";
import { PURPOSE_LABEL } from "@/lib/types";

type Recommendation = {
  purpose: Purpose;
  subId: string;
  label: string;
  rationale: string;
};

type StepNode =
  | {
      kind: "question";
      id: string;
      title: string;
      hint?: string;
      options: { label: string; next: string }[];
    }
  | {
      kind: "result";
      id: string;
      recommendations: Recommendation[];
    };

// Top-level "what brings you here?" branches into purpose-specific subtrees.
const TREE: Record<string, StepNode> = {
  start: {
    kind: "question",
    id: "start",
    title: "What's the main reason for your trip?",
    hint: "Pick the closest match. We'll narrow further from there.",
    options: [
      { label: "I'm visiting for a short trip (under 90 days)", next: "short_stay" },
      { label: "I want to work or move for employment", next: "work_branch" },
      { label: "I want to study", next: "study_branch" },
      { label: "I'm joining or marrying someone there", next: "family_branch" },
    ],
  },

  short_stay: {
    kind: "question",
    id: "short_stay",
    title: "What kind of short visit?",
    options: [
      { label: "Holiday, sightseeing, or visiting friends", next: "r_tourism_leisure" },
      { label: "Business meetings or conferences", next: "r_business" },
      { label: "I'm just connecting flights", next: "r_transit" },
      { label: "Medical treatment", next: "r_medical" },
    ],
  },

  r_tourism_leisure: {
    kind: "result",
    id: "r_tourism_leisure",
    recommendations: [
      {
        purpose: "tourism",
        subId: "leisure",
        label: "Tourist / leisure visa",
        rationale:
          "For short personal travel — vacation, sightseeing, visiting friends. Most countries grant either visa-free entry, an eTA, visa-on-arrival, or a short-stay tourist visa from the embassy.",
      },
    ],
  },
  r_business: {
    kind: "result",
    id: "r_business",
    recommendations: [
      {
        purpose: "business",
        subId: "meetings",
        label: "Short-stay business visa",
        rationale:
          "For meetings, conferences, contract negotiations and trade fairs. You cannot take up paid local employment on this category — that's a Work visa.",
      },
    ],
  },
  r_transit: {
    kind: "result",
    id: "r_transit",
    recommendations: [
      {
        purpose: "transit",
        subId: "transit_visa",
        label: "Transit visa",
        rationale:
          "Many connecting passengers stay airside and need no visa. Some nationalities require an explicit transit visa even airside — check the destination's transit policy.",
      },
    ],
  },
  r_medical: {
    kind: "result",
    id: "r_medical",
    recommendations: [
      {
        purpose: "tourism",
        subId: "medical_tourism",
        label: "Medical tourism visa",
        rationale:
          "Many countries issue a medical-tourism short-stay visa for treatment at recognised facilities. Letters from the treating institution are usually required.",
      },
    ],
  },

  // ---------------------------- WORK BRANCH ----------------------------
  work_branch: {
    kind: "question",
    id: "work_branch",
    title: "Do you have a job offer from a company in the destination country?",
    options: [
      { label: "Yes, a confirmed job offer", next: "work_has_offer" },
      { label: "No — but I work remotely for a non-local employer", next: "r_digital_nomad" },
      { label: "No — I want to start a business or invest", next: "r_investor" },
      { label: "No — I'm under 35 and want to travel + work for a year", next: "r_working_holiday" },
      { label: "No — I want to be assessed on points / qualifications alone", next: "r_express_entry" },
    ],
  },

  work_has_offer: {
    kind: "question",
    id: "work_has_offer",
    title: "Is the employer the same multinational you already work for?",
    options: [
      { label: "Yes — I'm being transferred internally", next: "r_intra_company" },
      { label: "No — it's a new external employer", next: "work_external_offer" },
    ],
  },

  work_external_offer: {
    kind: "question",
    id: "work_external_offer",
    title: "What's the role roughly?",
    options: [
      { label: "Healthcare role (doctor / nurse / carer)", next: "r_health_care" },
      { label: "Master's-degree-level professional", next: "r_highly_qualified" },
      { label: "Skilled trade or professional role", next: "r_skilled" },
    ],
  },

  r_skilled: {
    kind: "result",
    id: "r_skilled",
    recommendations: [
      {
        purpose: "work",
        subId: "skilled_sponsored",
        label: "Skilled worker (sponsored)",
        rationale:
          "Your employer must hold a sponsor licence and sponsor your application. Examples: UK Skilled Worker, Australia Subclass 482, US H-1B, Singapore Employment Pass.",
      },
    ],
  },
  r_highly_qualified: {
    kind: "result",
    id: "r_highly_qualified",
    recommendations: [
      {
        purpose: "work",
        subId: "highly_qualified",
        label: "Highly-qualified / EU Blue Card",
        rationale:
          "Master's-degree-level routes with elevated salary thresholds. Examples: Germany EU Blue Card, France Talent Passport (highly-qualified stream).",
      },
      {
        purpose: "work",
        subId: "skilled_sponsored",
        label: "Skilled worker (sponsored) — alternative",
        rationale: "If the Blue Card threshold isn't met, the standard sponsored route may apply.",
      },
    ],
  },
  r_health_care: {
    kind: "result",
    id: "r_health_care",
    recommendations: [
      {
        purpose: "work",
        subId: "health_care",
        label: "Health & care worker visa",
        rationale:
          "Many countries operate fast-tracked, lower-fee routes for healthcare workers. Confirm professional registration with the destination's medical/nursing council.",
      },
    ],
  },
  r_intra_company: {
    kind: "result",
    id: "r_intra_company",
    recommendations: [
      {
        purpose: "work",
        subId: "intra_company",
        label: "Intra-company transfer",
        rationale:
          "Routes for moving within a multinational employer. Typically requires 6–12 months prior service with the company.",
      },
    ],
  },
  r_digital_nomad: {
    kind: "result",
    id: "r_digital_nomad",
    recommendations: [
      {
        purpose: "work",
        subId: "digital_nomad",
        label: "Digital nomad / Remote-worker visa",
        rationale:
          "Self-sponsored visa for remote workers earning income from non-local employers/clients. Examples: Spain Digital Nomad, Portugal D8, Estonia Digital Nomad, France Talent Passport.",
      },
    ],
  },
  r_investor: {
    kind: "result",
    id: "r_investor",
    recommendations: [
      {
        purpose: "work",
        subId: "investor",
        label: "Investor / Startup founder visa",
        rationale:
          "For founding or investing in a local business. Capital thresholds vary widely (€300k+ in France, USD 800k+ in EB-5, etc.).",
      },
    ],
  },
  r_working_holiday: {
    kind: "result",
    id: "r_working_holiday",
    recommendations: [
      {
        purpose: "work",
        subId: "working_holiday",
        label: "Working holiday visa",
        rationale:
          "Bilateral agreements granting 12–24 months of travel + work for under-35 (sometimes 30) applicants. AU, NZ, CA, UK, IE, JP, KR are popular hosts.",
      },
    ],
  },
  r_express_entry: {
    kind: "result",
    id: "r_express_entry",
    recommendations: [
      {
        purpose: "work",
        subId: "express_entry",
        label: "Points-based / Express Entry",
        rationale:
          "Self-assessed points routes that don't require a job offer (though one boosts your score). Canada Express Entry and New Zealand Skilled Migrant Category are the canonical examples.",
      },
    ],
  },

  // ---------------------------- STUDY BRANCH ----------------------------
  study_branch: {
    kind: "question",
    id: "study_branch",
    title: "What kind of study?",
    options: [
      { label: "Bachelor's, Master's, or PhD degree", next: "r_degree" },
      { label: "Language course", next: "r_language" },
      { label: "Short exchange or semester abroad", next: "r_exchange" },
      { label: "I just finished studying — I want to stay and work", next: "r_graduate" },
    ],
  },

  r_degree: {
    kind: "result",
    id: "r_degree",
    recommendations: [
      {
        purpose: "study",
        subId: "degree",
        label: "Student visa (degree program)",
        rationale:
          "Requires acceptance from an institution recognised by the destination's education or immigration authority. Examples: UK Student Route, Australia Subclass 500, US F-1, Canada Study Permit.",
      },
    ],
  },
  r_language: {
    kind: "result",
    id: "r_language",
    recommendations: [
      {
        purpose: "study",
        subId: "language",
        label: "Language course visa",
        rationale:
          "Many countries have a separate, shorter visa stream for language schools. Confirm the school is on the destination's approved list.",
      },
    ],
  },
  r_exchange: {
    kind: "result",
    id: "r_exchange",
    recommendations: [
      {
        purpose: "study",
        subId: "exchange",
        label: "Exchange / short-course visa",
        rationale:
          "Erasmus and similar bilateral exchanges typically use a short-stay variant of the student visa. Some short courses fit under tourism if under 90 days and not for credit.",
      },
    ],
  },
  r_graduate: {
    kind: "result",
    id: "r_graduate",
    recommendations: [
      {
        purpose: "study",
        subId: "graduate_route",
        label: "Graduate / post-study work visa",
        rationale:
          "Stay-back permits after qualifying study. UK Graduate Route, Australia Subclass 485, Canada Post-Graduation Work Permit.",
      },
    ],
  },

  // ---------------------------- FAMILY BRANCH ----------------------------
  family_branch: {
    kind: "question",
    id: "family_branch",
    title: "What's your relationship to the person in the destination country?",
    options: [
      { label: "Married spouse or registered civil partner", next: "r_spouse" },
      { label: "Long-term unmarried partner (lived together 2+ years)", next: "r_unmarried" },
      { label: "Engaged — planning to marry there soon", next: "r_fiance" },
      { label: "I'm their dependent child", next: "r_child_dep" },
      { label: "I'm their adult relative needing care (parent, etc.)", next: "r_adult_dep" },
      { label: "I support myself with passive income (retirement, rental)", next: "r_passive" },
    ],
  },

  r_spouse: {
    kind: "result",
    id: "r_spouse",
    recommendations: [
      {
        purpose: "family",
        subId: "spouse_partner",
        label: "Spouse / civil partner visa",
        rationale:
          "Marriage certificate or civil-partnership document accepted. Sponsor must usually be a citizen or settled resident; income thresholds apply (e.g. UK £29k–£38,700, US I-864 affidavit).",
      },
    ],
  },
  r_unmarried: {
    kind: "result",
    id: "r_unmarried",
    recommendations: [
      {
        purpose: "family",
        subId: "unmarried_partner",
        label: "Unmarried partner visa",
        rationale:
          "Most countries require 2+ years of documented cohabitation (joint utility bills, lease, photographs, communication history). UK and Australia have the most established routes.",
      },
    ],
  },
  r_fiance: {
    kind: "result",
    id: "r_fiance",
    recommendations: [
      {
        purpose: "family",
        subId: "fiance",
        label: "Fiancé(e) visa",
        rationale:
          "Time-bounded visa (usually 6 months) to enter and marry locally. UK Fiancé visa, US K-1. After marriage, you switch to the spouse visa.",
      },
    ],
  },
  r_child_dep: {
    kind: "result",
    id: "r_child_dep",
    recommendations: [
      {
        purpose: "family",
        subId: "child_dep",
        label: "Dependent child visa",
        rationale:
          "Routes for children under 18 (sometimes up to 21) of citizen / settled-resident sponsors. Usually granted alongside a parent's spouse / partner visa application.",
      },
    ],
  },
  r_adult_dep: {
    kind: "result",
    id: "r_adult_dep",
    recommendations: [
      {
        purpose: "family",
        subId: "adult_dep",
        label: "Adult dependent relative visa",
        rationale:
          "Restrictive routes — most countries require evidence the relative cannot receive equivalent care in their home country. Approval rates are lower than spouse / child routes.",
      },
    ],
  },
  r_passive: {
    kind: "result",
    id: "r_passive",
    recommendations: [
      {
        purpose: "family",
        subId: "passive_income",
        label: "Passive income / Retirement visa",
        rationale:
          "Self-supporting routes via pension, rental, dividends, royalties. Examples: Portugal D7, Spain Non-Lucrative, Italy Elective Residence.",
      },
    ],
  },
};

export function NotSureWizard({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (purpose: Purpose, subId: string) => void;
}) {
  const [currentId, setCurrentId] = useState<string>("start");
  const [history, setHistory] = useState<string[]>([]);

  if (!open) return null;
  const node = TREE[currentId];

  function reset() {
    setCurrentId("start");
    setHistory([]);
  }
  function back() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setCurrentId(prev);
    setHistory(history.slice(0, -1));
  }
  function go(nextId: string) {
    setHistory([...history, currentId]);
    setCurrentId(nextId);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Help me choose a visa"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 card-elev max-h-[90vh] overflow-y-auto">
        <header className="flex items-start justify-between gap-3 p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
              Not sure which visa
            </p>
            <h3 className="text-lg font-semibold mt-1">Let&apos;s narrow it down</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </header>

        <div className="p-5">
          {node.kind === "question" ? (
            <>
              <h4 className="text-base sm:text-lg font-semibold mb-1">{node.title}</h4>
              {node.hint && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{node.hint}</p>
              )}
              <div className="space-y-2">
                {node.options.map((opt) => (
                  <button
                    key={opt.next}
                    type="button"
                    onClick={() => go(opt.next)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition card-hover"
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4 className="text-base sm:text-lg font-semibold mb-1">
                Best match{node.recommendations.length > 1 ? "es" : ""} for you:
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                These are the visa categories most likely to fit your situation. Pick one to
                continue with the lookup — we&apos;ll filter to options in that category.
              </p>
              <div className="space-y-3">
                {node.recommendations.map((rec) => (
                  <article
                    key={`${rec.purpose}:${rec.subId}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-4"
                  >
                    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-700 dark:text-blue-300 mb-1">
                      {PURPOSE_LABEL[rec.purpose]}
                    </p>
                    <h5 className="font-semibold mb-1">{rec.label}</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                      {rec.rationale}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(rec.purpose, rec.subId);
                        onClose();
                        reset();
                      }}
                      className="text-sm px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      Use this visa category
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={back}
            disabled={history.length === 0}
            className="hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={history.length === 0 && currentId === "start"}
            className="hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start over
          </button>
        </footer>
      </div>
    </div>
  );
}
