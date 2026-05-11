import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { spainDigitalNomadAdapter } from "./es_digital_nomad";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/es_digital_nomad.html"), "utf8");

describe("Spain Digital Nomad parser", () => {
  it("emits embassy_visa work records targeting ES, excluding EU/EEA/CH", async () => {
    const r = await spainDigitalNomadAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(150);
    expect(r.records.find((rec) => rec.passportIso2 === "FR")).toBeUndefined();
    const usSpain = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "ES",
    );
    expect(usSpain?.purpose).toBe("work");
    expect(usSpain?.label).toContain("Digital Nomad");
  });

  it("captures income threshold and self-sponsored type", async () => {
    const r = await spainDigitalNomadAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.salaryThresholdMinor).toBe(31_752_00);
    expect(m.salaryCurrency).toBe("EUR");
    expect(m.sponsorshipRequired).toBe(false);
    expect(m.sponsorType).toBe("self");
    expect(m.routeToSettlement).toBe(true);
  });

  it("returns parseError on unrelated content", async () => {
    const r = await spainDigitalNomadAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
