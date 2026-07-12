"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { scaleLinear } from "@visx/scale";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { vizStroke, vizTokens } from "@/lib/vizTokens";
import { reduced, vizMotion } from "@/lib/vizMotion";
import type { ExhibitSceneProps } from "../types";
import { CANDIDATES, PROMPT, TOKEN_SAMPLING_DISCLOSURE } from "./data";
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  SAMPLE_DRAWS,
  TEMPERATURE_RANGE,
  TOP_K_RANGE,
  TOP_P_RANGE,
  applyTruncation,
  entropy,
  sampleIndex,
  softmaxWithTemperature,
  temperatureRegime,
  type TruncationMethod,
} from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const PROMPT_BAND_HEIGHT = 68;
const CHART_TOP = PROMPT_BAND_HEIGHT + 22;
const CHART_BOTTOM = 20;
const ROW_HEIGHT = (HEIGHT - CHART_TOP - CHART_BOTTOM) / CANDIDATES.length;
const BAR_HEIGHT = ROW_HEIGHT * 0.62;
const LABEL_LEFT = 24;
const LABEL_WIDTH = 156;
const BAR_LEFT = LABEL_LEFT + LABEL_WIDTH;
const BAR_MAX_WIDTH = 780;
const FIGURE_LEFT = BAR_LEFT + BAR_MAX_WIDTH + 16;

const STEP_PRESETS = [
  { temperature: DEFAULT_TEMPERATURE, truncation: "none" },
  { temperature: 0.3, truncation: "none" },
  { temperature: 1.0, truncation: "top-p" },
  { temperature: 1.8, truncation: "none" },
] as const satisfies readonly { temperature: number; truncation: TruncationMethod }[];

const TRUNCATION_OPTIONS: readonly { value: TruncationMethod; label: string }[] = [
  { value: "none", label: "None" },
  { value: "top-k", label: "Top-k" },
  { value: "top-p", label: "Top-p" },
];

function presetFor(step: number) {
  return STEP_PRESETS[Math.max(0, Math.min(STEP_PRESETS.length - 1, step))];
}

function formatPercent(probability: number): string {
  const percentage = probability * 100;
  return percentage < 1 && percentage > 0 ? "<1%" : `${Math.round(percentage)}%`;
}

function truncationSummary(method: TruncationMethod, topK: number, topP: number, survivingCount: number, total: number): string {
  if (method === "top-k") return `${survivingCount} of ${total} tokens remain after top-k ${topK}`;
  if (method === "top-p") return `${survivingCount} of ${total} tokens remain after top-p ${topP.toFixed(2)}`;
  return `${survivingCount} of ${total} tokens remain`;
}

const widthScale = scaleLinear({ domain: [0, 1], range: [0, BAR_MAX_WIDTH] });

