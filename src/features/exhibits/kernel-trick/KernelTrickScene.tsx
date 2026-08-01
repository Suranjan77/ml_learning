"use client";

import { Line, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { VizCanvas } from "@/lib/three/VizCanvas";
import { vizTokens } from "@/lib/vizTokens";
import { useVizType } from "../presentMode";
import { numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import type { ExhibitSceneProps } from "../types";
import {
  BOUNDARY_RADIUS,
  buildConcentricDataset,
  KERNEL_DISCLOSURE,
  MAX_RADIUS,
  SEPARATING_HEIGHT,
  SVM_MARGIN_HEIGHTS,
  radialLift,
  type KernelPoint,
} from "./model";

const STEP_LIFT = [0, 0.72, 1, 1] as const;
const LIFT_SCALE = 4.2;
const INPUT_CAMERA = new THREE.Vector3(0.01, 11.8, 0.01);
const INPUT_TARGET = new THREE.Vector3(0, 0, 0);
const FEATURE_CAMERA = new THREE.Vector3(7.8, 6.4, 9.2);
const FEATURE_TARGET = new THREE.Vector3(0, 1.15, 0);

function CameraPreset({ flat, resetKey }: { flat: boolean; resetKey: string }) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const position = flat ? INPUT_CAMERA : FEATURE_CAMERA;
    const target = flat ? INPUT_TARGET : FEATURE_TARGET;
    camera.position.copy(position);
    camera.up.set(0, flat ? 0 : 1, flat ? -1 : 0);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, flat, invalidate, resetKey]);

  return null;
}

function circlePoints(radius: number, height: number): [number, number, number][] {
  return Array.from({ length: 97 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2;
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
  });
}

function GroundGrid({ showHeightAxis }: { showHeightAxis: boolean }) {
  const lines = useMemo(() => {
    const output: [number, number, number][][] = [];
    for (let value = -3; value <= 3; value += 1) {
      output.push([[value, 0, -MAX_RADIUS], [value, 0, MAX_RADIUS]]);
      output.push([[-MAX_RADIUS, 0, value], [MAX_RADIUS, 0, value]]);
    }
    return output;
  }, []);

  return (
    <group>
      {lines.map((points, index) => <Line key={index} points={points} color={vizTokens.grid} lineWidth={1} />)}
      <Line points={[[-MAX_RADIUS, 0, 0], [MAX_RADIUS, 0, 0]]} color={vizTokens.axis} lineWidth={1.5} />
      <Line points={[[0, 0, -MAX_RADIUS], [0, 0, MAX_RADIUS]]} color={vizTokens.axis} lineWidth={1.5} />
      {showHeightAxis ? <Line points={[[-MAX_RADIUS, 0, -MAX_RADIUS], [-MAX_RADIUS, LIFT_SCALE + 0.5, -MAX_RADIUS]]} color={vizTokens.axis} lineWidth={1.5} /> : null}
    </group>
  );
}

function FeaturePoint({ point, lift, supportVector }: { point: KernelPoint; lift: number; supportVector: boolean }) {
  const position: [number, number, number] = [point.x, point.z * lift * LIFT_SCALE + 0.09, point.y];
  const ground: [number, number, number] = [point.x, 0.025, point.y];
  const colour = point.label === 1 ? vizTokens.classB : vizTokens.classA;

  return (
    <group>
      {lift > 0.08 ? <Line points={[ground, position]} color={colour} lineWidth={1} dashed dashSize={0.07} gapSize={0.07} transparent opacity={0.3} /> : null}
      <mesh position={position}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color={colour} roughness={0.6} />
      </mesh>
      {supportVector && lift > 0.55 ? (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.19, 0.24, 28]} />
          <meshBasicMaterial color={vizTokens.path} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
}

function Separator({ lift }: { lift: number }) {
  const planeHeight = SEPARATING_HEIGHT * lift * LIFT_SCALE;
  const marginHeights = SVM_MARGIN_HEIGHTS.map((height) => height * lift * LIFT_SCALE);

  return (
    <group>
      <mesh position={[0, planeHeight, 0]}>
        <boxGeometry args={[MAX_RADIUS * 2, 0.025, MAX_RADIUS * 2]} />
        <meshBasicMaterial color={vizTokens.path} transparent opacity={0.32} depthWrite={false} />
      </mesh>
      {marginHeights.map((height) => (
        <group key={height} position={[0, height, 0]}>
          <Line points={[[-MAX_RADIUS, 0, -MAX_RADIUS], [MAX_RADIUS, 0, -MAX_RADIUS], [MAX_RADIUS, 0, MAX_RADIUS], [-MAX_RADIUS, 0, MAX_RADIUS], [-MAX_RADIUS, 0, -MAX_RADIUS]]} color={vizTokens.path} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.09} transparent opacity={0.74} />
        </group>
      ))}
    </group>
  );
}

