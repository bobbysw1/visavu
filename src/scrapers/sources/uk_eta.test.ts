import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ukEtaAdapter } from "./uk_eta";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/uk_eta.html"), "utf8");

describe("UK ETA parser", () => {
  it("emits visa_free_with_eta records for tourism + business + transit", async () => {
    const r = await ukEtaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(100);
    const usTourism = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "GB" && rec.purpose === "tourism",
    );
    const usBusiness = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "GB" && rec.purpose === "business",
    );
    expect(usTourism?.status).toBe("visa_free_with_eta");
    expect(usBusiness?.status).toBe("visa_free_with_eta");
    expect(usTourism?.maxStayDays).toBe(180);
  });

  it("ETA fee captured (£16)", async () => {
    const r = await ukEtaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const fee = r.records[0].fees?.[0];
    expect(fee?.amountMinor).toBe(1600);
    expect(fee?.currency).toBe("GBP");
  });

  it("does not emit records for visa-required nationalities (e.g. Indian passport)", async () => {
    const r = await ukEtaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "IN")).toBeUndefined();
  });

  it("returns parseError on unrelated content", async () => {
    const r = await ukEtaAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
