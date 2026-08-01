import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEPARATION,
  POPULATION,
  accuracyOptimalThreshold,
  areaUnderRoc,
  classMeans,
  confusionAt,
  majorityBaseline,
  metricsAt,
  normalCdf,
  rateAbove,
  sweep,
} from "./model";

describe("classification threshold model", () => {
  it("keeps the four confusion cells summing to the population", () => {
    for (const baseRate of [0.1, 1, 12.5, 50]) {
      for (const threshold of [0, 0.25, 0.5, 0.75, 1]) {
        const { truePositives, falsePositives, falseNegatives, trueNegatives } =
          confusionAt(threshold, baseRate, DEFAULT_SEPARATION);
        const total = truePositives + falsePositives + falseNegatives + trueNegatives;
        expect(total).toBeCloseTo(POPULATION, 6);
      }
    }
  });

  it("evaluates the normal CDF to the accuracy the counts rely on", () => {
    // The erf series is accurate to ~1.5e-7, which is finer than one event in
    // a population of 100,000 and far finer than anything the scene displays.
    expect(normalCdf(0.5, 0.5, 0.15)).toBeCloseTo(0.5, 6);
    expect(normalCdf(0.5 + 0.15, 0.5, 0.15)).toBeCloseTo(0.841_344_7, 6);
    expect(normalCdf(0.5 - 0.15, 0.5, 0.15)).toBeCloseTo(0.158_655_3, 6);
  });

  it("separates the classes symmetrically about the centre", () => {
    const { benign, attack } = classMeans(0.4);
    expect(benign).toBeCloseTo(0.3, 10);
    expect(attack).toBeCloseTo(0.7, 10);
    expect((benign + attack) / 2).toBeCloseTo(0.5, 10);
  });

  it("alerts on fewer of each class as the threshold rises", () => {
    const { attack } = classMeans(DEFAULT_SEPARATION);
    let previous = Number.POSITIVE_INFINITY;
    for (let threshold = 0; threshold <= 1.0001; threshold += 0.05) {
      const rate = rateAbove(threshold, attack);
      expect(rate).toBeLessThanOrEqual(previous + 1e-12);
      previous = rate;
    }
  });

  it("reports the contradiction the exhibit is built on: high accuracy, no recall", () => {
    // A rare positive class and the threshold that maximises accuracy.
    const baseRate = 0.5;
    const threshold = accuracyOptimalThreshold(baseRate, DEFAULT_SEPARATION);
    const metrics = metricsAt(threshold, baseRate, DEFAULT_SEPARATION);

    expect(metrics.accuracy).toBeGreaterThan(0.99);
    expect(metrics.recall).toBeLessThan(0.2);
    // And it beats the do-nothing detector by almost nothing.
    expect(metrics.accuracy - majorityBaseline(baseRate)).toBeLessThan(0.01);
  });

  it("collapses precision as the positive class becomes rare, holding the model fixed", () => {
    const threshold = 0.5;
    const common = metricsAt(threshold, 50, DEFAULT_SEPARATION);
    const rare = metricsAt(threshold, 0.1, DEFAULT_SEPARATION);

    // Recall depends only on the model, so it is unchanged by prevalence...
    expect(rare.recall).toBeCloseTo(common.recall, 10);
    // ...while precision falls away entirely.
    expect(common.precision).toBeGreaterThan(0.8);
    expect(rare.precision).toBeLessThan(0.05);
  });

  it("leaves the ROC curve untouched by the base rate that ruins precision", () => {
    const common = sweep(50, DEFAULT_SEPARATION);
    const rare = sweep(0.1, DEFAULT_SEPARATION);

    common.forEach((point, index) => {
      expect(point.falsePositiveRate).toBeCloseTo(rare[index].falsePositiveRate, 10);
      expect(point.truePositiveRate).toBeCloseTo(rare[index].truePositiveRate, 10);
    });
    expect(common[50].precision).toBeGreaterThan(rare[50].precision);
  });

  it("scores a better-separated model higher under the ROC area", () => {
    expect(areaUnderRoc(0.2)).toBeLessThan(areaUnderRoc(0.6));
    expect(areaUnderRoc(0.6)).toBeLessThanOrEqual(1);
    expect(areaUnderRoc(0.2)).toBeGreaterThan(0.5);
  });

  it("never reports an undefined metric when the threshold admits no alerts", () => {
    const metrics = metricsAt(1, 1, DEFAULT_SEPARATION);
    // At the top of the score range fewer than one event in a thousand alerts.
    expect(metrics.alerts).toBeLessThan(POPULATION / 1000);
    for (const value of [metrics.precision, metrics.recall, metrics.f1, metrics.accuracy]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("counts nearly every rare positive as missed when almost nothing alerts", () => {
    const metrics = metricsAt(1, 1, DEFAULT_SEPARATION);
    expect(metrics.falseNegatives).toBeGreaterThan(metrics.truePositives);
    expect(metrics.recall).toBeLessThan(0.02);
  });
});
