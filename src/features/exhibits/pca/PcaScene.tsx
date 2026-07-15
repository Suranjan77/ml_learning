"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { reduced, vizMotion } from "@/lib/vizMotion";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import { POINTS, axisFromAngle, normalizeAxisAngle, principalAngle, projectionStats } from "./model";

const WIDTH = 1_180; const HEIGHT = 520;
const BOX = { left: 48, top: 28, width: 780, height: 452 } as const;
const sx = (x: number) => BOX.left + ((x + 5.5) / 11) * BOX.width;
const sy = (y: number) => BOX.top + ((3.8 - y) / 7.6) * BOX.height;
const OPTIMAL = principalAngle(POINTS);
const PRESET_OFFSETS = [Math.PI / 2, 0.62, 0.18, 0] as const;

export default function PcaScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const initialAngle = normalizeAxisAngle(OPTIMAL + PRESET_OFFSETS[Math.max(0, Math.min(3, step))]);
  const initialAngleDegrees = Math.round(initialAngle * 180 / Math.PI);
  const titleId = useId();
  const prefersReduced = useReducedMotion();
  const dragging = useRef(false);
  const [angleDegrees, setAngleDegrees] = useState(initialAngleDegrees);
  const angle = angleDegrees * Math.PI / 180;
  useEffect(() => setAngleDegrees(initialAngleDegrees), [initialAngleDegrees, resetKey]);

  useSceneUrlState((params) => {
    setAngleDegrees(numberParam(params, "angle", { min: -90, max: 90, step: 1 }) ?? initialAngleDegrees);
  }, `${step}-${resetKey}`);

  const stats = useMemo(() => projectionStats(POINTS, angle), [angle]);
  const optimalStats = useMemo(() => projectionStats(POINTS, OPTIMAL), []);
  const perpendicularStats = useMemo(() => projectionStats(POINTS, OPTIMAL + Math.PI / 2), []);
  const axis = axisFromAngle(angle);
  const length = 6;
  const explained = (stats.variance / (stats.variance + stats.reconstructionError)) * 100;
  const varianceEllipse = useMemo(() => {
    const major = Math.sqrt(optimalStats.variance) * 2;
    const minor = Math.sqrt(perpendicularStats.variance) * 2;
    const majorAxis = axisFromAngle(OPTIMAL);
    const minorAxis = axisFromAngle(OPTIMAL + Math.PI / 2);
    return Array.from({ length: 97 }, (_, index) => {
      const theta = index / 96 * Math.PI * 2;
      const x = optimalStats.centre.x + Math.cos(theta) * major * majorAxis.x + Math.sin(theta) * minor * minorAxis.x;
      const y = optimalStats.centre.y + Math.cos(theta) * major * majorAxis.y + Math.sin(theta) * minor * minorAxis.y;
      return `${index === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
    }).join(" ") + " Z";
  }, [optimalStats, perpendicularStats]);

  const changeAngle = (nextDegrees: number) => {
    const normalized = Math.round(normalizeAxisAngle(nextDegrees * Math.PI / 180) * 180 / Math.PI);
    setAngleDegrees(normalized);
    replaceSceneUrlState([
      { key: "angle", value: String(normalized), defaultValue: String(initialAngleDegrees) },
    ]);
  };

  const angleFromPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return angle;
    const matrix = svg.getScreenCTM();
    let viewX: number;
    let viewY: number;
    if (matrix && typeof svg.createSVGPoint === "function") {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const transformed = point.matrixTransform(matrix.inverse());
      viewX = transformed.x;
      viewY = transformed.y;
    } else {
      const bounds = svg.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return angle;
      viewX = (event.clientX - bounds.left) / bounds.width * WIDTH;
      viewY = (event.clientY - bounds.top) / bounds.height * HEIGHT;
    }
    const x = (viewX - BOX.left) / BOX.width * 11 - 5.5;
    const y = 3.8 - (viewY - BOX.top) / BOX.height * 7.6;
    return Math.atan2(y - stats.centre.y, x - stats.centre.x);
  };

  const updateFromPointer = (event: ReactPointerEvent<SVGRectElement>) => {
    changeAngle(angleFromPointer(event) * 180 / Math.PI);
  };

  return <section aria-label="Principal component analysis visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="relative min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">Points projected onto a rotatable one-dimensional PCA axis</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={sx(-4 + i)} x2={sx(-4 + i)} y1={BOX.top} y2={BOX.top + BOX.height} stroke={vizTokens.grid} />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={BOX.left} x2={BOX.left + BOX.width} y1={sy(-3 + i)} y2={sy(-3 + i)} stroke={vizTokens.grid} />)}
        <path d={varianceEllipse} fill={vizTokens.classA} fillOpacity="0.07" stroke={vizTokens.classA} strokeDasharray="7 6" opacity="0.72" />
        <motion.line initial={false} animate={{ x1: sx(stats.centre.x - axis.x * length), y1: sy(stats.centre.y - axis.y * length), x2: sx(stats.centre.x + axis.x * length), y2: sy(stats.centre.y + axis.y * length) }} transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)} stroke={vizTokens.path} strokeWidth="4" />
        {POINTS.map((point, index) => <g key={index}><motion.line initial={false} x1={sx(point.x)} y1={sy(point.y)} animate={{ x2: sx(stats.projections[index].point.x), y2: sy(stats.projections[index].point.y) }} transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)} stroke={vizTokens.classB} strokeDasharray="3 3" opacity="0.38" /><motion.circle initial={false} animate={{ cx: sx(stats.projections[index].point.x), cy: sy(stats.projections[index].point.y) }} transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)} r="3" fill={vizTokens.path} /><circle cx={sx(point.x)} cy={sy(point.y)} r="5" fill={vizTokens.classA} stroke={vizTokens.pointOutline} strokeWidth="2" /></g>)}
        <circle cx={sx(stats.centre.x)} cy={sy(stats.centre.y)} r="8" fill={vizTokens.selection} stroke={vizTokens.pointOutline} strokeWidth="2" />
        <rect
          data-testid="pca-drag-surface"
          x={BOX.left}
          y={BOX.top}
          width={BOX.width}
          height={BOX.height}
          fill="transparent"
          className="cursor-crosshair touch-none"
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (dragging.current) updateFromPointer(event);
          }}
          onPointerUp={(event) => {
            dragging.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={() => { dragging.current = false; }}
          onLostPointerCapture={() => { dragging.current = false; }}
        />
        <text x={BOX.left + 10} y={BOX.top + 18} fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>GREEN = ORIGINAL · GOLD = 1D COORDINATE · DASH = LOST INFORMATION</text>
        <g transform="translate(875 52)">
          <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>PROJECTION QUALITY</text>
          <text y="48" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>ANGLE</text><text x="250" y="48" textAnchor="end" fontFamily="var(--font-mono)" fontSize="20" fill={vizTokens.ink}>{angleDegrees}°</text>
          <text y="88" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>VARIANCE KEPT</text><text x="250" y="88" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.classA}>{stats.variance.toFixed(2)}</text>
          <text y="122" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>RECONSTRUCTION ERROR</text><text x="250" y="122" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.error}>{stats.reconstructionError.toFixed(2)}</text>
          <rect y="158" width="250" height="18" fill={vizTokens.grid} /><rect y="158" width={250 * Math.min(1, explained / 100)} height="18" fill={vizTokens.classA} />
          <text y="198" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>{explained.toFixed(1)}% OF VARIATION EXPLAINED</text>
          <line y1="230" x2="250" y2="230" stroke={vizTokens.grid} />
          <text y="262" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.classA}>PCA CHOOSES THE AXIS THAT</text>
          <text y="287" fontFamily="var(--font-mono)" fontSize="12" fill={vizTokens.ink}>maximises spread</text>
          <text y="309" fontFamily="var(--font-mono)" fontSize="12" fill={vizTokens.ink}>and minimises lost distance.</text>
          <text y="355" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>BEST POSSIBLE ERROR</text><text x="250" y="355" textAnchor="end" fontFamily="var(--font-mono)" fontSize="14" fill={vizTokens.classA}>{optimalStats.reconstructionError.toFixed(2)}</text>
          <text y="385" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>THE ACTUAL 1D REPRESENTATION</text>
          <line x1="0" x2="250" y1="410" y2="410" stroke={vizTokens.axis} strokeWidth="1.5" />
          {stats.projections.map((projection, index) => {
            const x = Math.max(0, Math.min(250, (projection.score + 5) / 10 * 250));
            return <motion.line key={`score-${index}`} initial={false} animate={{ x1: x, x2: x }} transition={reduced(playing ? vizMotion.cinematic : vizMotion.markerSpring, prefersReduced)} y1={index % 2 === 0 ? 400 : 404} y2={index % 2 === 0 ? 420 : 416} stroke={vizTokens.path} strokeWidth="2" opacity="0.78" />;
          })}
          <text y="435" fontFamily="var(--font-mono)" fontSize="8" fill={vizTokens.mutedInk}>−5</text>
          <text x="125" y="435" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill={vizTokens.mutedInk}>30 scalar scores · no second spatial coordinate</text>
          <text x="250" y="435" textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill={vizTokens.mutedInk}>+5</text>
        </g>
      </svg>
      <div aria-hidden="true" className="absolute bottom-2 left-2 right-2 border border-outline bg-surface/95 p-2 sm:hidden">
        <div className="grid grid-cols-3 gap-2 font-mono text-[9px] uppercase tracking-[0.06em] text-on-surface-variant">
          <span>Angle <strong className="block text-on-surface">{angleDegrees}°</strong></span>
          <span>Variance <strong className="block text-primary">{stats.variance.toFixed(2)}</strong></span>
          <span>Error <strong className="block text-error">{stats.reconstructionError.toFixed(2)}</strong></span>
        </div>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.06em] text-warning">Actual 1D output · 30 scalar scores</p>
        <svg viewBox="0 0 330 26" className="mt-0.5 h-6 w-full">
          <line x1="4" x2="326" y1="13" y2="13" stroke={vizTokens.axis} />
          {stats.projections.map((projection, index) => {
            const x = 4 + Math.max(0, Math.min(1, (projection.score + 5) / 10)) * 322;
            return <line key={`mobile-score-${index}`} x1={x} x2={x} y1={index % 2 === 0 ? 5 : 9} y2={index % 2 === 0 ? 21 : 17} stroke={vizTokens.path} strokeWidth="2" opacity="0.82" />;
          })}
        </svg>
      </div>
      <p className="sr-only" aria-live="polite">Axis angle {angleDegrees} degrees. Variance {stats.variance.toFixed(2)}. Reconstruction error {stats.reconstructionError.toFixed(2)}.</p>
    </div>
    <div className="flex items-end gap-3 border-t border-outline bg-surface-container-low px-3 py-2"><label className="min-w-0 flex-1"><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Projection angle</span><span className="text-primary">{angleDegrees}°</span></span><input aria-label="Projection angle" type="range" min={-90} max={90} value={angleDegrees} onChange={(event) => changeAngle(Number(event.target.value))} /></label><button type="button" onClick={() => changeAngle(OPTIMAL * 180 / Math.PI)} className="min-h-9 shrink-0 border border-primary bg-primary px-3 text-xs text-on-primary">Align principal axis</button></div>
  </section>;
}
