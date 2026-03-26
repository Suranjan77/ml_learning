"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Label = 0 | 1;
type Preset = "linear" | "xor" | "rings" | "custom";

interface DataPoint {
  x: number;
  y: number;
  label: Label;
}

interface Network {
  w1: number[][];
  b1: number[];
  w2: number[];
  b2: number;
}

interface Metrics {
  epoch: number;
  loss: number;
  accuracy: number;
}

const BOUNDARY_COLOR = "rgba(255, 255, 255, 0.9)";
const GRID_COLOR = "rgba(255,255,255,0.08)";
const PLOT_BG = "rgb(15, 23, 42)";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanhDerivativeFromActivation = (a: number) => 1 - a * a;

function normalizeCoordinate(value: number) {
  return value / 50 - 1;
}

function toModelInput(point: DataPoint): [number, number] {
  return [normalizeCoordinate(point.x), normalizeCoordinate(point.y)];
}

function createLinearDataset(): DataPoint[] {
  const points: Array<[number, number, Label]> = [
    [16, 20, 0],
    [22, 32, 0],
    [28, 26, 0],
    [34, 40, 0],
    [42, 44, 0],
    [48, 52, 0],
    [58, 56, 1],
    [66, 64, 1],
    [72, 70, 1],
    [78, 78, 1],
    [84, 72, 1],
    [88, 86, 1],
  ];

  return points.map(([x, y, label]) => ({ x, y, label }));
}

function createXorDataset(): DataPoint[] {
  const points: Array<[number, number, Label]> = [
    [18, 18, 0],
    [30, 26, 0],
    [22, 36, 0],
    [72, 72, 0],
    [82, 64, 0],
    [66, 84, 0],
    [18, 78, 1],
    [28, 66, 1],
    [36, 84, 1],
    [72, 22, 1],
    [82, 34, 1],
    [64, 18, 1],
  ];

  return points.map(([x, y, label]) => ({ x, y, label }));
}

function createRingDataset(): DataPoint[] {
  const inner: Array<[number, number]> = [
    [50, 34],
    [40, 38],
    [34, 50],
    [40, 62],
    [50, 66],
    [60, 62],
    [66, 50],
    [60, 38],
  ];

  const outer: Array<[number, number]> = [
    [50, 14],
    [28, 28],
    [14, 50],
    [28, 72],
    [50, 86],
    [72, 72],
    [86, 50],
    [72, 28],
  ];

  return [
    ...inner.map(([x, y]) => ({ x, y, label: 0 as Label })),
    ...outer.map(([x, y]) => ({ x, y, label: 1 as Label })),
  ];
}

function createInitialNetwork(hiddenUnits: number): Network {
  const limit1 = Math.sqrt(6 / (2 + hiddenUnits));
  const limit2 = Math.sqrt(6 / (hiddenUnits + 1));
  const rand = (limit: number) => (Math.random() * 2 - 1) * limit;

  return {
    w1: Array.from({ length: hiddenUnits }, () => [rand(limit1), rand(limit1)]),
    b1: Array.from({ length: hiddenUnits }, () => 0),
    w2: Array.from({ length: hiddenUnits }, () => rand(limit2)),
    b2: 0,
  };
}

function forward(network: Network, x1: number, x2: number) {
  const z1 = network.w1.map(
    ([w11, w12], i) => w11 * x1 + w12 * x2 + network.b1[i],
  );
  const a1 = z1.map((value) => Math.tanh(value));
  const z2 =
    a1.reduce((sum, value, i) => sum + value * network.w2[i], 0) + network.b2;
  const yHat = sigmoid(z2);

  return { z1, a1, z2, yHat };
}

function evaluateNetwork(network: Network, points: DataPoint[]): Metrics {
  if (points.length === 0) {
    return {
      epoch: 0,
      loss: 0,
      accuracy: 0,
    };
  }

  let loss = 0;
  let correct = 0;

  for (const point of points) {
    const [x1, x2] = toModelInput(point);
    const { yHat } = forward(network, x1, x2);
    const clipped = clamp(yHat, 1e-7, 1 - 1e-7);

    loss += -(
      point.label * Math.log(clipped) +
      (1 - point.label) * Math.log(1 - clipped)
    );

    const prediction = yHat >= 0.5 ? 1 : 0;
    if (prediction === point.label) {
      correct += 1;
    }
  }

  return {
    epoch: 0,
    loss: loss / points.length,
    accuracy: correct / points.length,
  };
}

