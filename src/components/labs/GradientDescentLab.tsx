"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsVisible } from "@/lib/useIsVisible";
import {
  SURFACES,
  getSurface,
  initAdamState,
  initMomentumState,
  initRmspropState,
  initSgdState,
  marchingSquaresContours,
  stepAdam,
  stepMomentum,
  stepRmsprop,
  stepSgd,
  type AdamState,
  type Domain,
  type Hyperparams,
  type LossSurface,
  type MomentumState,
  type Point2D,
  type RmspropState,
  type SgdState,
} from "./gradientDescentMath";

// ---------------------------------------------------------------------------
// Optimizer identity: id, label, draw color, and per-kind init/step wiring.
// ---------------------------------------------------------------------------

type OptimizerId = "sgd" | "momentum" | "rmsprop" | "adam";

const OPTIMIZER_META: Record<
  OptimizerId,
  { label: string; color: string; description: string }
> = {
  sgd: {
    label: "SGD",
    color: "#8D5149",
    description: "Plain gradient step, no memory",
  },
  momentum: {
    label: "Momentum",
    color: "#4A6B85",
    description: "Accumulates velocity along consistent directions",
  },
  rmsprop: {
    label: "RMSProp",
    color: "#927A4B",
    description: "Per-axis step size from a running gradient RMS",
  },
  adam: {
    label: "Adam",
    color: "#556B4A",
    description: "Momentum + RMSProp with bias-corrected moments",
  },
};

const OPTIMIZER_IDS: OptimizerId[] = ["sgd", "momentum", "rmsprop", "adam"];

interface Runner {
  x: number;
  y: number;
  step: number;
  loss: number;
}

interface Sim {
  sgd: SgdState;
  momentum: MomentumState;
  rmsprop: RmspropState;
  adam: AdamState;
}

function initSim(start: Point2D, surface: LossSurface): Sim {
  const withLoss = <T extends Runner>(s: T): T => ({
    ...s,
    loss: surface.f(s.x, s.y),
  });
  return {
    sgd: withLoss(initSgdState(start)),
    momentum: withLoss(initMomentumState(start)),
    rmsprop: withLoss(initRmspropState(start)),
    adam: withLoss(initAdamState(start)),
  };
}

/** Keep positions finite and on-canvas even if a learning rate diverges. */
function sanitize(x: number, y: number, domain: Domain): [number, number] {
  const spanX = domain.xMax - domain.xMin;
  const spanY = domain.yMax - domain.yMin;
  const loX = domain.xMin - spanX * 1.5;
  const hiX = domain.xMax + spanX * 1.5;
  const loY = domain.yMin - spanY * 1.5;
  const hiY = domain.yMax + spanY * 1.5;
  const safeX = Number.isFinite(x) ? Math.min(hiX, Math.max(loX, x)) : hiX;
  const safeY = Number.isFinite(y) ? Math.min(hiY, Math.max(loY, y)) : hiY;
  return [safeX, safeY];
}

function advanceSim(sim: Sim, surface: LossSurface, hyper: Hyperparams): Sim {
  const gSgd = surface.grad(sim.sgd.x, sim.sgd.y);
  const nextSgd = stepSgd(sim.sgd, gSgd, hyper);
  const [sx, sy] = sanitize(nextSgd.x, nextSgd.y, surface.domain);
  const sgd: SgdState = { ...nextSgd, x: sx, y: sy, loss: surface.f(sx, sy) };

  const gMom = surface.grad(sim.momentum.x, sim.momentum.y);
  const nextMom = stepMomentum(sim.momentum, gMom, hyper);
  const [mx, my] = sanitize(nextMom.x, nextMom.y, surface.domain);
  const momentum: MomentumState = {
    ...nextMom,
    x: mx,
    y: my,
    loss: surface.f(mx, my),
  };

  const gRms = surface.grad(sim.rmsprop.x, sim.rmsprop.y);
  const nextRms = stepRmsprop(sim.rmsprop, gRms, hyper);
  const [rx, ry] = sanitize(nextRms.x, nextRms.y, surface.domain);
  const rmsprop: RmspropState = {
    ...nextRms,
    x: rx,
    y: ry,
    loss: surface.f(rx, ry),
  };

  const gAdam = surface.grad(sim.adam.x, sim.adam.y);
  const nextAdam = stepAdam(sim.adam, gAdam, hyper);
  const [ax, ay] = sanitize(nextAdam.x, nextAdam.y, surface.domain);
  const adam: AdamState = {
    ...nextAdam,
    x: ax,
    y: ay,
    loss: surface.f(ax, ay),
  };

  return { sgd, momentum, rmsprop, adam };
}

