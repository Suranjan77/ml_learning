"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { vizTokens } from "@/lib/vizTokens";
import type { ExhibitSceneProps } from "../types";
import {
  DEFAULT_LEARNING_RATE,
  DEFAULT_START,
  DEFAULT_STEPS,
  DOMAIN,
  LEARNING_RATE_RANGE,
  assessStep,
  clampToDomain,
  contourPoints,
  descentPath,
  gradientAt,
  learningRegime,
  type Point,
  type SurfaceKind,
} from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const PLOT = { left: 52, right: 24, top: 24, bottom: 42 } as const;
const PLOT_WIDTH = WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
const STEP_PRESETS = [
  { surface: "bowl", learningRate: DEFAULT_LEARNING_RATE, visibleSteps: 0 },
  { surface: "bowl", learningRate: DEFAULT_LEARNING_RATE, visibleSteps: 1 },
  { surface: "valley", learningRate: 0.9, visibleSteps: 3 },
] as const satisfies readonly { surface: SurfaceKind; learningRate: number; visibleSteps: number }[];

const CONTOUR_LEVELS = {
  bowl: [0.45, 1.25, 2.5, 4.5, 7.5],
  valley: [0.5, 1.5, 3.2, 5.8, 9.5],
} as const;

function toSvg(point: Point): Point {
  return {
    x: PLOT.left + ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT_WIDTH,
    y: PLOT.top + ((DOMAIN.yMax - point.y) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT_HEIGHT,
  };
}

function fromSvg(point: Point): Point {
  return clampToDomain({
    x: DOMAIN.xMin + ((point.x - PLOT.left) / PLOT_WIDTH) * (DOMAIN.xMax - DOMAIN.xMin),
    y: DOMAIN.yMax - ((point.y - PLOT.top) / PLOT_HEIGHT) * (DOMAIN.yMax - DOMAIN.yMin),
  });
}

function pathPoints(points: readonly Point[]): string {
  return points.map((point) => {
    const screen = toSvg(point);
    return `${screen.x.toFixed(1)},${screen.y.toFixed(1)}`;
  }).join(" ");
}

function outcomeLabel(state: ReturnType<typeof assessStep>): string {
  if (state.behaviour === "diverging") return "Loss increased";
  if (state.behaviour === "overshoot") return "Overshoot: crossed the valley";
  if (state.behaviour === "settled") return "At the minimum";
  return "Loss decreased";
}

function presetFor(step: number) {
  return STEP_PRESETS[Math.max(0, Math.min(STEP_PRESETS.length - 1, step))];
}

export default function GradientDescentScene({ step, resetKey }: ExhibitSceneProps) {
  const initialPreset = presetFor(step);
  const svgRef = useRef<SVGSVGElement>(null);
  const clipId = useId();
  const arrowId = useId();
  const gradientId = useId();
  const [surface, setSurface] = useState<SurfaceKind>(initialPreset.surface);
  const [learningRate, setLearningRate] = useState<number>(initialPreset.learningRate);
  const [start, setStart] = useState<Point>(DEFAULT_START);
  const [visibleSteps, setVisibleSteps] = useState<number>(initialPreset.visibleSteps);
  const [running, setRunning] = useState(false);

  const path = useMemo(
    () => descentPath(start, learningRate, surface, DEFAULT_STEPS),
    [learningRate, start, surface],
  );
  const boundedStep = Math.min(visibleSteps, DEFAULT_STEPS);
  const shown = path.slice(0, boundedStep + 1);
  const current = shown[shown.length - 1];
  const before = boundedStep === 0 ? current : path[boundedStep - 1];
  const after = boundedStep === 0 ? path[1] : current;
  const assessment = assessStep(before, after, surface);
  const regime = learningRegime(learningRate, surface);
  const currentScreen = toSvg(current);
  const startScreen = toSvg(start);

  const downhillArrow = (() => {
    const gradient = gradientAt(current, surface);
    const magnitude = Math.hypot(gradient.x, gradient.y);
    if (magnitude < 0.0001) return null;
    const length = 0.72;
    return toSvg({
      x: current.x - (gradient.x / magnitude) * length,
      y: current.y - (gradient.y / magnitude) * length,
    });
  })();

  useEffect(() => {
    const preset = presetFor(step);
    setSurface(preset.surface);
    setLearningRate(preset.learningRate);
    setStart(DEFAULT_START);
    setVisibleSteps(preset.visibleSteps);
    setRunning(false);
  }, [resetKey, step]);

  useEffect(() => {
    if (!running || visibleSteps >= DEFAULT_STEPS) return;
    const timeout = window.setTimeout(() => {
      setVisibleSteps((value) => {
        const next = Math.min(DEFAULT_STEPS, value + 1);
        if (next === DEFAULT_STEPS) setRunning(false);
        return next;
      });
    }, 520);
    return () => window.clearTimeout(timeout);
  }, [running, visibleSteps]);

  function restartPath() {
    setVisibleSteps(0);
    setRunning(false);
  }

  function chooseSurface(next: SurfaceKind) {
    setSurface(next);
    restartPath();
  }

  function chooseStart(next: Point) {
    setStart(clampToDomain(next));
    restartPath();
  }

  function setStartFromPointer(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const pointer = svg.createSVGPoint();
      pointer.x = clientX;
      pointer.y = clientY;
      const local = pointer.matrixTransform(matrix.inverse());
      chooseStart(fromSvg({ x: local.x, y: local.y }));
      return;
    }

    // JSDOM and older embedded browsers may not expose the SVG transform matrix.
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    chooseStart(fromSvg({
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    }));
  }

  function nudgeStart(event: KeyboardEvent<HTMLDivElement>) {
    const amount = event.shiftKey ? 0.4 : 0.16;
    const offsets: Partial<Record<string, Point>> = {
      ArrowLeft: { x: -amount, y: 0 },
      ArrowRight: { x: amount, y: 0 },
      ArrowUp: { x: 0, y: amount },
      ArrowDown: { x: 0, y: -amount },
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    chooseStart({ x: start.x + offset.x, y: start.y + offset.y });
  }

  const comparisonTone = assessment.behaviour === "diverging"
    ? vizTokens.error
    : assessment.behaviour === "overshoot"
      ? vizTokens.path
      : vizTokens.classA;
  const changePercent = Math.abs(assessment.relativeLossDelta * 100);
  const regimeLabel = regime === "diverging" ? "unstable" : regime === "crossing" ? "overshoot range" : "steady";
  const statusDescription = `Step ${boundedStep}. Current loss ${current.loss.toFixed(3)}. ${outcomeLabel(assessment)} on the ${surface} surface. Learning rate ${learningRate.toFixed(2)}.`;

  return (
    <section aria-label="Gradient descent visualisation" className="grid h-full min-h-[22rem] min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div
        role="group"
        tabIndex={0}
        aria-label={`Loss landscape. Start point x ${start.x.toFixed(2)}, y ${start.y.toFixed(2)}. Use arrow keys to move the start point; hold Shift for larger moves.`}
        aria-describedby={`${gradientId}-keyboard-help`}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
        onKeyDown={nudgeStart}
        className="relative min-h-0 overflow-hidden bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        data-testid="loss-landscape"
      >
        <span id={`${gradientId}-keyboard-help`} className="sr-only">Drag across the chart to position the starting point, or use the arrow keys while the chart is focused.</span>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="block h-full w-full touch-none select-none"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setStartFromPointer(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              setStartFromPointer(event.clientX, event.clientY);
            }
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={PLOT.left} y={PLOT.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} />
            </clipPath>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={vizTokens.classA} />
            </marker>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={vizTokens.canvas} />
              <stop offset="62%" stopColor="#EFEADF" />
              <stop offset="100%" stopColor="#EAD7D3" />
            </radialGradient>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
          <g clipPath={`url(#${clipId})`}>
            <rect x={PLOT.left} y={PLOT.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} fill={`url(#${gradientId})`} />

            {[-4, -2, 0, 2, 4].map((tick) => {
              const x = toSvg({ x: tick, y: 0 }).x;
              return <line key={`x-${tick}`} x1={x} x2={x} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} stroke={vizTokens.grid} strokeWidth="1" />;
            })}
            {[-2, 0, 2].map((tick) => {
              const y = toSvg({ x: 0, y: tick }).y;
              return <line key={`y-${tick}`} x1={PLOT.left} x2={WIDTH - PLOT.right} y1={y} y2={y} stroke={vizTokens.grid} strokeWidth="1" />;
            })}

            {CONTOUR_LEVELS[surface].map((level, index) => (
              <polyline
                key={level}
                points={pathPoints(contourPoints(surface, level))}
                fill="none"
                stroke={index === 0 ? vizTokens.classA : vizTokens.border}
                strokeWidth={index === 0 ? 2.4 : 1.4}
                strokeOpacity={0.92 - index * 0.09}
              />
            ))}

            {surface === "valley" && (() => {
              const floor = [
                toSvg({ x: -6, y: -6 * Math.tan(Math.PI / 6) }),
                toSvg({ x: 6, y: 6 * Math.tan(Math.PI / 6) }),
              ];
              return <line x1={floor[0].x} y1={floor[0].y} x2={floor[1].x} y2={floor[1].y} stroke={vizTokens.path} strokeWidth="1.5" strokeDasharray="7 7" opacity="0.8" />;
            })()}

            <polyline points={pathPoints(shown)} fill="none" stroke={vizTokens.path} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            {shown.slice(0, -1).map((point) => {
              const screen = toSvg(point);
              return <circle key={point.iteration} cx={screen.x} cy={screen.y} r="4" fill={vizTokens.path} stroke={vizTokens.pointOutline} strokeWidth="1.5" />;
            })}

            {boundedStep > 0 && (
              <circle cx={startScreen.x} cy={startScreen.y} r="10" fill={vizTokens.canvas} fillOpacity="0.72" stroke={vizTokens.path} strokeWidth="2" strokeDasharray="4 3" />
            )}

            {downhillArrow && (
              <g>
                <line
                  x1={currentScreen.x}
                  y1={currentScreen.y}
                  x2={downhillArrow.x}
                  y2={downhillArrow.y}
                  stroke={vizTokens.classA}
                  strokeWidth="3"
                  markerEnd={`url(#${arrowId})`}
                />
                <text x={downhillArrow.x + 11} y={downhillArrow.y - 8} fill={vizTokens.classA} fontSize="12" fontFamily="var(--font-dm-mono)">local downhill</text>
              </g>
            )}

            <g transform={`translate(${toSvg({ x: 0, y: 0 }).x} ${toSvg({ x: 0, y: 0 }).y})`}>
              <circle r="10" fill={vizTokens.canvas} stroke={vizTokens.classA} strokeWidth="2.5" />
              <circle r="3" fill={vizTokens.classA} />
            </g>

            <g
              style={{ transform: `translate(${currentScreen.x}px, ${currentScreen.y}px)` }}
              className="transition-transform duration-500 ease-out motion-reduce:transition-none"
            >
              <circle r="13" fill={vizTokens.selection} stroke={vizTokens.pointOutline} strokeWidth="3" />
              <circle r="20" fill="none" stroke={vizTokens.selection} strokeWidth="1.5" opacity="0.38" />
            </g>
          </g>

          <rect x={PLOT.left} y={PLOT.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} fill="none" stroke={vizTokens.border} />
          <text x={PLOT.left + 10} y={PLOT.top + 20} fill={vizTokens.mutedInk} fontSize="12" fontFamily="var(--font-dm-mono)">HIGHER LOSS</text>
          <text x={toSvg({ x: 0, y: 0 }).x + 15} y={toSvg({ x: 0, y: 0 }).y - 15} fill={vizTokens.classA} fontSize="12" fontFamily="var(--font-dm-mono)">minimum</text>
          {surface === "valley" && <text x={WIDTH - 39} y={PLOT.top + 21} textAnchor="end" fill={vizTokens.path} fontSize="12" fontFamily="var(--font-dm-mono)">VALLEY FLOOR</text>}

          <g transform={`translate(${WIDTH - 326} ${PLOT.top + 18})`}>
            <rect width="282" height="86" fill={vizTokens.canvas} fillOpacity="0.94" stroke={vizTokens.border} />
            <text x="14" y="20" fill={vizTokens.mutedInk} fontSize="10" fontFamily="var(--font-dm-mono)" letterSpacing="1.3">{boundedStep === 0 ? "NEXT STEP PREVIEW" : `STEP ${boundedStep - 1} → ${boundedStep}`}</text>
            <text x="14" y="49" fill={vizTokens.ink} fontSize="21" fontFamily="var(--font-dm-mono)">{before.loss.toFixed(3)}</text>
            <text x="106" y="48" fill={vizTokens.mutedInk} fontSize="17">→</text>
            <text x="137" y="49" fill={comparisonTone} fontSize="21" fontFamily="var(--font-dm-mono)">{after.loss.toFixed(3)}</text>
            <text x="14" y="72" fill={comparisonTone} fontSize="11" fontFamily="var(--font-dm-mono)">{outcomeLabel(assessment).toUpperCase()}</text>
            <text x="268" y="72" textAnchor="end" fill={comparisonTone} fontSize="11" fontFamily="var(--font-dm-mono)">{changePercent.toFixed(1)}%</text>
          </g>
        </svg>

        <p className="sr-only" aria-live="polite">{statusDescription}</p>
      </div>

      <div className="grid shrink-0 grid-cols-[auto_minmax(8rem,1fr)] gap-x-3 gap-y-2 border-t border-outline bg-surface-container-low p-2 sm:flex sm:items-end sm:gap-4 sm:px-3 sm:py-2">
        <fieldset className="min-w-0">
          <legend className="mb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">Surface</legend>
          <div className="grid grid-cols-2">
            {(["bowl", "valley"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                aria-pressed={surface === kind}
                onClick={() => chooseSurface(kind)}
                className={`min-h-9 border px-3 text-xs capitalize transition-colors ${kind === "valley" ? "-ml-px" : ""} ${surface === kind ? "relative z-10 border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:border-primary"}`}
              >
                {kind}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="min-w-0 flex-1 sm:max-w-sm">
          <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">
            <span>Learning rate</span>
            <span className={regime === "diverging" ? "text-error" : regime === "crossing" ? "text-warning" : "text-primary"}>
              {learningRate.toFixed(2)} · {regimeLabel}
            </span>
          </span>
          <input
            aria-label="Learning rate"
            type="range"
            min={LEARNING_RATE_RANGE.min}
            max={LEARNING_RATE_RANGE.max}
            step={LEARNING_RATE_RANGE.step}
            value={learningRate}
            onChange={(event) => {
              setLearningRate(Number(event.target.value));
              restartPath();
            }}
            className="block min-h-9"
          />
        </label>

        <div className="col-span-2 flex min-w-0 gap-2 sm:ml-auto sm:pb-px">
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setVisibleSteps((value) => Math.min(DEFAULT_STEPS, value + 1));
            }}
            disabled={visibleSteps >= DEFAULT_STEPS}
            className="min-h-9 flex-1 border border-primary bg-primary px-3 text-xs text-on-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            Take step
          </button>
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            disabled={visibleSteps >= DEFAULT_STEPS}
            className="min-h-9 flex-1 border border-outline bg-surface px-3 text-xs text-on-surface hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            {running ? "Pause" : "Run path"}
          </button>
          <button type="button" onClick={restartPath} className="min-h-9 flex-1 border border-outline px-3 text-xs text-on-surface-variant hover:border-primary sm:flex-none">
            Restart
          </button>
        </div>
      </div>
    </section>
  );
}
