export interface Point { x: number; y: number }

export const POINTS: readonly Point[] = Object.freeze(Array.from({ length: 30 }, (_, index) => {
  const along = -4.4 + index * (8.8 / 29);
  const across = Math.sin(index * 2.17) * 0.62 + Math.cos(index * 0.73) * 0.22;
  const angle = Math.PI / 5;
  return {
    x: along * Math.cos(angle) - across * Math.sin(angle) + 0.35,
    y: along * Math.sin(angle) + across * Math.cos(angle) - 0.2,
  };
}));

export function mean(points: readonly Point[]): Point {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

export function axisFromAngle(angle: number): Point {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/** PCA axes are undirected: angles separated by 180 degrees are equivalent. */
export function normalizeAxisAngle(angle: number) {
  const halfTurn = Math.PI;
  const quarterTurn = Math.PI / 2;
  let normalized = angle;
  while (normalized > quarterTurn) normalized -= halfTurn;
  while (normalized < -quarterTurn) normalized += halfTurn;
  return normalized;
}

export function project(point: Point, centre: Point, angle: number) {
  const axis = axisFromAngle(angle);
  const score = (point.x - centre.x) * axis.x + (point.y - centre.y) * axis.y;
  return { score, point: { x: centre.x + score * axis.x, y: centre.y + score * axis.y } };
}

export function projectionStats(points: readonly Point[], angle: number) {
  const centre = mean(points);
  const projections = points.map((point) => project(point, centre, angle));
  const variance = projections.reduce((sum, item) => sum + item.score ** 2, 0) / points.length;
  const reconstructionError = points.reduce((sum, point, index) => {
    const projected = projections[index].point;
    return sum + (point.x - projected.x) ** 2 + (point.y - projected.y) ** 2;
  }, 0) / points.length;
  return { centre, projections, variance, reconstructionError };
}

export function principalAngle(points: readonly Point[]) {
  const centre = mean(points);
  let xx = 0; let yy = 0; let xy = 0;
  points.forEach((point) => {
    const x = point.x - centre.x; const y = point.y - centre.y;
    xx += x * x; yy += y * y; xy += x * y;
  });
  return 0.5 * Math.atan2(2 * xy, xx - yy);
}