export default function TokenSamplingScene({ step, resetKey }: ExhibitSceneProps) {
  const initialPreset = presetFor(step);
  const sceneId = useId();
  const prefersReduced = useReducedMotion();
  const [temperature, setTemperature] = useState<number>(initialPreset.temperature);
  const [truncation, setTruncation] = useState<TruncationMethod>(initialPreset.truncation);
  const [topK, setTopK] = useState<number>(DEFAULT_TOP_K);
  const [topP, setTopP] = useState<number>(DEFAULT_TOP_P);
  const [samples, setSamples] = useState<string[]>([]);
  const [drawCount, setDrawCount] = useState(0);

  useEffect(() => {
    const preset = presetFor(step);
    setTemperature(preset.temperature);
    setTruncation(preset.truncation);
    setTopK(DEFAULT_TOP_K);
    setTopP(DEFAULT_TOP_P);
    setSamples([]);
    setDrawCount(0);
  }, [resetKey, step]);

  const fullProbabilities = useMemo(
    () => softmaxWithTemperature(CANDIDATES.map((candidate) => candidate.logit), temperature),
    [temperature],
  );
  const truncationResult = useMemo(
    () => applyTruncation(fullProbabilities, truncation, topK, topP),
    [fullProbabilities, truncation, topK, topP],
  );
  const survivorSet = useMemo(() => new Set(truncationResult.survivingIndices), [truncationResult]);
  const entropyBits = useMemo(() => entropy(truncationResult.probabilities), [truncationResult]);
  const regime = temperatureRegime(temperature);

  const ranked = useMemo(
    () =>
      CANDIDATES.map((candidate, index) => ({
        token: candidate.token,
        index,
        probability: fullProbabilities[index],
        surviving: survivorSet.has(index),
      })).sort((a, b) => b.probability - a.probability),
    [fullProbabilities, survivorSet],
  );

  const favourite = ranked[0];
  const lastSample = samples.at(-1);
  const lastDraw = drawCount > 0 ? SAMPLE_DRAWS[(drawCount - 1) % SAMPLE_DRAWS.length] : null;
  const rouletteSegments = truncationResult.probabilities.reduce<Array<{ index: number; start: number; width: number }>>((segments, probability, index) => {
    const start = segments.length === 0 ? 0 : segments.at(-1)!.start + segments.at(-1)!.width;
    segments.push({ index, start, width: probability });
    return segments;
  }, []);

  // Where the top-p nucleus closes: the row boundary after the last surviving
  // (highest-probability-first) bar, so the cut is visible as a line rather
  // than tokens simply disappearing.
  const nucleusBoundaryRow = truncation === "top-p"
    ? ranked.reduce((lastSurvivingRow, entry, row) => (entry.surviving ? row : lastSurvivingRow), -1)
    : -1;
  const nucleusCumulative = truncation === "top-p"
    ? ranked.slice(0, nucleusBoundaryRow + 1).reduce((sum, entry) => sum + entry.probability, 0)
    : 0;

  function drawSample() {
    const draw = SAMPLE_DRAWS[drawCount % SAMPLE_DRAWS.length];
    const index = sampleIndex(truncationResult.probabilities, draw);
    setSamples((current) => [...current, CANDIDATES[index].token]);
    setDrawCount((count) => count + 1);
  }

  function clearSamples() {
    setSamples([]);
    setDrawCount(0);
  }

  function adjustTemperature(delta: number) {
    setTemperature((current) => {
      const next = Math.round((current + delta) / TEMPERATURE_RANGE.step) * TEMPERATURE_RANGE.step;
      return Math.max(TEMPERATURE_RANGE.min, Math.min(TEMPERATURE_RANGE.max, Number(next.toFixed(2))));
    });
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      adjustTemperature(-TEMPERATURE_RANGE.step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      adjustTemperature(TEMPERATURE_RANGE.step);
    } else if (event.key === "Enter" || event.key === "s" || event.key === "S") {
      event.preventDefault();
      drawSample();
    }
  }

  const statusDescription = `Temperature ${temperature.toFixed(2)}, ${regime}. ${truncationSummary(truncation, topK, topP, truncationResult.survivingIndices.length, CANDIDATES.length)}. Most likely: ${favourite.token} at ${formatPercent(favourite.probability)}. Sampled: ${lastSample ?? "none yet"}.`;

  return (
    <section
      aria-label="Token sampling visualisation"
      className="grid h-full min-h-[22rem] min-w-0 grid-rows-[minmax(0,1fr)_auto_auto] overflow-hidden border border-outline bg-surface"
    >
      <div
        role="group"
        tabIndex={0}
        aria-label={`Next-token distribution for the prompt "${PROMPT}". Temperature ${temperature.toFixed(2)}.`}
        aria-describedby={`${sceneId}-keyboard-help`}
        aria-keyshortcuts="ArrowLeft ArrowRight Enter"
        onKeyDown={handleStageKeyDown}
        className="relative min-h-0 overflow-hidden bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        data-testid="token-distribution"
      >
        <span id={`${sceneId}-keyboard-help`} className="sr-only">
          Use the left and right arrow keys to change the temperature. Press Enter or S to sample a token.
        </span>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="block h-full w-full select-none"
        >
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />

          <text x={LABEL_LEFT} y={30} fill={vizTokens.mutedInk} fontSize="11" fontFamily="var(--font-dm-mono)" letterSpacing="1.3">PROMPT</text>
          <text x={LABEL_LEFT} y={54} fill={vizTokens.ink} fontSize="19" fontFamily="var(--font-dm-mono)">{PROMPT} …</text>
          <g transform="translate(350 34)">
            <text x="0" y="-6" fill={vizTokens.mutedInk} fontSize="9" fontFamily="var(--font-dm-mono)">UNIT INTERVAL USED BY THE RANDOM DRAW</text>
            {rouletteSegments.map((segment) => <rect key={segment.index} x={segment.start * 480} width={Math.max(1, segment.width * 480)} height="17" fill={segment.index % 2 === 0 ? vizTokens.classA : vizTokens.path} opacity={0.38 + segment.index % 2 * 0.22} />)}
            {lastDraw !== null ? <g><line x1={lastDraw * 480} x2={lastDraw * 480} y1="-2" y2="24" stroke={vizTokens.selection} strokeWidth="3" /><path d={`M${lastDraw * 480 - 5} -2 h10 l-5 7 z`} fill={vizTokens.selection} /></g> : null}
          </g>
          <line x1={LABEL_LEFT} x2={WIDTH - LABEL_LEFT} y1={PROMPT_BAND_HEIGHT} y2={PROMPT_BAND_HEIGHT} stroke={vizTokens.border} strokeWidth={vizStroke.grid} />

          {ranked.map((entry, row) => {
            const rowY = CHART_TOP + row * ROW_HEIGHT;
            const barWidth = Math.max(2, widthScale(entry.probability));
            const sampled = entry.token === lastSample;
            const barColour = entry.surviving ? vizTokens.classA : vizTokens.border;
            const textColour = entry.surviving ? vizTokens.ink : vizTokens.mutedInk;

            // Each row springs to its ranked position, so re-ranking on a
            // temperature change reads as bars sliding past each other.
            return (
              <motion.g
                key={entry.token}
                initial={false}
                animate={{ y: rowY }}
                transition={reduced(vizMotion.markerSpring, prefersReduced)}
              >
                <text x={LABEL_LEFT} y={BAR_HEIGHT * 0.72} fill={textColour} fontSize="14" fontFamily="var(--font-dm-mono)">{entry.token}</text>
                <motion.rect
                  x={BAR_LEFT}
                  y={0}
                  height={BAR_HEIGHT}
                  fill={entry.surviving ? barColour : "none"}
                  stroke={barColour}
                  strokeWidth={entry.surviving ? 0 : vizStroke.guide}
                  fillOpacity={entry.surviving ? 0.88 : 1}
                  initial={false}
                  animate={{ width: barWidth }}
                  transition={reduced(vizMotion.fade, prefersReduced)}
                />
                <AnimatePresence>
                  {sampled && (
                    <motion.rect
                      key="sampled"
                      x={BAR_LEFT - 4}
                      y={-3}
                      width={barWidth + 8}
                      height={BAR_HEIGHT + 6}
                      fill="none"
                      stroke={vizTokens.selection}
                      strokeWidth={vizStroke.contourStrong}
                      initial={prefersReduced ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={reduced(vizMotion.popIn, prefersReduced)}
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    />
                  )}
                </AnimatePresence>
                <text x={FIGURE_LEFT} y={BAR_HEIGHT * 0.72} fill={textColour} fontSize="13" fontFamily="var(--font-dm-mono)">{formatPercent(entry.probability)}</text>
              </motion.g>
            );
          })}

          <AnimatePresence>
            {nucleusBoundaryRow >= 0 && nucleusBoundaryRow < CANDIDATES.length - 1 && (
              <motion.g
                key="nucleus"
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced(vizMotion.fade, prefersReduced)}
              >
                <line
                  x1={LABEL_LEFT}
                  x2={WIDTH - LABEL_LEFT}
                  y1={CHART_TOP + (nucleusBoundaryRow + 1) * ROW_HEIGHT - ROW_HEIGHT * 0.19}
                  y2={CHART_TOP + (nucleusBoundaryRow + 1) * ROW_HEIGHT - ROW_HEIGHT * 0.19}
                  stroke={vizTokens.path}
                  strokeWidth={vizStroke.guide}
                  strokeDasharray="6 5"
                />
                <text
                  x={WIDTH - LABEL_LEFT}
                  y={CHART_TOP + (nucleusBoundaryRow + 1) * ROW_HEIGHT - ROW_HEIGHT * 0.19 - 6}
                  textAnchor="end"
                  fill={vizTokens.path}
                  fontSize="11"
                  fontFamily="var(--font-dm-mono)"
                >
                  nucleus closes at {formatPercent(nucleusCumulative)}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          <g transform={`translate(${WIDTH - 300} ${8})`}>
            <rect width="276" height="54" fill={vizTokens.canvas} fillOpacity="0.94" stroke={vizTokens.border} />
            <text x="12" y="18" fill={vizTokens.mutedInk} fontSize="10" fontFamily="var(--font-dm-mono)" letterSpacing="1.1">T {temperature.toFixed(2)} · {regime.toUpperCase()}</text>
            <text x="12" y="36" fill={vizTokens.ink} fontSize="11" fontFamily="var(--font-dm-mono)">ENTROPY {entropyBits.toFixed(2)} bits</text>
            <text x="12" y="49" fill={vizTokens.ink} fontSize="11" fontFamily="var(--font-dm-mono)">{truncationResult.survivingIndices.length} / {CANDIDATES.length} TOKENS IN PLAY</text>
          </g>
        </svg>

        <p className="sr-only" aria-live="polite" data-testid="token-sampling-status">{statusDescription}</p>
      </div>

      <div className="border-t border-outline bg-surface-container-low px-3 py-2 sm:px-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">Sampled continuation</p>
        <p className="mt-0.5 truncate text-sm text-on-surface" data-testid="sampled-continuation">
          <span className="text-on-surface-variant">{PROMPT}</span>
          {samples.length > 0 && <span className="text-primary"> {samples.join(" · ")}</span>}
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-[auto_minmax(8rem,1fr)] gap-x-3 gap-y-2 border-t border-outline bg-surface-container-low p-2 sm:flex sm:flex-wrap sm:items-end sm:gap-4 sm:px-3 sm:py-2">
        <label className="min-w-0 flex-1 sm:max-w-xs">
          <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">
            <span>Temperature</span>
            <span className={regime === "adventurous" ? "text-warning" : "text-primary"}>
              {temperature.toFixed(2)} · {regime}
            </span>
          </span>
          <input
            aria-label="Temperature"
            type="range"
            min={TEMPERATURE_RANGE.min}
            max={TEMPERATURE_RANGE.max}
            step={TEMPERATURE_RANGE.step}
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
            className="block min-h-9"
          />
        </label>

        <fieldset className="min-w-0">
          <legend className="mb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">Truncation</legend>
          <div className="grid grid-cols-3">
            {TRUNCATION_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={truncation === option.value}
                onClick={() => setTruncation(option.value)}
                className={`min-h-9 border px-3 text-xs transition-colors ${index > 0 ? "-ml-px" : ""} ${
                  truncation === option.value
                    ? "relative z-10 border-primary bg-primary text-on-primary"
                    : "border-outline bg-surface text-on-surface-variant hover:border-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {truncation === "top-k" && (
          <label className="min-w-0 flex-1 sm:max-w-[10rem]">
            <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">
              <span>k</span>
              <span className="text-primary">{topK}</span>
            </span>
            <input
              aria-label="Top-k"
              type="range"
              min={TOP_K_RANGE.min}
              max={TOP_K_RANGE.max}
              step={TOP_K_RANGE.step}
              value={topK}
              onChange={(event) => setTopK(Number(event.target.value))}
              className="block min-h-9"
            />
          </label>
        )}

        {truncation === "top-p" && (
          <label className="min-w-0 flex-1 sm:max-w-[10rem]">
            <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">
              <span>p</span>
              <span className="text-primary">{topP.toFixed(2)}</span>
            </span>
            <input
              aria-label="Top-p"
              type="range"
              min={TOP_P_RANGE.min}
              max={TOP_P_RANGE.max}
              step={TOP_P_RANGE.step}
              value={topP}
              onChange={(event) => setTopP(Number(event.target.value))}
              className="block min-h-9"
            />
          </label>
        )}

        <div className="col-span-2 flex min-w-0 gap-2 sm:ml-auto sm:pb-px">
          <button
            type="button"
            onClick={drawSample}
            className="min-h-9 flex-1 border border-primary bg-primary px-3 text-xs text-on-primary sm:flex-none"
          >
            Sample token
          </button>
          <button
            type="button"
            onClick={clearSamples}
            disabled={samples.length === 0}
            className="min-h-9 flex-1 border border-outline px-3 text-xs text-on-surface-variant hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            Clear samples
          </button>
        </div>
      </div>

      <span className="sr-only">{TOKEN_SAMPLING_DISCLOSURE}</span>
    </section>
  );
}
