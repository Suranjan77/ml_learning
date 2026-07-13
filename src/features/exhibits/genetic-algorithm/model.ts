export interface Individual {
  genome: string;
  x: number;
  fitness: number;
}

export interface GeneticState {
  population: Individual[];
  generation: number;
  reproduction: ReproductionExample | null;
  mutationCount: number;
}

export interface ReproductionExample {
  parents: [string, string];
  crossoverPoint: number;
  beforeMutation: string;
  afterMutation: string;
  mutatedBits: number[];
}

export const GENOME_LENGTH = 12;
export const POPULATION_SIZE = 12;
export const DEFAULT_MUTATION_RATE = 0.035;

function random(seed: number) {
  const value = Math.sin(seed * 91.177 + 17.31) * 43758.5453;
  return value - Math.floor(value);
}

export function decode(genome: string): number {
  const integer = Number.parseInt(genome, 2);
  return -4 + (integer / (2 ** GENOME_LENGTH - 1)) * 8;
}

/** A global peak near 1.45 and a tempting local peak near -2.1. */
export function fitnessAt(x: number): number {
  return 0.08
    + Math.exp(-((x - 1.45) ** 2) / 0.52)
    + 0.72 * Math.exp(-((x + 2.05) ** 2) / 0.34)
    + 0.06 * Math.cos(x * 7) ** 2;
}

export function evaluate(genome: string): Individual {
  const x = decode(genome);
  return { genome, x, fitness: fitnessAt(x) };
}

function genomeFromSeed(seed: number) {
  return Array.from({ length: GENOME_LENGTH }, (_, bit) => random(seed * 31 + bit * 7) > 0.5 ? "1" : "0").join("");
}

export function initialPopulation(): GeneticState {
  const population = Array.from({ length: POPULATION_SIZE }, (_, index) => evaluate(genomeFromSeed(index + 1)));
  return { population, generation: 0, reproduction: null, mutationCount: 0 };
}

function tournament(population: Individual[], seed: number) {
  const a = population[Math.floor(random(seed) * population.length)];
  const b = population[Math.floor(random(seed + 1) * population.length)];
  return a.fitness >= b.fitness ? a : b;
}

export function nextGeneration(state: GeneticState, mutationRate = DEFAULT_MUTATION_RATE): GeneticState {
  const ranked = [...state.population].sort((a, b) => b.fitness - a.fitness);
  const genomes = [ranked[0].genome];
  let reproduction: ReproductionExample | null = null;
  let mutationCount = 0;

  while (genomes.length < POPULATION_SIZE) {
    const childIndex = genomes.length;
    const seed = (state.generation + 1) * 1000 + childIndex * 31;
    const parentA = tournament(state.population, seed);
    const parentB = tournament(state.population, seed + 11);
    const crossoverPoint = 2 + Math.floor(random(seed + 23) * (GENOME_LENGTH - 3));
    const beforeMutation = parentA.genome.slice(0, crossoverPoint) + parentB.genome.slice(crossoverPoint);
    const mutatedBits: number[] = [];
    const child = [...beforeMutation].map((bit, index) => {
      if (random(seed + 100 + index) < mutationRate) {
        mutationCount += 1;
        mutatedBits.push(index);
        return bit === "1" ? "0" : "1";
      }
      return bit;
    }).join("");
    const candidate = {
      parents: [parentA.genome, parentB.genome] as [string, string],
      crossoverPoint,
      beforeMutation,
      afterMutation: child,
      mutatedBits,
    };
    if (!reproduction || (reproduction.mutatedBits.length === 0 && mutatedBits.length > 0)) {
      reproduction = candidate;
    }
    genomes.push(child);
  }

  return {
    population: genomes.map(evaluate),
    generation: state.generation + 1,
    reproduction,
    mutationCount,
  };
}

export function evolvePopulation(generations: number, mutationRate = DEFAULT_MUTATION_RATE) {
  let state = initialPopulation();
  for (let index = 0; index < generations; index += 1) state = nextGeneration(state, mutationRate);
  return state;
}
