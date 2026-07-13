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

export interface SwarmState {
  particles: Particle[];
  globalBest: Point;
  globalBestScore: number;
  iteration: number;
}

export interface SwarmParameters {
  inertia: number;
  cognitive: number;
  social: number;
}

/** Optional environmental pressure used by the flocking metaphor, not canonical PSO. */
export interface Repulsor extends Point {
  radius: number;
  strength: number;
}

export interface ParticleForces {
  inertia: Point;
  cognitive: Point;
  social: Point;
  repulsion: Point;
  velocity: Point;
}

export const DOMAIN = { min: -5.12, max: 5.12 } as const;
export const DEFAULT_PARAMETERS: SwarmParameters = { inertia: 0.64, cognitive: 1.35, social: 1.55 };

/** Rastrigin: many local basins around one global minimum at (0, 0). */
export function objective(point: Point): number {
  return 20 + point.x ** 2 + point.y ** 2
    - 10 * (Math.cos(2 * Math.PI * point.x) + Math.cos(2 * Math.PI * point.y));
}

/** A deterministic orbit keeps the predator interaction reproducible. */
export function predatorAt(iteration: number): Point {
  const angle = iteration * 0.43 + 0.7;
  return { x: Math.cos(angle) * 2.65, y: Math.sin(angle) * 2.15 };
}

function noise(id: number, iteration: number, channel: number) {
  const value = Math.sin((id + 1) * 91.17 + (iteration + 1) * 47.31 + channel * 13.7) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number = DOMAIN.min, max: number = DOMAIN.max) {
  return Math.max(min, Math.min(max, value));
}

export function particleForces(
  state: SwarmState,
  particle: Particle,
  parameters: SwarmParameters,
  repulsor?: Repulsor,
): ParticleForces {
  const nextIteration = state.iteration + 1;
  const r1 = noise(particle.id, nextIteration, 1);
  const r2 = noise(particle.id, nextIteration, 2);
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
    x: parameters.cognitive * r1 * (particle.best.x - particle.x),
    y: parameters.cognitive * r1 * (particle.best.y - particle.y),
  };
  const social = {
    x: parameters.social * r2 * (state.globalBest.x - particle.x),
    y: parameters.social * r2 * (state.globalBest.y - particle.y),
  };
  const repulsion = { x: away.x * avoidance, y: away.y * avoidance };
  return {
    inertia,
    cognitive,
    social,
    repulsion,
    velocity: {
      x: clamp(inertia.x + cognitive.x + social.x + repulsion.x, -1.45, 1.45),
      y: clamp(inertia.y + cognitive.y + social.y + repulsion.y, -1.45, 1.45),
    },
  };
}

export function initialSwarm(count = 18): SwarmState {
  const particles: Particle[] = Array.from({ length: count }, (_, id) => {
    const angle = id * 2.399963;
    const radius = 1.3 + (id % 6) * 0.66;
    const point = {
      x: clamp(Math.cos(angle) * radius + (id % 2 ? 0.75 : -0.4)),
      y: clamp(Math.sin(angle) * radius + (id % 3 ? -0.35 : 0.7)),
    };
    return {
      id,
      ...point,
      velocity: { x: (noise(id, 0, 4) - 0.5) * 0.8, y: (noise(id, 0, 5) - 0.5) * 0.8 },
      best: point,
      bestScore: objective(point),
    };
  });
  const best = particles.reduce((winner, particle) => particle.bestScore < winner.bestScore ? particle : winner);
  return { particles, globalBest: { ...best.best }, globalBestScore: best.bestScore, iteration: 0 };
}

export function stepSwarm(state: SwarmState, parameters: SwarmParameters, repulsor?: Repulsor): SwarmState {
  const nextIteration = state.iteration + 1;
  const particles = state.particles.map((particle) => {
    const { velocity } = particleForces(state, particle, parameters, repulsor);
    const position = { x: clamp(particle.x + velocity.x), y: clamp(particle.y + velocity.y) };
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
  return {
    particles,
    globalBest: { ...best.best },
    globalBestScore: best.bestScore,
    iteration: nextIteration,
  };
}

export function evolveSwarm(iterations: number, parameters = DEFAULT_PARAMETERS) {
  let state = initialSwarm();
  for (let index = 0; index < iterations; index += 1) state = stepSwarm(state, parameters);
  return state;
}
