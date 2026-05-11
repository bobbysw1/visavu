import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { canadaEtaAdapter } from "./ca_eta";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/ca_eta.html"), "utf8");

describe("Canada eTA parser", () => {
  it("emits visa_free_with_eta records targeting CA, excluding US passports", async () => {
    const r = await canadaEtaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(100);
    expect(r.records.find((rec) => rec.passportIso2 === "US")).toBeUndefined();
    const auTourism = r.records.find(
      (rec) => rec.passportIso2 === "AU" && rec.destinationIso2 === "CA" && rec.purpose === "tourism",
    );
    expect(auTourism?.status).toBe("visa_free_with_eta");
    expect(auTourism?.maxStayDays).toBe(180);
  });

  it("CAD 7 fee + 5-year validity captured", async () => {
    const r = await canadaEtaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const sample = r.records[0];
    expect(sample.fees?.[0].amountMinor).toBe(700);
    expect(sample.fees?.[0].currency).toBe("CAD");
    expect(sample.validityDays).toBe(5 * 365);
  });

  it("returns parseError on unrelated content", async () => {
    const r = await canadaEtaAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
