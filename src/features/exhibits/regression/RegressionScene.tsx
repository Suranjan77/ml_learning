"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ExhibitSceneProps } from "../types";
import { enumParam, numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import { vizTokens } from "@/lib/vizTokens";
import { reduced, vizMotion } from "@/lib/vizMotion";
import {
  CLASSIFICATION_POINTS,
  REGRESSION_POINTS,
  classificationAccuracy,
  lossFor,
  predictLinear,
  type RegressionMode,
} from "./model";

const WIDTH = 1180; const HEIGHT = 520;
const PLOT = { left: 54, top: 34, width: 650, height: 430 } as const;
const MAP = { left: 790, top: 60, width: 330, height: 330 } as const;
const SLOPE = { min: -1.5, max: 1.5, step: 0.05 } as const;
const INTERCEPT = { min: -2, max: 2, step: 0.05 } as const;
const PRESETS = [
  { mode: "linear", slope: -0.45, intercept: 1.2 },
  { mode: "linear", slope: 0.55, intercept: 1.2 },
  { mode: "linear", slope: 0.78, intercept: 0.42 },
  { mode: "logistic", slope: 0.2, intercept: 0.8 },
] as const satisfies readonly { mode: RegressionMode; slope: number; intercept: number }[];

const sx = (x: number) => PLOT.left + ((x + 5) / 10) * PLOT.width;
const sy = (y: number) => PLOT.top + ((5 - y) / 10) * PLOT.height;
const mx = (slope: number) => MAP.left + ((slope - SLOPE.min) / (SLOPE.max - SLOPE.min)) * MAP.width;
const my = (intercept: number) => MAP.top + ((INTERCEPT.max - intercept) / (INTERCEPT.max - INTERCEPT.min)) * MAP.height;

interface ContourSegment {
  from: readonly [number, number];
  to: readonly [number, number];
}

function interpolateEdge(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  threshold: number,
): readonly [number, number] {
  const amount = Math.abs(to[2] - from[2]) < 1e-9 ? 0.5 : (threshold - from[2]) / (to[2] - from[2]);
  return [from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount];
}

function contourSegments(values: number[][], threshold: number): ContourSegment[] {
  const segments: ContourSegment[] = [];
  const rows = values.length - 1;
  const columns = values[0].length - 1;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const corners = [
        [column, row, values[row][column]],
        [column + 1, row, values[row][column + 1]],
        [column + 1, row + 1, values[row + 1][column + 1]],
        [column, row + 1, values[row + 1][column]],
      ] as const;
      const crossings: Array<readonly [number, number]> = [];
      for (let edge = 0; edge < 4; edge += 1) {
        const from = corners[edge];
        const to = corners[(edge + 1) % 4];
        if ((from[2] <= threshold) !== (to[2] <= threshold)) {
          crossings.push(interpolateEdge(from, to, threshold));
        }
      }
      if (crossings.length === 2) segments.push({ from: crossings[0], to: crossings[1] });
      if (crossings.length === 4) {
        segments.push({ from: crossings[0], to: crossings[1] });
        segments.push({ from: crossings[2], to: crossings[3] });
      }
    }
  }
  return segments;
}

