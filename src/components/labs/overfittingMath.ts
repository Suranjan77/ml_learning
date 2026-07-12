/**
 * Pure math for the Overfitting Lab. No React, no DOM — safe to unit test
 * in isolation and safe to call on every slider tick.
 *
 * The core operation is polynomial regression: given points and a target
 * degree, find the coefficients that minimize squared error (optionally
 * with an L2 / ridge penalty). We solve it via the normal equations
 * (V^T V + λI) c = V^T y, built from a Vandermonde-style design matrix and
 * solved with Gaussian elimination + partial pivoting.
 *
 * Numeric stability note: raw x values raised to the 15th power blow up
 * (or underflow) fast, which wrecks conditioning. We linearly remap x into
 * [-1, 1] before building the design matrix — the fit is computed and
 * stored entirely in that normalized space, and `predict` re-applies the
 * same mapping to any x it is asked to evaluate. This is what makes degree
 * 15 fits usable at all instead of dissolving into NaN/Infinity.
 */

import { createSeededRNG } from "@/lib/prng";

export interface XYPoint {
  x: number;
  y: number;
}

export type Split = "train" | "test";

export interface DataPoint extends XYPoint {
  split: Split;
}

export interface PolynomialFit {
  /** Polynomial degree (number of coefficients is degree + 1). */
  degree: number;
  /** Coefficients in normalized-x space, lowest power first. */
  coefficients: number[];
  /** Evaluate the fitted polynomial at an arbitrary (un-normalized) x. */
  predict: (x: number) => number;
}

/**
 * Solve the linear system A x = b via Gaussian elimination with partial
 * pivoting. A is mutated via a local copy; A and b are not modified.
 *
 * If a pivot is (numerically) zero — the system is singular, which can
 * happen with degenerate/duplicate data even after ridge regularization —
 * the corresponding unknown is left at 0 rather than dividing by ~0. This
 * keeps the caller's output finite instead of propagating NaN/Infinity.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxAbs = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      const candidate = Math.abs(M[r][col]);
      if (candidate > maxAbs) {
        maxAbs = candidate;
        pivotRow = r;
      }
    }
    if (pivotRow !== col) {
      const tmp = M[col];
      M[col] = M[pivotRow];
      M[pivotRow] = tmp;
    }

    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-300) continue;

    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / pivot;
      if (factor === 0) continue;
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = M[r][n];
    for (let c = r + 1; c < n; c++) {
      sum -= M[r][c] * x[c];
    }
    x[r] = Math.abs(M[r][r]) < 1e-300 ? 0 : sum / M[r][r];
  }
  return x;
}

/** A fit with all-zero coefficients — used when there is no data to fit. */
function emptyFit(degree: number): PolynomialFit {
  const coefficients = new Array(degree + 1).fill(0);
  return { degree, coefficients, predict: () => 0 };
}

/**
 * Fit a degree-N polynomial to `points` by ridge-regularized least squares.
 *
 * `lambda` is the L2 penalty strength. The default (1e-9) is not meant as a
 * regularization feature — it's a numeric-stability floor so the normal
 * equations never present a hard-singular matrix. Callers exploring the
 * bias/variance tradeoff should pass their own, larger lambda explicitly.
 */
