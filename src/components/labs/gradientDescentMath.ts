/**
 * Pure math for the Gradient Descent Lab: loss surfaces and optimizer
 * update rules. No React, no DOM — safe to unit test in isolation and to
 * call from a canvas render loop.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Domain {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface LossSurface {
  id: string;
  label: string;
  /** Loss value at (x, y). */
  f: (x: number, y: number) => number;
  /** Analytic gradient [df/dx, df/dy] at (x, y). */
  grad: (x: number, y: number) => [number, number];
  domain: Domain;
  startDefault: Point2D;
  minimum: Point2D;
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

// 1. Well-conditioned bowl: f = x^2 + y^2. Circular contours, minimum at 0,0.
const bowl: LossSurface = {
  id: "bowl",
  label: "Bowl (well-conditioned)",
  f: (x, y) => x * x + y * y,
  grad: (x, y) => [2 * x, 2 * y],
  domain: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
  startDefault: { x: -3, y: 2.6 },
  minimum: { x: 0, y: 0 },
};

// 2. Ill-conditioned valley: steep in one rotated direction, gentle in the
// other. f(x, y) = 25*u^2 + v^2 where (u, v) is (x, y) rotated by theta.
// This keeps the surface a rotated elliptic bowl (a classic ravine) with a
// minimum at the origin.
const VALLEY_THETA = Math.PI / 8;
const cosT = Math.cos(VALLEY_THETA);
const sinT = Math.sin(VALLEY_THETA);
function valleyUV(x: number, y: number): [number, number] {
  const u = cosT * x + sinT * y;
  const v = -sinT * x + cosT * y;
  return [u, v];
}
const valley: LossSurface = {
  id: "valley",
  label: "Ravine (ill-conditioned)",
  f: (x, y) => {
    const [u, v] = valleyUV(x, y);
    return 25 * u * u + v * v;
  },
  grad: (x, y) => {
    const [u, v] = valleyUV(x, y);
    // d/dx = df/du * du/dx + df/dv * dv/dx, with du/dx = cosT, dv/dx = -sinT
    const dfdu = 50 * u;
    const dfdv = 2 * v;
    const dx = dfdu * cosT + dfdv * -sinT;
    const dy = dfdu * sinT + dfdv * cosT;
    return [dx, dy];
  },
  domain: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
  startDefault: { x: -3.4, y: -1.2 },
  minimum: { x: 0, y: 0 },
};

// 3. Rosenbrock banana: f = (a - x)^2 + b*(y - x^2)^2, classic a=1, b=100
// scaled down so it fits a friendlier domain and step sizes.
const ROSEN_A = 1;
const ROSEN_B_RAW = 100;
const ROSEN_SCALE = 0.02; // tames the steepness for interactive learning rates
const rosenbrock: LossSurface = {
  id: "rosenbrock",
  label: "Rosenbrock banana",
  f: (x, y) =>
    ROSEN_SCALE *
    ((ROSEN_A - x) * (ROSEN_A - x) +
      ROSEN_B_RAW * (y - x * x) * (y - x * x)),
  grad: (x, y) => {
    const dfdx =
      ROSEN_SCALE *
      (-2 * (ROSEN_A - x) - 4 * ROSEN_B_RAW * x * (y - x * x));
    const dfdy = ROSEN_SCALE * (2 * ROSEN_B_RAW * (y - x * x));
    return [dfdx, dfdy];
  },
  domain: { xMin: -2, xMax: 2, yMin: -1, yMax: 3 },
  startDefault: { x: -1.5, y: 2.2 },
  minimum: { x: 1, y: 1 },
};

// 4. Saddle-plus-bowl: f = x^4/4 - x^2/2 + 0.5*y^2, shifted so the saddle
// sits at the origin. Two symmetric minima at x = +-1, y = 0, and a saddle
// point at the origin that stresses optimizers differently.
const saddle: LossSurface = {
  id: "saddle",
  label: "Saddle + bowl",
  f: (x, y) => (x ** 4) / 4 - (x * x) / 2 + 0.5 * y * y,
  grad: (x, y) => [x ** 3 - x, y],
  domain: { xMin: -2.5, xMax: 2.5, yMin: -2, yMax: 2 },
  startDefault: { x: -0.15, y: 1.7 },
  minimum: { x: -1, y: 0 },
};

export const SURFACES: readonly LossSurface[] = [
  bowl,
  valley,
  rosenbrock,
  saddle,
];

export function getSurface(id: string): LossSurface {
  return SURFACES.find((surface) => surface.id === id) ?? SURFACES[0];
}

// ---------------------------------------------------------------------------
// Optimizers
// ---------------------------------------------------------------------------

export interface Hyperparams {
  lr: number;
  momentum: number;
}

