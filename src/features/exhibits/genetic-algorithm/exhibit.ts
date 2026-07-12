import type { ExhibitDefinition } from "../types";

export const geneticAlgorithmExhibit: ExhibitDefinition = {
  slug: "genetic-algorithm",
  title: "Genetic algorithm",
  question: "How does evolution search without knowing a gradient?",
  summary: "Evolve a binary population through selection, crossover, and mutation while tracking fitness and genetic diversity across two competing peaks.",
  insight: "Selection exploits solutions that already work; crossover recombines their information; mutation preserves enough variation to discover alternatives.",
  topic: "Evolutionary computation",
  difficulty: "Intermediate",
  duration: 6,
  renderer: "SVG",
  steps: [
    { title: "Encode candidate solutions", instruction: "Compare each binary genome with its position and fitness on the landscape.", observation: "The algorithm manipulates an encoding; decoding turns those bits into a candidate solution that can be evaluated." },
    { title: "Select and recombine", instruction: "Advance one generation and inspect the parent genomes and crossover marker.", observation: "Fitter genomes win selection more often, while crossover takes a prefix from one parent and a suffix from another." },
    { title: "Maintain variation", instruction: "Raise mutation and compare the unique-genome count after several generations.", observation: "Mutation can recover bits that selection removed, but too much mutation destroys useful inherited structure." },
    { title: "Balance convergence", instruction: "Run toward the global peak, then restart with mutation at zero.", observation: "Elitism prevents the best fitness from falling, but low diversity can trap the population around the local peak." },
  ],
  challenges: ["Find a mutation rate that reaches the global peak without keeping all twelve genomes unique.", "Set mutation to zero and explain why crossover alone may be unable to create a missing bit pattern."],
};
