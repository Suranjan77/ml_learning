import { describe, expect, it } from "vitest";
import { FILTERS, INPUT, convolve, dotProduct, maxPool, patchAt, relu } from "./model";

describe("CNN feature-map model", () => {
  it("computes one convolution cell as a patch/filter dot product", () => {
    const output = convolve(INPUT, FILTERS.vertical);
    expect(output[1][2]).toBe(dotProduct(patchAt(INPUT, 1, 2), FILTERS.vertical));
    expect(output).toHaveLength(6);
    expect(output[0]).toHaveLength(6);
  });

  it("ReLU removes negative responses without changing positive ones", () => {
    expect(relu([[-2, 0, 3]])).toEqual([[0, 0, 3]]);
  });

  it("max pooling keeps the strongest activation in each region", () => {
    expect(maxPool([[1, 3, 2, 0], [4, 2, 1, 7], [0, 2, 5, 1], [3, 1, 2, 4]])).toEqual([[4, 7], [3, 5]]);
  });
});
