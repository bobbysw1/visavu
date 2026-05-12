import { describe, it, expect } from "vitest";
import { classify, classifyAll, sortForProfile, groupByPathway } from "./profileMatching";
import type { ResolvedVisaOption } from "./types";

function opt(overrides: Partial<ResolvedVisaOption> & { label: string }): ResolvedVisaOption {
  return {
    id: 1,
    passportIso2: "GB",
    destinationIso2: "AU",
    purpose: "work",
    status: "embassy_visa",
    maxStayDays: null,
    validityDays: null,
    entriesAllowed: null,
    passportValidityMonthsRequired: null,
    blankPagesRequired: null,
    onwardTicketRequired: null,
    proofOfFundsRequired: null,
    proofOfAccommodationRequired: null,
    biometricsRequired: null,
    biometricsLocation: null,
    requirements: [],
    vaccinationRequirements: [],
    processingTimeDaysMin: null,
    processingTimeDaysMax: null,
    applicationUrl: null,
    primarySourceUrl: null,
    fees: [],
    blocDerivedFrom: null,
    eta: null,
    purposeMetadata: null,
    correctnessBucket: "high",
    lastFetchedAt: null,
    lastVerifiedAt: null,
    notes: null,
    ...overrides,
  };
}

describe("classify", () => {
  it("routes Spain Digital Nomad to digital_nomad pathway", () => {
    const c = classify(opt({ label: "Spain Digital Nomad Visa", purpose: "work" }));
    expect(c.pathway).toBe("digital_nomad");
    expect(c.profiles.digital_nomad).toBe(3);
    expect(c.profiles.remote_worker).toBe(3);
  });

  it("routes Portugal D7 to retirement pathway", () => {
    const c = classify(opt({ label: "D7 (Passive Income / Retirement)", purpose: "family" }));
    expect(c.pathway).toBe("retirement");
    expect(c.profiles.retiree).toBe(3);
  });

  it("routes Dubai Golden Visa to investor_golden — NOT sponsored_work", () => {
    const c = classify(opt({ label: "UAE Golden Visa", purpose: "work" }));
    expect(c.pathway).toBe("investor_golden");
    expect(c.profiles.hnwi).toBe(3);
    expect(c.profiles.investor).toBe(3);
  });

  it("routes startup / entrepreneur visas to entrepreneur_startup", () => {
    expect(classify(opt({ label: "UK Innovator Founder visa" })).pathway).toBe("entrepreneur_startup");
    expect(classify(opt({ label: "France French Tech Visa Entrepreneur" })).pathway).toBe(
      "entrepreneur_startup",
    );
  });

  it("routes Express Entry FSW to skilled_migration", () => {
    const c = classify(opt({ label: "Express Entry (FSW) — Federal Skilled Worker", purpose: "work" }));
    expect(c.pathway).toBe("skilled_migration");
    expect(c.profiles.engineer).toBe(3);
    expect(c.profiles.doctor).toBe(3);
  });

  it("routes NZ Skilled Migrant Category to skilled_migration", () => {
    const c = classify(opt({ label: "Skilled Migrant Category — Resident Visa", purpose: "work" }));
    expect(c.pathway).toBe("skilled_migration");
  });

  it("routes UK Skilled Worker to skilled_migration (PR-track, sponsor-required)", () => {
    const c = classify(
      opt({
        label: "UK Skilled Worker visa (Tier 2 General)",
        purpose: "work",
        purposeMetadata: {
          sponsorshipRequired: true,
          jobOfferRequired: true,
          routeToSettlement: true,
          salaryThresholdMinor: 38_700_00,
          salaryCurrency: "GBP",
        },
      }),
    );
    expect(c.pathway).toBe("skilled_migration");
  });

  it("routes Germany EU Blue Card to sponsored_work (high skill)", () => {
    const c = classify(opt({ label: "Germany EU Blue Card", purpose: "work" }));
    expect(c.pathway).toBe("sponsored_work");
    expect(c.profiles.engineer).toBe(3);
    expect(c.profiles.doctor).toBe(3);
  });

  it("routes US H-1B to sponsored_work (high skill)", () => {
    const c = classify(opt({ label: "H-1B specialty occupation", purpose: "work" }));
    expect(c.pathway).toBe("sponsored_work");
    expect(c.profiles.engineer).toBe(3);
  });

  it("routes Singapore Employment Pass to sponsored_work", () => {
    const c = classify(opt({ label: "Singapore Employment Pass", purpose: "work" }));
    expect(c.pathway).toBe("sponsored_work");
  });

  it("routes Japan SSW to sponsored_work with trade-worker bias", () => {
    const c = classify(opt({ label: "Specified Skilled Worker (SSW)", purpose: "work" }));
    expect(c.pathway).toBe("sponsored_work");
    expect(c.profiles.trade_worker).toBe(3);
  });

  it("routes UK / AU student visas to study", () => {
    expect(classify(opt({ label: "Student visa", purpose: "study" })).pathway).toBe("study");
    expect(classify(opt({ label: "Subclass 500 (Student)", purpose: "study" })).pathway).toBe("study");
  });

  it("routes US Visa Waiver Program / ESTA to tourism", () => {
    expect(classify(opt({ label: "Visa-free entry (ESTA / Visa Waiver)", purpose: "tourism" })).pathway).toBe(
      "tourism",
    );
    expect(classify(opt({ label: "Schengen short-stay visa", purpose: "tourism" })).pathway).toBe("tourism");
  });
});

