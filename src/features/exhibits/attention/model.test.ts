import { describe, expect, it } from "vitest";
import { attentionExamples } from "./data";
import { describeAttention, topTargets, validateAttentionExample } from "./model";

describe("attention exemplar data", () => {
  it("contains valid probability matrices", () => {
    for (const example of attentionExamples) expect(validateAttentionExample(example)).toEqual([]);
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
