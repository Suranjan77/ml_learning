"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { VizCanvas } from "@/lib/three/VizCanvas";
import { vizTokens } from "@/lib/vizTokens";
import type { ExhibitSceneProps } from "../types";
import { enumParam, numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import {
  DEFAULT_LEARNING_RATE,
  DEFAULT_START,
  DEFAULT_STEPS,
  DOMAIN,
  LEARNING_RATE_RANGE,
  assessPath,
  assessStep,
  clampToDomain,
  contourPoints,
  descentPath,
  gradientAt,
  learningRegime,
  lossAt,
  multimodalMinima,
  principalCoordinates,
  type DescentState,
  type Point,
  type SurfaceKind,
} from "./model";

interface ReferenceSeed {
  learningRate: number;
  start: Point;
}

interface StepPreset {
  surface: SurfaceKind;
  learningRate: number;
  visibleSteps: number;
  start: Point;
  reference: ReferenceSeed | null;
}

interface PathReference extends ReferenceSeed {
  path: DescentState[];
}

const BASIN_START = { x: 0.4, y: 0.4 };
const STEP_PRESETS = [
  { surface: "bowl", learningRate: DEFAULT_LEARNING_RATE, visibleSteps: 0, start: DEFAULT_START, reference: null },
  { surface: "bowl", learningRate: DEFAULT_LEARNING_RATE, visibleSteps: 1, start: DEFAULT_START, reference: null },
  { surface: "valley", learningRate: 0.9, visibleSteps: 3, start: DEFAULT_START, reference: { learningRate: 0.4, start: DEFAULT_START } },
  { surface: "multimodal", learningRate: 0.24, visibleSteps: 8, start: BASIN_START, reference: { learningRate: 0.24, start: DEFAULT_START } },
] as const satisfies readonly StepPreset[];

const HEIGHT_SCALE = 0.22;
const MAX_HEIGHT = 4.8;
const CONTOUR_LEVELS = {
  bowl: [0.45, 1.2, 2.3, 3.8],
  valley: [0.35, 0.9, 1.8, 3.2, 5],
} as const;
const MULTIMODAL_MINIMA = multimodalMinima();

function coordinateValue(value: number) {
  return String(Number(value.toFixed(2)));
}

function surfaceHeight(point: Point, surface: SurfaceKind) {
  return Math.min(MAX_HEIGHT, lossAt(point, surface) * HEIGHT_SCALE);
}

function scenePoint(point: Point & { loss?: number }): [number, number, number] {
  const x = Math.max(DOMAIN.xMin, Math.min(DOMAIN.xMax, point.x));
  const y = Math.max(DOMAIN.yMin, Math.min(DOMAIN.yMax, point.y));
  const loss = point.loss ?? 0;
  return [x, Math.min(MAX_HEIGHT, loss * HEIGHT_SCALE) + 0.055, y];
}

function presetFor(step: number) {
  return STEP_PRESETS[Math.max(0, Math.min(STEP_PRESETS.length - 1, step))];
}

function referenceForPreset(preset: StepPreset): PathReference | null {
  return preset.reference
    ? {
        learningRate: preset.reference.learningRate,
        start: { ...preset.reference.start },
        path: descentPath(preset.reference.start, preset.reference.learningRate, preset.surface),
      }
    : null;
}

function outcomeLabel(state: ReturnType<typeof assessStep>): string {
  if (state.behaviour === "diverging") return "Loss increased";
  if (state.behaviour === "overshoot") return "Overshoot: crossed the valley";
  if (state.behaviour === "settled") return "At the minimum";
  return "Loss decreased";
}

function buildSurfaceGeometry(surface: SurfaceKind) {
  const xSegments = 64;
  const ySegments = 40;
  const positions: number[] = [];
  const colours: number[] = [];
  const indices: number[] = [];
  const low = new THREE.Color(vizTokens.canvas);
  const high = new THREE.Color(surface === "bowl" ? "#D1C8B9" : surface === "valley" ? "#BD9187" : "#C6A777");

  for (let row = 0; row <= ySegments; row += 1) {
    const y = DOMAIN.yMin + (row / ySegments) * (DOMAIN.yMax - DOMAIN.yMin);
    for (let column = 0; column <= xSegments; column += 1) {
      const x = DOMAIN.xMin + (column / xSegments) * (DOMAIN.xMax - DOMAIN.xMin);
      const height = surfaceHeight({ x, y }, surface);
      positions.push(x, height, y);
      const colour = low.clone().lerp(high, Math.min(1, height / MAX_HEIGHT));
      colours.push(colour.r, colour.g, colour.b);
    }
  }

  for (let row = 0; row < ySegments; row += 1) {
    for (let column = 0; column < xSegments; column += 1) {
      const a = row * (xSegments + 1) + column;
      const b = a + 1;
      const c = a + xSegments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function LossSurface({
  surface,
  onChooseStart,
  onDraggingChange,
}: {
  surface: SurfaceKind;
  onChooseStart: (point: Point) => void;
  onDraggingChange: (dragging: boolean) => void;
}) {
  const geometry = useMemo(() => buildSurfaceGeometry(surface), [surface]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const choose = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onChooseStart(clampToDomain({ x: event.point.x, y: event.point.z }));
  };

  return (
    <mesh
      geometry={geometry}
      onPointerDown={(event) => {
        choose(event);
        onDraggingChange(true);
        (event.target as unknown as Element).setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if ((event.target as unknown as Element).hasPointerCapture(event.pointerId)) choose(event);
      }}
      onPointerUp={(event) => {
        const target = event.target as unknown as Element;
        if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
        onDraggingChange(false);
      }}
      onPointerCancel={() => onDraggingChange(false)}
    >
      <meshStandardMaterial vertexColors roughness={0.88} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SceneAxes() {
  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let x = -6; x <= 6; x += 1) lines.push([[x, 0, DOMAIN.yMin], [x, 0, DOMAIN.yMax]]);
    for (let y = -3; y <= 3; y += 1) lines.push([[DOMAIN.xMin, 0, y], [DOMAIN.xMax, 0, y]]);
    return lines;
  }, []);

  return (
    <group>
      {gridLines.map((points, index) => <Line key={index} points={points} color={vizTokens.grid} lineWidth={1} />)}
      <Line points={[[DOMAIN.xMin, 0, 0], [DOMAIN.xMax, 0, 0]]} color={vizTokens.axis} lineWidth={1.4} />
      <Line points={[[0, 0, DOMAIN.yMin], [0, 0, DOMAIN.yMax]]} color={vizTokens.axis} lineWidth={1.4} />
      <Line points={[[DOMAIN.xMin, 0, DOMAIN.yMin], [DOMAIN.xMin, MAX_HEIGHT, DOMAIN.yMin]]} color={vizTokens.axis} lineWidth={1.4} />
    </group>
  );
}

function SurfaceContours({ surface }: { surface: SurfaceKind }) {
  if (surface === "multimodal") return null;
  return (
    <group>
      {CONTOUR_LEVELS[surface].map((level, index) => (
        <Line
          key={`${surface}-${level}`}
          points={contourPoints(surface, level, 120).map((point) => [
            point.x,
            Math.min(MAX_HEIGHT, level * HEIGHT_SCALE) + 0.035,
            point.y,
          ] as [number, number, number])}
          color={index === 0 ? vizTokens.classA : vizTokens.border}
          lineWidth={index === 0 ? 2.4 : 1.25}
          transparent
          opacity={index === 0 ? 0.9 : 0.72}
        />
      ))}
    </group>
  );
}

function inDomain(point: Point) {
  return point.x >= DOMAIN.xMin && point.x <= DOMAIN.xMax && point.y >= DOMAIN.yMin && point.y <= DOMAIN.yMax;
}

function drawablePath(path: DescentState[]) {
  const visible: DescentState[] = [];
  for (const point of path) {
    if (!inDomain(point)) break;
    visible.push(point);
  }
  return visible;
}

function DescentScene3D({
  surface,
  path,
  referencePath,
  referenceStart,
  referenceLearningRate,
  shown,
  current,
  start,
  onChooseStart,
  reducedMotion,
}: {
  surface: SurfaceKind;
  path: DescentState[];
  referencePath: DescentState[] | null;
  referenceStart: Point | null;
  referenceLearningRate: number | null;
  shown: DescentState[];
  current: DescentState;
  start: Point;
  onChooseStart: (point: Point) => void;
  reducedMotion: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const trajectory = shown.map(scenePoint);
  const forecast = drawablePath(path).slice(Math.max(0, shown.length - 1)).map(scenePoint);
  const reference = referencePath ? drawablePath(referencePath).map(scenePoint) : [];
  const referenceLabelPosition = reference.length > 1
    ? reference[surface === "multimodal" ? 0 : Math.min(2, reference.length - 1)]
    : null;
  const showReferenceStart = referenceStart && Math.hypot(referenceStart.x - start.x, referenceStart.y - start.y) > 0.05;
  const currentPosition = scenePoint(current);
  const gradient = gradientAt(current, surface);
  const magnitude = Math.hypot(gradient.x, gradient.y);
  const downhill = magnitude < 0.0001 ? null : {
    x: current.x - (gradient.x / magnitude) * 0.9,
    y: current.y - (gradient.y / magnitude) * 0.9,
  };
  const downhillPosition = downhill
    ? [downhill.x, surfaceHeight(downhill, surface) + 0.16, downhill.y] as [number, number, number]
    : null;
  const downhillDirection = downhillPosition
    ? new THREE.Vector3(...downhillPosition).sub(new THREE.Vector3(...currentPosition)).normalize()
    : null;
  const downhillArrowPosition = downhillDirection && downhillPosition
    ? new THREE.Vector3(...downhillPosition).addScaledVector(downhillDirection, -0.12)
    : null;
  const downhillArrowRotation = downhillDirection
    ? new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), downhillDirection)
    : null;

  return (
    <VizCanvas
      label="Three-dimensional loss landscape"
      description="A rotatable loss surface. Height is loss; the highlighted points trace gradient descent through two parameter dimensions."
      className="h-full w-full"
      camera={{ position: [11, 8.5, 12.5], fov: 47, near: 0.1, far: 80 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[5, 9, 6]} intensity={2.2} />
      <SceneAxes />
      <LossSurface surface={surface} onChooseStart={onChooseStart} onDraggingChange={setDragging} />
      <SurfaceContours surface={surface} />

      {reference.length > 1 ? <Line points={reference} color={vizTokens.mutedInk} lineWidth={2.4} transparent opacity={0.34} /> : null}
      {referenceLabelPosition && referenceLearningRate !== null ? (
        <Html position={[referenceLabelPosition[0], referenceLabelPosition[1] + 0.24, referenceLabelPosition[2]]} center zIndexRange={[4, 0]}>
          <span aria-hidden="true" className="pointer-events-none whitespace-nowrap border border-outline-dark bg-surface/95 px-1.5 py-0.5 font-mono text-[8px] uppercase text-on-surface-variant">
            Kept path · {referenceLearningRate.toFixed(2)}
          </span>
        </Html>
      ) : null}
      {forecast.length > 1 ? <Line points={forecast} color={vizTokens.path} lineWidth={2} dashed dashSize={0.12} gapSize={0.1} transparent opacity={0.34} /> : null}
      {trajectory.length > 1 ? <Line points={trajectory} color={vizTokens.path} lineWidth={4} /> : null}
      {shown.slice(0, -1).map((point) => (
        <mesh key={point.iteration} position={scenePoint(point)}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={vizTokens.path} />
        </mesh>
      ))}

      <mesh position={scenePoint({ ...start, loss: lossAt(start, surface) })} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.23, 28]} />
        <meshBasicMaterial color={vizTokens.path} side={THREE.DoubleSide} transparent opacity={0.78} />
      </mesh>
      {showReferenceStart ? (
        <mesh position={scenePoint({ ...referenceStart, loss: lossAt(referenceStart, surface) })} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.3, 28]} />
          <meshBasicMaterial color={vizTokens.mutedInk} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      ) : null}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshBasicMaterial color={vizTokens.classA} />
      </mesh>
      {surface === "multimodal" ? (
        <Html position={[0, 0.42, 0]} center zIndexRange={[3, 0]}>
          <span aria-hidden="true" className="pointer-events-none whitespace-nowrap border border-primary bg-surface/95 px-1.5 py-0.5 font-mono text-[8px] uppercase text-primary">
            Global minimum
          </span>
        </Html>
      ) : null}
      {surface === "multimodal" ? MULTIMODAL_MINIMA.map((minimum, index) => {
        const position = scenePoint(minimum);
        const global = index === 0;
        return <group key={`${minimum.x}-${minimum.y}`}>
          <Line points={[[position[0], 0, position[2]], position]} color={global ? vizTokens.classA : vizTokens.path} lineWidth={1} dashed dashSize={0.06} gapSize={0.05} transparent opacity={0.5} />
          <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={global ? [0.18, 0.29, 28] : [0.12, 0.2, 24]} />
            <meshBasicMaterial color={global ? vizTokens.classA : vizTokens.path} side={THREE.DoubleSide} transparent opacity={global ? 1 : 0.72} />
          </mesh>
        </group>;
      }) : null}
      <mesh position={currentPosition}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={vizTokens.selection} roughness={0.55} />
      </mesh>
      {downhillPosition ? <>
        <Line points={[currentPosition, downhillPosition]} color={vizTokens.classA} lineWidth={3} dashed dashSize={0.12} gapSize={0.08} />
        {downhillArrowPosition && downhillArrowRotation ? (
          <mesh position={downhillArrowPosition} quaternion={downhillArrowRotation}>
            <coneGeometry args={[0.1, 0.24, 18]} />
            <meshBasicMaterial color={vizTokens.classA} />
          </mesh>
        ) : null}
        <Html position={[downhillPosition[0], downhillPosition[1] + 0.22, downhillPosition[2]]} center zIndexRange={[5, 0]}>
          <span aria-hidden="true" className="pointer-events-none whitespace-nowrap border border-primary bg-surface/95 px-1.5 py-0.5 font-mono text-[8px] uppercase text-primary">
            Local downhill
          </span>
        </Html>
      </> : null}

      <OrbitControls
        makeDefault
        enabled={!dragging}
        enablePan={false}
        minDistance={8}
        maxDistance={24}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 1.15, 0]}
      />
    </VizCanvas>
  );
}

