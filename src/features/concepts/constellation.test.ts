import { describe, expect, it } from "vitest";
import { exhibits } from "@/features/exhibits/registry";
import { conceptNodes, conceptRelations, conceptSlugs, relationsFor } from "./constellation";

describe("concept constellation", () => {
  it("maps every exhibit exactly once", () => {
    const exhibitSlugs = exhibits.map((exhibit) => exhibit.slug).sort();
    const mapSlugs = conceptNodes.map((node) => node.slug).sort();
    expect(mapSlugs).toEqual(exhibitSlugs);
    expect(new Set(conceptSlugs).size).toBe(conceptSlugs.length);
  });

  it("uses valid, unique, question-bearing relationships", () => {
    const slugs = new Set(conceptSlugs);
    const pairs = new Set<string>();
    for (const relation of conceptRelations) {
      expect(slugs.has(relation.from)).toBe(true);
      expect(slugs.has(relation.to)).toBe(true);
      expect(relation.from).not.toBe(relation.to);
      expect(relation.question).toMatch(/\?$/);
      expect(relation.explanation.length).toBeGreaterThan(45);
      const pair = [relation.from, relation.to].sort().join("|");
      expect(pairs.has(pair)).toBe(false);
      pairs.add(pair);
    }
  });

  it("keeps the authored map connected with no isolated exhibit", () => {
    const visited = new Set<string>();
    const pending: string[] = [conceptSlugs[0]];
    while (pending.length > 0) {
      const slug = pending.shift()!;
      if (visited.has(slug)) continue;
      visited.add(slug);
      for (const relation of relationsFor(slug as (typeof conceptSlugs)[number])) {
        pending.push(relation.from === slug ? relation.to : relation.from);
      }
    }
    expect([...visited].sort()).toEqual([...conceptSlugs].sort());
    for (const slug of conceptSlugs) expect(relationsFor(slug).length).toBeGreaterThan(0);
  });
});

