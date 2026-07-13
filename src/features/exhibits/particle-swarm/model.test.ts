import { describe, expect, it } from "vitest";
import { DEFAULT_PARAMETERS, evolveSwarm, initialSwarm, objective, particleForces, predatorAt, stepSwarm } from "./model";

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

  it("exposes the exact force components used by the next step", () => {
    const state = evolveSwarm(4);
    const particle = state.particles[3];
    const forces = particleForces(state, particle, DEFAULT_PARAMETERS);
    const nextParticle = stepSwarm(state, DEFAULT_PARAMETERS).particles[3];

    expect(nextParticle.velocity.x).toBeCloseTo(forces.velocity.x, 10);
    expect(nextParticle.velocity.y).toBeCloseTo(forces.velocity.y, 10);
  });

  it("removes personal and shared pull when their weights are zero", () => {
    const state = evolveSwarm(3);
    const forces = particleForces(state, state.particles[5], {
      ...DEFAULT_PARAMETERS,
      cognitive: 0,
      social: 0,
    });

    expect(forces.cognitive.x).toBeCloseTo(0, 10);
    expect(forces.cognitive.y).toBeCloseTo(0, 10);
    expect(forces.social.x).toBeCloseTo(0, 10);
    expect(forces.social.y).toBeCloseTo(0, 10);
    expect(forces.velocity.x).toBeCloseTo(forces.inertia.x, 10);
    expect(forces.velocity.y).toBeCloseTo(forces.inertia.y, 10);
  });

  it("supports a deterministic predator-avoidance extension", () => {
    expect(predatorAt(4)).toEqual(predatorAt(4));
    const initial = initialSwarm();
    const predator = { x: initial.particles[0].x + 0.5, y: initial.particles[0].y, radius: 2, strength: 0.6 };
    const canonical = stepSwarm(initial, DEFAULT_PARAMETERS);
    const avoiding = stepSwarm(initial, DEFAULT_PARAMETERS, predator);
    expect(avoiding.particles[0].velocity).not.toEqual(canonical.particles[0].velocity);
  });
});
