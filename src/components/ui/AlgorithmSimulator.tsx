"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const BOUNDARY_COLOR = "#FFFFFF"; // Stark, unyielding white boundary
const GRID_COLOR = "rgba(255, 255, 255, 0.15)"; // More visible grid
const PLOT_BG = "#0D0D0D"; // Deep brutalist background

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
  const [metrics, setMetrics] = useState<Metrics>({
    epoch: 0,
    loss: 0,
    accuracy: 0,
  });
  const [statusText, setStatusText] = useState(
    getPresetDefaults(initialPreset).description,
  );

  const plotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const networkRef = useRef<Network>({
    w1: [],
    b1: [],
    w2: [],
    b2: 0,
  });

  // Initial randomization on client only to avoid hydration mismatch
  useEffect(() => {
    networkRef.current = createInitialNetwork(initialDefaults.hiddenUnits);
    const initialEvaluation = evaluateNetwork(
      networkRef.current,
      createLinearDataset(),
    );
    setMetrics({
      ...initialEvaluation,
      epoch: 0,
    });
  }, []);

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

      const step = 4;

      for (let px = 0; px < width; px += step) {
        for (let py = 0; py < height; py += step) {
          const x = (px / width) * 100;
          const y = 100 - (py / height) * 100;
          const nx = normalizeCoordinate(x);
          const ny = normalizeCoordinate(y);
          const probability = forward(networkRef.current, nx, ny).yHat;

          const classAWeight = 1 - probability;
          const classBWeight = probability;

          // Brutalist Pink (#FF3366) and Cyan (#00FFFF)
          const r = Math.round(255 * classAWeight + 0 * classBWeight);
          const g = Math.round(51 * classAWeight + 255 * classBWeight);
          const b = Math.round(102 * classAWeight + 255 * classBWeight);

          // Increased opacity to match brutalist harshness
          context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => applyPreset("xor")}
          className="border-4 border-outline bg-surface-container p-4 text-left transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_var(--color-outline)]"
        >
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-primary">Load XOR</div>
          <div className="mt-2 text-xs font-medium leading-5 text-on-surface-variant">
            Non-linear pattern that requires a hidden layer.
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyPreset("linear")}
          className="border-4 border-outline bg-surface-container p-4 text-left transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_var(--color-outline)]"
        >
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-secondary">Load Linear</div>
          <div className="mt-2 text-xs font-medium leading-5 text-on-surface-variant">
            Easy split for sanity-checking the model.
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyPreset("rings")}
          className="border-4 border-outline bg-surface-container p-4 text-left transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_var(--color-outline)]"
        >
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-tertiary">Load Rings</div>
          <div className="mt-2 text-xs font-medium leading-5 text-on-surface-variant">
            Curved boundary to test hidden-unit capacity.
          </div>
        </button>

        <button
          type="button"
          onClick={clearPoints}
          className="border-4 border-outline bg-surface-highest p-4 text-left transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_var(--color-outline)]"
        >
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-on-surface">Clear Canvas</div>
          <div className="mt-2 text-xs font-medium leading-5 text-on-surface-variant">
            Remove all samples and build a custom dataset.
          </div>
        </button>
      </div>

      <div
        ref={plotRef}
        onClick={handlePlotClick}
        onContextMenu={handleContextMenu}
        className="relative min-h-[500px] flex-1 cursor-crosshair overflow-hidden border-4 border-outline bg-[#0D0D0D]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-0">
          {points.map((point, index) => (
            <div
              key={`${point.x}-${point.y}-${point.label}-${index}`}
              className={`absolute h-4 w-4 -translate-x-1/2 translate-y-1/2 border-2 shadow-[2px_2px_0px_0px_#000] ${
                point.label === 0
                  ? "border-[#000] bg-primary"
                  : "border-[#000] bg-secondary"
              }`}
              style={{ left: `${point.x}%`, bottom: `${point.y}%` }}
            />
          ))}
        </div>

        {/* Informative Overlays (Brutalist style) */}
        <div className="absolute left-4 top-4 border-2 border-outline bg-surface px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface shadow-[4px_4px_0px_0px_var(--color-outline)]">
          Neural Playground: Click to add data
        </div>

        <div className="absolute right-4 top-4 border-2 border-outline bg-surface px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface shadow-[4px_4px_0px_0px_var(--color-outline)]">
          {hasTrained ? "Boundary Actively Updating" : "Random Initial Weights"}
        </div>

        {/* Legend / Info block */}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-4 border-2 border-outline bg-surface px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface shadow-[4px_4px_0px_0px_var(--color-outline)]">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 border border-outline-dark bg-primary shadow-[1px_1px_0px_0px_#000]" />
            Class A
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 border border-outline-dark bg-secondary shadow-[1px_1px_0px_0px_#000]" />
            Class B
          </span>
          <span className="hidden text-outline-variant sm:inline">|</span>
          <span className="text-on-surface-variant">
            Left Click: Add • Right Click: Remove
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Step 1: Data */}
        <div className="border-4 border-outline bg-surface p-6 shadow-[-6px_6px_0px_0px_var(--color-outline)]">
          <div className="mb-6 flex items-start justify-between gap-4 border-b-4 border-outline pb-4">
            <div>
              <div className="inline-block border-2 border-outline-dark bg-primary px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-[#000] shadow-[2px_2px_0px_0px_#000]">
                Step 1
              </div>
              <h4 className="mt-3 font-headline text-2xl font-bold uppercase text-on-surface">
                Inject Data
              </h4>
              <p className="mt-1 font-mono text-sm leading-6 text-on-surface-variant">
                Adjust points on the canvas. Current Map:{" "}
                <span className="bg-surface-highest px-2 py-1 font-semibold text-primary">
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
            <div className="border border-outline bg-surface-lowest px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface">
              Topology: 2 → {hiddenUnits} → 1
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setActiveLabel(0)}
              className={`border-4 px-6 py-3 font-mono text-sm font-bold uppercase transition-transform hover:-translate-y-1 hover:translate-x-1 ${
                activeLabel === 0
                  ? "border-outline-dark bg-primary text-[#000] shadow-[-4px_4px_0px_0px_var(--color-outline-dark)]"
                  : "border-outline bg-surface text-primary shadow-[-4px_4px_0px_0px_var(--color-outline)] hover:border-primary hover:shadow-[-4px_4px_0px_0px_var(--color-primary)]"
              }`}
            >
              Draw Class A
            </button>
            <button
              type="button"
              onClick={() => setActiveLabel(1)}
              className={`border-4 px-6 py-3 font-mono text-sm font-bold uppercase transition-transform hover:-translate-y-1 hover:translate-x-1 ${
                activeLabel === 1
                  ? "border-outline-dark bg-secondary text-[#000] shadow-[-4px_4px_0px_0px_var(--color-outline-dark)]"
                  : "border-outline bg-surface text-secondary shadow-[-4px_4px_0px_0px_var(--color-outline)] hover:border-secondary hover:shadow-[-4px_4px_0px_0px_var(--color-secondary)]"
              }`}
            >
              Draw Class B
            </button>
          </div>

          <div className="border-l-4 border-tertiary bg-tertiary/10 p-4 font-mono text-sm font-medium text-tertiary">
            Status: {statusText}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t-4 border-outline pt-6">
            <div className="border-2 border-outline bg-surface-container p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Total Samples
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-on-surface">
                {datasetSummary.total}
              </div>
            </div>
            <div className="border-2 border-outline bg-surface-container p-4 accent-left-primary">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Class A
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-primary">
                {datasetSummary.classA}
              </div>
            </div>
            <div className="border-2 border-outline bg-surface-container p-4 accent-left-secondary">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Class B
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-secondary">
                {datasetSummary.classB}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Training */}
        <div className="border-4 border-outline bg-surface p-6 shadow-[-6px_6px_0px_0px_var(--color-outline)]">
          <div className="mb-6 flex items-start justify-between gap-4 border-b-4 border-outline pb-4">
            <div>
              <div className="inline-block border-2 border-outline-dark bg-secondary px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest text-[#000] shadow-[2px_2px_0px_0px_#000]">
                Step 2
              </div>
              <h4 className="mt-3 font-headline text-2xl font-bold uppercase text-on-surface">
                Train Model
              </h4>
              <p className="mt-1 font-mono text-sm leading-6 text-on-surface-variant">
                Set capabilities, then run backpropagation to warp the canvas space.
              </p>
            </div>
            <div className="border border-outline bg-surface-lowest px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface">
              Engine Ready
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border-l-4 border-primary bg-surface-container px-4 py-3">
              <label className="mb-2 flex justify-between font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Capacity (Nodes) <span className="text-primary">{hiddenUnits}</span>
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
                    "Architecture changed. Network has been wiped."
                  );
                }}
                className="w-full accent-primary"
              />
              <p className="mt-2 text-xs text-on-surface-variant">Controls how much the decision boundary can bend.</p>
            </div>

            <div className="border-l-4 border-tertiary bg-surface-container px-4 py-3">
              <label className="mb-2 flex justify-between font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Pacing (LR) <span className="text-tertiary">{learningRate.toFixed(2)}</span>
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
              <p className="mt-2 text-xs text-on-surface-variant">How fast the mathematical gradient is traversed.</p>
            </div>

            <div className="border-l-4 border-secondary bg-surface-container px-4 py-3">
              <label className="mb-2 flex justify-between font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Penalty (L2) <span className="text-secondary">{regularization.toFixed(4)}</span>
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
              <p className="mt-2 text-xs text-on-surface-variant">Stops extreme overfitting by limiting weight sizes.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 border-t-4 border-outline pt-6">
            <button
              type="button"
              onClick={() => {
                if (!canTrain) {
                  setStatusText(
                    "Error: Missing classes. Canvas must have both A and B dots.",
                  );
                  return;
                }

                setRunning((current) => !current);
                setStatusText(
                  running
                    ? "SYSTEM HALTED. Map shows currently fitted weights."
                    : "BACKPROPAGATION ENGAGED. Watch boundary morph.",
                );
              }}
              className={`border-4 border-outline-dark px-10 py-5 font-mono text-lg font-black uppercase tracking-widest transition-transform hover:-translate-y-1 hover:translate-x-1 ${
                running 
                  ? "bg-tertiary text-[#000] shadow-[-6px_6px_0px_0px_var(--color-outline-dark)]" 
                  : "bg-primary text-[#000] shadow-[-6px_6px_0px_0px_var(--color-outline-dark)]"
              }`}
            >
              {running ? "■ Pause Training" : "▶ Start Training"}
            </button>

            <button
              type="button"
              onClick={() => resetNetwork()}
              className="border-4 border-outline bg-surface-container px-8 py-5 font-mono text-base font-bold uppercase tracking-widest text-on-surface shadow-[-4px_4px_0px_0px_var(--color-outline)] transition-transform hover:-translate-y-1 hover:translate-x-1"
            >
              Nuke Weights
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-outline bg-surface-container p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Epoch
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-on-surface">
                {metrics.epoch}
              </div>
              <div className="mt-1 text-xs text-on-surface-variant">Training cycles</div>
            </div>

            <div className="border-2 border-outline bg-surface-container p-4 accent-left-tertiary">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Loss
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-on-surface">
                {metrics.loss.toFixed(3)}
              </div>
              <div className="mt-1 text-xs text-tertiary">Goal: Approach 0.0</div>
            </div>

            <div className="border-2 border-outline bg-surface-container p-4 accent-left-secondary">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Accuracy
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-on-surface">
                {(metrics.accuracy * 100).toFixed(0)}%
              </div>
              <div className="mt-1 text-xs text-secondary">Correctly split dots</div>
            </div>

            <div className="border-2 border-outline bg-surface-container p-4 accent-left-primary">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                ‖W‖
              </div>
              <div className="mt-2 font-headline text-3xl font-black text-on-surface">
                {(() => {
                  const net = networkRef.current;
                  const w1Norm = Math.sqrt(
                    net.w1.reduce((s, row) => s + row[0] ** 2 + row[1] ** 2, 0),
                  );
                  const w2Norm = Math.sqrt(
                    net.w2.reduce((s, w) => s + w ** 2, 0),
                  );
                  return (w1Norm + w2Norm).toFixed(2);
                })()}
              </div>
              <div className="mt-1 text-xs text-primary">Overfitting penalty size</div>
            </div>
          </div>

          <div className="mt-10 space-y-4 border-t-4 border-outline pt-8">
            <h4 className="font-headline text-xl font-bold uppercase text-on-surface">
              Core Mathematics
            </h4>

            <div className="border-l-4 border-outline bg-surface-container px-4 py-3">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Architecture
              </h5>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                This relies on a{" "}
                <strong className="text-on-surface">shallow multi-layer perceptron (MLP)</strong>{" "}
                with a structural path of{" "}
                <code className="bg-surface-highest border border-outline px-1 font-mono text-primary">
                  2 → {hiddenUnits} → 1
                </code>
                . (x, y) coordinates map from $[-1, 1]$.
                The hidden layer utilizes{" "}
                <strong className="text-on-surface">tanh</strong> activation to warp the manifold; followed by {" "}
                <strong className="text-on-surface">sigmoid</strong> squashing to resolve final class probability.
              </p>
            </div>

            <div className="border-l-4 border-outline bg-surface-container px-4 py-3">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Forward Pass
              </h5>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Mathematical flow for every pixel on screen:
              </p>
              <div className="mt-3 border-2 border-outline-dark bg-[#000] px-4 py-3 font-mono text-sm leading-6 text-primary shadow-[4px_4px_0px_0px_var(--color-outline-dark)]">
                <div>z = W₁·x + b₁</div>
                <div>a = tanh(z)</div>
                <div>ŷ = σ(w₂ᵀ·a + b₂)</div>
              </div>
            </div>

            <div className="border-l-4 border-outline bg-surface-container px-4 py-3">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Loss &amp; Gradient Descent
              </h5>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Training strictly minimizes{" "}
                <strong className="text-on-surface">binary cross-entropy</strong> loss iteratively:
              </p>
              <div className="mt-3 border-2 border-outline-dark bg-[#000] px-4 py-3 font-mono text-sm leading-6 text-tertiary shadow-[4px_4px_0px_0px_var(--color-outline-dark)]">
                L = −(1/n) Σ [yᵢ log(ŷᵢ) + (1−yᵢ) log(1−ŷᵢ)]
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                We calculate derivatives entirely client-side via{" "}
                <strong className="text-on-surface">backpropagation</strong>, updating the weights constantly:
              </p>
              <div className="mt-3 border-2 border-outline-dark bg-[#000] px-4 py-3 font-mono text-sm leading-6 text-secondary shadow-[4px_4px_0px_0px_var(--color-outline-dark)]">
                θ ← θ − η·(∇L + λ·θ)
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
