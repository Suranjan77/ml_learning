"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { usePresentMode, useVizStroke, useVizType } from "../presentMode";
import { enumParam, numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import {
  DATASET,
  DEFAULT_LEARNERS,
  DEFAULT_METHOD,
  DOMAIN,
  LEARNER_RANGE,
  METHODS,
  decisionGrid,
  ensemble,
  singleStumpAccuracy,
  trainingAccuracy,
  trueBoundaryY,
  type Method,
} from "./model";

const WIDTH = 1_180; const HEIGHT = 520;

/** Each step opens on the state that makes its own point without any dragging. */
const STEP_PRESETS: readonly { learners: number; method: Method }[] = [
  { learners: DEFAULT_LEARNERS, method: DEFAULT_METHOD },
  { learners: 12, method: "boosting" },
  { learners: 12, method: "bagging" },
  { learners: 30, method: "bagging" },
];

const BASELINE = singleStumpAccuracy();
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export default function EnsemblesScene({ step, resetKey }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(STEP_PRESETS.length - 1, step));
  const preset = STEP_PRESETS[activeStep];
  const titleId = useId();
  const presenting = usePresentMode();
  const type = useVizType();
  const stroke = useVizStroke();

  const [learners, setLearners] = useState(preset.learners);
  const [method, setMethod] = useState<Method>(preset.method);

  useEffect(() => {
    setLearners(preset.learners);
    setMethod(preset.method);
  }, [preset, resetKey]);

  useSceneUrlState((params) => {
    setLearners(numberParam(params, "depth", LEARNER_RANGE) ?? preset.learners);
    setMethod(enumParam(params, "mode", METHODS) ?? preset.method);
  }, `${activeStep}-${resetKey}`);

  const sync = useCallback((next: Partial<{ depth: number; mode: Method }>) => {
    const values = { depth: learners, mode: method, ...next };
    replaceSceneUrlState([
      { key: "depth", value: String(values.depth), defaultValue: String(preset.learners) },
      { key: "mode", value: values.mode, defaultValue: preset.method },
    ]);
  }, [learners, method, preset]);

  const committee = useMemo(() => ensemble(method, learners), [learners, method]);
  const surface = useMemo(() => decisionGrid(committee, 44, 26), [committee]);
  const accuracy = useMemo(() => trainingAccuracy(committee), [committee]);
  const rival = useMemo(
    () => trainingAccuracy(ensemble(method === "boosting" ? "bagging" : "boosting", learners)),
    [learners, method],
  );

  const plot = presenting
    ? { left: 56, top: 66, width: 640, height: 322 }
    : { left: 60, top: 62, width: 700, height: 344 };
  const readoutX = presenting ? 742 : 812;
  const readoutWidth = presenting ? 380 : 308;

  const sx = useCallback((x: number) =>
    plot.left + ((x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * plot.width, [plot]);
  const sy = useCallback((y: number) =>
    plot.top + plot.height - ((y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * plot.height, [plot]);

  const cellWidth = plot.width / surface.columns;
  const cellHeight = plot.height / surface.rows;

  const verdict = learners === 1
    ? "One stump: the best straight cut available, and still wrong in two corners."
    : accuracy > rival
      ? `${learners} ${method} stumps reach ${percent(accuracy)} — ${percent(accuracy - rival)} ahead of ${method === "boosting" ? "bagging" : "boosting"} on the same budget.`
      : accuracy < rival
        ? `${learners} ${method} stumps reach ${percent(accuracy)} — ${percent(rival - accuracy)} behind ${method === "boosting" ? "bagging" : "boosting"} on the same budget.`
        : `${learners} stumps reach ${percent(accuracy)} either way at this budget.`;

  const readout = [
    { label: "ENSEMBLE ACCURACY", value: percent(accuracy), tone: vizTokens.selection, note: `${learners} ${learners === 1 ? "stump" : "stumps"}, ${method}` },
    { label: "ONE STUMP ALONE", value: percent(BASELINE), tone: vizTokens.mutedInk, note: "the floor every method starts from" },
    { label: method === "boosting" ? "BAGGING, SAME BUDGET" : "BOOSTING, SAME BUDGET", value: percent(rival), tone: vizTokens.path, note: "identical number of stumps" },
  ];

  // Monospace advance is about 0.6em, so the band can size its own wrapping.
  const verdictLimit = Math.max(24, Math.floor(plot.width / (type.caption * 0.6)));

  const rowStep = Math.max(
    type.label * 2.4 + type.valueStrong * 1.25 + type.micro * 1.8,
    (plot.height - type.caption * 6) / 3,
  );

  return <section aria-label="Bagging and boosting visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="relative min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">A feature space with two classes, the combined decision surface of an ensemble of decision stumps, and each stump&apos;s individual cut</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        <text x={plot.left} y={plot.top - type.label * 1.5} fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>
          COMBINED DECISION SURFACE · EVERY CUT IS AXIS-ALIGNED
        </text>

        {/* The committee's vote margin, cell by cell. */}
        <g>
          {surface.cells.map((margin, index) => {
            const column = index % surface.columns;
            const row = Math.floor(index / surface.columns);
            return (
              <rect
                key={index}
                x={plot.left + column * cellWidth}
                y={plot.top + plot.height - (row + 1) * cellHeight}
                width={cellWidth + 0.6}
                height={cellHeight + 0.6}
                fill={margin >= 0 ? vizTokens.classA : vizTokens.classB}
                opacity={0.08 + Math.min(0.3, Math.abs(margin) * 0.42)}
              />
            );
          })}
        </g>

        {/* Each stump's own cut, drawn faintly: the parts the vote is made of. */}
        <g opacity="0.5">
          {committee.map((stump, index) => (
            <line
              key={`${stump.feature}-${stump.threshold}-${index}`}
              x1={stump.feature === 0 ? sx(stump.threshold) : plot.left}
              x2={stump.feature === 0 ? sx(stump.threshold) : plot.left + plot.width}
              y1={stump.feature === 0 ? plot.top : sy(stump.threshold)}
              y2={stump.feature === 0 ? plot.top + plot.height : sy(stump.threshold)}
              stroke={vizTokens.path}
              strokeWidth={stroke.hairline}
            />
          ))}
        </g>

        {/* The boundary the stumps are trying to approximate but cannot draw. */}
        <line
          x1={sx(DOMAIN.xMin)}
          y1={sy(trueBoundaryY(DOMAIN.xMin))}
          x2={sx(DOMAIN.xMax)}
          y2={sy(trueBoundaryY(DOMAIN.xMax))}
          stroke={vizTokens.ink}
          strokeWidth={stroke.guide}
          strokeDasharray="8 6"
          opacity="0.55"
        />

        {DATASET.map((point, index) => (
          <circle
            key={index}
            cx={sx(point.x)}
            cy={sy(point.y)}
            r={presenting ? 5.4 : 4.6}
            fill={point.label === 1 ? vizTokens.classA : vizTokens.classB}
            stroke={vizTokens.pointOutline}
            strokeWidth={stroke.marker}
          />
        ))}

        <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} fill="none" stroke={vizTokens.border} strokeWidth={stroke.hairline} />
        <text x={plot.left} y={plot.top + plot.height + type.label * 2} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.ink} opacity="0.7">- - TRUE BOUNDARY</text>
        <text x={plot.left + plot.width} y={plot.top + plot.height + type.label * 2} textAnchor="end" fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.path}>EACH LINE IS ONE STUMP&apos;S CUT</text>


        {/* The computed sentence, given the width it needs. */}
        <g transform={`translate(${plot.left} ${plot.top + plot.height + type.label * 4.6})`}>
          <rect x={-type.label} y={-type.caption * 1.5} width={plot.width + type.label * 2} height={type.caption * (1.6 + 1.5 * Math.max(1, wrapText(verdict, verdictLimit).length))} fill={vizTokens.selection} opacity="0.08" />
          {wrapText(verdict, verdictLimit).map((line, index) => (
            <text key={line} y={index * type.caption * 1.5} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.selection}>{line}</text>
          ))}
        </g>

        {/* Readout */}
        <g transform={`translate(${readoutX} ${plot.top})`}>
          {readout.map((entry, index) => (
            <g key={entry.label} transform={`translate(0 ${index * rowStep})`}>
              <text fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>{entry.label}</text>
              <text y={type.valueStrong * 1.25} fontFamily="var(--font-mono)" fontSize={type.valueStrong} fill={entry.tone}>{entry.value}</text>
              <text y={type.valueStrong * 1.25 + type.micro * 1.8} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>{entry.note}</text>
            </g>
          ))}

          {/* Vote weights: equal under bagging, decaying under boosting. */}
          <g transform={`translate(0 ${rowStep * 3})`}>
            <text fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>VOTE WEIGHT PER STUMP</text>
            {(() => {
              const maxWeight = Math.max(...committee.map((stump) => stump.weight), 1e-6);
              const barWidth = readoutWidth / Math.max(committee.length, 1);
              const barHeight = type.label * 3.4;
              return committee.map((stump, index) => (
                <rect
                  key={index}
                  x={index * barWidth}
                  y={type.micro + barHeight - (stump.weight / maxWeight) * barHeight}
                  width={Math.max(1.5, barWidth - 1.5)}
                  height={(stump.weight / maxWeight) * barHeight}
                  fill={vizTokens.path}
                  opacity="0.85"
                />
              ));
            })()}
            <text y={type.micro + type.label * 5} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>
              {method === "boosting" ? "EARLIER STUMPS EARN A LOUDER VOTE" : "EVERY STUMP VOTES EQUALLY"}
            </text>
          </g>

        </g>
      </svg>
      <p className="sr-only" aria-live="polite">
        {learners} {method} stumps. Ensemble accuracy {percent(accuracy)}. A single stump alone reaches {percent(BASELINE)}. The same number of {method === "boosting" ? "bagged" : "boosted"} stumps reaches {percent(rival)}.
      </p>
    </div>

    <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-[2fr_auto] sm:items-end sm:px-3">
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Weak learners</span><span className="text-primary">{learners}</span></span>
        <input aria-label="Weak learners" type="range" min={LEARNER_RANGE.min} max={LEARNER_RANGE.max} step={LEARNER_RANGE.step} value={learners} onChange={(event) => { const next = Number(event.target.value); setLearners(next); sync({ depth: next }); }} />
      </label>
      <div className="flex gap-2">
        {METHODS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={method === candidate}
            onClick={() => { setMethod(candidate); sync({ mode: candidate }); }}
            className={`min-h-9 shrink-0 border px-3 text-xs capitalize ${method === candidate ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface hover:border-primary"}`}
          >{candidate}</button>
        ))}
      </div>
    </div>
  </section>;
}

/** Wrap onto short lines; SVG text does not wrap on its own. */
function wrapText(text: string, limit: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    if (current && (current + " " + word).length > limit) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}
