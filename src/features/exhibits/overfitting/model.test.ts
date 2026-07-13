import { describe, expect, it } from "vitest";
import {
  DEFAULT_DEGREE,
  DEFAULT_SEED,
  DEGREE_RANGE,
  errorByDegree,
  fitPolynomial,
  meanSquaredError,
  nextSeed,
  predict,
  regimeAtDegree,
  samplePoints,
  trueFunction,
} from "./model";

describe("overfitting model", () => {
  it("samples the same points for the same seed", () => {
    const first = samplePoints(DEFAULT_SEED);
    const second = samplePoints(DEFAULT_SEED);
    expect(first).toEqual(second);
    expect(first.train).toHaveLength(16);
    expect(first.validation).toHaveLength(12);
  });

  it("samples different points once the seed advances", () => {
    const first = samplePoints(DEFAULT_SEED);
    const second = samplePoints(nextSeed(DEFAULT_SEED));
    expect(second).not.toEqual(first);
  });

  it("cycles the seed instead of growing without bound", () => {
    let seed = DEFAULT_SEED;
    for (let i = 0; i < 500; i += 1) seed = nextSeed(seed);
    expect(seed).toBeGreaterThanOrEqual(DEFAULT_SEED);
    expect(seed).toBeLessThan(DEFAULT_SEED + 100);
  });

  it("fits the true function closely at a moderate degree", () => {
    const { train } = samplePoints(DEFAULT_SEED);
    const coefficients = fitPolynomial(train, DEFAULT_DEGREE);
    expect(meanSquaredError(coefficients, train)).toBeLessThan(0.05);

    const truthSamples = Array.from({ length: 20 }, (_, index) => index / 19).map((x) => ({
      x,
      y: trueFunction(x),
    }));
    expect(meanSquaredError(coefficients, truthSamples)).toBeLessThan(0.05);
  });

  it("shows a high-degree fit overfitting relative to a moderate one", () => {
    const { train, validation } = samplePoints(DEFAULT_SEED);
    const moderate = fitPolynomial(train, DEFAULT_DEGREE);
    const flexible = fitPolynomial(train, DEGREE_RANGE.max);

    const moderateTrainError = meanSquaredError(moderate, train);
    const flexibleTrainError = meanSquaredError(flexible, train);
    const moderateValidationError = meanSquaredError(moderate, validation);
    const flexibleValidationError = meanSquaredError(flexible, validation);

    expect(flexibleTrainError).toBeLessThan(moderateTrainError);
    expect(flexibleValidationError).toBeGreaterThan(moderateValidationError);
  });

  it("predicts a constant term equal to the intercept coefficient", () => {
    const coefficients = [0.5, -1.2, 2.1];
    expect(predict(coefficients, 0)).toBeCloseTo(0.5, 10);
    expect(predict(coefficients, 1)).toBeCloseTo(0.5 - 1.2 + 2.1, 10);
  });

  it("reports a curve with one entry per degree in range", () => {
    const { train, validation } = samplePoints(DEFAULT_SEED);
    const curve = errorByDegree(train, validation);
    const expectedLength = DEGREE_RANGE.max - DEGREE_RANGE.min + 1;

    expect(curve.degrees).toHaveLength(expectedLength);
    expect(curve.trainError).toHaveLength(expectedLength);
    expect(curve.validationError).toHaveLength(expectedLength);
    curve.degrees.forEach((degree, index) => expect(degree).toBe(DEGREE_RANGE.min + index));
  });

  it("labels regimes from where validation error sits relative to its minimum", () => {
    const { train, validation } = samplePoints(DEFAULT_SEED);
    const curve = errorByDegree(train, validation);

    expect(regimeAtDegree(curve, DEGREE_RANGE.min)).toBe("underfit");
    expect(regimeAtDegree(curve, DEFAULT_DEGREE)).toBe("good fit");
    expect(regimeAtDegree(curve, DEGREE_RANGE.max)).toBe("overfit");
  });
});