function BoundaryCorrespondence({ lift }: { lift: number }) {
  const liftedHeight = SEPARATING_HEIGHT * lift * LIFT_SCALE + 0.045;
  const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

  return (
    <group>
      <Line points={circlePoints(BOUNDARY_RADIUS, 0.05)} color={vizTokens.path} lineWidth={4} />
      {lift > 0.08 ? (
        <>
          <Line points={circlePoints(BOUNDARY_RADIUS, liftedHeight)} color={vizTokens.path} lineWidth={4} />
          {angles.map((angle) => {
            const x = Math.cos(angle) * BOUNDARY_RADIUS;
            const z = Math.sin(angle) * BOUNDARY_RADIUS;
            return (
              <Line
                key={angle}
                points={[[x, 0.05, z], [x, liftedHeight, z]]}
                color={vizTokens.path}
                lineWidth={1.25}
                dashed
                dashSize={0.09}
                gapSize={0.08}
                transparent
                opacity={0.58}
              />
            );
          })}
        </>
      ) : null}
    </group>
  );
}

function FeatureMapSurface({ lift }: { lift: number }) {
  const rings = [0.7, 1.4, 2.1, 2.8, MAX_RADIUS];
  const rays = Array.from({ length: 12 }, (_, index) => index / 12 * Math.PI * 2);
  return <group>
    {rings.map((radius) => <Line key={radius} points={circlePoints(radius, radialLift(radius, 0) * lift * LIFT_SCALE)} color={vizTokens.border} lineWidth={1} transparent opacity={0.62} />)}
    {rays.map((angle) => <Line key={angle} points={Array.from({ length: 25 }, (_, index) => {
      const radius = index / 24 * MAX_RADIUS;
      return [Math.cos(angle) * radius, radialLift(radius, 0) * lift * LIFT_SCALE, Math.sin(angle) * radius] as [number, number, number];
    })} color={vizTokens.border} lineWidth={1} transparent opacity={0.48} />)}
  </group>;
}

function InputSpaceInset({ points }: { points: readonly KernelPoint[] }) {
  const type = useVizType();
  const size = 200;
  const centre = size / 2;
  const scale = 76 / MAX_RADIUS;
  // The caption sits below the plot, so the viewBox has to carry it: at the
  // authored size its descender already fell a fraction outside the frame.
  const plotHeight = size - 22;
  const frameHeight = plotHeight + type.micro * 1.9;
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 hidden w-[220px] border border-outline-dark bg-surface/95 p-2 backdrop-blur-sm lg:block" aria-hidden="true">
      <p className="font-mono viz-micro uppercase tracking-[0.08em] text-on-surface-variant">Input space · same threshold</p>
      <svg viewBox={`0 0 ${size} ${frameHeight}`} className="mt-1 block w-full">
        <rect width={size} height={frameHeight} fill={vizTokens.canvas} />
        {[40, 70, 100, 130, 160].map((value) => <g key={value}><line x1={value} x2={value} y1="10" y2="170" stroke={vizTokens.grid} /><line x1="20" x2="180" y1={value - 10} y2={value - 10} stroke={vizTokens.grid} /></g>)}
        <line x1="20" x2="180" y1={centre - 10} y2={centre - 10} stroke={vizTokens.axis} />
        <line x1={centre} x2={centre} y1="10" y2="170" stroke={vizTokens.axis} />
        <circle cx={centre} cy={centre - 10} r={BOUNDARY_RADIUS * scale} fill="none" stroke={vizTokens.path} strokeWidth="3" />
        {points.map((point) => <circle key={point.id} cx={centre + point.x * scale} cy={centre - 10 - point.y * scale} r="4" fill={point.label === 1 ? vizTokens.classB : vizTokens.classA} stroke={vizTokens.canvas} strokeWidth="1.5" />)}
        <text x={centre} y={plotHeight + type.micro * 1.3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.micro} fill={vizTokens.path}>circle r = {BOUNDARY_RADIUS.toFixed(2)}</text>
      </svg>
    </div>
  );
}

function KernelScene3D({ points, lift, showPlane, showBoundary, reducedMotion, flatView, cameraResetKey }: {
  points: KernelPoint[];
  lift: number;
  showPlane: boolean;
  showBoundary: boolean;
  reducedMotion: boolean;
  flatView: boolean;
  cameraResetKey: string;
}) {
  const supportIds = useMemo(() => {
    const ids = new Set<number>();
    for (const label of [0, 1] as const) {
      const classPoints = points.filter((point) => point.label === label);
      const closestDistance = Math.min(...classPoints.map((point) => Math.abs(point.z - SEPARATING_HEIGHT)));
      classPoints.forEach((point) => {
        if (Math.abs(Math.abs(point.z - SEPARATING_HEIGHT) - closestDistance) < 1e-7) ids.add(point.id);
      });
    }
    return ids;
  }, [points]);

  return (
    <VizCanvas
      label="Radial feature-space transformation"
      description="A rotatable three-dimensional feature space. An explicit radial feature raises the outer class above the inner class so a horizontal threshold can separate them."
      className="h-full w-full"
      camera={{ position: [7.8, 6.4, 9.2], fov: 45, near: 0.1, far: 60 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <CameraPreset flat={flatView} resetKey={cameraResetKey} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 8, 6]} intensity={2.1} />
      <GroundGrid showHeightAxis={lift > 0.08} />
      {lift > 0.08 ? <FeatureMapSurface lift={lift} /> : null}
      {showPlane || showBoundary ? <BoundaryCorrespondence lift={lift} /> : null}
      {points.map((point) => <FeaturePoint key={point.id} point={point} lift={lift} supportVector={supportIds.has(point.id)} />)}
      {showPlane ? <Separator lift={lift} /> : null}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={19}
        minPolarAngle={flatView ? 0.01 : 0.28}
        maxPolarAngle={Math.PI / 2.03}
        target={flatView ? INPUT_TARGET : FEATURE_TARGET}
      />
    </VizCanvas>
  );
}

