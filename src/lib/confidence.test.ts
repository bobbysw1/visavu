import { describe, it, expect } from "vitest";
import {
  fieldCorrectness,
  recordCorrectness,
  freshnessBucket,
  combinedBucket,
  type SourceAssertion,
} from "./confidence";

const today = new Date("2026-05-10T00:00:00Z");

function source(
  id: string,
  kind: SourceAssertion["sourceKind"],
  values: Record<string, unknown>,
  daysAgo = 0,
): SourceAssertion {
  return {
    sourceId: id,
    sourceKind: kind,
    values,
    fetchedAt: new Date(today.getTime() - daysAgo * 86400000),
  };
}

describe("fieldCorrectness", () => {
  it("returns 'unverified' with no sources", () => {
    expect(fieldCorrectness("status", [])).toBe("unverified");
  });

  it("returns 'high' for a single primary-authoritative government source (weight >= 1.0)", () => {
    // status weight for government is 1.0 by default — that's the canonical
    // source for VWP, gov.uk pages, etc.
    const s = [source("gov_us", "government", { status: "visa_free_with_eta" })];
    expect(fieldCorrectness("status", s)).toBe("high");
  });

  it("returns 'medium' for a single near-authority source (e.g. embassy, weight ~0.95)", () => {
    const s = [source("embassy_uk", "embassy", { status: "visa_free_with_eta" })];
    expect(fieldCorrectness("status", s)).toBe("medium");
  });

  it("returns 'high' when 2+ sources agree and one is government-tier", () => {
    const s = [
      source("gov_us", "government", { status: "visa_free_with_eta" }),
      source("embassy_uk", "embassy", { status: "visa_free_with_eta" }),
    ];
    expect(fieldCorrectness("status", s)).toBe("high");
  });

  it("downgrades when sources disagree", () => {
    const s = [
      source("gov_us", "government", { status: "visa_free_with_eta" }),
      source("wiki", "wikipedia", { status: "embassy_visa" }),
    ];
    // Government still dominates by weight, but agreement is split — mediums.
    const result = fieldCorrectness("status", s);
    expect(["medium", "low"]).toContain(result);
  });

  it("treats Wikipedia-only as low confidence on cost (Wikipedia weight is 0.3)", () => {
    const s = [source("wiki", "wikipedia", { cost: 8000 })];
    expect(fieldCorrectness("cost", s)).toBe("low");
  });
});

describe("recordCorrectness", () => {
  it("is the worst of load-bearing field correctnesses", () => {
    const s = [
      source("gov_us", "government", {
        status: "visa_free_with_eta",
        cost: 2100,
        max_stay_days: 90,
      }),
      source("embassy", "embassy", {
        status: "visa_free_with_eta",
        cost: 2100,
        max_stay_days: 90,
      }),
    ];
    expect(recordCorrectness(s)).toBe("high");
  });

  it("a single government source asserting all load-bearing fields reads as 'high'", () => {
    // Government weights are 1.0 across status/cost/max_stay_days, so the
    // single-source primary-authoritative rule kicks in for each field.
    const s = [
      source("gov_us", "government", {
        status: "visa_free_with_eta",
        cost: 2100,
        max_stay_days: 90,
      }),
    ];
    expect(recordCorrectness(s)).toBe("high");
  });

  it("drops below high when a load-bearing field is unsourced", () => {
    // Wikipedia covers status (low weight) but no one asserts cost — that
    // unsourced field downgrades the whole record.
    const s = [source("wiki", "wikipedia", { status: "visa_free_with_eta" })];
    expect(recordCorrectness(s)).not.toBe("high");
  });
});

describe("freshnessBucket", () => {
  it("returns unverified when never verified", () => {
    expect(freshnessBucket(null, today)).toBe("unverified");
  });

  it("returns high within 30 days", () => {
    const d = new Date(today.getTime() - 15 * 86400000);
    expect(freshnessBucket(d, today)).toBe("high");
  });

  it("returns medium between 30 and 90 days", () => {
    const d = new Date(today.getTime() - 60 * 86400000);
    expect(freshnessBucket(d, today)).toBe("medium");
  });

  it("returns low between 90 and 180 days", () => {
    const d = new Date(today.getTime() - 120 * 86400000);
    expect(freshnessBucket(d, today)).toBe("low");
  });

  it("returns unverified beyond 180 days", () => {
    const d = new Date(today.getTime() - 200 * 86400000);
    expect(freshnessBucket(d, today)).toBe("unverified");
  });
});

describe("combinedBucket", () => {
  it("takes the worse of correctness and freshness", () => {
    expect(combinedBucket("high", "low")).toBe("low");
    expect(combinedBucket("low", "high")).toBe("low");
    expect(combinedBucket("high", "unverified")).toBe("unverified");
    expect(combinedBucket("medium", "high")).toBe("medium");
  });
});
