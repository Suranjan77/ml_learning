"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSeededRNG } from "@/lib/prng";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsVisible } from "@/lib/useIsVisible";

type Point = { x: number; y: number; label: 0 | 1 };

type Network = {
  w1: number[][]; // HIDDEN x 2
  b1: number[];
  w2: number[][]; // HIDDEN x HIDDEN
  b2: number[];
  w3: number[]; // HIDDEN
  b3: number;
};

const HIDDEN = 8;
const DATA_SEED = 4242;
const NET_SEED = 1337;
const GRID_COLS = 56;
const GRID_ROWS = 36;
const DOMAIN_X: [number, number] = [-1.6, 2.6];
const DOMAIN_Y: [number, number] = [-1.3, 1.6];
const LEARNING_RATE = 0.1;
const STEPS_PER_FRAME = 10;
const RESTART_AFTER_STEPS = 4000;
const REDUCED_MOTION_STEPS = 600;

// Sage green (class 0) and terracotta (class 1) — matches the palette used
// throughout the site's other canvas visualizations (see AlgorithmSimulator).
const CLASS_0_RGB: [number, number, number] = [138, 154, 134];
const CLASS_1_RGB: [number, number, number] = [195, 141, 125];
const CLASS_0_DOT = "#556B4A";
const CLASS_1_DOT = "#8D5149";
const DOT_OUTLINE = "#FAF8F2";

function makeDataset(seed: number): Point[] {
  const rng = createSeededRNG(seed);
  const points: Point[] = [];
  const half = 60;
  for (let i = 0; i < half; i++) {
    const t = (Math.PI * i) / (half - 1);
    points.push({
      x: Math.cos(t) + rng.nextGaussian() * 0.09,
      y: Math.sin(t) + rng.nextGaussian() * 0.09,
      label: 0,
    });
  }
  for (let i = 0; i < half; i++) {
    const t = (Math.PI * i) / (half - 1);
    points.push({
      x: 1 - Math.cos(t) + rng.nextGaussian() * 0.09,
      y: 0.5 - Math.sin(t) + rng.nextGaussian() * 0.09,
      label: 1,
    });
  }
  return points;
}

function createNetwork(seed: number): Network {
  const rng = createSeededRNG(seed);
  const rand = () => (rng.next() - 0.5) * 1.2;
  return {
    w1: Array.from({ length: HIDDEN }, () => [rand(), rand()]),
    b1: new Array(HIDDEN).fill(0),
    w2: Array.from({ length: HIDDEN }, () => Array.from({ length: HIDDEN }, rand)),
    b2: new Array(HIDDEN).fill(0),
    w3: Array.from({ length: HIDDEN }, rand),
    b3: 0,
  };
}

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

function forward(net: Network, x0: number, x1: number) {
  const h1 = new Array(HIDDEN);
  for (let i = 0; i < HIDDEN; i++) {
    h1[i] = Math.tanh(net.w1[i][0] * x0 + net.w1[i][1] * x1 + net.b1[i]);
  }
  const h2 = new Array(HIDDEN);
  for (let j = 0; j < HIDDEN; j++) {
    let z = net.b2[j];
    for (let i = 0; i < HIDDEN; i++) z += net.w2[j][i] * h1[i];
    h2[j] = Math.tanh(z);
  }
  let zOut = net.b3;
  for (let j = 0; j < HIDDEN; j++) zOut += net.w3[j] * h2[j];
  return { h1, h2, out: sigmoid(zOut) };
}

