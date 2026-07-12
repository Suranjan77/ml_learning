"use client";

import React, { useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const GOAL = "What is the population of the capital of France, doubled?";

interface Frame {
  step: number;
  phase: "thought" | "action" | "observation";
  tool?: "search" | "calculator" | "answer";
  text: string;
}

// A scripted ReAct trace: four loop iterations, each a Thought and an
// Action, with an Observation for every iteration except the terminal
// Answer action (which has nothing left to observe).
const FRAMES: Frame[] = [
  { step: 1, phase: "thought", text: "I need the capital of France, then its population." },
  { step: 1, phase: "action", tool: "search", text: 'search(query: "capital of France")' },
  { step: 1, phase: "observation", text: "Paris" },

  { step: 2, phase: "thought", text: "Now I need Paris's population." },
  { step: 2, phase: "action", tool: "search", text: 'search(query: "population of Paris")' },
  { step: 2, phase: "observation", text: "about 2.1 million (city proper)" },

  { step: 3, phase: "thought", text: "I have the population; now double it." },
  { step: 3, phase: "action", tool: "calculator", text: 'calculator(expression: "2.1 * 2")' },
  { step: 3, phase: "observation", text: "4.2" },

  { step: 4, phase: "thought", text: "I have everything I need to answer." },
  { step: 4, phase: "action", tool: "answer", text: 'Answer("About 4.2 million.")' },
];

const TOOL_LABEL: Record<string, string> = {
  search: "TOOL: search",
  calculator: "TOOL: calculator",
  answer: "FINAL ANSWER",
};

export default function AIAgentsViz() {
  const [tick, setTick] = useState(-1);

  const atStart = tick < 0;
  const atEnd = tick >= FRAMES.length - 1;
  const current = tick >= 0 ? FRAMES[tick] : null;
  const history = FRAMES.slice(0, tick + 1);

  const phaseLabel = !current
    ? "idle — press Next to start the agent"
    : current.phase === "thought"
      ? "THINK"
      : current.phase === "action"
        ? current.tool === "answer"
          ? "ACT — final answer"
          : "ACT — call a tool"
        : "OBSERVE";

  const caption = !current
    ? `The agent has not started. Press "Next step" to let it reason about the goal and choose its first action.`
    : current.phase === "thought"
      ? `Step ${current.step}: the model reasons in text about what it still needs before it can answer.`
      : current.phase === "action"
        ? current.tool === "answer"
          ? `Step ${current.step}: the model has enough grounded facts in its history, so it emits the terminal Answer action instead of another tool call.`
          : `Step ${current.step}: the model chooses a tool and structured arguments — this request is executed for real, not imagined.`
        : `Step ${current.step}: the tool's real return value is appended to the history as an observation, and the next Thought will condition on it.`;

  function next() {
    setTick((t) => Math.min(t + 1, FRAMES.length - 1));
  }

  function reset() {
    setTick(-1);
  }

  const canvas = (
    <div role="img" aria-label="AI Agent ReAct Loop Step-Through Diagram" className="flex flex-col gap-3 p-4 font-sans">
      {/* goal */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 border border-outline bg-surface-container-high px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">Goal</span>
        <span className="text-[14px] font-semibold text-on-surface">{GOAL}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* loop stages: show the latest frame of each phase within the current iteration */}
        {(["thought", "action", "observation"] as const).map((phase) => {
          const active = current?.phase === phase;
          const label = phase === "thought" ? "THINK" : phase === "action" ? "ACT" : "OBSERVE";
          const frameForPhase = current
            ? history.find((f) => f.step === current.step && f.phase === phase)
            : undefined;
          const toolPrefix = phase === "action" && frameForPhase?.tool ? `${TOOL_LABEL[frameForPhase.tool]} — ` : "";
          return (
            <div
              key={phase}
              className={`border p-3 ${active ? "border-2" : "border"}`}
              style={{
                borderColor: active ? COLORS.green : COLORS.border,
                background: active ? "rgba(85,107,74,0.10)" : "transparent",
              }}
            >
              <div className="mb-1 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                <span>{label}</span>
                {active && <span style={{ color: COLORS.green }}>active</span>}
              </div>
              <p className="text-[12px] text-on-surface">
                {frameForPhase ? `${toolPrefix}${frameForPhase.text}` : "—"}
              </p>
            </div>
          );
        })}
      </div>

      {/* state panel */}
      <div className="border border-outline bg-surface p-3">
        <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Agent state</div>
        <div className="mb-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-on-surface">
          <span>iteration: {current ? current.step : 0} / 4</span>
          <span>phase: {phaseLabel}</span>
          <span>history: {history.filter((f) => f.phase === "observation").length} observations</span>
        </div>
        <div className="flex flex-col gap-1">
          {history.length === 0 && <p className="font-mono text-[11px] text-on-surface-variant">(empty)</p>}
          {history.map((f, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
              <span
                className="w-20 shrink-0 uppercase"
                style={{ color: f.phase === "thought" ? COLORS.yellow : f.phase === "action" ? COLORS.cyan : COLORS.green }}
              >
                {f.phase}
              </span>
              <span className="text-on-surface-variant">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const controls = (
    <>
      <div className="flex flex-1 items-center justify-between gap-3 border border-outline bg-surface p-3">
        <div>
          <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Agent loop</div>
          <p className="font-sans text-[12px] text-on-surface-variant">
            {atEnd ? "Done — the agent reached a final answer." : "Step through Thought, Action, and Observation one at a time."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Reset the agent loop to the start"
            onClick={reset}
            disabled={atStart}
            className="flex h-10 items-center justify-center border border-outline bg-surface px-4 font-mono text-[13px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40"
          >
            Reset
          </button>
          <button
            aria-label="Advance the agent loop to the next step"
            onClick={next}
            disabled={atEnd}
            className={`flex h-10 items-center justify-center border px-5 font-mono text-[13px] font-bold uppercase tracking-wide transition-colors ${
              atEnd ? "border-outline bg-surface text-on-surface-variant opacity-40" : "border-primary bg-primary text-on-primary"
            }`}
          >
            Next step
          </button>
        </div>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A plain LLM call answers in one shot from memory. An <strong>agent</strong> instead runs a loop: it{" "}
        <strong>thinks</strong> about what it still needs, <strong>acts</strong> by calling a real tool with structured
        arguments, and <strong>observes</strong> the tool&apos;s actual return value — then repeats, with each
        observation added to its history, until it has enough grounded facts to give a final answer.
      </p>
      <p>
        This is the <strong>ReAct</strong> pattern. The loop is what lets the model solve compound goals no single
        retrieval or generation call could: it can look something up, compute on the result, and only then answer —
        catching its own mistakes along the way instead of guessing.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
