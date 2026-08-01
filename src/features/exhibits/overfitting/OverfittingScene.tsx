"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { vizTokens } from "@/lib/vizTokens";
import { useVizStroke, useVizType } from "../presentMode";
import { reduced, vizMotion } from "@/lib/vizMotion";
import { KeptComparisonButton } from "../KeptComparisonButton";
import type { ExhibitSceneProps } from "../types";
import { enumParam, numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import {
  DEFAULT_DEGREE,
  DEFAULT_SEED,
  DEGREE_RANGE,
  SEED_RANGE,
  errorByDegree,
  fitPolynomial,
  meanSquaredError,
  nextSeed,
  predict,
  regimeAtDegree,
  samplePoints,
  trueFunction,
  type FitRegime,
  type Point,
} from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const GAP = 20;
const LEFT_WIDTH = 760;
const RIGHT_WIDTH = WIDTH - LEFT_WIDTH - GAP;
const RIGHT_X = LEFT_WIDTH + GAP;

const LEFT_PLOT = { left: 50, right: 20, top: 20, bottom: 36 } as const;
const LEFT_PLOT_WIDTH = LEFT_WIDTH - LEFT_PLOT.left - LEFT_PLOT.right;
const LEFT_PLOT_HEIGHT = HEIGHT - LEFT_PLOT.top - LEFT_PLOT.bottom;

const RIGHT_PLOT = { left: 46, right: 16, top: 20, bottom: 36 } as const;
const RIGHT_PLOT_WIDTH = RIGHT_WIDTH - RIGHT_PLOT.left - RIGHT_PLOT.right;
const RIGHT_PLOT_HEIGHT = HEIGHT - RIGHT_PLOT.top - RIGHT_PLOT.bottom;

const Y_DOMAIN = { min: -1.6, max: 1.6 } as const;
const ERROR_CAP = 0.6;
const CURVE_SAMPLES = 140;
const LEFT_Y_TICKS = [-1, -0.5, 0, 0.5, 1];
const LEFT_X_TICKS = [0, 0.25, 0.5, 0.75, 1];
const RIGHT_Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

const STEP_PRESETS = [
  { degree: DEGREE_RANGE.min, referenceDegree: null },
  { degree: DEFAULT_DEGREE, referenceDegree: null },
  { degree: DEGREE_RANGE.max, referenceDegree: DEFAULT_DEGREE },
] as const satisfies readonly { degree: number; referenceDegree: number | null }[];

const REGIME_SENTENCE: Record<FitRegime, string> = {
  underfit: "Underfitting: the model is too simple to capture the pattern.",
  "good fit": "Good fit: the curve tracks the pattern without chasing the noise.",
  overfit: "Overfitting: the curve chases the noise.",
};

const REGIME_TONE_CLASS: Record<FitRegime, string> = {
  underfit: "text-warning",
  "good fit": "text-primary",
  overfit: "text-error",
};

function presetFor(step: number) {
  return STEP_PRESETS[Math.max(0, Math.min(STEP_PRESETS.length - 1, step))];
}

/** Square-root compression keeps small errors legible while clamping blow-ups from high-degree fits. */
function errorScale(value: number): number {
  return Math.sqrt(Math.min(Math.max(value, 0), ERROR_CAP) / ERROR_CAP);
}

export default function OverfittingScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const type = useVizType();
  const stroke = useVizStroke();
  const initialPreset = presetFor(step);
  const clipId = useId();
  const prefersReduced = useReducedMotion();
  const [degree, setDegree] = useState<number>(initialPreset.degree);
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [showValidation, setShowValidation] = useState<boolean>(true);
  const [referenceDegree, setReferenceDegree] = useState<number | null>(initialPreset.referenceDegree);

  const syncControls = (
    nextDegree: number,
    nextSeedValue: number = seed,
    nextShowValidation: boolean = showValidation,
    nextReferenceDegree: number | null = referenceDegree,
  ) => replaceSceneUrlState([
    { key: "degree", value: String(nextDegree), defaultValue: String(initialPreset.degree) },
    { key: "seed", value: String(nextSeedValue), defaultValue: String(DEFAULT_SEED) },
    { key: "validation", value: nextShowValidation ? "on" : "off", defaultValue: "on" },
    { key: "compare", value: nextReferenceDegree === null ? "off" : "on", defaultValue: initialPreset.referenceDegree === null ? "off" : "on" },
    { key: "refDegree", value: nextReferenceDegree === null ? "" : String(nextReferenceDegree), defaultValue: "" },
  ]);

  const chooseDegree = (next: number) => {
    setDegree(next);
    syncControls(next, seed, showValidation, referenceDegree);
  };

  // visx scales own domain→pixel for both panels; content renders plot-relative
  // inside translated Groups. The error axis is sqrt-compressed, so the right
  // y-scale maps the already-compressed value in [0,1].
  const leftXScale = useMemo(() => scaleLinear({ domain: [0, 1], range: [0, LEFT_PLOT_WIDTH] }), []);
  const leftYScale = useMemo(
    () => scaleLinear({ domain: [Y_DOMAIN.min, Y_DOMAIN.max], range: [LEFT_PLOT_HEIGHT, 0] }),
    [],
  );
  const rightXScale = useMemo(
    () => scaleLinear({ domain: [DEGREE_RANGE.min, DEGREE_RANGE.max], range: [0, RIGHT_PLOT_WIDTH] }),
    [],
  );
  const rightYScale = useMemo(() => scaleLinear({ domain: [0, 1], range: [RIGHT_PLOT_HEIGHT, 0] }), []);
  const rightYOf = (value: number) => rightYScale(errorScale(value));

  useEffect(() => {
    const preset = presetFor(step);
    setDegree(preset.degree);
    setSeed(DEFAULT_SEED);
    setShowValidation(true);
    setReferenceDegree(preset.referenceDegree);
  }, [resetKey, step]);

  useSceneUrlState((params) => {
    const restoredDegree = numberParam(params, "degree", DEGREE_RANGE);
    const restoredSeed = numberParam(params, "seed", SEED_RANGE);
    const restoredReferenceDegree = numberParam(params, "refDegree", DEGREE_RANGE);
    setDegree(restoredDegree ?? initialPreset.degree);
    setSeed(restoredSeed ?? DEFAULT_SEED);
    setShowValidation(enumParam(params, "validation", ["off"] as const) !== "off");
    if (restoredReferenceDegree !== undefined) setReferenceDegree(restoredReferenceDegree);
    else if (enumParam(params, "compare", ["off"] as const) === "off") setReferenceDegree(null);
    else setReferenceDegree(initialPreset.referenceDegree);
  }, step);

  const dataset = useMemo(() => samplePoints(seed), [seed]);
  const curve = useMemo(
    () => errorByDegree(dataset.train, dataset.validation),
    [dataset],
  );
  const coefficients = useMemo(
    () => fitPolynomial(dataset.train, degree),
    [dataset, degree],
  );
  const referenceCoefficients = useMemo(
    () => referenceDegree === null ? null : fitPolynomial(dataset.train, referenceDegree),
    [dataset, referenceDegree],
  );

  const trainError = meanSquaredError(coefficients, dataset.train);
  const validationError = meanSquaredError(coefficients, dataset.validation);
  const referenceTrainError = referenceCoefficients ? meanSquaredError(referenceCoefficients, dataset.train) : null;
  const referenceValidationError = referenceCoefficients ? meanSquaredError(referenceCoefficients, dataset.validation) : null;
  const regime = regimeAtDegree(curve, degree);

  const bestValidationIndex = curve.validationError.reduce(
    (best, value, index) => (value < curve.validationError[best] ? index : best),
    0,
  );
  const bestDegree = curve.degrees[bestValidationIndex];

  const fittedCurve = useMemo(() => {
    const points: Point[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
      const x = i / CURVE_SAMPLES;
      points.push({ x, y: predict(coefficients, x) });
    }
    return points;
  }, [coefficients]);

  const referenceFittedCurve = useMemo(() => {
    if (!referenceCoefficients) return null;
    const points: Point[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
      const x = i / CURVE_SAMPLES;
      points.push({ x, y: predict(referenceCoefficients, x) });
    }
    return points;
  }, [referenceCoefficients]);

  const truthCurve = useMemo(() => {
    const points: Point[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
      const x = i / CURVE_SAMPLES;
      points.push({ x, y: trueFunction(x) });
    }
    return points;
  }, []);

  function resample() {
    const next = nextSeed(seed);
    setSeed(next);
    syncControls(degree, next, showValidation, referenceDegree);
  }

  function adjustDegree(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      chooseDegree(Math.max(DEGREE_RANGE.min, degree - 1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      chooseDegree(Math.min(DEGREE_RANGE.max, degree + 1));
    }
  }

  const comparisonContradiction = referenceTrainError !== null
    && referenceValidationError !== null
    && trainError < referenceTrainError
    && validationError > referenceValidationError;
  const comparisonSummary = referenceDegree !== null && referenceTrainError !== null && referenceValidationError !== null
    ? referenceDegree === degree
      ? `Current and kept fits both use degree ${degree}.`
      : `Degree ${referenceDegree} → ${degree}: training ${referenceTrainError.toFixed(3)} → ${trainError.toFixed(3)}; validation ${referenceValidationError.toFixed(3)} → ${validationError.toFixed(3)}.`
    : null;
  const generalisationGap = validationError - trainError;
  const trainDelta = referenceTrainError === null ? null : trainError - referenceTrainError;
  const validationDelta = referenceValidationError === null ? null : validationError - referenceValidationError;
  const statusDescription = `Degree ${degree}. Training error ${trainError.toFixed(3)}, validation error ${validationError.toFixed(3)}. ${REGIME_SENTENCE[regime]}${comparisonSummary ? ` ${comparisonSummary}` : ""}`;

  return (
    <section aria-label="Overfitting visualisation" className="grid h-full min-h-[22rem] min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div
        role="group"
        tabIndex={0}
        aria-label={`Model fit and error curves. Degree ${degree}. Use the left and right arrow keys to change the degree.`}
        aria-describedby={`${clipId}-keyboard-help`}
        aria-keyshortcuts="ArrowLeft ArrowRight"
        onKeyDown={adjustDegree}
        className="relative min-h-0 overflow-hidden bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        data-testid="overfitting-stage"
      >
        <span id={`${clipId}-keyboard-help`} className="sr-only">Focus this chart and use the left and right arrow keys to change the polynomial degree.</span>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="block h-full w-full select-none"
        >
          <defs>
            {/* Clip rects are in each Group's translated (plot-relative) space. */}
            <clipPath id={`${clipId}-left`}>
              <rect x={0} y={0} width={LEFT_PLOT_WIDTH} height={LEFT_PLOT_HEIGHT} />
            </clipPath>
            <clipPath id={`${clipId}-right`}>
              <rect x={0} y={0} width={RIGHT_PLOT_WIDTH} height={RIGHT_PLOT_HEIGHT} />
            </clipPath>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />

          {/* Left panel: data and fitted curve */}
          <Group left={LEFT_PLOT.left} top={LEFT_PLOT.top} clipPath={`url(#${clipId}-left)`}>
            <GridRows scale={leftYScale} width={LEFT_PLOT_WIDTH} tickValues={LEFT_Y_TICKS} stroke={vizTokens.grid} strokeWidth={stroke.grid} />
            <GridColumns scale={leftXScale} height={LEFT_PLOT_HEIGHT} tickValues={LEFT_X_TICKS} stroke={vizTokens.grid} strokeWidth={stroke.grid} />

            <LinePath<Point>
              data={truthCurve}
              x={(point) => leftXScale(point.x)}
              y={(point) => leftYScale(point.y)}
              fill="none"
              stroke={vizTokens.path}
              strokeWidth={stroke.marker}
              strokeDasharray="7 6"
              opacity={0.85}
            />

            {referenceFittedCurve && referenceDegree !== degree ? (
              <LinePath<Point>
                data={referenceFittedCurve}
                x={(point) => leftXScale(point.x)}
                y={(point) => leftYScale(point.y)}
                fill="none"
                stroke={vizTokens.mutedInk}
                strokeWidth={stroke.contourStrong}
                strokeDasharray="3 4"
                opacity={0.55}
              />
            ) : null}

            <LinePath<Point> data={fittedCurve} x={(point) => leftXScale(point.x)} y={(point) => leftYScale(point.y)}>
              {({ path: line }) => (
                <motion.path
                  fill="none"
                  stroke={vizTokens.selection}
                  strokeWidth={stroke.path}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={false}
                  animate={{ d: line(fittedCurve) ?? "" }}
                  transition={reduced(playing ? vizMotion.cinematic : vizMotion.fade, prefersReduced)}
                />
              )}
            </LinePath>

            {dataset.train.map((point, index) => (
              <motion.line
                key={`residual-${index}`}
                x1={leftXScale(point.x)}
                x2={leftXScale(point.x)}
                y1={leftYScale(point.y)}
                initial={false}
                animate={{ y2: leftYScale(predict(coefficients, point.x)) }}
                stroke={vizTokens.error}
                strokeWidth={stroke.guide}
                opacity={0.34}
                transition={reduced(playing ? vizMotion.cinematic : vizMotion.fade, prefersReduced)}
              />
            ))}

            <AnimatePresence initial={false}>
              {showValidation && dataset.validation.map((point, index) => (
                <motion.circle
                  key={`validation-${index}`}
                  cx={leftXScale(point.x)}
                  cy={leftYScale(point.y)}
                  r={4.5}
                  fill={vizTokens.canvas}
                  stroke={vizTokens.classB}
                  strokeWidth={stroke.marker}
                  initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={reduced(vizMotion.popIn, prefersReduced)}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              ))}
            </AnimatePresence>

            {dataset.train.map((point, index) => (
              <circle key={`train-${index}`} cx={leftXScale(point.x)} cy={leftYScale(point.y)} r={4.5} fill={vizTokens.classA} stroke={vizTokens.pointOutline} strokeWidth={stroke.guide} />
            ))}
          </Group>
          <rect x={LEFT_PLOT.left} y={LEFT_PLOT.top} width={LEFT_PLOT_WIDTH} height={LEFT_PLOT_HEIGHT} fill="none" stroke={vizTokens.border} />
          {/* Captions and legends are placed off the type scale rather than off
              fixed pixel offsets: at reading size the difference is invisible,
              but enlarged type would otherwise cross the plot border and stack
              on top of itself. */}
          <text x={LEFT_PLOT.left + 8} y={LEFT_PLOT.top + type.label * 1.8} fill={vizTokens.mutedInk} fontSize={type.label} fontFamily="var(--font-dm-mono)">TRAIN AND VALIDATION DATA</text>
          <text x={LEFT_PLOT.left} y={HEIGHT - type.label} fill={vizTokens.mutedInk} fontSize={type.label} fontFamily="var(--font-dm-mono)">x</text>
          <text x={LEFT_WIDTH - LEFT_PLOT.right} y={HEIGHT - type.label} textAnchor="end" fill={vizTokens.classA} fontSize={type.label} fontFamily="var(--font-dm-mono)">● train</text>
          <text x={LEFT_WIDTH - LEFT_PLOT.right} y={HEIGHT - type.label * 2.6} textAnchor="end" fill={vizTokens.classB} fontSize={type.label} fontFamily="var(--font-dm-mono)">○ validation</text>
          {referenceDegree !== null && referenceDegree !== degree ? (
            <text x={LEFT_PLOT.left + 8} y={LEFT_PLOT.top + type.label * 3.4} fill={vizTokens.mutedInk} fontSize={type.label} fontFamily="var(--font-dm-mono)">- - kept degree {referenceDegree}</text>
          ) : null}

          {/* Right panel: error vs degree */}
          <Group left={RIGHT_X + RIGHT_PLOT.left} top={RIGHT_PLOT.top} clipPath={`url(#${clipId}-right)`}>
            <GridRows scale={rightYScale} width={RIGHT_PLOT_WIDTH} tickValues={RIGHT_Y_TICKS} stroke={vizTokens.grid} strokeWidth={stroke.grid} />

            {curve.degrees.map((value, index) => (
              <line
                key={`gap-${value}`}
                x1={rightXScale(value)}
                x2={rightXScale(value)}
                y1={rightYOf(curve.trainError[index])}
                y2={rightYOf(curve.validationError[index])}
                stroke={value === degree ? vizTokens.selection : vizTokens.classB}
                strokeWidth={value === degree ? 8 : 3}
                opacity={value === degree ? 0.26 : 0.09}
              />
            ))}

            <motion.line
              initial={false}
              animate={{
                x1: rightXScale(degree),
                x2: rightXScale(degree),
                y1: rightYOf(trainError),
                y2: rightYOf(validationError),
              }}
              transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)}
              stroke={vizTokens.selection}
              strokeWidth="5"
              opacity="0.32"
            />
            <motion.circle initial={false} animate={{ cx: rightXScale(degree), cy: rightYOf(trainError) }} transition={reduced(vizMotion.markerSpring, prefersReduced)} r="5" fill={vizTokens.classA} stroke={vizTokens.canvas} strokeWidth="2" />
            <motion.circle initial={false} animate={{ cx: rightXScale(degree), cy: rightYOf(validationError) }} transition={reduced(vizMotion.markerSpring, prefersReduced)} r="5" fill={vizTokens.classB} stroke={vizTokens.canvas} strokeWidth="2" />
            <motion.text
              initial={false}
              animate={{ x: rightXScale(degree) + (degree > 8 ? -9 : 9), y: (rightYOf(trainError) + rightYOf(validationError)) / 2 }}
              transition={reduced(vizMotion.markerSpring, prefersReduced)}
              textAnchor={degree > 8 ? "end" : "start"}
              dominantBaseline="middle"
              fill={generalisationGap > 0 ? vizTokens.error : vizTokens.classA}
              fontSize={type.label}
              fontFamily="var(--font-dm-mono)"
            >GAP {Math.abs(generalisationGap).toFixed(3)}</motion.text>

            {referenceDegree !== null && referenceDegree !== degree && referenceTrainError !== null && referenceValidationError !== null ? <>
              <line x1={rightXScale(referenceDegree)} y1={rightYOf(referenceTrainError)} x2={rightXScale(degree)} y2={rightYOf(trainError)} stroke={vizTokens.classA} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <line x1={rightXScale(referenceDegree)} y1={rightYOf(referenceValidationError)} x2={rightXScale(degree)} y2={rightYOf(validationError)} stroke={vizTokens.classB} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            </> : null}

            <LinePath
              data={curve.degrees.map((d, i) => ({ degree: d, value: curve.trainError[i] }))}
              x={(point) => rightXScale(point.degree)}
              y={(point) => rightYOf(point.value)}
              curve={curveMonotoneX}
              fill="none"
              stroke={vizTokens.classA}
              strokeWidth={stroke.contourStrong}
            />
            <LinePath
              data={curve.degrees.map((d, i) => ({ degree: d, value: curve.validationError[i] }))}
              x={(point) => rightXScale(point.degree)}
              y={(point) => rightYOf(point.value)}
              curve={curveMonotoneX}
              fill="none"
              stroke={vizTokens.classB}
              strokeWidth={stroke.contourStrong}
            />

            <motion.line
              y1={0}
              y2={RIGHT_PLOT_HEIGHT}
              stroke={vizTokens.selection}
              strokeWidth={stroke.marker}
              strokeDasharray="4 3"
              initial={false}
              animate={{ x1: rightXScale(degree), x2: rightXScale(degree) }}
              transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)}
            />

            {referenceDegree !== null && referenceDegree !== degree ? (
              <line
                x1={rightXScale(referenceDegree)}
                x2={rightXScale(referenceDegree)}
                y1={0}
                y2={RIGHT_PLOT_HEIGHT}
                stroke={vizTokens.mutedInk}
                strokeWidth={stroke.guide}
                strokeDasharray="2 4"
                opacity={0.7}
              />
            ) : null}

            <circle
              cx={rightXScale(bestDegree)}
              cy={rightYOf(curve.validationError[bestValidationIndex])}
              r={5}
              fill={vizTokens.canvas}
              stroke={vizTokens.classB}
              strokeWidth={stroke.marker}
            />
            <text
              x={rightXScale(bestDegree) + (bestDegree > 7 ? -8 : 8)}
              y={Math.max(type.label * 5, rightYOf(curve.validationError[bestValidationIndex]) - type.label)}
              textAnchor={bestDegree > 7 ? "end" : "start"}
              fill={vizTokens.classB}
              fontSize={type.label}
              fontFamily="var(--font-dm-mono)"
            >LOWEST VALIDATION</text>

            {bestDegree > DEGREE_RANGE.min && (
              <text x={rightXScale((DEGREE_RANGE.min + bestDegree) / 2)} y={RIGHT_PLOT_HEIGHT + 18} textAnchor="middle" fill={vizTokens.mutedInk} fontSize={type.labelStrong} fontFamily="var(--font-dm-mono)" letterSpacing="0.08em">UNDERFIT</text>
            )}
            {bestDegree < DEGREE_RANGE.max && (
              <text x={rightXScale((bestDegree + DEGREE_RANGE.max) / 2)} y={RIGHT_PLOT_HEIGHT + 18} textAnchor="middle" fill={vizTokens.mutedInk} fontSize={type.labelStrong} fontFamily="var(--font-dm-mono)" letterSpacing="0.08em">OVERFIT</text>
            )}
          </Group>
          <rect x={RIGHT_X + RIGHT_PLOT.left} y={RIGHT_PLOT.top} width={RIGHT_PLOT_WIDTH} height={RIGHT_PLOT_HEIGHT} fill="none" stroke={vizTokens.border} />
          {/* This caption lives in the 20px margin above the plot, so it takes a
              label size rather than a body size: enlarged body type overruns
              the top of the frame. The legend below it sits inside the plot. */}
          <text x={RIGHT_X + RIGHT_PLOT.left} y={RIGHT_PLOT.top - 4} fill={vizTokens.mutedInk} fontSize={type.label} fontFamily="var(--font-dm-mono)">ERROR VS DEGREE</text>
          <text x={RIGHT_X + RIGHT_PLOT.left} y={RIGHT_PLOT.top + type.label * 1.8} fill={vizTokens.classA} fontSize={type.label} fontFamily="var(--font-dm-mono)">— train</text>
          <text x={RIGHT_X + RIGHT_PLOT.left + type.label * 5.5} y={RIGHT_PLOT.top + type.label * 1.8} fill={vizTokens.classB} fontSize={type.label} fontFamily="var(--font-dm-mono)">— validation</text>
          {referenceDegree !== null && referenceDegree !== degree ? (
            <text x={RIGHT_X + RIGHT_PLOT.left + rightXScale(referenceDegree)} y={RIGHT_PLOT.top + type.label * 3.6} textAnchor="middle" fill={vizTokens.mutedInk} fontSize={type.label} fontFamily="var(--font-dm-mono)">KEPT D{referenceDegree}</text>
          ) : null}
        </svg>

        <p className="sr-only" aria-live="polite">{statusDescription}</p>
      </div>

      <div className="grid shrink-0 grid-cols-[auto_minmax(8rem,1fr)] gap-x-3 gap-y-2 border-t border-outline bg-surface-container-low p-2 sm:flex sm:items-end sm:gap-4 sm:px-3 sm:py-2">
        <label className="col-span-2 min-w-0 sm:max-w-sm sm:flex-1">
          <span className="mb-1 flex items-center justify-between gap-3 font-mono viz-label uppercase tracking-[0.1em] text-on-surface-variant">
            <span>Degree</span>
            <span className={REGIME_TONE_CLASS[regime]}>{degree} · {regime}</span>
          </span>
          <input
            aria-label="Degree"
            type="range"
            min={DEGREE_RANGE.min}
            max={DEGREE_RANGE.max}
            step={1}
            value={degree}
            onChange={(event) => chooseDegree(Number(event.target.value))}
            className="block min-h-9"
          />
          <KeptComparisonButton
            active={referenceDegree !== null}
            activeLabel={`Clear kept degree ${referenceDegree ?? degree}`}
            inactiveLabel="Keep this fit to compare"
            onClick={() => {
              const next = referenceDegree === null ? degree : null;
              setReferenceDegree(next);
              syncControls(degree, seed, showValidation, next);
            }}
          />
        </label>

        {comparisonSummary ? (
          <div className={`col-span-2 min-w-0 border-l-2 px-2 py-1 sm:max-w-sm ${comparisonContradiction ? "border-error" : "border-primary"}`}>
            <p className={`font-headline text-sm font-medium ${comparisonContradiction ? "text-error" : "text-primary"}`}>{comparisonContradiction ? "Training improved. Validation worsened." : "Kept versus current"}</p>
            <p className={`viz-label-strong leading-snug ${comparisonContradiction ? "text-error" : "text-on-surface"}`}>{comparisonSummary}</p>
            {trainDelta !== null && validationDelta !== null ? <p className="mt-0.5 font-mono viz-label uppercase text-on-surface-variant">train {trainDelta <= 0 ? "↓" : "↑"} {Math.abs(trainDelta).toFixed(3)} · validation {validationDelta <= 0 ? "↓" : "↑"} {Math.abs(validationDelta).toFixed(3)}</p> : null}
          </div>
        ) : null}

        <div className="col-span-2 flex min-w-0 gap-2 sm:ml-auto sm:pb-px">
          <button
            type="button"
            onClick={resample}
            className="min-h-9 flex-1 border border-outline bg-surface px-3 text-xs text-on-surface hover:border-primary sm:flex-none"
          >
            Resample data
          </button>
          <button
            type="button"
            aria-pressed={showValidation}
            onClick={() => {
              const next = !showValidation;
              setShowValidation(next);
              syncControls(degree, seed, next, referenceDegree);
            }}
            className={`min-h-9 flex-1 border px-3 text-xs transition-colors sm:flex-none ${showValidation ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface hover:border-primary"}`}
          >
            Validation points
          </button>
        </div>
      </div>
    </section>
  );
}