export default function KernelTrickScene({ step, resetKey }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(3, step));
  const defaultLift = STEP_LIFT[activeStep];
  const [lift, setLift] = useState<number>(defaultLift);
  const prefersReduced = Boolean(useReducedMotion());
  const points = useMemo(() => buildConcentricDataset(), []);

  useEffect(() => setLift(defaultLift), [defaultLift, resetKey]);

  useSceneUrlState((params) => {
    setLift(numberParam(params, "lift", { min: 0, max: 1, step: 0.01 }) ?? defaultLift);
  }, `${activeStep}-${resetKey}`);

  const showPlane = activeStep >= 2;
  const showBoundary = activeStep === 3;
  const flatView = activeStep === 0;
  const description = activeStep === 0
    ? "An inner group is surrounded by an outer ring, so no straight line separates the groups."
    : activeStep === 1
      ? "Squared distance from the centre becomes a third feature. Ring points rise above the central group."
      : activeStep === 2
        ? "The horizontal separator sits halfway between the closest lifted samples; dashed planes mark the two margins."
        : "The 3D plane and 2D circle are now held together. Every point on the circle maps to the same separator height.";

  const changeLift = (nextLift: number) => {
    setLift(nextLift);
    replaceSceneUrlState([
      { key: "lift", value: String(nextLift), defaultValue: String(defaultLift) },
    ]);
  };

  return (
    <section className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-surface" aria-label="Kernel transformation visualisation">
      <div className="relative min-h-0 overflow-hidden">
        <KernelScene3D
          points={points}
          lift={lift}
          showPlane={showPlane}
          showBoundary={showBoundary}
          reducedMotion={prefersReduced}
          flatView={flatView}
          cameraResetKey={`${activeStep}-${resetKey}`}
        />
        {activeStep === 3 ? <InputSpaceInset points={points} /> : null}

        <div className="pointer-events-none absolute left-3 top-3 hidden border border-outline bg-surface/92 px-3 py-2 font-mono viz-label-strong uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur-sm sm:left-4 sm:top-4 sm:block">
          <span className="text-primary">2D inputs</span><span className="px-2 text-outline-dark">→</span><span className={lift > 0.08 ? "text-primary" : ""}>3D feature space</span><span className="px-2 text-outline-dark">→</span><span className={showBoundary ? "text-primary" : ""}>2D boundary</span>
        </div>
        <div className="pointer-events-none absolute left-3 right-3 top-3 border border-outline bg-surface/92 px-3 py-2 backdrop-blur-sm sm:left-auto sm:right-4 sm:top-4 sm:max-w-64">
          <p className="font-mono viz-label uppercase tracking-[0.1em] text-primary">{showBoundary ? "Same threshold · two simultaneous views" : showPlane ? "Flat threshold ↔ circular boundary" : "Explicit map: φ(x,y) = (x,y,(r/R)²)"}</p>
          <p className="mt-1 viz-caption leading-snug text-on-surface-variant">{description}</p>
          {showPlane || showBoundary ? <p className="mt-1 font-mono viz-label leading-snug text-on-surface-variant">z = {SEPARATING_HEIGHT.toFixed(2)} ↔ r = {BOUNDARY_RADIUS.toFixed(2)}</p> : null}
        </div>
        <div className={`pointer-events-none absolute bottom-3 border border-outline bg-surface/88 px-2 py-1 font-mono viz-label uppercase tracking-[0.08em] text-on-surface-variant ${activeStep === 3 ? "right-3 sm:right-4" : "left-3 sm:left-4"}`}>Drag to orbit · scroll to zoom</div>
      </div>

      <div className="grid grid-cols-[auto_minmax(100px,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-outline bg-surface-container-low px-3 py-2 sm:px-4">
        <label htmlFor="kernel-lift" className="font-mono viz-label-strong uppercase tracking-[0.08em] text-on-surface-variant">View</label>
        <input
          id="kernel-lift"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={lift}
          onChange={(event) => changeLift(Number(event.target.value))}
          aria-label="Input-to-feature-space view"
          aria-valuetext={`${Math.round(lift * 100)}% between input and feature-space views`}
        />
        <output className="w-9 text-right font-mono text-xs text-primary">{Math.round(lift * 100)}%</output>
        <div className="col-start-2 col-end-4 flex justify-between font-mono viz-micro uppercase tracking-[0.08em] text-on-surface-variant" aria-hidden="true">
          <span>Input space</span>
          <span>Feature space</span>
        </div>
      </div>

      <span className="sr-only">{KERNEL_DISCLOSURE}</span>
    </section>
  );
}
