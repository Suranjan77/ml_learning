export interface Point {
  x: number;
  y: number;
}

export interface Particle extends Point {
  id: number;
  velocity: Point;
  best: Point;
  bestScore: number;
}

export interface SwarmHistoryPoint {
  iteration: number;
  bestScore: number;
  spread: number;
}

export interface SwarmState {
  particles: Particle[];
  globalBest: Point;
  globalBestScore: number;
  iteration: number;
  trails: Record<number, Point[]>;
  history: SwarmHistoryPoint[];
  lastImprovementIteration: number;
  previousGlobalBest: Point | null;
  previousGlobalBestScore: number | null;
  globalBestUpdatedBy: number | null;
}

export interface SwarmParameters {
  inertia: number;
  cognitive: number;
  social: number;
}

/** Optional environmental pressure retained for noncanonical extensions, not used by the main exhibit. */
export interface Repulsor extends Point {
  radius: number;
  strength: number;
}

export interface ParticleForces {
  inertia: Point;
  cognitive: Point;
  social: Point;
  repulsion: Point;
  /** The clipped velocity that is used by the next state update. */
  velocity: Point;
  /** The component sum before the implementation-specific velocity clip. */
  unclippedVelocity: Point;
  velocityClipped: boolean;
}

export const DOMAIN = { min: -5.12, max: 5.12 } as const;
export const VELOCITY_LIMIT = 1.45;
export const TRAIL_LENGTH = 7;
export const DEFAULT_PARAMETERS: SwarmParameters = { inertia: 0.64, cognitive: 1.35, social: 1.55 };
export const COLLAPSE_PARAMETERS: SwarmParameters = { inertia: 0.18, cognitive: 0.35, social: 2.2 };
export const EXPLORATION_PARAMETERS: SwarmParameters = { inertia: 0.76, cognitive: 1.7, social: 0.62 };

/** Rastrigin: many local basins around one global minimum at (0, 0). */
export function objective(point: Point): number {
  return 20 + point.x ** 2 + point.y ** 2
    - 10 * (Math.cos(2 * Math.PI * point.x) + Math.cos(2 * Math.PI * point.y));
}

/** A deterministic orbit retained for an explicitly noncanonical extension. */
export function predatorAt(iteration: number): Point {
  const angle = iteration * 0.43 + 0.7;
  return { x: Math.cos(angle) * 2.65, y: Math.sin(angle) * 2.15 };
}

/** Deterministic pseudo-random coefficient in [0, 1). */
export function deterministicCoefficient(id: number, iteration: number, channel: number) {
  const value = Math.sin((id + 1) * 91.17 + (iteration + 1) * 47.31 + channel * 13.7) * 43758.5453;
  return value - Math.floor(value);
}

export function clampToDomain(value: number) {
  return Math.max(DOMAIN.min, Math.min(DOMAIN.max, value));
}

function clampVelocity(value: number) {
  return Math.max(-VELOCITY_LIMIT, Math.min(VELOCITY_LIMIT, value));
}

/** RMS distance from the swarm centroid: a direct measure of population diversity. */
export function swarmSpread(particles: readonly Point[]): number {
  if (particles.length === 0) return 0;
  const centroid = particles.reduce(
    (sum, particle) => ({ x: sum.x + particle.x, y: sum.y + particle.y }),
    { x: 0, y: 0 },
  );
  centroid.x /= particles.length;
  centroid.y /= particles.length;
  const meanSquaredDistance = particles.reduce(
    (sum, particle) => sum + (particle.x - centroid.x) ** 2 + (particle.y - centroid.y) ** 2,
    0,
  ) / particles.length;
  return Math.sqrt(meanSquaredDistance);
}

export function iterationsSinceImprovement(state: SwarmState): number {
  return state.iteration - state.lastImprovementIteration;
}