// ---------------------------------------------------------------------------
// Canvas geometry + drawing helpers
// ---------------------------------------------------------------------------

function makeScales(width: number, height: number, domain: Domain) {
  const toScreen = (x: number, y: number): [number, number] => [
    ((x - domain.xMin) / (domain.xMax - domain.xMin)) * width,
    height - ((y - domain.yMin) / (domain.yMax - domain.yMin)) * height,
  ];
  const toWorld = (px: number, py: number): Point2D => ({
    x: domain.xMin + (px / width) * (domain.xMax - domain.xMin),
    y: domain.yMin + (1 - py / height) * (domain.yMax - domain.yMin),
  });
  return { toScreen, toWorld };
}

// ---------------------------------------------------------------------------
// Site palette (hardcoded to match src/app/globals.css — canvas can't read
// Tailwind/CSS custom properties directly).
// ---------------------------------------------------------------------------

const COLOR_BG = "#F5F2EC"; // --color-surface-container-low
const COLOR_WASH_NEAR = "#F9F6F0"; // subtly lighter — near the minimum
const COLOR_WASH_FAR = "#EFEADF"; // --color-surface-container-high
const COLOR_CONTOUR_MINOR = "#BEB6A5"; // --color-outline-dark
const COLOR_CONTOUR_MAJOR = "#6F6658"; // --color-on-surface-variant
const COLOR_INK = "#1E1B16"; // --color-on-surface
const COLOR_INK_MUTED = "#6F6658"; // --color-on-surface-variant
const COLOR_DOT_OUTLINE = "#FAF8F2"; // --color-surface

const CONTOUR_LEVEL_COUNT = 10;
const CONTOUR_COLS = 90;
const CONTOUR_ROWS = 70;
const RANGE_SAMPLE_COLS = 60;
const RANGE_SAMPLE_ROWS = 45;
const TRAIL_RECENT_POINTS = 40;
const LABEL_SEPARATION_PX = 24;

/** Resolves the site's mono font stack once, falling back outside the DOM. */
let cachedMonoFont: string | null = null;
function monoFont(sizePx: number): string {
  if (cachedMonoFont === null) {
    cachedMonoFont =
      typeof document !== "undefined"
        ? getComputedStyle(document.documentElement)
            .getPropertyValue("--font-dm-mono")
            .trim() || "monospace"
        : "monospace";
  }
  return `${sizePx}px ${cachedMonoFont}, monospace`;
}

/** Coarse max-loss estimate over the visible domain, for level spacing. */
function estimateMaxLoss(surface: LossSurface): number {
  const { domain, f } = surface;
  const dx = (domain.xMax - domain.xMin) / RANGE_SAMPLE_COLS;
  const dy = (domain.yMax - domain.yMin) / RANGE_SAMPLE_ROWS;
  let max = -Infinity;
  for (let r = 0; r <= RANGE_SAMPLE_ROWS; r++) {
    for (let c = 0; c <= RANGE_SAMPLE_COLS; c++) {
      const v = f(domain.xMin + c * dx, domain.yMin + r * dy);
      if (Number.isFinite(v) && v > max) max = v;
    }
  }
  return Number.isFinite(max) ? max : 0;
}

/** Log-spaced contour levels between f(minimum)+eps and the domain max. */
function buildContourLevels(surface: LossSurface): number[] {
  const fMin = surface.f(surface.minimum.x, surface.minimum.y);
  const fMax = estimateMaxLoss(surface);
  const span = Math.max(fMax - fMin, 1e-6);
  const eps = span * 0.01;
  const levels: number[] = [];
  for (let i = 0; i < CONTOUR_LEVEL_COUNT; i++) {
    const t = i / (CONTOUR_LEVEL_COUNT - 1);
    const g = eps * Math.pow(span / eps, t);
    levels.push(fMin + g);
  }
  return levels;
}

