export type SurfaceKind = "bowl" | "valley" | "multimodal";

export interface Point {
  x: number;
  y: number;
}

export interface DescentState extends Point {
  iteration: number;
  loss: number;
}

export type StepBehaviour = "settled" | "steady" | "overshoot" | "diverging";

export interface StepAssessment {
  behaviour: StepBehaviour;
  lossDelta: number;
  relativeLossDelta: number;
  crossedMinimum: boolean;
}

export type PathBehaviour = "converging" | "oscillating" | "diverging";

export interface PathAssessment {
  behaviour: PathBehaviour;
  lossDelta: number;
  relativeLossDelta: number;
  crossings: number;
}

export type LearningRegime = "steady" | "crossing" | "diverging";

export const DOMAIN = {
  xMin: -6.5,
  xMax: 6.5,
  yMin: -3.2,
  yMax: 3.2,
} as const;

export const DEFAULT_START: Point = { x: -3.4, y: 1.9 };
export const DEFAULT_LEARNING_RATE = 0.24;
export const DEFAULT_STEPS = 14;
export const LEARNING_RATE_RANGE = { min: 0.04, max: 1.2, step: 0.02 } as const;

const ANGLE = Math.PI / 6;
const COS = Math.cos(ANGLE);
const SIN = Math.sin(ANGLE);
const VALLEY_SHALLOW = 0.22;
const VALLEY_STEEP = 0.95;
const EPSILON = 1e-8;

/** Rotate screen-space parameters into the valley's shallow (u) and steep (v) axes. */
export function principalCoordinates(point: Point): Point {
  return {
    x: COS * point.x + SIN * point.y,
    y: -SIN * point.x + COS * point.y,
  };
}

/** Rotate valley-axis coordinates back into screen-space parameters. */
export function fromPrincipalCoordinates(point: Point): Point {
  return {
    x: COS * point.x - SIN * point.y,
    y: SIN * point.x + COS * point.y,
  };
}

export function lossAt(point: Point, surface: SurfaceKind): number {
  if (surface === "bowl") return 0.5 * (point.x ** 2 + point.y ** 2);
  if (surface === "multimodal") {
    return 0.12 * (point.x ** 2 + point.y ** 2)
      + 0.55 * (2 - Math.cos(2.4 * point.x) - Math.cos(2.4 * point.y));
  }
  const principal = principalCoordinates(point);
  return VALLEY_SHALLOW * principal.x ** 2 + VALLEY_STEEP * principal.y ** 2;
}

export function gradientAt(point: Point, surface: SurfaceKind): Point {
  if (surface === "bowl") return { x: point.x, y: point.y };
  if (surface === "multimodal") {
    return {
      x: 0.24 * point.x + 1.32 * Math.sin(2.4 * point.x),
      y: 0.24 * point.y + 1.32 * Math.sin(2.4 * point.y),
    };
  }

  const principal = principalCoordinates(point);
  const du = 2 * VALLEY_SHALLOW * principal.x;
  const dv = 2 * VALLEY_STEEP * principal.y;
  return {
    x: COS * du - SIN * dv,
    y: SIN * du + COS * dv,
  };
}

export function initialState(start: Point = DEFAULT_START, surface: SurfaceKind = "bowl"): DescentState {
  return { ...start, iteration: 0, loss: lossAt(start, surface) };
}

export function descend(state: DescentState, learningRate: number, surface: SurfaceKind): DescentState {
  const gradient = gradientAt(state, surface);
  const next = {
    x: state.x - learningRate * gradient.x,
    y: state.y - learningRate * gradient.y,
  };
  return { ...next, iteration: state.iteration + 1, loss: lossAt(next, surface) };
}

export function descentPath(
  start: Point = DEFAULT_START,
  learningRate = DEFAULT_LEARNING_RATE,
  surface: SurfaceKind = "bowl",
  steps = DEFAULT_STEPS,
): DescentState[] {
  const path = [initialState(start, surface)];
  for (let index = 0; index < steps; index += 1) {
    path.push(descend(path[path.length - 1], learningRate, surface));
  }
  return path;
}

export function learningRegime(learningRate: number, surface: SurfaceKind): LearningRegime {
  const steepestCurvature = surface === "bowl" ? 1 : surface === "valley" ? 2 * VALLEY_STEEP : 3.408;
  if (learningRate >= 2 / steepestCurvature) return "diverging";
  if (learningRate > 1 / steepestCurvature) return "crossing";
  return "steady";
}

