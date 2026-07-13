import { describe, expect, it } from "vitest";
import { INITIAL_WEIGHTS, applyGradients, forward, gradients, weightsAfterUpdates } from "./model";

describe("backpropagation model", () => {
  it("produces bounded activations and positive binary cross entropy", () => {
    const pass = forward([0.8, 0.2], 1, INITIAL_WEIGHTS);
    expect(pass.hidden.every((value) => value > 0 && value < 1)).toBe(true);
    expect(pass.output).toBeGreaterThan(0);
    expect(pass.output).toBeLessThan(1);
    expect(pass.loss).toBeGreaterThan(0);
  });

  it("one gradient update reduces loss", () => {
    const input: [number, number] = [0.8, 0.2];
    const before = forward(input, 1, INITIAL_WEIGHTS);
    const updated = applyGradients(INITIAL_WEIGHTS, gradients(input, 1, INITIAL_WEIGHTS), 0.5);
    expect(forward(input, 1, updated).loss).toBeLessThan(before.loss);
  });

  it("replays a deterministic number of updates", () => {
    const input: [number, number] = [0.8, 0.2];
    const replayed = weightsAfterUpdates(input, 1, 0.5, 2);
    const first = applyGradients(INITIAL_WEIGHTS, gradients(input, 1, INITIAL_WEIGHTS), 0.5);
    const second = applyGradients(first, gradients(input, 1, first), 0.5);
    expect(replayed).toEqual(second);
  });
});
