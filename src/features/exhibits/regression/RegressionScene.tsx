"use client";

import { useEffect, useId, useMemo, useState } from "react";
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

export default function RegressionScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const preset = PRESETS[Math.max(0, Math.min(PRESETS.length - 1, step))];
  const titleId = useId();
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
  });

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
  const heatCells = useMemo(() => {
    const cells = [];
    const count = 15;
    let max = 0;
    for (let row = 0; row < count; row += 1) for (let column = 0; column < count; column += 1) {
      const cellSlope = SLOPE.min + (column + 0.5) / count * (SLOPE.max - SLOPE.min);
      const cellIntercept = INTERCEPT.max - (row + 0.5) / count * (INTERCEPT.max - INTERCEPT.min);
      const loss = lossFor(mode, cellSlope, cellIntercept);
      max = Math.max(max, loss); cells.push({ row, column, loss });
    }
    return cells.map((cell) => ({ ...cell, intensity: Math.sqrt(Math.min(1, cell.loss / max)) }));
  }, [mode]);

  const description = mode === "linear"
    ? `Linear fit with slope ${slope.toFixed(2)}, intercept ${intercept.toFixed(2)}, and mean squared loss ${currentLoss.toFixed(3)}.`
    : `Logistic boundary with slope ${slope.toFixed(2)}, intercept ${intercept.toFixed(2)}, loss ${currentLoss.toFixed(3)}, and ${Math.round((accuracy ?? 0) * 100)} percent accuracy.`;

  return <section aria-label="Regression parameter visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">{description}</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
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

        <text x={MAP.left} y={32} fontFamily="var(--font-dm-mono)" fontSize="11" fill={vizTokens.mutedInk}>THE SAME PARAMETERS ON THE LOSS MAP</text>
        {heatCells.map((cell) => <rect key={`${cell.row}-${cell.column}`} x={MAP.left + cell.column * MAP.width / 15} y={MAP.top + cell.row * MAP.height / 15} width={MAP.width / 15 + 0.5} height={MAP.height / 15 + 0.5} fill={vizTokens.error} fillOpacity={0.08 + cell.intensity * 0.72} />)}
        <rect x={MAP.left} y={MAP.top} width={MAP.width} height={MAP.height} fill="none" stroke={vizTokens.border} />
        <motion.circle initial={false} animate={{ cx: mx(slope), cy: my(intercept) }} transition={transition} r="10" fill={vizTokens.canvas} stroke={vizTokens.selection} strokeWidth="5" />
        <text x={MAP.left} y={MAP.top + MAP.height + 24} fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>SLOPE −1.5</text><text x={MAP.left + MAP.width} y={MAP.top + MAP.height + 24} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>+1.5</text>
        <text x={MAP.left} y={MAP.top + MAP.height + 54} fontFamily="var(--font-dm-mono)" fontSize="12" fill={vizTokens.ink}>LOSS {currentLoss.toFixed(3)}</text>
        {accuracy !== null ? <text x={MAP.left + MAP.width} y={MAP.top + MAP.height + 54} textAnchor="end" fontFamily="var(--font-dm-mono)" fontSize="12" fill={vizTokens.classA}>ACCURACY {Math.round(accuracy * 100)}%</text> : null}
      </svg>
      <p className="sr-only" aria-live="polite">{description}</p>
    </div>
    <div className="grid grid-cols-[auto_1fr_1fr] items-end gap-3 border-t border-outline bg-surface-container-low p-2 sm:px-3">
      <fieldset><legend className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Model</legend><div className="mt-1 flex">{(["linear", "logistic"] as const).map((item) => <button key={item} type="button" aria-pressed={mode === item} onClick={() => { setMode(item); sync({ mode: item }); }} className={`min-h-9 border px-3 text-xs capitalize ${mode === item ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface"}`}>{item}</button>)}</div></fieldset>
      <label><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Slope</span><span>{slope.toFixed(2)}</span></span><input aria-label="Slope" type="range" {...SLOPE} value={slope} onChange={(event) => { const next = Number(event.target.value); setSlope(next); sync({ slope: next }); }} /></label>
      <label><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Intercept</span><span>{intercept.toFixed(2)}</span></span><input aria-label="Intercept" type="range" {...INTERCEPT} value={intercept} onChange={(event) => { const next = Number(event.target.value); setIntercept(next); sync({ intercept: next }); }} /></label>
    </div>
  </section>;
}
