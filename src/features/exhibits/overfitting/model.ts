export interface Point {
  x: number;
  y: number;
}

export interface Dataset {
  train: Point[];
  validation: Point[];
}

export interface ErrorByDegree {
  degrees: number[];
  trainError: number[];
  validationError: number[];
}

export type FitRegime = "underfit" | "good fit" | "overfit";

export const DEGREE_RANGE = { min: 1, max: 11 } as const;
export const DEFAULT_DEGREE = 3;
export const DEFAULT_SEED = 1;

const TRAIN_COUNT = 16;
const VALIDATION_COUNT = 12;
const NOISE_SIGMA = 0.12;
const RIDGE = 1e-8;
const SEED_CYCLE_LENGTH = 24;
/** A degree whose validation error is within this fraction of the curve's
 * minimum still reads as a "good fit" rather than under- or overfitting. */
const GOOD_FIT_TOLERANCE = 0.25;

/** Deterministic seeded PRNG (mulberry32); returns floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Approximate standard-normal noise from two uniform draws (Box-Muller). */
function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-9);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** The smooth ground-truth function the exhibit is trying to recover. */
export function trueFunction(x: number): number {
  return Math.sin(2.1 * Math.PI * x) * 0.8 + 0.2 * x;
}

/** Advances the seed used for resampling, cycling back once it grows too large. */
export function nextSeed(seed: number): number {
  return seed >= DEFAULT_SEED + SEED_CYCLE_LENGTH - 1 ? DEFAULT_SEED : seed + 1;
}

/** Deterministic noisy train/validation samples drawn from the same distribution. */
export function samplePoints(seed: number): Dataset {
  const random = mulberry32(seed);
  const draw = (count: number): Point[] => {
    const points: Point[] = [];
    for (let index = 0; index < count; index += 1) {
      const x = random();
      const y = trueFunction(x) + gaussian(random) * NOISE_SIGMA;
      points.push({ x, y });
    }
    return points.sort((a, b) => a.x - b.x);
  };
  return { train: draw(TRAIN_COUNT), validation: draw(VALIDATION_COUNT) };
}

function vandermonde(points: readonly Point[], degree: number): number[][] {
  return points.map((point) => {
    const row: number[] = [];
    let power = 1;
    for (let column = 0; column <= degree; column += 1) {
      row.push(power);
      power *= point.x;
    }
    return row;
  });
}

function transpose(matrix: readonly number[][]): number[][] {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

function multiply(a: readonly number[][], b: readonly number[][]): number[][] {
  return a.map((row) =>
    b[0].map((_, column) => row.reduce((sum, value, index) => sum + value * b[index][column], 0)),
  );
}

function multiplyVector(a: readonly number[][], v: readonly number[]): number[] {
  return a.map((row) => row.reduce((sum, value, index) => sum + value * v[index], 0));
}

/** Solves a symmetric positive-definite system via Gauss-Jordan elimination with partial pivoting. */
function solve(matrix: number[][], vector: number[]): number[] {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivotRow = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])) pivotRow = row;
    }
    [augmented[column], augmented[pivotRow]] = [augmented[pivotRow], augmented[column]];

    const pivot = augmented[column][column] || 1e-12;
    for (let k = column; k <= size; k += 1) augmented[column][k] /= pivot;

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let k = column; k <= size; k += 1) augmented[row][k] -= factor * augmented[column][k];
    }
  }

  return augmented.map((row) => row[size]);
}

/** Least-squares polynomial fit (coefficients lowest-to-highest degree) via ridge-regularised normal equations. */
export function fitPolynomial(points: readonly Point[], degree: number): number[] {
  const design = vandermonde(points, degree);
  const designTransposed = transpose(design);
  const gram = multiply(designTransposed, design);
  for (let index = 0; index < gram.length; index += 1) gram[index][index] += RIDGE;
  const target = multiplyVector(designTransposed, points.map((point) => point.y));
  return solve(gram, target);
}

export function predict(coefficients: readonly number[], x: number): number {
  let result = 0;
  let power = 1;
  for (const coefficient of coefficients) {
    result += coefficient * power;
    power *= x;
  }
  return result;
}

export function meanSquaredError(coefficients: readonly number[], points: readonly Point[]): number {
  const sum = points.reduce((total, point) => total + (predict(coefficients, point.x) - point.y) ** 2, 0);
  return sum / points.length;
}

/** Fits every degree in range and reports training and validation error at each. */
export function errorByDegree(
  train: readonly Point[],
  validation: readonly Point[],
  maxDegree: number = DEGREE_RANGE.max,
): ErrorByDegree {
  const degrees: number[] = [];
  const trainError: number[] = [];
  const validationError: number[] = [];
  for (let degree = DEGREE_RANGE.min; degree <= maxDegree; degree += 1) {
    const coefficients = fitPolynomial(train, degree);
    degrees.push(degree);
    trainError.push(meanSquaredError(coefficients, train));
    validationError.push(meanSquaredError(coefficients, validation));
  }
  return { degrees, trainError, validationError };
}

/** Names the fitting regime at a degree by comparing its validation error with the curve's minimum. */
export function regimeAtDegree(curve: ErrorByDegree, degree: number): FitRegime {
  const index = curve.degrees.indexOf(degree);
  if (index === -1) return "good fit";

  let bestIndex = 0;
  for (let i = 1; i < curve.validationError.length; i += 1) {
    if (curve.validationError[i] < curve.validationError[bestIndex]) bestIndex = i;
  }

  const bestError = curve.validationError[bestIndex];
  const isNearMinimum = bestError <= 0
    ? curve.validationError[index] <= 0
    : curve.validationError[index] <= bestError * (1 + GOOD_FIT_TOLERANCE);
  if (isNearMinimum) return "good fit";

  return degree < curve.degrees[bestIndex] ? "underfit" : "overfit";
}