export function assessStep(before: DescentState, after: DescentState, surface: SurfaceKind): StepAssessment {
  const lossDelta = after.loss - before.loss;
  const relativeLossDelta = before.loss <= EPSILON ? 0 : lossDelta / before.loss;
  const crossedMinimum = surface === "bowl"
    ? before.x * after.x + before.y * after.y < 0
    : surface === "valley"
      ? principalCoordinates(before).y * principalCoordinates(after).y < 0
      : (() => {
          const beforeGradient = gradientAt(before, surface);
          const afterGradient = gradientAt(after, surface);
          return beforeGradient.x * afterGradient.x + beforeGradient.y * afterGradient.y < 0;
        })();

  let behaviour: StepBehaviour = "steady";
  if (before.loss <= EPSILON) behaviour = "settled";
  else if (lossDelta > EPSILON) behaviour = "diverging";
  else if (crossedMinimum) behaviour = "overshoot";

  return { behaviour, lossDelta, relativeLossDelta, crossedMinimum };
}

/** Summarise the actual computed path rather than inferring its outcome from the rate alone. */
export function assessPath(path: DescentState[], surface: SurfaceKind): PathAssessment {
  const first = path[0];
  const last = path.at(-1);
  if (!first || !last) return { behaviour: "converging", lossDelta: 0, relativeLossDelta: 0, crossings: 0 };

  let crossings = 0;
  let lossIncreased = false;
  for (let index = 1; index < path.length; index += 1) {
    const step = assessStep(path[index - 1], path[index], surface);
    if (step.crossedMinimum) crossings += 1;
    if (step.lossDelta > EPSILON || !Number.isFinite(path[index].loss)) lossIncreased = true;
  }

  const lossDelta = last.loss - first.loss;
  const relativeLossDelta = first.loss <= EPSILON ? 0 : lossDelta / first.loss;
  const behaviour = lossIncreased || lossDelta > EPSILON
    ? "diverging"
    : crossings > 0
      ? "oscillating"
      : "converging";

  return { behaviour, lossDelta, relativeLossDelta, crossings };
}

/**
 * Find the largest rate on a disclosed test grid whose final loss is lower
 * than its starting loss. This is deliberately a finite experiment, not a
 * claim about every real-valued rate between two slider values.
 */
export function largestReducingRate(
  start: Point = DEFAULT_START,
  surface: SurfaceKind = "valley",
  range: { min: number; max: number; step: number } = LEARNING_RATE_RANGE,
  steps = DEFAULT_STEPS,
): number | undefined {
  const sampleCount = Math.round((range.max - range.min) / range.step);
  let largest: number | undefined;

  for (let index = 0; index <= sampleCount; index += 1) {
    const rate = Number((range.min + index * range.step).toFixed(10));
    const path = descentPath(start, rate, surface, steps);
    const first = path[0];
    const last = path.at(-1);
    if (last && Number.isFinite(last.loss) && last.loss < first.loss - EPSILON) {
      largest = rate;
    }
  }

  return largest;
}

/** Points on an equal-loss line, used to draw contours that match the model. */
export function contourPoints(surface: SurfaceKind, level: number, samples = 96): Point[] {
  const points: Point[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const angle = (index / samples) * Math.PI * 2;
    if (surface === "bowl") {
      const radius = Math.sqrt(2 * level);
      points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
    } else if (surface === "valley") {
      points.push(fromPrincipalCoordinates({
        x: Math.sqrt(level / VALLEY_SHALLOW) * Math.cos(angle),
        y: Math.sqrt(level / VALLEY_STEEP) * Math.sin(angle),
      }));
    } else break;
  }
  return points;
}

/** Numerically locate the distinct basins reached from a regular seed grid. */
export function multimodalMinima(): DescentState[] {
  const minima: DescentState[] = [];
  for (let x = -5.2; x <= 5.2; x += 1.3) {
    for (let y = -2.6; y <= 2.6; y += 1.3) {
      const endpoint = descentPath({ x, y }, 0.08, "multimodal", 100).at(-1)!;
      if (endpoint.x < DOMAIN.xMin || endpoint.x > DOMAIN.xMax || endpoint.y < DOMAIN.yMin || endpoint.y > DOMAIN.yMax) continue;
      if (!minima.some((item) => Math.hypot(item.x - endpoint.x, item.y - endpoint.y) < 0.18)) minima.push(endpoint);
    }
  }
  return minima.sort((a, b) => a.loss - b.loss);
}

export function clampToDomain(point: Point): Point {
  return {
    x: Math.max(DOMAIN.xMin, Math.min(DOMAIN.xMax, point.x)),
    y: Math.max(DOMAIN.yMin, Math.min(DOMAIN.yMax, point.y)),
  };
}
