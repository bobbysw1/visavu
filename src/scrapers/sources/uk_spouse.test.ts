import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ukSpouseAdapter } from "./uk_spouse";
import type { FamilyVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/uk_spouse.html"), "utf8");

describe("UK Spouse / partner adapter parser", () => {
  it("emits per-passport family/embassy_visa records targeting GB", async () => {
    const r = await ukSpouseAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    for (const rec of r.records.slice(0, 5)) {
      expect(rec.destinationIso2).toBe("GB");
      expect(rec.purpose).toBe("family");
      expect(rec.status).toBe("embassy_visa");
      expect(rec.label).toBe("Spouse / partner visa");
    }
  });

  it("picks up the highest-published sponsor income threshold (£38,700)", async () => {
    const r = await ukSpouseAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as FamilyVisaMetadata;
    expect(m.sponsorIncomeThresholdMinor).toBe(38_700_00);
    expect(m.sponsorIncomeCurrency).toBe("GBP");
    expect(m.relationshipTypes).toEqual(["spouse", "partner"]);
    expect(m.cohabitationProofRequired).toBe(true);
    expect(m.routeToSettlement).toBe(true);
  });

  it("returns parseError when the page no longer mentions partner/spouse/family", async () => {
    const r = await ukSpouseAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
