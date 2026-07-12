"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import { createSeededRNG } from "@/lib/prng";
import {
  fitPolynomial,
  rmse,
  generatePresetDataset,
  groundTruth,
  classifyFit,
  PRESET_DOMAIN,
  PRESET_SEED,
  type DataPoint,
  type Split,
  type Verdict,
} from "./overfittingMath";

const MIN_DEGREE = 1;
const MAX_DEGREE = 15;
const DEFAULT_DEGREE = 3;
/** Ceiling used only for the error-vs-degree chart's y-scale, so a wild
 * high-degree blowup doesn't squash the whole U-shaped curve to the floor.
 * Readouts elsewhere always show the true, unclamped RMSE. */
const CHART_RMSE_CEILING = 6;

const W = 760;
const H = 420;
const MARGIN = { top: 20, right: 24, bottom: 34, left: 46 };
const PLOT_W = W - MARGIN.left - MARGIN.right;
const PLOT_H = H - MARGIN.top - MARGIN.bottom;

const MINI_W = 760;
const MINI_H = 200;
const MINI_MARGIN = { top: 16, right: 16, bottom: 30, left: 42 };
const MINI_PLOT_W = MINI_W - MINI_MARGIN.left - MINI_MARGIN.right;
const MINI_PLOT_H = MINI_H - MINI_MARGIN.top - MINI_MARGIN.bottom;

function clamp(value: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, value));
}

function ticksFor([lo, hi]: readonly [number, number], count: number): number[] {
  if (hi <= lo) return [lo];
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) {
    ticks.push(lo + ((hi - lo) * i) / count);
  }
  return ticks;
}

function verdictLabel(verdict: Verdict): string {
  if (verdict === "underfitting") return "Underfitting";
  if (verdict === "overfitting") return "Overfitting";
  return "Sweet spot";
}

function verdictClass(verdict: Verdict): string {
  if (verdict === "underfitting") return "text-warning";
  if (verdict === "overfitting") return "text-error";
  return "text-success";
}

function verdictCopy(verdict: Verdict): string {
  if (verdict === "underfitting") {
    return "The curve is too simple to track the signal — train error is still high. Raise the degree.";
  }
  if (verdict === "overfitting") {
    return "Train error is low but test error has pulled away — the curve is chasing noise instead of signal. Lower the degree or raise λ.";
  }
  return "Train and test error are close and both low — about as good as the noise allows.";
}

function formatLambda(lambda: number): string {
  if (lambda <= 1e-6) return "0";
  if (lambda >= 0.01) return lambda.toFixed(3);
  return lambda.toExponential(1);
}