/** Base state shared by every optimizer: current position, loss, step count. */
export interface OptimizerState {
  x: number;
  y: number;
  step: number;
  loss: number;
}

export interface SgdState extends OptimizerState {
  kind: "sgd";
}

export interface MomentumState extends OptimizerState {
  kind: "momentum";
  vx: number;
  vy: number;
}

export interface RmspropState extends OptimizerState {
  kind: "rmsprop";
  sx: number;
  sy: number;
}

export interface AdamState extends OptimizerState {
  kind: "adam";
  mx: number;
  my: number;
  sx: number;
  sy: number;
}

export type AnyOptimizerState =
  | SgdState
  | MomentumState
  | RmspropState
  | AdamState;

export const RMSPROP_DECAY = 0.99;
export const RMSPROP_EPS = 1e-8;
export const ADAM_BETA1 = 0.9;
export const ADAM_BETA2 = 0.999;
export const ADAM_EPS = 1e-8;

export function initSgdState(start: Point2D): SgdState {
  return { kind: "sgd", x: start.x, y: start.y, step: 0, loss: NaN };
}

export function initMomentumState(start: Point2D): MomentumState {
  return {
    kind: "momentum",
    x: start.x,
    y: start.y,
    step: 0,
    loss: NaN,
    vx: 0,
    vy: 0,
  };
}

export function initRmspropState(start: Point2D): RmspropState {
  return {
    kind: "rmsprop",
    x: start.x,
    y: start.y,
    step: 0,
    loss: NaN,
    sx: 0,
    sy: 0,
  };
}

export function initAdamState(start: Point2D): AdamState {
  return {
    kind: "adam",
    x: start.x,
    y: start.y,
    step: 0,
    loss: NaN,
    mx: 0,
    my: 0,
    sx: 0,
    sy: 0,
  };
}

/** Plain gradient descent: x -= lr * grad. */
export function stepSgd(
  state: SgdState,
  grad: [number, number],
  hyper: Hyperparams,
): SgdState {
  const [gx, gy] = grad;
  return {
    ...state,
    x: state.x - hyper.lr * gx,
    y: state.y - hyper.lr * gy,
    step: state.step + 1,
  };
}

/** SGD with classical momentum: v = beta*v + grad; x -= lr * v. */
export function stepMomentum(
  state: MomentumState,
  grad: [number, number],
  hyper: Hyperparams,
): MomentumState {
  const [gx, gy] = grad;
  const vx = hyper.momentum * state.vx + gx;
  const vy = hyper.momentum * state.vy + gy;
  return {
    ...state,
    vx,
    vy,
    x: state.x - hyper.lr * vx,
    y: state.y - hyper.lr * vy,
    step: state.step + 1,
  };
}

/** RMSProp: per-coordinate learning rate scaled by a running RMS of gradients. */
export function stepRmsprop(
  state: RmspropState,
  grad: [number, number],
  hyper: Hyperparams,
): RmspropState {
  const [gx, gy] = grad;
  const sx = RMSPROP_DECAY * state.sx + (1 - RMSPROP_DECAY) * gx * gx;
  const sy = RMSPROP_DECAY * state.sy + (1 - RMSPROP_DECAY) * gy * gy;
  return {
    ...state,
    sx,
    sy,
    x: state.x - (hyper.lr * gx) / (Math.sqrt(sx) + RMSPROP_EPS),
    y: state.y - (hyper.lr * gy) / (Math.sqrt(sy) + RMSPROP_EPS),
    step: state.step + 1,
  };
}

/** Adam: bias-corrected first and second moment estimates. */
export function stepAdam(
  state: AdamState,
  grad: [number, number],
  hyper: Hyperparams,
): AdamState {
  const [gx, gy] = grad;
  const t = state.step + 1;
  const mx = ADAM_BETA1 * state.mx + (1 - ADAM_BETA1) * gx;
  const my = ADAM_BETA1 * state.my + (1 - ADAM_BETA1) * gy;
  const sx = ADAM_BETA2 * state.sx + (1 - ADAM_BETA2) * gx * gx;
  const sy = ADAM_BETA2 * state.sy + (1 - ADAM_BETA2) * gy * gy;

  const mxHat = mx / (1 - Math.pow(ADAM_BETA1, t));
  const myHat = my / (1 - Math.pow(ADAM_BETA1, t));
  const sxHat = sx / (1 - Math.pow(ADAM_BETA2, t));
  const syHat = sy / (1 - Math.pow(ADAM_BETA2, t));

  return {
    ...state,
    mx,
    my,
    sx,
    sy,
    x: state.x - (hyper.lr * mxHat) / (Math.sqrt(sxHat) + ADAM_EPS),
    y: state.y - (hyper.lr * myHat) / (Math.sqrt(syHat) + ADAM_EPS),
    step: t,
  };
}

