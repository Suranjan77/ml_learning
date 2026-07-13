"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { FILTERS, INPUT, convolve, dotProduct, maxPool, patchAt, relu, type FilterKind, type Matrix } from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;

function fillFor(value: number, maximum: number) {
  if (value === 0) return vizTokens.canvas;
  return value > 0 ? vizTokens.classA : vizTokens.classB;
}

function MatrixGrid({ matrix, x, y, size, selected, onSelect, label }: {
  matrix: Matrix;
  x: number;
  y: number;
  size: number;
  selected?: { row: number; column: number; span?: number };
  onSelect?: (row: number, column: number) => void;
  label: string;
}) {
  const maximum = Math.max(1, ...matrix.flat().map(Math.abs));
  return <g>
    <text x={x} y={y - 12} fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>{label}</text>
    {matrix.map((row, rowIndex) => row.map((value, columnIndex) => {
      const active = selected && rowIndex >= selected.row && rowIndex < selected.row + (selected.span ?? 1) && columnIndex >= selected.column && columnIndex < selected.column + (selected.span ?? 1);
      return <g key={`${rowIndex}-${columnIndex}`} onClick={() => onSelect?.(rowIndex, columnIndex)} className={onSelect ? "cursor-pointer" : undefined}>
        <rect x={x + columnIndex * size} y={y + rowIndex * size} width={size - 2} height={size - 2} fill={fillFor(value, maximum)} fillOpacity={value === 0 ? 1 : 0.2 + 0.8 * Math.abs(value) / maximum} stroke={active ? vizTokens.path : vizTokens.grid} strokeWidth={active ? 3 : 1} />
        {size >= 35 ? <text x={x + columnIndex * size + (size - 2) / 2} y={y + rowIndex * size + size / 2 + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={Math.abs(value) / maximum > 0.62 ? vizTokens.pointOutline : vizTokens.ink}>{value}</text> : null}
      </g>;
    }))}
  </g>;
}

export default function CnnScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(3, step));
  const titleId = useId();
  const [filter, setFilter] = useState<FilterKind>(activeStep === 2 ? "horizontal" : "vertical");
  const [selected, setSelected] = useState({ row: 1, column: 2 });
  const [scanning, setScanning] = useState(activeStep === 1);

  useEffect(() => {
    setFilter(activeStep === 2 ? "horizontal" : "vertical");
    setSelected({ row: 1, column: 2 });
    setScanning(activeStep === 1);
  }, [activeStep, resetKey]);

  useEffect(() => {
    if (!playing || activeStep >= 3) return;
    setScanning(true);
    return () => setScanning(false);
  }, [activeStep, playing]);

  useEffect(() => {
    if (!scanning || activeStep >= 3) return;
    const timer = window.setTimeout(() => setSelected((current) => {
      const next = (current.row * 6 + current.column + 1) % 36;
      return { row: Math.floor(next / 6), column: next % 6 };
    }), 420);
    return () => window.clearTimeout(timer);
  }, [activeStep, scanning, selected]);

  const kernel = FILTERS[filter];
  const raw = useMemo(() => convolve(INPUT, kernel), [kernel]);
  const activated = useMemo(() => relu(raw), [raw]);
  const pooled = useMemo(() => maxPool(activated), [activated]);
  const patch = patchAt(INPUT, selected.row, selected.column);
  const response = dotProduct(patch, kernel);
  const shownOutput = activeStep >= 2 ? activated : raw;
  const stageLabel = activeStep === 0 ? "INPUT" : activeStep === 1 ? "RAW FEATURE MAP" : activeStep === 2 ? "AFTER ReLU" : "POOLED MAP";

  return (
    <section aria-label="CNN convolution visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div role="img" aria-labelledby={titleId} className="min-h-0 overflow-x-auto overflow-y-hidden">
        <span id={titleId} className="sr-only">Convolutional neural network feature-map calculation</span>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-w-[700px] sm:min-w-0 sm:w-full" aria-hidden="true">
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
          <MatrixGrid matrix={INPUT} x={38} y={78} size={45} selected={{ ...selected, span: 3 }} label="8×8 INPUT IMAGE" />
          <path d="M408 240 H466" stroke={vizTokens.axis} strokeWidth="2" /><path d="M466 240 l-9 -5 v10 z" fill={vizTokens.axis} />
          <MatrixGrid matrix={kernel} x={485} y={116} size={52} label={`${filter.toUpperCase()} 3×3 FILTER`} />
          <text x="563" y="302" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>SLIDE + DOT PRODUCT</text>
          <path d="M654 240 H712" stroke={vizTokens.axis} strokeWidth="2" /><path d="M712 240 l-9 -5 v10 z" fill={vizTokens.axis} />
          {activeStep < 3 ? <MatrixGrid matrix={shownOutput} x={733} y={92} size={48} selected={selected} onSelect={(row, column) => { setScanning(false); setSelected({ row, column }); }} label={`6×6 ${stageLabel}`} /> : <MatrixGrid matrix={pooled} x={785} y={140} size={72} label={`3×3 ${stageLabel}`} />}

          <g transform="translate(38 460)">
            <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>SELECTED CELL [{selected.row}, {selected.column}]</text>
            <text x="258" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>Σ patch × filter = {response}</text>
            {activeStep >= 2 ? <text x="485" fontFamily="var(--font-mono)" fontSize="10" fill={response < 0 ? vizTokens.error : vizTokens.classA}>ReLU({response}) = {Math.max(0, response)}</text> : null}
            {activeStep === 3 ? <text x="735" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>2×2 max → one value</text> : null}
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-outline bg-surface-container-low px-3 py-2">
        <span className="mr-1 font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Filter</span>
        {(Object.keys(FILTERS) as FilterKind[]).map((kind) => <button key={kind} type="button" aria-pressed={filter === kind} onClick={() => setFilter(kind)} className={`min-h-9 border px-3 text-xs capitalize ${filter === kind ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface"}`}>{kind}</button>)}
        {activeStep < 3 ? <button type="button" aria-pressed={scanning} onClick={() => setScanning((value) => !value)} className={`min-h-9 border px-3 text-xs ${scanning ? "border-accent bg-accent text-on-accent" : "border-outline bg-surface"}`}>{scanning ? "Pause scan" : "Scan image"}</button> : null}
        <p className="ml-auto hidden max-w-lg text-xs text-on-surface-variant md:block">Click an output cell to reveal the exact 3×3 input patch that produced it.</p><span className="ml-auto font-mono text-[9px] uppercase text-on-surface-variant sm:hidden">Swipe diagram →</span>
      </div>
    </section>
  );
}
