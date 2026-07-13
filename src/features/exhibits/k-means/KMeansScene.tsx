"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { scaleLinear } from "@visx/scale";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { vizStroke, vizTokens } from "@/lib/vizTokens";
import { reduced, vizMotion } from "@/lib/vizMotion";
import type { ExhibitSceneProps } from "../types";
import {
  BAD_INITIAL_CENTROIDS_K3,
  DATASET,
  DEFAULT_MAX_ITERATIONS,
  DEFAULT_TOLERANCE,
  DOMAIN,
  INITIAL_CENTROIDS,
  assignPoints,
  clampToDomain,
  hasConverged,
  inertia,
  updateCentroids,
  type KValue,
  type Point,
} from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const PLOT = { left: 52, right: 24, top: 24, bottom: 42 } as const;
const PLOT_WIDTH = WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
const X_TICKS = [-4, -2, 0, 2, 4];
const Y_TICKS = [-2, 0, 2];
const PALETTE = [vizTokens.classA, vizTokens.classB, vizTokens.path, vizTokens.target] as const;
const K_OPTIONS = [2, 3, 4] as const satisfies readonly KValue[];
const MAX_ITERATIONS = DEFAULT_MAX_ITERATIONS;
const TOLERANCE = DEFAULT_TOLERANCE;

type Phase = "assign" | "update";

interface HalfStep {
  phase: Phase;
  iteration: number;
  centroids: Point[];
  assignments: number[];
  inertia: number;
  converged: boolean;
}

const STEP_PRESETS = [
  { k: 3, initialCentroids: INITIAL_CENTROIDS[3], halfStepIndex: 0 },
  { k: 3, initialCentroids: INITIAL_CENTROIDS[3], halfStepIndex: 1 },
  { k: 3, initialCentroids: INITIAL_CENTROIDS[3], halfStepIndex: 2 },
  { k: 3, initialCentroids: BAD_INITIAL_CENTROIDS_K3, halfStepIndex: 2 },
] as const satisfies readonly { k: KValue; initialCentroids: readonly Point[]; halfStepIndex: number }[];

/** Replay assign/update phases from a starting position, one entry per half-step. */
function buildHalfSteps(
  points: readonly Point[],
  initialCentroids: readonly Point[],
  maxIterations: number,
  tolerance: number,
): HalfStep[] {
  const steps: HalfStep[] = [];
  let centroids = initialCentroids.map((point) => ({ ...point }));

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const assignments = assignPoints(points, centroids);
    steps.push({
      phase: "assign",
      iteration,
      centroids,
      assignments,
      inertia: inertia(points, assignments, centroids),
      converged: false,
    });

    const updated = updateCentroids(points, assignments, centroids);
    const converged = hasConverged(centroids, updated, tolerance);
    centroids = updated;
    steps.push({
      phase: "update",
      iteration,
      centroids,
      assignments,
      inertia: inertia(points, assignments, centroids),
      converged,
    });
    if (converged) break;
  }

  return steps;
}

function presetFor(step: number) {
  return STEP_PRESETS[Math.max(0, Math.min(STEP_PRESETS.length - 1, step))];
}