// ---------------------------------------------------------------------------
// Finite differences (used by tests to check analytic gradients)
// ---------------------------------------------------------------------------

export function centralDifferenceGrad(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h = 1e-5,
): [number, number] {
  const dfdx = (f(x + h, y) - f(x - h, y)) / (2 * h);
  const dfdy = (f(x, y + h) - f(x, y - h)) / (2 * h);
  return [dfdx, dfdy];
}

// ---------------------------------------------------------------------------
// Contour extraction (marching squares)
// ---------------------------------------------------------------------------

export interface ContourSegment {
  a: Point2D;
  b: Point2D;
}

export interface ContourLevel {
  level: number;
  segments: ContourSegment[];
}

/**
 * Marching squares contour extraction. Samples `f` once on a
 * (cols+1) x (rows+1) grid spanning `domain`, then for every requested
 * level walks each grid cell and linearly interpolates the edge crossings
 * into line segments. Pure and DOM-free so it can render an iso-loss
 * "topographic map" from a canvas render loop, or be unit tested directly.
 *
 * Segments within a level are unordered / disconnected (typical of a
 * cell-local marching squares pass) — draw each as its own line, the shared
 * endpoints reconstruct the full iso-line visually.
 */
export function marchingSquaresContours(
  f: (x: number, y: number) => number,
  domain: Domain,
  levels: number[],
  cols = 90,
  rows = 70,
): ContourLevel[] {
  const dx = (domain.xMax - domain.xMin) / cols;
  const dy = (domain.yMax - domain.yMin) / rows;

  const grid: number[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: number[] = [];
    for (let c = 0; c <= cols; c++) {
      row.push(f(domain.xMin + c * dx, domain.yMin + r * dy));
    }
    grid.push(row);
  }

  const pointAt = (c: number, r: number): Point2D => ({
    x: domain.xMin + c * dx,
    y: domain.yMin + r * dy,
  });

  const interp = (
    p1: Point2D,
    v1: number,
    p2: Point2D,
    v2: number,
    level: number,
  ): Point2D => {
    if (v1 === v2) return p1;
    const t = (level - v1) / (v2 - v1);
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  };

  return levels.map((level) => {
    const segments: ContourSegment[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v0 = grid[r][c]; // bottom-left
        const v1 = grid[r][c + 1]; // bottom-right
        const v2 = grid[r + 1][c + 1]; // top-right
        const v3 = grid[r + 1][c]; // top-left

        const idx =
          (v0 >= level ? 1 : 0) |
          (v1 >= level ? 2 : 0) |
          (v2 >= level ? 4 : 0) |
          (v3 >= level ? 8 : 0);
        if (idx === 0 || idx === 15) continue;

        const p0 = pointAt(c, r);
        const p1 = pointAt(c + 1, r);
        const p2 = pointAt(c + 1, r + 1);
        const p3 = pointAt(c, r + 1);

        const eBottom = () => interp(p0, v0, p1, v1, level);
        const eRight = () => interp(p1, v1, p2, v2, level);
        const eTop = () => interp(p3, v3, p2, v2, level);
        const eLeft = () => interp(p0, v0, p3, v3, level);

        const push = (a: Point2D, b: Point2D) => segments.push({ a, b });
        const center = (v0 + v1 + v2 + v3) / 4;

        switch (idx) {
          case 1:
            push(eLeft(), eBottom());
            break;
          case 2:
            push(eBottom(), eRight());
            break;
          case 3:
            push(eLeft(), eRight());
            break;
          case 4:
            push(eRight(), eTop());
            break;
          case 5: // ambiguous saddle — resolve by average corner value
            if (center >= level) {
              push(eLeft(), eTop());
              push(eBottom(), eRight());
            } else {
              push(eLeft(), eBottom());
              push(eRight(), eTop());
            }
            break;
          case 6:
            push(eBottom(), eTop());
            break;
          case 7:
            push(eLeft(), eTop());
            break;
          case 8:
            push(eTop(), eLeft());
            break;
          case 9:
            push(eBottom(), eTop());
            break;
          case 10: // ambiguous saddle — resolve by average corner value
            if (center >= level) {
              push(eLeft(), eBottom());
              push(eRight(), eTop());
            } else {
              push(eLeft(), eTop());
              push(eBottom(), eRight());
            }
            break;
          case 11:
            push(eRight(), eTop());
            break;
          case 12:
            push(eLeft(), eRight());
            break;
          case 13:
            push(eBottom(), eRight());
            break;
          case 14:
            push(eLeft(), eBottom());
            break;
          default:
            break;
        }
      }
    }

    return { level, segments };
  });
}
