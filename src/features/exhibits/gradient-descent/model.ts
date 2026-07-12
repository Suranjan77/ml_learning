export type SurfaceKind = "bowl" | "valley";

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
  const principal = principalCoordinates(point);
  return VALLEY_SHALLOW * principal.x ** 2 + VALLEY_STEEP * principal.y ** 2;
}

export function gradientAt(point: Point, surface: SurfaceKind): Point {
  if (surface === "bowl") return { x: point.x, y: point.y };

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
  const steepestCurvature = surface === "bowl" ? 1 : 2 * VALLEY_STEEP;
  if (learningRate >= 2 / steepestCurvature) return "diverging";
  if (learningRate > 1 / steepestCurvature) return "crossing";
  return "steady";
}

export function assessStep(before: DescentState, after: DescentState, surface: SurfaceKind): StepAssessment {
  const lossDelta = after.loss - before.loss;
  const relativeLossDelta = before.loss <= EPSILON ? 0 : lossDelta / before.loss;
  const crossedMinimum = surface === "bowl"
    ? before.x * after.x + before.y * after.y < 0
    : principalCoordinates(before).y * principalCoordinates(after).y < 0;

  let behaviour: StepBehaviour = "steady";
  if (before.loss <= EPSILON) behaviour = "settled";
  else if (lossDelta > EPSILON) behaviour = "diverging";
  else if (crossedMinimum) behaviour = "overshoot";

  return { behaviour, lossDelta, relativeLossDelta, crossedMinimum };
}

/** Points on an equal-loss line, used to draw contours that match the model. */
export function contourPoints(surface: SurfaceKind, level: number, samples = 96): Point[] {
  const points: Point[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const angle = (index / samples) * Math.PI * 2;
    if (surface === "bowl") {
      const radius = Math.sqrt(2 * level);
      points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
    } else {
      points.push(fromPrincipalCoordinates({
        x: Math.sqrt(level / VALLEY_SHALLOW) * Math.cos(angle),
        y: Math.sqrt(level / VALLEY_STEEP) * Math.sin(angle),
      }));
    }
  }
  return points;
}

export function clampToDomain(point: Point): Point {
  return {
    x: Math.max(DOMAIN.xMin, Math.min(DOMAIN.xMax, point.x)),
    y: Math.max(DOMAIN.yMin, Math.min(DOMAIN.yMax, point.y)),
  };
}