export function fitPolynomial(
  points: readonly XYPoint[],
  degree: number,
  lambda = 1e-9,
): PolynomialFit {
  const safeDegree = Math.max(0, Math.floor(degree));
  if (points.length === 0) return emptyFit(safeDegree);

  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const mid = (minX + maxX) / 2;
  const half = (maxX - minX) / 2 || 1;
  const normalize = (x: number) => (x - mid) / half;

  const k = safeDegree + 1;
  const VtV: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const Vty: number[] = new Array(k).fill(0);
  const row = new Array(k).fill(0);

  for (const p of points) {
    const nx = normalize(p.x);
    let power = 1;
    for (let i = 0; i < k; i++) {
      row[i] = power;
      power *= nx;
    }
    for (let i = 0; i < k; i++) {
      const rowI = row[i];
      if (rowI !== 0) {
        for (let j = 0; j < k; j++) {
          VtV[i][j] += rowI * row[j];
        }
        Vty[i] += rowI * p.y;
      }
    }
  }

  // Tiny fixed epsilon on top of the caller's lambda: guarantees a
  // numerically usable diagonal even when lambda is exactly 0.
  const EPS = 1e-12;
  for (let i = 0; i < k; i++) {
    VtV[i][i] += lambda + EPS;
  }

  const coefficients = solveLinearSystem(VtV, Vty);

  const predict = (x: number) => {
    const nx = normalize(x);
    let result = 0;
    let power = 1;
    for (let i = 0; i < k; i++) {
      result += coefficients[i] * power;
      power *= nx;
    }
    return result;
  };

  return { degree: safeDegree, coefficients, predict };
}

/** Root-mean-square error of `predict` against `points`. */
export function rmse(points: readonly XYPoint[], predict: (x: number) => number): number {
  if (points.length === 0) return 0;
  const sumSq = points.reduce((total, p) => {
    const residual = p.y - predict(p.x);
    return total + residual * residual;
  }, 0);
  return Math.sqrt(sumSq / points.length);
}

/** Domain of the preset dataset. */
export const PRESET_DOMAIN: readonly [number, number] = [0, 10];

/** Standard deviation of the Gaussian noise added to the preset dataset. */
export const PRESET_NOISE_STD = 0.55;

/** Default seed used to generate the preset dataset. */
export const PRESET_SEED = 20240611;

/**
 * The "true" function the preset dataset is a noisy sample of — a smooth,
 * non-polynomial (sin-based) curve. Never fit exactly by any finite-degree
 * polynomial, which is exactly what makes the overfitting behavior visible.
 */
export function groundTruth(x: number): number {
  return Math.sin(x * 1.3) * 2.2 + 0.15 * x;
}

/**
 * Generate the deterministic preset dataset: ~28 points spread over
 * PRESET_DOMAIN, y = groundTruth(x) + Gaussian noise, each tagged train/test
 * (~70/30). Everything — jitter, noise, and the train/test tag — is drawn
 * from a single seeded PRNG so the same seed always reproduces the same
 * dataset.
 */
export function generatePresetDataset(seed: number = PRESET_SEED): DataPoint[] {
  const rng = createSeededRNG(seed);
  const n = 28;
  const [lo, hi] = PRESET_DOMAIN;
  const span = hi - lo;
  const points: DataPoint[] = [];

  for (let i = 0; i < n; i++) {
    const base = lo + (span * i) / (n - 1);
    const jitter = (rng.next() - 0.5) * (span / n) * 0.6;
    const x = Math.min(hi, Math.max(lo, base + jitter));
    const y = groundTruth(x) + rng.nextGaussian() * PRESET_NOISE_STD;
    const split: Split = rng.next() < 0.3 ? "test" : "train";
    points.push({ x, y, split });
  }

  return points;
}

export type Verdict = "underfitting" | "sweet spot" | "overfitting";

/**
 * Classify the current fit from train/test RMSE. Train error well above the
 * dataset's noise floor means the model is too simple to capture the
 * signal (underfitting); test error meaningfully worse than train error
 * means it has started memorizing noise (overfitting); otherwise it's
 * roughly as good as the noise allows (sweet spot).
 */
export function classifyFit(
  trainRmse: number,
  testRmse: number,
  noiseFloor: number = PRESET_NOISE_STD,
): Verdict {
  if (trainRmse > noiseFloor * 1.15) return "underfitting";
  const ratio = trainRmse > 1e-9 ? testRmse / trainRmse : testRmse > 1e-9 ? Infinity : 1;
  if (ratio > 1.35) return "overfitting";
  return "sweet spot";
}
