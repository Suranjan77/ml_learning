"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { vizTokens } from "@/lib/vizTokens";
import {
  DEFAULT_START,
  DOMAIN,
  assessPath,
  contourPoints,
  descentPath,
  fromPrincipalCoordinates,
  largestReducingRate,
  principalCoordinates,
  type DescentState,
  type Point,
} from "@/features/exhibits/gradient-descent/model";

const WIDTH = 720;
const HEIGHT = 280;
const PLOT = { left: 26, right: 26, top: 22, bottom: 26 } as const;
const REFERENCE_RATE = 0.4;

function pointInDomain(point: Point) {
  return point.x >= DOMAIN.xMin && point.x <= DOMAIN.xMax && point.y >= DOMAIN.yMin && point.y <= DOMAIN.yMax;
}

function visiblePath(path: DescentState[]) {
  const result: DescentState[] = [];
  for (const point of path) {
    if (!pointInDomain(point)) break;
    result.push(point);
  }
  return result;
}

function screenPoint(point: Point): [number, number] {
  const width = WIDTH - PLOT.left - PLOT.right;
  const height = HEIGHT - PLOT.top - PLOT.bottom;
  return [
    PLOT.left + (point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin) * width,
    PLOT.top + (DOMAIN.yMax - point.y) / (DOMAIN.yMax - DOMAIN.yMin) * height,
  ];
}

function pointsAttribute(points: readonly Point[]) {
  // Stable strings prevent Node and browser Math implementations from
  // serialising the same contour a final binary digit apart at hydration.
  return points.map((point) => screenPoint(point).map((value) => value.toFixed(3)).join(",")).join(" ");
}

function valleyFloor() {
  return Array.from({ length: 100 }, (_, index) => fromPrincipalCoordinates({ x: -7 + index / 99 * 14, y: 0 }))
    .filter(pointInDomain);
}

function crossingPoints(path: readonly DescentState[]) {
  const crossings: Point[] = [];
  for (let index = 1; index < path.length; index += 1) {
    const before = path[index - 1];
    const after = path[index];
    if (!pointInDomain(before) || !pointInDomain(after)) break;
    const beforeV = principalCoordinates(before).y;
    const afterV = principalCoordinates(after).y;
    if (beforeV * afterV >= 0) continue;
    const amount = beforeV / (beforeV - afterV);
    crossings.push({ x: before.x + (after.x - before.x) * amount, y: before.y + (after.y - before.y) * amount });
  }
  return crossings;
}

