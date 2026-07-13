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

  it("records an actual crossover child and every changed bit", () => {
    const evolved = nextGeneration(initialPopulation(), DEFAULT_MUTATION_RATE);
    const example = evolved.reproduction;
    expect(example).not.toBeNull();
    if (!example) return;

    expect(example.beforeMutation).toBe(
      example.parents[0].slice(0, example.crossoverPoint)
      + example.parents[1].slice(example.crossoverPoint),
    );
    const changedBits = [...example.beforeMutation]
      .flatMap((bit, index) => bit === example.afterMutation[index] ? [] : [index]);
    expect(example.mutatedBits).toEqual(changedBits);
    expect(evolved.population.some((individual) => individual.genome === example.afterMutation)).toBe(true);
  });

  it("shows crossover without inventing mutations when mutation is disabled", () => {
    const example = nextGeneration(initialPopulation(), 0).reproduction;
    expect(example?.mutatedBits).toEqual([]);
    expect(example?.afterMutation).toBe(example?.beforeMutation);
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
