import type { ExhibitDefinition } from "../types";

export const particleSwarmExhibit: ExhibitDefinition = {
  slug: "particle-swarm",
  title: "Particle swarm optimisation",
  question: "How can a swarm find an optimum without gradients?",
  summary: "See particles combine momentum, personal memory, and shared knowledge—and discover why too much agreement can end exploration too early.",
  insight: "PSO turns discoveries into movement: each particle remembers its own evidence, while a better find by any particle changes the shared target of the population.",
  topic: "Evolutionary computation",
  difficulty: "Intermediate",
  duration: 6,
  renderer: "SVG",
  tags: ["optimisation", "swarm", "metaheuristic", "global optimum", "population", "search"],
  related: ["genetic-algorithm", "gradient-descent"],
  assumptions: [
    "The objective is the authored two-dimensional Rastrigin function. Particle positions, velocities, personal bests, shared best, force components, spread, and stagnation are computed.",
    "Starting positions and independent per-dimension pseudo-random coefficients are deterministic so every state is reproducible.",
    "Velocity is clipped per coordinate and positions are clipped to the displayed domain so the demonstration remains bounded. These implementation choices are not fundamental requirements of PSO.",
  ],
  references: [
    { label: "Kennedy & Eberhart, Particle Swarm Optimization (1995), Proc. ICNN" },
    { label: "Shi & Eberhart, A Modified Particle Swarm Optimizer (1998), Proc. IEEE CEC" },
  ],
  steps: [
    {
      title: "Scatter the search",
      instruction: "Inspect candidate positions, hollow personal-best memories, and the double-ring shared best.",
      observation: "Each particle starts with a position, velocity, and memory. No gradient or terrain slope is calculated.",
    },
    {
      title: "Explain one move",
      instruction: "Use the particle microscope and compare momentum, personal memory, shared knowledge, and their combined next move.",
      observation: "The next velocity is the vector combination of previous motion, personal evidence, and information from the swarm.",
    },
    {
      title: "Spread a discovery",
      instruction: "See one lower-cost discovery replace the old shared best and update every particle’s social target.",
      observation: "One particle’s discovery changes the future movement of the entire population.",
    },
    {
      title: "Make cooperation fail",
      instruction: "Inspect the strong-social preset: spread collapses while improvement weakens or stalls.",
      observation: "Strong social attraction can destroy diversity before the swarm has searched enough of the landscape.",
    },
    {
      title: "Preserve exploration",
      instruction: "Compare the lower-social preset, where more search regions remain active after the same number of iterations.",
      observation: "Better optimisation is not simply stronger agreement; information sharing must be balanced with exploration.",
    },
  ],
  challenges: [
    "Hide each force in the microscope. Which component most changes this particle’s direction?",
    "Set social pull to zero. Can the swarm still agree on one solution?",
    "Find settings that preserve spread for ten iterations while still improving the shared best.",
  ],
};
