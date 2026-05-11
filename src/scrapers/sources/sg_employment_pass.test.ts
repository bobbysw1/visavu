import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { singaporeEmploymentPassAdapter } from "./sg_employment_pass";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/sg_employment_pass.html"), "utf8");

describe("Singapore Employment Pass parser", () => {
  it("emits embassy_visa work records targeting SG, excluding SG itself", async () => {
    const r = await singaporeEmploymentPassAdapter.parse({
      rawText: fixture,
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    expect(r.records.find((rec) => rec.passportIso2 === "SG")).toBeUndefined();
    const inSg = r.records.find((rec) => rec.passportIso2 === "IN");
    expect(inSg?.destinationIso2).toBe("SG");
    expect(inSg?.purpose).toBe("work");
    expect(inSg?.status).toBe("embassy_visa");
    expect(inSg?.label).toBe("Singapore Employment Pass");
  });

  it("captures sponsor + job offer + salary threshold (financial-services tier)", async () => {
    const r = await singaporeEmploymentPassAdapter.parse({
      rawText: fixture,
      fetchUrl: "fixture://",
    });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.sponsorshipRequired).toBe(true);
    expect(m.jobOfferRequired).toBe(true);
    // 6,200 monthly × 12 = 74,400 annual
    expect(m.salaryThresholdMinor).toBe(74_400_00);
    expect(m.salaryCurrency).toBe("SGD");
    expect(m.routeToSettlement).toBe(true);
  });

  it("returns parseError on unrelated content", async () => {
    const r = await singaporeEmploymentPassAdapter.parse({
      rawText: "<html></html>",
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeDefined();
  });
});
