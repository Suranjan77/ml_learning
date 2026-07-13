"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { KeptComparisonButton } from "../KeptComparisonButton";
import type { ExhibitSceneProps } from "../types";
import { enumParam, numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import { vizTokens } from "@/lib/vizTokens";
import { reduced, vizMotion } from "@/lib/vizMotion";
import { TREE_POINTS, leafCount, predictTree, treeAccuracy, type TreeConfig } from "./model";

const WIDTH = 1180; const HEIGHT = 520;
const PLOT = { left: 48, top: 34, width: 700, height: 430 } as const;
const THRESHOLD = { min: 2.5, max: 7, step: 0.1 } as const;
const PRESETS = [
  { depth: 1, threshold: 4, referenceThreshold: null },
  { depth: 2, threshold: 4, referenceThreshold: null },
  { depth: 3, threshold: 4, referenceThreshold: null },
  { depth: 3, threshold: 5.5, referenceThreshold: 4 },
] as const;
const sx = (x: number) => PLOT.left + x / 10 * PLOT.width;
const sy = (y: number) => PLOT.top + (10 - y) / 10 * PLOT.height;

export default function DecisionTreeScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const preset = PRESETS[Math.max(0, Math.min(PRESETS.length - 1, step))];
  const titleId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReduced = useReducedMotion();
  const transition = reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced);
  const [depth, setDepth] = useState<TreeConfig["depth"]>(preset.depth);
  const [threshold, setThreshold] = useState<number>(preset.threshold);
  const [referenceThreshold, setReferenceThreshold] = useState<number | null>(preset.referenceThreshold);
  useEffect(() => { setDepth(preset.depth); setThreshold(preset.threshold); setReferenceThreshold(preset.referenceThreshold); }, [preset, resetKey]);
  useSceneUrlState((params) => {
    const nextDepth = numberParam(params, "depth", { min: 1, max: 3, step: 1 });
    const nextThreshold = numberParam(params, "threshold", THRESHOLD);
    const nextReferenceThreshold = numberParam(params, "refThreshold", THRESHOLD);
    setDepth((nextDepth ?? preset.depth) as TreeConfig["depth"]);
    setThreshold(nextThreshold ?? preset.threshold);
    if (nextReferenceThreshold !== undefined) setReferenceThreshold(nextReferenceThreshold);
    else if (enumParam(params, "compare", ["off"] as const) === "off") setReferenceThreshold(null);
    else setReferenceThreshold(preset.referenceThreshold);
  }, step);
  const sync = (next: { depth?: TreeConfig["depth"]; threshold?: number; referenceThreshold?: number | null }) => {
    const values = { depth, threshold, referenceThreshold, ...next };
    replaceSceneUrlState([
      { key: "depth", value: String(values.depth), defaultValue: String(preset.depth) },
      { key: "threshold", value: String(values.threshold), defaultValue: String(preset.threshold) },
      { key: "compare", value: values.referenceThreshold === null ? "off" : "on", defaultValue: preset.referenceThreshold === null ? "off" : "on" },
      { key: "refThreshold", value: values.referenceThreshold === null ? "" : String(values.referenceThreshold), defaultValue: "" },
    ]);
  };
  const config = { depth, threshold };
  const accuracy = treeAccuracy(config);
  const referenceConfig = referenceThreshold === null ? null : { depth, threshold: referenceThreshold };
  const referenceAccuracy = referenceConfig ? treeAccuracy(referenceConfig) : null;
  const reroutedPointIndices = referenceThreshold === null ? [] : TREE_POINTS.flatMap((point, index) => (
    (point.x < referenceThreshold) !== (point.x < threshold) ? [index] : []
  ));
  const reroutedPointSet = new Set(reroutedPointIndices);
  const changedPredictionCount = referenceConfig ? TREE_POINTS.filter((point) => (
    predictTree(point, referenceConfig) !== predictTree(point, config)
  )).length : 0;
  const grid = Array.from({ length: 20 * 20 }, (_, index) => {
    const column = index % 20; const row = Math.floor(index / 20);
    const point = { x: (column + 0.5) / 2, y: 10 - (row + 0.5) / 2 };
    return { row, column, prediction: predictTree(point, config) };
  });
  const comparisonDescription = referenceThreshold === null
    ? ""
    : ` Compared with kept threshold ${referenceThreshold.toFixed(1)}, ${reroutedPointIndices.length} points change root branch, ${changedPredictionCount} predictions change, and accuracy moves from ${Math.round((referenceAccuracy ?? accuracy) * 100)} to ${Math.round(accuracy * 100)} percent.`;
  const description = `Decision tree with depth ${depth}, ${leafCount(depth)} leaves, root threshold x less than ${threshold.toFixed(1)}, and ${Math.round(accuracy * 100)} percent accuracy.${comparisonDescription}`;

  const chooseThreshold = (next: number) => {
    const rounded = Number(Math.max(THRESHOLD.min, Math.min(THRESHOLD.max, next)).toFixed(1));
    setThreshold(rounded);
    sync({ threshold: rounded });
  };

  const dragThreshold = (event: ReactPointerEvent<SVGLineElement>) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    chooseThreshold((local.x - PLOT.left) / PLOT.width * 10);
  };

  return <section aria-label="Decision tree partition visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">{description}</span>
      <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        {grid.map((cell) => <rect key={`${cell.row}-${cell.column}`} x={PLOT.left + cell.column * PLOT.width / 20} y={PLOT.top + cell.row * PLOT.height / 20} width={PLOT.width / 20 + 0.5} height={PLOT.height / 20 + 0.5} fill={cell.prediction === "A" ? vizTokens.classA : vizTokens.classB} fillOpacity="0.15" />)}
        {referenceThreshold !== null && referenceThreshold !== threshold ? <>
          <rect x={sx(Math.min(referenceThreshold, threshold))} y={PLOT.top} width={Math.abs(sx(referenceThreshold) - sx(threshold))} height={PLOT.height} fill={vizTokens.path} fillOpacity="0.08" />
          <line x1={sx(referenceThreshold)} x2={sx(referenceThreshold)} y1={PLOT.top} y2={PLOT.top + PLOT.height} stroke={vizTokens.mutedInk} strokeWidth="2" strokeDasharray="5 5" />
          <text x={(sx(referenceThreshold) + sx(threshold)) / 2} y={PLOT.top + PLOT.height - 10} textAnchor="middle" fontFamily="var(--font-dm-mono)" fontSize="9" fill={vizTokens.path}>ROOT ROUTE CHANGED</text>
        </> : null}
        <motion.line initial={false} animate={{ x1: sx(threshold), x2: sx(threshold) }} transition={transition} y1={PLOT.top} y2={PLOT.top + PLOT.height} stroke={vizTokens.selection} strokeWidth="4" />
        {depth >= 2 ? <motion.g key={`branches-${depth}`} initial={playing ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={transition}><line x1={PLOT.left} x2={sx(threshold)} y1={sy(6)} y2={sy(6)} stroke={vizTokens.path} strokeWidth="3" /><line x1={sx(threshold)} x2={PLOT.left + PLOT.width} y1={sy(4)} y2={sy(4)} stroke={vizTokens.path} strokeWidth="3" />{depth >= 3 ? <line x1={sx(7.2)} x2={sx(7.2)} y1={PLOT.top} y2={sy(4)} stroke={vizTokens.path} strokeWidth="3" /> : null}</motion.g> : null}
        {TREE_POINTS.map((point, index) => <g key={index}>{reroutedPointSet.has(index) ? <circle cx={sx(point.x)} cy={sy(point.y)} r="12" fill="none" stroke={vizTokens.path} strokeWidth="2" strokeDasharray="3 2" /> : null}<circle cx={sx(point.x)} cy={sy(point.y)} r="7" fill={point.label === "A" ? vizTokens.classA : vizTokens.classB} stroke={predictTree(point, config) === point.label ? vizTokens.pointOutline : vizTokens.error} strokeWidth={predictTree(point, config) === point.label ? 2 : 4} /><text x={sx(point.x)} y={sy(point.y) + 3} textAnchor="middle" fontSize="8" fill={vizTokens.canvas}>{point.label}</text></g>)}
        <rect x={PLOT.left} y={PLOT.top} width={PLOT.width} height={PLOT.height} fill="none" stroke={vizTokens.border} />
        <text x={PLOT.left + 10} y={PLOT.top + 18} fontFamily="var(--font-dm-mono)" fontSize="10" fill={vizTokens.mutedInk}>BACKGROUND = LEAF PREDICTION · RED OUTLINE = MISTAKE</text>
        <line
          x1={sx(threshold)}
          x2={sx(threshold)}
          y1={PLOT.top}
          y2={PLOT.top + PLOT.height}
          stroke="transparent"
          strokeWidth="28"
          cursor="ew-resize"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragThreshold(event); }}
          onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) dragThreshold(event); }}
          onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        />

        <g transform="translate(815 42)" fontFamily="var(--font-dm-mono)">
          <text fontSize="11" fill={vizTokens.mutedInk}>ROUTING RULES</text>
          <rect x="65" y="30" width="200" height="48" fill={vizTokens.canvas} stroke={vizTokens.selection} strokeWidth="2" /><text x="165" y="59" textAnchor="middle" fontSize="12" fill={vizTokens.ink}>x &lt; {threshold.toFixed(1)}?</text>
          {referenceThreshold !== null && referenceThreshold !== threshold ? <text x="275" y="58" fontSize="9" fill={vizTokens.mutedInk}>KEPT x &lt; {referenceThreshold.toFixed(1)}</text> : null}
          <line x1="165" y1="78" x2="80" y2="120" stroke={vizTokens.border} strokeWidth="2" /><line x1="165" y1="78" x2="250" y2="120" stroke={vizTokens.border} strokeWidth="2" />
          <text x="100" y="101" fontSize="9" fill={vizTokens.mutedInk}>YES</text><text x="223" y="101" fontSize="9" fill={vizTokens.mutedInk}>NO</text>
          {depth === 1 ? <><Leaf x={25} y={120} label="A" /><Leaf x={195} y={120} label="B" /></> : <>
            <Node x={5} y={120} label="y < 6?" /><Node x={205} y={120} label="y < 4?" />
            <Leaf x={-5} y={220} label="A" /><Leaf x={95} y={220} label="B" /><Leaf x={195} y={220} label="B" />
            {depth === 2 ? <Leaf x={295} y={220} label="A" /> : <><Node x={275} y={210} label="x < 7.2?" /><Leaf x={245} y={310} label="A" /><Leaf x={345} y={310} label="B" /></>}
          </>}
          <text y="390" fontSize="12" fill={vizTokens.ink}>{leafCount(depth)} LEAVES</text><text x="330" y="390" textAnchor="end" fontSize="12" fill={accuracy === 1 ? vizTokens.classA : vizTokens.error}>{Math.round(accuracy * 100)}% ACCURACY</text>
          {referenceThreshold !== null ? <><text y="414" fontSize="10" fill={vizTokens.path}>{reroutedPointIndices.length} REROUTED AT ROOT</text><text x="330" y="414" textAnchor="end" fontSize="10" fill={changedPredictionCount > 0 ? vizTokens.error : vizTokens.mutedInk}>{changedPredictionCount} PREDICTIONS CHANGED</text></> : null}
        </g>
      </svg>
      <p className="sr-only" aria-live="polite">{description}</p>
    </div>
    <div className="grid grid-cols-[auto_1fr] items-end gap-4 border-t border-outline bg-surface-container-low p-2 sm:px-3">
      <fieldset><legend className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Tree depth</legend><div className="mt-1 flex">{([1, 2, 3] as const).map((value) => <button key={value} type="button" aria-pressed={depth === value} onClick={() => { setDepth(value); sync({ depth: value }); }} className={`min-h-9 border px-4 text-xs ${depth === value ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface"}`}>{value}</button>)}</div></fieldset>
      <label><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Root threshold x</span><span>{threshold.toFixed(1)}</span></span><input aria-label="Root threshold" type="range" {...THRESHOLD} value={threshold} onChange={(event) => chooseThreshold(Number(event.target.value))} />
        <KeptComparisonButton
          active={referenceThreshold !== null}
          activeLabel={`Clear kept threshold ${referenceThreshold?.toFixed(1) ?? threshold.toFixed(1)}`}
          inactiveLabel="Keep this threshold to compare"
          onClick={() => {
            const next = referenceThreshold === null ? threshold : null;
            setReferenceThreshold(next);
            sync({ referenceThreshold: next });
          }}
        />
      </label>
    </div>
  </section>;
}

function Node({ x, y, label }: { x: number; y: number; label: string }) {
  return <g><rect x={x} y={y} width="130" height="42" fill={vizTokens.canvas} stroke={vizTokens.path} /><text x={x + 65} y={y + 26} textAnchor="middle" fontSize="10" fill={vizTokens.ink}>{label}</text></g>;
}

function Leaf({ x, y, label }: { x: number; y: number; label: "A" | "B" }) {
  return <g><rect x={x} y={y} width="80" height="42" fill={label === "A" ? vizTokens.classA : vizTokens.classB} fillOpacity="0.25" stroke={label === "A" ? vizTokens.classA : vizTokens.classB} /><text x={x + 40} y={y + 26} textAnchor="middle" fontSize="10" fill={vizTokens.ink}>LEAF {label}</text></g>;
}
