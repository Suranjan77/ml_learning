"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { reduced, vizMotion } from "@/lib/vizMotion";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { POINTS, axisFromAngle, principalAngle, projectionStats } from "./model";

const WIDTH = 1_180; const HEIGHT = 520;
const BOX = { left: 48, top: 28, width: 780, height: 452 } as const;
const sx = (x: number) => BOX.left + ((x + 5.5) / 11) * BOX.width;
const sy = (y: number) => BOX.top + ((3.8 - y) / 7.6) * BOX.height;
const OPTIMAL = principalAngle(POINTS);
const PRESET_OFFSETS = [Math.PI / 2, 0.62, 0.18, 0] as const;

export default function PcaScene({ step, resetKey }: ExhibitSceneProps) {
  const initialAngle = OPTIMAL + PRESET_OFFSETS[Math.max(0, Math.min(3, step))];
  const titleId = useId();
  const prefersReduced = useReducedMotion();
  const [angle, setAngle] = useState(initialAngle);
  useEffect(() => setAngle(initialAngle), [initialAngle, resetKey]);
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

  return <section aria-label="Principal component analysis visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="min-h-0 overflow-hidden">
      <span id={titleId} className="sr-only">Points projected onto a rotatable one-dimensional PCA axis</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={sx(-4 + i)} x2={sx(-4 + i)} y1={BOX.top} y2={BOX.top + BOX.height} stroke={vizTokens.grid} />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={BOX.left} x2={BOX.left + BOX.width} y1={sy(-3 + i)} y2={sy(-3 + i)} stroke={vizTokens.grid} />)}
        <path d={varianceEllipse} fill={vizTokens.classA} fillOpacity="0.07" stroke={vizTokens.classA} strokeDasharray="7 6" opacity="0.72" />
        <motion.line initial={false} animate={{ x1: sx(stats.centre.x - axis.x * length), y1: sy(stats.centre.y - axis.y * length), x2: sx(stats.centre.x + axis.x * length), y2: sy(stats.centre.y + axis.y * length) }} transition={reduced(vizMotion.markerSpring, prefersReduced)} stroke={vizTokens.path} strokeWidth="4" />
        {POINTS.map((point, index) => <g key={index}><motion.line initial={false} x1={sx(point.x)} y1={sy(point.y)} animate={{ x2: sx(stats.projections[index].point.x), y2: sy(stats.projections[index].point.y) }} transition={reduced(vizMotion.markerSpring, prefersReduced)} stroke={vizTokens.classB} strokeDasharray="3 3" opacity="0.38" /><motion.circle initial={false} animate={{ cx: sx(stats.projections[index].point.x), cy: sy(stats.projections[index].point.y) }} transition={reduced(vizMotion.markerSpring, prefersReduced)} r="3" fill={vizTokens.path} /><circle cx={sx(point.x)} cy={sy(point.y)} r="5" fill={vizTokens.classA} stroke={vizTokens.pointOutline} strokeWidth="2" /></g>)}
        <circle cx={sx(stats.centre.x)} cy={sy(stats.centre.y)} r="8" fill={vizTokens.selection} stroke={vizTokens.pointOutline} strokeWidth="2" />
        <text x={BOX.left + 10} y={BOX.top + 18} fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>GREEN = ORIGINAL · GOLD = 1D COORDINATE · DASH = LOST INFORMATION</text>
        <g transform="translate(875 52)">
          <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>PROJECTION QUALITY</text>
          <text y="48" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>ANGLE</text><text x="250" y="48" textAnchor="end" fontFamily="var(--font-mono)" fontSize="20" fill={vizTokens.ink}>{Math.round(angle * 180 / Math.PI)}°</text>
          <text y="88" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>VARIANCE KEPT</text><text x="250" y="88" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.classA}>{stats.variance.toFixed(2)}</text>
          <text y="122" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>RECONSTRUCTION ERROR</text><text x="250" y="122" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.error}>{stats.reconstructionError.toFixed(2)}</text>
          <rect y="158" width="250" height="18" fill={vizTokens.grid} /><rect y="158" width={250 * Math.min(1, explained / 100)} height="18" fill={vizTokens.classA} />
          <text y="198" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>{explained.toFixed(1)}% OF VARIATION EXPLAINED</text>
          <line y1="230" x2="250" y2="230" stroke={vizTokens.grid} />
          <text y="262" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.classA}>PCA CHOOSES THE AXIS THAT</text>
          <text y="287" fontFamily="var(--font-mono)" fontSize="12" fill={vizTokens.ink}>maximises spread</text>
          <text y="309" fontFamily="var(--font-mono)" fontSize="12" fill={vizTokens.ink}>and minimises lost distance.</text>
          <text y="355" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>BEST POSSIBLE ERROR</text><text x="250" y="355" textAnchor="end" fontFamily="var(--font-mono)" fontSize="14" fill={vizTokens.classA}>{optimalStats.reconstructionError.toFixed(2)}</text>
        </g>
      </svg>
      <p className="sr-only" aria-live="polite">Axis angle {Math.round(angle * 180 / Math.PI)} degrees. Variance {stats.variance.toFixed(2)}. Reconstruction error {stats.reconstructionError.toFixed(2)}.</p>
    </div>
    <div className="flex items-end gap-3 border-t border-outline bg-surface-container-low px-3 py-2"><label className="min-w-0 flex-1"><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Projection angle</span><span className="text-primary">{Math.round(angle * 180 / Math.PI)}°</span></span><input aria-label="Projection angle" type="range" min={-90} max={90} value={Math.round(angle * 180 / Math.PI)} onChange={(event) => setAngle(Number(event.target.value) * Math.PI / 180)} /></label><button type="button" onClick={() => setAngle(OPTIMAL)} className="min-h-9 shrink-0 border border-primary bg-primary px-3 text-xs text-on-primary">Align principal axis</button></div>
  </section>;
}
