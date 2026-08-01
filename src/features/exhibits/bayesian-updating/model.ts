/**
 * A Beta prior over an unknown rate, updated by Bernoulli observations. The
 * pairing is conjugate, so the posterior is another Beta and every curve here
 * is evaluated in closed form rather than sampled.
 *
 * The argument the model exists to support: a posterior is not a compromise
 * chosen by taste. It is the prior multiplied by the likelihood, and the amount
 * of data decides which of the two you end up listening to. Maximum likelihood
 * is what you get when you stop listening to the prior at all.
 */

export const PRIOR_MEAN_RANGE = { min: 0.05, max: 0.95, step: 0.01 } as const;

/** Concentration of the prior: how many prior "observations" it is worth. */
export const PRIOR_STRENGTH_RANGE = { min: 2, max: 80, step: 1 } as const;

export const OBSERVATION_RANGE = { min: 0, max: 200, step: 1 } as const;
export const OBSERVED_RATE_RANGE = { min: 0, max: 1, step: 0.01 } as const;

export const DEFAULT_PRIOR_MEAN = 0.3;
export const DEFAULT_PRIOR_STRENGTH = 20;
export const DEFAULT_OBSERVATIONS = 0;
export const DEFAULT_OBSERVED_RATE = 0.7;

export interface BetaParameters {
  alpha: number;
  beta: number;
}

export interface Distribution {
  /** Density sampled on a fixed grid over [0, 1]. */
  density: number[];
  mean: number;
  /** Most probable value. Undefined for a Beta with a parameter below 1. */
  mode: number | null;
  standardDeviation: number;
}

export interface Update {
  prior: BetaParameters;
  posterior: BetaParameters;
  successes: number;
  failures: number;
  /** Maximum likelihood estimate: the data's own answer, ignoring the prior. */
  maximumLikelihood: number | null;
  /** How far the posterior mean sits from prior towards the likelihood, 0…1. */
  dataInfluence: number;
}

export const GRID_STEPS = 201;

/** Grid the curves are evaluated on, shared so they can be compared pointwise. */
export const grid: readonly number[] = Array.from(
  { length: GRID_STEPS },
  (_, index) => index / (GRID_STEPS - 1),
);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Lanczos approximation, accurate to well beyond display precision. */
export function logGamma(x: number): number {
  const coefficients = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let series = 1.000000000190015;
  for (let index = 0; index < 6; index += 1) {
    y += 1;
    series += coefficients[index] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * series / x);
}

export function logBeta(alpha: number, beta: number): number {
  return logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
}

/** Beta density at x. Returns 0 outside the open interval to keep curves finite. */
export function betaPdf(x: number, { alpha, beta }: BetaParameters): number {
  if (x <= 0 || x >= 1) return 0;
  const logDensity = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta(alpha, beta);
  const density = Math.exp(logDensity);
  return Number.isFinite(density) ? density : 0;
}

/** Prior parameters from the two controls a learner actually manipulates. */
export function priorFrom(mean: number, strength: number): BetaParameters {
  const safeMean = clamp(mean, PRIOR_MEAN_RANGE.min, PRIOR_MEAN_RANGE.max);
  const safeStrength = clamp(strength, PRIOR_STRENGTH_RANGE.min, PRIOR_STRENGTH_RANGE.max);
  return { alpha: safeMean * safeStrength, beta: (1 - safeMean) * safeStrength };
}

export function describe(parameters: BetaParameters): Distribution {
  const { alpha, beta } = parameters;
  const total = alpha + beta;
  const mean = alpha / total;
  const variance = (alpha * beta) / (total * total * (total + 1));
  return {
    density: grid.map((x) => betaPdf(x, parameters)),
    mean,
    mode: alpha > 1 && beta > 1 ? (alpha - 1) / (total - 2) : null,
    standardDeviation: Math.sqrt(variance),
  };
}

/**
 * The likelihood of the observed data as a function of the rate. Scaled to
 * integrate to one over the grid so it can share an axis with the two Beta
 * curves — it is a likelihood, not a distribution over the rate, and the
 * exhibit says so.
 */
export function likelihoodCurve(successes: number, failures: number): number[] {
  if (successes + failures === 0) return grid.map(() => 0);
  const shape: BetaParameters = { alpha: successes + 1, beta: failures + 1 };
  return grid.map((x) => betaPdf(x, shape));
}

export function update(
  priorMean: number,
  priorStrength: number,
  observations: number,
  observedRate: number,
): Update {
  const prior = priorFrom(priorMean, priorStrength);
  const total = Math.round(clamp(observations, OBSERVATION_RANGE.min, OBSERVATION_RANGE.max));
  const successes = Math.round(total * clamp(observedRate, 0, 1));
  const failures = total - successes;

  // Conjugacy: the posterior is the prior with the counts simply added on.
  const posterior: BetaParameters = {
    alpha: prior.alpha + successes,
    beta: prior.beta + failures,
  };

  const priorMeanValue = prior.alpha / (prior.alpha + prior.beta);
  const posteriorMean = posterior.alpha / (posterior.alpha + posterior.beta);
  const maximumLikelihood = total > 0 ? successes / total : null;

  // How far the posterior travelled from the prior towards the data's answer.
  const distance = maximumLikelihood === null ? 0 : maximumLikelihood - priorMeanValue;
  const dataInfluence = Math.abs(distance) < 1e-12
    ? (total > 0 ? 1 : 0)
    : clamp((posteriorMean - priorMeanValue) / distance, 0, 1);

  return { prior, posterior, successes, failures, maximumLikelihood, dataInfluence };
}

/**
 * Equal-tailed credible interval, found on the shared grid. Precise enough for
 * a drawn band; the exhibit does not report it to more than two decimals.
 */
export function credibleInterval(parameters: BetaParameters, mass = 0.95): [number, number] {
  const density = grid.map((x) => betaPdf(x, parameters));
  const step = 1 / (GRID_STEPS - 1);
  const totalMass = density.reduce((sum, value) => sum + value * step, 0);
  if (totalMass <= 0) return [0, 1];

  const tail = (1 - mass) / 2;
  let cumulative = 0;
  let lower = 0;
  let upper = 1;
  let foundLower = false;

  for (let index = 0; index < density.length; index += 1) {
    cumulative += (density[index] * step) / totalMass;
    if (!foundLower && cumulative >= tail) {
      lower = grid[index];
      foundLower = true;
    }
    if (cumulative >= 1 - tail) {
      upper = grid[index];
      break;
    }
  }
  return [lower, upper];
}

/** Peak density across several curves, so they can share one vertical scale. */
export function peakOf(...curves: readonly number[][]): number {
  return Math.max(1e-6, ...curves.flat());
}
