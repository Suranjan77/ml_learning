import { describe, expect, it } from "vitest";
import { attentionExamples } from "./data";
import { describeAttention, scaledDotProductAttention, softmax, topTargets, validateAttentionExample } from "./model";

describe("attention exemplar data", () => {
  it("computes scaled dot-product scores and normalised weights", () => {
    const result = scaledDotProductAttention([[2, 0]], [[1, 0], [0, 1]]);
    expect(result.scores[0][0]).toBeCloseTo(Math.SQRT2);
    expect(result.weights[0]).toEqual(softmax(result.scores[0]));
    expect(result.weights[0].reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
  });

  it("contains valid probability matrices", () => {
    for (const example of attentionExamples) {
      expect(validateAttentionExample(example)).toEqual([]);
      for (const head of example.heads) {
        head.scores.forEach((scores, index) => expect(head.weights[index]).toEqual(softmax(scores)));
      }
    }
  });

  it.each([
    ["tired", "Animal"],
    ["wide", "street"],
  ])("makes %s point most strongly to %s", (id, expected) => {
    const example = attentionExamples.find((item) => item.id === id)!;
    const focus = example.tokens.indexOf("it");
    const target = topTargets(example.heads[0], focus, 1)[0];
    expect(example.tokens[target.index]).toBe(expected);
  });

  it("produces a useful text alternative", () => {
    const example = attentionExamples[0];
    const description = describeAttention(example, example.heads[0], example.tokens.indexOf("it"));
    expect(description).toContain("Animal");
    expect(description).toMatch(/%/);
  });
});
