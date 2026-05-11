import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { germanyBlueCardAdapter } from "./de_blue_card";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/de_blue_card.html"), "utf8");

describe("Germany EU Blue Card parser", () => {
  it("emits per-passport embassy_visa / work records targeting DE, excluding EU/EEA/CH", async () => {
    const r = await germanyBlueCardAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    // ~220 records (250 minus DE itself, minus 30 EU/EEA/CH).
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    expect(r.records.find((rec) => rec.passportIso2 === "FR")).toBeUndefined();
    expect(r.records.find((rec) => rec.passportIso2 === "DE")).toBeUndefined();
    const inToDe = r.records.find((rec) => rec.passportIso2 === "IN");
    expect(inToDe?.destinationIso2).toBe("DE");
    expect(inToDe?.purpose).toBe("work");
    expect(inToDe?.status).toBe("embassy_visa");
  });

  it("captures the €45,300 salary threshold", async () => {
    const r = await germanyBlueCardAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.salaryThresholdMinor).toBe(45_300_00);
    expect(m.salaryCurrency).toBe("EUR");
    expect(m.routeToSettlement).toBe(true);
  });

  it("returns parseError on unrelated content", async () => {
    const r = await germanyBlueCardAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
