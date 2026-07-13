export type KernelLabel = 0 | 1;

export interface KernelPoint {
  id: number;
  x: number;
  y: number;
  z: number;
  label: KernelLabel;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export type RadialFeatureVector = readonly [x: number, y: number, radialHeight: number];

export const MAX_RADIUS = 3.35;

const INNER_POINTS = [
  [0, 0], [0.7, 0.4], [-0.6, 0.5], [0.4, -0.7], [-0.5, -0.5],
  [0.9, -0.2], [-0.9, 0.1], [0.1, 0.9], [-0.2, -0.9],
] as const;

const INNER_MARGIN_HEIGHT = Math.max(...INNER_POINTS.map(([x, y]) => radialLift(x, y)));
const OUTER_MARGIN_HEIGHT = Math.min(...Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  const radius = 2.85 + 0.35 * Math.sin(angle * 3.1);
  return radialLift(radius, 0);
}));

/** Hard-margin separator halfway between the closest lifted samples. */
export const SEPARATING_HEIGHT = (INNER_MARGIN_HEIGHT + OUTER_MARGIN_HEIGHT) / 2;
export const BOUNDARY_RADIUS = MAX_RADIUS * Math.sqrt(SEPARATING_HEIGHT);
export const SVM_MARGIN_HEIGHTS = [INNER_MARGIN_HEIGHT, OUTER_MARGIN_HEIGHT] as const;

/** A deterministic core-and-ring dataset that cannot be separated by a line in 2D. */
export function buildConcentricDataset(): KernelPoint[] {
  const points: KernelPoint[] = INNER_POINTS.map(([x, y], id) => ({
    id,
    x,
    y,
    z: radialLift(x, y),
    label: 1,
  }));

  for (let index = 0; index < 14; index += 1) {
    const angle = (index / 14) * Math.PI * 2;
    const radius = 2.85 + 0.35 * Math.sin(angle * 3.1);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push({ id: 100 + index, x, y, z: radialLift(x, y), label: 0 });
  }

  return points;
}

/** Explicit feature map used for teaching: z = (distance / maximum distance)^2. */
export function radialLift(x: number, y: number): number {
  return (Math.hypot(x, y) / MAX_RADIUS) ** 2;
}

/** Explicit map drawn by the scene. The third coordinate is normalized radius squared. */
export function radialFeatureMap(x: number, y: number): RadialFeatureVector {
  return [x, y, radialLift(x, y)];
}

/** Dot product induced by the explicit map, evaluated without building a 3D scene. */
export function radialFeatureKernel(
  first: readonly [number, number],
  second: readonly [number, number],
): number {
  const a = radialFeatureMap(first[0], first[1]);
  const b = radialFeatureMap(second[0], second[1]);
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Pseudo-3D projection interpolated from a top-down view to a tilted view. */
export function projectPoint(x: number, y: number, z: number, lift: number): ScreenPoint {
  const amount = Math.max(0, Math.min(1, lift));
  // Keep the complete top-down dataset inside short viewport stages while the
  // lifted view still uses vertical compression to read as perspective.
  const scaleY = 62 * (1 - amount) + 38 * amount;
  const baseY = 232 * (1 - amount) + 322 * amount;
  const perspective = 1 + 0.16 * amount * (y / MAX_RADIUS);
  return {
    x: 360 + x * 74 * perspective,
    y: baseY + y * scaleY - z * 232 * amount,
  };
}

export function depthOrder(points: readonly KernelPoint[], lift: number): KernelPoint[] {
  return [...points].sort((a, b) =>
    projectPoint(a.x, a.y, a.z, lift).y - projectPoint(b.x, b.y, b.z, lift).y,
  );
}

export function splitByPlane(points: readonly KernelPoint[]) {
  return {
    below: points.filter((point) => point.z < SEPARATING_HEIGHT),
    above: points.filter((point) => point.z >= SEPARATING_HEIGHT),
  };
}

export const KERNEL_DISCLOSURE =
  "This exhibit draws the explicit map phi(x, y) = (x, y, (r / R)^2), with the third axis enlarged 4.2 times for legibility. A kernel can evaluate dot products from the unscaled map without drawing its coordinates. The horizontal separator is the midpoint between the nearest lifted samples in this authored radial example; the scene does not solve a general SVM.";
