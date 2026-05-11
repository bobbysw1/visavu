import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ukStudentAdapter } from "./uk_student";
import type { StudyVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/uk_student.html"), "utf8");

describe("UK Student visa adapter parser", () => {
  it("emits a record per non-GB passport, all targeting GB / study / embassy_visa", async () => {
    const r = await ukStudentAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    for (const rec of r.records.slice(0, 10)) {
      expect(rec.destinationIso2).toBe("GB");
      expect(rec.purpose).toBe("study");
      expect(rec.status).toBe("embassy_visa");
      expect(rec.label).toBe("Student visa");
    }
  });

  it("extracts the London financial-proof monthly amount and surfaces it as metadata", async () => {
    const r = await ukStudentAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as StudyVisaMetadata;
    expect(m.financialProofMonthlyMinor).toBe(1483_00);
    expect(m.financialProofCurrency).toBe("GBP");
    expect(m.partTimeWorkAllowedHours).toBe(20);
    expect(m.institutionAccreditationRequired).toBe(true);
  });

  it("primarySourceUrl is gov.uk", async () => {
    const r = await ukStudentAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records[0].primarySourceUrl).toBe("https://www.gov.uk/student-visa");
  });

  it("returns parseError when the page no longer mentions Student visa", async () => {
    const r = await ukStudentAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
