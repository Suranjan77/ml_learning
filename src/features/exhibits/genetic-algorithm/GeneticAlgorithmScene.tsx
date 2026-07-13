"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { DEFAULT_MUTATION_RATE, evolvePopulation, fitnessAt, initialPopulation, nextGeneration, type GeneticState } from "./model";

const WIDTH = 1_180;
const HEIGHT = 520;
const STEP_GENERATIONS = [0, 1, 3, 9] as const;
const X0 = 44;
const X1 = 760;
const Y_BASE = 205;
const sx = (x: number) => X0 + ((x + 4) / 8) * (X1 - X0);
const sy = (fitness: number) => Y_BASE - fitness * 132;

function curvePath() {
  return Array.from({ length: 161 }, (_, index) => {
    const x = -4 + index * 0.05;
    return `${index === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(fitnessAt(x)).toFixed(1)}`;
  }).join(" ");
}

export default function GeneticAlgorithmScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const initialGeneration = STEP_GENERATIONS[Math.max(0, Math.min(STEP_GENERATIONS.length - 1, step))];
  const titleId = useId();
  const [mutationRate, setMutationRate] = useState(DEFAULT_MUTATION_RATE);
  const [state, setState] = useState<GeneticState>(() => evolvePopulation(initialGeneration));
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setMutationRate(DEFAULT_MUTATION_RATE);
    setState(evolvePopulation(initialGeneration));
    setRunning(false);
  }, [initialGeneration, resetKey]);

  useEffect(() => {
    if (!playing) return;
    setRunning(true);
    return () => setRunning(false);
  }, [initialGeneration, playing, resetKey]);

  useEffect(() => {
    if (!running || state.generation >= 25) return;
    const timer = window.setTimeout(() => setState((current) => nextGeneration(current, mutationRate)), 520);
    return () => window.clearTimeout(timer);
  }, [mutationRate, running, state.generation]);

  const ranked = useMemo(() => [...state.population].sort((a, b) => b.fitness - a.fitness), [state.population]);
  const best = ranked[0];
  const diversity = new Set(state.population.map((individual) => individual.genome)).size;

  return (
    <section aria-label="Genetic algorithm visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div role="img" aria-labelledby={titleId} className="min-h-0 overflow-hidden">
        <span id={titleId} className="sr-only">A binary population evolving toward the highest-fitness region</span>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" aria-hidden="true">
          <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
          <text x={X0} y="27" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>FITNESS LANDSCAPE · TWO PEAKS, ONE GLOBAL BEST</text>
          <line x1={X0} y1={Y_BASE} x2={X1} y2={Y_BASE} stroke={vizTokens.axis} />
          <path d={curvePath()} fill="none" stroke={vizTokens.classA} strokeWidth="3" />
          {state.population.map((individual, index) => <g key={`${individual.genome}-${index}`}>
            <line x1={sx(individual.x)} y1={Y_BASE} x2={sx(individual.x)} y2={sy(individual.fitness)} stroke={vizTokens.path} opacity="0.22" />
            <circle cx={sx(individual.x)} cy={sy(individual.fitness)} r={individual.genome === best.genome ? 8 : 5} fill={individual.genome === best.genome ? vizTokens.selection : vizTokens.path} stroke={vizTokens.pointOutline} strokeWidth="2" />
          </g>)}
          <text x={sx(-2.05)} y={sy(fitnessAt(-2.05)) - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>LOCAL PEAK</text>
          <text x={sx(1.45)} y={sy(fitnessAt(1.45)) - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.classA}>GLOBAL PEAK</text>

          <g transform="translate(44 248)">
            <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>RANKED POPULATION</text>
            {ranked.slice(0, 8).map((individual, index) => <g key={`${individual.genome}-${index}`} transform={`translate(0 ${24 + index * 28})`}>
              <text y="11" fontFamily="var(--font-mono)" fontSize="11" fill={index === 0 ? vizTokens.selection : vizTokens.ink}>{individual.genome}</text>
              <rect x="120" width={individual.fitness * 190} height="14" fill={index === 0 ? vizTokens.selection : vizTokens.classA} opacity={index === 0 ? 1 : 0.54} />
              <text x="350" y="11" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>{individual.fitness.toFixed(3)}</text>
            </g>)}
          </g>

          <g transform="translate(820 45)">
            <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>EVOLUTION STATE</text>
            <text y="42" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>GENERATION</text><text x="300" y="42" textAnchor="end" fontFamily="var(--font-mono)" fontSize="22" fill={vizTokens.ink}>{state.generation}</text>
            <text y="78" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>BEST FITNESS</text><text x="300" y="78" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.classA}>{best.fitness.toFixed(3)}</text>
            <text y="108" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>UNIQUE GENOMES</text><text x="300" y="108" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.path}>{diversity}/12</text>
            <line y1="130" x2="300" y2="130" stroke={vizTokens.grid} />
            <text y="158" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>ONE REPRODUCTION EXAMPLE</text>
            {state.selectedParents ? <>
              <text y="188" fontFamily="var(--font-mono)" fontSize="12" fill={vizTokens.classA}>{state.selectedParents[0]}</text>
              <text y="212" fontFamily="var(--font-mono)" fontSize="12" fill={vizTokens.classB}>{state.selectedParents[1]}</text>
              <line x1={(state.crossoverPoint ?? 0) * 7.2} y1="173" x2={(state.crossoverPoint ?? 0) * 7.2} y2="220" stroke={vizTokens.selection} strokeWidth="2" />
              <text y="241" fontFamily="var(--font-mono)" fontSize="12"><tspan fill={vizTokens.classA}>{state.selectedParents[0].slice(0, state.crossoverPoint ?? 0)}</tspan><tspan fill={vizTokens.classB}>{state.selectedParents[1].slice(state.crossoverPoint ?? 0)}</tspan></text>
              <text x="105" y="241" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>← CHILD BEFORE MUTATION</text>
              <text y="267" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.selection}>CROSS AT BIT {state.crossoverPoint}</text>
              <text y="290" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>{state.mutationCount} BIT MUTATIONS THIS GENERATION</text>
            </> : <text y="190" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>Take a step to select parents.</text>}
            <rect y="310" width="300" height="84" fill={vizTokens.grid} opacity="0.55" />
            <text x="12" y="333" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>SELECTION exploits fitness</text>
            <text x="12" y="356" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>CROSSOVER recombines evidence</text>
            <text x="12" y="379" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>MUTATION restores variation</text>
          </g>
        </svg>
        <p className="sr-only" aria-live="polite">Generation {state.generation}. Best fitness {best.fitness.toFixed(3)}. {diversity} unique genomes remain.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-outline bg-surface-container-low px-3 py-2">
        <label className="min-w-48 flex-1 sm:max-w-sm"><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Mutation probability</span><span className="text-primary">{(mutationRate * 100).toFixed(1)}%</span></span><input aria-label="Mutation probability" type="range" min="0" max="0.2" step="0.005" value={mutationRate} onChange={(event) => setMutationRate(Number(event.target.value))} /></label>
        <div className="ml-auto flex gap-2"><button type="button" onClick={() => { setRunning(false); setState((current) => nextGeneration(current, mutationRate)); }} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary">Evolve once</button><button type="button" onClick={() => setRunning((value) => !value)} className="min-h-9 border border-outline bg-surface px-3 text-xs">{running ? "Pause" : "Run"}</button><button type="button" onClick={() => { setState(initialPopulation()); setRunning(false); }} className="min-h-9 border border-outline bg-surface px-3 text-xs">Restart</button></div>
      </div>
    </section>
  );
}