export default function OverfittingLab() {
  const presetPoints = useMemo(() => generatePresetDataset(PRESET_SEED), []);
  const [userPoints, setUserPoints] = useState<DataPoint[]>([]);
  const [degree, setDegree] = useState(DEFAULT_DEGREE);
  const [lambdaT, setLambdaT] = useState(0);
  const [showTruth, setShowTruth] = useState(true);
  const splitRng = useRef(createSeededRNG(90125));
  const svgRef = useRef<SVGSVGElement | null>(null);

  const points = useMemo(() => [...presetPoints, ...userPoints], [presetPoints, userPoints]);
  const trainPoints = useMemo(() => points.filter((p) => p.split === "train"), [points]);
  const testPoints = useMemo(() => points.filter((p) => p.split === "test"), [points]);

  // Log-scaled ridge slider: raw 0..1 maps to λ 0 (off) or 1e-6..1.
  const lambda = lambdaT <= 0 ? 0 : Math.pow(10, -6 + 6 * lambdaT);

  const fit = useMemo(
    () => fitPolynomial(trainPoints, degree, lambda),
    [trainPoints, degree, lambda],
  );
  const trainRmse = useMemo(() => rmse(trainPoints, fit.predict), [trainPoints, fit]);
  const testRmse = useMemo(() => rmse(testPoints, fit.predict), [testPoints, fit]);
  const verdict = classifyFit(trainRmse, testRmse);

  // The money shot: train/test RMSE across every degree, for the current
  // data and λ, recomputed on every interaction (cheap — degree <= 15,
  // points typically < 100).
  const errorCurve = useMemo(() => {
    const rows: { degree: number; train: number; test: number }[] = [];
    for (let d = MIN_DEGREE; d <= MAX_DEGREE; d++) {
      const f = fitPolynomial(trainPoints, d, lambda);
      rows.push({
        degree: d,
        train: rmse(trainPoints, f.predict),
        test: rmse(testPoints, f.predict),
      });
    }
    return rows;
  }, [trainPoints, testPoints, lambda]);

  const [xDomain, yDomain] = useMemo((): [[number, number], [number, number]] => {
    const xs = points.map((p) => p.x);
    const minX = Math.min(PRESET_DOMAIN[0], ...xs);
    const maxX = Math.max(PRESET_DOMAIN[1], ...xs);
    const padX = (maxX - minX) * 0.06 || 1;

    const sampleCount = 60;
    const truthYs: number[] = [];
    for (let i = 0; i <= sampleCount; i++) {
      const x = minX + ((maxX - minX) * i) / sampleCount;
      truthYs.push(groundTruth(x));
    }
    const ys = points.map((p) => p.y);
    const minY = Math.min(...ys, ...truthYs);
    const maxY = Math.max(...ys, ...truthYs);
    const padY = (maxY - minY) * 0.2 || 1;

    return [
      [minX - padX, maxX + padX],
      [minY - padY, maxY + padY],
    ];
  }, [points]);

  const scaleX = (x: number) =>
    MARGIN.left + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * PLOT_W;
  const scaleY = (y: number) =>
    MARGIN.top + (1 - (y - yDomain[0]) / (yDomain[1] - yDomain[0])) * PLOT_H;

  const curvePath = useMemo(() => {
    const samples = 140;
    const bound = (yDomain[1] - yDomain[0]) * 4;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const x = xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / samples;
      const rawY = fit.predict(x);
      const y = clamp(rawY, yDomain[0] - bound, yDomain[1] + bound);
      d += `${i === 0 ? "M" : "L"}${scaleX(x).toFixed(2)},${scaleY(y).toFixed(2)} `;
    }
    return d;
  }, [fit, xDomain, yDomain]);

  const truthPath = useMemo(() => {
    const samples = 140;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const x = xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / samples;
      const y = groundTruth(x);
      d += `${i === 0 ? "M" : "L"}${scaleX(x).toFixed(2)},${scaleY(y).toFixed(2)} `;
    }
    return d;
  }, [xDomain, yDomain]);

  const xTicks = ticksFor(xDomain, 5);
  const yTicks = ticksFor(yDomain, 4);

  const handlePlotClick = (event: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgCoords = point.matrixTransform(ctm.inverse());
    if (
      svgCoords.x < MARGIN.left ||
      svgCoords.x > W - MARGIN.right ||
      svgCoords.y < MARGIN.top ||
      svgCoords.y > H - MARGIN.bottom
    ) {
      return;
    }
    const x = xDomain[0] + ((svgCoords.x - MARGIN.left) / PLOT_W) * (xDomain[1] - xDomain[0]);
    const y = yDomain[1] - ((svgCoords.y - MARGIN.top) / PLOT_H) * (yDomain[1] - yDomain[0]);
    const split: Split = splitRng.current.next() < 0.3 ? "test" : "train";
    setUserPoints((current) => [...current, { x, y, split }]);
  };

  const clearMyPoints = () => setUserPoints([]);
  const resetToPreset = () => {
    setUserPoints([]);
    setDegree(DEFAULT_DEGREE);
    setLambdaT(0);
  };

  // Mini error-vs-degree chart geometry.
  const maxChartError = Math.min(
    CHART_RMSE_CEILING,
    Math.max(1, ...errorCurve.map((r) => Math.max(r.train, r.test))),
  );
  const miniScaleX = (d: number) =>
    MINI_MARGIN.left +
    ((d - MIN_DEGREE) / (MAX_DEGREE - MIN_DEGREE)) * MINI_PLOT_W;
  const miniScaleY = (value: number) =>
    MINI_MARGIN.top +
    (1 - clamp(value, 0, CHART_RMSE_CEILING) / maxChartError) * MINI_PLOT_H;

  const miniPath = (key: "train" | "test") =>
    errorCurve
      .map(
        (row, i) =>
          `${i === 0 ? "M" : "L"}${miniScaleX(row.degree).toFixed(2)},${miniScaleY(row[key]).toFixed(2)}`,
      )
      .join(" ");

  return (
    <div className="flex flex-col gap-6">
      {/* Main scatter + fitted curve */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Degree {degree} fit &mdash; click the plot to add a point
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> train
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-secondary bg-surface" />{" "}
              test
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-primary" /> fit
            </span>
            {showTruth && (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 bg-on-surface-variant/60" /> ground
                truth
              </span>
            )}
          </p>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full cursor-crosshair select-none"
          role="img"
          aria-label="Scatter plot of train and test points with the fitted polynomial curve"
          onClick={handlePlotClick}
        >
          <rect x={0} y={0} width={W} height={H} className="fill-surface" />

          {/* grid */}
          <g className="stroke-outline">
            {xTicks.map((tick) => (
              <line
                key={`gx-${tick}`}
                x1={scaleX(tick)}
                x2={scaleX(tick)}
                y1={MARGIN.top}
                y2={H - MARGIN.bottom}
                strokeWidth={1}
              />
            ))}
            {yTicks.map((tick) => (
              <line
                key={`gy-${tick}`}
                x1={MARGIN.left}
                x2={W - MARGIN.right}
                y1={scaleY(tick)}
                y2={scaleY(tick)}
                strokeWidth={1}
              />
            ))}
          </g>

          {/* axis labels */}
          <g className="fill-on-surface-variant font-mono text-[10px]">
            {xTicks.map((tick) => (
              <text
                key={`xt-${tick}`}
                x={scaleX(tick)}
                y={H - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {tick.toFixed(1)}
              </text>
            ))}
            {yTicks.map((tick) => (
              <text
                key={`yt-${tick}`}
                x={MARGIN.left - 8}
                y={scaleY(tick) + 3}
                textAnchor="end"
              >
                {tick.toFixed(1)}
              </text>
            ))}
          </g>

          {showTruth && (
            <path
              d={truthPath}
              fill="none"
              className="stroke-on-surface-variant/60"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
          )}

          <path d={curvePath} fill="none" className="stroke-primary" strokeWidth={2.5} />

          {testPoints.map((p, i) => (
            <circle
              key={`test-${i}`}
              cx={scaleX(p.x)}
              cy={scaleY(p.y)}
              r={4.5}
              className="fill-surface stroke-secondary"
              strokeWidth={2}
            />
          ))}
          {trainPoints.map((p, i) => (
            <circle
              key={`train-${i}`}
              cx={scaleX(p.x)}
              cy={scaleY(p.y)}
              r={4}
              className="fill-primary"
            />
          ))}
        </svg>

        <p className="mt-3 text-[13px] leading-6 text-on-surface-variant">
          Click anywhere on the plot to drop a new point &mdash; it&rsquo;s
          randomly assigned to train or test, same ~70/30 split as the preset
          data.
        </p>
      </div>

      {/* Degree + lambda controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-outline bg-surface-container p-5 accent-left-tertiary">
          <label
            htmlFor="overfitting-degree"
            className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface"
          >
            Polynomial degree <span className="text-tertiary">{degree}</span>
          </label>
          <input
            id="overfitting-degree"
            type="range"
            min={MIN_DEGREE}
            max={MAX_DEGREE}
            step={1}
            value={degree}
            onChange={(event) => setDegree(Number(event.target.value))}
            className="w-full accent-tertiary"
          />
          <p className="mt-2 min-h-[3.25rem] text-[13px] leading-5 text-on-surface-variant">
            More degrees of freedom let the curve bend more sharply. Low
            degrees can only sweep gently; high degrees can loop through
            almost every point.
          </p>
        </div>

        <div className="border border-outline bg-surface-container p-5 accent-left-secondary">
          <label
            htmlFor="overfitting-lambda"
            className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface"
          >
            Ridge &lambda;{" "}
            <span className="text-secondary">{formatLambda(lambda)}</span>
          </label>
          <input
            id="overfitting-lambda"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={lambdaT}
            onChange={(event) => setLambdaT(Number(event.target.value))}
            className="w-full accent-secondary"
          />
          <p className="mt-2 min-h-[3.25rem] text-[13px] leading-5 text-on-surface-variant">
            Penalizes large coefficients, log-scaled from off to strong. Crank
            it up on a high-degree fit and watch the wild curve calm back
            down.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setShowTruth((current) => !current)}
          className={`rounded border px-6 py-4 text-base font-semibold transition ${
            showTruth
              ? "border-tertiary/40 bg-tertiary text-on-tertiary"
              : "border-outline bg-surface-container text-on-surface"
          }`}
        >
          {showTruth ? "Hide Ground Truth" : "Show Ground Truth"}
        </button>
        <button
          type="button"
          onClick={clearMyPoints}
          disabled={userPoints.length === 0}
          className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear My Points
        </button>
        <button
          type="button"
          onClick={resetToPreset}
          className="rounded border border-primary/40 bg-primary px-6 py-4 text-base font-semibold text-on-primary transition"
        >
          Reset to Preset
        </button>
      </div>

      {/* Readouts */}
      <div className="grid border border-outline bg-border sm:grid-cols-3">
        <div className="border-b border-outline bg-surface px-5 py-6 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Train RMSE
          </p>
          <p className="mt-2 font-headline text-3xl font-medium text-on-surface">
            {trainRmse.toFixed(3)}
          </p>
        </div>
        <div className="border-b border-outline bg-surface px-5 py-6 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Test RMSE
          </p>
          <p className="mt-2 font-headline text-3xl font-medium text-on-surface">
            {testRmse.toFixed(3)}
          </p>
        </div>
        <div className="bg-surface px-5 py-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Verdict
          </p>
          <p className={`mt-2 font-headline text-3xl font-medium ${verdictClass(verdict)}`}>
            {verdictLabel(verdict)}
          </p>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-on-surface-variant">
        {verdictCopy(verdict)}
      </p>

      {/* Error vs degree */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Error vs. polynomial degree
          </p>
          <p className="flex items-center gap-x-3 text-[13px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-primary" /> train
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-secondary" /> test
            </span>
          </p>
        </div>

        <svg
          viewBox={`0 0 ${MINI_W} ${MINI_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Train and test RMSE plotted against polynomial degree, from 1 to 15"
        >
          <rect x={0} y={0} width={MINI_W} height={MINI_H} className="fill-surface" />

          <g className="stroke-outline">
            {[MIN_DEGREE, 4, 7, 10, 13, MAX_DEGREE].map((d) => (
              <line
                key={`mgx-${d}`}
                x1={miniScaleX(d)}
                x2={miniScaleX(d)}
                y1={MINI_MARGIN.top}
                y2={MINI_H - MINI_MARGIN.bottom}
                strokeWidth={1}
              />
            ))}
          </g>

          <g className="fill-on-surface-variant font-mono text-[10px]">
            {[MIN_DEGREE, 4, 7, 10, 13, MAX_DEGREE].map((d) => (
              <text
                key={`mxt-${d}`}
                x={miniScaleX(d)}
                y={MINI_H - MINI_MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {d}
              </text>
            ))}
          </g>

          <path d={miniPath("test")} fill="none" className="stroke-secondary" strokeWidth={2} />
          <path d={miniPath("train")} fill="none" className="stroke-primary" strokeWidth={2} />

          {/* marker at current degree */}
          <line
            x1={miniScaleX(degree)}
            x2={miniScaleX(degree)}
            y1={MINI_MARGIN.top}
            y2={MINI_H - MINI_MARGIN.bottom}
            className="stroke-on-surface/40"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <circle
            cx={miniScaleX(degree)}
            cy={miniScaleY(trainRmse)}
            r={4.5}
            className="fill-primary stroke-surface"
            strokeWidth={1.5}
          />
          <circle
            cx={miniScaleX(degree)}
            cy={miniScaleY(testRmse)}
            r={4.5}
            className="fill-secondary stroke-surface"
            strokeWidth={1.5}
          />
        </svg>

        <p className="mt-3 text-[13px] leading-6 text-on-surface-variant">
          Both series are recomputed for the current data and &lambda; at
          every degree from 1 to 15. Train error falls (or flattens)
          monotonically; test error traces the U-shape that defines the
          bias&ndash;variance tradeoff.
        </p>
      </div>
    </div>
  );
}
