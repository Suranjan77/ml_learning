"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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

interface HistoryPoint {
  generation: number;
  bestFitness: number;
  diversity: number;
}

function snapshot(state: GeneticState): HistoryPoint {
  return {
    generation: state.generation,
    bestFitness: Math.max(...state.population.map((individual) => individual.fitness)),
    diversity: new Set(state.population.map((individual) => individual.genome)).size,
  };
}

function runWithHistory(generations: number, mutationRate: number) {
  let state = initialPopulation();
  const history = [snapshot(state)];
  for (let generation = 0; generation < generations; generation += 1) {
    state = nextGeneration(state, mutationRate);
    history.push(snapshot(state));
  }
  return { state, history };
}

function GenomeRow({ label, genome, y, sourceSplit, tone, mutations = [] }: {
  label: string;
  genome: string;
  y: number;
  sourceSplit?: number;
  tone?: string;
  mutations?: readonly number[];
}) {
  return (
    <g transform={`translate(0 ${y})`}>
      <text y="14" fontFamily="var(--font-mono)" fontSize="8" fill={vizTokens.mutedInk}>{label}</text>
      {[...genome].map((bit, index) => {
        const mutated = mutations.includes(index);
        const sourceTone = tone ?? (index < (sourceSplit ?? genome.length) ? vizTokens.classA : vizTokens.classB);
        return (
          <g key={index} transform={`translate(${82 + index * 16} 0)`}>
            <rect width="14" height="19" fill={sourceTone} fillOpacity="0.18" stroke={mutated ? vizTokens.error : sourceTone} strokeWidth={mutated ? 2.5 : 1} />
            <text x="7" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fontWeight={mutated ? 700 : 400} fill={mutated ? vizTokens.error : vizTokens.ink}>{bit}</text>
            {mutated ? <path d="M3 -3 H11" stroke={vizTokens.error} strokeWidth="2" /> : null}
          </g>
        );
      })}
    </g>
  );
}