/**
 * Renders the topographic backdrop — flat wash, contour lines, minimum
 * marker — onto the offscreen canvas. Only depends on the surface (and the
 * pixel size), so it's cached and only rebuilt on surface/domain/resize
 * changes, never per animation frame.
 */
function drawBackground(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  surface: LossSurface,
) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 1. Flat background fill.
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, width, height);

  // 2. Very subtle two-tone wash, lighter near the minimum — depth cue only,
  // the contour lines carry the actual information.
  const { toWorld, toScreen } = makeScales(width, height, surface.domain);
  const fMin = surface.f(surface.minimum.x, surface.minimum.y);
  const fMax = estimateMaxLoss(surface);
  const washSpan = Math.max(fMax - fMin, 1e-6);
  const washStep = 10;
  for (let px = 0; px < width; px += washStep) {
    for (let py = 0; py < height; py += washStep) {
      const { x, y } = toWorld(px, py);
      const t = Math.min(1, Math.max(0, (surface.f(x, y) - fMin) / washSpan));
      const shade = Math.sqrt(t); // biases toward the "far" tone sooner
      ctx.fillStyle = shade < 0.5 ? COLOR_WASH_NEAR : COLOR_WASH_FAR;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(px, py, washStep, washStep);
    }
  }
  ctx.globalAlpha = 1;

  // 3. Contour lines: log-spaced level curves via marching squares.
  const levels = buildContourLevels(surface);
  const contours = marchingSquaresContours(
    surface.f,
    surface.domain,
    levels,
    CONTOUR_COLS,
    CONTOUR_ROWS,
  );
  contours.forEach(({ segments }, i) => {
    if (segments.length === 0) return;
    const isMajor = (i + 1) % 3 === 0;
    ctx.strokeStyle = isMajor ? COLOR_CONTOUR_MAJOR : COLOR_CONTOUR_MINOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const { a, b } of segments) {
      const [ax, ay] = toScreen(a.x, a.y);
      const [bx, by] = toScreen(b.x, b.y);
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  });

  // 4. Minimum marker: crosshair + "min" label.
  const [minX, minY] = toScreen(surface.minimum.x, surface.minimum.y);
  ctx.strokeStyle = COLOR_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(minX - 7, minY);
  ctx.lineTo(minX + 7, minY);
  ctx.moveTo(minX, minY - 7);
  ctx.lineTo(minX, minY + 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(minX, minY, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = monoFont(10);
  ctx.fillStyle = COLOR_INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("min", minX + 13, minY);
}

/** Euclidean distance between two screen points. */
function screenDist(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  pts: Point2D[],
  toScreen: (x: number, y: number) => [number, number],
  color: string,
) {
  if (pts.length < 2) return;
  const splitIdx = Math.max(0, pts.length - 1 - TRAIL_RECENT_POINTS);

  const strokeRange = (from: number, to: number, alpha: number) => {
    if (to <= from) return;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = from; i <= to; i++) {
      const [sx, sy] = toScreen(pts[i].x, pts[i].y);
      if (i === from) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  };

  // Older segment fades slightly; the recent tail is drawn at full opacity.
  strokeRange(0, splitIdx, 0.4);
  strokeRange(splitIdx, pts.length - 1, 0.8);
  ctx.globalAlpha = 1;
}

/**
 * Renders everything that changes per simulation step: trails, current
 * position dots (+ direct labels once separated), the start marker, and the
 * idle affordance hint. Draws the cached background first.
 */
function drawFrame(
  main: HTMLCanvasElement,
  bg: HTMLCanvasElement,
  width: number,
  height: number,
  surface: LossSurface,
  sim: Sim,
  trails: Record<OptimizerId, Point2D[]>,
  startPoint: Point2D,
) {
  const dpr = window.devicePixelRatio || 1;
  if (main.width !== Math.floor(width * dpr) || main.height !== Math.floor(height * dpr)) {
    main.width = Math.floor(width * dpr);
    main.height = Math.floor(height * dpr);
    main.style.width = `${width}px`;
    main.style.height = `${height}px`;
  }
  const ctx = main.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bg, 0, 0, width, height);

  const { toScreen } = makeScales(width, height, surface.domain);

  // Trails (older segments faded, recent tail at full opacity).
  for (const id of OPTIMIZER_IDS) {
    drawTrail(ctx, trails[id], toScreen, OPTIMIZER_META[id].color);
  }

  // Start marker: hollow ring + "start" label.
  const [stx, sty] = toScreen(startPoint.x, startPoint.y);
  ctx.strokeStyle = COLOR_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(stx, sty, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = monoFont(10);
  ctx.fillStyle = COLOR_INK_MUTED;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("start", stx + 11, sty);

  // Current position dots (on top of trails).
  const positions = {} as Record<OptimizerId, [number, number]>;
  for (const id of OPTIMIZER_IDS) {
    const s = sim[id];
    const pos = toScreen(s.x, s.y);
    positions[id] = pos;
    ctx.fillStyle = OPTIMIZER_META[id].color;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLOR_DOT_OUTLINE;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }

  // Direct labels: only once a dot has cleared the pack, so labels never
  // pile up while optimizers are still overlapping near the start.
  ctx.font = monoFont(11);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const id of OPTIMIZER_IDS) {
    const here = positions[id];
    const minDist = Math.min(
      ...OPTIMIZER_IDS.filter((other) => other !== id).map((other) =>
        screenDist(here, positions[other]),
      ),
    );
    if (minDist <= LABEL_SEPARATION_PX) continue;
    ctx.fillStyle = OPTIMIZER_META[id].color;
    ctx.fillText(OPTIMIZER_META[id].label, here[0] + 8, here[1]);
  }

  // Idle affordance hint — only before the sim has taken its first step.
  if (sim.sgd.step === 0) {
    ctx.font = monoFont(12);
    ctx.fillStyle = COLOR_INK_MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("click anywhere to drop the optimizers", width / 2, height - 14);
  }
}

