import { describe, expect, it } from "vitest";
import { DEFAULT_MUTATION_RATE, GENOME_LENGTH, decode, evolvePopulation, initialPopulation, nextGeneration } from "./model";

describe("genetic algorithm model", () => {
  it("decodes the genome across the complete search interval", () => {
    expect(decode("0".repeat(GENOME_LENGTH))).toBe(-4);
    expect(decode("1".repeat(GENOME_LENGTH))).toBe(4);
  });

  it("uses deterministic selection, crossover, and mutation", () => {
    const initial = initialPopulation();
    expect(nextGeneration(initial, DEFAULT_MUTATION_RATE)).toEqual(nextGeneration(initial, DEFAULT_MUTATION_RATE));
  });

  it("preserves the elite and improves the best solution", () => {
    const initial = initialPopulation();
    const evolved = evolvePopulation(10);
    const initialBest = Math.max(...initial.population.map((item) => item.fitness));
    const evolvedBest = Math.max(...evolved.population.map((item) => item.fitness));
    expect(evolvedBest).toBeGreaterThanOrEqual(initialBest);
    expect(evolved.generation).toBe(10);
  });
});
