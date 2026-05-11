import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ukSkilledWorkerAdapter } from "./uk_skilled_worker";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/uk_skilled_worker.html"), "utf8");

describe("UK Skilled Worker adapter parser", () => {
  it("emits one record per non-GB passport country", async () => {
    const result = await ukSkilledWorkerAdapter.parse({ rawText: fixture, fetchUrl: "fixture://uksw" });
    expect(result.parseError).toBeUndefined();
    expect(result.records.length).toBeGreaterThanOrEqual(200);
    // No record for the destination's own passport.
    expect(result.records.find((r) => r.passportIso2 === "GB")).toBeUndefined();
  });

  it("every record targets GB / work / embassy_visa", async () => {
    const result = await ukSkilledWorkerAdapter.parse({ rawText: fixture, fetchUrl: "fixture://uksw" });
    for (const r of result.records.slice(0, 20)) {
      expect(r.destinationIso2).toBe("GB");
      expect(r.purpose).toBe("work");
      expect(r.status).toBe("embassy_visa");
      expect(r.label).toBe("Skilled Worker visa");
    }
  });

  it("extracts the salary threshold from the page text", async () => {
    const result = await ukSkilledWorkerAdapter.parse({ rawText: fixture, fetchUrl: "fixture://uksw" });
    const sample = result.records[0];
    const meta = sample.purposeMetadata as unknown as WorkVisaMetadata;
    // £38,700 in the fixture → 3,870,000 minor units.
    expect(meta.salaryThresholdMinor).toBe(38_700_00);
    expect(meta.salaryCurrency).toBe("GBP");
    expect(meta.sponsorshipRequired).toBe(true);
    expect(meta.sponsorType).toBe("employer");
    expect(meta.jobOfferRequired).toBe(true);
    expect(meta.routeToSettlement).toBe(true);
  });

  it("includes Immigration Health Surcharge as a service fee component", async () => {
    const result = await ukSkilledWorkerAdapter.parse({ rawText: fixture, fetchUrl: "fixture://uksw" });
    const fees = result.records[0].fees ?? [];
    expect(fees.find((f) => f.kind === "base")).toBeDefined();
    expect(fees.find((f) => f.label?.toLowerCase().includes("health surcharge"))).toBeDefined();
  });

  it("primarySourceUrl points at the gov.uk page", async () => {
    const result = await ukSkilledWorkerAdapter.parse({ rawText: fixture, fetchUrl: "fixture://uksw" });
    for (const r of result.records.slice(0, 5)) {
      expect(r.primarySourceUrl).toBe("https://www.gov.uk/skilled-worker-visa");
      expect(r.applicationUrl).toContain("gov.uk/skilled-worker-visa");
    }
  });

  it("returns parseError when the page no longer mentions 'Skilled Worker visa'", async () => {
    const broken = "<html><body><h1>Page redesigned</h1></body></html>";
    const result = await ukSkilledWorkerAdapter.parse({ rawText: broken, fetchUrl: "fixture://broken" });
    expect(result.parseError).toBeDefined();
    expect(result.records).toHaveLength(0);
  });
});
