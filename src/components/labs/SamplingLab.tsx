"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A tiny hand-authored word-level language model. Each entry maps the
 * previous word to candidate next words with raw logits. It is deliberately
 * small enough to display the full distribution at every step — the point
 * is to make temperature and top-k tangible, not to model language well.
 */
const START = "<start>";
const END = ".";

const LANGUAGE_MODEL: Record<string, Array<[string, number]>> = {
  [START]: [
    ["the", 2.2],
    ["a", 1.2],
    ["my", 0.7],
    ["sometimes", 0.3],
  ],
  the: [
    ["robot", 2.2],
    ["cat", 1.6],
    ["moon", 1.0],
    ["painting", 0.8],
    ["internet", 0.5],
  ],
  a: [
    ["robot", 1.8],
    ["dream", 1.3],
    ["painting", 1.0],
    ["glitch", 0.7],
    ["sandwich", 0.3],
  ],
  my: [
    ["robot", 1.9],
    ["cat", 1.5],
    ["code", 1.0],
    ["dream", 0.6],
  ],
  sometimes: [
    ["the", 1.5],
    ["my", 1.0],
    ["a", 0.8],
  ],
  robot: [
    ["paints", 1.8],
    ["dreams", 1.4],
    ["hums", 1.0],
    ["sleeps", 0.8],
    ["overheats", 0.5],
  ],
  cat: [
    ["sleeps", 2.0],
    ["dreams", 1.2],
    ["judges", 0.9],
    ["paints", 0.5],
    ["hums", 0.4],
  ],
  moon: [
    ["glows", 2.0],
    ["waits", 0.9],
    ["hums", 0.8],
  ],
  painting: [
    ["glows", 1.4],
    ["waits", 0.8],
    ["dreams", 0.6],
  ],
  internet: [
    ["hums", 1.5],
    ["waits", 0.9],
    ["judges", 0.7],
  ],
  code: [
    ["dreams", 1.3],
    ["waits", 1.0],
    ["overheats", 0.8],
  ],
  dream: [
    ["glows", 1.3],
    ["waits", 1.0],
    ["hums", 0.8],
  ],
  glitch: [
    ["hums", 1.2],
    ["glows", 0.9],
    ["waits", 0.7],
  ],
  sandwich: [
    ["waits", 1.5],
    ["judges", 0.6],
    ["glows", 0.4],
  ],
  paints: [
    ["quietly", 1.6],
    ["slowly", 1.2],
    ["at", 0.9],
    ["again", 0.7],
  ],
  dreams: [
    ["about", 1.7],
    ["quietly", 1.3],
    ["again", 0.8],
  ],
  hums: [
    ["quietly", 1.7],
    ["slowly", 1.0],
    ["again", 0.6],
  ],
  sleeps: [
    ["quietly", 1.4],
    ["again", 1.0],
    ["at", 0.7],
  ],
  overheats: [
    ["again", 1.3],
    ["quietly", 0.6],
    ["slowly", 0.5],
  ],
  glows: [
    ["quietly", 1.2],
    ["slowly", 1.0],
    ["again", 0.8],
  ],
  waits: [
    ["quietly", 1.5],
    ["at", 1.0],
    ["again", 0.7],
  ],
  judges: [
    ["quietly", 1.3],
    ["everyone", 1.1],
    ["slowly", 0.9],
  ],
  quietly: [
    [END, 2.0],
    ["at", 0.6],
    ["again", 0.5],
  ],
  slowly: [
    [END, 1.8],
    ["again", 0.6],
  ],
  again: [[END, 2.2]],
  about: [
    ["the", 1.6],
    ["a", 1.2],
    ["electricity", 0.9],
  ],
  at: [
    ["night", 2.0],
    ["dawn", 1.0],
    ["noon", 0.8],
  ],
  night: [[END, 2.2]],
  noon: [[END, 2.0]],
  dawn: [[END, 2.0]],
  electricity: [[END, 1.8]],
  everyone: [[END, 2.0]],
};

