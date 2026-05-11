import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { usB1B2Adapter } from "./us_b1b2";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/us_b1b2.html"), "utf8");

describe("US B1/B2 visitor visa parser", () => {
  it("emits both tourism and business records per non-VWP non-US passport", async () => {
    const r = await usB1B2Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();

    const inToUsTourism = r.records.find(
      (rec) => rec.passportIso2 === "IN" && rec.destinationIso2 === "US" && rec.purpose === "tourism",
    );
    const inToUsBusiness = r.records.find(
      (rec) => rec.passportIso2 === "IN" && rec.destinationIso2 === "US" && rec.purpose === "business",
    );
    expect(inToUsTourism?.status).toBe("embassy_visa");
    expect(inToUsTourism?.label).toContain("B-2");
    expect(inToUsBusiness?.status).toBe("embassy_visa");
    expect(inToUsBusiness?.label).toContain("B-1");
  });

  it("does NOT emit records for VWP nationalities (handled by us_visa_waiver_program adapter)", async () => {
    const r = await usB1B2Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const deTourism = r.records.find(
      (rec) => rec.passportIso2 === "DE" && rec.destinationIso2 === "US" && rec.purpose === "tourism",
    );
    expect(deTourism).toBeUndefined();
  });

  it("does NOT emit US-passport-to-US records", async () => {
    const r = await usB1B2Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "US")).toBeUndefined();
  });

  it("MRV fee is $185 USD", async () => {
    const r = await usB1B2Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const sample = r.records[0];
    const fee = sample.fees?.find((f) => f.kind === "base");
    expect(fee?.amountMinor).toBe(18500);
    expect(fee?.currency).toBe("USD");
  });

  it("returns parseError when page does not match expected wording", async () => {
    const r = await usB1B2Adapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
