import { describe, it, expect } from "vitest";
import { COUNTRY_METRICS, metricsFor } from "./countryMetrics";
import { TOP_DESTINATIONS } from "./countries";

describe("country metrics coverage", () => {
  it("covers at least 130 destinations (P17 target)", () => {
    expect(Object.keys(COUNTRY_METRICS).length).toBeGreaterThanOrEqual(130);
  });

  it("covers every TOP_DESTINATION", () => {
    const missing = TOP_DESTINATIONS.filter((iso) => !COUNTRY_METRICS[iso]);
    expect(missing, `missing TOP_DESTINATIONS: ${missing.join(", ")}`).toEqual([]);
  });

  it("each entry's iso2 field matches its key", () => {
    for (const [key, m] of Object.entries(COUNTRY_METRICS)) {
      expect(m.iso2, `mismatch at ${key}`).toBe(key);
    }
  });

  it("metricsFor returns null for unknown countries and the entry for known ones", () => {
    expect(metricsFor("US")?.iso2).toBe("US");
    expect(metricsFor("ZZ")).toBeNull();
  });

  it("metric ranges look sane where present", () => {
    for (const [key, m] of Object.entries(COUNTRY_METRICS)) {
      if (m.avgSalaryUsd != null) {
        expect(m.avgSalaryUsd, `salary at ${key}`).toBeGreaterThan(0);
        expect(m.avgSalaryUsd, `salary at ${key}`).toBeLessThan(200_000);
      }
      if (m.costOfLivingIndex != null) {
        expect(m.costOfLivingIndex, `col at ${key}`).toBeGreaterThan(0);
        expect(m.costOfLivingIndex, `col at ${key}`).toBeLessThan(200);
      }
      if (m.topTaxRatePct != null) {
        expect(m.topTaxRatePct, `tax at ${key}`).toBeGreaterThanOrEqual(0);
        expect(m.topTaxRatePct, `tax at ${key}`).toBeLessThanOrEqual(60);
      }
      if (m.healthcareIndex != null) {
        expect(m.healthcareIndex, `health at ${key}`).toBeGreaterThanOrEqual(0);
        expect(m.healthcareIndex, `health at ${key}`).toBeLessThanOrEqual(100);
      }
      if (m.safetyGpiRank != null) {
        expect(m.safetyGpiRank, `gpi at ${key}`).toBeGreaterThanOrEqual(1);
        expect(m.safetyGpiRank, `gpi at ${key}`).toBeLessThanOrEqual(163);
      }
      if (m.permanentResidencyYears != null) {
        expect(m.permanentResidencyYears, `pr at ${key}`).toBeGreaterThanOrEqual(0);
        expect(m.permanentResidencyYears, `pr at ${key}`).toBeLessThanOrEqual(30);
      }
      expect(m.asOf, `asOf at ${key}`).toMatch(/^\d{4}$/);
    }
  });
});
