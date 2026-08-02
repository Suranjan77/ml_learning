"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { vizTokens } from "@/lib/vizTokens";
import type { ExhibitSceneProps } from "../types";
import {
  COLLAPSE_PARAMETERS,
  DEFAULT_PARAMETERS,
  DOMAIN,
  EXPLORATION_PARAMETERS,
  clampToDomain,
  evolveSwarm,
  initialSwarm,
  iterationsSinceImprovement,
  objective,
  particleForces,
  stepSwarm,
  swarmSpread,
  type Point,
  type SwarmParameters,
  type SwarmState,
} from "./model";

const WIDTH = 1180;
const HEIGHT = 520;
const PLOT = { left: 38, top: 28, width: 760, height: 454 } as const;
const PANEL = { left: 824, top: 28, width: 330, height: 454 } as const;
const MAX_ITERATIONS = 60;
const STAGNATION_THRESHOLD = 6;
const CONTOUR_LEVELS = [4, 9, 16, 25, 38, 54, 72] as const;
const FORCE_LABELS = {
  inertia: "Momentum",
  cognitive: "Personal memory",
  social: "Shared knowledge",
} as const;

type ForceKey = keyof typeof FORCE_LABELS;
type VectorLayout = "origin" | "addition";

interface StepPreset {
  parameters: SwarmParameters;
  state: SwarmState;
  selectedId: number | null;
}

function toPlot(point: Point): Point {
  return {
    x: PLOT.left + ((point.x - DOMAIN.min) / (DOMAIN.max - DOMAIN.min)) * PLOT.width,
    y: PLOT.top + ((DOMAIN.max - point.y) / (DOMAIN.max - DOMAIN.min)) * PLOT.height,
  };
}

function interpolate(a: Point, b: Point, valueA: number, valueB: number, level: number): Point {
  const amount = valueA === valueB ? 0.5 : (level - valueA) / (valueB - valueA);
  return { x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount };
}

/** Compact marching-squares segments are enough for quiet, legible objective contours. */
function contourPath(level: number): string {
  const cells = 46;
  const step = (DOMAIN.max - DOMAIN.min) / cells;
  const commands: string[] = [];
  for (let row = 0; row < cells; row += 1) {
    for (let column = 0; column < cells; column += 1) {
      const x = DOMAIN.min + column * step;
      const y = DOMAIN.min + row * step;
      const corners = [
        { x, y: y + step },
        { x: x + step, y: y + step },
        { x: x + step, y },
        { x, y },
      ];
      const values = corners.map(objective);
      const crossings: Point[] = [];
      for (let edge = 0; edge < 4; edge += 1) {
        const next = (edge + 1) % 4;
        if ((values[edge] < level) !== (values[next] < level)) {
          crossings.push(interpolate(corners[edge], corners[next], values[edge], values[next], level));
        }
      }
      for (let index = 0; index + 1 < crossings.length; index += 2) {
        const from = toPlot(crossings[index]);
        const to = toPlot(crossings[index + 1]);
        commands.push(`M${from.x.toFixed(1)},${from.y.toFixed(1)}L${to.x.toFixed(1)},${to.y.toFixed(1)}`);
      }
    }
  }
  return commands.join("");
}

const CONTOURS = CONTOUR_LEVELS.map((level) => ({ level, path: contourPath(level) }));
const SHADE_CELLS = Array.from({ length: 14 * 14 }, (_, index) => {
  const column = index % 14;
  const row = Math.floor(index / 14);
  const size = (DOMAIN.max - DOMAIN.min) / 14;
  const point = { x: DOMAIN.min + (column + 0.5) * size, y: DOMAIN.min + (row + 0.5) * size };
  return { point, score: objective(point), column, row };
});

function findDiscoveryState(): SwarmState {
  let state = initialSwarm();
  let latestDiscovery = state;
  for (let index = 0; index < 28; index += 1) {
    state = stepSwarm(state, DEFAULT_PARAMETERS);
    if (state.globalBestUpdatedBy !== null) {
      latestDiscovery = state;
      if (state.iteration >= 4) return state;
    }
  }
  return latestDiscovery;
}

function presetFor(step: number): StepPreset {
  if (step === 1) return { parameters: DEFAULT_PARAMETERS, state: evolveSwarm(4), selectedId: 5 };
  if (step === 2) {
    const state = findDiscoveryState();
    return { parameters: DEFAULT_PARAMETERS, state, selectedId: state.globalBestUpdatedBy };
  }
  if (step === 3) return { parameters: COLLAPSE_PARAMETERS, state: evolveSwarm(50, COLLAPSE_PARAMETERS), selectedId: null };
  if (step >= 4) return { parameters: EXPLORATION_PARAMETERS, state: evolveSwarm(50, EXPLORATION_PARAMETERS), selectedId: null };
  return { parameters: DEFAULT_PARAMETERS, state: initialSwarm(), selectedId: null };
}

function vectorText(vector: Point) {
  return `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)})`;
}

