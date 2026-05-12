import { describe, it, expect } from "vitest";
import { assessDifficulty, bucketFor } from "./difficulty";
import type { ResolvedVisaOption } from "./types";

function baseOption(overrides: Partial<ResolvedVisaOption> = {}): ResolvedVisaOption {
  return {
    id: 1,
    passportIso2: "US",
    destinationIso2: "JP",
    purpose: "tourism",
    status: "visa_free",
    label: "Visa-free entry",
    maxStayDays: 90,
    validityDays: null,
    entriesAllowed: "multiple",
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

describe("bucketFor", () => {
  it("buckets 1-4 as easy, 5-6 as medium, 7-10 as hard", () => {
    expect(bucketFor(1)).toBe("easy");
    expect(bucketFor(4)).toBe("easy");
    expect(bucketFor(5)).toBe("medium");
    expect(bucketFor(6)).toBe("medium");
    expect(bucketFor(7)).toBe("hard");
    expect(bucketFor(10)).toBe("hard");
  });
});

describe("assessDifficulty", () => {
  it("scores plain visa-free entry as 1 (easy)", () => {
    const a = assessDifficulty(baseOption());
    expect(a.bucket).toBe("easy");
    expect(a.score).toBe(1);
  });

  it("scores VWP-style visa-free-with-eta + onward ticket as easy", () => {
    const a = assessDifficulty(
      baseOption({
        status: "visa_free_with_eta",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        requirements: ["Valid e-passport", "Approved ESTA before boarding", "Onward ticket"],
      }),
    );
    expect(a.bucket).toBe("easy");
    expect(a.score).toBeLessThanOrEqual(4);
  });

  it("scores Skilled-Worker-style sponsor-required, high-salary work visa as hard or borderline-medium", () => {
    const a = assessDifficulty(
      baseOption({
        status: "embassy_visa",
        purpose: "work",
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 56,
        biometricsRequired: true,
        passportValidityMonthsRequired: 6,
        requirements: [
          "Confirmed job offer",
          "Certificate of Sponsorship",
          "Skill level RQF 3+",
          "Salary threshold",
          "English B1",
          "Maintenance funds",
          "TB test",
        ],
        purposeMetadata: {
          sponsorshipRequired: true,
          jobOfferRequired: true,
          salaryThresholdMinor: 38_700_00,
          salaryCurrency: "GBP",
          routeToSettlement: true,
        },
      }),
    );
    expect(["hard", "medium"]).toContain(a.bucket);
    expect(a.score).toBeGreaterThanOrEqual(6);
  });

  it("scores e_visa with light requirements + fast processing as medium-or-easy", () => {
    const a = assessDifficulty(
      baseOption({
        status: "e_visa",
        processingTimeDaysMin: 3,
        processingTimeDaysMax: 5,
        requirements: ["Photo", "Passport scan"],
      }),
    );
    expect(["easy", "medium"]).toContain(a.bucket);
    expect(a.score).toBeLessThanOrEqual(4);
  });

  it("scores embassy_visa with multi-week processing as medium-or-hard", () => {
    const a = assessDifficulty(
      baseOption({
        status: "embassy_visa",
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 35,
        requirements: ["Application form", "Photos", "Bank statement", "Itinerary"],
      }),
    );
    // Medium bucket is narrower (5–6) under the new spec, so a multi-week
    // embassy visa with light requirements sits right on the hard boundary.
    expect(["medium", "hard"]).toContain(a.bucket);
    expect(a.score).toBeGreaterThanOrEqual(6);
    expect(a.score).toBeLessThanOrEqual(8);
  });

  it("scores entry refused as 10 (hard)", () => {
    const a = assessDifficulty(baseOption({ status: "refused" }));
    expect(a.score).toBe(10);
    expect(a.bucket).toBe("hard");
  });

  it("clamps to 1..10 even with extreme penalties", () => {
    const a = assessDifficulty(
      baseOption({
        status: "embassy_visa",
        processingTimeDaysMax: 365,
        biometricsRequired: true,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        onwardTicketRequired: true,
        requirements: Array(15).fill("doc"),
        purposeMetadata: {
          sponsorshipRequired: true,
          jobOfferRequired: true,
          salaryThresholdMinor: 100_000_00,
          salaryCurrency: "GBP",
        },
        purpose: "work",
      }),
    );
    expect(a.score).toBeGreaterThanOrEqual(1);
    expect(a.score).toBeLessThanOrEqual(10);
  });

  it("returns at least one reason per assessment", () => {
    const a = assessDifficulty(baseOption());
    expect(a.reasons.length).toBeGreaterThan(0);
    expect(a.reasons[0].text).toMatch(/visa-free/i);
  });
});
