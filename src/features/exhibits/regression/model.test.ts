import { describe, expect, it } from "vitest";
import { classificationAccuracy, logisticLoss, meanSquaredLoss, predictLinear, sigmoid } from "./model";

describe("regression model", () => {
  it("evaluates a line from slope and intercept", () => {
    expect(predictLinear(2, 0.75, 0.5)).toBe(2);
  });

  it("the authored linear parameters sit near the loss minimum", () => {
    expect(meanSquaredLoss(0.78, 0.42)).toBeLessThan(meanSquaredLoss(-0.5, 1.5));
  });

  it("the authored logistic boundary classifies the deterministic data", () => {
    expect(classificationAccuracy(0.62, -0.25)).toBe(1);
    expect(logisticLoss(0.62, -0.25)).toBeLessThan(logisticLoss(-1.2, 1.5));
  });

  it("keeps sigmoid outputs between zero and one", () => {
    expect(sigmoid(-10)).toBeGreaterThan(0);
    expect(sigmoid(10)).toBeLessThan(1);
  });
});
