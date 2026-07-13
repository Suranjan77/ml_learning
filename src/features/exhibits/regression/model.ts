export type RegressionMode = "linear" | "logistic";
export interface RegressionPoint { x: number; y: number }
export interface ClassificationPoint extends RegressionPoint { label: 0 | 1 }

export const REGRESSION_POINTS: readonly RegressionPoint[] = Object.freeze(
  Array.from({ length: 17 }, (_, index) => {
    const x = -4 + index * 0.5;
    const noise = Math.sin(index * 2.31) * 0.42 + Math.cos(index * 0.77) * 0.16;
    return { x, y: 0.78 * x + 0.42 + noise };
  }),
);

export const CLASSIFICATION_POINTS: readonly ClassificationPoint[] = Object.freeze(
  Array.from({ length: 24 }, (_, index) => {
    const x = -4.2 + (index % 8) * 1.2 + Math.sin(index * 1.7) * 0.18;
    const band = Math.floor(index / 8);
    const boundary = 0.62 * x - 0.25;
    const offset = [-1.45, 1.35, index % 2 === 0 ? -0.72 : 0.78][band];
    const y = boundary + offset + Math.cos(index * 1.11) * 0.18;
    return { x, y, label: y > boundary ? 1 : 0 } as ClassificationPoint;
  }),
);

export function predictLinear(x: number, slope: number, intercept: number) {
  return slope * x + intercept;
}

export function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

export function meanSquaredLoss(slope: number, intercept: number) {
  return REGRESSION_POINTS.reduce((sum, point) => {
    const error = predictLinear(point.x, slope, intercept) - point.y;
    return sum + error * error;
  }, 0) / REGRESSION_POINTS.length;
}

export function logisticLoss(slope: number, intercept: number) {
  return CLASSIFICATION_POINTS.reduce((sum, point) => {
    const probability = sigmoid((point.y - predictLinear(point.x, slope, intercept)) * 1.6);
    const bounded = Math.max(1e-8, Math.min(1 - 1e-8, probability));
    return sum - (point.label * Math.log(bounded) + (1 - point.label) * Math.log(1 - bounded));
  }, 0) / CLASSIFICATION_POINTS.length;
}

export function lossFor(mode: RegressionMode, slope: number, intercept: number) {
  return mode === "linear" ? meanSquaredLoss(slope, intercept) : logisticLoss(slope, intercept);
}

export function classificationAccuracy(slope: number, intercept: number) {
  const correct = CLASSIFICATION_POINTS.filter((point) =>
    Number(point.y > predictLinear(point.x, slope, intercept)) === point.label,
  ).length;
  return correct / CLASSIFICATION_POINTS.length;
}
