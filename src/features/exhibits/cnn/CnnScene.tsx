"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { enumParam, numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import { FILTERS, INPUT, convolve, dotProduct, maxPool, patchAt, relu, type FilterKind, type Matrix } from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const DEFAULT_SELECTED: { row: number; column: number } = { row: 1, column: 2 };

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
  const defaultFilter: FilterKind = activeStep === 2 ? "horizontal" : "vertical";
  const titleId = useId();
  const instructionId = useId();
  const diagramRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterKind>(defaultFilter);
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [scanning, setScanning] = useState(activeStep === 1);
  const [mobilePanel, setMobilePanel] = useState<"input" | "filter" | "output">(activeStep >= 2 ? "output" : activeStep === 1 ? "filter" : "input");

  const showMobilePanel = (panel: "input" | "filter" | "output") => {
    setMobilePanel(panel);
    const diagram = diagramRef.current;
    if (!diagram) return;
    const maximum = diagram.scrollWidth - diagram.clientWidth;
    const left = panel === "input" ? 0 : panel === "filter" ? maximum / 2 : maximum;
    diagram.scrollTo({ left, behavior: "smooth" });
  };

  const syncControls = (nextFilter: FilterKind, nextSelected: { row: number; column: number }) => {
    replaceSceneUrlState([
      { key: "filter", value: nextFilter, defaultValue: defaultFilter },
      { key: "row", value: String(nextSelected.row), defaultValue: String(DEFAULT_SELECTED.row) },
      { key: "column", value: String(nextSelected.column), defaultValue: String(DEFAULT_SELECTED.column) },
    ]);
  };

  const chooseFilter = (nextFilter: FilterKind) => {
    setFilter(nextFilter);
    syncControls(nextFilter, selected);
  };

  const chooseCell = (row: number, column: number) => {
    const nextSelected = {
      row: Math.max(0, Math.min(5, row)),
      column: Math.max(0, Math.min(5, column)),
    };
    setScanning(false);
    setSelected(nextSelected);
    syncControls(filter, nextSelected);
  };

  const moveCell = (event: KeyboardEvent<HTMLDivElement>) => {
    if (activeStep >= 3) return;
    const deltas: Partial<Record<string, readonly [number, number]>> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    chooseCell(selected.row + delta[0], selected.column + delta[1]);
  };

  useEffect(() => {
    setFilter(defaultFilter);
    setSelected(DEFAULT_SELECTED);
    setScanning(activeStep === 1);
  }, [activeStep, defaultFilter, resetKey]);

  useEffect(() => {
    const panel = activeStep >= 2 ? "output" : activeStep === 1 ? "filter" : "input";
    setMobilePanel(panel);
    const frame = window.requestAnimationFrame(() => {
      const diagram = diagramRef.current;
      if (!diagram) return;
      const maximum = diagram.scrollWidth - diagram.clientWidth;
      diagram.scrollLeft = panel === "input" ? 0 : panel === "filter" ? maximum / 2 : maximum;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeStep, resetKey]);

  useSceneUrlState((params) => {
    const restoredRow = numberParam(params, "row", { min: 0, max: 5, step: 1 });
    const restoredColumn = numberParam(params, "column", { min: 0, max: 5, step: 1 });
    setFilter(enumParam(params, "filter", ["vertical", "horizontal", "sharpen"] as const) ?? defaultFilter);
    setSelected({
      row: restoredRow ?? DEFAULT_SELECTED.row,
      column: restoredColumn ?? DEFAULT_SELECTED.column,
    });
    if (restoredRow !== undefined || restoredColumn !== undefined) setScanning(false);
  }, `${activeStep}-${resetKey}`);

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
  const products = patch.map((row, rowIndex) =>
    row.map((value, columnIndex) => value * kernel[rowIndex][columnIndex]),
  );
  const response = dotProduct(patch, kernel);
  const shownOutput = activeStep >= 2 ? activated : raw;
  const stageLabel = activeStep === 0 ? "INPUT" : activeStep === 1 ? "RAW FEATURE MAP" : activeStep === 2 ? "AFTER ReLU" : "POOLED MAP";

  return (
    <section aria-label="CNN convolution visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <span id={titleId} className="sr-only">Convolutional neural network feature-map calculation</span>
      <span id={instructionId} className="sr-only">Use the arrow keys to move the selected output cell and its matching three by three input patch.</span>
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] sm:block">
        <div className="grid min-h-10 grid-cols-3 border-b border-outline bg-surface-container-low font-mono text-[9px] uppercase tracking-[0.08em] sm:hidden" aria-label="CNN diagram stage">
          {(["input", "filter", "output"] as const).map((panel, index) => (
            <button key={panel} type="button" aria-pressed={mobilePanel === panel} onClick={() => showMobilePanel(panel)} className={`border-r border-outline px-1 last:border-r-0 ${mobilePanel === panel ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>
              {index + 1} · {panel}
            </button>
          ))}
        </div>
        <div
          ref={diagramRef}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={instructionId}
          tabIndex={0}
          onKeyDown={moveCell}
          onScroll={(event) => {
            const element = event.currentTarget;
            const progress = element.scrollLeft / Math.max(1, element.scrollWidth - element.clientWidth);
            setMobilePanel(progress < 0.25 ? "input" : progress > 0.75 ? "output" : "filter");
          }}
          className="min-h-0 overflow-x-auto overflow-y-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-w-[700px] sm:min-w-0 sm:w-full" aria-hidden="true">
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
          <MatrixGrid matrix={INPUT} x={38} y={78} size={45} selected={{ ...selected, span: 3 }} label="8×8 INPUT IMAGE" />
          <path d="M408 240 H466" stroke={vizTokens.axis} strokeWidth="2" /><path d="M466 240 l-9 -5 v10 z" fill={vizTokens.axis} />
          <MatrixGrid matrix={kernel} x={485} y={116} size={52} label={`${filter.toUpperCase()} 3×3 FILTER`} />
          <text x="563" y="292" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>THE SAME NINE WEIGHTS SLIDE</text>
          {activeStep < 3 ? (
            <>
              <MatrixGrid matrix={products} x={498} y={326} size={43} label="SELECTED PATCH × FILTER" />
              <path d="M488 318 H637" stroke={vizTokens.path} strokeWidth="1" strokeDasharray="4 4" />
              <text x="563" y="476" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.path}>Σ NINE PRODUCTS = {response}</text>
            </>
          ) : null}
          <path d={activeStep < 3 ? "M654 240 H712" : "M654 240 H684"} stroke={vizTokens.axis} strokeWidth="2" /><path d={activeStep < 3 ? "M712 240 l-9 -5 v10 z" : "M684 240 l-9 -5 v10 z"} fill={vizTokens.axis} />
          {activeStep < 3 ? (
            <MatrixGrid matrix={shownOutput} x={733} y={92} size={48} selected={selected} onSelect={chooseCell} label={`6×6 ${stageLabel}`} />
          ) : (
            <>
              <MatrixGrid matrix={activated} x={700} y={116} size={39} label="6×6 AFTER ReLU" />
              {Array.from({ length: 9 }, (_, index) => {
                const row = Math.floor(index / 3);
                const column = index % 3;
                return (
                  <g key={`pool-source-${index}`}>
                    <rect x={700 + column * 78 - 2} y={116 + row * 78 - 2} width="78" height="78" fill="none" stroke={vizTokens.path} strokeWidth="2" strokeDasharray="5 3" />
                    <text x={706 + column * 78} y={130 + row * 78} fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.path}>{index + 1}</text>
                  </g>
                );
              })}
              <path d="M941 234 H962" stroke={vizTokens.axis} strokeWidth="2" />
              <path d="M962 234 l-8 -5 v10 z" fill={vizTokens.axis} />
              <text x="951" y="219" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>MAX</text>
              <MatrixGrid matrix={pooled} x={974} y={145} size={60} label="3×3 POOLED MAP" />
              <text x="817" y="372" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>NINE OUTLINED 2×2 BLOCKS</text>
              <text x="1064" y="350" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>ONE MAX FROM EACH BLOCK</text>
            </>
          )}

          <g transform="translate(38 460)">
            <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>SELECTED CELL [{selected.row}, {selected.column}]</text>
            {activeStep >= 2 && activeStep < 3 ? <text x="695" fontFamily="var(--font-mono)" fontSize="10" fill={response < 0 ? vizTokens.error : vizTokens.classA}>RAW {response} → ReLU → {Math.max(0, response)}</text> : null}
            {activeStep === 3 ? <text x="447" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>SAME ACTIVATION MAP → LESS POSITION DETAIL</text> : null}
          </g>
          </svg>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{filter} filter. Selected output cell row {selected.row}, column {selected.column}. Patch dot product {response}. {activeStep >= 2 ? `ReLU output ${Math.max(0, response)}.` : "Raw response shown."}</p>

      <div className="flex flex-wrap items-center gap-2 border-t border-outline bg-surface-container-low px-3 py-2">
        <span className="mr-1 font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Filter</span>
        {(Object.keys(FILTERS) as FilterKind[]).map((kind) => <button key={kind} type="button" aria-pressed={filter === kind} onClick={() => chooseFilter(kind)} className={`min-h-9 border px-3 text-xs capitalize ${filter === kind ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface"}`}>{kind}</button>)}
        {activeStep < 3 ? <button type="button" aria-pressed={scanning} onClick={() => setScanning((value) => !value)} className={`min-h-9 border px-3 text-xs ${scanning ? "border-accent bg-accent text-on-accent" : "border-outline bg-surface"}`}>{scanning ? "Pause scan" : "Scan image"}</button> : null}
        <p className="ml-auto hidden max-w-lg text-xs text-on-surface-variant md:block">Click an output cell to reveal the exact 3×3 input patch that produced it.</p><span className="ml-auto font-mono text-[9px] uppercase text-on-surface-variant sm:hidden">Stages above</span>
      </div>
    </section>
  );
}
