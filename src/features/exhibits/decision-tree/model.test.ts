import { describe, expect, it } from "vitest";
import { leafCount, predictTree, treeAccuracy } from "./model";

describe("decision tree model", () => {
  it("routes a point through only the revealed rules", () => {
    expect(predictTree({ x: 2, y: 8 }, { depth: 1, threshold: 4 })).toBe("A");
    expect(predictTree({ x: 2, y: 8 }, { depth: 2, threshold: 4 })).toBe("B");
  });

  it("adds leaves as depth reveals more partitions", () => {
    expect([1, 2, 3].map((depth) => leafCount(depth as 1 | 2 | 3))).toEqual([2, 4, 5]);
  });

  it("the full deterministic tree explains the authored dataset", () => {
    expect(treeAccuracy({ depth: 3, threshold: 4 })).toBe(1);
    expect(treeAccuracy({ depth: 3, threshold: 8 })).toBeLessThan(1);
  });
});
