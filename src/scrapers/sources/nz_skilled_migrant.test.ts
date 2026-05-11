import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { newZealandSkilledMigrantAdapter } from "./nz_skilled_migrant";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/nz_skilled_migrant.html"), "utf8");

describe("NZ Skilled Migrant parser", () => {
  it("emits e_visa work records targeting NZ", async () => {
    const r = await newZealandSkilledMigrantAdapter.parse({
      rawText: fixture,
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    expect(r.records.find((rec) => rec.passportIso2 === "NZ")).toBeUndefined();
    const lvNz = r.records.find((rec) => rec.passportIso2 === "LV");
    expect(lvNz?.destinationIso2).toBe("NZ");
    expect(lvNz?.purpose).toBe("work");
    expect(lvNz?.status).toBe("e_visa");
    expect(lvNz?.label).toContain("Skilled Migrant");
  });

  it("captures route to settlement (SMC grants resident visa directly)", async () => {
    const r = await newZealandSkilledMigrantAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.routeToSettlement).toBe(true);
    expect(m.salaryCurrency).toBe("NZD");
  });

  it("returns parseError on unrelated content", async () => {
    const r = await newZealandSkilledMigrantAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
