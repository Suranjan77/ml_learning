"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
const RATE_PRESETS = [
  { rate: 0.4, shortLabel: "Converge", label: "Use converging learning rate 0.40" },
  { rate: 0.9, shortLabel: "Oscillate", label: "Use oscillating learning rate 0.90" },
  { rate: 1.06, shortLabel: "Diverge", label: "Use diverging learning rate 1.06" },
] as const;
const HERO_COLOURS = {
  canvas: "#1E1B16",
  grid: "#3E3931",
  contour: "#8D8374",
  contourStrong: "#CAD4BF",
  reference: "#CAD4BF",
  selection: "#D16B4B",
  ink: "#F5F2EC",
  mutedInk: "#BEB6A5",
} as const;

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

// A diverging path leaves the plotted domain after one update. Without this the
// chart shows a lone dot while the result sentence claims divergence, so the
// path is extended to the exact boundary crossing and capped with an arrow.
function domainExit(inside: Point, outside: Point): Point {
  const dx = outside.x - inside.x;
  const dy = outside.y - inside.y;
  let amount = 1;
  if (dx > 0) amount = Math.min(amount, (DOMAIN.xMax - inside.x) / dx);
  if (dx < 0) amount = Math.min(amount, (DOMAIN.xMin - inside.x) / dx);
  if (dy > 0) amount = Math.min(amount, (DOMAIN.yMax - inside.y) / dy);
  if (dy < 0) amount = Math.min(amount, (DOMAIN.yMin - inside.y) / dy);
  return { x: inside.x + dx * amount, y: inside.y + dy * amount };
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
  const [isReady, setIsReady] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const updateRate = () => {
      setLearningRate(Number(slider.value));
      setHasInteracted(true);
    };
    slider.addEventListener("input", updateRate);
    setIsReady(true);
    return () => slider.removeEventListener("input", updateRate);
  }, []);
  const currentPath = useMemo(() => descentPath(DEFAULT_START, learningRate, "valley"), [learningRate]);
  const referencePath = useMemo(() => descentPath(DEFAULT_START, REFERENCE_RATE, "valley"), []);
  const assessment = useMemo(() => assessPath(currentPath, "valley"), [currentPath]);
  const currentVisible = visiblePath(currentPath);
  const referenceVisible = visiblePath(referencePath);
  const lossChange = Math.abs(assessment.relativeLossDelta * 100);
  const lossChangePercent = assessment.relativeLossDelta < 0 && lossChange > 99.9
    ? "more than 99.9%"
    : `${lossChange.toFixed(0)}%`;
  const regime = assessment.behaviour;
  const regimeClass = regime === "diverging" ? "text-[#D99386]" : regime === "oscillating" ? "text-[#E0C37A]" : "text-inverse-primary";
  const crossings = crossingPoints(currentPath);
  const boundary = useMemo(() => largestReducingRate(DEFAULT_START, "valley") ?? 1.04, []);
  const leavesDomain = currentVisible.length > 0 && currentVisible.length < currentPath.length;
  const exit = leavesDomain
    ? domainExit(currentVisible[currentVisible.length - 1], currentPath[currentVisible.length])
    : null;
  const drawnCurrent: Point[] = exit ? [...currentVisible, exit] : currentVisible;
  const endPoint = screenPoint(drawnCurrent.at(-1) ?? DEFAULT_START);
  const statusDetail = regime === "diverging"
    ? `${learningRate.toFixed(2)} finishes ${lossChangePercent} above its starting loss after 14 steps; ${boundary.toFixed(2)} is the highest tested rate that still finishes below its start.`
    : regime === "oscillating"
      ? `${learningRate.toFixed(2)} crosses the valley floor ${assessment.crossings} times and finishes ${lossChangePercent} below its starting loss.`
      : `The green reference stays at ${REFERENCE_RATE.toFixed(2)}. After 14 steps, the rust path finishes ${lossChangePercent} below its starting loss.`;
  const resultSentence = regime === "diverging"
    ? `From the same start on the same surface, ${REFERENCE_RATE.toFixed(2)} lowers loss; at ${learningRate.toFixed(2)}, loss finishes ${lossChangePercent} above its starting value after 14 steps.`
    : regime === "oscillating"
      ? `At ${learningRate.toFixed(2)}, the path crosses the valley floor ${assessment.crossings} times and still finishes below its starting loss.`
      : `At ${learningRate.toFixed(2)}, the path converges and finishes ${lossChangePercent} below its starting loss after 14 steps.`;
  // The computed result stays inside the hero so the slider and the sentence it
  // changes never separate across a fold. See docs/ux-improvement-plan.md.
  const resultRailClass = regime === "diverging"
    ? "border-accent-hover bg-accent text-on-accent"
    : regime === "oscillating"
      ? "border-[#B99A52] bg-[#D7BA70] text-[#1E1B16]"
      : "border-primary bg-primary text-on-primary";

  return (
    <section
      data-testid="homepage-gradient-proof"
      className="home-proof relative flex min-h-[calc(100svh-var(--layout-header-height))] flex-col overflow-hidden border-b border-background/20 bg-on-surface px-4 py-2 text-background sm:px-6 sm:py-5 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-y-0 left-[calc(50%-42.5rem)] hidden w-px bg-background/15 xl:block" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-[calc(50%-42.5rem)] hidden w-px bg-background/15 xl:block" aria-hidden="true" />

      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden="true">
        <g transform="translate(540 120) scale(1.2 1.8)" fill="none" opacity="0.13">
          {[0.35, 0.9, 1.8, 3.2, 5].map((level) => (
            <polyline key={level} points={pointsAttribute(contourPoints("valley", level, 140))} stroke={HERO_COLOURS.contour} strokeWidth="1.2" />
          ))}
          <polyline
            key={`ghost-${learningRate.toFixed(2)}`}
            className="home-proof-ghost-path"
            pathLength="1"
            points={pointsAttribute(drawnCurrent)}
            stroke={HERO_COLOURS.selection}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div className="relative z-10 mx-auto flex w-full max-w-content flex-1 flex-col">
        <div className="mb-2.5 flex items-center justify-between gap-4 border-y border-background/20 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-background/70 sm:mb-4 sm:text-[10px]">
          <span>Gradient descent · controlled comparison</span>
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="h-1.5 w-1.5 bg-inverse-primary" aria-hidden="true" />
            Computed live in your browser
          </span>
          <span className="sm:hidden">Live model</span>
        </div>

        <div className="grid flex-1 content-center gap-4 lg:grid-cols-[minmax(19rem,0.74fr)_minmax(34rem,1.26fr)] lg:items-center lg:gap-8 xl:gap-12">
          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-inverse-primary sm:text-[11px]">
              Same update rule · different step size
            </p>
            <h1 className="home-proof-heading mt-2.5 max-w-2xl text-balance font-headline text-[clamp(2rem,4.2vw,4.25rem)] font-medium leading-[0.96] tracking-[-0.04em] text-background sm:mt-3">
              Does taking a bigger step always get you to the bottom faster?
            </h1>
            <p className="mt-2.5 max-w-xl text-pretty text-[14px] leading-6 text-background/70 sm:mt-3 sm:text-[15px] lg:mt-4 lg:text-base lg:leading-7">
              Keep the start and loss surface fixed. Raise the learning rate. The resulting path converges, oscillates across the valley, then diverges.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-4">
              <Link
                href="/visualisations/gradient-descent?step=2"
                className="group inline-flex min-h-11 items-center gap-3 border border-accent bg-accent px-4 text-sm font-medium text-on-accent hover:border-background hover:bg-background hover:text-on-surface"
              >
                Open Gradient Descent
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-background/70 sm:inline">
                Start fixed · surface fixed · 14 steps
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden border-x border-background/20 bg-on-surface lg:-ml-6 lg:border-x-0">
            <div className="flex min-h-11 items-stretch border-y border-background/25 font-mono text-[8px] uppercase tracking-[0.08em] text-background/85 sm:text-[9px]">
              <span className="hidden items-center px-4 sm:flex">Narrow loss valley · top view</span>
              <span className="ml-auto hidden items-center gap-2 px-4 lg:inline-flex">
                <span className={`h-2 w-2 ${regime === "diverging" ? "bg-[#D99386]" : regime === "oscillating" ? "bg-[#E0C37A]" : "bg-inverse-primary"}`} aria-hidden="true" />
                Current path: {regime}
              </span>
              <div className="grid min-w-0 flex-1 grid-cols-3 border-background/25 sm:flex-none sm:border-l">
                {RATE_PRESETS.map((preset) => (
                  <button
                    key={preset.rate}
                    type="button"
                    disabled={!isReady}
                    aria-label={preset.label}
                    aria-pressed={Math.abs(learningRate - preset.rate) < 0.001}
                    onClick={() => { setLearningRate(preset.rate); setHasInteracted(true); }}
                    className={`min-h-11 min-w-0 border-r border-background/20 px-2 last:border-r-0 sm:px-3 ${Math.abs(learningRate - preset.rate) < 0.001 ? "bg-accent text-on-accent" : "text-background/85 hover:bg-background/10 hover:text-background"}`}
                  >
                    {preset.shortLabel} <span className="text-current/75">{preset.rate.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              data-testid="homepage-gradient-chart"
              role="img"
              aria-label={`Top-down narrow loss valley. A kept path at learning rate ${REFERENCE_RATE.toFixed(2)} converges. The current path at ${learningRate.toFixed(2)} is ${regime}.`}
              className="home-proof-chart h-[160px] overflow-hidden min-[460px]:h-[188px] sm:h-[230px] lg:h-[260px]"
            >
              <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
              <rect width={WIDTH} height={HEIGHT} fill={HERO_COLOURS.canvas} />
              <g opacity="0.76">
                {[0.35, 0.9, 1.8, 3.2, 5].map((level, index) => (
                  <polyline
                    key={level}
                    points={pointsAttribute(contourPoints("valley", level, 140))}
                    fill="none"
                    stroke={index === 0 ? HERO_COLOURS.contourStrong : HERO_COLOURS.contour}
                    strokeWidth={index === 0 ? 2.5 : 1.2}
                  />
                ))}
              </g>
              <g opacity="0.55" stroke={HERO_COLOURS.grid}>
                <line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={HEIGHT / 2} y2={HEIGHT / 2} />
                <line x1={WIDTH / 2} x2={WIDTH / 2} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} strokeDasharray="2 6" />
              </g>
              <polyline points={pointsAttribute(valleyFloor())} fill="none" stroke={HERO_COLOURS.mutedInk} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.5" />
              <polyline points={pointsAttribute(referenceVisible)} fill="none" stroke={HERO_COLOURS.reference} strokeWidth="3.5" opacity="0.82" />
              <polyline
                key={`current-path-${learningRate.toFixed(2)}`}
                className="home-proof-current-path"
                pathLength="1"
                points={pointsAttribute(drawnCurrent)}
                fill="none"
                stroke={HERO_COLOURS.selection}
                strokeWidth="5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {currentVisible.map((point) => {
                const [x, y] = screenPoint(point);
                return <circle key={point.iteration} cx={x} cy={y} r={point.iteration === currentVisible.length - 1 ? 8 : 3.5} fill={HERO_COLOURS.selection} />;
              })}
              {exit ? (() => {
                const [x, y] = screenPoint(exit);
                const [px, py] = screenPoint(currentVisible[currentVisible.length - 1]);
                const angle = Math.atan2(y - py, x - px) * 180 / Math.PI;
                return (
                  <polygon
                    points="0,-7 15,0 0,7"
                    fill={HERO_COLOURS.selection}
                    transform={`translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${angle.toFixed(3)})`}
                  />
                );
              })() : null}
              {crossings.map((point, index) => {
                const [x, y] = screenPoint(point);
                return <circle key={`cross-${index}`} cx={x} cy={y} r="6" fill={HERO_COLOURS.canvas} stroke={HERO_COLOURS.selection} strokeWidth="2" />;
              })}
              <circle cx={screenPoint({ x: 0, y: 0 })[0]} cy={screenPoint({ x: 0, y: 0 })[1]} r="7" fill={HERO_COLOURS.reference} />
              <text x={screenPoint(referenceVisible[4] ?? DEFAULT_START)[0] + 8} y={screenPoint(referenceVisible[4] ?? DEFAULT_START)[1] - 8} fill={HERO_COLOURS.reference} fontFamily="var(--font-dm-mono)" fontSize="10">KEPT 0.40</text>
              <text x={Math.min(WIDTH - 130, endPoint[0] + 10)} y={Math.max(24, endPoint[1] - 10)} fill={HERO_COLOURS.selection} fontFamily="var(--font-dm-mono)" fontSize="10">CURRENT {learningRate.toFixed(2)}</text>
              <text x="38" y="257" fill={HERO_COLOURS.mutedInk} fontFamily="var(--font-dm-mono)" fontSize="9">LOSS CONTOURS</text>
              <text x="682" y="257" textAnchor="end" fill={HERO_COLOURS.mutedInk} fontFamily="var(--font-dm-mono)" fontSize="9">14 UPDATES</text>
              <text x="682" y="72" textAnchor="end" fill={HERO_COLOURS.ink} fontFamily="var(--font-shippori)" fontSize="46" opacity="0.055">{regime.toUpperCase()}</text>
              </svg>
            </div>

            <label className="block border-y border-background/25 px-3 py-2.5 sm:px-4">
              <span className="mb-1 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background/70 sm:text-[10px]">
                <span>Change learning rate</span>
                <span className={regimeClass}>{learningRate.toFixed(2)} · {regime}</span>
              </span>
              <input
                ref={sliderRef}
                aria-label="Homepage learning rate"
                type="range"
                disabled={!isReady}
                min="0.2"
                max="1.1"
                step="0.02"
                value={learningRate}
                onChange={(event) => { setLearningRate(Number(event.currentTarget.value)); setHasInteracted(true); }}
                className="hero-rate-slider block min-h-9"
              />
              <span className="mt-0.5 flex justify-between font-mono text-[8px] text-background/70" aria-hidden="true">
                <span>0.20</span><span>kept 0.40</span><span>1.10</span>
              </span>
            </label>

            <div
              data-testid="homepage-gradient-result"
              aria-live="polite"
              className={`grid gap-2.5 border p-3 transition-colors duration-300 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-5 sm:p-4 ${resultRailClass}`}
            >
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] opacity-70 sm:text-[10px]">
                  Computed live result · {regime}
                </p>
                <h2 id="computed-result-heading" className="mt-1.5 text-balance font-headline text-[15px] font-medium leading-[1.28] sm:text-lg lg:text-xl">
                  {resultSentence}
                </h2>
                <p className="mt-1.5 hidden text-[11px] leading-4 opacity-80 xl:block">{statusDetail}</p>
              </div>
              <button
                type="button"
                disabled={!isReady}
                onClick={() => {
                  setLearningRate(regime === "diverging" ? REFERENCE_RATE : 1.06);
                  setHasInteracted(true);
                }}
                className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-3 border border-current px-4 text-sm font-medium transition-colors hover:bg-on-surface hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                {regime === "diverging" ? "Restore 0.40" : "Reveal the reversal"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
