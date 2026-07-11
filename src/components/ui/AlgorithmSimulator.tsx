"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Label = 0 | 1;
type Activation = "tanh" | "relu" | "sigmoid";
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
  vW1: number[][];
  vB1: number[];
  vW2: number[];
  vB2: number;
}

interface Metrics {
  epoch: number;
  loss: number;
  accuracy: number;
}

const BOUNDARY_COLOR = "#292524"; // Stark, unyielding deep charcoal boundary
const GRID_COLOR = "rgba(44, 42, 41, 0.08)"; // Subtle charcoal grid
const PLOT_BG = "#F6F3EC"; // Deep warm surface container background

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanhDerivativeFromActivation = (a: number) => 1 - a * a;
const reluDerivativeFromActivation = (a: number) => a > 0 ? 1 : 0;
const sigmoidDerivativeFromActivation = (a: number) => a * (1 - a);

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
    vW1: Array.from({ length: hiddenUnits }, () => [0, 0]),
    vB1: Array.from({ length: hiddenUnits }, () => 0),
    vW2: Array.from({ length: hiddenUnits }, () => 0),
    vB2: 0,
  };
}

function forward(network: Network, x1: number, x2: number, activation: Activation) {
  const z1 = network.w1.map(
    ([w11, w12], i) => w11 * x1 + w12 * x2 + network.b1[i],
  );
  const a1 = z1.map((value) => 
    activation === "relu" ? Math.max(0, value) : activation === "sigmoid" ? sigmoid(value) : Math.tanh(value)
  );
  const z2 =
    a1.reduce((sum, value, i) => sum + value * network.w2[i], 0) + network.b2;
  const yHat = sigmoid(z2);

  return { z1, a1, z2, yHat };
}