function trainEpoch(
  network: Network,
  points: DataPoint[],
  learningRate: number,
  regularization: number,
): Metrics {
  if (points.length === 0) {
    return {
      epoch: 0,
      loss: 0,
      accuracy: 0,
    };
  }

  const hiddenUnits = network.w1.length;
  const gradW1 = Array.from({ length: hiddenUnits }, () => [0, 0]);
  const gradB1 = Array.from({ length: hiddenUnits }, () => 0);
  const gradW2 = Array.from({ length: hiddenUnits }, () => 0);
  let gradB2 = 0;

  let totalLoss = 0;
  let correct = 0;

  for (const point of points) {
    const [x1, x2] = toModelInput(point);
    const target = point.label;
    const { a1, yHat } = forward(network, x1, x2);

    const clipped = clamp(yHat, 1e-7, 1 - 1e-7);
    totalLoss += -(
      target * Math.log(clipped) +
      (1 - target) * Math.log(1 - clipped)
    );

    const prediction = yHat >= 0.5 ? 1 : 0;
    if (prediction === target) {
      correct += 1;
    }

    const dz2 = yHat - target;

    for (let i = 0; i < hiddenUnits; i += 1) {
      gradW2[i] += dz2 * a1[i];
    }
    gradB2 += dz2;

    for (let i = 0; i < hiddenUnits; i += 1) {
      const da1 = network.w2[i] * dz2;
      const dz1 = da1 * tanhDerivativeFromActivation(a1[i]);
      gradW1[i][0] += dz1 * x1;
      gradW1[i][1] += dz1 * x2;
      gradB1[i] += dz1;
    }
  }

  const n = points.length;

  for (let i = 0; i < hiddenUnits; i += 1) {
    network.w2[i] -=
      learningRate * (gradW2[i] / n + regularization * network.w2[i]);
    network.b1[i] -= learningRate * (gradB1[i] / n);

    network.w1[i][0] -=
      learningRate * (gradW1[i][0] / n + regularization * network.w1[i][0]);
    network.w1[i][1] -=
      learningRate * (gradW1[i][1] / n + regularization * network.w1[i][1]);
  }

  network.b2 -= learningRate * (gradB2 / n);

  return {
    epoch: 1,
    loss: totalLoss / n,
    accuracy: correct / n,
  };
}

function hasBothClasses(points: DataPoint[]) {
  let hasA = false;
  let hasB = false;

  for (const point of points) {
    if (point.label === 0) {
      hasA = true;
    } else {
      hasB = true;
    }
  }

  return hasA && hasB;
}

function getPresetDefaults(preset: Preset) {
  switch (preset) {
    case "xor":
      return {
        hiddenUnits: 8,
        learningRate: 0.08,
        regularization: 0.0005,
        description:
          "XOR is not linearly separable, so the hidden layer has to bend the decision boundary.",
      };
    case "rings":
      return {
        hiddenUnits: 10,
        learningRate: 0.06,
        regularization: 0.0008,
        description:
          "The ring dataset needs a curved boundary, which is a good test of hidden-layer capacity.",
      };
    case "linear":
      return {
        hiddenUnits: 4,
        learningRate: 0.05,
        regularization: 0.0002,
        description:
          "The linear dataset should converge quickly and produce a nearly straight separating boundary.",
      };
    default:
      return {
        hiddenUnits: 6,
        learningRate: 0.06,
        regularization: 0.0005,
        description:
          "Custom datasets can be linearly or non-linearly separable depending on where you place the points.",
      };
  }
}

