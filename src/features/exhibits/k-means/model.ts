export interface Point {
  x: number;
  y: number;
}

export const DOMAIN = {
  xMin: -6.5,
  xMax: 6.5,
  yMin: -3.2,
  yMax: 3.2,
} as const;

export const K_VALUES = [2, 3, 4] as const;
export type KValue = (typeof K_VALUES)[number];

export const DEFAULT_K: KValue = 3;
export const DEFAULT_TOLERANCE = 1e-3;
export const DEFAULT_MAX_ITERATIONS = 15;

export interface HistoryEntry {
  centroids: Point[];
  assignments: number[];
  inertia: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampToDomain(point: Point): Point {
  return {
    x: clamp(point.x, DOMAIN.xMin, DOMAIN.xMax),
    y: clamp(point.y, DOMAIN.yMin, DOMAIN.yMax),
  };
}

export function squaredDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** Small deterministic PRNG (mulberry32) so the dataset never uses Math.random. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sample from two uniform draws (Box-Muller). */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const BLOBS = [
  { cx: -3.6, cy: 1.1, sx: 1.1, sy: 0.75, count: 25 },
  { cx: 2.6, cy: 1.5, sx: 0.9, sy: 0.7, count: 20 },
  { cx: 0.2, cy: -2.0, sx: 1.3, sy: 0.55, count: 15 },
] as const;

const DATASET_SEED = 20_260_712;

/** Three uneven, well-separated blobs, generated once from a fixed seed. */
function buildDataset(seed: number): Point[] {
  const rand = mulberry32(seed);
  const points: Point[] = [];
  for (const blob of BLOBS) {
    for (let index = 0; index < blob.count; index += 1) {
      const point = clampToDomain({
        x: blob.cx + gaussian(rand) * blob.sx,
        y: blob.cy + gaussian(rand) * blob.sy,
      });
      points.push({ x: Number(point.x.toFixed(3)), y: Number(point.y.toFixed(3)) });
    }
  }
  return points;
}

export const DATASET: readonly Point[] = Object.freeze(buildDataset(DATASET_SEED));

/**
 * Deterministic default starting centroids per k. Each set is intentionally
 * imperfect so the first iteration or two visibly improves the split.
 */
export const INITIAL_CENTROIDS: Record<KValue, Point[]> = {
  2: [
    { x: -1.0, y: 1.5 },
    { x: 1.0, y: -1.5 },
  ],
  3: [
    { x: -1.5, y: -0.5 },
    { x: 0.5, y: 2.0 },
    { x: 3.5, y: -1.0 },
  ],
  4: [
    { x: -4.5, y: 2.5 },
    { x: -1.0, y: -2.5 },
    { x: 2.0, y: 2.5 },
    { x: 4.5, y: -1.0 },
  ],
};

/**
 * A deliberately poor k=3 start: two centroids sit almost on top of each
 * other near the middle of the point cloud and end up splitting the two
 * nearer blobs between them, while the third starts in an empty corner of
 * the domain and only ever claims a stray point. k-means settles here
 * without correcting the mistake, at roughly three times the inertia of a
 * well-started run.
 */
export const BAD_INITIAL_CENTROIDS_K3: Point[] = [
  { x: 0.3, y: 0.3 },
  { x: -0.3, y: -0.3 },
  { x: 6.2, y: -3.0 },
];

/** Assign every point to the index of its nearest centroid. */
export function assignPoints(points: readonly Point[], centroids: readonly Point[]): number[] {
  return points.map((point) => {
    let bestIndex = 0;
    let bestDistance = Infinity;
    centroids.forEach((centroid, index) => {
      const distance = squaredDistance(point, centroid);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  });
}

/**
 * Move each centroid to the mean of the points assigned to it. A cluster
 * that received no points keeps its previous centroid instead of vanishing.
 */
export function updateCentroids(
  points: readonly Point[],
  assignments: readonly number[],
  previousCentroids: readonly Point[],
): Point[] {
  return previousCentroids.map((previous, cluster) => {
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    points.forEach((point, index) => {
      if (assignments[index] === cluster) {
        sumX += point.x;
        sumY += point.y;
        count += 1;
      }
    });
    if (count === 0) return previous;
    return { x: sumX / count, y: sumY / count };
  });
}

/** Sum of squared distances from each point to its assigned centroid. */
export function inertia(
  points: readonly Point[],
  assignments: readonly number[],
  centroids: readonly Point[],
): number {
  return points.reduce(
    (total, point, index) => total + squaredDistance(point, centroids[assignments[index]]),
    0,
  );
}

/** True once every centroid has moved less than `tolerance` between rounds. */
export function hasConverged(
  before: readonly Point[],
  after: readonly Point[],
  tolerance: number = DEFAULT_TOLERANCE,
): boolean {
  return before.every((point, index) => squaredDistance(point, after[index]) <= tolerance * tolerance);
}

/**
 * Run alternating assign/update phases until convergence (or the iteration
 * cap), returning one entry per completed full iteration. Pure and
 * deterministic: the same inputs always produce the same history.
 */
export function runToConvergence(
  points: readonly Point[],
  centroids: readonly Point[],
  maxIterations: number = DEFAULT_MAX_ITERATIONS,
  tolerance: number = DEFAULT_TOLERANCE,
): HistoryEntry[] {
  const history: HistoryEntry[] = [];
  let current = centroids.map((point) => ({ ...point }));

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const assignments = assignPoints(points, current);
    const updated = updateCentroids(points, assignments, current);
    const converged = hasConverged(current, updated, tolerance);
    current = updated;
    history.push({ centroids: current, assignments, inertia: inertia(points, assignments, current) });
    if (converged) break;
  }

  return history;
}