describe("sortForProfile", () => {
  it("returns input unchanged when no profile is selected", () => {
    const list = classifyAll([opt({ label: "X" }), opt({ label: "Y" })]);
    const out = sortForProfile(list, null);
    expect(out.primary).toEqual(list);
    expect(out.secondary).toEqual([]);
  });

  it("floats investor_golden ABOVE sponsored_work for the hnwi profile", () => {
    const list = classifyAll([
      opt({ id: 1, label: "Germany EU Blue Card", purpose: "work" }),
      opt({ id: 2, label: "UAE Golden Visa" }),
      opt({ id: 3, label: "Schengen short-stay visa", purpose: "tourism" }),
    ]);
    const out = sortForProfile(list, "hnwi");
    expect(out.primary[0].option.id).toBe(2); // Golden visa first
  });

  it("prioritises skilled_migration for the engineer profile", () => {
    const list = classifyAll([
      opt({ id: 1, label: "UAE Golden Visa" }),
      opt({ id: 2, label: "Skilled Migrant Category — Resident Visa", purpose: "work" }),
      opt({ id: 3, label: "Schengen short-stay visa", purpose: "tourism" }),
    ]);
    const out = sortForProfile(list, "engineer");
    expect(out.primary[0].option.id).toBe(2);
  });

  it("drops a tourism-only option to secondary for a doctor profile", () => {
    const list = classifyAll([
      opt({ id: 1, label: "Skilled Migrant Category — Resident Visa", purpose: "work" }),
      opt({ id: 2, label: "Visa-free entry", purpose: "tourism" }),
    ]);
    const out = sortForProfile(list, "doctor");
    expect(out.primary.map((p) => p.option.id)).toContain(1);
    expect(out.secondary.map((p) => p.option.id)).toContain(2);
  });
});

describe("groupByPathway", () => {
  it("groups options into stable order", () => {
    const list = classifyAll([
      opt({ id: 1, label: "Skilled Migrant Category", purpose: "work" }),
      opt({ id: 2, label: "Germany EU Blue Card", purpose: "work" }),
      opt({ id: 3, label: "UAE Golden Visa" }),
      opt({ id: 4, label: "Schengen short-stay visa", purpose: "tourism" }),
    ]);
    const groups = groupByPathway(list);
    expect(groups.map((g) => g.pathway)).toEqual([
      "skilled_migration",
      "sponsored_work",
      "investor_golden",
      "tourism",
    ]);
  });
});
