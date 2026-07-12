"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import {
  DEFAULT_PARAMETERS,
  DOMAIN,
  evolveSwarm,
  initialSwarm,
  objective,
  stepSwarm,
  type SwarmParameters,
  type SwarmState,
} from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const PLOT = { left: 40, right: 270, top: 22, bottom: 28 } as const;
const PLOT_WIDTH = WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
const STEP_ITERATIONS = [0, 1, 5, 14] as const;

const sx = (value: number) => PLOT.left + ((value - DOMAIN.min) / (DOMAIN.max - DOMAIN.min)) * PLOT_WIDTH;
const sy = (value: number) => PLOT.top + ((DOMAIN.max - value) / (DOMAIN.max - DOMAIN.min)) * PLOT_HEIGHT;

function starPoints(cx: number, cy: number, outer = 12, inner = 5) {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

export default function ParticleSwarmScene({ step, resetKey }: ExhibitSceneProps) {
  const initialIteration = STEP_ITERATIONS[Math.max(0, Math.min(STEP_ITERATIONS.length - 1, step))];
  const titleId = useId();
  const [parameters, setParameters] = useState<SwarmParameters>(DEFAULT_PARAMETERS);
  const [state, setState] = useState<SwarmState>(() => evolveSwarm(initialIteration));
  const [bestHistory, setBestHistory] = useState<number[]>(() => [evolveSwarm(initialIteration).globalBestScore]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setParameters(DEFAULT_PARAMETERS);
    const preset = evolveSwarm(initialIteration);
    setState(preset);
    setBestHistory([preset.globalBestScore]);
    setRunning(false);
  }, [initialIteration, resetKey]);

  useEffect(() => {
    if (!running || state.iteration >= 30) return;
    const timer = window.setTimeout(() => setState((current) => {
      const next = stepSwarm(current, parameters);
      setBestHistory((history) => [...history, next.globalBestScore]);
      return next;
    }), 420);
    return () => window.clearTimeout(timer);
  }, [parameters, running, state.iteration]);

  const preview = useMemo(() => stepSwarm(state, parameters), [parameters, state]);
  const exploration = state.particles.reduce((sum, particle) => sum + Math.hypot(particle.x - state.globalBest.x, particle.y - state.globalBest.y), 0) / state.particles.length;
  const cells = useMemo(() => Array.from({ length: 28 * 16 }, (_, index) => {
    const column = index % 28;
    const row = Math.floor(index / 28);
    const x = DOMAIN.min + (column / 27) * (DOMAIN.max - DOMAIN.min);
    const y = DOMAIN.max - (row / 15) * (DOMAIN.max - DOMAIN.min);
    return { column, row, score: Math.min(1, objective({ x, y }) / 62) };
  }), []);

  function restart() {
    const initial = initialSwarm();
    setState(initial);
    setBestHistory([initial.globalBestScore]);
    setRunning(false);
  }

  const status = `Iteration ${state.iteration}. Best objective ${state.globalBestScore.toFixed(3)} at x ${state.globalBest.x.toFixed(2)}, y ${state.globalBest.y.toFixed(2)}. Mean swarm distance ${exploration.toFixed(2)}.`;
  const historyMaximum = Math.max(0.001, bestHistory[0]);
  const historyPath = bestHistory.map((score, index) => `${index === 0 ? "M" : "L"}${(index / Math.max(1, bestHistory.length - 1)) * 205} ${365 + Math.min(1, score / historyMaximum) * 70}`).join(" ");

  return (
    <section aria-label="Particle swarm optimisation visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div className="relative min-h-0 overflow-hidden" role="img" aria-labelledby={titleId}>
        <span id={titleId} className="sr-only">Particle swarm searching a multimodal Rastrigin landscape</span>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
          <g>
            {cells.map((cell) => <rect key={`${cell.column}-${cell.row}`} x={PLOT.left + cell.column * (PLOT_WIDTH / 28)} y={PLOT.top + cell.row * (PLOT_HEIGHT / 16)} width={PLOT_WIDTH / 28 + 0.5} height={PLOT_HEIGHT / 16 + 0.5} fill={vizTokens.error} opacity={0.035 + cell.score * 0.2} />)}
            <rect x={PLOT.left} y={PLOT.top} width={PLOT_WIDTH} height={PLOT_HEIGHT} fill="none" stroke={vizTokens.border} />
            {state.particles.map((particle, index) => {
              const next = preview.particles[index];
              return <g key={particle.id}>
                <line x1={sx(particle.x)} y1={sy(particle.y)} x2={sx(particle.best.x)} y2={sy(particle.best.y)} stroke={vizTokens.classA} strokeDasharray="3 4" opacity="0.34" />
                <line x1={sx(particle.x)} y1={sy(particle.y)} x2={sx(next.x)} y2={sy(next.y)} stroke={vizTokens.path} strokeWidth="2" opacity="0.65" />
                <circle cx={sx(particle.x)} cy={sy(particle.y)} r="6" fill={vizTokens.classB} stroke={vizTokens.pointOutline} strokeWidth="2" />
                <circle cx={sx(particle.best.x)} cy={sy(particle.best.y)} r="2.5" fill={vizTokens.classA} />
              </g>;
            })}
            <circle cx={sx(0)} cy={sy(0)} r="16" fill="none" stroke={vizTokens.classA} strokeWidth="2" opacity="0.45" />
            <circle cx={sx(0)} cy={sy(0)} r="3" fill={vizTokens.classA} />
            <polygon points={starPoints(sx(state.globalBest.x), sy(state.globalBest.y))} fill={vizTokens.path} stroke={vizTokens.pointOutline} strokeWidth="2" />
            <text x={PLOT.left + 10} y={PLOT.top + 18} fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>DARKER = HIGHER COST · RINGS = LOCAL BASINS</text>
          </g>

          <g transform={`translate(${WIDTH - 245} 32)`}>
            <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>SWARM STATE</text>
            <text y="40" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>ITERATION</text><text x="205" y="40" textAnchor="end" fontFamily="var(--font-mono)" fontSize="18" fill={vizTokens.ink}>{state.iteration}</text>
            <line y1="54" x2="205" y2="54" stroke={vizTokens.grid} />
            <text y="78" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>GLOBAL BEST</text><text x="205" y="78" textAnchor="end" fontFamily="var(--font-mono)" fontSize="15" fill={vizTokens.classA}>{state.globalBestScore.toFixed(3)}</text>
            <text y="105" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>MEAN SPREAD</text><text x="205" y="105" textAnchor="end" fontFamily="var(--font-mono)" fontSize="15" fill={vizTokens.path}>{exploration.toFixed(2)}</text>
            <rect y="132" width="205" height="88" fill={vizTokens.grid} opacity="0.55" />
            <text x="12" y="153" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.classB}>● PARTICLE</text>
            <text x="12" y="176" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.classA}>· PERSONAL BEST</text>
            <text x="12" y="199" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.path}>★ SHARED GLOBAL BEST</text>
            <text y="251" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>NEXT MOVE COMBINES</text>
            <text y="272" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.ink}>momentum + memory</text>
            <text y="290" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.ink}>+ social pull</text>
            <text y="335" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>BEST COST OVER TIME</text>
            <rect y="350" width="205" height="100" fill={vizTokens.grid} opacity="0.4" />
            <path d={historyPath} fill="none" stroke={vizTokens.classA} strokeWidth="3" strokeLinejoin="round" />
          </g>
        </svg>
        <p className="sr-only" aria-live="polite">{status}</p>
      </div>

      <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:px-3">
        {(["inertia", "cognitive", "social"] as const).map((key) => <label key={key} className="min-w-0"><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>{key}</span><span className="text-primary">{parameters[key].toFixed(2)}</span></span><input aria-label={key} type="range" min="0" max="2.2" step="0.05" value={parameters[key]} onChange={(event) => setParameters((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}
        <div className="flex gap-2">
          <button type="button" onClick={() => { setRunning(false); setState((current) => { const next = stepSwarm(current, parameters); setBestHistory((history) => [...history, next.globalBestScore]); return next; }); }} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary">Step</button>
          <button type="button" onClick={() => setRunning((value) => !value)} className="min-h-9 border border-outline bg-surface px-3 text-xs">{running ? "Pause" : "Run"}</button>
          <button type="button" onClick={restart} className="min-h-9 border border-outline bg-surface px-3 text-xs">Restart</button>
        </div>
      </div>
    </section>
  );
}
