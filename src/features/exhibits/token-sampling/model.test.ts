import { describe, expect, it } from "vitest";
import { CANDIDATES } from "./data";
import {
  DEFAULT_TEMPERATURE,
  applyTopK,
  applyTopP,
  entropy,
  sampleIndex,
  softmaxWithTemperature,
  temperatureRegime,
} from "./model";

const LOGITS = CANDIDATES.map((candidate) => candidate.logit);

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

describe("softmaxWithTemperature", () => {
  it("always sums to 1", () => {
    for (const temperature of [0.05, 0.2, 0.8, 1.5, 2]) {
      expect(sum(softmaxWithTemperature(LOGITS, temperature))).toBeCloseTo(1, 8);
    }
  });

  it("sharpens toward the favourite token as temperature drops", () => {
    const low = softmaxWithTemperature(LOGITS, 0.2);
    const high = softmaxWithTemperature(LOGITS, 2);
    const favouriteIndex = LOGITS.indexOf(Math.max(...LOGITS));
    expect(low[favouriteIndex]).toBeGreaterThan(high[favouriteIndex]);
    expect(Math.max(...low)).toBeGreaterThan(Math.max(...high));
  });

  it("guards against near-zero or negative temperature", () => {
    const result = softmaxWithTemperature(LOGITS, 0);
    expect(result.every((value) => Number.isFinite(value))).toBe(true);
    expect(sum(result)).toBeCloseTo(1, 8);
  });

  it("is stable regardless of a shared offset in the logits", () => {
    const shifted = LOGITS.map((logit) => logit + 100);
    const base = softmaxWithTemperature(LOGITS, 0.8);
    const offset = softmaxWithTemperature(shifted, 0.8);
    base.forEach((value, index) => expect(value).toBeCloseTo(offset[index], 8));
  });
});

describe("applyTopK", () => {
  it("keeps exactly k survivors and renormalises them to sum to 1", () => {
    const probabilities = softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE);
    const result = applyTopK(probabilities, 3);
    expect(result.survivingIndices).toHaveLength(3);
    expect(sum(result.probabilities)).toBeCloseTo(1, 8);
    result.survivingIndices.forEach((index) => expect(result.probabilities[index]).toBeGreaterThan(0));
  });

  it("keeps the highest-probability tokens", () => {
    const probabilities = softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE);
    const result = applyTopK(probabilities, 3);
    const ranked = probabilities.map((probability, index) => ({ probability, index })).sort((a, b) => b.probability - a.probability);
    const expectedIndices = ranked.slice(0, 3).map((entry) => entry.index).sort((a, b) => a - b);
    expect(result.survivingIndices).toEqual(expectedIndices);
  });

  it("clamps k to the number of candidates", () => {
    const probabilities = softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE);
    const result = applyTopK(probabilities, 50);
    expect(result.survivingIndices).toHaveLength(probabilities.length);
  });
});

describe("applyTopP", () => {
  it("keeps the minimal prefix whose cumulative mass reaches p", () => {
    const probabilities = softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE);
    const result = applyTopP(probabilities, 0.9);
    const ranked = [...probabilities].sort((a, b) => b - a);
    let cumulative = 0;
    let expectedCount = 0;
    for (const value of ranked) {
      cumulative += value;
      expectedCount += 1;
      if (cumulative >= 0.9) break;
    }
    expect(result.survivingIndices).toHaveLength(expectedCount);
    expect(sum(result.probabilities)).toBeCloseTo(1, 8);
  });

  it("keeps only the favourite token when p is very small", () => {
    const probabilities = softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE);
    const result = applyTopP(probabilities, 0.01);
    const favouriteIndex = probabilities.indexOf(Math.max(...probabilities));
    expect(result.survivingIndices).toEqual([favouriteIndex]);
    expect(result.probabilities[favouriteIndex]).toBeCloseTo(1, 8);
  });

  it("keeps every token when p is 1", () => {
    const probabilities = softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE);
    const result = applyTopP(probabilities, 1);
    expect(result.survivingIndices).toHaveLength(probabilities.length);
  });
});

describe("sampleIndex", () => {
  it("hits the bucket whose cumulative range contains u", () => {
    // Quarters land on exact binary fractions, so cumulative sums have no
    // floating-point drift at the bucket boundaries.
    const distribution = [0.25, 0.25, 0.25, 0.25];
    expect(sampleIndex(distribution, 0)).toBe(0);
    expect(sampleIndex(distribution, 0.1)).toBe(0);
    expect(sampleIndex(distribution, 0.25)).toBe(1);
    expect(sampleIndex(distribution, 0.4)).toBe(1);
    expect(sampleIndex(distribution, 0.5)).toBe(2);
    expect(sampleIndex(distribution, 0.7)).toBe(2);
    expect(sampleIndex(distribution, 0.75)).toBe(3);
    expect(sampleIndex(distribution, 0.999)).toBe(3);
  });

  it("skips zeroed-out (truncated) buckets", () => {
    const distribution = [0, 0.5, 0, 0.5];
    expect(sampleIndex(distribution, 0)).toBe(1);
    expect(sampleIndex(distribution, 0.49)).toBe(1);
    expect(sampleIndex(distribution, 0.5)).toBe(3);
    expect(sampleIndex(distribution, 0.99)).toBe(3);
  });
});

describe("entropy", () => {
  it("is zero for a one-hot distribution", () => {
    expect(entropy([1, 0, 0, 0])).toBeCloseTo(0, 8);
  });

  it("is maximal (log2 n bits) for a uniform distribution", () => {
    const uniform = [0.25, 0.25, 0.25, 0.25];
    expect(entropy(uniform)).toBeCloseTo(2, 8);
  });

  it("rises as temperature rises", () => {
    const low = entropy(softmaxWithTemperature(LOGITS, 0.2));
    const mid = entropy(softmaxWithTemperature(LOGITS, DEFAULT_TEMPERATURE));
    const high = entropy(softmaxWithTemperature(LOGITS, 2));
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });
});

describe("temperatureRegime", () => {
  it("names the near-greedy, balanced and adventurous bands", () => {
    expect(temperatureRegime(0.2)).toBe("near-greedy");
    expect(temperatureRegime(0.5)).toBe("near-greedy");
    expect(temperatureRegime(0.8)).toBe("balanced");
    expect(temperatureRegime(1.29)).toBe("balanced");
    expect(temperatureRegime(1.3)).toBe("adventurous");
    expect(temperatureRegime(2)).toBe("adventurous");
  });
});
