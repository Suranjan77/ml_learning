import { describe, expect, it } from "vitest";
import { exhibits, exhibitSummaries } from "./registry";
import {
  emptyFilters,
  filterExhibits,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  matchesQuery,
} from "./search";

const bySlug = (slug: string) => exhibitSummaries.find((exhibit) => exhibit.slug === slug)!;

describe("matchesQuery", () => {
  it("returns everything for an empty query", () => {
    expect(exhibitSummaries.every((exhibit) => matchesQuery(exhibit, "  "))).toBe(true);
  });

  it("matches on the formal title", () => {
    expect(matchesQuery(bySlug("pca"), "principal component analysis")).toBe(true);
  });

  it("matches on the question it answers", () => {
    expect(matchesQuery(bySlug("gradient-descent"), "next step")).toBe(true);
  });

  it("matches on a discovery tag not present in the visible copy", () => {
    expect(matchesQuery(bySlug("kernel-trick"), "svm")).toBe(true);
  });

  it("requires every term to appear (case-insensitive)", () => {
    expect(matchesQuery(bySlug("token-sampling"), "TEMPERATURE softmax")).toBe(true);
    expect(matchesQuery(bySlug("token-sampling"), "temperature clustering")).toBe(false);
  });
});

describe("every exhibit is findable by name and by question", () => {
  it.each(exhibitSummaries.map((exhibit) => [exhibit.slug]))("%s", (slug) => {
    const exhibit = bySlug(slug);
    expect(filterExhibits(exhibitSummaries, { ...emptyFilters, query: exhibit.title })).toContain(exhibit);
    expect(filterExhibits(exhibitSummaries, { ...emptyFilters, query: exhibit.question })).toContain(exhibit);
  });
});

describe("filterExhibits", () => {
  it("combines filters conjunctively", () => {
    const results = filterExhibits(exhibitSummaries, {
      ...emptyFilters,
      topic: "Unsupervised learning",
      difficulty: "Approachable",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((exhibit) => exhibit.topic === "Unsupervised learning" && exhibit.difficulty === "Approachable")).toBe(true);
  });

  it("applies duration buckets", () => {
    const short = filterExhibits(exhibitSummaries, { ...emptyFilters, duration: "short" });
    expect(short.every((exhibit) => exhibit.duration <= 4)).toBe(true);
    const long = filterExhibits(exhibitSummaries, { ...emptyFilters, duration: "long" });
    expect(long.every((exhibit) => exhibit.duration >= 7)).toBe(true);
  });
});

describe("URL round-trip", () => {
  it("omits default values from the query string", () => {
    expect(filtersToParams(emptyFilters).toString()).toBe("");
  });

  it("round-trips active filters through params", () => {
    const filters = { query: "loss surface", topic: "Learning and optimisation", difficulty: "Approachable", renderer: "WebGL", duration: "short" };
    const restored = filtersFromParams(filtersToParams(filters), exhibitSummaries);
    expect(restored).toEqual(filters);
  });

  it("drops invalid or stale filter values", () => {
    const params = new URLSearchParams("topic=Nonexistent&difficulty=Impossible&renderer=Fax&duration=eternal&q=keep");
    expect(filtersFromParams(params, exhibitSummaries)).toEqual({ ...emptyFilters, query: "keep" });
  });
});

describe("hasActiveFilters", () => {
  it("is false for defaults and whitespace-only queries", () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false);
    expect(hasActiveFilters({ ...emptyFilters, query: "   " })).toBe(false);
  });

  it("is true when any filter is set", () => {
    expect(hasActiveFilters({ ...emptyFilters, renderer: "SVG" })).toBe(true);
  });
});

describe("authority metadata", () => {
  it.each(exhibits.map((exhibit) => [exhibit.slug]))("%s states assumptions and cites references", (slug) => {
    const exhibit = exhibits.find((item) => item.slug === slug)!;
    expect(exhibit.assumptions.length).toBeGreaterThan(0);
    expect(exhibit.assumptions.every((line) => line.trim().length > 0)).toBe(true);
    expect(exhibit.references.length).toBeGreaterThan(0);
    for (const reference of exhibit.references) {
      expect(reference.label.trim().length).toBeGreaterThan(0);
      if (reference.href !== undefined) {
        expect(reference.href).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("related links are valid and non-self-referential", () => {
  const slugs = new Set(exhibits.map((exhibit) => exhibit.slug));

  it.each(exhibits.map((exhibit) => [exhibit.slug]))("%s points only to existing, distinct exhibits", (slug) => {
    const exhibit = exhibits.find((item) => item.slug === slug)!;
    expect(exhibit.tags.length).toBeGreaterThan(0);
    for (const related of exhibit.related) {
      expect(related).not.toBe(slug);
      expect(slugs.has(related)).toBe(true);
    }
  });
});
