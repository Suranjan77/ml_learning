"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import {
  BOUNDARY_RADIUS,
  buildConcentricDataset,
  depthOrder,
  KERNEL_DISCLOSURE,
  MAX_RADIUS,
  projectPoint,
  SEPARATING_HEIGHT,
  splitByPlane,
  type KernelPoint,
} from "./model";

const WIDTH = 900;
const HEIGHT = 500;
const STEP_LIFT = [0, 0.72, 1, 0] as const;

function polygon(points: readonly { x: number; y: number }[]) {
  return points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function PointMark({ point, lift, highlighted = false }: { point: KernelPoint; lift: number; highlighted?: boolean }) {
  const projected = projectPoint(point.x, point.y, point.z, lift);
  const ground = projectPoint(point.x, point.y, 0, lift);
  const color = point.label === 1 ? vizTokens.classB : vizTokens.classA;

  return (
    <g className="transition-transform duration-500" data-point={point.id}>
      {lift > 0.08 && (
        <line x1={ground.x} y1={ground.y} x2={projected.x} y2={projected.y} stroke={color} strokeOpacity="0.26" strokeDasharray="3 4" />
      )}
      <circle cx={projected.x} cy={projected.y} r={highlighted ? 9 : 7} fill={color} stroke={vizTokens.pointOutline} strokeWidth="2.5" />
      <circle cx={projected.x} cy={projected.y} r={highlighted ? 14 : 11} fill="none" stroke={color} strokeOpacity={highlighted ? 0.5 : 0} />
    </g>
  );
}

export default function KernelTrickScene({ step, resetKey }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(3, step));
  const [manualLift, setManualLift] = useState<number | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const points = useMemo(() => buildConcentricDataset(), []);

  useEffect(() => setManualLift(null), [activeStep, resetKey]);

  const lift = manualLift ?? STEP_LIFT[activeStep];
  const showPlane = activeStep === 2 || (manualLift !== null && manualLift > 0.62);
  const showBoundary = activeStep === 3;
  const ordered = depthOrder(points, lift);
  const { below, above } = splitByPlane(ordered);
  const corners = [[-MAX_RADIUS, -MAX_RADIUS], [MAX_RADIUS, -MAX_RADIUS], [MAX_RADIUS, MAX_RADIUS], [-MAX_RADIUS, MAX_RADIUS]] as const;
  const ground = polygon(corners.map(([x, y]) => projectPoint(x, y, 0, lift)));
  const plane = polygon(corners.map(([x, y]) => projectPoint(x, y, SEPARATING_HEIGHT, lift)));
  const boundaryRadius = BOUNDARY_RADIUS * 74;
  const description = activeStep === 0
    ? "An inner group is surrounded by an outer ring, so no straight line separates the groups."
    : activeStep === 1
      ? "Distance from the centre becomes height. Ring points rise above the central group."
      : activeStep === 2
        ? "A flat plane passes between the two height bands without touching either group."
        : "The plane in feature space becomes a circular boundary in the original view.";

  return (
    <section className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-surface" aria-label="Kernel transformation visualisation">
      <div className="relative min-h-0 overflow-hidden">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
          <title id={titleId}>Radial feature-space transformation</title>
          <desc id={descriptionId}>{description}</desc>
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />

          <g transform="translate(90 2)">
            <polygon points={ground} fill={vizTokens.grid} fillOpacity="0.35" stroke={vizTokens.border} />
            {lift > 0.08 && (
              <>
                <line x1="270" y1="414" x2="270" y2="92" stroke={vizTokens.axis} strokeWidth="1.5" />
                <path d="M270 92 l-5 10 h10 z" fill={vizTokens.axis} />
                <text x="282" y="106" fill={vizTokens.axis} fontSize="13" fontFamily="var(--font-mono)">distance²</text>
              </>
            )}

            {activeStep === 0 && (
              <g opacity="0.85">
                <line x1="62" y1="358" x2="570" y2="118" stroke={vizTokens.axis} strokeWidth="2" strokeDasharray="8 7" />
                <line x1="110" y1="118" x2="548" y2="374" stroke={vizTokens.axis} strokeWidth="2" strokeDasharray="8 7" />
                <text x="76" y="96" fill={vizTokens.mutedInk} fontSize="13">Every straight cut crosses a group</text>
              </g>
            )}

            {showBoundary && (
              <g>
                <circle cx="360" cy="232" r={boundaryRadius} fill={vizTokens.path} fillOpacity="0.08" stroke={vizTokens.path} strokeWidth="4" />
                <path d="M493 126 L550 82" stroke={vizTokens.path} strokeWidth="1.5" />
                <text x="558" y="78" fill={vizTokens.path} fontSize="13" fontFamily="var(--font-mono)">projected boundary</text>
              </g>
            )}

            {showPlane ? (
              <>
                {below.map((point) => <PointMark key={point.id} point={point} lift={lift} />)}
                <polygon points={plane} fill={vizTokens.path} fillOpacity="0.42" stroke={vizTokens.path} strokeWidth="2.5" />
                <text x="560" y="205" fill={vizTokens.path} fontSize="13" fontFamily="var(--font-mono)">flat separator</text>
                {above.map((point) => <PointMark key={point.id} point={point} lift={lift} />)}
              </>
            ) : ordered.map((point) => <PointMark key={point.id} point={point} lift={lift} highlighted={showBoundary && Math.abs(Math.hypot(point.x, point.y) - BOUNDARY_RADIUS) < 0.4} />)}
          </g>
        </svg>

        <div className="absolute left-3 top-3 border border-outline bg-surface/95 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant sm:left-4 sm:top-4">
          <span className="text-primary">2D inputs</span>
          <span className="px-2 text-outline-dark">→</span>
          <span className={lift > 0.08 ? "text-primary" : ""}>3D feature space</span>
          <span className="px-2 text-outline-dark">→</span>
          <span className={showBoundary ? "text-primary" : ""}>2D boundary</span>
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(100px,1fr)_auto] items-center gap-3 border-t border-outline bg-surface-container-low px-3 py-2 sm:px-4">
        <label htmlFor="kernel-lift" className="font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">Lift</label>
        <input id="kernel-lift" type="range" min="0" max="1" step="0.01" value={lift} onChange={(event) => setManualLift(Number(event.target.value))} aria-label="Feature-space lift" />
        <output className="w-9 text-right font-mono text-xs text-primary">{Math.round(lift * 100)}%</output>
      </div>

      <span className="sr-only">{KERNEL_DISCLOSURE}</span>
    </section>
  );
}