// ---------------------------------------------------------------------------
// Controls helpers
// ---------------------------------------------------------------------------

const LR_MIN_EXP = -3;
const LR_MAX_EXP = 0;
const STEPS_PER_FRAME = 3;
const MAX_STEPS = 1500;
const INSTANT_RUN_STEPS = 200;

function formatLoss(loss: number): string {
  if (!Number.isFinite(loss)) return "∞";
  if (loss >= 1000) return loss.toExponential(2);
  if (loss < 0.001 && loss > 0) return loss.toExponential(2);
  return loss.toFixed(4);
}

function formatLr(lr: number): string {
  if (lr < 0.01) return lr.toExponential(1);
  return lr.toFixed(3);
}

export default function GradientDescentLab() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(containerRef);

  const [surfaceId, setSurfaceId] = useState<string>(SURFACES[0].id);
  const surface = useMemo(() => getSurface(surfaceId), [surfaceId]);

  const [lrExponent, setLrExponent] = useState(-1.3); // ~0.05
  const lr = useMemo(() => Math.pow(10, lrExponent), [lrExponent]);
  const [beta, setBeta] = useState(0.9);
  const [startPoint, setStartPoint] = useState<Point2D>(surface.startDefault);
  const [running, setRunning] = useState(false);

  const [initialSim] = useState<Sim>(() => initSim(startPoint, surface));
  const simRef = useRef<Sim>(initialSim);
  const trailsRef = useRef<Record<OptimizerId, Point2D[]>>({
    sgd: [startPoint],
    momentum: [startPoint],
    rmsprop: [startPoint],
    adam: [startPoint],
  });

  const [readout, setReadout] = useState<Sim>(initialSim);

  const wrapRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const syncReadout = useCallback(() => {
    setReadout({ ...simRef.current });
  }, []);

  const redraw = useCallback(() => {
    const main = mainCanvasRef.current;
    if (!main) return;
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement("canvas");
    }
    const { width, height } = sizeRef.current;
    if (width <= 0 || height <= 0) return;
    drawFrame(
      main,
      bgCanvasRef.current,
      width,
      height,
      surface,
      simRef.current,
      trailsRef.current,
      startPoint,
    );
  }, [surface, startPoint]);

  const rebuildBackground = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (width <= 0 || height <= 0) return;
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement("canvas");
    }
    drawBackground(bgCanvasRef.current, width, height, surface);
    redraw();
  }, [surface, redraw]);

  const resetSim = useCallback(
    (nextStart: Point2D, nextSurface: LossSurface) => {
      simRef.current = initSim(nextStart, nextSurface);
      trailsRef.current = {
        sgd: [nextStart],
        momentum: [nextStart],
        rmsprop: [nextStart],
        adam: [nextStart],
      };
      syncReadout();
      redraw();
    },
    [syncReadout, redraw],
  );

  // Resize handling: measure the wrapper and size the canvas to fill it.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      if (
        width !== sizeRef.current.width ||
        height !== sizeRef.current.height
      ) {
        sizeRef.current = { width, height };
        rebuildBackground();
      }
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
    // Intentionally mount-only: surface changes are handled by the effect
    // below, which rebuilds the background itself.
  }, []);

  // Surface changed: reset the simulation at the new surface's default
  // start point and rebuild the background heatmap.
  useEffect(() => {
    setStartPoint(surface.startDefault);
    resetSim(surface.startDefault, surface);
    rebuildBackground();
  }, [surface]);

  // Redraw whenever the start point changes (e.g. after a click).
  useEffect(() => {
    redraw();
  }, [redraw]);

  const hyper: Hyperparams = useMemo(() => ({ lr, momentum: beta }), [lr, beta]);

  const stepOnce = useCallback(() => {
    if (simRef.current.sgd.step >= MAX_STEPS) return;
    simRef.current = advanceSim(simRef.current, surface, hyper);
    for (const id of OPTIMIZER_IDS) {
      trailsRef.current[id] = [...trailsRef.current[id], simRef.current[id]];
    }
  }, [surface, hyper]);

  const handleStep = useCallback(() => {
    stepOnce();
    syncReadout();
    redraw();
  }, [stepOnce, syncReadout, redraw]);

  const handleRunN = useCallback(
    (n: number) => {
      for (let i = 0; i < n; i++) stepOnce();
      syncReadout();
      redraw();
    },
    [stepOnce, syncReadout, redraw],
  );

  const handleReset = useCallback(() => {
    setRunning(false);
    resetSim(startPoint, surface);
  }, [resetSim, startPoint, surface]);

  // Auto-run animation loop — skipped entirely under reduced motion, and
  // paused whenever the lab scrolls offscreen.
  useEffect(() => {
    if (reducedMotion) return;
    if (!running || !isVisible) return;

    const tick = () => {
      for (let i = 0; i < STEPS_PER_FRAME; i++) stepOnce();
      syncReadout();
      redraw();
      if (simRef.current.sgd.step < MAX_STEPS) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [running, isVisible, reducedMotion, stepOnce, syncReadout, redraw]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const { toWorld } = makeScales(rect.width, rect.height, surface.domain);
      const world = toWorld(px, py);
      setRunning(false);
      setStartPoint(world);
      resetSim(world, surface);
    },
    [surface, resetSim],
  );

  const atMax = readout.sgd.step >= MAX_STEPS;
  const lowestId = OPTIMIZER_IDS.reduce((best, id) =>
    readout[id].loss < readout[best].loss ? id : best,
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Canvas */}
      <div
        ref={wrapRef}
        className="relative aspect-[16/10] w-full border border-outline bg-surface-container-low"
      >
        <canvas
          ref={mainCanvasRef}
          onClick={handleCanvasClick}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          role="img"
          aria-label={`Contour plot of the ${surface.label} loss surface with optimizer trails. Click anywhere to set a new start point.`}
        />

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
          {OPTIMIZER_IDS.map((id) => (
            <div
              key={id}
              title={OPTIMIZER_META[id].description}
              className="flex items-center gap-1.5 border border-outline bg-surface-container-low/90 px-2 py-1 font-mono text-[11px] font-semibold tracking-wide text-on-surface"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: OPTIMIZER_META[id].color }}
                aria-hidden="true"
              />
              {OPTIMIZER_META[id].label}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute right-3 top-3 border border-outline bg-surface-container-low/90 px-2 py-1 font-mono text-[11px] font-semibold tracking-wide text-on-surface-variant">
          Click to set start point
        </div>
      </div>

      {/* Readout table */}
      <div className="overflow-x-auto border border-outline bg-surface">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-outline bg-surface-container">
              <th className="px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Optimizer
              </th>
              <th className="px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Loss
              </th>
              <th className="px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Steps
              </th>
            </tr>
          </thead>
          <tbody>
            {OPTIMIZER_IDS.map((id) => {
              const s = readout[id];
              const isLowest = id === lowestId;
              return (
                <tr
                  key={id}
                  className={`border-b border-outline/50 last:border-0 ${
                    isLowest ? "bg-primary-container/40" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-on-surface">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: OPTIMIZER_META[id].color }}
                        aria-hidden="true"
                      />
                      {OPTIMIZER_META[id].label}
                      {isLowest && (
                        <span className="font-mono text-[10px] uppercase tracking-wide text-primary">
                          lowest
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-on-surface-variant">
                    {formatLoss(s.loss)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-on-surface-variant">
                    {s.step}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-outline bg-surface-container p-5 accent-left-primary">
          <p className="mb-3 font-mono text-[13px] font-bold tracking-wide text-on-surface">
            Loss surface
          </p>
          <div className="flex flex-wrap gap-2">
            {SURFACES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSurfaceId(s.id)}
                className={`border px-3 py-1.5 font-mono text-[12px] font-bold ${
                  s.id === surfaceId
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline bg-surface text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-outline bg-surface-container p-5 accent-left-secondary">
          <label
            htmlFor="gd-momentum"
            className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface"
          >
            Momentum β <span className="text-secondary">{beta.toFixed(2)}</span>
          </label>
          <input
            id="gd-momentum"
            type="range"
            min="0"
            max="0.99"
            step="0.01"
            value={beta}
            onChange={(event) => setBeta(Number(event.target.value))}
            className="w-full accent-secondary"
          />
          <p className="mt-2 text-[13px] leading-5 text-on-surface-variant">
            Only affects the Momentum trail — how much of the previous
            velocity carries into the next step.
          </p>
        </div>

        <div className="border border-outline bg-surface-container p-5 accent-left-tertiary lg:col-span-2">
          <label
            htmlFor="gd-lr"
            className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface"
          >
            Learning rate η{" "}
            <span className="text-tertiary">{formatLr(lr)}</span>
          </label>
          <input
            id="gd-lr"
            type="range"
            min={LR_MIN_EXP}
            max={LR_MAX_EXP}
            step="0.02"
            value={lrExponent}
            onChange={(event) => setLrExponent(Number(event.target.value))}
            className="w-full accent-tertiary"
          />
          <p className="mt-2 text-[13px] leading-5 text-on-surface-variant">
            Log scale from 0.001 to 1 — small moves the ball slowly and
            safely, large risks overshoot or divergence.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setRunning((current) => !current)}
            disabled={atMax && !running}
            className={`rounded border px-8 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              running
                ? "border-tertiary/40 bg-tertiary text-on-tertiary"
                : "border-primary/40 bg-primary text-on-primary"
            }`}
          >
            {running ? "Pause" : "Run"}
          </button>
        )}
        <button
          type="button"
          onClick={handleStep}
          disabled={running || atMax}
          className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary hover:text-primary"
        >
          Step
        </button>
        <button
          type="button"
          onClick={() => handleRunN(INSTANT_RUN_STEPS)}
          disabled={running || atMax}
          className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary hover:text-primary"
        >
          Run {INSTANT_RUN_STEPS} Steps
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition hover:border-primary hover:text-primary"
        >
          Reset
        </button>
      </div>
      {reducedMotion && (
        <p className="text-[13px] text-on-surface-variant">
          Auto-run is disabled because your system prefers reduced motion.
          Use Step or Run {INSTANT_RUN_STEPS} Steps instead.
        </p>
      )}
      {atMax && (
        <p className="text-[13px] text-on-surface-variant">
          Reached the {MAX_STEPS}-step cap. Reset to keep exploring.
        </p>
      )}
    </div>
  );
}
