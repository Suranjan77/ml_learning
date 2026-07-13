import { describe, expect, it } from "vitest";
import { POINTS, axisFromAngle, mean, normalizeAxisAngle, principalAngle, projectionStats } from "./model";

describe("PCA model", () => {
  it("centres the authored dataset", () => {
    const centre = mean(POINTS);
    expect(centre.x).toBeCloseTo(0.35, 1);
    expect(centre.y).toBeCloseTo(-0.2, 1);
  });

  it("the principal direction maximises variance and minimises reconstruction error", () => {
    const angle = principalAngle(POINTS);
    const principal = projectionStats(POINTS, angle);
    const perpendicular = projectionStats(POINTS, angle + Math.PI / 2);
    expect(principal.variance).toBeGreaterThan(perpendicular.variance);
    expect(principal.reconstructionError).toBeLessThan(perpendicular.reconstructionError);
  });

  it("normalises equivalent undirected axes into the slider range", () => {
    const original = Math.PI * 0.7;
    const normalized = normalizeAxisAngle(original);
    const first = axisFromAngle(original);
    const second = axisFromAngle(normalized);

    expect(normalized).toBeGreaterThanOrEqual(-Math.PI / 2);
    expect(normalized).toBeLessThanOrEqual(Math.PI / 2);
    expect(Math.abs(first.x)).toBeCloseTo(Math.abs(second.x));
    expect(Math.abs(first.y)).toBeCloseTo(Math.abs(second.y));
  });
});