export default function GradientDescentScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const initialPreset = presetFor(step);
  const initialReference = referenceForPreset(initialPreset);
  const prefersReduced = Boolean(useReducedMotion());
  const [surface, setSurface] = useState<SurfaceKind>(initialPreset.surface);
  const [learningRate, setLearningRate] = useState<number>(initialPreset.learningRate);
  const [start, setStart] = useState<Point>(initialPreset.start);
  const [visibleSteps, setVisibleSteps] = useState<number>(initialPreset.visibleSteps);
  const [running, setRunning] = useState(false);
  const [reference, setReference] = useState<PathReference | null>(initialReference);

  const syncControls = (nextSurface: SurfaceKind, nextRate: number, nextStart: Point, nextReference: PathReference | null = reference) => replaceSceneUrlState([
    { key: "surface", value: nextSurface, defaultValue: initialPreset.surface },
    { key: "lr", value: String(nextRate), defaultValue: String(initialPreset.learningRate) },
    { key: "x", value: coordinateValue(nextStart.x), defaultValue: coordinateValue(initialPreset.start.x) },
    { key: "y", value: coordinateValue(nextStart.y), defaultValue: coordinateValue(initialPreset.start.y) },
    { key: "compare", value: nextReference ? "on" : "off", defaultValue: initialReference ? "on" : "off" },
    { key: "refX", value: nextReference ? coordinateValue(nextReference.start.x) : "", defaultValue: "" },
    { key: "refY", value: nextReference ? coordinateValue(nextReference.start.y) : "", defaultValue: "" },
    { key: "refLr", value: nextReference ? String(nextReference.learningRate) : "", defaultValue: "" },
  ]);

  const path = useMemo(() => descentPath(start, learningRate, surface, DEFAULT_STEPS), [learningRate, start, surface]);
  const pathAssessment = useMemo(() => assessPath(path, surface), [path, surface]);
  const boundedStep = Math.min(visibleSteps, DEFAULT_STEPS);
  const shown = path.slice(0, boundedStep + 1);
  const current = shown[shown.length - 1];
  const before = boundedStep === 0 ? current : path[boundedStep - 1];
  const after = boundedStep === 0 ? path[1] : current;
  const assessment = assessStep(before, after, surface);
  const regime = learningRegime(learningRate, surface);
  const stepGradient = gradientAt(before, surface);
  const principalGradient = principalCoordinates(stepGradient);
  const update = { x: after.x - before.x, y: after.y - before.y };

  useEffect(() => {
    const preset = presetFor(step);
    setSurface(preset.surface);
    setLearningRate(preset.learningRate);
    setStart({ ...preset.start });
    setVisibleSteps(preset.visibleSteps);
    setRunning(false);
    setReference(referenceForPreset(preset));
  }, [resetKey, step]);

  useEffect(() => {
    if (!playing) return;
    setRunning(true);
    return () => setRunning(false);
  }, [playing, resetKey, step]);

  useSceneUrlState((params) => {
    const restoredSurface = enumParam(params, "surface", ["bowl", "valley", "multimodal"] as const);
    const restoredRate = numberParam(params, "lr", LEARNING_RATE_RANGE);
    const restoredX = numberParam(params, "x", { min: DOMAIN.xMin, max: DOMAIN.xMax, step: 0.01 });
    const restoredY = numberParam(params, "y", { min: DOMAIN.yMin, max: DOMAIN.yMax, step: 0.01 });
    const nextSurface = restoredSurface ?? initialPreset.surface;
    const nextRate = restoredRate ?? initialPreset.learningRate;
    const nextStart = { x: restoredX ?? initialPreset.start.x, y: restoredY ?? initialPreset.start.y };
    setSurface(nextSurface);
    setLearningRate(nextRate);
    setStart(nextStart);

    const referenceX = numberParam(params, "refX", { min: DOMAIN.xMin, max: DOMAIN.xMax, step: 0.01 });
    const referenceY = numberParam(params, "refY", { min: DOMAIN.yMin, max: DOMAIN.yMax, step: 0.01 });
    const referenceRate = numberParam(params, "refLr", LEARNING_RATE_RANGE);
    if (referenceX !== undefined && referenceY !== undefined && referenceRate !== undefined) {
      const referenceStart = { x: referenceX, y: referenceY };
      setReference({ learningRate: referenceRate, start: referenceStart, path: descentPath(referenceStart, referenceRate, nextSurface) });
    } else if (enumParam(params, "compare", ["off"] as const) === "off") {
      setReference(null);
    } else {
      setReference(referenceForPreset(initialPreset));
    }
  }, step);

  useEffect(() => {
    if (!running || visibleSteps >= DEFAULT_STEPS) return;
    const timeout = window.setTimeout(() => {
      setVisibleSteps((value) => {
        const next = Math.min(DEFAULT_STEPS, value + 1);
        if (next === DEFAULT_STEPS) setRunning(false);
        return next;
      });
    }, prefersReduced ? 120 : 520);
    return () => window.clearTimeout(timeout);
  }, [prefersReduced, running, visibleSteps]);

  const restartPath = () => {
    setVisibleSteps(0);
    setRunning(false);
  };

  const chooseStart = (next: Point) => {
    const nextStart = clampToDomain({ x: Number(next.x.toFixed(2)), y: Number(next.y.toFixed(2)) });
    setStart(nextStart);
    syncControls(surface, learningRate, nextStart);
    restartPath();
  };

  function nudgeStart(event: KeyboardEvent<HTMLDivElement>) {
    const amount = event.shiftKey ? 0.4 : 0.16;
    const offsets: Partial<Record<string, Point>> = {
      ArrowLeft: { x: -amount, y: 0 }, ArrowRight: { x: amount, y: 0 },
      ArrowUp: { x: 0, y: amount }, ArrowDown: { x: 0, y: -amount },
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    chooseStart({ x: start.x + offset.x, y: start.y + offset.y });
  }

  const pathRegimeLabel = pathAssessment.behaviour === "diverging"
    ? "diverging"
    : pathAssessment.behaviour === "oscillating"
      ? "oscillating"
      : "converging";
  const regimeLabel = surface === "valley"
    ? pathRegimeLabel
    : regime === "diverging"
      ? "unstable"
      : regime === "crossing"
        ? "overshoot range"
        : "steady";
  const regimeClass = surface === "valley"
    ? pathAssessment.behaviour === "diverging"
      ? "text-error"
      : pathAssessment.behaviour === "oscillating"
        ? "text-warning"
        : "text-primary"
    : regime === "diverging"
      ? "text-error"
      : regime === "crossing"
        ? "text-warning"
        : "text-primary";
  const surfaceExplanation = surface === "bowl"
    ? "Equal curvature: updates contract toward the minimum along a direct route."
    : surface === "multimodal"
      ? "Gradient descent only sees the nearby slope. A surrounding ridge can hide a better basin."
      : assessment.crossedMinimum
      ? "Steep across the valley: this update crosses the floor, producing a zig-zag."
      : "Unequal curvature: the steep correction dominates the shallow forward progress.";
  const statusText = `Step ${boundedStep}. Current loss ${current.loss.toFixed(3)}.`;
  const forecastEnd = useMemo(() => descentPath(start, learningRate, surface, 80).at(-1)!, [learningRate, start, surface]);
  const referenceEnd = useMemo(() => reference
    ? descentPath(reference.start, reference.learningRate, surface, 80).at(-1)!
    : null, [reference, surface]);
  const startChanged = reference
    ? Math.hypot(reference.start.x - start.x, reference.start.y - start.y) > 0.005
    : false;
  const rateChanged = reference
    ? Math.abs(reference.learningRate - learningRate) > 1e-8
    : false;
  const comparisonLabel = startChanged && rateChanged
    ? "Compare: rate + start"
    : startChanged
      ? "Compare: start only"
      : rateChanged
        ? "Compare: rate only"
        : "Compare: unchanged";
  const comparisonDescription = startChanged && rateChanged
    ? "The comparison changes both starting point and learning rate, so it does not isolate one cause."
    : startChanged
      ? "The comparison isolates the starting point."
      : rateChanged
        ? "The comparison isolates the learning rate."
        : reference
          ? "The current and kept paths use the same settings."
          : "";
  const reachesDifferentBasin = referenceEnd
    ? Math.hypot(referenceEnd.x - forecastEnd.x, referenceEnd.y - forecastEnd.y) > 0.3
    : false;
  const basinOutcome = surface !== "multimodal"
    ? null
    : forecastEnd.loss < 0.02
      ? "Forecast reaches the global minimum"
      : `Forecast gets trapped in a local basin · loss ${forecastEnd.loss.toFixed(2)}`;
  const basinComparison = surface === "multimodal" && referenceEnd
    ? `${startChanged && !rateChanged ? "Starts" : "Paths"} reach ${reachesDifferentBasin ? "different basins" : "the same basin"} · kept loss ${referenceEnd.loss.toFixed(2)} · current ${forecastEnd.loss.toFixed(2)}`
    : null;
  const pathChange = Math.abs(pathAssessment.relativeLossDelta * 100);
  const stabilityOutcome = `Current ${learningRate.toFixed(2)} ${pathRegimeLabel}: after ${DEFAULT_STEPS} steps, loss is ${pathChange.toFixed(0)}% ${pathAssessment.behaviour === "diverging" ? "higher" : "lower"}`;
  const referencePathAssessment = reference && surface === "valley" ? assessPath(reference.path, surface) : null;
  const referenceRegimeLabel = referencePathAssessment?.behaviour === "diverging"
    ? "diverging"
    : referencePathAssessment?.behaviour === "oscillating"
      ? "oscillating"
      : "converging";
  const referencePathChange = referencePathAssessment ? Math.abs(referencePathAssessment.relativeLossDelta * 100) : 0;
  const valleyReferenceOutcome = reference && referencePathAssessment && rateChanged && !startChanged
    ? `Kept ${reference.learningRate.toFixed(2)} ${referenceRegimeLabel}: loss is ${referencePathChange.toFixed(0)}% ${referencePathAssessment.behaviour === "diverging" ? "higher" : "lower"}`
    : null;
  const referenceRegimeClass = referencePathAssessment?.behaviour === "diverging"
    ? "text-error"
    : referencePathAssessment?.behaviour === "oscillating"
      ? "text-warning"
      : "text-primary";
  const statusDescription = `${statusText} ${outcomeLabel(assessment)} on the ${surface} surface. Learning rate ${learningRate.toFixed(2)}.${comparisonDescription ? ` ${comparisonDescription}` : ""}${valleyReferenceOutcome ? ` ${valleyReferenceOutcome}.` : ""}${basinComparison ? ` ${basinComparison}.` : ""}`;
  const referenceDescription = reference
    ? ` Kept path starts at x ${reference.start.x.toFixed(2)}, y ${reference.start.y.toFixed(2)}, with learning rate ${reference.learningRate.toFixed(2)}.`
    : "";

  return (
    <section aria-label="Gradient descent visualisation" className="grid h-full min-h-[22rem] min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div
        role="group"
        tabIndex={0}
        data-testid="loss-landscape"
        aria-label={`Loss landscape. Current start point x ${start.x.toFixed(2)}, y ${start.y.toFixed(2)}.${referenceDescription} Use arrow keys to move the current start point; hold Shift for larger moves.`}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
        onKeyDown={nudgeStart}
        className="relative min-h-0 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
      >
        <DescentScene3D key={`${step}-${resetKey}`} surface={surface} path={path} referencePath={reference?.path ?? null} referenceStart={reference?.start ?? null} referenceLearningRate={reference?.learningRate ?? null} shown={shown} current={current} start={start} onChooseStart={chooseStart} reducedMotion={prefersReduced} />

        <div className="pointer-events-none absolute left-3 top-3 hidden border border-outline bg-surface/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur-sm sm:left-4 sm:top-4 sm:block">
          <span>parameters x₁, x₂</span><span className="px-2 text-outline-dark">→</span><span className="text-primary">height = loss</span>
        </div>
        <div className="pointer-events-none absolute left-3 right-3 top-3 border border-outline bg-surface/94 px-3 py-2 backdrop-blur-sm sm:left-auto sm:right-4 sm:top-4 sm:w-72">
          <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">
            <span>{boundedStep === 0 ? "Next update" : `Update ${boundedStep}`}</span>
            <span className="text-primary">{surface === "bowl" ? "isotropic bowl" : surface === "valley" ? "narrow valley" : "many basins"}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono text-sm text-on-surface"><span>L {before.loss.toFixed(3)}</span><span className="text-on-surface-variant">→</span><span className={assessment.behaviour === "diverging" ? "text-error" : "text-primary"}>{after.loss.toFixed(3)}</span></div>
          <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 font-mono text-[9px] leading-4 text-on-surface-variant">
            <span>{surface === "valley" ? "Local slope ∇L" : "Local slope ∇L x₁,x₂"}</span>
            <span className="text-right text-on-surface">[{(surface === "valley" ? principalGradient.x : stepGradient.x).toFixed(2)}, {(surface === "valley" ? principalGradient.y : stepGradient.y).toFixed(2)}]</span>
            <span>Δ parameters</span><span className="text-right text-on-surface">[{update.x.toFixed(2)}, {update.y.toFixed(2)}]</span>
          </div>
          <p className={`mt-1 font-mono text-[9px] uppercase ${assessment.behaviour === "diverging" ? "text-error" : assessment.behaviour === "overshoot" ? "text-warning" : "text-primary"}`}>{outcomeLabel(assessment)}</p>
          <p className="mt-1 text-[10px] leading-snug text-on-surface-variant">{surfaceExplanation}</p>
          {surface === "valley" ? <p className={`mt-1 border-t border-outline pt-1 font-mono text-[9px] uppercase ${regimeClass}`}>{stabilityOutcome}</p> : null}
          {valleyReferenceOutcome ? <p className={`mt-1 font-mono text-[9px] uppercase ${referenceRegimeClass}`}>{valleyReferenceOutcome}</p> : null}
          {basinComparison ? <p className={`mt-1 border-t border-outline pt-1 font-mono text-[9px] uppercase ${reachesDifferentBasin ? "text-warning" : "text-primary"}`}>{basinComparison}</p> : basinOutcome ? <p className={`mt-1 border-t border-outline pt-1 font-mono text-[9px] uppercase ${forecastEnd.loss < 0.02 ? "text-primary" : "text-warning"}`}>{basinOutcome}</p> : null}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 border border-outline bg-surface/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-on-surface-variant sm:left-4">
          <span className="text-primary">Solid: completed</span><span className="px-2">·</span><span>Dashed: route forecast</span>{reference ? <><span className="px-2">·</span><span>Grey: kept path</span><span className="px-2">·</span><span className={startChanged && rateChanged ? "text-warning" : "text-primary"}>{comparisonLabel}</span></> : null}<span className="hidden px-2 sm:inline">·</span><span className="hidden sm:inline">Surface drag: move start · Background drag: rotate</span>
        </div>
        <p className="sr-only" aria-live="polite" aria-label={statusDescription}>{statusText}</p>
      </div>

      <div className="grid shrink-0 grid-cols-[auto_minmax(8rem,1fr)] gap-x-3 gap-y-2 border-t border-outline bg-surface-container-low p-2 sm:flex sm:items-end sm:gap-4 sm:px-3 sm:py-2">
        <fieldset className="min-w-0">
          <legend className="mb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">Surface</legend>
          <div className="grid grid-cols-3">
            {(["bowl", "valley", "multimodal"] as const).map((kind, index) => (
              <button key={kind} type="button" aria-pressed={surface === kind} onClick={() => { setSurface(kind); setReference(null); syncControls(kind, learningRate, start, null); restartPath(); }} className={`min-h-9 border px-2 text-xs capitalize transition-colors ${index > 0 ? "-ml-px" : ""} ${surface === kind ? "relative z-10 border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:border-primary"}`}>{kind === "multimodal" ? "Many minima" : kind}</button>
            ))}
          </div>
        </fieldset>

        <label className="min-w-0 flex-1 sm:max-w-sm">
          <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant"><span>Learning rate</span><span className={regimeClass}>{learningRate.toFixed(2)} · {regimeLabel}</span></span>
          <input aria-label="Learning rate" type="range" min={LEARNING_RATE_RANGE.min} max={LEARNING_RATE_RANGE.max} step={LEARNING_RATE_RANGE.step} value={learningRate} onChange={(event) => { const next = Number(event.target.value); setLearningRate(next); syncControls(surface, next, start); restartPath(); }} className="block min-h-9" />
          <button type="button" aria-pressed={reference !== null} onClick={() => { const nextReference = reference ? null : { learningRate, start, path }; setReference(nextReference); syncControls(surface, learningRate, start, nextReference); }} className={`mt-1 min-h-8 w-full border px-2 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${reference ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:border-primary hover:text-primary"}`}>{reference ? `Clear kept path at ${reference.learningRate.toFixed(2)}` : "Keep this path to compare"}</button>
        </label>

        <div className="col-span-2 flex min-w-0 gap-2 sm:ml-auto sm:pb-px">
          <button type="button" onClick={() => { setRunning(false); setVisibleSteps((value) => Math.min(DEFAULT_STEPS, value + 1)); }} disabled={visibleSteps >= DEFAULT_STEPS} className="min-h-9 flex-1 border border-primary bg-primary px-3 text-xs text-on-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none">Take step</button>
          <button type="button" onClick={() => setRunning((value) => !value)} disabled={visibleSteps >= DEFAULT_STEPS} className="min-h-9 flex-1 border border-outline bg-surface px-3 text-xs text-on-surface hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none">{running ? "Pause" : "Run path"}</button>
          <button type="button" onClick={restartPath} className="min-h-9 flex-1 border border-outline px-3 text-xs text-on-surface-variant hover:border-primary sm:flex-none">Restart</button>
        </div>
      </div>
    </section>
  );
}
