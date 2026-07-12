import { describe, it, expect } from "vitest";
import {
  fitPolynomial,
  rmse,
  generatePresetDataset,
  type XYPoint,
} from "./overfittingMath";

describe("fitPolynomial", () => {
  it("recovers an exact parabola at degree 2", () => {
    const truth = (x: number) => 2 * x * x - 3 * x + 1;
    const points: XYPoint[] = [];
    for (let x = -5; x <= 5; x += 1) {
      points.push({ x, y: truth(x) });
    }

    const fit = fitPolynomial(points, 2);
    const error = rmse(points, fit.predict);

    expect(error).toBeLessThan(1e-6);
  });

  it("keeps train RMSE non-increasing as degree rises on the preset dataset", () => {
    const dataset = generatePresetDataset();
    const trainPoints = dataset.filter((p) => p.split === "train");

    let previous = Infinity;
    for (let degree = 1; degree <= 15; degree++) {
      const fit = fitPolynomial(trainPoints, degree);
      const error = rmse(trainPoints, fit.predict);
      expect(error).toBeLessThanOrEqual(previous + 1e-9);
      previous = error;
    }
  });

  it("shrinks coefficients under a large ridge penalty vs. no penalty", () => {
    const dataset = generatePresetDataset();
    const trainPoints = dataset.filter((p) => p.split === "train");
    const degree = 10;

    const unregularized = fitPolynomial(trainPoints, degree, 0);
    const regularized = fitPolynomial(trainPoints, degree, 1);

    const sumAbs = (coeffs: number[]) =>
      coeffs.reduce((total, c) => total + Math.abs(c), 0);

    expect(sumAbs(regularized.coefficients)).toBeLessThan(
      sumAbs(unregularized.coefficients),
    );
  });

  it("stays finite and accurate when x is far from zero (normalization check)", () => {
    // A smooth quadratic living entirely in [1000, 1010] — without mapping
    // x into [-1, 1] first, a degree-5 Vandermonde fit here would blow up
    // numerically (x^5 for x ~ 1000 is ~1e15).
    const truth = (x: number) => 0.02 * (x - 1005) * (x - 1005) + 7;
    const points: XYPoint[] = [];
    for (let i = 0; i <= 10; i++) {
      const x = 1000 + i;
      points.push({ x, y: truth(x) });
    }

    const fit = fitPolynomial(points, 5);
    const error = rmse(points, fit.predict);

    expect(Number.isFinite(error)).toBe(true);
    expect(error).toBeLessThan(1e-3);
    for (const c of fit.coefficients) {
      expect(Number.isFinite(c)).toBe(true);
    }
  });
});
