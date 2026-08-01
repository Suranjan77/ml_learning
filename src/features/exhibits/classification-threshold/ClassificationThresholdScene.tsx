"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { reduced, vizMotion } from "@/lib/vizMotion";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { usePresentMode, useVizStroke, useVizType } from "../presentMode";
import { numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import {
  BASE_RATE_RANGE,
  DEFAULT_BASE_RATE,
  DEFAULT_SEPARATION,
  DEFAULT_THRESHOLD,
  POPULATION,
  SEPARATION_RANGE,
  THRESHOLD_RANGE,
  accuracyOptimalThreshold,
  classMeans,
  f1OptimalThreshold,
  majorityBaseline,
  metricsAt,
  sweep,
} from "./model";

const WIDTH = 1_180; const HEIGHT = 520;

const RARE_BASE_RATE = 0.2;

/**
 * Each step opens on the state that makes its own point without any dragging.
 * The first three sit at the threshold accuracy would choose — the whole
 * argument is that this is a terrible place to be — and the last moves to the
 * threshold that balances the two errors instead. Both are computed rather than
 * hardcoded, so the presets follow the model if its defaults ever change.
 */
const STEP_PRESETS: readonly { threshold: number; baseRate: number }[] = [
  { threshold: accuracyOptimalThreshold(DEFAULT_BASE_RATE, DEFAULT_SEPARATION), baseRate: DEFAULT_BASE_RATE },
  { threshold: accuracyOptimalThreshold(DEFAULT_BASE_RATE, DEFAULT_SEPARATION), baseRate: DEFAULT_BASE_RATE },
  { threshold: accuracyOptimalThreshold(DEFAULT_BASE_RATE, DEFAULT_SEPARATION), baseRate: RARE_BASE_RATE },
  { threshold: f1OptimalThreshold(RARE_BASE_RATE, DEFAULT_SEPARATION), baseRate: RARE_BASE_RATE },
];

function formatCount(value: number): string {
  if (value >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (value >= 1_000) return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (value >= 10) return value.toFixed(0);
  return value.toFixed(1);
}

const percent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export default function ClassificationThresholdScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(STEP_PRESETS.length - 1, step));
  const preset = STEP_PRESETS[activeStep];
  const titleId = useId();
  const prefersReduced = useReducedMotion();
  const presenting = usePresentMode();
  const type = useVizType();
  const stroke = useVizStroke();
  const dragging = useRef(false);

  const [threshold, setThreshold] = useState(preset.threshold);
  const [baseRate, setBaseRate] = useState(preset.baseRate);
  const [separation, setSeparation] = useState(DEFAULT_SEPARATION);

  useEffect(() => {
    setThreshold(preset.threshold);
    setBaseRate(preset.baseRate);
    setSeparation(DEFAULT_SEPARATION);
  }, [preset, resetKey]);

  useSceneUrlState((params) => {
    setThreshold(numberParam(params, "threshold", THRESHOLD_RANGE) ?? preset.threshold);
    setBaseRate(numberParam(params, "rate", BASE_RATE_RANGE) ?? preset.baseRate);
    setSeparation(numberParam(params, "separation", SEPARATION_RANGE) ?? DEFAULT_SEPARATION);
  }, `${activeStep}-${resetKey}`);

  const sync = useCallback((next: { threshold?: number; baseRate?: number; separation?: number }) => {
    const values = { threshold, baseRate, separation, ...next };
    replaceSceneUrlState([
      { key: "threshold", value: values.threshold.toFixed(2), defaultValue: preset.threshold.toFixed(2) },
      { key: "rate", value: String(values.baseRate), defaultValue: String(preset.baseRate) },
      { key: "separation", value: values.separation.toFixed(2), defaultValue: DEFAULT_SEPARATION.toFixed(2) },
    ]);
  }, [baseRate, preset, separation, threshold]);

  const metrics = useMemo(() => metricsAt(threshold, baseRate, separation), [baseRate, separation, threshold]);
  const means = useMemo(() => classMeans(separation), [separation]);
  const curve = useMemo(() => sweep(baseRate, separation, 121), [baseRate, separation]);
  const baseline = majorityBaseline(baseRate);
  const accuracyThreshold = useMemo(() => accuracyOptimalThreshold(baseRate, separation), [baseRate, separation]);
  const f1Threshold = useMemo(() => f1OptimalThreshold(baseRate, separation), [baseRate, separation]);

  const showCells = activeStep >= 1;
  const showCurves = activeStep >= 3;

  // Layout. Presenting widens the readout columns and narrows the plot, because
  // enlarged counts need horizontal room more than the curves need width. The
  // distributions also give up height on the last step, where the two curves
  // come in beneath them.
  const plotHeight = showCurves
    ? (presenting ? 150 : 196)
    : (presenting ? 226 : 296);
  const plot = presenting
    ? { left: 56, top: 84, width: 470, height: plotHeight }
    : { left: 60, top: 60, width: 560, height: plotHeight };
  const matrixX = presenting ? 566 : 664;
  const matrixWidth = presenting ? 330 : 250;
  const readoutX = presenting ? 930 : 950;
  const readoutWidth = presenting ? 228 : 190;

  const sx = useCallback((score: number) => plot.left + score * plot.width, [plot]);

  // Each class curve is normalised to its own peak: at a 1% base rate a true-to-
  // scale attack curve is a flat line, and the shape is what the threshold acts
  // on. The population bar below carries the real proportion.
  const shape = useCallback((mean: number) => {
    const points = Array.from({ length: 97 }, (_, index) => {
      const score = index / 96;
      const height = Math.exp(-((score - mean) ** 2) / (2 * 0.15 * 0.15));
      return `${sx(score).toFixed(1)} ${(plot.top + plot.height - height * plot.height * 0.86).toFixed(1)}`;
    });
    return `M${sx(0).toFixed(1)} ${plot.top + plot.height} L${points.join(" L")} L${sx(1).toFixed(1)} ${plot.top + plot.height} Z`;
  }, [plot, sx]);

  const changeThreshold = (next: number) => {
    const clamped = Math.round(Math.max(0, Math.min(1, next)) * 100) / 100;
    setThreshold(clamped);
    sync({ threshold: clamped });
  };

  const thresholdFromPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return threshold;
    const matrix = svg.getScreenCTM();
    let viewX: number;
    if (matrix && typeof svg.createSVGPoint === "function") {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      viewX = point.matrixTransform(matrix.inverse()).x;
    } else {
      const bounds = svg.getBoundingClientRect();
      if (bounds.width === 0) return threshold;
      viewX = (event.clientX - bounds.left) / bounds.width * WIDTH;
    }
    return (viewX - plot.left) / plot.width;
  };

  const cells = [
    { label: "CAUGHT", sub: "true positive", value: metrics.truePositives, tone: vizTokens.classA, row: 0, column: 0 },
    { label: "FALSE ALARM", sub: "false positive", value: metrics.falsePositives, tone: vizTokens.error, row: 0, column: 1 },
    { label: "MISSED", sub: "false negative", value: metrics.falseNegatives, tone: vizTokens.error, row: 1, column: 0 },
    { label: "CORRECTLY IGNORED", sub: "true negative", value: metrics.trueNegatives, tone: vizTokens.mutedInk, row: 1, column: 1 },
  ] as const;

  const cellWidth = matrixWidth / 2;
  // Sized from what a cell must hold, so enlarged counts cannot clip the
  // sub-label against the cell border.
  const cellHeight = type.label * 3.2 + type.value * 1.5 + type.micro * 1.7;
  const matrixTop = plot.top + type.caption * 2.2;

  // The sentence the exhibit exists to produce, computed rather than authored.
  const verdict = metrics.recall < 0.5
    ? `Accuracy ${percent(metrics.accuracy, 2)} — but ${formatCount(metrics.falseNegatives)} of ${formatCount(metrics.truePositives + metrics.falseNegatives)} attacks were missed.`
    : metrics.precision < 0.25
      ? `Recall ${percent(metrics.recall)} — but ${percent(metrics.falseAlarmShare)} of every alert is a false alarm.`
      : `Recall ${percent(metrics.recall)} at precision ${percent(metrics.precision)} — ${formatCount(metrics.alerts)} alerts to triage.`;

  const readout = [
    { label: "ACCURACY", value: percent(metrics.accuracy, 2), tone: vizTokens.ink, note: `do-nothing scores ${percent(baseline, 2)}` },
    { label: "RECALL", value: percent(metrics.recall), tone: vizTokens.classA, note: "depends on the model only" },
    { label: "PRECISION", value: percent(metrics.precision), tone: vizTokens.error, note: "depends on the base rate too" },
  ];

  // A readout row must clear its own label, value and note before it is allowed
  // to share the plot's vertical rhythm, or enlarged notes run into the next label.
  const rowStep = Math.max(
    type.label * 2.4 + type.valueStrong * 1.25 + type.micro * 1.8,
    (plot.height + 40) / 3.4,
  );

  return <section aria-label="Classification threshold visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="relative min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">Two overlapping score distributions split by a draggable alert threshold, with the resulting confusion matrix and metrics</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />

        {/* Score distributions */}
        <text x={plot.left} y={plot.top - type.label * 1.4} fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>DETECTOR SCORE</text>
        <path d={shape(means.benign)} fill={vizTokens.classA} fillOpacity="0.16" stroke={vizTokens.classA} strokeWidth={stroke.contour} />
        <path d={shape(means.attack)} fill={vizTokens.error} fillOpacity="0.2" stroke={vizTokens.error} strokeWidth={stroke.contour} />
        <line x1={plot.left} x2={plot.left + plot.width} y1={plot.top + plot.height} y2={plot.top + plot.height} stroke={vizTokens.axis} strokeWidth={stroke.hairline} />
        <text x={plot.left} y={plot.top + plot.height + type.label * 1.9} fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.classA}>BENIGN</text>
        <text x={plot.left + plot.width} y={plot.top + plot.height + type.label * 1.9} textAnchor="end" fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.error}>ATTACK</text>

        {/* Everything at or above the threshold becomes an alert. */}
        <rect x={sx(threshold)} y={plot.top} width={Math.max(0, plot.left + plot.width - sx(threshold))} height={plot.height} fill={vizTokens.selection} opacity="0.07" />
        <motion.g initial={false} animate={{ x: sx(threshold) }} transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)}>
          <line y1={plot.top - type.label * 0.6} y2={plot.top + plot.height} stroke={vizTokens.selection} strokeWidth={stroke.markerStrong} />
          <rect x={-type.label * 3.9} y={plot.top - type.label * 2.7} width={type.label * 7.8} height={type.label * 2.1} fill={vizTokens.selection} />
          <text y={plot.top - type.label * 1.2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.canvas}>ALERT ≥ {threshold.toFixed(2)}</text>
        </motion.g>

        {/* True proportion of the two classes, which the scaled curves hide. */}
        <g transform={`translate(${plot.left} ${plot.top + plot.height + type.label * 3.4})`}>
          <rect width={plot.width} height={type.label * 1.5} fill={vizTokens.classA} opacity="0.5" />
          <rect width={Math.max(1.5, plot.width * (baseRate / 100))} height={type.label * 1.5} fill={vizTokens.error} />
          <text y={type.label * 3} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>TRUE MIX · {baseRate.toFixed(1)}% ATTACK ({formatCount(POPULATION * baseRate / 100)} OF {formatCount(POPULATION)}) · CURVES ABOVE ARE EACH SCALED TO THEIR OWN CLASS</text>
        </g>

        {/* Confusion matrix */}
        {showCells ? <g>
          <text x={matrixX} y={plot.top - type.label * 1.4} fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>WHAT THE THRESHOLD ACTUALLY DID</text>
          {cells.map((cell) => (
            <g key={cell.label} transform={`translate(${matrixX + cell.column * cellWidth} ${matrixTop + cell.row * cellHeight})`}>
              <rect width={cellWidth - 6} height={cellHeight - 6} fill={vizTokens.canvas} stroke={cell.tone} strokeWidth={stroke.hairline} opacity="0.9" />
              <text x={type.label} y={type.label * 2} fontFamily="var(--font-mono)" fontSize={type.micro} fill={cell.tone}>{cell.label}</text>
              <motion.text
                key={`${cell.label}-value`}
                initial={false}
                x={type.label}
                y={type.label * 2 + type.value * 1.5}
                fontFamily="var(--font-mono)"
                fontSize={type.value}
                fill={cell.tone}
              >{formatCount(cell.value)}</motion.text>
              <text x={type.label} y={type.label * 2 + type.value * 1.5 + type.micro * 1.7} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>{cell.sub}</text>
            </g>
          ))}
        </g> : null}

        {/* Metric readout */}
        <g transform={`translate(${readoutX} ${plot.top})`}>
          {readout.map((entry, index) => (
            <g key={entry.label} transform={`translate(0 ${index * rowStep})`}>
              <text fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>{entry.label}</text>
              <text y={type.valueStrong * 1.25} fontFamily="var(--font-mono)" fontSize={type.valueStrong} fill={entry.tone}>{entry.value}</text>
              <text y={type.valueStrong * 1.25 + type.micro * 1.8} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>{entry.note}</text>
            </g>
          ))}
        </g>

        {/* ROC and precision–recall, side by side: the same sweep, judged twice. */}
        {showCurves ? <g transform={`translate(${plot.left} ${plot.top + plot.height + type.label * 9})`}>
          {[
            { title: "ROC · IGNORES BASE RATE", x: (point: typeof curve[number]) => point.falsePositiveRate, y: (point: typeof curve[number]) => point.truePositiveRate, tone: vizTokens.mutedInk },
            { title: "PRECISION–RECALL · DOES NOT", x: (point: typeof curve[number]) => point.truePositiveRate, y: (point: typeof curve[number]) => point.precision, tone: vizTokens.error },
          ].map((chart, index) => {
            const size = Math.min(HEIGHT - (plot.top + plot.height + type.label * 11.4), 118);
            const originX = index * (size + type.label * 12);
            const px = (value: number) => originX + value * size;
            const py = (value: number) => size - value * size;
            const path = curve.map((point, i) => `${i === 0 ? "M" : "L"}${px(chart.x(point)).toFixed(1)} ${py(chart.y(point)).toFixed(1)}`).join(" ");
            const here = { x: chart.x({ ...curve[0], ...metricsPoint(metrics) }), y: chart.y({ ...curve[0], ...metricsPoint(metrics) }) };
            return (
              <g key={chart.title}>
                <rect x={originX} width={size} height={size} fill="none" stroke={vizTokens.grid} strokeWidth={stroke.hairline} />
                <path d={path} fill="none" stroke={chart.tone} strokeWidth={stroke.contourStrong} />
                <circle cx={px(here.x)} cy={py(here.y)} r={stroke.markerStrong * 1.6} fill={vizTokens.selection} stroke={vizTokens.canvas} strokeWidth={stroke.marker} />
                <text x={originX} y={size + type.micro * 2} fontFamily="var(--font-mono)" fontSize={type.micro} fill={chart.tone}>{chart.title}</text>
              </g>
            );
          })}
        </g> : null}

        {/* The verdict, computed from the current state. */}
        <g transform={`translate(${showCurves ? readoutX : plot.left} ${showCurves ? plot.top + rowStep * 3 + type.label * 2 : HEIGHT - type.caption * 3.4})`}>
          <rect x={-type.label} y={-type.caption * 1.6} width={showCurves ? readoutWidth + type.label * 2 : WIDTH - plot.left * 2} height={type.caption * 3.4} fill={vizTokens.selection} opacity="0.08" />
          <text fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.selection}>
            {showCurves
              ? `${formatCount(metrics.alerts)} ALERTS · ${percent(metrics.falseAlarmShare)} FALSE`
              : verdict}
          </text>
        </g>

        {/* Drag surface sits last so it captures the pointer across the plot. */}
        <rect
          data-testid="threshold-drag-surface"
          x={plot.left}
          y={plot.top - type.label * 3}
          width={plot.width}
          height={plot.height + type.label * 3}
          fill="transparent"
          className="cursor-ew-resize touch-none"
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            changeThreshold(thresholdFromPointer(event));
          }}
          onPointerMove={(event) => { if (dragging.current) changeThreshold(thresholdFromPointer(event)); }}
          onPointerUp={(event) => {
            dragging.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { dragging.current = false; }}
          onLostPointerCapture={() => { dragging.current = false; }}
        />
      </svg>
      <p className="sr-only" aria-live="polite">
        Threshold {threshold.toFixed(2)}, base rate {baseRate.toFixed(1)} percent. Accuracy {percent(metrics.accuracy, 2)}, recall {percent(metrics.recall)}, precision {percent(metrics.precision)}. {formatCount(metrics.truePositives)} attacks caught, {formatCount(metrics.falseNegatives)} missed, {formatCount(metrics.falsePositives)} false alarms.
      </p>
    </div>

    <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:px-3">
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Alert threshold</span><span className="text-primary">{threshold.toFixed(2)}</span></span>
        <input aria-label="Alert threshold" type="range" min={THRESHOLD_RANGE.min} max={THRESHOLD_RANGE.max} step={THRESHOLD_RANGE.step} value={threshold} onChange={(event) => changeThreshold(Number(event.target.value))} />
      </label>
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Attack base rate</span><span className="text-error">{baseRate.toFixed(1)}%</span></span>
        <input aria-label="Attack base rate" type="range" min={BASE_RATE_RANGE.min} max={BASE_RATE_RANGE.max} step={BASE_RATE_RANGE.step} value={baseRate} onChange={(event) => { const next = Number(event.target.value); setBaseRate(next); sync({ baseRate: next }); }} />
      </label>
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Model separation</span><span>{separation.toFixed(2)}</span></span>
        <input aria-label="Model separation" type="range" min={SEPARATION_RANGE.min} max={SEPARATION_RANGE.max} step={SEPARATION_RANGE.step} value={separation} onChange={(event) => { const next = Number(event.target.value); setSeparation(next); sync({ separation: next }); }} />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => changeThreshold(accuracyOptimalThreshold(baseRate, separation))} className="min-h-9 shrink-0 border border-outline bg-surface px-3 text-xs" title={`Threshold ${accuracyThreshold.toFixed(2)}`}>Best accuracy</button>
        <button type="button" onClick={() => changeThreshold(f1OptimalThreshold(baseRate, separation))} className="min-h-9 shrink-0 border border-primary bg-primary px-3 text-xs text-on-primary" title={`Threshold ${f1Threshold.toFixed(2)}`}>Best balance</button>
      </div>
    </div>
  </section>;
}

/** Current operating point in the coordinates both curves are drawn in. */
function metricsPoint(metrics: { recall: number; precision: number; specificity: number }) {
  return {
    falsePositiveRate: 1 - metrics.specificity,
    truePositiveRate: metrics.recall,
    precision: metrics.precision,
  };
}
