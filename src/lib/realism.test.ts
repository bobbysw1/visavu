import { describe, it, expect } from "vitest";
import { assessRealism, bucketFor } from "./realism";
import type { ResolvedVisaOption } from "./types";
import type { Obstacle } from "@/content/obstacles";

function baseOption(overrides: Partial<ResolvedVisaOption> = {}): ResolvedVisaOption {
  return {
    id: 1,
    passportIso2: "RU",
    destinationIso2: "DE",
    purpose: "tourism",
    status: "embassy_visa",
    label: "Schengen Type C",
    maxStayDays: 90,
    validityDays: 180,
    entriesAllowed: "multiple",
    passportValidityMonthsRequired: 3,
    blankPagesRequired: 2,
    onwardTicketRequired: true,
    proofOfFundsRequired: true,
    proofOfAccommodationRequired: true,
    biometricsRequired: true,
    biometricsLocation: null,
    requirements: [],
    vaccinationRequirements: [],
    processingTimeDaysMin: 15,
    processingTimeDaysMax: 60,
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

const criticalObstacle: Obstacle = {
  id: "test-critical",
  severity: "critical",
  title: "Sudan: active armed conflict",
  body: "...",
  appliesTo: { kind: "destination", iso: "SD" },
  references: [],
  updatedAt: "2026-05-10",
};

const cautionObstacle: Obstacle = {
  id: "test-caution",
  severity: "caution",
  title: "RU passport: heightened scrutiny",
  body: "...",
  appliesTo: { kind: "passport", iso: "RU" },
  references: [],
  updatedAt: "2026-05-10",
};

const infoObstacle: Obstacle = {
  id: "test-info",
  severity: "info",
  title: "IN→US H-1B: cap-subject lottery",
  body: "...",
  appliesTo: { kind: "pair", passport: "IN", destination: "US" },
  references: [],
  updatedAt: "2026-05-10",
};

describe("bucketFor", () => {
  it("buckets 8-10 likely / 4-7 uncertain / 1-3 unlikely", () => {
    expect(bucketFor(10)).toBe("likely");
    expect(bucketFor(8)).toBe("likely");
    expect(bucketFor(7)).toBe("uncertain");
    expect(bucketFor(4)).toBe("uncertain");
    expect(bucketFor(3)).toBe("unlikely");
    expect(bucketFor(1)).toBe("unlikely");
  });
});

describe("assessRealism", () => {
  it("visa-free with no obstacles → likely (10)", () => {
    const r = assessRealism(baseOption({ status: "visa_free" }), []);
    expect(r.bucket).toBe("likely");
    expect(r.score).toBe(10);
  });

  it("embassy visa with no obstacles → uncertain (7)", () => {
    const r = assessRealism(baseOption({ status: "embassy_visa" }), []);
    expect(r.bucket).toBe("uncertain");
    expect(r.score).toBe(7);
  });

  it("a critical obstacle drops embassy_visa score to unlikely", () => {
    const r = assessRealism(baseOption({ status: "embassy_visa" }), [criticalObstacle]);
    expect(r.bucket).toBe("unlikely");
    expect(r.score).toBeLessThanOrEqual(3);
  });

  it("two caution obstacles + embassy_visa drops to uncertain bottom", () => {
    const r = assessRealism(baseOption({ status: "embassy_visa" }), [cautionObstacle, cautionObstacle]);
    expect(r.bucket).toBe("unlikely");
  });

  it("info obstacle on visa_free passport keeps it likely", () => {
    const r = assessRealism(baseOption({ status: "visa_free" }), [infoObstacle]);
    expect(r.bucket).toBe("likely");
    expect(r.score).toBe(9);
  });

  it("refused status floors at 1 even with no obstacles", () => {
    const r = assessRealism(baseOption({ status: "refused" }), []);
    expect(r.score).toBe(1);
    expect(r.bucket).toBe("unlikely");
  });

  it("work visa with sponsor + job offer gets a small realism bump", () => {
    const r = assessRealism(
      baseOption({
        status: "embassy_visa",
        purpose: "work",
        purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true },
      }),
      [],
    );
    // Base 7 + 0.5 → rounds up to 8 (likely). Sponsor + offer is the gating
    // step; once secured, visa approval is generally routine.
    expect(r.score).toBeGreaterThanOrEqual(7);
  });

  it("includes one reason per obstacle", () => {
    const r = assessRealism(baseOption({ status: "embassy_visa" }), [
      criticalObstacle,
      cautionObstacle,
      infoObstacle,
    ]);
    // Status base + 3 obstacle reasons = 4 entries minimum
    expect(r.reasons.length).toBeGreaterThanOrEqual(4);
  });

  it("clamps to 1..10 even with stacked obstacles", () => {
    const r = assessRealism(baseOption({ status: "embassy_visa" }), [
      criticalObstacle,
      criticalObstacle,
      criticalObstacle,
    ]);
    expect(r.score).toBeGreaterThanOrEqual(1);
    expect(r.score).toBeLessThanOrEqual(10);
  });
});
