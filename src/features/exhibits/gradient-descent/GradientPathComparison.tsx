import { vizTokens } from "@/lib/vizTokens";
import {
  DOMAIN,
  contourPoints,
  fromPrincipalCoordinates,
  principalCoordinates,
  type DescentState,
  type PathAssessment,
  type Point,
} from "./model";

const WIDTH = 300;
const HEIGHT = 184;
const PLOT = { left: 14, right: 14, top: 28, bottom: 34 } as const;

function inDomain(point: Point) {
  return point.x >= DOMAIN.xMin && point.x <= DOMAIN.xMax && point.y >= DOMAIN.yMin && point.y <= DOMAIN.yMax;
}

function visiblePath(path: readonly DescentState[]) {
  const visible: DescentState[] = [];
  for (const point of path) {
    if (!inDomain(point)) break;
    visible.push(point);
  }
  return visible;
}

function sx(x: number) {
  return PLOT.left + (x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin) * (WIDTH - PLOT.left - PLOT.right);
}

function sy(y: number) {
  return PLOT.top + (DOMAIN.yMax - y) / (DOMAIN.yMax - DOMAIN.yMin) * (HEIGHT - PLOT.top - PLOT.bottom);
}

function points(path: readonly Point[]) {
  return path.map((point) => `${sx(point.x).toFixed(1)},${sy(point.y).toFixed(1)}`).join(" ");
}

function floorPoints() {
  return Array.from({ length: 81 }, (_, index) => {
    const u = -6.8 + index / 80 * 13.6;
    return fromPrincipalCoordinates({ x: u, y: 0 });
  }).filter(inDomain);
}

function crossingPoints(path: readonly DescentState[]) {
  const result: Point[] = [];
  for (let index = 1; index < path.length; index += 1) {
    const before = path[index - 1];
    const after = path[index];
    if (!inDomain(before) || !inDomain(after)) break;
    const beforeV = principalCoordinates(before).y;
    const afterV = principalCoordinates(after).y;
    if (beforeV * afterV >= 0) continue;
    const amount = beforeV / (beforeV - afterV);
    result.push({
      x: before.x + (after.x - before.x) * amount,
      y: before.y + (after.y - before.y) * amount,
    });
  }
  return result;
}

function changeLabel(assessment: PathAssessment) {
  const amount = Math.abs(assessment.relativeLossDelta * 100).toFixed(0);
  return `${assessment.behaviour} · ${amount}% ${assessment.relativeLossDelta > 0 ? "higher" : "lower"}`;
}

export function GradientPathComparison({
  currentPath,
  referencePath,
  currentRate,
  referenceRate,
  currentAssessment,
  referenceAssessment,
}: {
  currentPath: readonly DescentState[];
  referencePath: readonly DescentState[];
  currentRate: number;
  referenceRate: number;
  currentAssessment: PathAssessment;
  referenceAssessment: PathAssessment;
}) {
  const current = visiblePath(currentPath);
  const reference = visiblePath(referencePath);
  const crossings = crossingPoints(currentPath);
  const start = current[0];

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 hidden w-[300px] border border-outline-dark bg-surface/95 shadow-none backdrop-blur-sm lg:block" aria-hidden="true">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-auto w-full">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        <text x="14" y="17" fontFamily="var(--font-mono)" fontSize="8" fill={vizTokens.mutedInk}>TOP VIEW · SAME START · SAME SURFACE</text>
        {[0.35, 0.9, 1.8, 3.2, 5].map((level, index) => (
          <polyline key={level} points={points(contourPoints("valley", level, 80))} fill="none" stroke={index === 0 ? vizTokens.classA : vizTokens.grid} strokeWidth={index === 0 ? 1.5 : 1} opacity="0.78" />
        ))}
        <polyline points={points(floorPoints())} fill="none" stroke={vizTokens.axis} strokeDasharray="3 3" strokeWidth="1.2" opacity="0.72" />
        <polyline points={points(reference)} fill="none" stroke={vizTokens.classA} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={points(current)} fill="none" stroke={vizTokens.target} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {crossings.slice(0, 8).map((point, index) => <circle key={index} cx={sx(point.x)} cy={sy(point.y)} r="3" fill={vizTokens.canvas} stroke={vizTokens.target} strokeWidth="1.5" />)}
        {start ? <circle cx={sx(start.x)} cy={sy(start.y)} r="4.5" fill={vizTokens.ink} stroke={vizTokens.canvas} strokeWidth="1.5" /> : null}
        <g transform={`translate(14 ${HEIGHT - 22})`} fontFamily="var(--font-mono)" fontSize="7.5">
          <line x1="0" y1="-2" x2="14" y2="-2" stroke={vizTokens.classA} strokeWidth="3" />
          <text x="19" fill={vizTokens.classA}>REFERENCE {referenceRate.toFixed(2)} · {changeLabel(referenceAssessment)}</text>
          <line x1="153" y1="-2" x2="167" y2="-2" stroke={vizTokens.target} strokeWidth="3" />
          <text x="172" fill={vizTokens.target}>CURRENT {currentRate.toFixed(2)}</text>
        </g>
        <text x={WIDTH - 14} y={HEIGHT - 7} textAnchor="end" fontFamily="var(--font-mono)" fontSize="7.5" fill={vizTokens.target}>{changeLabel(currentAssessment)} · {currentAssessment.crossings} crossings</text>
      </svg>
    </div>
  );
}
