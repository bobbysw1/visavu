import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { schengenShortStayAdapter } from "./schengen_short_stay";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/schengen_short_stay.html"), "utf8");

describe("Schengen short-stay (Reg 2018/1806) parser", () => {
  it("emits thousands of records spanning Annex I + II × 27 Schengen states", async () => {
    const r = await schengenShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(3000);
    expect(r.records.length).toBeLessThan(6000);
  });

  it("US passport is visa-free into Schengen states (Annex II)", async () => {
    const r = await schengenShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const usToFr = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "FR" && rec.purpose === "tourism",
    );
    expect(usToFr).toBeDefined();
    expect(usToFr?.status).toBe("visa_free");
    expect(usToFr?.maxStayDays).toBe(90);
    expect(usToFr?.blocDerivedFrom).toBe("schengen");
  });

  it("Indian passport requires a Schengen Type C visa (Annex I)", async () => {
    const r = await schengenShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const inToDe = r.records.find(
      (rec) => rec.passportIso2 === "IN" && rec.destinationIso2 === "DE" && rec.purpose === "tourism",
    );
    expect(inToDe).toBeDefined();
    expect(inToDe?.status).toBe("embassy_visa");
    expect(inToDe?.label).toContain("Type C");
    const baseFee = inToDe?.fees?.find((f) => f.kind === "base");
    expect(baseFee?.amountMinor).toBe(9000); // €90.00
    expect(baseFee?.currency).toBe("EUR");
  });

  it("does not emit records for passports not listed in either Annex", async () => {
    const r = await schengenShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    // North Korea (KP) IS in Annex I — present. But Niue (NU) is in neither.
    const niueToFr = r.records.find(
      (rec) => rec.passportIso2 === "NU" && rec.destinationIso2 === "FR",
    );
    expect(niueToFr).toBeUndefined();
  });

  it("does not emit Schengen-state-to-itself records", async () => {
    const r = await schengenShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const selfRecord = r.records.find((rec) => rec.passportIso2 === rec.destinationIso2);
    expect(selfRecord).toBeUndefined();
  });

  it("returns parseError when eur-lex no longer serves the regulation", async () => {
    const r = await schengenShortStayAdapter.parse({ rawText: "<html>No regulation here</html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