export function GradientDescentProof() {
  const [learningRate, setLearningRate] = useState(0.52);
  const [hasInteracted, setHasInteracted] = useState(false);
  const currentPath = useMemo(() => descentPath(DEFAULT_START, learningRate, "valley"), [learningRate]);
  const referencePath = useMemo(() => descentPath(DEFAULT_START, REFERENCE_RATE, "valley"), []);
  const assessment = useMemo(() => assessPath(currentPath, "valley"), [currentPath]);
  const currentVisible = visiblePath(currentPath);
  const referenceVisible = visiblePath(referencePath);
  const lossChange = Math.abs(assessment.relativeLossDelta * 100);
  const regime = assessment.behaviour;
  const regimeClass = regime === "diverging" ? "text-error" : regime === "oscillating" ? "text-warning" : "text-primary";
  const endPoint = screenPoint(currentVisible.at(-1) ?? DEFAULT_START);
  const crossings = crossingPoints(currentPath);
  const boundary = useMemo(() => largestReducingRate(DEFAULT_START, "valley") ?? 1.04, []);
  const statusTitle = regime === "diverging"
    ? "You found the instability boundary."
    : regime === "oscillating"
      ? "Watch the valley floor."
      : hasInteracted
        ? "Still descending cleanly."
        : "Try moving the rate slowly to the right."
  const statusDetail = regime === "diverging"
    ? `${learningRate.toFixed(2)} finishes ${lossChange.toFixed(0)}% higher after 14 steps; ${boundary.toFixed(2)} is the last reducing slider value.`
    : regime === "oscillating"
      ? `${learningRate.toFixed(2)} crosses the floor ${assessment.crossings} times and still finishes ${lossChange.toFixed(0)}% lower.`
      : `The green path stays at ${REFERENCE_RATE.toFixed(2)}. The rust path currently finishes ${lossChange.toFixed(0)}% lower.`;

  return (
    <section data-testid="homepage-gradient-proof" className="border-b border-outline bg-background px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-content gap-6 lg:grid-cols-[minmax(20rem,0.72fr)_minmax(34rem,1.08fr)] lg:items-center lg:gap-10">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-label text-primary">Interactive machine-learning laboratory</p>
          <h1 className="mt-3 text-balance font-headline text-[2rem] font-medium leading-[1.05] text-on-surface sm:text-[2.65rem] lg:text-[3rem]">
            Does taking a bigger step always get you to the bottom faster?
          </h1>
          <p className="mt-3 max-w-lg text-pretty text-[14px] leading-6 text-on-surface-variant sm:text-[15px] sm:leading-6">
            The green path stays fixed. Move the learning rate and make the rust path cross, recover, or fail on the same computed loss surface.
          </p>
          <Link href="/visualisations/gradient-descent?step=2" className="mt-3 inline-flex min-h-10 items-center gap-2 border border-accent bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover">
            Explore why <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="overflow-hidden border border-outline-dark bg-surface">
          <div
            data-testid="homepage-gradient-chart"
            role="img"
            aria-label={`Top-down narrow loss valley. A kept path at learning rate ${REFERENCE_RATE.toFixed(2)} converges. The current path at ${learningRate.toFixed(2)} is ${regime}.`}
            className="h-[170px] overflow-hidden sm:h-[210px] lg:h-[230px]"
          >
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
              <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
              <g opacity="0.72">
                {[0.35, 0.9, 1.8, 3.2, 5].map((level, index) => (
                  <polyline
                    key={level}
                    points={pointsAttribute(contourPoints("valley", level, 140))}
                    fill="none"
                    stroke={index === 0 ? vizTokens.classA : vizTokens.border}
                    strokeWidth={index === 0 ? 2.5 : 1.2}
                  />
                ))}
              </g>
              <line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={HEIGHT / 2} y2={HEIGHT / 2} stroke={vizTokens.grid} />
              <polyline points={pointsAttribute(valleyFloor())} fill="none" stroke={vizTokens.axis} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.65" />
              <polyline points={pointsAttribute(referenceVisible)} fill="none" stroke={vizTokens.classA} strokeWidth="3.5" opacity="0.78" />
              <polyline points={pointsAttribute(currentVisible)} fill="none" stroke={vizTokens.selection} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
              {currentVisible.map((point) => {
                const [x, y] = screenPoint(point);
                return <circle key={point.iteration} cx={x} cy={y} r={point.iteration === currentVisible.length - 1 ? 8 : 3.5} fill={vizTokens.selection} />;
              })}
              {crossings.map((point, index) => {
                const [x, y] = screenPoint(point);
                return <circle key={`cross-${index}`} cx={x} cy={y} r="6" fill={vizTokens.canvas} stroke={vizTokens.selection} strokeWidth="2" />;
              })}
              <circle cx={screenPoint({ x: 0, y: 0 })[0]} cy={screenPoint({ x: 0, y: 0 })[1]} r="7" fill={vizTokens.classA} />
              <text x={screenPoint(referenceVisible[4] ?? DEFAULT_START)[0] + 8} y={screenPoint(referenceVisible[4] ?? DEFAULT_START)[1] - 8} fill={vizTokens.classA} fontFamily="var(--font-dm-mono)" fontSize="10">STABLE REFERENCE 0.40</text>
              <text x={Math.min(WIDTH - 130, endPoint[0] + 10)} y={Math.max(24, endPoint[1] - 10)} fill={vizTokens.selection} fontFamily="var(--font-dm-mono)" fontSize="10">CURRENT {learningRate.toFixed(2)}</text>
            </svg>
          </div>

          <div className="grid gap-3 border-t border-outline p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(15rem,1fr)] sm:items-end sm:gap-5">
            <label className="min-w-0">
              <span className="mb-1 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-label text-on-surface-variant">
                <span>Learning rate</span>
                <span className={regimeClass}>{learningRate.toFixed(2)} · {regime}</span>
              </span>
              <input aria-label="Homepage learning rate" type="range" min="0.2" max="1.1" step="0.02" value={learningRate} onChange={(event) => { setLearningRate(Number(event.target.value)); setHasInteracted(true); }} className="block min-h-9" />
            </label>
            <div className="border-l-2 border-current pl-3" aria-live="polite">
              <p className={`font-headline text-sm font-medium ${regimeClass}`}>{statusTitle}</p>
              <p className="mt-0.5 text-xs leading-4 text-on-surface-variant">{statusDetail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