export default function RegressionScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const preset = PRESETS[Math.max(0, Math.min(PRESETS.length - 1, step))];
  const titleId = useId();
  const instructionId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReduced = useReducedMotion();
  const transition = reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced);
  const [mode, setMode] = useState<RegressionMode>(preset.mode);
  const [slope, setSlope] = useState<number>(preset.slope);
  const [intercept, setIntercept] = useState<number>(preset.intercept);

  useEffect(() => {
    setMode(preset.mode); setSlope(preset.slope); setIntercept(preset.intercept);
  }, [preset, resetKey]);

  useSceneUrlState((params) => {
    const nextMode = enumParam(params, "mode", ["linear", "logistic"] as const);
    const nextSlope = numberParam(params, "slope", SLOPE);
    const nextIntercept = numberParam(params, "intercept", INTERCEPT);
    if (nextMode !== undefined) setMode(nextMode);
    if (nextSlope !== undefined) setSlope(nextSlope);
    if (nextIntercept !== undefined) setIntercept(nextIntercept);
  }, step);

  const sync = (next: { mode?: RegressionMode; slope?: number; intercept?: number }) => {
    const values = { mode, slope, intercept, ...next };
    replaceSceneUrlState([
      { key: "mode", value: values.mode, defaultValue: preset.mode },
      { key: "slope", value: String(values.slope), defaultValue: String(preset.slope) },
      { key: "intercept", value: String(values.intercept), defaultValue: String(preset.intercept) },
    ]);
  };

  const currentLoss = lossFor(mode, slope, intercept);
  const accuracy = mode === "logistic" ? classificationAccuracy(slope, intercept) : null;
  const lossField = useMemo(() => {
    const count = 24;
    const values = Array.from({ length: count + 1 }, (_, row) =>
      Array.from({ length: count + 1 }, (_, column) => {
        const cellSlope = SLOPE.min + column / count * (SLOPE.max - SLOPE.min);
        const cellIntercept = INTERCEPT.max - row / count * (INTERCEPT.max - INTERCEPT.min);
        return lossFor(mode, cellSlope, cellIntercept);
      }),
    );
    const sorted = values.flat().sort((a, b) => a - b);
    const minimum = sorted[0];
    const maximum = sorted[sorted.length - 1];
    const thresholds = [0.12, 0.28, 0.5, 0.72].map((quantile) => sorted[Math.floor((sorted.length - 1) * quantile)]);
    const cells = Array.from({ length: count * count }, (_, index) => {
      const row = Math.floor(index / count);
      const column = index % count;
      const cellSlope = SLOPE.min + (column + 0.5) / count * (SLOPE.max - SLOPE.min);
      const cellIntercept = INTERCEPT.max - (row + 0.5) / count * (INTERCEPT.max - INTERCEPT.min);
      const loss = lossFor(mode, cellSlope, cellIntercept);
      const intensity = (Math.log1p(loss - minimum) / Math.max(Math.log1p(maximum - minimum), 1e-9));
      return { row, column, intensity };
    });
    return {
      cells,
      count,
      contours: thresholds.map((threshold) => ({ threshold, segments: contourSegments(values, threshold) })),
    };
  }, [mode]);

  function chooseParametersFromLocalPoint(localX: number, localY: number) {
    if (localX < MAP.left || localX > MAP.left + MAP.width || localY < MAP.top || localY > MAP.top + MAP.height) return;
    const rawSlope = SLOPE.min + ((localX - MAP.left) / MAP.width) * (SLOPE.max - SLOPE.min);
    const rawIntercept = INTERCEPT.max - ((localY - MAP.top) / MAP.height) * (INTERCEPT.max - INTERCEPT.min);
    const nextSlope = Number((Math.round(rawSlope / SLOPE.step) * SLOPE.step).toFixed(2));
    const nextIntercept = Number((Math.round(rawIntercept / INTERCEPT.step) * INTERCEPT.step).toFixed(2));
    setSlope(nextSlope);
    setIntercept(nextIntercept);
    sync({ slope: nextSlope, intercept: nextIntercept });
  }

  function chooseParametersFromPointer(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(matrix.inverse());
      chooseParametersFromLocalPoint(local.x, local.y);
      return;
    }
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    chooseParametersFromLocalPoint(
      ((event.clientX - rect.left) / rect.width) * WIDTH,
      ((event.clientY - rect.top) / rect.height) * HEIGHT,
    );
  }

  const description = mode === "linear"
    ? `Linear fit with slope ${slope.toFixed(2)}, intercept ${intercept.toFixed(2)}, and mean squared loss ${currentLoss.toFixed(3)}.`
    : `Logistic boundary with slope ${slope.toFixed(2)}, intercept ${intercept.toFixed(2)}, loss ${currentLoss.toFixed(3)}, and ${Math.round((accuracy ?? 0) * 100)} percent accuracy.`;

  return <section aria-label="Regression parameter visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} aria-describedby={instructionId} className="relative min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">{description}</span>
      <span id={instructionId} className="sr-only">Drag across the loss map to change slope and intercept together, or use the sliders below.</span>
      <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full touch-none" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        {Array.from({ length: 11 }, (_, index) => <line key={`v${index}`} x1={sx(-5 + index)} x2={sx(-5 + index)} y1={PLOT.top} y2={PLOT.top + PLOT.height} stroke={vizTokens.grid} />)}
        {Array.from({ length: 11 }, (_, index) => <line key={`h${index}`} x1={PLOT.left} x2={PLOT.left + PLOT.width} y1={sy(-5 + index)} y2={sy(-5 + index)} stroke={vizTokens.grid} />)}
        {mode === "linear" ? REGRESSION_POINTS.map((point, index) => {
          const predicted = predictLinear(point.x, slope, intercept);
          return <g key={index}><motion.line initial={false} x1={sx(point.x)} x2={sx(point.x)} y1={sy(point.y)} animate={{ y2: sy(predicted) }} transition={transition} stroke={vizTokens.error} strokeDasharray="3 3" opacity="0.55" /><circle cx={sx(point.x)} cy={sy(point.y)} r="5" fill={vizTokens.classA} stroke={vizTokens.pointOutline} strokeWidth="2" /></g>;
        }) : CLASSIFICATION_POINTS.map((point, index) => <g key={index}><circle cx={sx(point.x)} cy={sy(point.y)} r="7" fill={point.label === 1 ? vizTokens.classA : vizTokens.classB} stroke={vizTokens.pointOutline} strokeWidth="2" /><text x={sx(point.x)} y={sy(point.y) + 3} textAnchor="middle" fontSize="8" fill={vizTokens.canvas}>{point.label}</text></g>)}
        <motion.line initial={false} x1={sx(-5)} x2={sx(5)} animate={{ y1: sy(predictLinear(-5, slope, intercept)), y2: sy(predictLinear(5, slope, intercept)) }} transition={transition} stroke={vizTokens.selection} strokeWidth="5" />
        <rect x={PLOT.left} y={PLOT.top} width={PLOT.width} height={PLOT.height} fill="none" stroke={vizTokens.border} />
        <text x={PLOT.left + 10} y={PLOT.top + 18} fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>{mode === "linear" ? "RESIDUAL LENGTH CONTRIBUTES TO SQUARED LOSS" : "ABOVE LINE → CLASS 1 · BELOW LINE → CLASS 0"}</text>

        <text x={MAP.left} y={28} fontFamily="var(--font-dm-mono)" fontSize="11" fill={vizTokens.mutedInk}>LOSS CONTOURS · DRAG THE CROSSHAIR</text>
        <text x={MAP.left + MAP.width} y={46} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="9" fill={vizTokens.mutedInk}>LIGHT LOW LOSS → DARK HIGH LOSS</text>
        {lossField.cells.map((cell) => <rect key={`${cell.row}-${cell.column}`} x={MAP.left + cell.column * MAP.width / lossField.count} y={MAP.top + cell.row * MAP.height / lossField.count} width={MAP.width / lossField.count + 0.5} height={MAP.height / lossField.count + 0.5} fill={vizTokens.error} fillOpacity={0.04 + cell.intensity * 0.68} />)}
        {lossField.contours.map((contour, contourIndex) => (
          <path
            key={contour.threshold}
            d={contour.segments.map((segment) => {
              const x1 = MAP.left + segment.from[0] / lossField.count * MAP.width;
              const y1 = MAP.top + segment.from[1] / lossField.count * MAP.height;
              const x2 = MAP.left + segment.to[0] / lossField.count * MAP.width;
              const y2 = MAP.top + segment.to[1] / lossField.count * MAP.height;
              return `M ${x1} ${y1} L ${x2} ${y2}`;
            }).join(" ")}
            fill="none"
            stroke={vizTokens.canvas}
            strokeWidth={contourIndex === 0 ? 2.4 : 1.3}
            opacity={0.55 + contourIndex * 0.1}
          />
        ))}
        <rect x={MAP.left} y={MAP.top} width={MAP.width} height={MAP.height} fill="none" stroke={vizTokens.border} />
        <motion.line initial={false} animate={{ x1: mx(slope), x2: mx(slope) }} transition={transition} y1={MAP.top} y2={MAP.top + MAP.height} stroke={vizTokens.selection} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
        <motion.line initial={false} animate={{ y1: my(intercept), y2: my(intercept) }} transition={transition} x1={MAP.left} x2={MAP.left + MAP.width} stroke={vizTokens.selection} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
        <motion.circle initial={false} animate={{ cx: mx(slope), cy: my(intercept) }} transition={transition} r="10" fill={vizTokens.canvas} stroke={vizTokens.selection} strokeWidth="5" />
        <text x={MAP.left - 13} y={MAP.top + 4} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="9" fill={vizTokens.mutedInk}>+2</text>
        <text x={MAP.left - 13} y={MAP.top + MAP.height / 2 + 3} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="9" fill={vizTokens.mutedInk}>0</text>
        <text x={MAP.left - 13} y={MAP.top + MAP.height + 3} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="9" fill={vizTokens.mutedInk}>−2</text>
        <text x={MAP.left - 40} y={MAP.top + MAP.height / 2} transform={`rotate(-90 ${MAP.left - 40} ${MAP.top + MAP.height / 2})`} textAnchor="middle" fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>INTERCEPT b</text>
        <text x={MAP.left} y={MAP.top + MAP.height + 24} fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>−1.5</text>
        <text x={MAP.left + MAP.width / 2} y={MAP.top + MAP.height + 24} textAnchor="middle" fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>SLOPE m = 0</text>
        <text x={MAP.left + MAP.width} y={MAP.top + MAP.height + 24} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>+1.5</text>
        <text x={MAP.left} y={MAP.top + MAP.height + 54} fontFamily="var(--font-dm-mono)" fontSize="12" fill={vizTokens.ink}>LOSS {currentLoss.toFixed(3)}</text>
        {accuracy !== null ? <text x={MAP.left + MAP.width} y={MAP.top + MAP.height + 54} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="12" fill={vizTokens.classA}>ACCURACY {Math.round(accuracy * 100)}%</text> : null}
        <rect
          x={MAP.left}
          y={MAP.top}
          width={MAP.width}
          height={MAP.height}
          fill="transparent"
          className="cursor-crosshair"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            chooseParametersFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) chooseParametersFromPointer(event);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
        />
      </svg>
      <div aria-hidden="true" className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-3 border border-outline bg-surface/95 p-2 font-mono text-[9px] uppercase tracking-[0.06em] sm:hidden">
        <span className="text-on-surface-variant">Crosshair (m, b) = ({slope.toFixed(2)}, {intercept.toFixed(2)})</span>
        <span className="text-accent">Loss {currentLoss.toFixed(3)}{accuracy === null ? "" : ` · ${Math.round(accuracy * 100)}%`}</span>
      </div>
      <p className="sr-only" aria-live="polite">{description}</p>
    </div>
    <div className="grid grid-cols-[auto_1fr_1fr] items-end gap-3 border-t border-outline bg-surface-container-low p-2 sm:px-3">
      <fieldset><legend className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Model</legend><div className="mt-1 flex">{(["linear", "logistic"] as const).map((item) => <button key={item} type="button" aria-pressed={mode === item} onClick={() => { setMode(item); sync({ mode: item }); }} className={`min-h-9 border px-3 text-xs capitalize ${mode === item ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface"}`}>{item}</button>)}</div></fieldset>
      <label><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Slope</span><span>{slope.toFixed(2)}</span></span><input aria-label="Slope" type="range" {...SLOPE} value={slope} onChange={(event) => { const next = Number(event.target.value); setSlope(next); sync({ slope: next }); }} /></label>
      <label><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Intercept</span><span>{intercept.toFixed(2)}</span></span><input aria-label="Intercept" type="range" {...INTERCEPT} value={intercept} onChange={(event) => { const next = Number(event.target.value); setIntercept(next); sync({ intercept: next }); }} /></label>
    </div>
  </section>;
}