export function particleForces(
  state: SwarmState,
  particle: Particle,
  parameters: SwarmParameters,
  repulsor?: Repulsor,
): ParticleForces {
  const nextIteration = state.iteration + 1;
  const r1x = deterministicCoefficient(particle.id, nextIteration, 1);
  const r1y = deterministicCoefficient(particle.id, nextIteration, 2);
  const r2x = deterministicCoefficient(particle.id, nextIteration, 3);
  const r2y = deterministicCoefficient(particle.id, nextIteration, 4);
  const distanceFromRepulsor = repulsor
    ? Math.hypot(particle.x - repulsor.x, particle.y - repulsor.y)
    : Number.POSITIVE_INFINITY;
  const avoidance = repulsor && distanceFromRepulsor < repulsor.radius
    ? repulsor.strength * (1 - distanceFromRepulsor / repulsor.radius)
    : 0;
  const away = repulsor && distanceFromRepulsor > 0.001
    ? { x: (particle.x - repulsor.x) / distanceFromRepulsor, y: (particle.y - repulsor.y) / distanceFromRepulsor }
    : { x: 0, y: 0 };
  const inertia = {
    x: parameters.inertia * particle.velocity.x,
    y: parameters.inertia * particle.velocity.y,
  };
  const cognitive = {
    x: parameters.cognitive * r1x * (particle.best.x - particle.x),
    y: parameters.cognitive * r1y * (particle.best.y - particle.y),
  };
  const social = {
    x: parameters.social * r2x * (state.globalBest.x - particle.x),
    y: parameters.social * r2y * (state.globalBest.y - particle.y),
  };
  const repulsion = { x: away.x * avoidance, y: away.y * avoidance };
  const unclippedVelocity = {
    x: inertia.x + cognitive.x + social.x + repulsion.x,
    y: inertia.y + cognitive.y + social.y + repulsion.y,
  };
  const velocity = {
    x: clampVelocity(unclippedVelocity.x),
    y: clampVelocity(unclippedVelocity.y),
  };
  return {
    inertia,
    cognitive,
    social,
    repulsion,
    velocity,
    unclippedVelocity,
    velocityClipped: velocity.x !== unclippedVelocity.x || velocity.y !== unclippedVelocity.y,
  };
}

export function initialSwarm(count = 18): SwarmState {
  const particles: Particle[] = Array.from({ length: count }, (_, id) => {
    const angle = id * 2.399963;
    const radius = 1.3 + (id % 6) * 0.66;
    const point = {
      x: clampToDomain(Math.cos(angle) * radius + (id % 2 ? 0.75 : -0.4)),
      y: clampToDomain(Math.sin(angle) * radius + (id % 3 ? -0.35 : 0.7)),
    };
    return {
      id,
      ...point,
      velocity: {
        x: (deterministicCoefficient(id, 0, 5) - 0.5) * 0.8,
        y: (deterministicCoefficient(id, 0, 6) - 0.5) * 0.8,
      },
      best: point,
      bestScore: objective(point),
    };
  });
  const best = particles.reduce((winner, particle) => particle.bestScore < winner.bestScore ? particle : winner);
  const spread = swarmSpread(particles);
  return {
    particles,
    globalBest: { ...best.best },
    globalBestScore: best.bestScore,
    iteration: 0,
    trails: Object.fromEntries(particles.map((particle) => [particle.id, [{ x: particle.x, y: particle.y }]])),
    history: [{ iteration: 0, bestScore: best.bestScore, spread }],
    lastImprovementIteration: 0,
    previousGlobalBest: null,
    previousGlobalBestScore: null,
    globalBestUpdatedBy: null,
  };
}

export function stepSwarm(state: SwarmState, parameters: SwarmParameters, repulsor?: Repulsor): SwarmState {
  const nextIteration = state.iteration + 1;
  const particles = state.particles.map((particle) => {
    const { velocity } = particleForces(state, particle, parameters, repulsor);
    const position = {
      x: clampToDomain(particle.x + velocity.x),
      y: clampToDomain(particle.y + velocity.y),
    };
    const score = objective(position);
    const improved = score < particle.bestScore;
    return {
      ...particle,
      ...position,
      velocity,
      best: improved ? position : particle.best,
      bestScore: improved ? score : particle.bestScore,
    };
  });
  const best = particles.reduce((winner, particle) => particle.bestScore < winner.bestScore ? particle : winner);
  const globalImproved = best.bestScore < state.globalBestScore - Number.EPSILON;
  const spread = swarmSpread(particles);
  const trails = Object.fromEntries(particles.map((particle) => {
    const trail = [...(state.trails[particle.id] ?? []), { x: particle.x, y: particle.y }].slice(-TRAIL_LENGTH);
    return [particle.id, trail];
  }));
  return {
    particles,
    globalBest: { ...best.best },
    globalBestScore: best.bestScore,
    iteration: nextIteration,
    trails,
    history: [...state.history, { iteration: nextIteration, bestScore: best.bestScore, spread }],
    lastImprovementIteration: globalImproved ? nextIteration : state.lastImprovementIteration,
    previousGlobalBest: globalImproved ? { ...state.globalBest } : null,
    previousGlobalBestScore: globalImproved ? state.globalBestScore : null,
    globalBestUpdatedBy: globalImproved ? best.id : null,
  };
}

export function evolveSwarm(iterations: number, parameters = DEFAULT_PARAMETERS) {
  let state = initialSwarm();
  for (let index = 0; index < iterations; index += 1) state = stepSwarm(state, parameters);
  return state;
}
