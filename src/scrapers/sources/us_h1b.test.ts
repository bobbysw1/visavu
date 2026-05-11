import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { usH1bAdapter } from "./us_h1b";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/us_h1b.html"), "utf8");

describe("US H-1B parser", () => {
  it("emits per-passport embassy_visa / work records targeting US", async () => {
    const r = await usH1bAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    expect(r.records.find((rec) => rec.passportIso2 === "US")).toBeUndefined();
    const sample = r.records[0];
    expect(sample.destinationIso2).toBe("US");
    expect(sample.purpose).toBe("work");
    expect(sample.status).toBe("embassy_visa");
    expect(sample.label).toBe("H-1B Specialty Occupation");
  });

  it("captures sponsor + job offer requirements; no statutory floor", async () => {
    const r = await usH1bAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.sponsorshipRequired).toBe(true);
    expect(m.jobOfferRequired).toBe(true);
    expect(m.salaryThresholdMinor).toBeUndefined();
    expect(m.routeToSettlement).toBe(false);
  });

  it("includes optional Premium Processing fee", async () => {
    const r = await usH1bAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const fees = r.records[0].fees ?? [];
    const premium = fees.find((f) => f.kind === "rush");
    expect(premium).toBeDefined();
    expect(premium?.optional).toBe(true);
  });
});
