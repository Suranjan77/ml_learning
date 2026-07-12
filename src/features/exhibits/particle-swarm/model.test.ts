import { describe, expect, it } from "vitest";
import { DEFAULT_PARAMETERS, evolveSwarm, initialSwarm, objective, stepSwarm } from "./model";

describe("particle swarm model", () => {
  it("has its global Rastrigin minimum at the origin", () => {
    expect(objective({ x: 0, y: 0 })).toBe(0);
    expect(objective({ x: 1, y: 1 })).toBeGreaterThan(0);
  });

  it("is deterministic and retains personal best scores", () => {
    expect(evolveSwarm(8)).toEqual(evolveSwarm(8));
    const initial = initialSwarm();
    const next = stepSwarm(initial, DEFAULT_PARAMETERS);
    next.particles.forEach((particle, index) => {
      expect(particle.bestScore).toBeLessThanOrEqual(initial.particles[index].bestScore);
    });
  });

  it("improves the shared best over a run", () => {
    const initial = initialSwarm();
    const evolved = evolveSwarm(18);
    expect(evolved.globalBestScore).toBeLessThan(initial.globalBestScore);
    expect(evolved.iteration).toBe(18);
  });
});