function evaluateNetwork(network: Network, points: DataPoint[], activation: Activation): Metrics {
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
    const { yHat } = forward(network, x1, x2, activation);
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

function calculateWeightNorm(network: Network) {
  const w1Norm = Math.sqrt(
    network.w1.reduce((sum, row) => sum + row[0] ** 2 + row[1] ** 2, 0),
  );
  const w2Norm = Math.sqrt(network.w2.reduce((sum, weight) => sum + weight ** 2, 0));

  return w1Norm + w2Norm;
}

function trainEpoch(
  network: Network,
  points: DataPoint[],
  learningRate: number,
  regularization: number,
  activation: Activation,
  momentum: number,
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
    const { a1, yHat } = forward(network, x1, x2, activation);

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
      const dz1 = da1 * (activation === "relu" ? reluDerivativeFromActivation(a1[i]) : activation === "sigmoid" ? sigmoidDerivativeFromActivation(a1[i]) : tanhDerivativeFromActivation(a1[i]));
      gradW1[i][0] += dz1 * x1;
      gradW1[i][1] += dz1 * x2;
      gradB1[i] += dz1;
    }
  }

  const n = points.length;

  for (let i = 0; i < hiddenUnits; i += 1) {
    network.vW2[i] = momentum * network.vW2[i] + learningRate * (gradW2[i] / n + regularization * network.w2[i]);
    network.w2[i] -= network.vW2[i];
    
    network.vB1[i] = momentum * network.vB1[i] + learningRate * (gradB1[i] / n);
    network.b1[i] -= network.vB1[i];

    network.vW1[i][0] = momentum * network.vW1[i][0] + learningRate * (gradW1[i][0] / n + regularization * network.w1[i][0]);
    network.w1[i][0] -= network.vW1[i][0];
    
    network.vW1[i][1] = momentum * network.vW1[i][1] + learningRate * (gradW1[i][1] / n + regularization * network.w1[i][1]);
    network.w1[i][1] -= network.vW1[i][1];
  }

  network.vB2 = momentum * network.vB2 + learningRate * (gradB2 / n);
  network.b2 -= network.vB2;

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
  const [activation, setActivation] = useState<Activation>("tanh");
  const [momentum, setMomentum] = useState(0.9);
  const [running, setRunning] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    epoch: 0,
    loss: 0,
    accuracy: 0,
  });
  const [weightNorm, setWeightNorm] = useState(0);
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
    vW1: [],
    vB1: [],
    vW2: [],
    vB2: 0,
  });

  // Initial randomization on client only to avoid hydration mismatch
  useEffect(() => {
    networkRef.current = createInitialNetwork(initialDefaults.hiddenUnits);
    setWeightNorm(calculateWeightNorm(networkRef.current));
    const initialEvaluation = evaluateNetwork(
      networkRef.current,
      createLinearDataset(),
      "tanh"
    );
    setMetrics({
      ...initialEvaluation,
      epoch: 0,
    });
  }, [initialDefaults.hiddenUnits]);

  // Apply a shared configuration from the query string, e.g.
  // /playground?preset=xor&h=8&lr=0.08&reg=0.0005&act=tanh&m=0.9
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasConfig = ["preset", "h", "lr", "reg", "act", "m"].some(
      (key) => params.get(key) !== null,
    );

    if (!hasConfig) {
      return;
    }

    const readNumber = (key: string, min: number, max: number) => {
      const raw = params.get(key);
      if (raw === null) return undefined;
      const value = Number(raw);
      return Number.isFinite(value) ? clamp(value, min, max) : undefined;
    };

    const presetParam = params.get("preset");
    const nextPreset: Exclude<Preset, "custom"> =
      presetParam === "xor" || presetParam === "rings"
        ? presetParam
        : "linear";
    const defaults = getPresetDefaults(nextPreset);
    const nextPoints =
      nextPreset === "xor"
        ? createXorDataset()
        : nextPreset === "rings"
          ? createRingDataset()
          : createLinearDataset();

    const nextHiddenUnits = Math.round(
      readNumber("h", 2, 16) ?? defaults.hiddenUnits,
    );
    const nextLearningRate = readNumber("lr", 0.01, 0.15) ?? defaults.learningRate;
    const nextRegularization = readNumber("reg", 0, 0.01) ?? defaults.regularization;
    const nextMomentum = readNumber("m", 0, 0.99) ?? 0.9;
    const actParam = params.get("act");
    const nextActivation: Activation =
      actParam === "relu" || actParam === "sigmoid" ? actParam : "tanh";

    setPreset(nextPreset);
    setPoints(nextPoints);
    setHiddenUnits(nextHiddenUnits);
    setLearningRate(nextLearningRate);
    setRegularization(nextRegularization);
    setMomentum(nextMomentum);
    setActivation(nextActivation);

    networkRef.current = createInitialNetwork(nextHiddenUnits);
    setWeightNorm(calculateWeightNorm(networkRef.current));
    const evaluation = evaluateNetwork(
      networkRef.current,
      nextPoints,
      nextActivation,
    );
    setMetrics({ epoch: 0, loss: evaluation.loss, accuracy: evaluation.accuracy });
    setStatusText(
      "Shared configuration loaded. Start training to fit the model.",
    );
  }, []);

  const copySetupLink = async () => {
    const params = new URLSearchParams();
    if (preset !== "custom") {
      params.set("preset", preset);
    }
    params.set("h", String(hiddenUnits));
    params.set("lr", learningRate.toFixed(2));
    params.set("reg", regularization.toFixed(4));
    params.set("act", activation);
    params.set("m", momentum.toFixed(2));

    const query = `?${params.toString()}`;
    const url = `${window.location.origin}${window.location.pathname}${query}`;
    window.history.replaceState(null, "", query);

    try {
      await navigator.clipboard.writeText(url);
      setStatusText(
        preset === "custom"
          ? "Setup link copied. Note: hand-drawn points are not included — only the model settings."
          : "Setup link copied. Opening it restores this dataset and these settings.",
      );
    } catch {
      setStatusText(
        "Link written to the address bar — copy it from there to share this setup.",
      );
    }
  };

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
    const current = evaluateNetwork(networkRef.current, nextPoints, activation);
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
    setWeightNorm(calculateWeightNorm(networkRef.current));
    const evaluation = evaluateNetwork(networkRef.current, nextPoints, activation);

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
    setWeightNorm(calculateWeightNorm(networkRef.current));
    const evaluation = evaluateNetwork(networkRef.current, nextPoints, activation);

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
          activation,
          momentum,
        );
        latestLoss = step.loss;
        latestAccuracy = step.accuracy;
      }

      setWeightNorm(calculateWeightNorm(networkRef.current));
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
  }, [running, points, learningRate, regularization, activation, momentum]);

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
          const probability = forward(networkRef.current, nx, ny, activation).yHat;

          const classAWeight = 1 - probability;
          const classBWeight = probability;

          // Japandi Sage Green (#8A9A86) and Terracotta (#C38D7D)
          const r = Math.round(138 * classAWeight + 195 * classBWeight);
          const g = Math.round(154 * classAWeight + 141 * classBWeight);
          const b = Math.round(134 * classAWeight + 125 * classBWeight);

          // Smooth, soft background probability blending
          context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.22)`;
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

      // Draw observations / data points directly on canvas
      points.forEach((point) => {
        const px = (point.x / 100) * width;
        const py = height - (point.y / 100) * height;

        // Class A: Sage Green (#556B4A)
        // Class B: Terracotta (#8D5149)
        const dotColor = point.label === 0 ? "#556B4A" : "#8D5149";

        // Outer glow
        context.shadowBlur = 6;
        context.shadowColor = dotColor;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 1.5;

        // Draw outer ring / halo
        context.beginPath();
        context.arc(px, py, 6, 0, Math.PI * 2);
        context.fillStyle = dotColor;
        context.fill();

        // Reset shadow for inner parts
        context.shadowBlur = 0;
        context.shadowColor = "transparent";

        // Draw crisp border / outline
        context.strokeStyle = "#FAF8F2"; // Cream white outline
        context.lineWidth = 1.5;
        context.stroke();

        // Draw high-precision observatory reticle center dot
        context.beginPath();
        context.arc(px, py, 1.2, 0, Math.PI * 2);
        context.fillStyle = "#FAF8F2";
        context.fill();
      });
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
          className="rounded border border-outline bg-surface-container p-4 text-left transition hover:border-primary/35"
        >
          <div className="font-mono text-sm font-bold tracking-wide text-primary">Load XOR dataset</div>
          <div className="mt-2 text-[13px] font-medium leading-5 text-on-surface-variant">
            Non‑linear pattern requiring a hidden layer.
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyPreset("linear")}
          className="rounded border border-outline bg-surface-container p-4 text-left transition hover:border-primary/35"
        >
          <div className="font-mono text-sm font-bold tracking-wide text-secondary">Load Linear dataset</div>
          <div className="mt-2 text-[13px] font-medium leading-5 text-on-surface-variant">
            Simple linear separation for model verification.
          </div>
        </button>

        <button
          type="button"
          onClick={() => applyPreset("rings")}
          className="rounded border border-outline bg-surface-container p-4 text-left transition hover:border-primary/35"
        >
          <div className="font-mono text-sm font-bold tracking-wide text-tertiary">Load Rings dataset</div>
          <div className="mt-2 text-[13px] font-medium leading-5 text-on-surface-variant">
            Concentric boundary to assess hidden‑unit capacity.
          </div>
        </button>

        <button
          type="button"
          onClick={clearPoints}
          className="rounded border border-outline bg-surface-container-high p-4 text-left transition hover:border-primary/35"
        >
          <div className="font-mono text-sm font-bold tracking-wide text-on-surface">Clear canvas</div>
          <div className="mt-2 text-[13px] font-medium leading-5 text-on-surface-variant">
            Remove all samples and construct a custom dataset.
          </div>
        </button>
      </div>

      <div
        ref={plotRef}
        onClick={handlePlotClick}
        onContextMenu={handleContextMenu}
        className="relative min-h-[500px] flex-1 cursor-crosshair overflow-hidden border border-outline bg-surface-container"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Informative Overlays (Brutalist style) */}
        <div className="absolute left-4 top-4 border border-outline bg-surface-container-low/90 px-3 py-2 font-mono text-[12px] font-semibold tracking-wide text-on-surface">
          Neural Playground: Click to add data points
        </div>

        <div className="absolute right-4 top-4 border border-outline bg-surface-container-low/90 px-3 py-2 font-mono text-[12px] font-semibold tracking-wide text-on-surface">
          {hasTrained ? "Boundary Actively Updating" : "Random Initial Weights"}
        </div>

        {/* Legend / Info block */}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-4 border border-outline bg-surface-container-low/90 px-4 py-2 font-mono text-[12px] font-semibold tracking-wide text-on-surface">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-primary" />
            Class A
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-error" />
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
        <div className="rounded border border-outline bg-surface-container-low p-6">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-outline pb-4">
            <div>
              <div className="inline-block border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[13px] font-semibold tracking-wide text-primary">
                Step 1
              </div>
              <h4 className="mt-3 font-headline text-2xl font-semibold tracking-normal text-on-surface">
                Inject Data
              </h4>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Adjust points on the canvas. Current Map:{" "}
                <span className="bg-surface-container-highest px-2 py-1 font-semibold text-primary">
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
            <div className="rounded border border-outline bg-surface-container px-3 py-1 font-mono text-[12px] tracking-wide text-on-surface-variant">
              Topology: 2 → {hiddenUnits} → 1
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setActiveLabel(0)}
              className={`rounded border px-5 py-3 text-sm font-semibold transition ${
                activeLabel === 0
                  ? "border-primary/40 bg-primary text-on-primary"
                  : "border-outline bg-surface-container text-primary hover:border-primary/45"
              }`}
            >
              Draw Class A
            </button>
            <button
              type="button"
              onClick={() => setActiveLabel(1)}
              className={`rounded border px-5 py-3 text-sm font-semibold transition ${
                activeLabel === 1
                  ? "border-error/40 bg-error text-on-error"
                  : "border-outline bg-surface-container text-error hover:border-error/45"
              }`}
            >
              Draw Class B
            </button>
          </div>

          <div className="rounded border border-tertiary/30 bg-tertiary/10 p-4 text-sm font-medium text-tertiary">
            Status: {statusText}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-outline pt-6">
            <div className="rounded border border-outline bg-surface-container p-4">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                Total Samples
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-on-surface">
                {datasetSummary.total}
              </div>
            </div>
            <div className="rounded border border-outline bg-surface-container p-4 accent-left-primary">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                Class A
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-primary">
                {datasetSummary.classA}
              </div>
            </div>
            <div className="rounded border border-outline bg-surface-container p-4 accent-left-error">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                Class B
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-error">
                {datasetSummary.classB}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Training */}
        <div className="rounded border border-outline bg-surface-container-low p-6">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-outline pb-4">
            <div>
              <div className="inline-block border border-secondary/30 bg-secondary/10 px-2.5 py-1 font-mono text-[13px] font-semibold tracking-wide text-secondary">
                Step 2
              </div>
              <h4 className="mt-3 font-headline text-2xl font-semibold tracking-normal text-on-surface">
                Train Model
              </h4>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Set capabilities, then run backpropagation to warp the canvas space.
              </p>
            </div>
            <div className="rounded border border-outline bg-surface-container px-3 py-1 font-mono text-[12px] tracking-wide text-on-surface-variant">
              Engine Ready
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="rounded border border-outline bg-surface-container px-4 py-3 accent-left-primary">
              <label className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface">
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
              <p className="mt-2 text-[13px] text-on-surface-variant">Controls how much the decision boundary can bend.</p>
            </div>

            <div className="rounded border border-outline bg-surface-container px-4 py-3 accent-left-tertiary">
              <label className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface">
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
              <p className="mt-2 text-[13px] text-on-surface-variant">How fast the mathematical gradient is traversed.</p>
            </div>

            <div className="rounded border border-outline bg-surface-container px-4 py-3 accent-left-secondary">
              <label className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface">
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
              <p className="mt-2 text-[13px] text-on-surface-variant">Stops extreme overfitting by limiting weight sizes.</p>
            </div>

            <div className="rounded border border-outline bg-surface-container px-4 py-3 accent-left-primary">
              <label className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface">
                Activation <span className="text-primary uppercase">{activation}</span>
              </label>
              <select
                value={activation}
                onChange={(event) => {
                  setActivation(event.target.value as Activation);
                  resetNetwork(hiddenUnits, points, "Activation function changed. Network has been wiped.");
                }}
                className="w-full border border-outline bg-surface p-1 text-sm text-on-surface outline-none focus:border-primary"
              >
                <option value="tanh">Tanh (Smooth)</option>
                <option value="relu">ReLU (Linear)</option>
                <option value="sigmoid">Sigmoid (Soft)</option>
              </select>
              <p className="mt-2 text-[13px] text-on-surface-variant">Non-linear squashing function.</p>
            </div>

            <div className="rounded border border-outline bg-surface-container px-4 py-3 accent-left-tertiary">
              <label className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface">
                Momentum <span className="text-tertiary">{momentum.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={momentum}
                onChange={(event) => setMomentum(Number(event.target.value))}
                className="w-full accent-tertiary"
              />
              <p className="mt-2 text-[13px] text-on-surface-variant">Accelerates gradients in consistent directions.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 border-t border-outline pt-6">
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
                    ? "Training paused. Map shows the currently fitted weights."
                    : "Training started. Watch the decision boundary update.",
                );
              }}
              className={`rounded border px-8 py-4 text-base font-semibold transition ${
                running 
                  ? "border-tertiary/40 bg-tertiary text-on-tertiary" 
                  : "border-primary/40 bg-primary text-on-primary"
              }`}
            >
              {running ? "Pause Training" : "Start Training"}
            </button>

            <button
              type="button"
              onClick={() => resetNetwork()}
              className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition"
            >
              Reset Weights
            </button>

            <button
              type="button"
              onClick={copySetupLink}
              className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition hover:border-primary hover:text-primary"
            >
              Copy Setup Link
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded border border-outline bg-surface-container p-4">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                Epoch
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-on-surface">
                {metrics.epoch}
              </div>
              <div className="mt-1 text-[13px] text-on-surface-variant">Training cycles</div>
            </div>

            <div className="rounded border border-outline bg-surface-container p-4 accent-left-tertiary">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                Loss
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-on-surface">
                {metrics.loss.toFixed(3)}
              </div>
              <div className="mt-1 text-[13px] text-tertiary">Goal: Approach 0.0</div>
            </div>

            <div className="rounded border border-outline bg-surface-container p-4 accent-left-secondary">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                Accuracy
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-on-surface">
                {(metrics.accuracy * 100).toFixed(0)}%
              </div>
              <div className="mt-1 text-[13px] text-secondary">Correctly split dots</div>
            </div>

            <div className="rounded border border-outline bg-surface-container p-4 accent-left-primary">
              <div className="font-mono text-[12px] font-bold tracking-wide text-on-surface-variant">
                ‖W‖
              </div>
              <div className="mt-2 font-headline text-3xl font-semibold text-on-surface">
                {weightNorm.toFixed(2)}
              </div>
              <div className="mt-1 text-[13px] text-primary">Overfitting penalty size</div>
            </div>
          </div>

          <div className="mt-10 space-y-4 border-t border-outline pt-8">
            <h4 className="font-headline text-xl font-medium text-on-surface">
              Core Mathematics
            </h4>

            <div className="rounded border border-outline bg-surface-container px-4 py-3">
              <h5 className="font-mono text-[13px] font-bold tracking-wide text-on-surface">
                Architecture
              </h5>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                This relies on a{" "}
                <strong className="text-on-surface">shallow multi-layer perceptron (MLP)</strong>{" "}
                with a structural path of{" "}
                <code className="bg-surface-container-highest border border-outline px-1 font-mono text-primary">
                  2 → {hiddenUnits} → 1
                </code>
                . (x, y) coordinates map from $[-1, 1]$.
                The hidden layer utilizes{" "}
                <strong className="text-on-surface">tanh</strong> activation to warp the manifold; followed by {" "}
                <strong className="text-on-surface">sigmoid</strong> squashing to resolve final class probability.
              </p>
            </div>

            <div className="rounded border border-outline bg-surface-container px-4 py-3">
              <h5 className="font-mono text-[13px] font-bold tracking-wide text-on-surface">
                Forward Pass
              </h5>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Mathematical flow for every pixel on screen:
              </p>
              <div className="mt-3 border border-outline bg-surface-container-lowest px-4 py-3 font-mono text-sm leading-6 text-primary">
                <div>z = W₁·x + b₁</div>
                <div>a = tanh(z)</div>
                <div>ŷ = σ(w₂ᵀ·a + b₂)</div>
              </div>
            </div>

            <div className="rounded border border-outline bg-surface-container px-4 py-3">
              <h5 className="font-mono text-[13px] font-bold tracking-wide text-on-surface">
                Loss &amp; Gradient Descent
              </h5>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Training strictly minimizes{" "}
                <strong className="text-on-surface">binary cross-entropy</strong> loss iteratively:
              </p>
              <div className="mt-3 border border-outline bg-surface-container-lowest px-4 py-3 font-mono text-sm leading-6 text-tertiary">
                L = −(1/n) Σ [yᵢ log(ŷᵢ) + (1−yᵢ) log(1−ŷᵢ)]
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                We calculate derivatives entirely client-side via{" "}
                <strong className="text-on-surface">backpropagation</strong>, updating the weights constantly:
              </p>
              <div className="mt-3 border border-outline bg-surface-container-lowest px-4 py-3 font-mono text-sm leading-6 text-secondary">
                θ ← θ − η·(∇L + λ·θ)
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
