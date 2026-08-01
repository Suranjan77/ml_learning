/**
 * Decision stumps — one axis-aligned threshold each — combined two ways.
 *
 * Bagging fits every stump independently on its own bootstrap resample and
 * gives them all an equal vote. Boosting fits them one at a time, each on a
 * reweighting of the data that emphasises what the previous stumps got wrong,
 * and weights each vote by how well it did.
 *
 * The argument the model exists to support: neither method makes an individual
 * stump any better. A stump cannot represent a diagonal boundary and never
 * will. What changes is what a *collection* of them can express — and boosting
 * gets there with far fewer of them because it stops re-learning what it
 * already knows.
 */

export const DOMAIN = { xMin: 0, xMax: 10, yMin: 0, yMax: 6 } as const;

export const LEARNER_RANGE = { min: 1, max: 30, step: 1 } as const;
export const DEFAULT_LEARNERS = 1;

export const METHODS = ["bagging", "boosting"] as const;
export type Method = (typeof METHODS)[number];
export const DEFAULT_METHOD: Method = "boosting";

export interface LabelledPoint {
  x: number;
  y: number;
  /** +1 or −1, so a weighted vote is a plain sum. */
  label: 1 | -1;
}

export interface Stump {
  /** 0 splits on x, 1 splits on y. */
  feature: 0 | 1;
  threshold: number;
  /** +1 predicts the positive class above the threshold, −1 below. */
  polarity: 1 | -1;
  /** Vote weight. Uniform under bagging, error-dependent under boosting. */
  weight: number;
  weightedError: number;
}

