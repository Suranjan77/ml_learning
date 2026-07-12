"use client";

import { Line, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { VizCanvas } from "@/lib/three/VizCanvas";
import { vizTokens } from "@/lib/vizTokens";
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

const STEP_LIFT = [0, 0.72, 1, 0] as const;
const LIFT_SCALE = 4.2;

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

function KernelScene3D({ points, lift, showPlane, showBoundary, reducedMotion }: {
  points: KernelPoint[];
  lift: number;
  showPlane: boolean;
  showBoundary: boolean;
  reducedMotion: boolean;
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
      description="A rotatable three-dimensional feature space. A radial feature raises the outer class above the inner class so a flat SVM decision plane can separate them."
      className="h-full w-full"
      camera={{ position: [7.8, 6.4, 9.2], fov: 45, near: 0.1, far: 60 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 8, 6]} intensity={2.1} />
      <GroundGrid showHeightAxis={lift > 0.08} />
      {lift > 0.08 ? <FeatureMapSurface lift={lift} /> : null}
      {showBoundary ? <Line points={circlePoints(BOUNDARY_RADIUS, 0.045)} color={vizTokens.path} lineWidth={4} /> : null}
      {points.map((point) => <FeaturePoint key={point.id} point={point} lift={lift} supportVector={supportIds.has(point.id)} />)}
      {showPlane ? <Separator lift={lift} /> : null}
      <OrbitControls makeDefault enablePan={false} minDistance={7} maxDistance={19} minPolarAngle={0.28} maxPolarAngle={Math.PI / 2.03} target={[0, 1.15, 0]} />
    </VizCanvas>
  );
}

export default function KernelTrickScene({ step, resetKey }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(3, step));
  const [manualLift, setManualLift] = useState<number | null>(null);
  const prefersReduced = Boolean(useReducedMotion());
  const points = useMemo(() => buildConcentricDataset(), []);

  useEffect(() => setManualLift(null), [activeStep, resetKey]);

  const lift = manualLift ?? STEP_LIFT[activeStep];
  const showPlane = activeStep === 2 || (manualLift !== null && manualLift > 0.62);
  const showBoundary = activeStep === 3;
  const description = activeStep === 0
    ? "An inner group is surrounded by an outer ring, so no straight line separates the groups."
    : activeStep === 1
      ? "Squared distance from the centre becomes a third feature. Ring points rise above the central group."
      : activeStep === 2
        ? "The SVM decision plane sits halfway between the closest samples; dashed planes mark its maximum margin."
        : "The flat decision plane in feature space maps back to a circular boundary in the original input space.";

  return (
    <section className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-surface" aria-label="Kernel transformation visualisation">
      <div className="relative min-h-0 overflow-hidden">
        <KernelScene3D points={points} lift={lift} showPlane={showPlane} showBoundary={showBoundary} reducedMotion={prefersReduced} />

        <div className="pointer-events-none absolute left-3 top-3 hidden border border-outline bg-surface/92 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur-sm sm:left-4 sm:top-4 sm:block">
          <span className="text-primary">2D inputs</span><span className="px-2 text-outline-dark">→</span><span className={lift > 0.08 ? "text-primary" : ""}>3D feature space</span><span className="px-2 text-outline-dark">→</span><span className={showBoundary ? "text-primary" : ""}>2D boundary</span>
        </div>
        <div className="pointer-events-none absolute left-3 right-3 top-3 border border-outline bg-surface/92 px-3 py-2 backdrop-blur-sm sm:left-auto sm:right-4 sm:top-4 sm:max-w-64">
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-primary">{showPlane ? "Linear SVM in feature space" : showBoundary ? "Projected decision boundary" : "Feature map: z = ‖x‖²"}</p>
          <p className="mt-1 text-[11px] leading-snug text-on-surface-variant">{description}</p>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 border border-outline bg-surface/88 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-on-surface-variant sm:left-4">Drag to orbit · scroll to zoom</div>
      </div>

      <div className="grid grid-cols-[auto_minmax(100px,1fr)_auto] items-center gap-3 border-t border-outline bg-surface-container-low px-3 py-2 sm:px-4">
        <label htmlFor="kernel-lift" className="font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">Feature lift</label>
        <input id="kernel-lift" type="range" min="0" max="1" step="0.01" value={lift} onChange={(event) => setManualLift(Number(event.target.value))} aria-label="Feature-space lift" />
        <output className="w-9 text-right font-mono text-xs text-primary">{Math.round(lift * 100)}%</output>
      </div>

      <span className="sr-only">{KERNEL_DISCLOSURE}</span>
    </section>
  );
}
