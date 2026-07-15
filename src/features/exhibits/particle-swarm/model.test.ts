import { describe, expect, it } from "vitest";
import {
  DEFAULT_PARAMETERS,
  DOMAIN,
  VELOCITY_LIMIT,
  deterministicCoefficient,
  evolveSwarm,
  initialSwarm,
  iterationsSinceImprovement,
  objective,
  particleForces,
  predatorAt,
  stepSwarm,
  swarmSpread,
} from "./model";

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

  it("uses independent deterministic coefficients for both dimensions", () => {
    const state = evolveSwarm(3);
    const original = state.particles[5];
    const particle = { ...original, x: original.best.x - 1, y: original.best.y - 1, velocity: { x: 0, y: 0 } };
    const forces = particleForces(state, particle, { inertia: 0, cognitive: 1, social: 0 });
    const iteration = state.iteration + 1;

    expect(forces.cognitive.x).toBeCloseTo(deterministicCoefficient(particle.id, iteration, 1), 10);
    expect(forces.cognitive.y).toBeCloseTo(deterministicCoefficient(particle.id, iteration, 2), 10);
    expect(forces.cognitive.x).not.toBeCloseTo(forces.cognitive.y, 6);
  });

  it("improves the shared best and records discovery history", () => {
    const initial = initialSwarm();
    const evolved = evolveSwarm(18);
    expect(evolved.globalBestScore).toBeLessThan(initial.globalBestScore);
    expect(evolved.iteration).toBe(18);
    expect(evolved.history).toHaveLength(19);
    expect(evolved.lastImprovementIteration).toBeGreaterThan(0);
  });

  it("exposes the exact force components used by the next step", () => {
    const state = evolveSwarm(4);
    const particle = state.particles[3];
    const forces = particleForces(state, particle, DEFAULT_PARAMETERS);
    const nextParticle = stepSwarm(state, DEFAULT_PARAMETERS).particles[3];

    expect(nextParticle.velocity.x).toBeCloseTo(forces.velocity.x, 10);
    expect(nextParticle.velocity.y).toBeCloseTo(forces.velocity.y, 10);
    expect(forces.unclippedVelocity.x).toBeCloseTo(forces.inertia.x + forces.cognitive.x + forces.social.x, 10);
    expect(forces.unclippedVelocity.y).toBeCloseTo(forces.inertia.y + forces.cognitive.y + forces.social.y, 10);
  });

  it("clips velocity per coordinate and discloses when clipping occurred", () => {
    const state = initialSwarm();
    const particle = { ...state.particles[0], velocity: { x: 20, y: -20 } };
    const forces = particleForces(state, particle, { inertia: 1, cognitive: 0, social: 0 });

    expect(forces.velocity).toEqual({ x: VELOCITY_LIMIT, y: -VELOCITY_LIMIT });
    expect(forces.unclippedVelocity).toEqual({ x: 20, y: -20 });
    expect(forces.velocityClipped).toBe(true);
  });

  it("clips positions to the displayed domain", () => {
    const initial = initialSwarm(1);
    const state = {
      ...initial,
      particles: [{ ...initial.particles[0], x: DOMAIN.max - 0.1, y: DOMAIN.min + 0.1, velocity: { x: 2, y: -2 } }],
    };
    const next = stepSwarm(state, { inertia: 1, cognitive: 0, social: 0 });

    expect(next.particles[0].x).toBe(DOMAIN.max);
    expect(next.particles[0].y).toBe(DOMAIN.min);
  });

  it("calculates RMS spread from the swarm centroid", () => {
    expect(swarmSpread([{ x: -1, y: 0 }, { x: 1, y: 0 }])).toBeCloseTo(1, 10);
    expect(swarmSpread([{ x: 2, y: 2 }, { x: 2, y: 2 }])).toBe(0);
  });

  it("tracks stagnation from the last shared-best improvement", () => {
    let state = initialSwarm();
    const stationary = { inertia: 0, cognitive: 0, social: 0 };
    for (let index = 0; index < 8; index += 1) state = stepSwarm(state, stationary);
    expect(iterationsSinceImprovement(state)).toBe(8);
    expect(state.lastImprovementIteration).toBe(0);
  });

  it("retains a deterministic noncanonical repulsion extension outside the main exhibit", () => {
    expect(predatorAt(4)).toEqual(predatorAt(4));
    const initial = initialSwarm();
    const predator = { x: initial.particles[0].x + 0.5, y: initial.particles[0].y, radius: 2, strength: 0.6 };
    const canonical = stepSwarm(initial, DEFAULT_PARAMETERS);
    const avoiding = stepSwarm(initial, DEFAULT_PARAMETERS, predator);
    expect(avoiding.particles[0].velocity).not.toEqual(canonical.particles[0].velocity);
  });
});
