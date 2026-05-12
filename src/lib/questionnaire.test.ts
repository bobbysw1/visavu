import { describe, it, expect } from "vitest";
import {
  inferGoal,
  inferProfile,
  timelineToDays,
  capitalToUsd,
  visibleSteps,
  type QuestionnaireAnswers,
} from "./questionnaire";

function answers(o: Partial<QuestionnaireAnswers> = {}): QuestionnaireAnswers {
  return { passportIso2: "GB", goal: "live_a_few_years", ...o };
}

describe("inferGoal", () => {
  it("maps digital_nomad → remote_work", () => {
    expect(inferGoal(answers({ goal: "digital_nomad" }))).toBe("remote_work");
  });

  it("maps retire → retire", () => {
    expect(inferGoal(answers({ goal: "retire" }))).toBe("retire");
  });

  it("upgrades permanent_move to invest when capital ≥ 500k and applicant is retired", () => {
    expect(
      inferGoal(answers({ goal: "permanent_move", investmentCapital: "2m_plus", occupation: "retired" })),
    ).toBe("invest");
  });

  it("leaves permanent_move on live_work for employed engineer", () => {
    expect(
      inferGoal(answers({ goal: "permanent_move", occupation: "engineering_tech", income: "100_200k" })),
    ).toBe("live_work");
  });
});

describe("inferProfile", () => {
  it("HNWI wins over occupation when net worth ≥ $2m", () => {
    expect(
      inferProfile(answers({ occupation: "engineering_tech", netWorth: "5m_plus" })),
    ).toBe("hnwi");
  });

  it("healthcare → doctor", () => {
    expect(inferProfile(answers({ occupation: "healthcare" }))).toBe("doctor");
  });

  it("engineering_tech → engineer", () => {
    expect(inferProfile(answers({ occupation: "engineering_tech" }))).toBe("engineer");
  });

  it("trades → trade_worker", () => {
    expect(inferProfile(answers({ occupation: "trades" }))).toBe("trade_worker");
  });

  it("retired → retiree", () => {
    expect(inferProfile(answers({ occupation: "retired" }))).toBe("retiree");
  });

  it("student → student", () => {
    expect(inferProfile(answers({ occupation: "student" }))).toBe("student");
  });

  it("self-employed → entrepreneur", () => {
    expect(inferProfile(answers({ occupation: "self_employed" }))).toBe("entrepreneur");
  });

  it("remote employer employee → remote_worker", () => {
    expect(inferProfile(answers({ remoteWork: "yes_employer" }))).toBe("remote_worker");
  });

  it("own remote business → entrepreneur", () => {
    expect(inferProfile(answers({ remoteWork: "yes_own_business" }))).toBe("entrepreneur");
  });

  it("high school grad with no occupation → high_school_graduate", () => {
    expect(inferProfile(answers({ educationLevel: "high_school" }))).toBe("high_school_graduate");
  });

  it("invest goal → investor when no other signal", () => {
    expect(inferProfile(answers({ goal: "invest" }))).toBe("investor");
  });
});

describe("timelineToDays / capitalToUsd", () => {
  it("converts Timeline bands to day estimates", () => {
    expect(timelineToDays("0_6_months")).toBe(180);
    expect(timelineToDays("no_rush")).toBe(3650);
  });

  it("converts InvestmentCapital bands to USD point estimates", () => {
    expect(capitalToUsd("none")).toBe(0);
    expect(capitalToUsd("2m_plus")).toBe(2_500_000);
  });
});

describe("visibleSteps", () => {
  it("strips income / capital / family from a tourism-only flow", () => {
    const steps = visibleSteps({ goal: "visit" });
    expect(steps).not.toContain("income_capital");
    expect(steps).not.toContain("family");
    expect(steps).toContain("destination");
  });

  it("keeps capital + family for retire goals", () => {
    const steps = visibleSteps({ goal: "retire" });
    expect(steps).toContain("income_capital");
    expect(steps).toContain("family");
  });
});
