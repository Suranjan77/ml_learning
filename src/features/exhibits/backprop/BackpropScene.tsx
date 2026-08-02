"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { numberParam, replaceSceneUrlState, useSceneUrlState } from "../sceneUrlState";
import { applyGradients, forward, gradients, weightsAfterUpdates } from "./model";

const WIDTH = 1_180; const HEIGHT = 520;
const INPUT_POS = [[130, 170], [130, 350]] as const;
const HIDDEN_POS = [[470, 145], [470, 375]] as const;
const OUTPUT_POS = [785, 260] as const;
const DEFAULT_INPUT: [number, number] = [0.8, 0.2];
const DEFAULT_TARGET = 1;
const DEFAULT_RATE = 0.5;

function tone(value: number) { return value >= 0 ? vizTokens.classA : vizTokens.classB; }

export default function BackpropScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const activeStep = Math.max(0, Math.min(3, step));
  const titleId = useId();
  const diagramRef = useRef<HTMLDivElement>(null);
  const prefersReduced = Boolean(useReducedMotion());
  const [input, setInput] = useState<[number, number]>(DEFAULT_INPUT);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [learningRate, setLearningRate] = useState(DEFAULT_RATE);
  const [updates, setUpdates] = useState(0);
  const [mobilePanel, setMobilePanel] = useState<"network" | "result">(activeStep >= 2 ? "result" : "network");
  useEffect(() => { setInput([...DEFAULT_INPUT]); setTarget(DEFAULT_TARGET); setLearningRate(DEFAULT_RATE); setUpdates(0); }, [resetKey]);

  const showMobilePanel = (panel: "network" | "result") => {
    setMobilePanel(panel);
    const diagram = diagramRef.current;
    if (!diagram) return;
    diagram.scrollTo({ left: panel === "network" ? 0 : diagram.scrollWidth - diagram.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const panel = activeStep >= 2 ? "result" : "network";
    setMobilePanel(panel);
    const frame = window.requestAnimationFrame(() => {
      const diagram = diagramRef.current;
      if (diagram) diagram.scrollLeft = panel === "network" ? 0 : diagram.scrollWidth - diagram.clientWidth;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeStep, resetKey]);

  const syncControls = (next: { input?: [number, number]; target?: number; learningRate?: number; updates?: number }) => {
    const values = { input, target, learningRate, updates, ...next };
    replaceSceneUrlState([
      { key: "x1", value: String(values.input[0]), defaultValue: String(DEFAULT_INPUT[0]) },
      { key: "x2", value: String(values.input[1]), defaultValue: String(DEFAULT_INPUT[1]) },
      { key: "target", value: String(values.target), defaultValue: String(DEFAULT_TARGET) },
      { key: "lr", value: String(values.learningRate), defaultValue: String(DEFAULT_RATE) },
      { key: "updates", value: String(values.updates), defaultValue: "0" },
    ]);
  };

  useSceneUrlState((params) => {
    const nextInput: [number, number] = [
      numberParam(params, "x1", { min: 0, max: 1, step: 0.05 }) ?? DEFAULT_INPUT[0],
      numberParam(params, "x2", { min: 0, max: 1, step: 0.05 }) ?? DEFAULT_INPUT[1],
    ];
    const nextTarget = numberParam(params, "target", { min: 0, max: 1, step: 1 }) ?? DEFAULT_TARGET;
    const nextRate = numberParam(params, "lr", { min: 0.05, max: 1, step: 0.05 }) ?? DEFAULT_RATE;
    const nextUpdates = numberParam(params, "updates", { min: 0, max: 50, step: 1 }) ?? 0;
    setInput(nextInput);
    setTarget(nextTarget);
    setLearningRate(nextRate);
    setUpdates(nextUpdates);
  }, resetKey);

  const weights = useMemo(
    () => weightsAfterUpdates(input, target, learningRate, updates),
    [input, learningRate, target, updates],
  );
  const pass = useMemo(() => forward(input, target, weights), [input, target, weights]);
  const gradient = useMemo(() => gradients(input, target, weights), [input, target, weights]);
  const preview = useMemo(() => forward(input, target, applyGradients(weights, gradient, learningRate)), [gradient, input, learningRate, target, weights]);
  const tracedChain = {
    outputError: pass.output - target,
    downstreamWeight: weights.hiddenOutput[0],
    hiddenSlope: pass.hidden[0] * (1 - pass.hidden[0]),
    inputValue: input[0],
    gradient: gradient.inputHidden[0][0],
  };
  const showActivations = activeStep >= 1;
  const showLoss = activeStep >= 2;
  const showGradients = activeStep >= 3;

  useEffect(() => {
    if (!playing || prefersReduced || !showGradients || updates >= 50) return;
    const timer = window.setTimeout(() => {
      setUpdates((value) => {
        const next = Math.min(50, value + 1);
        syncControls({ updates: next });
        return next;
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [input, learningRate, playing, prefersReduced, showGradients, target, updates]);

  return <section aria-label="Backpropagation visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] sm:block">
      <div className="grid min-h-10 grid-cols-2 border-b border-outline bg-surface-container-low font-mono text-[9px] uppercase tracking-[0.08em] sm:hidden" aria-label="Backpropagation diagram stage">
        <button type="button" aria-pressed={mobilePanel === "network"} onClick={() => showMobilePanel("network")} className={`border-r border-outline px-2 ${mobilePanel === "network" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>Network</button>
        <button type="button" aria-pressed={mobilePanel === "result"} onClick={() => showMobilePanel("result")} className={mobilePanel === "result" ? "bg-primary text-on-primary" : "text-on-surface-variant"}>Prediction + loss</button>
      </div>
      <div
        ref={diagramRef}
        role="img"
        aria-labelledby={titleId}
        tabIndex={0}
        onScroll={(event) => {
          const element = event.currentTarget;
          setMobilePanel(element.scrollLeft > (element.scrollWidth - element.clientWidth) / 2 ? "result" : "network");
        }}
        className="min-h-0 overflow-x-auto overflow-y-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <span id={titleId} className="sr-only">Forward activations and backward gradients through a small neural network</span>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-w-[700px] sm:min-w-0 sm:w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        <text x="90" y="55" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>INPUTS</text><text x="420" y="55" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>HIDDEN FEATURES</text><text x="750" y="55" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>PREDICTION</text>
        {INPUT_POS.flatMap(([x1, y1], inputIndex) => HIDDEN_POS.map(([x2, y2], hiddenIndex) => {
          const weight = weights.inputHidden[inputIndex][hiddenIndex]; const grad = gradient.inputHidden[inputIndex][hiddenIndex];
          return <g key={`${inputIndex}-${hiddenIndex}`}><line x1={x1 + 34} y1={y1} x2={x2 - 34} y2={y2} stroke={showGradients ? tone(grad) : tone(weight)} strokeWidth={2 + Math.abs(showGradients ? grad : weight) * 7} opacity="0.65" /><text x={(x1+x2)/2} y={(y1+y2)/2 - 7} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>{showGradients ? `∂ ${grad.toFixed(3)}` : `w ${weight.toFixed(2)}`}</text></g>;
        }))}
        {HIDDEN_POS.map(([x1, y1], index) => { const weight = weights.hiddenOutput[index]; const grad = gradient.hiddenOutput[index]; return <g key={index}><line x1={x1 + 34} y1={y1} x2={OUTPUT_POS[0] - 34} y2={OUTPUT_POS[1]} stroke={showGradients ? tone(grad) : tone(weight)} strokeWidth={2 + Math.abs(showGradients ? grad : weight) * 7} opacity="0.65" /><text x={(x1+OUTPUT_POS[0])/2} y={(y1+OUTPUT_POS[1])/2 - 9} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.mutedInk}>{showGradients ? `∂ ${grad.toFixed(3)}` : `w ${weight.toFixed(2)}`}</text></g>; })}
        {showActivations && !showGradients && !prefersReduced ? <g>
          {INPUT_POS.flatMap(([x1,y1], i) => HIDDEN_POS.map(([x2,y2], j) => <circle key={`forward-a-${i}-${j}`} r="5" fill={vizTokens.selection}><animateMotion path={`M${x1+34} ${y1} L${x2-34} ${y2}`} dur="1.8s" begin={`${(i*2+j)*0.16}s`} repeatCount="indefinite" /></circle>))}
          {HIDDEN_POS.map(([x1,y1], i) => <circle key={`forward-b-${i}`} r="6" fill={vizTokens.selection}><animateMotion path={`M${x1+34} ${y1} L${OUTPUT_POS[0]-34} ${OUTPUT_POS[1]}`} dur="1.5s" begin={`${0.6+i*0.2}s`} repeatCount="indefinite" /></circle>)}
        </g> : null}
        {showGradients && !prefersReduced ? <g>
          {HIDDEN_POS.map(([x1,y1], i) => <circle key={`back-b-${i}`} r="6" fill={vizTokens.error}><animateMotion path={`M${OUTPUT_POS[0]-34} ${OUTPUT_POS[1]} L${x1+34} ${y1}`} dur="1.45s" begin={`${i*0.22}s`} repeatCount="indefinite" /></circle>)}
          {INPUT_POS.flatMap(([x1,y1], i) => HIDDEN_POS.map(([x2,y2], j) => <circle key={`back-a-${i}-${j}`} r="5" fill={vizTokens.error}><animateMotion path={`M${x2-34} ${y2} L${x1+34} ${y1}`} dur="1.8s" begin={`${0.5+(i*2+j)*0.14}s`} repeatCount="indefinite" /></circle>))}
        </g> : null}
        {showGradients ? <g>
          <path d="M751 260 L508 145 M436 145 L164 170" fill="none" stroke={vizTokens.selection} strokeWidth="8" opacity="0.26" />
          <path d="M751 260 L508 145 M436 145 L164 170" fill="none" stroke={vizTokens.selection} strokeWidth="2" strokeDasharray="7 5" />
          <circle cx="785" cy="260" r="53" fill="none" stroke={vizTokens.selection} strokeWidth="2" />
          <circle cx="470" cy="145" r="45" fill="none" stroke={vizTokens.selection} strokeWidth="2" />
          <circle cx="130" cy="170" r="42" fill="none" stroke={vizTokens.selection} strokeWidth="2" />
          <text x="297" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.selection}>TRACE ∂L/∂w(x₁→h₁)</text>
        </g> : null}
        {INPUT_POS.map(([x,y], index) => <g key={index}><circle cx={x} cy={y} r="35" fill={vizTokens.canvas} stroke={vizTokens.classA} strokeWidth="3" /><text x={x} y={y+6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="16" fill={vizTokens.ink}>{input[index].toFixed(2)}</text><text x={x} y={y+58} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>x{index+1}</text></g>)}
        {HIDDEN_POS.map(([x,y], index) => <g key={index}><circle cx={x} cy={y} r="38" fill={showActivations ? vizTokens.classA : vizTokens.canvas} fillOpacity={showActivations ? 0.25 + pass.hidden[index]*0.65 : 1} stroke={vizTokens.classA} strokeWidth="3" /><text x={x} y={y+6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="16" fill={vizTokens.ink}>{showActivations ? pass.hidden[index].toFixed(2) : "?"}</text><text x={x} y={y+61} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>sigmoid</text></g>)}
        <circle cx={OUTPUT_POS[0]} cy={OUTPUT_POS[1]} r="46" fill={showActivations ? vizTokens.selection : vizTokens.canvas} fillOpacity={showActivations ? 0.25 + pass.output*0.6 : 1} stroke={vizTokens.selection} strokeWidth="3" /><text x={OUTPUT_POS[0]} y={OUTPUT_POS[1]+6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" fill={vizTokens.ink}>{showActivations ? pass.output.toFixed(3) : "?"}</text>
        {showLoss ? <g transform={`translate(900 ${showGradients ? 58 : 110})`}>
          <rect width="235" height={showGradients ? 404 : 255} fill={vizTokens.grid} opacity="0.72" />
          <text x="16" y="27" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>ERROR SIGNAL</text>
          <text x="16" y="67" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>TARGET</text><text x="215" y="67" textAnchor="end" fontFamily="var(--font-mono)" fontSize="20" fill={vizTokens.ink}>{target}</text>
          <text x="16" y="103" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>PREDICTION</text><text x="215" y="103" textAnchor="end" fontFamily="var(--font-mono)" fontSize="20" fill={vizTokens.selection}>{pass.output.toFixed(3)}</text>
          <text x="16" y="139" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.mutedInk}>CROSS-ENTROPY</text><text x="215" y="139" textAnchor="end" fontFamily="var(--font-mono)" fontSize="20" fill={vizTokens.error}>{pass.loss.toFixed(3)}</text>
          <line x1="16" x2="219" y1="160" y2="160" stroke={vizTokens.border} />
          <text x="16" y="186" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>AFTER ONE UPDATE</text>
          <text x="16" y="214" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.classA}>loss {pass.loss.toFixed(3)} → {preview.loss.toFixed(3)}</text>
          {showGradients ? <g transform="translate(16 236)">
            <line x1="0" x2="203" y1="0" y2="0" stroke={vizTokens.border} />
            <text y="25" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.selection}>EXPAND THE HIGHLIGHTED GRADIENT</text>
            <text y="51" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.ink}>∂L/∂w(x₁→h₁)</text>
            <text y="74" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>(ŷ−y) × w(h₁→ŷ)</text>
            <text y="94" fontFamily="var(--font-mono)" fontSize="10" fill={vizTokens.mutedInk}>× h₁(1−h₁) × x₁</text>
            <text y="119" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.ink}>{tracedChain.outputError.toFixed(3)} × {tracedChain.downstreamWeight.toFixed(3)}</text>
            <text y="137" fontFamily="var(--font-mono)" fontSize="9" fill={vizTokens.ink}>× {tracedChain.hiddenSlope.toFixed(3)} × {tracedChain.inputValue.toFixed(2)}</text>
            <text y="158" fontFamily="var(--font-mono)" fontSize="12" fill={tone(tracedChain.gradient)}>= {tracedChain.gradient.toFixed(4)}</text>
          </g> : null}
        </g> : null}
        {showGradients ? <><path d="M850 430 H205" stroke={vizTokens.error} strokeWidth="3" strokeDasharray="8 6" /><path d="M205 430 l12-6v12z" fill={vizTokens.error} /><text x="530" y="455" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={vizTokens.error}>BACKWARD: CHAIN-RULE GRADIENTS</text></> : null}
        </svg>
        <p className="sr-only" aria-live="polite">Prediction {pass.output.toFixed(3)}, target {target}, loss {pass.loss.toFixed(3)}. {updates} updates applied.</p>
      </div>
    </div>
    <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:px-3">
      {input.map((value,index) => <label key={index}><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Input x{index+1}</span><span>{value.toFixed(2)}</span></span><input aria-label={`Input x${index+1}`} type="range" min="0" max="1" step="0.05" value={value} onChange={(event) => { const nextInput = input.map((item,i) => i === index ? Number(event.target.value) : item) as [number,number]; setInput(nextInput); setUpdates(0); syncControls({ input: nextInput, updates: 0 }); }} /></label>)}
      <label><span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>Learning rate</span><span>{learningRate.toFixed(2)}</span></span><input aria-label="Learning rate" type="range" min="0.05" max="1" step="0.05" value={learningRate} onChange={(event) => { const nextRate = Number(event.target.value); setLearningRate(nextRate); setUpdates(0); syncControls({ learningRate: nextRate, updates: 0 }); }} /></label>
      <div className="flex gap-2"><button type="button" onClick={() => { const nextTarget = 1-target; setTarget(nextTarget); setUpdates(0); syncControls({ target: nextTarget, updates: 0 }); }} className="min-h-9 border border-outline bg-surface px-3 text-xs">Target {target}</button><button type="button" disabled={updates >= 50} onClick={() => { const nextUpdates = Math.min(50, updates + 1); setUpdates(nextUpdates); syncControls({ updates: nextUpdates }); }} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary disabled:cursor-not-allowed disabled:opacity-50">Apply update</button></div>
    </div>
  </section>;
}
