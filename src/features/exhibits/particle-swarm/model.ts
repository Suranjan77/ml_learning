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

export const DOMAIN = { min: -5.12, max: 5.12 } as const;
export const DEFAULT_PARAMETERS: SwarmParameters = { inertia: 0.64, cognitive: 1.35, social: 1.55 };

/** Rastrigin: many local basins around one global minimum at (0, 0). */
export function objective(point: Point): number {
  return 20 + point.x ** 2 + point.y ** 2
    - 10 * (Math.cos(2 * Math.PI * point.x) + Math.cos(2 * Math.PI * point.y));
}

function noise(id: number, iteration: number, channel: number) {
  const value = Math.sin((id + 1) * 91.17 + (iteration + 1) * 47.31 + channel * 13.7) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number = DOMAIN.min, max: number = DOMAIN.max) {
  return Math.max(min, Math.min(max, value));
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

export function stepSwarm(state: SwarmState, parameters: SwarmParameters): SwarmState {
  const nextIteration = state.iteration + 1;
  const particles = state.particles.map((particle) => {
    const r1 = noise(particle.id, nextIteration, 1);
    const r2 = noise(particle.id, nextIteration, 2);
    const velocity = {
      x: clamp(parameters.inertia * particle.velocity.x
        + parameters.cognitive * r1 * (particle.best.x - particle.x)
        + parameters.social * r2 * (state.globalBest.x - particle.x), -1.45, 1.45),
      y: clamp(parameters.inertia * particle.velocity.y
        + parameters.cognitive * r1 * (particle.best.y - particle.y)
        + parameters.social * r2 * (state.globalBest.y - particle.y), -1.45, 1.45),
    };
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
