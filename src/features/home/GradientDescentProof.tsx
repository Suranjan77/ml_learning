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
  type DescentState,
  type Point,
} from "@/features/exhibits/gradient-descent/model";

const WIDTH = 1_200;
const HEIGHT = 640;
const PLOT = { left: 440, right: 34, top: 28, bottom: 42 } as const;
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
  return points.map((point) => screenPoint(point).join(",")).join(" ");
}

export function GradientDescentProof() {
  const [learningRate, setLearningRate] = useState(0.9);
  const currentPath = useMemo(() => descentPath(DEFAULT_START, learningRate, "valley"), [learningRate]);
  const referencePath = useMemo(() => descentPath(DEFAULT_START, REFERENCE_RATE, "valley"), []);
  const assessment = useMemo(() => assessPath(currentPath, "valley"), [currentPath]);
  const currentVisible = visiblePath(currentPath);
  const referenceVisible = visiblePath(referencePath);
  const end = currentPath.at(-1)!;
  const lossChange = Math.abs(assessment.relativeLossDelta * 100);
  const regime = assessment.behaviour;
  const regimeClass = regime === "diverging" ? "text-error" : regime === "oscillating" ? "text-warning" : "text-primary";
  const endPoint = screenPoint(currentVisible.at(-1) ?? DEFAULT_START);

  return (
    <section className="relative h-[calc(100svh-6rem)] min-h-[620px] max-h-[780px] overflow-hidden border-b border-outline bg-background">
      <div role="img" aria-label={`Top-down narrow loss valley. A kept path at learning rate ${REFERENCE_RATE.toFixed(2)} converges. The current path at ${learningRate.toFixed(2)} is ${regime}.`} className="absolute inset-0">
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
          <polyline points={pointsAttribute(referenceVisible)} fill="none" stroke={vizTokens.mutedInk} strokeWidth="3" strokeDasharray="5 6" opacity="0.5" />
          <polyline points={pointsAttribute(currentVisible)} fill="none" stroke={vizTokens.selection} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          {currentVisible.map((point) => {
            const [x, y] = screenPoint(point);
            return <circle key={point.iteration} cx={x} cy={y} r={point.iteration === currentVisible.length - 1 ? 8 : 3.5} fill={vizTokens.selection} />;
          })}
          <circle cx={screenPoint({ x: 0, y: 0 })[0]} cy={screenPoint({ x: 0, y: 0 })[1]} r="7" fill={vizTokens.classA} />
          <text x={screenPoint(referenceVisible[4] ?? DEFAULT_START)[0] + 8} y={screenPoint(referenceVisible[4] ?? DEFAULT_START)[1] - 8} fill={vizTokens.mutedInk} fontFamily="var(--font-dm-mono)" fontSize="10">KEPT 0.40</text>
          <text x={Math.min(WIDTH - 130, endPoint[0] + 10)} y={Math.max(24, endPoint[1] - 10)} fill={vizTokens.selection} fontFamily="var(--font-dm-mono)" fontSize="10">CURRENT {learningRate.toFixed(2)}</text>
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-content flex-col px-4 pb-5 pt-10 sm:px-6 sm:pb-7 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-label text-primary">A public laboratory of visual arguments</p>
          <h1 className="mt-4 text-balance font-headline text-[2.7rem] font-medium leading-[1.02] text-on-surface sm:text-6xl lg:text-[4.25rem]">
            Machine learning visualisations
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-on-surface-variant sm:text-lg">
            Manipulate a meaningful variable, inspect the causal consequence, and see where a simple intuition stops working.
          </p>
          <Link href="/visualisations/gradient-descent?step=2" className="mt-6 inline-flex min-h-11 items-center gap-2 border border-accent bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover">
            Open the full experiment <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-auto grid max-w-3xl gap-3 border-t border-outline-dark pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
          <label className="min-w-0">
            <span className="mb-1 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-label text-on-surface-variant">
              <span>Learning rate</span>
              <span className={regimeClass}>{learningRate.toFixed(2)} · {regime}</span>
            </span>
            <input aria-label="Homepage learning rate" type="range" min="0.2" max="1.1" step="0.02" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value))} className="block min-h-10" />
          </label>
          <p className={`max-w-xs font-mono text-[10px] uppercase leading-5 ${regimeClass}`} aria-live="polite">
            After 14 steps, loss is {lossChange.toFixed(0)}% {regime === "diverging" ? "higher" : "lower"}
          </p>
        </div>
      </div>
    </section>
  );
}
