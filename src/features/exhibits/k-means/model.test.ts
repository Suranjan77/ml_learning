import { describe, expect, it } from "vitest";
import {
  BAD_INITIAL_CENTROIDS_K3,
  DATASET,
  DEFAULT_MAX_ITERATIONS,
  INITIAL_CENTROIDS,
  assignPoints,
  hasConverged,
  inertia,
  runToConvergence,
  squaredDistance,
  updateCentroids,
  type Point,
} from "./model";

describe("k-means model", () => {
  it("assigns every point to its nearest centroid", () => {
    const centroids: Point[] = [{ x: -4, y: 0 }, { x: 4, y: 0 }];
    const points: Point[] = [{ x: -3.9, y: 0.1 }, { x: 3.8, y: -0.2 }, { x: 3.9, y: 5 }];
    const assignments = assignPoints(points, centroids);

    expect(assignments).toEqual([0, 1, 1]);
    points.forEach((point, index) => {
      const chosen = centroids[assignments[index]];
      const other = centroids[1 - assignments[index]];
      expect(squaredDistance(point, chosen)).toBeLessThanOrEqual(squaredDistance(point, other));
    });
  });

  it("updates each centroid to the mean of its assigned points", () => {
    const points: Point[] = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 10, y: 10 }];
    const assignments = [0, 0, 1];
    const updated = updateCentroids(points, assignments, [{ x: -1, y: -1 }, { x: 1, y: 1 }]);

    expect(updated[0]).toEqual({ x: 1, y: 0 });
    expect(updated[1]).toEqual({ x: 10, y: 10 });
  });

  it("keeps a previous centroid when its cluster receives no points", () => {
    const points: Point[] = [{ x: 0, y: 0 }, { x: 0.1, y: 0 }];
    const centroids: Point[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }];
    const assignments = assignPoints(points, centroids);

    expect(assignments.every((cluster) => cluster === 0)).toBe(true);
    const updated = updateCentroids(points, assignments, centroids);
    expect(updated[1]).toEqual(centroids[1]);
  });

  it("never increases inertia across an assign+update iteration on the real dataset", () => {
    for (const k of [2, 3, 4] as const) {
      const centroids = INITIAL_CENTROIDS[k];
      const firstAssignments = assignPoints(DATASET, centroids);
      const beforeUpdate = inertia(DATASET, firstAssignments, centroids);

      const updatedCentroids = updateCentroids(DATASET, firstAssignments, centroids);
      const afterUpdate = inertia(DATASET, firstAssignments, updatedCentroids);
      expect(afterUpdate).toBeLessThanOrEqual(beforeUpdate + 1e-9);

      const secondAssignments = assignPoints(DATASET, updatedCentroids);
      const afterReassign = inertia(DATASET, secondAssignments, updatedCentroids);
      expect(afterReassign).toBeLessThanOrEqual(afterUpdate + 1e-9);
    }
  });

  it("detects convergence once centroids stop moving beyond tolerance", () => {
    const before: Point[] = [{ x: 1, y: 1 }, { x: -1, y: -1 }];
    const barelyMoved: Point[] = [{ x: 1.0001, y: 1 }, { x: -1, y: -1.0001 }];
    const moved: Point[] = [{ x: 1.5, y: 1 }, { x: -1, y: -1 }];

    expect(hasConverged(before, barelyMoved, 1e-3)).toBe(true);
    expect(hasConverged(before, moved, 1e-3)).toBe(false);
  });

  it("runs to convergence deterministically and terminates within the iteration cap", () => {
    const first = runToConvergence(DATASET, INITIAL_CENTROIDS[3], DEFAULT_MAX_ITERATIONS);
    const second = runToConvergence(DATASET, INITIAL_CENTROIDS[3], DEFAULT_MAX_ITERATIONS);

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBeLessThanOrEqual(DEFAULT_MAX_ITERATIONS);

    for (let index = 1; index < first.length; index += 1) {
      expect(first[index].inertia).toBeLessThanOrEqual(first[index - 1].inertia + 1e-6);
    }

    const last = first.at(-1)!;
    const reAssigned = assignPoints(DATASET, last.centroids);
    const reUpdated = updateCentroids(DATASET, reAssigned, last.centroids);
    expect(hasConverged(last.centroids, reUpdated, 1e-3)).toBe(true);
  });

  it("settles a poor k=3 start into a visibly different, still-stable split", () => {
    const goodRun = runToConvergence(DATASET, INITIAL_CENTROIDS[3], DEFAULT_MAX_ITERATIONS);
    const badRun = runToConvergence(DATASET, BAD_INITIAL_CENTROIDS_K3, DEFAULT_MAX_ITERATIONS);

    expect(badRun.length).toBeGreaterThan(0);
    const goodFinal = goodRun.at(-1)!;
    const badFinal = badRun.at(-1)!;
    expect(badFinal.inertia).toBeGreaterThan(goodFinal.inertia);
  });
});
