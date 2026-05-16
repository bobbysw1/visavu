import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { auSubclass601Adapter } from "./au_subclass_601";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/au_subclass_601.html"), "utf8");

describe("Australia ETA (Subclass 601) parser", () => {
  it("emits visa_free_with_eta records for the 10 eligible nationalities × tourism + business", async () => {
    const r = await auSubclass601Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    // 10 nationalities × 2 purposes = 20 records (added GB May 2026 — British
    // passport holders use ETA 601, not the EU-only eVisitor 651).
    expect(r.records.length).toBe(20);
    const usT = r.records.find(
      (rec) => rec.passportIso2 === "US" && rec.destinationIso2 === "AU" && rec.purpose === "tourism",
    );
    expect(usT?.status).toBe("visa_free_with_eta");
    expect(usT?.maxStayDays).toBe(90);
    // GB explicitly checked — its absence was the bug that triggered this change.
    const gbT = r.records.find(
      (rec) => rec.passportIso2 === "GB" && rec.destinationIso2 === "AU" && rec.purpose === "tourism",
    );
    expect(gbT?.status).toBe("visa_free_with_eta");
  });

  it("AUD 20 service fee captured", async () => {
    const r = await auSubclass601Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const fee = r.records[0].fees?.[0];
    expect(fee?.amountMinor).toBe(2000);
    expect(fee?.currency).toBe("AUD");
    expect(fee?.kind).toBe("service");
  });

  it("does NOT emit records for EU eVisitor nationalities (e.g. Germany)", async () => {
    const r = await auSubclass601Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "DE")).toBeUndefined();
  });

  it("returns parseError on unrelated content", async () => {
    const r = await auSubclass601Adapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
