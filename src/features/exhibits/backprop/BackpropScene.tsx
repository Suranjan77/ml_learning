"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { ExhibitSceneProps } from "../types";
import { vizTokens } from "@/lib/vizTokens";
import { usePresentMode, useVizType } from "../presentMode";
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
  const prefersReduced = Boolean(useReducedMotion());
  const presenting = usePresentMode();
  const type = useVizType();
  const [input, setInput] = useState<[number, number]>(DEFAULT_INPUT);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [learningRate, setLearningRate] = useState(DEFAULT_RATE);
  const [updates, setUpdates] = useState(0);
  useEffect(() => { setInput([...DEFAULT_INPUT]); setTarget(DEFAULT_TARGET); setLearningRate(DEFAULT_RATE); setUpdates(0); }, [resetKey]);

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

  // The error panel only appears once there is an error to report. Before that
  // the network was drawn against a third of empty canvas; it now takes the
  // room back. When presenting, the panel needs a wider column for its enlarged
  // readouts, so the network gives a little back instead.
  const networkTransform = !showLoss
    ? "translate(88 -14) scale(1.1)"
    : presenting ? "scale(0.86)" : undefined;

  const panel = presenting
    ? { x: 735, width: 390, top: 40, height: showGradients ? 385 : 232 }
    : { x: 900, width: 235, top: showGradients ? 58 : 110, height: showGradients ? 404 : 255 };
  const arrow = presenting
    ? { y: 462, from: 700, to: 205, captionY: 494 }
    : { y: 430, from: 850, to: 205, captionY: 455 };

  // One vertical budget for the panel, as in the PCA readout: every line claims
  // a share of a rhythm that shrinks to fit, so enlarged type cannot push the
  // chain-rule expansion off the bottom of the frame.
  const slots = useMemo(() => {
    const shares = [
      // The three readouts carry the argument, so they claim more than a row
      // each: enlarged values need vertical room that the formula lines do not.
      ["header", 1.05], ["target", 1.35], ["prediction", 1.35], ["entropy", 0.9],
      ["divider", 0.78], ["afterUpdate", 0.82], ["lossLine", 0.72],
      ["divider2", 0.78], ["expand", 0.9], ["formula1", 0.82], ["formula2", 0.74],
      ["formula3", 0.92], ["numbers1", 0.72], ["numbers2", 0.92], ["result", 0],
    ] as const;
    type SlotName = (typeof shares)[number][0];
    const used: readonly (readonly [SlotName, number])[] = showGradients ? shares : shares.slice(0, 7);
    const total = used.reduce((sum, [, units]) => sum + units, 0) || 1;
    const row = Math.min(type.caption * 2.6, (panel.height - type.caption * 2.2) / total);
    let y = type.caption * 1.6;
    const placed = {} as Record<SlotName, number>;
    for (const [name, units] of used) {
      placed[name] = y;
      y += row * units;
    }
    return placed;
  }, [panel.height, showGradients, type.caption]);

  useEffect(() => {
    if (!playing || prefersReduced || !showGradients || updates >= 50) return;
    const timer = window.setTimeout(() => {
      // The address-bar write stays outside the state updater: React may call
      // an updater during render, and touching history there updates the
      // Router mid-render. `updates` is already a dependency of this effect.
      const next = Math.min(50, updates + 1);
      setUpdates(next);
      syncControls({ updates: next });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [input, learningRate, playing, prefersReduced, showGradients, target, updates]);

  const padding = type.caption * 1.5;

  return <section aria-label="Backpropagation visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
    <div role="img" aria-labelledby={titleId} className="min-h-0 overflow-x-auto overflow-y-hidden">
      <span id={titleId} className="sr-only">Forward activations and backward gradients through a small neural network</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full min-w-[700px] sm:min-w-0 sm:w-full" aria-hidden="true">
        <rect width={WIDTH} height={HEIGHT} fill={vizTokens.canvas} />
        <g transform={networkTransform}>
          <text x="90" y="55" fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>INPUTS</text><text x="420" y="55" fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>HIDDEN FEATURES</text><text x="750" y="55" fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>PREDICTION</text>
          {INPUT_POS.flatMap(([x1, y1], inputIndex) => HIDDEN_POS.map(([x2, y2], hiddenIndex) => {
            const weight = weights.inputHidden[inputIndex][hiddenIndex]; const grad = gradient.inputHidden[inputIndex][hiddenIndex];
            return <g key={`${inputIndex}-${hiddenIndex}`}><line x1={x1 + 34} y1={y1} x2={x2 - 34} y2={y2} stroke={showGradients ? tone(grad) : tone(weight)} strokeWidth={2 + Math.abs(showGradients ? grad : weight) * 7} opacity="0.65" /><text x={(x1+x2)/2} y={(y1+y2)/2 - 7} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>{showGradients ? `∂ ${grad.toFixed(3)}` : `w ${weight.toFixed(2)}`}</text></g>;
          }))}
          {HIDDEN_POS.map(([x1, y1], index) => { const weight = weights.hiddenOutput[index]; const grad = gradient.hiddenOutput[index]; return <g key={index}><line x1={x1 + 34} y1={y1} x2={OUTPUT_POS[0] - 34} y2={OUTPUT_POS[1]} stroke={showGradients ? tone(grad) : tone(weight)} strokeWidth={2 + Math.abs(showGradients ? grad : weight) * 7} opacity="0.65" /><text x={(x1+OUTPUT_POS[0])/2} y={(y1+OUTPUT_POS[1])/2 - 9} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.mutedInk}>{showGradients ? `∂ ${grad.toFixed(3)}` : `w ${weight.toFixed(2)}`}</text></g>; })}
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
            <text x="297" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.selection}>TRACE ∂L/∂w(x₁→h₁)</text>
          </g> : null}
          {INPUT_POS.map(([x,y], index) => <g key={index}><circle cx={x} cy={y} r="35" fill={vizTokens.canvas} stroke={vizTokens.classA} strokeWidth="3" /><text x={x} y={y + type.value * 0.36} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.value} fill={vizTokens.ink}>{input[index].toFixed(2)}</text><text x={x} y={y+58} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>x{index+1}</text></g>)}
          {HIDDEN_POS.map(([x,y], index) => <g key={index}><circle cx={x} cy={y} r="38" fill={showActivations ? vizTokens.classA : vizTokens.canvas} fillOpacity={showActivations ? 0.25 + pass.hidden[index]*0.65 : 1} stroke={vizTokens.classA} strokeWidth="3" /><text x={x} y={y + type.value * 0.36} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.value} fill={vizTokens.ink}>{showActivations ? pass.hidden[index].toFixed(2) : "?"}</text><text x={x} y={y+61} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>sigmoid</text></g>)}
          <circle cx={OUTPUT_POS[0]} cy={OUTPUT_POS[1]} r="46" fill={showActivations ? vizTokens.selection : vizTokens.canvas} fillOpacity={showActivations ? 0.25 + pass.output*0.6 : 1} stroke={vizTokens.selection} strokeWidth="3" /><text x={OUTPUT_POS[0]} y={OUTPUT_POS[1] + type.valueStrong * 0.34} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.valueStrong} fill={vizTokens.ink}>{showActivations ? pass.output.toFixed(3) : "?"}</text>
        </g>
        {showLoss ? <g transform={`translate(${panel.x} ${panel.top})`}>
          <rect width={panel.width} height={panel.height} fill={vizTokens.grid} opacity="0.72" />
          <text x={padding} y={slots.header} fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>ERROR SIGNAL</text>
          <text x={padding} y={slots.target} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.mutedInk}>TARGET</text><text x={panel.width - padding} y={slots.target} textAnchor="end" fontFamily="var(--font-mono)" fontSize={type.value} fill={vizTokens.ink}>{target}</text>
          <text x={padding} y={slots.prediction} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.mutedInk}>PREDICTION</text><text x={panel.width - padding} y={slots.prediction} textAnchor="end" fontFamily="var(--font-mono)" fontSize={type.value} fill={vizTokens.selection}>{pass.output.toFixed(3)}</text>
          <text x={padding} y={slots.entropy} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.mutedInk}>CROSS-ENTROPY</text><text x={panel.width - padding} y={slots.entropy} textAnchor="end" fontFamily="var(--font-mono)" fontSize={type.value} fill={vizTokens.error}>{pass.loss.toFixed(3)}</text>
          <line x1={padding} x2={panel.width - padding} y1={slots.divider} y2={slots.divider} stroke={vizTokens.border} />
          <text x={padding} y={slots.afterUpdate} fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>AFTER ONE UPDATE</text>
          <text x={padding} y={slots.lossLine} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.classA}>loss {pass.loss.toFixed(3)} → {preview.loss.toFixed(3)}</text>
          {showGradients ? <g>
            <line x1={padding} x2={panel.width - padding} y1={slots.divider2} y2={slots.divider2} stroke={vizTokens.border} />
            <text x={padding} y={slots.expand} fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.selection}>EXPAND THE HIGHLIGHTED GRADIENT</text>
            <text x={padding} y={slots.formula1} fontFamily="var(--font-mono)" fontSize={type.caption} fill={vizTokens.ink}>∂L/∂w(x₁→h₁)</text>
            <text x={padding} y={slots.formula2} fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>(ŷ−y) × w(h₁→ŷ)</text>
            <text x={padding} y={slots.formula3} fontFamily="var(--font-mono)" fontSize={type.labelStrong} fill={vizTokens.mutedInk}>× h₁(1−h₁) × x₁</text>
            <text x={padding} y={slots.numbers1} fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.ink}>{tracedChain.outputError.toFixed(3)} × {tracedChain.downstreamWeight.toFixed(3)}</text>
            <text x={padding} y={slots.numbers2} fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.ink}>× {tracedChain.hiddenSlope.toFixed(3)} × {tracedChain.inputValue.toFixed(2)}</text>
            <text x={padding} y={slots.result} fontFamily="var(--font-mono)" fontSize={type.body} fill={tone(tracedChain.gradient)}>= {tracedChain.gradient.toFixed(4)}</text>
          </g> : null}
        </g> : null}
        {showGradients ? <><path d={`M${arrow.from} ${arrow.y} H${arrow.to}`} stroke={vizTokens.error} strokeWidth="3" strokeDasharray="8 6" /><path d={`M${arrow.to} ${arrow.y} l12-6v12z`} fill={vizTokens.error} /><text x={(arrow.from + arrow.to) / 2} y={arrow.captionY} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={type.label} fill={vizTokens.error}>BACKWARD: chain rule assigns each weight responsibility for the error</text></> : null}
      </svg>
      <p className="sr-only" aria-live="polite">Prediction {pass.output.toFixed(3)}, target {target}, loss {pass.loss.toFixed(3)}. {updates} updates applied.</p>
    </div>
    <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:px-3">
      {input.map((value,index) => <label key={index}><span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Input x{index+1}</span><span>{value.toFixed(2)}</span></span><input aria-label={`Input x${index+1}`} type="range" min="0" max="1" step="0.05" value={value} onChange={(event) => { const nextInput = input.map((item,i) => i === index ? Number(event.target.value) : item) as [number,number]; setInput(nextInput); setUpdates(0); syncControls({ input: nextInput, updates: 0 }); }} /></label>)}
      <label><span className="flex justify-between font-mono viz-label uppercase tracking-label text-on-surface-variant"><span>Learning rate</span><span>{learningRate.toFixed(2)}</span></span><input aria-label="Learning rate" type="range" min="0.05" max="1" step="0.05" value={learningRate} onChange={(event) => { const nextRate = Number(event.target.value); setLearningRate(nextRate); setUpdates(0); syncControls({ learningRate: nextRate, updates: 0 }); }} /></label>
      <div className="flex gap-2"><button type="button" onClick={() => { const nextTarget = 1-target; setTarget(nextTarget); setUpdates(0); syncControls({ target: nextTarget, updates: 0 }); }} className="min-h-9 border border-outline bg-surface px-3 text-xs">Target {target}</button><button type="button" disabled={updates >= 50} onClick={() => { const nextUpdates = Math.min(50, updates + 1); setUpdates(nextUpdates); syncControls({ updates: nextUpdates }); }} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary disabled:cursor-not-allowed disabled:opacity-50">Apply update</button></div>
    </div>
  </section>;
}