/** Deterministic generator, so the dataset and every resample are reproducible. */
function lcg(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

/** The true boundary the stumps have to approximate: a diagonal they cannot draw. */
export function trueBoundaryY(x: number): number {
  return 0.46 * x + 0.9;
}

function buildDataset(): LabelledPoint[] {
  const random = lcg(20_260_731);
  const points: LabelledPoint[] = [];
  while (points.length < 90) {
    const x = DOMAIN.xMin + random() * (DOMAIN.xMax - DOMAIN.xMin);
    const y = DOMAIN.yMin + random() * (DOMAIN.yMax - DOMAIN.yMin);
    const margin = y - trueBoundaryY(x);
    // Leave a small corridor unlabelled so the classes do not touch, then flip
    // a few points to keep the problem from being perfectly separable.
    if (Math.abs(margin) < 0.28) continue;
    const noisy = random() < 0.06;
    const label: 1 | -1 = (margin > 0) === !noisy ? 1 : -1;
    points.push({ x, y, label });
  }
  return points;
}

export const DATASET: readonly LabelledPoint[] = Object.freeze(buildDataset());

/** Candidate thresholds: midpoints between consecutive observed values. */
function candidateThresholds(points: readonly LabelledPoint[], feature: 0 | 1): number[] {
  const values = [...new Set(points.map((point) => (feature === 0 ? point.x : point.y)))]
    .sort((a, b) => a - b);
  const thresholds: number[] = [];
  for (let index = 1; index < values.length; index += 1) {
    thresholds.push((values[index - 1] + values[index]) / 2);
  }
  return thresholds;
}

export function stumpPredict(stump: Stump, x: number, y: number): 1 | -1 {
  const value = stump.feature === 0 ? x : y;
  return value > stump.threshold ? stump.polarity : (-stump.polarity as 1 | -1);
}

/**
 * The single best axis-aligned threshold under the supplied weights. Exhaustive
 * over both features and every midpoint, so there is nothing stochastic here —
 * randomness enters only through which points bagging shows it.
 */
export function bestStump(
  points: readonly LabelledPoint[],
  weights: readonly number[],
): Stump {
  let best: Stump = { feature: 0, threshold: DOMAIN.xMin, polarity: 1, weight: 0, weightedError: 1 };
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;

  for (const feature of [0, 1] as const) {
    for (const threshold of candidateThresholds(points, feature)) {
      for (const polarity of [1, -1] as const) {
        let error = 0;
        for (let index = 0; index < points.length; index += 1) {
          const value = feature === 0 ? points[index].x : points[index].y;
          const predicted = value > threshold ? polarity : -polarity;
          if (predicted !== points[index].label) error += weights[index];
        }
        const weightedError = error / totalWeight;
        if (weightedError < best.weightedError) {
          best = { feature, threshold, polarity, weight: 0, weightedError };
        }
      }
    }
  }
  return best;
}

/** AdaBoost: reweight towards mistakes, then weight each vote by its accuracy. */
export function boost(rounds: number, points: readonly LabelledPoint[] = DATASET): Stump[] {
  const weights = points.map(() => 1 / points.length);
  const learners: Stump[] = [];

  for (let round = 0; round < rounds; round += 1) {
    const stump = bestStump(points, weights);
    // Clamp away from 0 and 0.5 so alpha stays finite and non-negative.
    const error = Math.min(0.4999, Math.max(1e-10, stump.weightedError));
    const alpha = 0.5 * Math.log((1 - error) / error);
    learners.push({ ...stump, weight: alpha });

    let total = 0;
    for (let index = 0; index < points.length; index += 1) {
      const agreed = stumpPredict(stump, points[index].x, points[index].y) === points[index].label;
      weights[index] *= Math.exp(agreed ? -alpha : alpha);
      total += weights[index];
    }
    for (let index = 0; index < points.length; index += 1) weights[index] /= total || 1;
  }
  return learners;
}

/** Bagging: each stump sees its own bootstrap resample and gets one equal vote. */
export function bag(rounds: number, points: readonly LabelledPoint[] = DATASET): Stump[] {
  const learners: Stump[] = [];
  for (let round = 0; round < rounds; round += 1) {
    const random = lcg(97_003 + round * 7_919);
    const sample = Array.from({ length: points.length }, () =>
      points[Math.floor(random() * points.length)]);
    const stump = bestStump(sample, sample.map(() => 1 / sample.length));
    learners.push({ ...stump, weight: 1 });
  }
  return learners;
}

export function ensemble(method: Method, rounds: number): Stump[] {
  return method === "boosting" ? boost(rounds) : bag(rounds);
}

/** Signed margin of the weighted vote. Its sign is the prediction. */
export function score(learners: readonly Stump[], x: number, y: number): number {
  return learners.reduce(
    (total, stump) => total + stump.weight * stumpPredict(stump, x, y),
    0,
  );
}

export function predict(learners: readonly Stump[], x: number, y: number): 1 | -1 {
  return score(learners, x, y) >= 0 ? 1 : -1;
}

export function trainingAccuracy(
  learners: readonly Stump[],
  points: readonly LabelledPoint[] = DATASET,
): number {
  if (learners.length === 0) return 0;
  const correct = points.reduce(
    (count, point) => count + (predict(learners, point.x, point.y) === point.label ? 1 : 0),
    0,
  );
  return correct / points.length;
}

/** Accuracy of the single best stump — the floor the ensemble has to beat. */
export function singleStumpAccuracy(points: readonly LabelledPoint[] = DATASET): number {
  const stump = bestStump(points, points.map(() => 1 / points.length));
  return 1 - stump.weightedError;
}

export interface DecisionGrid {
  columns: number;
  rows: number;
  /** Signed vote margin at each cell centre, normalised to [-1, 1]. */
  cells: number[];
}

/** Vote margin sampled on a grid, for drawing the combined decision surface. */
export function decisionGrid(
  learners: readonly Stump[],
  columns = 56,
  rows = 34,
): DecisionGrid {
  const totalWeight = learners.reduce((sum, stump) => sum + Math.abs(stump.weight), 0) || 1;
  const cells: number[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = DOMAIN.xMin + ((column + 0.5) / columns) * (DOMAIN.xMax - DOMAIN.xMin);
      const y = DOMAIN.yMin + ((row + 0.5) / rows) * (DOMAIN.yMax - DOMAIN.yMin);
      cells.push(score(learners, x, y) / totalWeight);
    }
  }
  return { columns, rows, cells };
}
