import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { portugalD7Adapter } from "./pt_d7";
import type { FamilyVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/pt_d7.html"), "utf8");

describe("Portugal D7 parser", () => {
  it("emits family/embassy_visa records targeting PT, excluding EU/EEA/CH", async () => {
    const r = await portugalD7Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(150);
    expect(r.records.find((rec) => rec.passportIso2 === "FR")).toBeUndefined();
    const usPt = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "PT",
    );
    expect(usPt?.purpose).toBe("family");
    expect(usPt?.label).toContain("D7");
  });

  it("captures income threshold and route to settlement", async () => {
    const r = await portugalD7Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as FamilyVisaMetadata;
    expect(m.sponsorIncomeThresholdMinor).toBe(9_840_00);
    expect(m.sponsorIncomeCurrency).toBe("EUR");
    expect(m.routeToSettlement).toBe(true);
    expect(m.relationshipTypes).toContain("spouse");
  });

  it("returns parseError on unrelated content", async () => {
    const r = await portugalD7Adapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
