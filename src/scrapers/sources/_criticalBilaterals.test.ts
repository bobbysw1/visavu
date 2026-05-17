/**
 * Regression guard for critical bilateral visa-free relationships that
 * have historically been miscoded in our matrix. Each assertion below
 * documents a real-world bilateral right that the data must reflect.
 *
 * If any of these flip back to "embassy_visa" the test fails loudly — we
 * shipped a bug where Canadian→US tourism showed 10/10 difficulty because
 * the us_b1b2 adapter didn't exclude WHTI nationals. This file makes sure
 * that bug stays fixed.
 */
import { describe, it, expect } from "vitest";
import { usWhtiAdapter } from "./us_whti";
import { ukIrelandCtaAdapter } from "./uk_ireland_cta";
import { auNzTransTasmanAdapter } from "./au_nz_trans_tasman";
import { usB1B2Adapter } from "./us_b1b2";

function findRecord(records: Array<{ passportIso2: string; destinationIso2: string; purpose: string; status: string }>, p: string, d: string, purpose: string) {
  return records.find((r) => r.passportIso2 === p && r.destinationIso2 === d && r.purpose === purpose);
}

describe("critical bilateral visa-free relationships", () => {
  it("CA → US tourism is visa-free under WHTI (regression — was 10/10 difficult)", async () => {
    const raw = await fakeFetch(usWhtiAdapter, "WHTI Western Hemisphere Canadian Bermudian");
    const result = await usWhtiAdapter.parse(raw);
    const record = findRecord(result.records, "CA", "US", "tourism");
    expect(record).toBeDefined();
    expect(record?.status).toBe("visa_free");
  });

  it("BM → US tourism is visa-free under WHTI", async () => {
    const raw = await fakeFetch(usWhtiAdapter, "WHTI Western Hemisphere Canadian Bermudian");
    const result = await usWhtiAdapter.parse(raw);
    const record = findRecord(result.records, "BM", "US", "tourism");
    expect(record).toBeDefined();
    expect(record?.status).toBe("visa_free");
  });

  it("us_b1b2 adapter does NOT emit records for Canadian or Bermudian passport holders", async () => {
    const raw = await fakeFetch(usB1B2Adapter, "B-1 B-2 visitor visa tourism business");
    const result = await usB1B2Adapter.parse(raw);
    const canadianRecords = result.records.filter((r) => r.passportIso2 === "CA");
    const bermudianRecords = result.records.filter((r) => r.passportIso2 === "BM");
    expect(canadianRecords).toHaveLength(0);
    expect(bermudianRecords).toHaveLength(0);
  });

  it("IE → GB and GB → IE are visa-free under Common Travel Area (all purposes)", async () => {
    const raw = await fakeFetch(ukIrelandCtaAdapter, "Common Travel Area Irish citizen CTA");
    const result = await ukIrelandCtaAdapter.parse(raw);
    for (const purpose of ["tourism", "business", "work", "study", "family"]) {
      const ieToGb = findRecord(result.records, "IE", "GB", purpose);
      const gbToIe = findRecord(result.records, "GB", "IE", purpose);
      expect(ieToGb?.status, `IE→GB ${purpose}`).toBe("visa_free");
      expect(gbToIe?.status, `GB→IE ${purpose}`).toBe("visa_free");
    }
  });

  it("NZ → AU and AU → NZ are visa-free under Trans-Tasman (all purposes)", async () => {
    const raw = await fakeFetch(auNzTransTasmanAdapter, "Special Category 444 New Zealand Trans-Tasman");
    const result = await auNzTransTasmanAdapter.parse(raw);
    for (const purpose of ["tourism", "business", "work", "study", "family"]) {
      const nzToAu = findRecord(result.records, "NZ", "AU", purpose);
      const auToNz = findRecord(result.records, "AU", "NZ", purpose);
      expect(nzToAu?.status, `NZ→AU ${purpose}`).toBe("visa_free");
      expect(auToNz?.status, `AU→NZ ${purpose}`).toBe("visa_free");
    }
  });
});

// Stub a fetch context that returns the keyword-matching text the adapter
// expects, avoiding any real network calls in unit tests.
async function fakeFetch(_adapter: unknown, keywordsText: string) {
  return { rawText: keywordsText, fetchUrl: "test://stub" };
}
