import { describe, expect, it } from "vitest";
import {
  BOUNDARY_RADIUS,
  buildConcentricDataset,
  depthOrder,
  MAX_RADIUS,
  projectPoint,
  radialFeatureKernel,
  radialFeatureMap,
  radialLift,
  SEPARATING_HEIGHT,
  splitByPlane,
} from "./model";

describe("kernel trick exemplar model", () => {
  it("builds the same deterministic core-and-ring dataset", () => {
    expect(buildConcentricDataset()).toEqual(buildConcentricDataset());
    expect(buildConcentricDataset()).toHaveLength(23);
    expect(buildConcentricDataset().filter((point) => point.label === 1)).toHaveLength(9);
  });

  it("lifts points by normalized squared radial distance", () => {
    expect(radialLift(0, 0)).toBe(0);
    expect(radialLift(MAX_RADIUS, 0)).toBeCloseTo(1);
    expect(radialLift(1, 0)).toBeCloseTo(1 / MAX_RADIUS ** 2);
  });

  it("computes the kernel induced by the feature map", () => {
    expect(radialFeatureMap(1, 0)).toEqual([1, 0, radialLift(1, 0)]);
    const first = radialFeatureMap(1.2, -0.4);
    const second = radialFeatureMap(-0.3, 0.8);
    const dotProduct = first.reduce((sum, value, index) => sum + value * second[index], 0);
    expect(radialFeatureKernel([1.2, -0.4], [-0.3, 0.8])).toBeCloseTo(dotProduct);
  });

  it("places the core below and ring above the separating plane", () => {
    const groups = splitByPlane(buildConcentricDataset());
    expect(groups.below.every((point) => point.label === 1)).toBe(true);
    expect(groups.above.every((point) => point.label === 0)).toBe(true);
  });

  it("maps the separating height to the projected circular radius", () => {
    expect(radialLift(BOUNDARY_RADIUS, 0)).toBeCloseTo(SEPARATING_HEIGHT);
  });

  it("clamps projection lift and returns points in screen depth order", () => {
    expect(projectPoint(1, 1, 1, -1)).toEqual(projectPoint(1, 1, 1, 0));
    expect(projectPoint(1, 1, 1, 2)).toEqual(projectPoint(1, 1, 1, 1));
    const ordered = depthOrder(buildConcentricDataset(), 1).map((point) => projectPoint(point.x, point.y, point.z, 1).y);
    expect(ordered).toEqual([...ordered].sort((a, b) => a - b));
  });
});