export default function GeneticAlgorithmScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(STEP_GENERATIONS.length - 1, step));
  const initialGeneration = STEP_GENERATIONS[activeStep];
  const titleId = useId();
  const diagramRef = useRef<HTMLDivElement>(null);
  const [mutationRate, setMutationRate] = useState(DEFAULT_MUTATION_RATE);
  const [state, setState] = useState<GeneticState>(() => evolvePopulation(initialGeneration));
  const [history, setHistory] = useState<HistoryPoint[]>(() => runWithHistory(initialGeneration, DEFAULT_MUTATION_RATE).history);
  const [running, setRunning] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"landscape" | "history" | "ancestry">(activeStep === 0 ? "landscape" : activeStep === 3 ? "history" : "ancestry");

  const showMobilePanel = (panel: "landscape" | "history" | "ancestry") => {
    setMobilePanel(panel);
    const diagram = diagramRef.current;
    if (!diagram) return;
    const maximum = diagram.scrollWidth - diagram.clientWidth;
    diagram.scrollTo({ left: panel === "landscape" ? 0 : panel === "history" ? maximum / 2 : maximum, behavior: "smooth" });
  };

  useEffect(() => {
    const run = runWithHistory(initialGeneration, DEFAULT_MUTATION_RATE);
    setMutationRate(DEFAULT_MUTATION_RATE);
    setState(run.state);
    setHistory(run.history);
    setRunning(false);
  }, [initialGeneration, resetKey]);

  useEffect(() => {
    const panel = activeStep === 0 ? "landscape" : activeStep === 3 ? "history" : "ancestry";
    setMobilePanel(panel);
    const frame = window.requestAnimationFrame(() => {
      const diagram = diagramRef.current;
      if (!diagram) return;
      const maximum = diagram.scrollWidth - diagram.clientWidth;
      diagram.scrollLeft = panel === "landscape" ? 0 : panel === "history" ? maximum / 2 : maximum;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeStep, resetKey]);

  useEffect(() => {
    if (!playing) return;
    setRunning(true);
    return () => setRunning(false);
  }, [initialGeneration, playing, resetKey]);

  useEffect(() => {
    if (!running || state.generation >= 25) return;
    const timer = window.setTimeout(() => {
      const next = nextGeneration(state, mutationRate);
      setState(next);
      setHistory((current) => [...current, snapshot(next)]);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [mutationRate, running, state]);

  const ranked = useMemo(() => [...state.population].sort((a, b) => b.fitness - a.fitness), [state.population]);
  const best = ranked[0];
  const diversity = new Set(state.population.map((individual) => individual.genome)).size;
  const historyMaxGeneration = Math.max(9, state.generation);
  const historyMaxFitness = Math.max(1, ...history.map((point) => point.bestFitness));
  const historyX = (generation: number) => 430 + (generation / historyMaxGeneration) * 330;
  const historyFitnessY = (fitness: number) => 344 - (fitness / historyMaxFitness) * 66;
  const historyDiversityY = (value: number) => 452 - ((value - 1) / 11) * 66;
  const fitnessHistoryPath = history.map((point, index) => `${index === 0 ? "M" : "L"}${historyX(point.generation).toFixed(1)} ${historyFitnessY(point.bestFitness).toFixed(1)}`).join(" ");
  const diversityHistoryPath = history.map((point, index) => `${index === 0 ? "M" : "L"}${historyX(point.generation).toFixed(1)} ${historyDiversityY(point.diversity).toFixed(1)}`).join(" ");
  const reproductionSummary = state.reproduction
    ? `Example child crossed after bit ${state.reproduction.crossoverPoint}${state.reproduction.mutatedBits.length > 0 ? ` and changed bits ${state.reproduction.mutatedBits.map((bit) => bit + 1).join(", ")}` : " with no mutation"}.`
    : "";

  function evolveOnce() {
    const next = nextGeneration(state, mutationRate);
    setState(next);
    setHistory((current) => [...current, snapshot(next)]);
  }

  function restart() {
    const initial = initialPopulation();
    setState(initial);
    setHistory([snapshot(initial)]);
    setRunning(false);
  }

  return (
    <section aria-label="Genetic algorithm visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] lg:block">
        <div className="grid min-h-10 grid-cols-3 border-b border-outline bg-surface-container-low font-mono text-[9px] uppercase tracking-[0.07em] lg:hidden" aria-label="Genetic algorithm diagram stage">
          {(["landscape", "history", "ancestry"] as const).map((panel, index) => (
            <button key={panel} type="button" aria-pressed={mobilePanel === panel} onClick={() => showMobilePanel(panel)} className={`border-r border-outline px-1 last:border-r-0 ${mobilePanel === panel ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>
              {index + 1} · {panel}
            </button>
          ))}
        </div>
        <div
          ref={diagramRef}
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          onScroll={(event) => {
            const element = event.currentTarget;
            const progress = element.scrollLeft / Math.max(1, element.scrollWidth - element.clientWidth);
            setMobilePanel(progress < 0.25 ? "landscape" : progress > 0.75 ? "ancestry" : "history");
          }}
          className="min-h-0 overflow-x-auto overflow-y-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <span id={titleId} className="sr-only">A binary population evolving toward the highest-fitness region</span>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full min-w-[850px] lg:min-w-0" aria-hidden="true">
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

          <g>
            <text x="430" y="259" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>SEARCH HISTORY · SAME RUN</text>
            <rect x="430" y="274" width="330" height="76" fill={vizTokens.grid} opacity="0.36" />
            <line x1="430" x2="760" y1="344" y2="344" stroke={vizTokens.border} />
            <text x="438" y="290" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.classA}>BEST FITNESS ↑</text>
            <path d={fitnessHistoryPath} fill="none" stroke={vizTokens.classA} strokeWidth="3" />
            <circle cx={historyX(state.generation)} cy={historyFitnessY(best.fitness)} r="5" fill={vizTokens.classA} stroke={vizTokens.pointOutline} strokeWidth="1.5" />
            <text x="752" y="290" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.classA}>{best.fitness.toFixed(3)}</text>

            <rect x="430" y="378" width="330" height="80" fill={vizTokens.grid} opacity="0.36" />
            <line x1="430" x2="760" y1="452" y2="452" stroke={vizTokens.border} />
            <text x="438" y="394" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.path}>UNIQUE GENOMES ↓</text>
            <path d={diversityHistoryPath} fill="none" stroke={vizTokens.path} strokeWidth="3" />
            <circle cx={historyX(state.generation)} cy={historyDiversityY(diversity)} r="5" fill={vizTokens.path} stroke={vizTokens.pointOutline} strokeWidth="1.5" />
            <text x="752" y="394" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.path}>{diversity}/12</text>
            <text x="430" y="478" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>GEN 0</text>
            <text x="760" y="478" textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>GEN {historyMaxGeneration}</text>
          </g>

          <g transform="translate(820 45)">
            <text fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>EVOLUTION STATE</text>
            <text y="42" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>GENERATION</text><text x="300" y="42" textAnchor="end" fontFamily="var(--font-mono)" fontSize="22" fill={vizTokens.ink}>{state.generation}</text>
            <text y="78" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>BEST FITNESS</text><text x="300" y="78" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.classA}>{best.fitness.toFixed(3)}</text>
            <text y="108" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>UNIQUE GENOMES</text><text x="300" y="108" textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill={vizTokens.path}>{diversity}/12</text>
            <line y1="130" x2="300" y2="130" stroke={vizTokens.grid} />
            <text y="158" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>ONE REPRODUCTION EXAMPLE</text>
            {state.reproduction ? <>
              <GenomeRow label="PARENT A" genome={state.reproduction.parents[0]} y={169} tone={vizTokens.classA} />
              <GenomeRow label="PARENT B" genome={state.reproduction.parents[1]} y={194} tone={vizTokens.classB} />
              <GenomeRow label="CROSSED" genome={state.reproduction.beforeMutation} y={223} sourceSplit={state.reproduction.crossoverPoint} />
              <GenomeRow label="CHILD" genome={state.reproduction.afterMutation} y={252} sourceSplit={state.reproduction.crossoverPoint} mutations={state.reproduction.mutatedBits} />
              <line x1={82 + state.reproduction.crossoverPoint * 16 - 1} y1="218" x2={82 + state.reproduction.crossoverPoint * 16 - 1} y2="276" stroke={vizTokens.selection} strokeWidth="2" />
              <text x={82 + state.reproduction.crossoverPoint * 16 - 5} y="215" textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill={vizTokens.selection}>CUT</text>
              <text y="296" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.path}>{state.mutationCount} CHANGED BITS ACROSS THE POPULATION · RED = FLIP</text>
            </> : <text y="190" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>Take a step to select parents.</text>}
            <rect y="310" width="300" height="84" fill={vizTokens.grid} opacity="0.55" />
            <text x="12" y="333" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>SELECTION exploits fitness</text>
            <text x="12" y="356" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>CROSSOVER recombines evidence</text>
            <text x="12" y="379" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.ink}>MUTATION restores variation</text>
          </g>
          </svg>
          <p className="sr-only" aria-live="polite">Generation {state.generation}. Best fitness {best.fitness.toFixed(3)}. {diversity} unique genomes remain. {reproductionSummary}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-outline bg-surface-container-low px-3 py-2">
        <p className="w-full font-mono text-[9px] uppercase tracking-label text-on-surface-variant lg:hidden">Diagram stages above · guided step follows the evidence</p>
        <label className="min-w-48 flex-1 sm:max-w-sm"><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Mutation probability</span><span className="text-primary">{(mutationRate * 100).toFixed(1)}%</span></span><input aria-label="Mutation probability" type="range" min="0" max="0.2" step="0.005" value={mutationRate} onChange={(event) => setMutationRate(Number(event.target.value))} /></label>
        <div className="ml-auto flex gap-2"><button type="button" onClick={() => { setRunning(false); evolveOnce(); }} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary">Evolve once</button><button type="button" onClick={() => setRunning((value) => !value)} className="min-h-9 border border-outline bg-surface px-3 text-xs">{running ? "Pause" : "Run"}</button><button type="button" onClick={restart} className="min-h-9 border border-outline bg-surface px-3 text-xs">Restart</button></div>
      </div>
    </section>
  );
}
