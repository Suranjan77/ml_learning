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
  renderer: "WebGL",
  tags: ["optimisation", "swarm", "metaheuristic", "global optimum", "population", "search"],
  related: ["genetic-algorithm", "gradient-descent"],
  assumptions: [
    "The fitness landscape is a hand-authored 2-D function; the swarm uses the canonical velocity update with fixed inertia and acceleration coefficients.",
    "Starting positions are seeded deterministically so runs are reproducible rather than randomly initialised.",
    "The two bird colours are scouting wings of one PSO population. Predator avoidance is an optional repulsion extension and is not part of canonical PSO.",
  ],
  references: [
    { label: "Kennedy & Eberhart, Particle Swarm Optimization (1995), Proc. ICNN" },
    { label: "Shi & Eberhart, A Modified Particle Swarm Optimizer (1998), Proc. IEEE CEC" },
  ],
  steps: [
    { title: "Scatter the search", instruction: "Inspect the two scouting wings, their personal-best markers, and the shared gold leader.", observation: "Unlike gradient descent, PSO evaluates many regions at once and never computes a slope." },
    { title: "Combine three forces", instruction: "Take one step and compare each particle with its faint next-move line.", observation: "Inertia preserves motion, cognitive pull returns to personal evidence, and social pull shares the best discovery." },
    { title: "Share improvements", instruction: "Run several iterations and watch the gold leader move when any scout finds a lower cost.", observation: "One particle’s improvement changes the social target for the entire population." },
    { title: "Converge—or adapt", instruction: "Release the predator, then change social pull and inertia to compare cohesion with avoidance.", observation: "Repulsion is a flocking-inspired extension: it can preserve exploration, while strong social pull can collapse the search around a local minimum." },
  ],
  challenges: ["Set social pull to zero. Does the swarm still agree on one solution?", "Find settings that preserve exploration for at least ten iterations while still improving the global best."],
};
