import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { auSubclass482Adapter } from "./au_subclass_482";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/au_subclass_482.html"), "utf8");

describe("AU Subclass 482 (Skills in Demand) parser", () => {
  it("emits per-passport embassy_visa / work records targeting AU", async () => {
    const r = await auSubclass482Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    for (const rec of r.records.slice(0, 5)) {
      expect(rec.destinationIso2).toBe("AU");
      expect(rec.purpose).toBe("work");
      expect(rec.status).toBe("embassy_visa");
      expect(rec.label).toContain("Skills in Demand");
    }
  });

  it("captures the Core Skills Income Threshold (AUD 73,150)", async () => {
    const r = await auSubclass482Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.salaryThresholdMinor).toBe(73_150_00);
    expect(m.salaryCurrency).toBe("AUD");
    expect(m.sponsorshipRequired).toBe(true);
    expect(m.routeToSettlement).toBe(true);
  });

  it("returns parseError on unrelated content", async () => {
    const r = await auSubclass482Adapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