export default function AlgorithmSimulator() {
  const initialPreset = "linear";
  const initialDefaults = getPresetDefaults(initialPreset);

  const [points, setPoints] = useState<DataPoint[]>(() =>
    createLinearDataset(),
  );
  const [activeLabel, setActiveLabel] = useState<Label>(0);
  const [preset, setPreset] = useState<Preset>(initialPreset);
  const [hiddenUnits, setHiddenUnits] = useState(initialDefaults.hiddenUnits);
  const [learningRate, setLearningRate] = useState(
    initialDefaults.learningRate,
  );
  const [regularization, setRegularization] = useState(
    initialDefaults.regularization,
  );
  const [running, setRunning] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>(() => {
    const initialEvaluation = evaluateNetwork(
      createInitialNetwork(initialDefaults.hiddenUnits),
      createLinearDataset(),
    );

    return {
      ...initialEvaluation,
      epoch: 0,
    };
  });
  const [statusText, setStatusText] = useState(
    getPresetDefaults(initialPreset).description,
  );

  const plotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const networkRef = useRef<Network>(
    createInitialNetwork(initialDefaults.hiddenUnits),
  );

  const datasetSummary = useMemo(() => {
    const classA = points.filter((point) => point.label === 0).length;
    const classB = points.length - classA;

    return {
      total: points.length,
      classA,
      classB,
    };
  }, [points]);

  const canTrain = hasBothClasses(points);

  const syncMetricsToCurrentState = (nextPoints = points) => {
    const current = evaluateNetwork(networkRef.current, nextPoints);
    setMetrics((existing) => ({
      epoch: existing.epoch,
      loss: current.loss,
      accuracy: current.accuracy,
    }));
  };

  const resetNetwork = (
    nextHiddenUnits = hiddenUnits,
    nextPoints = points,
    nextStatus?: string,
  ) => {
    networkRef.current = createInitialNetwork(nextHiddenUnits);
    const evaluation = evaluateNetwork(networkRef.current, nextPoints);

    setRunning(false);
    setHasTrained(false);
    setMetrics({
      epoch: 0,
      loss: evaluation.loss,
      accuracy: evaluation.accuracy,
    });

    if (nextStatus) {
      setStatusText(nextStatus);
      return;
    }

    if (!hasBothClasses(nextPoints)) {
      setStatusText("Add at least one sample from each class before training.");
      return;
    }

    setStatusText(
      "Weights reset. Start training to fit a new binary decision boundary.",
    );
  };

  const applyPreset = (nextPreset: Exclude<Preset, "custom">) => {
    const defaults = getPresetDefaults(nextPreset);
    const nextPoints =
      nextPreset === "xor"
        ? createXorDataset()
        : nextPreset === "rings"
          ? createRingDataset()
          : createLinearDataset();

    setPreset(nextPreset);
    setPoints(nextPoints);
    setHiddenUnits(defaults.hiddenUnits);
    setLearningRate(defaults.learningRate);
    setRegularization(defaults.regularization);

    networkRef.current = createInitialNetwork(defaults.hiddenUnits);
    const evaluation = evaluateNetwork(networkRef.current, nextPoints);

    setRunning(false);
    setHasTrained(false);
    setMetrics({
      epoch: 0,
      loss: evaluation.loss,
      accuracy: evaluation.accuracy,
    });
    setStatusText(defaults.description);
  };

  const clearPoints = () => {
    setPoints([]);
    setPreset("custom");
    resetNetwork(
      hiddenUnits,
      [],
      "Canvas cleared. Add points from both classes to define a new classification task.",
    );
  };

  const handlePlotClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!plotRef.current) {
      return;
    }

    const rect = plotRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 2, 98);
    const y = clamp(
      100 - ((event.clientY - rect.top) / rect.height) * 100,
      2,
      98,
    );

    setPoints((current) => {
      const nextPoints = [...current, { x, y, label: activeLabel }];
      syncMetricsToCurrentState(nextPoints);
      return nextPoints;
    });

    setPreset("custom");
    setStatusText(
      "Dataset updated. Continue training to adapt the decision boundary to your new samples.",
    );
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!plotRef.current || points.length === 0) {
      return;
    }

    const rect = plotRef.current.getBoundingClientRect();
    const clickX = clamp(
      ((event.clientX - rect.left) / rect.width) * 100,
      0,
      100,
    );
    const clickY = clamp(
      100 - ((event.clientY - rect.top) / rect.height) * 100,
      0,
      100,
    );

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    points.forEach((point, index) => {
      const dx = point.x - clickX;
      const dy = point.y - clickY;
      const distance = dx * dx + dy * dy;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setPoints((current) => {
      const nextPoints = current.filter((_, index) => index !== closestIndex);
      syncMetricsToCurrentState(nextPoints);
      return nextPoints;
    });

    setPreset("custom");
    setStatusText(
      "Nearest point removed. Retrain if you want the boundary to fully adapt to the edited dataset.",
    );
  };

  useEffect(() => {
    if (!running) {
      return;
    }

    const tick = () => {
      if (!hasBothClasses(points)) {
        setRunning(false);
        setStatusText(
          "Training paused. Add at least one point from each class before fitting the model.",
        );
        return;
      }

      let latestLoss = 0;
      let latestAccuracy = 0;

      for (let i = 0; i < 6; i += 1) {
        const step = trainEpoch(
          networkRef.current,
          points,
          learningRate,
          regularization,
        );
        latestLoss = step.loss;
        latestAccuracy = step.accuracy;
      }

      setHasTrained(true);
      setMetrics((current) => ({
        epoch: current.epoch + 6,
        loss: latestLoss,
        accuracy: latestAccuracy,
      }));

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [running, points, learningRate, regularization]);

  useEffect(() => {
    const draw = () => {
      const container = plotRef.current;
      const canvas = canvasRef.current;

      if (!container || !canvas) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      context.fillStyle = PLOT_BG;
      context.fillRect(0, 0, width, height);

      const step = 8;

      for (let px = 0; px < width; px += step) {
        for (let py = 0; py < height; py += step) {
          const x = (px / width) * 100;
          const y = 100 - (py / height) * 100;
          const nx = normalizeCoordinate(x);
          const ny = normalizeCoordinate(y);
          const probability = forward(networkRef.current, nx, ny).yHat;

          const classAWeight = 1 - probability;
          const classBWeight = probability;

          const r = Math.round(173 * classAWeight + 208 * classBWeight);
          const g = Math.round(198 * classAWeight + 188 * classBWeight);
          const b = Math.round(255 * classAWeight + 255 * classBWeight);

          context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.18)`;
          context.fillRect(px, py, step, step);

          if (hasTrained && Math.abs(probability - 0.5) < 0.03) {
            context.fillStyle = BOUNDARY_COLOR;
            context.fillRect(px, py, step, step);
          }
        }
      }

      context.strokeStyle = GRID_COLOR;
      context.lineWidth = 1;

      for (let x = 0; x <= width; x += width / 10) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (let y = 0; y <= height; y += height / 10) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
    };

    draw();

    const handleResize = () => {
      draw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [points, metrics, hasTrained]);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => applyPreset("xor")}
          className="rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-left text-sm font-semibold text-primary transition hover:bg-primary/12"
        >
          Load XOR
          <div className="mt-1 text-xs font-normal leading-5 text-slate-400">
            Non-linear pattern that requires a hidden layer.
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyPreset("linear")}
          className="rounded-xl border border-secondary/25 bg-secondary/8 px-4 py-3 text-left text-sm font-semibold text-secondary transition hover:bg-secondary/12"
        >
          Load Linear
          <div className="mt-1 text-xs font-normal leading-5 text-slate-400">
            Easy split for sanity-checking the model.
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyPreset("rings")}
          className="rounded-xl border border-tertiary/25 bg-tertiary/8 px-4 py-3 text-left text-sm font-semibold text-tertiary transition hover:bg-tertiary/12"
        >
          Load Rings
          <div className="mt-1 text-xs font-normal leading-5 text-slate-400">
            Curved boundary to test hidden-unit capacity.
          </div>
        </button>

        <button
          type="button"
          onClick={clearPoints}
          className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Clear Canvas
          <div className="mt-1 text-xs font-normal leading-5 text-slate-400">
            Remove all samples and build a custom dataset.
          </div>
        </button>
      </div>

      <div
        ref={plotRef}
        onClick={handlePlotClick}
        onContextMenu={handleContextMenu}
        className="relative min-h-[360px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-0">
          {points.map((point, index) => (
            <div
              key={`${point.x}-${point.y}-${point.label}-${index}`}
              className={`absolute h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full border shadow-[0_0_16px_rgba(255,255,255,0.14)] ${
                point.label === 0
                  ? "border-primary/80 bg-primary"
                  : "border-secondary/80 bg-secondary"
              }`}
              style={{ left: `${point.x}%`, bottom: `${point.y}%` }}
            />
          ))}
        </div>

        <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-slate-900/85 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">
          One-hidden-layer MLP classifier
        </div>

        <div className="absolute right-4 top-4 rounded-lg border border-white/10 bg-slate-900/85 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
          {hasTrained ? "Decision surface active" : "Random initialization"}
        </div>

        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-slate-900/85 px-4 py-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Class A
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
            Class B
          </span>
          <span className="hidden text-slate-500 sm:inline">|</span>
          <span className="text-slate-400">
            Left click to add, right click to remove
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                Data & Interaction
              </h4>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                Current preset:{" "}
                <span className="font-semibold text-slate-200">
                  {preset === "custom"
                    ? "Custom dataset"
                    : preset === "xor"
                      ? "XOR"
                      : preset === "rings"
                        ? "Rings"
                        : "Linear"}
                </span>
              </p>
            </div>

            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
              2 → {hiddenUnits} → 1
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveLabel(0)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeLabel === 0
                  ? "bg-primary text-slate-950"
                  : "bg-primary/10 text-primary hover:bg-primary/15"
              }`}
            >
              Place Class A
            </button>
            <button
              type="button"
              onClick={() => setActiveLabel(1)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeLabel === 1
                  ? "bg-secondary text-slate-950"
                  : "bg-secondary/10 text-secondary hover:bg-secondary/15"
              }`}
            >
              Place Class B
            </button>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-sm leading-7 text-slate-300">{statusText}</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Samples
              </div>
              <div className="mt-2 text-xl font-bold text-slate-100">
                {datasetSummary.total}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Class A
              </div>
              <div className="mt-2 text-xl font-bold text-primary">
                {datasetSummary.classA}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Class B
              </div>
              <div className="mt-2 text-xl font-bold text-secondary">
                {datasetSummary.classB}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                Model & Metrics
              </h4>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                Binary cross-entropy with full-batch gradient descent.
              </p>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
              Browser NN
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 flex justify-between text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
                Hidden Units <span>{hiddenUnits}</span>
              </label>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={hiddenUnits}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setHiddenUnits(nextValue);
                  resetNetwork(
                    nextValue,
                    points,
                    "Architecture changed. Resetting the network keeps the comparison honest.",
                  );
                }}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="mb-2 flex justify-between text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
                Learning Rate <span>{learningRate.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="0.15"
                step="0.01"
                value={learningRate}
                onChange={(event) =>
                  setLearningRate(Number(event.target.value))
                }
                className="w-full accent-tertiary"
              />
            </div>

            <div>
              <label className="mb-2 flex justify-between text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
                L2 Regularization <span>{regularization.toFixed(4)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="0.01"
                step="0.0005"
                value={regularization}
                onChange={(event) =>
                  setRegularization(Number(event.target.value))
                }
                className="w-full accent-secondary"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!canTrain) {
                  setStatusText(
                    "Add at least one sample from each class before training.",
                  );
                  return;
                }

                setRunning((current) => !current);
                setStatusText(
                  running
                    ? "Training paused. The current surface reflects the latest fitted weights."
                    : "Training started. Watch the heatmap sharpen into a decision boundary.",
                );
              }}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110"
            >
              {running ? "Pause Training" : "Start Training"}
            </button>

            <button
              type="button"
              onClick={() => resetNetwork()}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Reset Weights
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Epoch
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-100">
                {metrics.epoch}
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Loss
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-100">
                {metrics.loss.toFixed(3)}
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Accuracy
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-100">
                {(metrics.accuracy * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-slate-400">
            The plot shows a one-hidden-layer MLP classifier trained on the
            exact points you place. White regions mark the approximate 50%
            decision contour, while the background tint shows class probability.
          </div>
        </div>
      </div>
    </div>
  );
}
