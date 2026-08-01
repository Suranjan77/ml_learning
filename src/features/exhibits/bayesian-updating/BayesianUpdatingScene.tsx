"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { usePresentMode, useVizStroke, useVizType } from "../presentMode";
import { numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import {
  DEFAULT_OBSERVATIONS,
  DEFAULT_OBSERVED_RATE,
  DEFAULT_PRIOR_MEAN,
  DEFAULT_PRIOR_STRENGTH,
  OBSERVATION_RANGE,
  OBSERVED_RATE_RANGE,
  PRIOR_MEAN_RANGE,
  PRIOR_STRENGTH_RANGE,
  credibleInterval,
  describe,
  grid,
  likelihoodCurve,
  peakOf,
  update,
} from "./model";

const WIDTH = 1_180; const HEIGHT = 520;

/** Each step opens on the state that makes its own point without any dragging. */
const STEP_PRESETS: readonly { observations: number; strength: number }[] = [
  { observations: DEFAULT_OBSERVATIONS, strength: DEFAULT_PRIOR_STRENGTH },
  { observations: 10, strength: DEFAULT_PRIOR_STRENGTH },
  { observations: 200, strength: DEFAULT_PRIOR_STRENGTH },
  { observations: 40, strength: 80 },
];

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export default function BayesianUpdatingScene({ step, resetKey }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(STEP_PRESETS.length - 1, step));
  const preset = STEP_PRESETS[activeStep];
  const titleId = useId();
  const presenting = usePresentMode();
  const type = useVizType();
  const stroke = useVizStroke();

  const [priorMean, setPriorMean] = useState(DEFAULT_PRIOR_MEAN);
  const [priorStrength, setPriorStrength] = useState(preset.strength);
  const [observations, setObservations] = useState(preset.observations);
  const [observedRate, setObservedRate] = useState(DEFAULT_OBSERVED_RATE);

  useEffect(() => {
    setPriorMean(DEFAULT_PRIOR_MEAN);
    setPriorStrength(preset.strength);
    setObservations(preset.observations);
    setObservedRate(DEFAULT_OBSERVED_RATE);
  }, [preset, resetKey]);

  useSceneUrlState((params) => {
    setPriorMean(numberParam(params, "mean", PRIOR_MEAN_RANGE) ?? DEFAULT_PRIOR_MEAN);
    setPriorStrength(numberParam(params, "strength", PRIOR_STRENGTH_RANGE) ?? preset.strength);
    setObservations(numberParam(params, "n", OBSERVATION_RANGE) ?? preset.observations);
    setObservedRate(numberParam(params, "rate", OBSERVED_RATE_RANGE) ?? DEFAULT_OBSERVED_RATE);
  }, `${activeStep}-${resetKey}`);

  const sync = useCallback((next: Partial<{ mean: number; strength: number; n: number; rate: number }>) => {
    const values = { mean: priorMean, strength: priorStrength, n: observations, rate: observedRate, ...next };
    replaceSceneUrlState([
      { key: "mean", value: values.mean.toFixed(2), defaultValue: DEFAULT_PRIOR_MEAN.toFixed(2) },
      { key: "strength", value: String(values.strength), defaultValue: String(preset.strength) },
      { key: "n", value: String(values.n), defaultValue: String(preset.observations) },
      { key: "rate", value: values.rate.toFixed(2), defaultValue: DEFAULT_OBSERVED_RATE.toFixed(2) },
    ]);
  }, [observations, observedRate, preset, priorMean, priorStrength]);

  const result = useMemo(
    () => update(priorMean, priorStrength, observations, observedRate),
    [observations, observedRate, priorMean, priorStrength],
  );
  const priorShape = useMemo(() => describe(result.prior), [result.prior]);
  const posteriorShape = useMemo(() => describe(result.posterior), [result.posterior]);
  const likelihood = useMemo(
    () => likelihoodCurve(result.successes, result.failures),
    [result.failures, result.successes],
  );
  const interval = useMemo(() => credibleInterval(result.posterior), [result.posterior]);

  // Marker labels stack above the plot, so the plot starts low enough for the
  // deepest lane to sit inside the frame.
  const plot = presenting
    ? { left: 60, top: 104, width: 700, height: 244 }
    : { left: 62, top: 84, width: 760, height: 286 };
  const readoutX = presenting ? 806 : 872;
  const readoutWidth = presenting ? 316 : 250;

  const peak = peakOf(priorShape.density, posteriorShape.density, likelihood);
  const sx = useCallback((rate: number) => plot.left + rate * plot.width, [plot]);
  const sy = useCallback(
    (density: number) => plot.top + plot.height - (density / peak) * plot.height * 0.9,
    [peak, plot],
  );

  const pathFor = useCallback((density: readonly number[]) =>
    density
      .map((value, index) => `${index === 0 ? "M" : "L"}${sx(grid[index]).toFixed(1)} ${sy(value).toFixed(1)}`)
      .join(" "), [sx, sy]);

  const areaFor = useCallback((density: readonly number[]) =>
    `${pathFor(density)} L${sx(1).toFixed(1)} ${plot.top + plot.height} L${sx(0).toFixed(1)} ${plot.top + plot.height} Z`,
    [pathFor, plot, sx]);

  const hasData = observations > 0;

  // The sentence the exhibit exists to produce, computed rather than authored.
  const verdict = !hasData
    ? "No observations yet — the posterior is the prior."
    : result.dataInfluence > 0.85
      ? `The data has taken over: the posterior sits ${percent(result.dataInfluence)} of the way from your prior to what ${observations} observations say.`
      : result.dataInfluence < 0.35
        ? `Your prior is holding: ${observations} observations moved the posterior only ${percent(result.dataInfluence)} of the way towards them.`
        : `${observations} observations moved the posterior ${percent(result.dataInfluence)} of the way from your prior towards the data.`;

  /**
   * The three estimates converge as evidence accumulates — which is the point —
   * so their labels have to be able to sit on separate lines rather than on top
   * of one another at exactly the moment the exhibit is making its case.
   */
  const markers = useMemo(() => {
    const entries = [
      { at: priorShape.mean, tone: vizTokens.mutedInk, label: "PRIOR MEAN", dashed: true },
      ...(result.maximumLikelihood !== null
        ? [{ at: result.maximumLikelihood, tone: vizTokens.path, label: "MAX LIKELIHOOD", dashed: true }]
        : []),
      { at: posteriorShape.mean, tone: vizTokens.selection, label: "POSTERIOR MEAN", dashed: false },
    ].sort((a, b) => a.at - b.at);

    const occupied: number[] = [];
    return entries.map((entry) => {
      const halfWidth = (entry.label.length * 0.62 * type.micro) / 2;
      const centre = plot.left + entry.at * plot.width;
      let lane = 0;
      while (occupied[lane] !== undefined && centre - halfWidth < occupied[lane]) lane += 1;
      occupied[lane] = centre + halfWidth + type.micro;
      return { ...entry, lane };
    });
  }, [plot, posteriorShape.mean, priorShape.mean, result.maximumLikelihood, type.micro]);

  const readout = [
    { label: "PRIOR", value: percent(priorShape.mean), tone: vizTokens.mutedInk, note: `worth ${priorStrength} observations` },
    {
      label: "MAX LIKELIHOOD",
      value: result.maximumLikelihood === null ? "—" : percent(result.maximumLikelihood),
      tone: vizTokens.path,
      note: hasData ? `${result.successes} of ${observations} observations` : "nothing observed yet",
    },
    {
      label: "POSTERIOR",
      value: percent(posteriorShape.mean),
      tone: vizTokens.selection,
      note: `95% credible ${interval[0].toFixed(2)}–${interval[1].toFixed(2)}`,
    },
  ];

  const rowStep = Math.max(
    type.label * 2.4 + type.valueStrong * 1.25 + type.micro * 1.8,
    (plot.height + 30) / 3.3,
  );

  // A bar showing which of the two sources the posterior actually listened to.
  const influenceY = plot.top + plot.height + type.label * 6.2;

  return <section aria-label="Bayesian updating visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="relative min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">A prior distribution, the likelihood of the observed data, and the resulting posterior over an unknown rate</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />

        

        {/* Baseline and axis ticks */}
        <line x1={plot.left} x2={plot.left + plot.width} y1={plot.top + plot.height} y2={plot.top + plot.height} stroke={vizTokens.axis} strokeWidth={stroke.hairline} />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={sx(tick)} x2={sx(tick)} y1={plot.top} y2={plot.top + plot.height} stroke={vizTokens.grid} strokeWidth={stroke.hairline} />
            <text x={sx(tick)} y={plot.top + plot.height + type.label * 1.9} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>{tick.toFixed(2)}</text>
          </g>
        ))}

        {/* Prior, likelihood, posterior on one shared vertical scale */}
        <path d={areaFor(priorShape.density)} fill={vizTokens.mutedInk} fillOpacity="0.1" stroke={vizTokens.mutedInk} strokeWidth={stroke.contour} strokeDasharray="6 5" />
        {hasData ? (
          <path d={pathFor(likelihood)} fill="none" stroke={vizTokens.path} strokeWidth={stroke.contourStrong} strokeDasharray="3 4" />
        ) : null}
        <path d={areaFor(posteriorShape.density)} fill={vizTokens.selection} fillOpacity="0.16" stroke={vizTokens.selection} strokeWidth={stroke.path} />

        {/* Where each source says the rate is */}
        {markers.map((marker) => (
          <g key={marker.label}>
            <line
              x1={sx(marker.at)}
              x2={sx(marker.at)}
              y1={plot.top - type.label * 0.3}
              y2={plot.top + plot.height}
              stroke={marker.tone}
              strokeWidth={marker.dashed ? stroke.guide : stroke.markerStrong}
              strokeDasharray={marker.dashed ? "5 5" : undefined}
            />
            <text
              x={sx(marker.at)}
              y={plot.top - type.label * 1.4 - marker.lane * type.micro * 1.6}
              textAnchor={marker.at > 0.82 ? "end" : marker.at < 0.18 ? "start" : "middle"}
              fontFamily="var(--font-mono)"
              fontSize={type.micro}
              fill={marker.tone}
            >{marker.label}</text>
          </g>
        ))}

        {/* Legend, placed under the axis where it cannot cover a curve */}
        <g transform={`translate(${plot.left} ${plot.top + plot.height + type.label * 3.9})`}>
          {[
            { label: "PRIOR", tone: vizTokens.mutedInk, dash: "6 5" },
            { label: "LIKELIHOOD OF THE DATA", tone: vizTokens.path, dash: "3 4" },
            { label: "POSTERIOR", tone: vizTokens.selection, dash: undefined },
          ].map((entry, index) => (
            <g key={entry.label} transform={`translate(${index * type.label * 15} 0)`}>
              <line x1="0" x2={type.label * 2.4} y1={-type.label * 0.35} y2={-type.label * 0.35} stroke={entry.tone} strokeWidth={stroke.contourStrong} strokeDasharray={entry.dash} />
              <text x={type.label * 3} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>{entry.label}</text>
            </g>
          ))}
        </g>

        {/* How much of a hearing the data actually got */}
        <g transform={`translate(${plot.left} ${influenceY})`}>
          <text fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>WHO THE POSTERIOR LISTENED TO</text>
          <rect y={type.micro * 0.9} width={plot.width} height={type.label * 1.4} fill={vizTokens.mutedInk} opacity="0.22" />
          <rect y={type.micro * 0.9} width={plot.width * result.dataInfluence} height={type.label * 1.4} fill={vizTokens.path} opacity="0.85" />
          <text y={type.micro * 0.9 + type.label * 2.9} fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.mutedInk}>PRIOR {percent(1 - result.dataInfluence)}</text>
          <text x={plot.width} y={type.micro * 0.9 + type.label * 2.9} textAnchor="end" fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.path}>DATA {percent(result.dataInfluence)}</text>
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
          <g transform={`translate(0 ${rowStep * 3})`}>
            <rect x={-type.label} y={-type.caption * 1.5} width={readoutWidth + type.label * 2} height={type.caption * 5.2} fill={vizTokens.selection} opacity="0.08" />
            {wrapVerdict(verdict, presenting ? 30 : 30).map((line, index) => (
              <text key={line} y={index * type.caption * 1.5} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.selection}>{line}</text>
            ))}
          </g>
        </g>
      </svg>
      <p className="sr-only" aria-live="polite">
        Prior mean {percent(priorShape.mean)} worth {priorStrength} observations. {observations} observations, {result.successes} successes. Posterior mean {percent(posteriorShape.mean)}, 95 percent credible interval {interval[0].toFixed(2)} to {interval[1].toFixed(2)}. Data influence {percent(result.dataInfluence)}.
      </p>
    </div>

    <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-4 sm:items-end sm:px-3">
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Prior belief</span><span>{percent(priorMean)}</span></span>
        <input aria-label="Prior belief" type="range" min={PRIOR_MEAN_RANGE.min} max={PRIOR_MEAN_RANGE.max} step={PRIOR_MEAN_RANGE.step} value={priorMean} onChange={(event) => { const next = Number(event.target.value); setPriorMean(next); sync({ mean: next }); }} />
      </label>
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Prior strength</span><span>{priorStrength}</span></span>
        <input aria-label="Prior strength" type="range" min={PRIOR_STRENGTH_RANGE.min} max={PRIOR_STRENGTH_RANGE.max} step={PRIOR_STRENGTH_RANGE.step} value={priorStrength} onChange={(event) => { const next = Number(event.target.value); setPriorStrength(next); sync({ strength: next }); }} />
      </label>
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Observations</span><span className="text-primary">{observations}</span></span>
        <input aria-label="Observations" type="range" min={OBSERVATION_RANGE.min} max={OBSERVATION_RANGE.max} step={OBSERVATION_RANGE.step} value={observations} onChange={(event) => { const next = Number(event.target.value); setObservations(next); sync({ n: next }); }} />
      </label>
      <label className="min-w-0">
        <span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Observed rate</span><span>{percent(observedRate)}</span></span>
        <input aria-label="Observed rate" type="range" min={OBSERVED_RATE_RANGE.min} max={OBSERVED_RATE_RANGE.max} step={OBSERVED_RATE_RANGE.step} value={observedRate} onChange={(event) => { const next = Number(event.target.value); setObservedRate(next); sync({ rate: next }); }} />
      </label>
    </div>
  </section>;
}

/** Wrap the verdict onto short lines; SVG text does not wrap on its own. */
function wrapVerdict(text: string, limit: number): string[] {
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