export default function KMeansScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const initialPreset = presetFor(step);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageId = useId();
  const prefersReduced = useReducedMotion();
  const [k, setK] = useState<KValue>(initialPreset.k);
  const [initialCentroids, setInitialCentroids] = useState<Point[]>(() => initialPreset.initialCentroids.map((point) => ({ ...point })));
  const [halfStepIndex, setHalfStepIndex] = useState<number>(initialPreset.halfStepIndex);
  const [selectedCentroid, setSelectedCentroid] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  // visx scales own domain→pixel; plotted content renders plot-relative inside
  // the translated Group. Pointer drags invert through the same scales.
  const xScale = useMemo(
    () => scaleLinear({ domain: [DOMAIN.xMin, DOMAIN.xMax], range: [0, PLOT_WIDTH] }),
    [],
  );
  const yScale = useMemo(
    () => scaleLinear({ domain: [DOMAIN.yMin, DOMAIN.yMax], range: [PLOT_HEIGHT, 0] }),
    [],
  );
  const sx = (value: number) => xScale(value);
  const sy = (value: number) => yScale(value);

  const steps = useMemo(
    () => buildHalfSteps(DATASET, initialCentroids, MAX_ITERATIONS, TOLERANCE),
    [initialCentroids],
  );
  const boundedHalfStep = Math.min(halfStepIndex, steps.length);
  const current = boundedHalfStep === 0 ? null : steps[boundedHalfStep - 1];
  const centroids = current ? current.centroids : initialCentroids;
  const assignments = current ? current.assignments : null;
  const nextPhase: Phase = boundedHalfStep % 2 === 0 ? "assign" : "update";
  const iterationNumber = Math.floor(boundedHalfStep / 2) + 1;
  const converged = current?.converged === true;
  const exhausted = boundedHalfStep >= steps.length;
  const afterInertia = current?.inertia ?? 0;
  const beforeInertia = boundedHalfStep >= 2 ? steps[boundedHalfStep - 2].inertia : afterInertia;
  const inertiaDelta = afterInertia - beforeInertia;
  const changePercent = beforeInertia > 0 ? Math.abs((inertiaDelta / beforeInertia) * 100) : 0;
  const decisionCells = useMemo(() => {
    const columns = 36;
    const rows = 20;
    return Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const point = {
        x: DOMAIN.xMin + ((column + 0.5) / columns) * (DOMAIN.xMax - DOMAIN.xMin),
        y: DOMAIN.yMax - ((row + 0.5) / rows) * (DOMAIN.yMax - DOMAIN.yMin),
      };
      return { column, row, cluster: assignPoints([point], centroids.slice(0, k))[0], columns, rows };
    });
  }, [centroids, k]);

  useEffect(() => {
    const preset = presetFor(step);
    setK(preset.k);
    setInitialCentroids(preset.initialCentroids.map((point) => ({ ...point })));
    setHalfStepIndex(preset.halfStepIndex);
    setSelectedCentroid(0);
    setDraggingIndex(null);
    setRunning(false);
  }, [resetKey, step]);

  useEffect(() => {
    if (!playing) return;
    setRunning(true);
    return () => setRunning(false);
  }, [playing, resetKey, step]);

  useEffect(() => {
    if (!running) return;
    if (boundedHalfStep >= steps.length) {
      setRunning(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setHalfStepIndex((value) => Math.min(steps.length, value + 1));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [running, boundedHalfStep, steps.length]);

  function restart() {
    setHalfStepIndex(0);
    setRunning(false);
  }

  function chooseK(nextK: KValue) {
    setK(nextK);
    setInitialCentroids(INITIAL_CENTROIDS[nextK].map((point) => ({ ...point })));
    setHalfStepIndex(0);
    setSelectedCentroid(0);
    setRunning(false);
  }

  function moveCentroid(index: number, point: Point) {
    const clamped = clampToDomain(point);
    setInitialCentroids((value) => value.map((centroid, centroidIndex) => (centroidIndex === index ? clamped : centroid)));
    setHalfStepIndex(0);
    setRunning(false);
  }

  function moveCentroidFromPointer(index: number, clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return;

    const toDomain = (localX: number, localY: number) =>
      clampToDomain({
        x: xScale.invert(localX - PLOT.left),
        y: yScale.invert(localY - PLOT.top),
      });

    const matrix = svg.getScreenCTM();
    if (matrix) {
      const pointer = svg.createSVGPoint();
      pointer.x = clientX;
      pointer.y = clientY;
      const local = pointer.matrixTransform(matrix.inverse());
      moveCentroid(index, toDomain(local.x, local.y));
      return;
    }

    // JSDOM and older embedded browsers may not expose the SVG transform matrix.
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    moveCentroid(index, toDomain(
      ((clientX - rect.left) / rect.width) * WIDTH,
      ((clientY - rect.top) / rect.height) * HEIGHT,
    ));
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key >= "1" && event.key <= "4") {
      const index = Number(event.key) - 1;
      if (index < k) {
        event.preventDefault();
        setSelectedCentroid(index);
      }
      return;
    }

    const amount = event.shiftKey ? 0.4 : 0.16;
    const offsets: Partial<Record<string, Point>> = {
      ArrowLeft: { x: -amount, y: 0 },
      ArrowRight: { x: amount, y: 0 },
      ArrowUp: { x: 0, y: amount },
      ArrowDown: { x: 0, y: -amount },
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const base = centroids[selectedCentroid];
    moveCentroid(selectedCentroid, { x: base.x + offset.x, y: base.y + offset.y });
  }

  function advancePhase() {
    if (exhausted) return;
    setRunning(false);
    setHalfStepIndex((value) => Math.min(steps.length, value + 1));
  }

  function centroidHandlers(index: number) {
    return {
      onPointerDown: (event: ReactPointerEvent<SVGCircleElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setSelectedCentroid(index);
        setDraggingIndex(index);
        moveCentroidFromPointer(index, event.clientX, event.clientY);
      },
      onPointerMove: (event: ReactPointerEvent<SVGCircleElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          moveCentroidFromPointer(index, event.clientX, event.clientY);
        }
      },
      onPointerUp: (event: ReactPointerEvent<SVGCircleElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setDraggingIndex(null);
      },
    };
  }

  const phaseLabel = nextPhase === "assign" ? "Assign points" : "Move centroids";
  const runLabel = running ? "Pause" : "Run to convergence";
  const panelHeading = current === null
    ? "READY TO ASSIGN"
    : `ITERATION ${current.iteration} · ${current.phase.toUpperCase()} DONE`;
  const outcomeLabel = converged
    ? "CONVERGED"
    : inertiaDelta < -1e-6
      ? "INERTIA DOWN"
      : "NO CHANGE";
  const selectedPosition = centroids[selectedCentroid];
  const stageLabel = `K-means clustering stage. Centroid ${selectedCentroid + 1} of ${k} selected, at x ${selectedPosition.x.toFixed(2)}, y ${selectedPosition.y.toFixed(2)}. Press 1 to ${k} to select a centroid; use arrow keys to move it, hold Shift for larger moves.`;
  const statusDescription = current
    ? `Iteration ${current.iteration}, ${current.phase} phase. Inertia ${afterInertia.toFixed(1)}, ${inertiaDelta < -1e-6 ? "down" : "unchanged"} from ${beforeInertia.toFixed(1)}. Centroid ${selectedCentroid + 1} selected.${converged ? " Converged." : ""}`
    : `Iteration ${iterationNumber}, ready to assign points. Centroid ${selectedCentroid + 1} selected.`;

  return (
    <section aria-label="K-means clustering visualisation" className="grid h-full min-h-[22rem] min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div
        role="group"
        tabIndex={0}
        aria-label={stageLabel}
        aria-describedby={`${stageId}-keyboard-help`}
        aria-keyshortcuts="1 2 3 4 ArrowLeft ArrowRight ArrowUp ArrowDown"
        onKeyDown={handleStageKeyDown}
        className="relative min-h-0 overflow-hidden bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        data-testid="kmeans-stage"
      >
        <span id={`${stageId}-keyboard-help`} className="sr-only">Drag a centroid to move it, or use number keys 1 to {k} to select a centroid and the arrow keys to nudge it. Hold Shift for larger moves.</span>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="block h-full w-full touch-none select-none"
        >
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />

          <Group left={PLOT.left} top={PLOT.top}>
            <rect width={PLOT_WIDTH} height={PLOT_HEIGHT} fill={vizTokens.canvas} stroke="none" />
            {decisionCells.map((cell) => <rect key={`${cell.column}-${cell.row}`} x={cell.column * PLOT_WIDTH / cell.columns} y={cell.row * PLOT_HEIGHT / cell.rows} width={PLOT_WIDTH / cell.columns + 0.5} height={PLOT_HEIGHT / cell.rows + 0.5} fill={PALETTE[cell.cluster]} opacity="0.09" />)}
            <GridColumns scale={xScale} height={PLOT_HEIGHT} tickValues={X_TICKS} stroke={vizTokens.grid} strokeWidth={vizStroke.grid} />
            <GridRows scale={yScale} width={PLOT_WIDTH} tickValues={Y_TICKS} stroke={vizTokens.grid} strokeWidth={vizStroke.grid} />

            <AnimatePresence>
              {current?.phase === "assign" && assignments && DATASET.map((point, index) => (
                <motion.line
                  key={`link-${index}`}
                  x1={sx(point.x)}
                  y1={sy(point.y)}
                  x2={sx(centroids[assignments[index]].x)}
                  y2={sy(centroids[assignments[index]].y)}
                  stroke={PALETTE[assignments[index]]}
                  strokeWidth={vizStroke.hairline}
                  initial={prefersReduced ? false : { opacity: 0 }}
                  animate={{ opacity: 0.22 }}
                  exit={{ opacity: 0 }}
                  transition={reduced(vizMotion.fade, prefersReduced)}
                />
              ))}
            </AnimatePresence>

            {DATASET.map((point, index) => (
              <motion.circle
                key={index}
                cx={sx(point.x)}
                cy={sy(point.y)}
                r={4}
                stroke={vizTokens.pointOutline}
                strokeWidth={vizStroke.hairline}
                initial={false}
                animate={{ fill: assignments ? PALETTE[assignments[index]] : vizTokens.mutedInk }}
                transition={reduced(vizMotion.fade, prefersReduced)}
              />
            ))}

            {centroids.slice(0, k).map((centroid, index) => {
              const color = PALETTE[index];
              const selected = selectedCentroid === index;
              return (
                <motion.g
                  key={index}
                  initial={false}
                  animate={{ x: sx(centroid.x), y: sy(centroid.y) }}
                  transition={draggingIndex === index ? { duration: 0 } : reduced(vizMotion.markerSpring, prefersReduced)}
                >
                  {selected && <circle r={23} fill="none" stroke={vizTokens.selection} strokeWidth={vizStroke.guide} opacity={0.5} />}
                  <circle r={15} fill={vizTokens.canvas} fillOpacity={0.85} stroke={color} strokeWidth={vizStroke.markerStrong} />
                  <circle r={4} fill={color} />
                  <circle
                    data-testid={`centroid-handle-${index}`}
                    r={20}
                    fill="transparent"
                    className="cursor-grab touch-none"
                    {...centroidHandlers(index)}
                  />
                </motion.g>
              );
            })}
          </Group>

          <rect x={PLOT.left} y={PLOT.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} fill="none" stroke={vizTokens.border} />
          <text x={PLOT.left + 10} y={PLOT.top + 18} fill={vizTokens.mutedInk} fontSize="10" fontFamily="var(--font-dm-mono)">TINT = NEAREST-CENTROID REGION</text>

          <g transform={`translate(${WIDTH - 326} ${PLOT.top + 18})`}>
            <rect width="282" height="86" fill={vizTokens.canvas} fillOpacity="0.94" stroke={vizTokens.border} />
            <text x="14" y="20" fill={vizTokens.mutedInk} fontSize="10" fontFamily="var(--font-dm-mono)" letterSpacing="1.3">{panelHeading}</text>
            <text x="14" y="49" fill={vizTokens.ink} fontSize="21" fontFamily="var(--font-dm-mono)">{beforeInertia.toFixed(1)}</text>
            <text x="106" y="48" fill={vizTokens.mutedInk} fontSize="17">{"→"}</text>
            <text x="137" y="49" fill={converged ? vizTokens.classA : vizTokens.path} fontSize="21" fontFamily="var(--font-dm-mono)">{afterInertia.toFixed(1)}</text>
            <text x="14" y="72" fill={converged ? vizTokens.classA : vizTokens.path} fontSize="11" fontFamily="var(--font-dm-mono)">{outcomeLabel}</text>
            <text x="268" y="72" textAnchor="end" fill={vizTokens.mutedInk} fontSize="11" fontFamily="var(--font-dm-mono)">{changePercent.toFixed(1)}%</text>
          </g>
        </svg>

        <p className="sr-only" aria-live="polite">{statusDescription}</p>
      </div>

      <div className="grid shrink-0 grid-cols-[auto_minmax(8rem,1fr)] gap-x-3 gap-y-2 border-t border-outline bg-surface-container-low p-2 sm:flex sm:items-end sm:gap-4 sm:px-3 sm:py-2">
        <fieldset className="min-w-0">
          <legend className="mb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">k</legend>
          <div className="grid grid-cols-3">
            {K_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={k === option}
                onClick={() => chooseK(option)}
                className={`min-h-9 border px-3 text-xs transition-colors ${option !== 2 ? "-ml-px" : ""} ${k === option ? "relative z-10 border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:border-primary"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="col-span-2 flex min-w-0 gap-2 sm:ml-auto sm:pb-px">
          <button
            type="button"
            onClick={advancePhase}
            disabled={exhausted}
            className="min-h-9 flex-1 border border-primary bg-primary px-3 text-xs text-on-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            {phaseLabel}
          </button>
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            disabled={exhausted && !running}
            className="min-h-9 flex-1 border border-outline bg-surface px-3 text-xs text-on-surface hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            {runLabel}
          </button>
          <button type="button" onClick={restart} className="min-h-9 flex-1 border border-outline px-3 text-xs text-on-surface-variant hover:border-primary sm:flex-none">
            Restart
          </button>
        </div>
      </div>
    </section>
  );
}
