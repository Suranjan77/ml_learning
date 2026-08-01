/**
 * A detector scores every event between 0 and 1, and a threshold turns those
 * scores into alerts. Both classes are modelled as normal score distributions,
 * evaluated analytically rather than sampled, so every count the exhibit shows
 * is exact and reproducible from the controls alone.
 *
 * The argument the model exists to support: accuracy is decided almost entirely
 * by the majority class, so a detector can be 99.9% accurate and still catch
 * nothing. Precision — not accuracy, and not the ROC curve — is what collapses
 * when the positive class is rare.
 */

/** Total events scored. Fixed, so counts stay comparable as the base rate moves. */
export const POPULATION = 100_000;

export const THRESHOLD_RANGE = { min: 0, max: 1, step: 0.01 } as const;

/** Prevalence of the positive class, as a percentage of all events. */
export const BASE_RATE_RANGE = { min: 0.1, max: 50, step: 0.1 } as const;

/** Distance between the two class means, in score units. */
export const SEPARATION_RANGE = { min: 0.1, max: 0.8, step: 0.01 } as const;

export const DEFAULT_THRESHOLD = 0.5;
export const DEFAULT_BASE_RATE = 1;
export const DEFAULT_SEPARATION = 0.34;

/** Shared spread of both class score distributions. */
const SIGMA = 0.15;
const CENTRE = 0.5;

export interface Confusion {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
}

export interface Metrics extends Confusion {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;
  /** Alerts a human would have to triage: the practical cost of the threshold. */
  alerts: number;
  /** Share of alerts that are false. The number that decides if a tool is used. */
  falseAlarmShare: number;
}

export interface RocPoint {
  threshold: number;
  falsePositiveRate: number;
  truePositiveRate: number;
  precision: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Abramowitz & Stegun 7.1.26 — accurate to about 1.5e-7, which is far finer
 * than any count this exhibit displays.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const series = t * (0.254829592
    + t * (-0.284496736
      + t * (1.421413741
        + t * (-1.453152027 + t * 1.061405429))));
  return sign * (1 - series * Math.exp(-z * z));
}

/** P(score ≤ x) for a normal distribution. */
export function normalCdf(x: number, mean: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mean) / (sigma * Math.SQRT2)));
}

/** Class means, pushed symmetrically apart by the separation control. */
export function classMeans(separation: number) {
  const half = clamp(separation, SEPARATION_RANGE.min, SEPARATION_RANGE.max) / 2;
  return { benign: CENTRE - half, attack: CENTRE + half };
}

/** Height of each class's score density at x, weighted by how common it is. */
export function densityAt(x: number, separation: number, baseRatePercent: number) {
  const { benign, attack } = classMeans(separation);
  const prevalence = clamp(baseRatePercent, BASE_RATE_RANGE.min, BASE_RATE_RANGE.max) / 100;
  const pdf = (value: number, mean: number) =>
    Math.exp(-((value - mean) ** 2) / (2 * SIGMA * SIGMA)) / (SIGMA * Math.sqrt(2 * Math.PI));
  return {
    benign: pdf(x, benign) * (1 - prevalence),
    attack: pdf(x, attack) * prevalence,
  };
}

/** Share of a class scoring at or above the threshold — its alert rate. */
export function rateAbove(threshold: number, mean: number): number {
  return 1 - normalCdf(threshold, mean, SIGMA);
}

export function confusionAt(
  threshold: number,
  baseRatePercent: number,
  separation: number,
): Confusion {
  const { benign, attack } = classMeans(separation);
  const prevalence = clamp(baseRatePercent, BASE_RATE_RANGE.min, BASE_RATE_RANGE.max) / 100;
  const positives = POPULATION * prevalence;
  const negatives = POPULATION - positives;

  const truePositives = positives * rateAbove(threshold, attack);
  const falsePositives = negatives * rateAbove(threshold, benign);

  return {
    truePositives,
    falseNegatives: positives - truePositives,
    falsePositives,
    trueNegatives: negatives - falsePositives,
  };
}

export function metricsAt(
  threshold: number,
  baseRatePercent: number,
  separation: number,
): Metrics {
  const confusion = confusionAt(threshold, baseRatePercent, separation);
  const { truePositives, falsePositives, falseNegatives, trueNegatives } = confusion;

  const alerts = truePositives + falsePositives;
  const positives = truePositives + falseNegatives;
  const negatives = trueNegatives + falsePositives;

  // An undefined metric is reported as 0 rather than NaN: with no alerts there
  // is no precision to speak of, and the scene says so in words.
  const precision = alerts > 0 ? truePositives / alerts : 0;
  const recall = positives > 0 ? truePositives / positives : 0;

  return {
    ...confusion,
    accuracy: (truePositives + trueNegatives) / POPULATION,
    precision,
    recall,
    specificity: negatives > 0 ? trueNegatives / negatives : 0,
    f1: precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0,
    alerts,
    falseAlarmShare: alerts > 0 ? falsePositives / alerts : 0,
  };
}

/**
 * The full sweep of thresholds. ROC coordinates ignore the base rate entirely,
 * which is exactly why a ROC curve can look excellent while the detector is
 * unusable — the precision carried alongside each point is what changes.
 */
export function sweep(baseRatePercent: number, separation: number, steps = 101): RocPoint[] {
  return Array.from({ length: steps }, (_, index) => {
    const threshold = index / (steps - 1);
    const { benign, attack } = classMeans(separation);
    return {
      threshold,
      falsePositiveRate: rateAbove(threshold, benign),
      truePositiveRate: rateAbove(threshold, attack),
      precision: metricsAt(threshold, baseRatePercent, separation).precision,
    };
  });
}

/** Trapezoidal area under the ROC curve, swept from high threshold to low. */
export function areaUnderRoc(separation: number, steps = 401): number {
  const points = sweep(BASE_RATE_RANGE.min, separation, steps)
    .slice()
    .sort((a, b) => a.falsePositiveRate - b.falsePositiveRate);

  let area = 0;
  for (let index = 1; index < points.length; index += 1) {
    const width = points[index].falsePositiveRate - points[index - 1].falsePositiveRate;
    area += width * (points[index].truePositiveRate + points[index - 1].truePositiveRate) / 2;
  }
  return area;
}

/**
 * The threshold a majority-class-driven metric would choose. With a rare
 * positive class this sits so high that it alerts on almost nothing, which is
 * the contradiction the exhibit is built around.
 */
export function accuracyOptimalThreshold(baseRatePercent: number, separation: number): number {
  let best = 0;
  let bestAccuracy = -1;
  for (let index = 0; index <= 100; index += 1) {
    const threshold = index / 100;
    const accuracy = metricsAt(threshold, baseRatePercent, separation).accuracy;
    if (accuracy > bestAccuracy) {
      bestAccuracy = accuracy;
      best = threshold;
    }
  }
  return best;
}

/** The threshold with the best balance of precision and recall. */
export function f1OptimalThreshold(baseRatePercent: number, separation: number): number {
  let best = 0;
  let bestF1 = -1;
  for (let index = 0; index <= 100; index += 1) {
    const threshold = index / 100;
    const score = metricsAt(threshold, baseRatePercent, separation).f1;
    if (score > bestF1) {
      bestF1 = score;
      best = threshold;
    }
  }
  return best;
}

/** Accuracy of the do-nothing detector that calls every event benign. */
export function majorityBaseline(baseRatePercent: number): number {
  const prevalence = clamp(baseRatePercent, BASE_RATE_RANGE.min, BASE_RATE_RANGE.max) / 100;
  return 1 - prevalence;
}