const INITIAL_TOKENS = ["the", "robot"];
const MAX_TOKENS = 26;

interface Candidate {
  token: string;
  logit: number;
  /** Softmax probability at temperature 1 — the model's honest opinion. */
  baseProbability: number;
  /** Probability after temperature scaling and top-k truncation. */
  adjustedProbability: number;
  cutByTopK: boolean;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((logit) => Math.exp(logit - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
}

function getCandidates(
  context: string,
  temperature: number,
  topK: number,
): Candidate[] {
  const entries = [...(LANGUAGE_MODEL[context] ?? LANGUAGE_MODEL[START])].sort(
    (a, b) => b[1] - a[1],
  );
  const logits = entries.map(([, logit]) => logit);
  const base = softmax(logits);
  const scaled = softmax(logits.map((logit) => logit / temperature));

  // Entries are authored in descending-logit order, so the first k survive.
  const kept = scaled.map((probability, index) => (index < topK ? probability : 0));
  const keptSum = kept.reduce((total, value) => total + value, 0);

  return entries.map(([token], index) => ({
    token,
    logit: logits[index],
    baseProbability: base[index],
    adjustedProbability: keptSum > 0 ? kept[index] / keptSum : 0,
    cutByTopK: index >= topK,
  }));
}

function sampleFrom(candidates: Candidate[]): string {
  const roll = Math.random();
  let cumulative = 0;
  for (const candidate of candidates) {
    cumulative += candidate.adjustedProbability;
    if (roll < cumulative) {
      return candidate.token;
    }
  }
  return candidates[0].token;
}

function temperatureDescription(temperature: number) {
  if (temperature <= 0.35) {
    return "Nearly greedy — the top word wins almost every time. Output gets repetitive and predictable.";
  }
  if (temperature <= 0.8) {
    return "Conservative — likely words are boosted further. Safe, slightly dull output.";
  }
  if (temperature <= 1.2) {
    return "Neutral — the distribution is used roughly as the model learned it.";
  }
  if (temperature <= 1.6) {
    return "Adventurous — rare words get a real chance. Output becomes more surprising.";
  }
  return "Chaotic — the distribution flattens toward uniform. Word choice is close to random.";
}

export default function SamplingLab() {
  const [tokens, setTokens] = useState<string[]>(INITIAL_TOKENS);
  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState(5);
  const [autoRunning, setAutoRunning] = useState(false);
  const [lastSampled, setLastSampled] = useState<string | null>(null);
  const autoRef = useRef<number | null>(null);

  const context = tokens[tokens.length - 1] === END ? START : tokens[tokens.length - 1];
  const candidates = useMemo(
    () => getCandidates(context, temperature, topK),
    [context, temperature, topK],
  );

  const atLimit = tokens.length >= MAX_TOKENS;

  const sampleNext = () => {
    if (atLimit) {
      setAutoRunning(false);
      return;
    }
    const next = sampleFrom(getCandidates(context, temperature, topK));
    setLastSampled(next);
    setTokens((current) => [...current, next]);
  };

  useEffect(() => {
    if (!autoRunning) return;
    if (atLimit) {
      setAutoRunning(false);
      return;
    }
    autoRef.current = window.setTimeout(sampleNext, 380);
    return () => {
      if (autoRef.current !== null) window.clearTimeout(autoRef.current);
    };
  }, [autoRunning, tokens, atLimit]);

  const reset = () => {
    setAutoRunning(false);
    setTokens(INITIAL_TOKENS);
    setLastSampled(null);
  };

  const maxBar = Math.max(
    ...candidates.map((candidate) =>
      Math.max(candidate.adjustedProbability, candidate.baseProbability),
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Generated text */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
          Generated text
        </p>
        <p className="min-h-[3.5rem] font-headline text-2xl font-medium leading-relaxed text-on-surface sm:text-3xl">
          {tokens.map((token, index) => (
            <span
              key={`${token}-${index}`}
              className={
                index === tokens.length - 1 && token === lastSampled
                  ? "bg-primary/15 text-primary"
                  : undefined
              }
            >
              {token === END ? "." : `${index === 0 ? "" : " "}${token}`}
            </span>
          ))}
          {!atLimit && <span className="animate-pulse text-primary"> ▌</span>}
        </p>
        {atLimit && (
          <p className="mt-2 text-sm text-on-surface-variant">
            Token limit reached — reset to keep generating.
          </p>
        )}
      </div>

      {/* Distribution */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Next-word distribution after{" "}
            <span className="text-primary">
              &ldquo;{context === START ? "(new sentence)" : context}&rdquo;
            </span>
          </p>
          <p className="text-[13px] text-on-surface-variant">
            <span className="mr-3 inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-4 bg-primary/70" /> sampled from
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-0.5 bg-on-surface" /> model&rsquo;s
              raw opinion (T=1)
            </span>
          </p>
        </div>

        <ul className="space-y-2.5">
          {candidates.map((candidate) => (
            <li key={candidate.token} className="flex items-center gap-3">
              <span
                className={`w-24 shrink-0 truncate text-right font-mono text-sm ${
                  candidate.cutByTopK
                    ? "text-on-surface-variant/50 line-through"
                    : "text-on-surface"
                }`}
              >
                {candidate.token === END ? "(end)" : candidate.token}
              </span>
              <div className="relative h-6 flex-1 border border-outline bg-surface">
                <div
                  className={`h-full transition-all duration-300 ${
                    candidate.cutByTopK ? "bg-outline-variant/30" : "bg-primary/70"
                  }`}
                  style={{
                    width: `${(candidate.adjustedProbability / maxBar) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-on-surface"
                  style={{
                    left: `${(candidate.baseProbability / maxBar) * 100}%`,
                  }}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`w-14 shrink-0 font-mono text-sm ${
                  candidate.cutByTopK
                    ? "text-on-surface-variant/50"
                    : "text-on-surface"
                }`}
              >
                {(candidate.adjustedProbability * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-outline bg-surface-container p-5 accent-left-tertiary">
          <label
            htmlFor="sampling-temperature"
            className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface"
          >
            Temperature <span className="text-tertiary">{temperature.toFixed(2)}</span>
          </label>
          <input
            id="sampling-temperature"
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
            className="w-full accent-tertiary"
          />
          <p className="mt-2 min-h-[3.25rem] text-[13px] leading-5 text-on-surface-variant">
            {temperatureDescription(temperature)}
          </p>
        </div>

        <div className="border border-outline bg-surface-container p-5 accent-left-secondary">
          <label
            htmlFor="sampling-top-k"
            className="mb-2 flex justify-between font-mono text-[13px] font-bold tracking-wide text-on-surface"
          >
            Top-k <span className="text-secondary">{topK}</span>
          </label>
          <input
            id="sampling-top-k"
            type="range"
            min="1"
            max="5"
            step="1"
            value={topK}
            onChange={(event) => setTopK(Number(event.target.value))}
            className="w-full accent-secondary"
          />
          <p className="mt-2 min-h-[3.25rem] text-[13px] leading-5 text-on-surface-variant">
            {topK === 1
              ? "Only the single most likely word survives — sampling becomes greedy decoding, whatever the temperature."
              : `Only the ${topK} most likely words survive; everything below the cut is struck out above and gets exactly 0% chance.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={sampleNext}
          disabled={atLimit || autoRunning}
          className="rounded border border-primary/40 bg-primary px-8 py-4 text-base font-semibold text-on-primary transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sample Next Word
        </button>
        <button
          type="button"
          onClick={() => setAutoRunning((current) => !current)}
          disabled={atLimit && !autoRunning}
          className={`rounded border px-6 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            autoRunning
              ? "border-tertiary/40 bg-tertiary text-on-tertiary"
              : "border-outline bg-surface-container text-on-surface"
          }`}
        >
          {autoRunning ? "Pause Auto-Generate" : "Auto-Generate"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-outline bg-surface-container px-6 py-4 text-base font-semibold text-on-surface transition hover:border-primary hover:text-primary"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