function pathThrough(points: readonly Point[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join("");
}

function historyPath(
  values: readonly number[],
  left: number,
  top: number,
  width: number,
  height: number,
): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.0001);
  return values.map((value, index) => {
    const x = left + (index / Math.max(1, values.length - 1)) * width;
    const y = top + ((max - value) / range) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("");
}

function VectorArrow({
  from,
  to,
  colour,
  marker,
  dashed = false,
  label,
}: {
  from: Point;
  to: Point;
  colour: string;
  marker: string;
  dashed?: boolean;
  label?: string;
}) {
  if (Math.hypot(to.x - from.x, to.y - from.y) < 2) return null;
  return (
    <g aria-hidden="true">
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={vizTokens.canvas}
        strokeWidth={7}
        strokeDasharray={dashed ? "7 5" : undefined}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={colour}
        strokeWidth={3}
        strokeDasharray={dashed ? "7 5" : undefined}
        markerEnd={`url(#${marker})`}
        vectorEffect="non-scaling-stroke"
      />
      {label ? (
        <text
          x={to.x + 7}
          y={to.y - 6}
          fill={colour}
          stroke={vizTokens.canvas}
          strokeWidth={3}
          paintOrder="stroke"
          fontSize={10}
          fontFamily="var(--font-mono)"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function VectorWorkbench({
  forces,
  visibleForces,
  vectorLayout,
  markerIds,
}: {
  forces: ReturnType<typeof particleForces>;
  visibleForces: Record<ForceKey, boolean>;
  vectorLayout: VectorLayout;
  markerIds: Record<"inertia" | "cognitive" | "social" | "combined" | "forecast", string>;
}) {
  const boxWidth = PANEL.width - 36;
  const boxTop = 9;
  const boxHeight = 80;
  const definitions = [
    { key: "inertia" as const, force: forces.inertia, colour: vizTokens.mutedInk, marker: markerIds.inertia, label: "M" },
    { key: "cognitive" as const, force: forces.cognitive, colour: vizTokens.classA, marker: markerIds.cognitive, label: "P" },
    { key: "social" as const, force: forces.social, colour: vizTokens.path, marker: markerIds.social, label: "S" },
  ].filter((definition) => visibleForces[definition.key]);
  const arrows: { key: ForceKey; from: Point; to: Point; colour: string; marker: string; label: string }[] = [];
  let cursor = { x: 0, y: 0 };
  for (const definition of definitions) {
    const from = vectorLayout === "origin" ? { x: 0, y: 0 } : cursor;
    const to = { x: from.x + definition.force.x, y: from.y + definition.force.y };
    arrows.push({ ...definition, from, to });
    if (vectorLayout === "addition") cursor = to;
  }

  const combined = { x: forces.velocity.x, y: forces.velocity.y };
  const domainPoints = [
    { x: 0, y: 0 },
    combined,
    ...arrows.flatMap((arrow) => [arrow.from, arrow.to]),
  ];
  const xMin = Math.min(...domainPoints.map((point) => point.x));
  const xMax = Math.max(...domainPoints.map((point) => point.x));
  const yMin = Math.min(...domainPoints.map((point) => point.y));
  const yMax = Math.max(...domainPoints.map((point) => point.y));
  const xRange = Math.max(0.7, xMax - xMin);
  const yRange = Math.max(0.7, yMax - yMin);
  const scale = Math.min(54, (boxWidth - 56) / xRange, (boxHeight - 28) / yRange);
  const dataWidth = (xMax - xMin) * scale;
  const dataHeight = (yMax - yMin) * scale;
  const mapPoint = (point: Point): Point => ({
    x: (boxWidth - dataWidth) / 2 + (point.x - xMin) * scale,
    y: boxTop + (boxHeight - dataHeight) / 2 + (yMax - point.y) * scale,
  });
  const origin = mapPoint({ x: 0, y: 0 });

  return (
    <g aria-label={`${vectorLayout === "origin" ? "Same-origin force comparison" : "Head-to-tail force addition"}. Momentum ${vectorText(forces.inertia)}. Personal memory ${vectorText(forces.cognitive)}. Shared knowledge ${vectorText(forces.social)}. Combined velocity ${vectorText(forces.velocity)}.`}>
      <text fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={9} letterSpacing={0.7}>VECTOR WORKBENCH</text>
      <text x={boxWidth} textAnchor="end" fill={vizTokens.selection} fontFamily="var(--font-mono)" fontSize={9}>{vectorLayout === "origin" ? "SAME ORIGIN" : "HEAD TO TAIL"}</text>
      <rect x={0} y={boxTop} width={boxWidth} height={boxHeight} fill="#F5F2EC" stroke={vizTokens.grid} />
      <line x1={12} y1={origin.y} x2={boxWidth - 12} y2={origin.y} stroke={vizTokens.grid} strokeDasharray="2 5" />
      <line x1={origin.x} y1={boxTop + 8} x2={origin.x} y2={boxTop + boxHeight - 8} stroke={vizTokens.grid} strokeDasharray="2 5" />
      <VectorArrow from={origin} to={mapPoint(combined)} colour={vizTokens.selection} marker={markerIds.combined} dashed label="Σ" />
      {arrows.map(({ key, from, to, ...arrow }) => (
        <VectorArrow key={key} from={mapPoint(from)} to={mapPoint(to)} {...arrow} />
      ))}
      <circle cx={origin.x} cy={origin.y} r={3.5} fill={vizTokens.ink} stroke={vizTokens.canvas} strokeWidth={1.5} />
      <text y={104} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={8.5}>M momentum · P personal · S shared</text>
      <text x={boxWidth} y={104} textAnchor="end" fill={forces.velocityClipped ? vizTokens.error : vizTokens.selection} fontFamily="var(--font-mono)" fontSize={8.5}>Σ {vectorText(forces.velocity)}{forces.velocityClipped ? " · clipped" : ""}</text>
    </g>
  );
}

function SwarmField({
  state,
  parameters,
  selectedId,
  visibleForces,
  vectorLayout,
  reducedMotion,
  onSelect,
  onNavigate,
  markerIds,
  guidedStep,
}: {
  state: SwarmState;
  parameters: SwarmParameters;
  selectedId: number | null;
  visibleForces: Record<ForceKey, boolean>;
  vectorLayout: VectorLayout;
  reducedMotion: boolean;
  onSelect: (id: number) => void;
  onNavigate: (direction: number) => void;
  markerIds: Record<"inertia" | "cognitive" | "social" | "combined" | "forecast", string>;
  guidedStep: number;
}) {
  const selected = selectedId === null ? null : state.particles.find((particle) => particle.id === selectedId) ?? null;
  const forces = selected ? particleForces(state, selected, parameters) : null;
  const preview = selected && forces ? {
    x: clampToDomain(selected.x + forces.velocity.x),
    y: clampToDomain(selected.y + forces.velocity.y),
  } : null;
  const selectedOrigin = selected ? toPlot(selected) : null;
  const globalBest = toPlot(state.globalBest);
  const previousGlobalBest = state.previousGlobalBest ? toPlot(state.previousGlobalBest) : null;
  const discovered = state.globalBestUpdatedBy !== null && guidedStep === 2;
  const spread = swarmSpread(state.particles);
  const stalled = iterationsSinceImprovement(state) >= STAGNATION_THRESHOLD;
  const collapseInset = (() => {
    const xValues = state.particles.map((particle) => particle.x);
    const yValues = state.particles.map((particle) => particle.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const rawSpan = Math.max(xMax - xMin, yMax - yMin);
    const span = Math.max(rawSpan, 0.000_01) * 1.28;
    return {
      centre: { x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 },
      rawSpan,
      span,
      magnification: (DOMAIN.max - DOMAIN.min) / span,
    };
  })();

  const handleStageKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      onNavigate(1);
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      onNavigate(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      onSelect(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onSelect(state.particles.length - 1);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMin meet"
      className="block aspect-[1180/520] h-auto w-full shrink-0 bg-viz-canvas sm:aspect-auto sm:h-full"
      role="group"
      tabIndex={0}
      onKeyDown={handleStageKeyDown}
      data-testid="particle-swarm-field"
      aria-label={`Top-down Rastrigin objective field. Iteration ${state.iteration}. ${state.particles.length} particles. Global best ${state.globalBestScore.toFixed(3)}. Swarm spread ${spread.toFixed(2)}. Use arrow keys to select particles.`}
    >
      <defs>
        <clipPath id="pso-plot-clip"><rect x={PLOT.left} y={PLOT.top} width={PLOT.width} height={PLOT.height} /></clipPath>
        {Object.entries(markerIds).map(([key, id]) => {
          const colours: Record<string, string> = {
            inertia: vizTokens.mutedInk,
            cognitive: vizTokens.classA,
            social: vizTokens.path,
            combined: vizTokens.selection,
            forecast: vizTokens.selection,
          };
          return (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={colours[key]} />
            </marker>
          );
        })}
      </defs>

      <rect x={PLOT.left} y={PLOT.top} width={PLOT.width} height={PLOT.height} fill={vizTokens.canvas} stroke={vizTokens.border} />
      <g clipPath="url(#pso-plot-clip)">
        {SHADE_CELLS.map((cell) => {
          const width = PLOT.width / 14;
          const height = PLOT.height / 14;
          // Rounded because `objective` uses Math.cos, whose last-place digits differ
          // between the server and browser engines and desynchronise hydration.
          const opacity = Math.round((0.025 + Math.min(0.09, cell.score / 900)) * 1e4) / 1e4;
          return <rect key={`${cell.row}-${cell.column}`} x={PLOT.left + cell.column * width} y={PLOT.top + (13 - cell.row) * height} width={width + 0.4} height={height + 0.4} fill={vizTokens.error} opacity={opacity} />;
        })}
        {CONTOURS.map(({ level, path }, index) => (
          <path key={level} d={path} fill="none" stroke={index < 2 ? vizTokens.border : vizTokens.grid} strokeWidth={index < 2 ? 1.25 : 0.9} opacity={index < 2 ? 0.7 : 0.82} vectorEffect="non-scaling-stroke" />
        ))}
        <line x1={PLOT.left} y1={PLOT.top + PLOT.height / 2} x2={PLOT.left + PLOT.width} y2={PLOT.top + PLOT.height / 2} stroke={vizTokens.axis} opacity={0.34} />
        <line x1={PLOT.left + PLOT.width / 2} y1={PLOT.top} x2={PLOT.left + PLOT.width / 2} y2={PLOT.top + PLOT.height} stroke={vizTokens.axis} opacity={0.34} />

        {state.particles.map((particle) => {
          const trail = state.trails[particle.id] ?? [];
          if (trail.length < 2) return null;
          return (
            <path
              key={`trail-${particle.id}`}
              d={pathThrough(trail.map(toPlot))}
              fill="none"
              stroke={particle.id === selectedId ? vizTokens.selection : vizTokens.mutedInk}
              strokeWidth={particle.id === selectedId ? 2.5 : 1.25}
              strokeLinecap="round"
              strokeDasharray="1 0"
              opacity={particle.id === selectedId ? 0.72 : selectedId === null ? 0.3 : 0.12}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {state.particles.map((particle) => {
          const personalBest = toPlot(particle.best);
          return (
            <g key={`best-${particle.id}`} opacity={selectedId === null || particle.id === selectedId ? 0.78 : 0.24}>
              <circle cx={personalBest.x} cy={personalBest.y} r={particle.id === selectedId ? 7 : 4.5} fill="none" stroke={vizTokens.classA} strokeWidth={particle.id === selectedId ? 2.2 : 1.3} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}

        {previousGlobalBest ? (
          <g opacity={0.5}>
            <circle cx={previousGlobalBest.x} cy={previousGlobalBest.y} r={10} fill="none" stroke={vizTokens.mutedInk} strokeWidth={1.5} strokeDasharray="4 4" />
            <line x1={previousGlobalBest.x - 7} y1={previousGlobalBest.y - 7} x2={previousGlobalBest.x + 7} y2={previousGlobalBest.y + 7} stroke={vizTokens.mutedInk} />
          </g>
        ) : null}

        {discovered ? (
          <g aria-hidden="true">
            {state.particles.map((particle) => {
              const point = toPlot(particle);
              return <line key={`signal-${particle.id}`} x1={globalBest.x} y1={globalBest.y} x2={point.x} y2={point.y} stroke={vizTokens.path} strokeWidth={0.8} strokeDasharray="3 7" opacity={0.2} />;
            })}
            <circle cx={globalBest.x} cy={globalBest.y} r={reducedMotion ? 26 : 19} className={reducedMotion ? undefined : "pso-discovery-pulse"} fill="none" stroke={vizTokens.path} strokeWidth={2} opacity={0.7} />
          </g>
        ) : null}

        {state.particles.map((particle) => {
          const point = toPlot(particle);
          const selectedParticle = particle.id === selectedId;
          const dimmed = selectedId !== null && !selectedParticle;
          return (
            <g
              key={particle.id}
              role="button"
              tabIndex={0}
              aria-pressed={selectedParticle}
              aria-label={`Select particle ${particle.id + 1}. Position ${particle.x.toFixed(2)}, ${particle.y.toFixed(2)}. Objective ${objective(particle).toFixed(3)}.`}
              onClick={() => onSelect(particle.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(particle.id);
                }
              }}
              className="cursor-pointer focus:outline-none"
              opacity={dimmed ? 0.38 : 1}
            >
              <circle cx={point.x} cy={point.y} r={16} fill="transparent" />
              {selectedParticle ? <circle cx={point.x} cy={point.y} r={11} fill={vizTokens.canvas} stroke={vizTokens.selection} strokeWidth={2.5} /> : null}
              <circle cx={point.x} cy={point.y} r={selectedParticle ? 5.5 : 4.5} fill={vizTokens.ink} stroke={vizTokens.canvas} strokeWidth={1.6} />
              {selectedParticle ? <text x={point.x + 10} y={point.y + 17} fill={vizTokens.ink} fontFamily="var(--font-mono)" fontSize={10}>P{particle.id + 1}</text> : null}
            </g>
          );
        })}

        <g aria-hidden="true" pointerEvents="none">
          <circle cx={globalBest.x} cy={globalBest.y} r={12} fill={vizTokens.canvas} stroke={vizTokens.path} strokeWidth={2.4} />
          <circle cx={globalBest.x} cy={globalBest.y} r={6} fill="none" stroke={vizTokens.path} strokeWidth={2} />
        </g>

        {selected && selectedOrigin && preview ? (
          <g>
            <VectorArrow
              from={selectedOrigin}
              to={toPlot(preview)}
              colour={vizTokens.selection}
              marker={markerIds.combined}
              dashed
              label="forecast"
            />
            <circle cx={toPlot(preview).x} cy={toPlot(preview).y} r={6} fill={vizTokens.canvas} stroke={vizTokens.selection} strokeWidth={2} strokeDasharray="3 2" />
          </g>
        ) : null}

        {guidedStep === 3 ? (() => {
          const inset = { left: PLOT.left + PLOT.width - 178, top: PLOT.top + PLOT.height - 148, width: 162, height: 132 };
          const inner = { left: inset.left + 10, top: inset.top + 29, width: inset.width - 20, height: 78 };
          const positionsOverlap = collapseInset.rawSpan < 0.000_01;
          const zoomX = (value: number) => inner.left + ((value - (collapseInset.centre.x - collapseInset.span / 2)) / collapseInset.span) * inner.width;
          const zoomY = (value: number) => inner.top + (((collapseInset.centre.y + collapseInset.span / 2) - value) / collapseInset.span) * inner.height;
          return (
            <g aria-label={positionsOverlap ? `${state.particles.length} particles occupy the same plotted location.` : `Magnified collapsed cluster, ${collapseInset.magnification.toFixed(0)} times the full-domain scale.`}>
              <rect x={inset.left} y={inset.top} width={inset.width} height={inset.height} fill={vizTokens.canvas} fillOpacity={0.96} stroke={vizTokens.error} />
              <text x={inset.left + 10} y={inset.top + 17} fill={vizTokens.error} fontFamily="var(--font-mono)" fontSize={9}>{positionsOverlap ? "OCCUPANCY LENS · ZERO SPREAD" : `COLLAPSED CLUSTER ×${collapseInset.magnification.toFixed(0)}`}</text>
              <rect x={inner.left} y={inner.top} width={inner.width} height={inner.height} fill="#F5F2EC" stroke={vizTokens.grid} />
              {positionsOverlap ? (
                <g>
                  <circle cx={inner.left + 30} cy={inner.top + 39} r="13" fill={vizTokens.canvas} stroke={vizTokens.path} strokeWidth="2" />
                  <circle cx={inner.left + 30} cy={inner.top + 39} r="6" fill="none" stroke={vizTokens.path} strokeWidth="1.5" />
                  <text x={inner.left + 52} y={inner.top + 35} fill={vizTokens.ink} fontFamily="var(--font-mono)" fontSize={12}>{state.particles.length}×</text>
                  <text x={inner.left + 52} y={inner.top + 49} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={8}>PARTICLES</text>
                  {state.particles.map((particle) => <circle key={`occupancy-${particle.id}`} cx={inner.left + 101 + (particle.id % 6) * 6} cy={inner.top + 28 + Math.floor(particle.id / 6) * 11} r="2" fill={particle.id % 2 === 0 ? vizTokens.classA : vizTokens.classB} />)}
                </g>
              ) : (
                <>
                  {state.particles.map((particle) => (
                    <g key={`collapse-detail-${particle.id}`}>
                      <circle cx={zoomX(particle.best.x)} cy={zoomY(particle.best.y)} r="3.2" fill="none" stroke={vizTokens.classA} strokeWidth="1" />
                      <circle cx={zoomX(particle.x)} cy={zoomY(particle.y)} r="2.7" fill={vizTokens.ink} stroke={vizTokens.canvas} strokeWidth="0.8" />
                    </g>
                  ))}
                  <circle cx={zoomX(state.globalBest.x)} cy={zoomY(state.globalBest.y)} r="7" fill="none" stroke={vizTokens.path} strokeWidth="1.8" />
                  <circle cx={zoomX(state.globalBest.x)} cy={zoomY(state.globalBest.y)} r="3.5" fill="none" stroke={vizTokens.path} strokeWidth="1.3" />
                </>
              )}
              <text x={inset.left + 10} y={inset.top + 122} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={8}>{positionsOverlap ? `${state.particles.length} IDS → ONE PLOTTED LOCATION` : `AUTO-SCALED · ${state.particles.length} POSITIONS`}</text>
            </g>
          );
        })() : null}
      </g>

      <text x={PLOT.left} y={16} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={10} letterSpacing={1.2}>OBJECTIVE CONTOURS · NO GRADIENT COMPUTED</text>
      <text x={PLOT.left} y={505} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={9}>solid = current · hollow = personal memory · double ring = shared best · dashed = forecast</text>

      {discovered ? (
        <g transform={`translate(${PLOT.left + 18} ${PLOT.top + 18})`}>
          <rect width={345} height={58} fill={vizTokens.canvas} stroke={vizTokens.path} />
          <text x={14} y={21} fill={vizTokens.path} fontFamily="var(--font-mono)" fontSize={10} letterSpacing={0.7}>NEW SHARED DISCOVERY</text>
          <text x={14} y={42} fill={vizTokens.ink} fontFamily="var(--font-body)" fontSize={13}>Particle {(state.globalBestUpdatedBy ?? 0) + 1} lowered the cost. Every social target changed.</text>
        </g>
      ) : guidedStep === 3 ? (
        <g transform={`translate(${PLOT.left + 18} ${PLOT.top + 18})`}>
          <rect width={324} height={58} fill={vizTokens.canvas} stroke={vizTokens.error} />
          <text x={14} y={21} fill={vizTokens.error} fontFamily="var(--font-mono)" fontSize={10} letterSpacing={0.7}>PREMATURE COLLAPSE</text>
          <text x={14} y={42} fill={vizTokens.ink} fontFamily="var(--font-body)" fontSize={13}>Strong agreement compressed the search too early.</text>
        </g>
      ) : guidedStep === 4 ? (
        <g transform={`translate(${PLOT.left + 18} ${PLOT.top + 18})`}>
          <rect width={324} height={58} fill={vizTokens.canvas} stroke={vizTokens.classA} />
          <text x={14} y={21} fill={vizTokens.classA} fontFamily="var(--font-mono)" fontSize={10} letterSpacing={0.7}>EXPLORATION PRESERVED</text>
          <text x={14} y={42} fill={vizTokens.ink} fontFamily="var(--font-body)" fontSize={13}>Less social pull keeps more search regions alive.</text>
        </g>
      ) : null}

      <g transform={`translate(${PANEL.left} ${PANEL.top})`}>
        <rect width={PANEL.width} height={PANEL.height} fill={vizTokens.canvas} stroke={vizTokens.border} />
        <text x={18} y={24} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={10} letterSpacing={1.1}>SWARM STATE · ITERATION {state.iteration}</text>
        <line x1={18} y1={36} x2={PANEL.width - 18} y2={36} stroke={vizTokens.grid} />
        <text x={18} y={57} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={10}>BEST OBJECTIVE</text>
        <text x={PANEL.width - 18} y={58} textAnchor="end" fill={vizTokens.path} fontFamily="var(--font-mono)" fontSize={17}>{state.globalBestScore.toFixed(3)}</text>
        <text x={18} y={78} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={10}>SWARM SPREAD</text>
        <text x={PANEL.width - 18} y={78} textAnchor="end" fill={guidedStep === 3 ? vizTokens.error : vizTokens.classA} fontFamily="var(--font-mono)" fontSize={13}>{spread.toFixed(2)}</text>
        <text x={18} y={98} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={10}>STEPS SINCE BETTER FIND</text>
        <text x={PANEL.width - 18} y={98} textAnchor="end" fill={stalled ? vizTokens.error : vizTokens.ink} fontFamily="var(--font-mono)" fontSize={13}>{iterationsSinceImprovement(state)}</text>
        {stalled ? <text x={18} y={117} fill={vizTokens.error} fontFamily="var(--font-body)" fontSize={11}>Search stalled · no better discovery for {iterationsSinceImprovement(state)} steps</text> : null}

        <line x1={18} y1={130} x2={PANEL.width - 18} y2={130} stroke={vizTokens.grid} />
        {selected && forces ? (
          <g transform="translate(18 151)">
            <text fill={vizTokens.selection} fontFamily="var(--font-mono)" fontSize={11} letterSpacing={0.8}>PARTICLE {selected.id + 1} MICROSCOPE</text>
            <text y={22} fill={vizTokens.ink} fontFamily="var(--font-body)" fontSize={12}>Position {vectorText(selected)} · cost {objective(selected).toFixed(2)}</text>
            <text y={41} fill={vizTokens.classA} fontFamily="var(--font-body)" fontSize={12}>Personal best {vectorText(selected.best)} · {selected.bestScore.toFixed(2)}</text>
            <text y={60} fill={vizTokens.path} fontFamily="var(--font-body)" fontSize={12}>Shared best {vectorText(state.globalBest)} · {state.globalBestScore.toFixed(2)}</text>
            <line x1={0} y1={72} x2={PANEL.width - 36} y2={72} stroke={vizTokens.grid} />
            <g transform="translate(0 88)">
              <VectorWorkbench forces={forces} visibleForces={visibleForces} vectorLayout={vectorLayout} markerIds={markerIds} />
            </g>
            {forces.velocityClipped ? <text y={211} fill={vizTokens.error} fontFamily="var(--font-body)" fontSize={9}>Component sum exceeds the per-coordinate velocity limit.</text> : null}
          </g>
        ) : (
          <g transform="translate(18 154)">
            <text fill={vizTokens.ink} fontFamily="var(--font-headline)" fontSize={21}>Select a particle</text>
            <text y={27} fill={vizTokens.mutedInk} fontFamily="var(--font-body)" fontSize={12}>Click a solid mark, or use the arrow keys.</text>
            <text y={61} fill={vizTokens.ink} fontFamily="var(--font-body)" fontSize={13}>Its next move combines:</text>
            <text y={86} fill={vizTokens.mutedInk} fontFamily="var(--font-body)" fontSize={12}>1 · where it was already going</text>
            <text y={108} fill={vizTokens.classA} fontFamily="var(--font-body)" fontSize={12}>2 · what it personally discovered</text>
            <text y={130} fill={vizTokens.path} fontFamily="var(--font-body)" fontSize={12}>3 · what the swarm collectively knows</text>
          </g>
        )}

        <g transform="translate(18 372)">
          <text fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={9} letterSpacing={0.8}>BEST OBJECTIVE</text>
          <path d={historyPath(state.history.map((item) => item.bestScore), 0, 9, 132, 28)} fill="none" stroke={vizTokens.path} strokeWidth={2} />
          <text x={151} fill={vizTokens.mutedInk} fontFamily="var(--font-mono)" fontSize={9} letterSpacing={0.8}>SWARM SPREAD</text>
          <path d={historyPath(state.history.map((item) => item.spread), 151, 9, 132, 28)} fill="none" stroke={guidedStep === 3 ? vizTokens.error : vizTokens.classA} strokeWidth={2} />
          <line x1={0} y1={42} x2={PANEL.width - 36} y2={42} stroke={vizTokens.grid} />
          <text y={59} fill={vizTokens.mutedInk} fontFamily="var(--font-body)" fontSize={10}>Objective can improve while diversity disappears.</text>
        </g>
      </g>
    </svg>
  );
}

export default function ParticleSwarmScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const initialPreset = presetFor(step);
  const reducedMotion = Boolean(useReducedMotion());
  const markerBase = useId().replaceAll(":", "");
  const [parameters, setParameters] = useState<SwarmParameters>(initialPreset.parameters);
  const [state, setState] = useState<SwarmState>(initialPreset.state);
  const [selectedId, setSelectedId] = useState<number | null>(initialPreset.selectedId);
  const [running, setRunning] = useState(false);
  const [visibleForces, setVisibleForces] = useState<Record<ForceKey, boolean>>({ inertia: true, cognitive: true, social: true });
  const [vectorLayout, setVectorLayout] = useState<VectorLayout>("addition");

  useEffect(() => {
    const preset = presetFor(step);
    setParameters(preset.parameters);
    setState(preset.state);
    setSelectedId(preset.selectedId);
    setVisibleForces({ inertia: true, cognitive: true, social: true });
    setVectorLayout("addition");
    setRunning(false);
  }, [resetKey, step]);

  useEffect(() => {
    if (!running || state.iteration >= MAX_ITERATIONS) return;
    const timer = window.setTimeout(() => setState((current) => stepSwarm(current, parameters)), reducedMotion ? 650 : 460);
    return () => window.clearTimeout(timer);
  }, [parameters, reducedMotion, running, state.iteration]);

  useEffect(() => {
    if (!playing) return;
    setRunning(true);
    return () => setRunning(false);
  }, [playing, resetKey, step]);

  const selected = selectedId === null ? null : state.particles.find((particle) => particle.id === selectedId) ?? null;
  const forces = selected ? particleForces(state, selected, parameters) : null;
  const spread = swarmSpread(state.particles);
  const markerIds = useMemo(() => ({
    inertia: `${markerBase}-inertia`,
    cognitive: `${markerBase}-cognitive`,
    social: `${markerBase}-social`,
    combined: `${markerBase}-combined`,
    forecast: `${markerBase}-forecast`,
  }), [markerBase]);

  function takeStep() {
    setRunning(false);
    setState((current) => stepSwarm(current, parameters));
  }

  function restart() {
    setState(initialSwarm());
    setSelectedId(null);
    setRunning(false);
  }

  function navigateParticle(direction: number) {
    const current = selectedId ?? (direction > 0 ? -1 : 0);
    setSelectedId((current + direction + state.particles.length) % state.particles.length);
  }

  const status = selected && forces
    ? `Iteration ${state.iteration}. Selected particle ${selected.id + 1}. Position ${vectorText(selected)}. Objective ${objective(selected).toFixed(3)}. Personal best ${vectorText(selected.best)} with objective ${selected.bestScore.toFixed(3)}. Global best ${vectorText(state.globalBest)} with objective ${state.globalBestScore.toFixed(3)}. Inertia vector ${vectorText(forces.inertia)}. Personal pull ${vectorText(forces.cognitive)}. Social pull ${vectorText(forces.social)}. Combined next velocity ${vectorText(forces.velocity)}. Swarm spread ${spread.toFixed(2)}. ${iterationsSinceImprovement(state)} iterations since the last improvement.`
    : `Iteration ${state.iteration}. Best objective ${state.globalBestScore.toFixed(3)} at ${vectorText(state.globalBest)}. Swarm spread ${spread.toFixed(2)}. ${iterationsSinceImprovement(state)} iterations since the last improvement. Select a particle to inspect its update.`;

  const parameterControls = [
    { key: "inertia" as const, label: "Inertia", consequence: "Keeps the previous direction" },
    { key: "cognitive" as const, label: "Personal pull", consequence: "Returns to its own best" },
    { key: "social" as const, label: "Social pull", consequence: "Follows the swarm's best" },
  ];

  return (
    <section aria-label="Particle swarm optimisation visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div className="relative flex min-h-0 flex-col overflow-hidden sm:block">
        <SwarmField
          state={state}
          parameters={parameters}
          selectedId={selectedId}
          visibleForces={visibleForces}
          vectorLayout={vectorLayout}
          reducedMotion={reducedMotion}
          onSelect={setSelectedId}
          onNavigate={navigateParticle}
          markerIds={markerIds}
          guidedStep={step}
        />
        <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col justify-center border-t border-outline bg-surface px-3 py-2 sm:hidden">
          {selected && forces ? (
            <>
              <p className="font-mono text-[9px] uppercase tracking-label text-accent">Particle {selected.id + 1} microscope</p>
              <p className="mt-1 text-xs text-on-surface">Position {vectorText(selected)} · cost {objective(selected).toFixed(2)}</p>
              <div className="mt-2 grid gap-1 font-mono text-[9px] text-on-surface-variant">
                <p className="flex justify-between"><span>Momentum</span><span>{vectorText(forces.inertia)}</span></p>
                <p className="flex justify-between text-primary"><span>Personal memory</span><span>{vectorText(forces.cognitive)}</span></p>
                <p className="flex justify-between text-warning"><span>Shared knowledge</span><span>{vectorText(forces.social)}</span></p>
                <p className="mt-1 flex justify-between border-t border-outline pt-1 text-accent"><span>Combined next velocity</span><span>{vectorText(forces.velocity)}</span></p>
              </div>
            </>
          ) : (
            <>
              <p className="font-headline text-lg text-on-surface">Select a particle to explain its move.</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">Its next velocity combines momentum, personal memory, and the swarm’s shared knowledge.</p>
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">{status}</p>
      </div>

      <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:px-3">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          <button type="button" onClick={takeStep} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary">Step</button>
          <button type="button" onClick={() => setRunning((value) => !value)} className="min-h-9 border border-outline bg-surface px-3 text-xs hover:border-primary" aria-pressed={running}>{running ? "Pause" : "Run"}</button>
          <button type="button" onClick={restart} className="min-h-9 border border-outline bg-surface px-3 text-xs hover:border-primary">Restart</button>
          <button type="button" onClick={() => navigateParticle(-1)} className="min-h-9 border border-outline bg-surface px-2 text-xs hover:border-primary" aria-label="Select previous particle">← Particle</button>
          <button type="button" onClick={() => navigateParticle(1)} className="min-h-9 border border-outline bg-surface px-2 text-xs hover:border-primary" aria-label="Select next particle">Particle →</button>
          {selected ? (
            <>
              {(["inertia", "cognitive", "social"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={visibleForces[key]}
                  onClick={() => setVisibleForces((current) => ({ ...current, [key]: !current[key] }))}
                  className={`min-h-9 border px-2 text-[10px] ${visibleForces[key] ? "border-primary bg-primary-container text-on-primary-container" : "border-outline bg-surface text-on-surface-variant"}`}
                >
                  {FORCE_LABELS[key]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setVectorLayout((current) => current === "origin" ? "addition" : "origin")}
                className="min-h-9 border border-outline bg-surface px-2 text-[10px] hover:border-primary"
                aria-label={vectorLayout === "origin" ? "Show head-to-tail vector addition" : "Show same-origin vector comparison"}
              >
                {vectorLayout === "origin" ? "Add head-to-tail" : "Compare from origin"}
              </button>
            </>
          ) : null}
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-2">
          {parameterControls.map(({ key, label, consequence }) => (
            <label key={key} className="min-w-0" title={`${label}: ${consequence}`}>
              <span className="flex justify-between gap-1 font-mono text-[8px] uppercase tracking-[0.06em] text-on-surface-variant sm:text-[9px]"><span>{label}</span><span className="text-primary">{parameters[key].toFixed(2)}</span></span>
              <input
                aria-label={label}
                aria-describedby={`pso-${key}-description`}
                type="range"
                min="0"
                max="2.2"
                step="0.05"
                value={parameters[key]}
                onChange={(event) => setParameters((current) => ({ ...current, [key]: Number(event.target.value) }))}
              />
              <span id={`pso-${key}-description`} className="sr-only">{consequence}</span>
              <span aria-hidden="true" className="hidden truncate text-[9px] text-on-surface-variant xl:block">{consequence}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="sr-only">
        Velocity is clipped per coordinate and positions are clipped to the displayed domain so the deterministic demonstration remains bounded. These are implementation choices, not fundamental requirements of particle swarm optimisation. Pseudo-random coefficients are deterministic for reproducibility.
      </p>
    </section>
  );
}
