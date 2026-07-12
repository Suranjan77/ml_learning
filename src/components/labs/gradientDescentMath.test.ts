import { describe, expect, it } from "vitest";
import {
  SURFACES,
  centralDifferenceGrad,
  initAdamState,
  initMomentumState,
  initRmspropState,
  initSgdState,
  marchingSquaresContours,
  stepAdam,
  stepMomentum,
  stepRmsprop,
  stepSgd,
  getSurface,
  type Hyperparams,
} from "./gradientDescentMath";

const SAMPLE_POINTS: Array<[number, number]> = [
  [0.73, -1.21],
  [-2.05, 0.44],
  [1.6, 1.9],
];

describe("loss surfaces: analytic gradient vs central finite differences", () => {
  for (const surface of SURFACES) {
    describe(surface.label, () => {
      for (const [x, y] of SAMPLE_POINTS) {
        it(`matches finite differences at (${x}, ${y})`, () => {
          const analytic = surface.grad(x, y);
          const numeric = centralDifferenceGrad(surface.f, x, y);
          expect(analytic[0]).toBeCloseTo(numeric[0], 3);
          expect(analytic[1]).toBeCloseTo(numeric[1], 3);
        });
      }
    });
  }
});

describe("optimizers strictly decrease loss on the bowl surface", () => {
  const bowl = getSurface("bowl");
  const hyper: Hyperparams = { lr: 0.05, momentum: 0.9 };
  const STEPS = 100;

  it("SGD", () => {
    let state = initSgdState(bowl.startDefault);
    const initialLoss = bowl.f(state.x, state.y);
    for (let i = 0; i < STEPS; i++) {
      const grad = bowl.grad(state.x, state.y);
      state = stepSgd(state, grad, hyper);
    }
    const finalLoss = bowl.f(state.x, state.y);
    expect(finalLoss).toBeLessThan(initialLoss);
  });

  it("Momentum", () => {
    let state = initMomentumState(bowl.startDefault);
    const initialLoss = bowl.f(state.x, state.y);
    for (let i = 0; i < STEPS; i++) {
      const grad = bowl.grad(state.x, state.y);
      state = stepMomentum(state, grad, hyper);
    }
    const finalLoss = bowl.f(state.x, state.y);
    expect(finalLoss).toBeLessThan(initialLoss);
  });

  it("RMSProp", () => {
    let state = initRmspropState(bowl.startDefault);
    const initialLoss = bowl.f(state.x, state.y);
    for (let i = 0; i < STEPS; i++) {
      const grad = bowl.grad(state.x, state.y);
      state = stepRmsprop(state, grad, hyper);
    }
    const finalLoss = bowl.f(state.x, state.y);
    expect(finalLoss).toBeLessThan(initialLoss);
  });

  it("Adam", () => {
    let state = initAdamState(bowl.startDefault);
    const initialLoss = bowl.f(state.x, state.y);
    for (let i = 0; i < STEPS; i++) {
      const grad = bowl.grad(state.x, state.y);
      state = stepAdam(state, grad, hyper);
    }
    const finalLoss = bowl.f(state.x, state.y);
    expect(finalLoss).toBeLessThan(initialLoss);
  });
});

describe("Adam bias correction", () => {
  it("first step magnitude is approximately lr regardless of gradient scale", () => {
    const lr = 0.05;
    const hyper: Hyperparams = { lr, momentum: 0.9 };

    for (const gradMagnitude of [1e-3, 1, 1e3]) {
      const state = initAdamState({ x: 0, y: 0 });
      const next = stepAdam(state, [gradMagnitude, 0], hyper);
      const displacement = Math.abs(next.x - state.x);
      expect(displacement).toBeGreaterThan(lr * 0.8);
      expect(displacement).toBeLessThan(lr * 1.2);
    }
  });
});

describe("marchingSquaresContours", () => {
  it("traces the bowl's r^2 level set approximately on a circle of radius r", () => {
    const bowl = getSurface("bowl");
    const radius = 2;
    const level = radius * radius;

    const [{ segments }] = marchingSquaresContours(
      bowl.f,
      bowl.domain,
      [level],
      120,
      120,
    );

    // A circle of radius 2 well within the [-4, 4] domain should produce a
    // healthy number of segments, and every sampled point on those segments
    // should sit very close to the true level (the loss at the point should
    // be within a small tolerance of the level, and the point's distance
    // from the origin should be close to the radius).
    expect(segments.length).toBeGreaterThan(20);
    for (const { a, b } of segments) {
      for (const p of [a, b]) {
        expect(Math.abs(bowl.f(p.x, p.y) - level)).toBeLessThan(0.05);
        const distFromOrigin = Math.hypot(p.x, p.y);
        expect(distFromOrigin).toBeCloseTo(radius, 1);
      }
    }
  });

  it("returns no segments for a level outside the sampled range", () => {
    const bowl = getSurface("bowl");
    const [{ segments }] = marchingSquaresContours(
      bowl.f,
      bowl.domain,
      [1000],
      40,
      40,
    );
    expect(segments.length).toBe(0);
  });
});
