import { describe, it, expect } from "vitest";
import {
  ALL_PURPOSES,
  PURPOSE_CATEGORY,
  PURPOSE_LABEL,
  PURPOSE_DESCRIPTION,
  PURPOSE_ABBR,
  PURPOSES_BY_CATEGORY,
  CATEGORY_LABEL,
  isValidPurpose,
  type Purpose,
  type PurposeCategory,
} from "./types";

describe("purpose taxonomy", () => {
  it("ALL_PURPOSES has 7 entries: 3 short-stay, 3 long-stay, 1 official", () => {
    expect(ALL_PURPOSES).toHaveLength(7);
    expect(ALL_PURPOSES).toContain("tourism");
    expect(ALL_PURPOSES).toContain("business");
    expect(ALL_PURPOSES).toContain("transit");
    expect(ALL_PURPOSES).toContain("work");
    expect(ALL_PURPOSES).toContain("study");
    expect(ALL_PURPOSES).toContain("family");
    expect(ALL_PURPOSES).toContain("diplomatic");
  });

  it("every purpose has a category, label, description, and emoji", () => {
    for (const p of ALL_PURPOSES) {
      expect(PURPOSE_CATEGORY[p]).toBeDefined();
      expect(PURPOSE_LABEL[p]).toBeDefined();
      expect(PURPOSE_DESCRIPTION[p]).toBeDefined();
      expect(PURPOSE_ABBR[p]).toBeDefined();
    }
  });

  it("PURPOSES_BY_CATEGORY partitions ALL_PURPOSES with no gaps or overlaps", () => {
    const cats: PurposeCategory[] = ["short_stay", "long_stay", "official"];
    const flattened = cats.flatMap((c) => PURPOSES_BY_CATEGORY[c]);
    expect(new Set(flattened)).toEqual(new Set(ALL_PURPOSES));
    // No purpose appears in two categories.
    expect(flattened.length).toBe(ALL_PURPOSES.length);
  });

  it("category labels are present for all 3 categories", () => {
    expect(CATEGORY_LABEL.short_stay).toBeDefined();
    expect(CATEGORY_LABEL.long_stay).toBeDefined();
    expect(CATEGORY_LABEL.official).toBeDefined();
  });

  it("isValidPurpose narrows correctly", () => {
    expect(isValidPurpose("work")).toBe(true);
    expect(isValidPurpose("family")).toBe(true);
    expect(isValidPurpose("diplomatic")).toBe(true);
    expect(isValidPurpose("retirement")).toBe(false);
    expect(isValidPurpose("")).toBe(false);
    expect(isValidPurpose("WORK")).toBe(false); // case-sensitive
  });

  it("category mapping is correct for each purpose", () => {
    const expected: Record<Purpose, PurposeCategory> = {
      tourism: "short_stay",
      business: "short_stay",
      transit: "short_stay",
      work: "long_stay",
      study: "long_stay",
      family: "long_stay",
      diplomatic: "official",
    };
    for (const p of ALL_PURPOSES) {
      expect(PURPOSE_CATEGORY[p]).toBe(expected[p]);
    }
  });
});