/** One full-batch SGD step. Mutates `net` in place, returns the mean loss. */
function trainStep(net: Network, points: Point[], lr: number): number {
  const gw1 = Array.from({ length: HIDDEN }, () => [0, 0]);
  const gb1 = new Array(HIDDEN).fill(0);
  const gw2 = Array.from({ length: HIDDEN }, () => new Array(HIDDEN).fill(0));
  const gb2 = new Array(HIDDEN).fill(0);
  const gw3 = new Array(HIDDEN).fill(0);
  let gb3 = 0;
  let lossSum = 0;
  const eps = 1e-7;
  const n = points.length;

  for (const p of points) {
    const { h1, h2, out } = forward(net, p.x, p.y);
    const y = p.label;
    lossSum += -(y * Math.log(out + eps) + (1 - y) * Math.log(1 - out + eps));

    const dOut = out - y;
    for (let j = 0; j < HIDDEN; j++) gw3[j] += dOut * h2[j];
    gb3 += dOut;

    const dh2 = new Array(HIDDEN);
    for (let j = 0; j < HIDDEN; j++) {
      dh2[j] = dOut * net.w3[j] * (1 - h2[j] * h2[j]);
    }
    for (let j = 0; j < HIDDEN; j++) {
      for (let i = 0; i < HIDDEN; i++) gw2[j][i] += dh2[j] * h1[i];
      gb2[j] += dh2[j];
    }

    const dh1 = new Array(HIDDEN).fill(0);
    for (let i = 0; i < HIDDEN; i++) {
      let sum = 0;
      for (let j = 0; j < HIDDEN; j++) sum += dh2[j] * net.w2[j][i];
      dh1[i] = sum * (1 - h1[i] * h1[i]);
    }
    for (let i = 0; i < HIDDEN; i++) {
      gw1[i][0] += dh1[i] * p.x;
      gw1[i][1] += dh1[i] * p.y;
      gb1[i] += dh1[i];
    }
  }

  const scale = lr / n;
  for (let i = 0; i < HIDDEN; i++) {
    net.w1[i][0] -= scale * gw1[i][0];
    net.w1[i][1] -= scale * gw1[i][1];
    net.b1[i] -= scale * gb1[i];
  }
  for (let j = 0; j < HIDDEN; j++) {
    for (let i = 0; i < HIDDEN; i++) net.w2[j][i] -= scale * gw2[j][i];
    net.b2[j] -= scale * gb2[j];
    net.w3[j] -= scale * gw3[j];
  }
  net.b3 -= scale * gb3;

  return lossSum / n;
}

/**
 * Hero ornament: a tiny 2→8→8→1 MLP that trains itself, endlessly, on a
 * two-moons dataset, right there in the page. No controls — it just proves
 * the site is alive. Pauses off-screen and degrades to a single static
 * frame when the user prefers reduced motion.
 */
export default function HeroTrainingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<Network>(createNetwork(NET_SEED));
  const stepsRef = useRef(0);
  const restartsRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const reducedMotion = useReducedMotion();
  const isVisible = useIsVisible(containerRef);
  const points = useMemo(() => makeDataset(DATA_SEED), []);

  const [caption, setCaption] = useState({ step: 0, loss: 1 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const [xMin, xMax] = DOMAIN_X;
    const [yMin, yMax] = DOMAIN_Y;
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;

    for (let cx = 0; cx < GRID_COLS; cx++) {
      const dataX = xMin + ((cx + 0.5) / GRID_COLS) * (xMax - xMin);
      for (let cy = 0; cy < GRID_ROWS; cy++) {
        const dataY = yMin + (1 - (cy + 0.5) / GRID_ROWS) * (yMax - yMin);
        const { out } = forward(networkRef.current, dataX, dataY);
        const r = Math.round(CLASS_0_RGB[0] * (1 - out) + CLASS_1_RGB[0] * out);
        const g = Math.round(CLASS_0_RGB[1] * (1 - out) + CLASS_1_RGB[1] * out);
        const b = Math.round(CLASS_0_RGB[2] * (1 - out) + CLASS_1_RGB[2] * out);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.32)`;
        ctx.fillRect(cx * cellW, cy * cellH, cellW + 1, cellH + 1);
      }
    }

    for (const p of points) {
      const px = ((p.x - xMin) / (xMax - xMin)) * width;
      const py = (1 - (p.y - yMin) / (yMax - yMin)) * height;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? CLASS_0_DOT : CLASS_1_DOT;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = DOT_OUTLINE;
      ctx.stroke();
    }
  }, [points]);

  useEffect(() => {
    if (reducedMotion) {
      let loss = 1;
      for (let s = 0; s < REDUCED_MOTION_STEPS; s++) {
        loss = trainStep(networkRef.current, points, LEARNING_RATE);
      }
      draw();
      setCaption({ step: REDUCED_MOTION_STEPS, loss });

      const handleResize = () => draw();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    if (!isVisible) {
      return;
    }

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      let loss = 0;
      for (let i = 0; i < STEPS_PER_FRAME; i++) {
        loss = trainStep(networkRef.current, points, LEARNING_RATE);
        stepsRef.current += 1;
      }
      if (stepsRef.current >= RESTART_AFTER_STEPS) {
        restartsRef.current += 1;
        networkRef.current = createNetwork(NET_SEED + restartsRef.current * 97);
        stepsRef.current = 0;
      }
      draw();
      setCaption({ step: stepsRef.current, loss });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [reducedMotion, isVisible, points, draw]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative aspect-[16/10] w-full border border-outline bg-surface"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A small neural network training live in the browser, its decision boundary reshaping as it learns."
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
        <span>
          step {caption.step.toLocaleString()} · loss {caption.loss.toFixed(2)}
        </span>
        <span className="inline-flex items-center gap-2 text-primary">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            aria-hidden="true"
          />
          live — training in your browser
        </span>
      </div>
    </div>
  );
}
