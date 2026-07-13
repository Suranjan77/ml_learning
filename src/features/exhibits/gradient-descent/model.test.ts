import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEARNING_RATE,
  DEFAULT_START,
  assessPath,
  assessStep,
  contourPoints,
  descentPath,
  gradientAt,
  initialState,
  learningRegime,
  lossAt,
  multimodalMinima,
  principalCoordinates,
} from "./model";

describe("gradient descent model", () => {
  it("has an analytic gradient that agrees with finite differences", () => {
    const point = { x: 1.2, y: -0.7 };
    const epsilon = 1e-5;
    for (const surface of ["bowl", "valley"] as const) {
      const gradient = gradientAt(point, surface);
      const dx = (lossAt({ x: point.x + epsilon, y: point.y }, surface) - lossAt({ x: point.x - epsilon, y: point.y }, surface)) / (2 * epsilon);
      const dy = (lossAt({ x: point.x, y: point.y + epsilon }, surface) - lossAt({ x: point.x, y: point.y - epsilon }, surface)) / (2 * epsilon);
      expect(gradient.x).toBeCloseTo(dx, 5);
      expect(gradient.y).toBeCloseTo(dy, 5);
    }
  });

  it("produces a deterministic default path that reduces the loss", () => {
    expect(initialState()).toEqual(initialState(DEFAULT_START, "bowl"));
    const first = descentPath();
    const second = descentPath(DEFAULT_START, DEFAULT_LEARNING_RATE, "bowl");
    expect(first).toEqual(second);
    expect(first.at(-1)!.loss).toBeLessThan(first[0].loss);
  });

  it("makes overshoot visible on the narrow valley", () => {
    const path = descentPath(DEFAULT_START, 0.9, "valley", 2);
    const first = assessStep(path[0], path[1], "valley");
    expect(first.behaviour).toBe("overshoot");
    expect(principalCoordinates(path[0]).y * principalCoordinates(path[1]).y).toBeLessThan(0);
    expect(first.lossDelta).toBeLessThan(0);
    expect(learningRegime(0.9, "valley")).toBe("crossing");
  });

  it("identifies a learning rate that makes valley loss grow", () => {
    const path = descentPath(DEFAULT_START, 1.2, "valley", 1);
    const result = assessStep(path[0], path[1], "valley");
    expect(result.behaviour).toBe("diverging");
    expect(result.lossDelta).toBeGreaterThan(0);
    expect(learningRegime(1.2, "valley")).toBe("diverging");
  });

  it("finds the deterministic stability boundary from the computed valley path", () => {
    const stable = assessPath(descentPath(DEFAULT_START, 1.04, "valley"), "valley");
    const unstable = assessPath(descentPath(DEFAULT_START, 1.06, "valley"), "valley");

    expect(stable.behaviour).toBe("oscillating");
    expect(stable.lossDelta).toBeLessThan(0);
    expect(stable.crossings).toBeGreaterThan(0);
    expect(unstable.behaviour).toBe("diverging");
    expect(unstable.lossDelta).toBeGreaterThan(0);
  });

  it("draws contours whose points have the requested loss", () => {
    for (const surface of ["bowl", "valley"] as const) {
      contourPoints(surface, 2.4, 24).forEach((point) => {
        expect(lossAt(point, surface)).toBeCloseTo(2.4, 8);
      });
    }
  });

  it("contains distinct local minima above the global multimodal minimum", () => {
    const minima = multimodalMinima();
    expect(minima.length).toBeGreaterThan(4);
    expect(minima[0].loss).toBeCloseTo(0, 3);
    expect(minima.some((minimum) => minimum.loss > 0.5)).toBe(true);
  });

  it("takes two deterministic starts to different multimodal basins", () => {
    const local = descentPath(DEFAULT_START, DEFAULT_LEARNING_RATE, "multimodal", 80).at(-1)!;
    const global = descentPath({ x: 0.4, y: 0.4 }, DEFAULT_LEARNING_RATE, "multimodal", 80).at(-1)!;

    expect(Math.hypot(local.x - global.x, local.y - global.y)).toBeGreaterThan(1);
    expect(local.loss).toBeGreaterThan(1);
    expect(global.loss).toBeCloseTo(0, 6);
  });
});
