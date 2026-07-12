import type { ExhibitDefinition } from "../types";

export const particleSwarmExhibit: ExhibitDefinition = {
  slug: "particle-swarm",
  title: "Particle swarm optimisation",
  question: "How can a swarm find an optimum without gradients?",
  summary: "Watch particles balance momentum, their own best discovery, and the swarm’s shared best while searching a landscape full of local minima.",
  insight: "PSO replaces a derivative with communication: each particle remembers its best position and is pulled toward the best position found by the group.",
  topic: "Evolutionary computation",
  difficulty: "Intermediate",
  duration: 6,
  renderer: "SVG",
  tags: ["optimisation", "swarm", "metaheuristic", "global optimum", "population", "search"],
  related: ["genetic-algorithm", "gradient-descent"],
  assumptions: [
    "The fitness landscape is a hand-authored 2-D function; the swarm uses the canonical velocity update with fixed inertia and acceleration coefficients.",
    "Starting positions are seeded deterministically so runs are reproducible rather than randomly initialised.",
  ],
  references: [
    { label: "Kennedy & Eberhart, Particle Swarm Optimization (1995), Proc. ICNN" },
    { label: "Shi & Eberhart, A Modified Particle Swarm Optimizer (1998), Proc. IEEE CEC" },
  ],
  steps: [
    { title: "Scatter the search", instruction: "Inspect the particles, their small personal-best markers, and the shared star.", observation: "Unlike gradient descent, PSO evaluates many regions at once and never computes a slope." },
    { title: "Combine three forces", instruction: "Take one step and compare each particle with its faint next-move line.", observation: "Inertia preserves motion, cognitive pull returns to personal evidence, and social pull shares the best discovery." },
    { title: "Share improvements", instruction: "Run several iterations and watch the star move when any particle finds a lower cost.", observation: "One particle’s improvement changes the social target for the entire population." },
    { title: "Converge—or collapse early", instruction: "Change social pull and inertia, restart, and compare the final spread.", observation: "Strong social pull converges quickly but can collapse the search around a merely local minimum." },
  ],
  challenges: ["Set social pull to zero. Does the swarm still agree on one solution?", "Find settings that preserve exploration for at least ten iterations while still improving the global best."],
};
