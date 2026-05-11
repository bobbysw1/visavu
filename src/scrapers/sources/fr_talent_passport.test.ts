import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { franceTalentPassportAdapter } from "./fr_talent_passport";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/fr_talent_passport.html"), "utf8");

describe("France Talent Passport parser", () => {
  it("emits embassy_visa work records targeting FR, excluding EU/EEA/CH", async () => {
    const r = await franceTalentPassportAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(150);
    expect(r.records.find((rec) => rec.passportIso2 === "DE")).toBeUndefined();
    const usFr = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "FR",
    );
    expect(usFr?.purpose).toBe("work");
    expect(usFr?.label).toContain("Talent Passport");
  });

  it("captures the €41,933 salary threshold and route to settlement", async () => {
    const r = await franceTalentPassportAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.salaryThresholdMinor).toBe(41_933_00);
    expect(m.salaryCurrency).toBe("EUR");
    expect(m.routeToSettlement).toBe(true);
    expect(m.sponsorshipRequired).toBe(true);
  });

  it("returns parseError on unrelated content", async () => {
    const r = await franceTalentPassportAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
