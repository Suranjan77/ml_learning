"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { ExhibitSceneProps } from "../types";
import { ATTENTION_DATA_DISCLOSURE, attentionExamples } from "./data";
import { describeAttention, topTargets } from "./model";

type AttentionSceneProps = Partial<Pick<ExhibitSceneProps, "resetKey">>;

const DIAGRAM_WIDTH = 1000;
const DIAGRAM_HEIGHT = 180;

function tokenX(index: number, count: number): number {
  return ((index + 0.5) / count) * DIAGRAM_WIDTH;
}

function connectionPath(sourceIndex: number, targetIndex: number, count: number): string {
  const sourceX = tokenX(sourceIndex, count);
  const targetX = tokenX(targetIndex, count);
  const distance = Math.abs(sourceIndex - targetIndex) / Math.max(1, count - 1);
  const bend = 46 + distance * 42;
  return `M ${sourceX} 2 C ${sourceX} ${bend}, ${targetX} ${DIAGRAM_HEIGHT - bend}, ${targetX} ${DIAGRAM_HEIGHT - 2}`;
}

function formatWeight(weight: number): string {
  const percentage = Math.round(weight * 100);
  return percentage < 1 ? "<1%" : `${percentage}%`;
}

export default function AttentionScene({ resetKey = 0 }: AttentionSceneProps = {}) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [headIndex, setHeadIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    attentionExamples[0].tokens.indexOf(attentionExamples[0].focusToken),
  );
  const queryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const interactionReady = useRef(false);
  const accessibleId = useId();

  const example = attentionExamples[exampleIndex];
  const head = example.heads[headIndex];
  const sourceIndex = Math.min(selectedIndex, example.tokens.length - 1);
  const weights = head.weights[sourceIndex];
  const targets = useMemo(() => topTargets(head, sourceIndex), [head, sourceIndex]);
  const rankByIndex = useMemo(
    () => new Map(targets.map(({ index }, rank) => [index, rank + 1])),
    [targets],
  );
  const connections = useMemo(
    () => weights.map((weight, index) => ({ index, weight })).sort((a, b) => a.weight - b.weight),
    [weights],
  );
  const description = describeAttention(example, head, sourceIndex);

  useEffect(() => {
    interactionReady.current = true;
    return () => {
      interactionReady.current = false;
    };
  }, []);

  useEffect(() => {
    const initial = attentionExamples[0];
    setExampleIndex(0);
    setHeadIndex(0);
    setSelectedIndex(initial.tokens.indexOf(initial.focusToken));
  }, [resetKey]);

  function chooseExample(index: number) {
    const nextExample = attentionExamples[index];
    setExampleIndex(index);
    setSelectedIndex(nextExample.tokens.indexOf(nextExample.focusToken));
  }

  function chooseQuery(index: number, moveFocus = false) {
    setSelectedIndex(index);
    if (moveFocus) queryRefs.current[index]?.focus();
  }

  function handleQueryKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + example.tokens.length) % example.tokens.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % example.tokens.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = example.tokens.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      chooseQuery(nextIndex, true);
    }
  }

  return (
    <section
      aria-label="Interactive attention diagram"
      className="grid h-full min-h-0 grid-rows-[auto_minmax(13rem,1fr)_auto] overflow-hidden border border-outline bg-surface sm:grid-rows-[auto_minmax(16rem,1fr)_auto]"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-outline px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2" role="group" aria-label="Sentence ending">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
            Ending
          </span>
          <div className="flex border border-outline bg-surface-container-low p-0.5">
            {attentionExamples.map((item, index) => {
              const ending = item.tokens.at(-1);
              const active = index === exampleIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Use sentence ending in ${ending}`}
                  aria-pressed={active}
                  onClick={() => chooseExample(index)}
                  className={`min-h-8 px-2.5 font-mono text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {ending}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2" role="group" aria-label="Attention pattern">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
            Pattern
          </span>
          <div className="flex border border-outline bg-surface-container-low p-0.5">
            {example.heads.map((item, index) => {
              const active = index === headIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show ${item.name} attention pattern`}
                  aria-pressed={active}
                  title={item.description}
                  onClick={() => setHeadIndex(index)}
                  className={`min-h-8 px-2.5 font-mono text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <figure className="grid min-h-0 grid-rows-[auto_minmax(5rem,1fr)_auto] bg-surface-container-low px-2.5 py-2 sm:px-4 sm:py-3">
        <figcaption className="sr-only">
          Two rows show query and context tokens. Curves connect the selected query to every
          context token; wider solid curves indicate more attention.
        </figcaption>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant sm:text-[10px]">
              Query token
            </p>
            <p className="hidden font-mono text-[9px] text-on-surface-variant sm:block">
              Hover, focus or use ← →
            </p>
          </div>
          <div
            role="group"
            aria-label="Choose a query token"
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${example.tokens.length}, minmax(0, 1fr))` }}
          >
            {example.tokens.map((token, index) => {
              const selected = index === sourceIndex;
              return (
                <button
                  key={`${token}-${index}`}
                  ref={(element) => {
                    queryRefs.current[index] = element;
                  }}
                  type="button"
                  tabIndex={selected ? 0 : -1}
                  aria-label={`Use ${token} as the query token`}
                  aria-pressed={selected}
                  title={token}
                  onClick={() => chooseQuery(index)}
                  onMouseEnter={() => {
                    if (interactionReady.current) chooseQuery(index);
                  }}
                  onFocus={() => chooseQuery(index)}
                  onKeyDown={(event) => handleQueryKeyDown(event, index)}
                  className={`relative min-h-10 min-w-0 border px-0.5 font-mono text-[9px] transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-11 sm:text-xs ${
                    selected
                      ? "border-primary bg-primary font-medium text-on-primary"
                      : "border-outline bg-surface text-on-surface hover:border-outline-dark"
                  }`}
                >
                  <span className="block truncate">{token}</span>
                  {selected ? (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 text-sm leading-none text-primary"
                    >
                      ↓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <svg
          role="img"
          aria-labelledby={`${accessibleId}-title ${accessibleId}-description`}
          viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full min-h-20 w-full overflow-visible"
        >
          <title id={`${accessibleId}-title`}>{`Attention connections from ${example.tokens[sourceIndex]}`}</title>
          <desc id={`${accessibleId}-description`}>
            {description} Line width and target rank both indicate relative weight. These are
            illustrative weights, not measurements from a model.
          </desc>
          {connections.map(({ index, weight }) => {
            const rank = rankByIndex.get(index);
            const strongest = rank === 1;
            return (
              <path
                key={index}
                d={connectionPath(sourceIndex, index, example.tokens.length)}
                fill="none"
                stroke={strongest ? "var(--color-accent)" : "var(--color-primary)"}
                strokeWidth={0.75 + weight * 9}
                strokeOpacity={strongest ? 0.95 : 0.28 + weight * 0.8}
                strokeDasharray={rank ? undefined : "2 5"}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                aria-hidden="true"
              />
            );
          })}
        </svg>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant sm:text-[10px]">
              Context tokens
            </p>
            <p className="font-mono text-[9px] text-on-surface-variant sm:text-[10px]">
              Width = weight
            </p>
          </div>
          <div
            role="list"
            aria-label="Context tokens and attention weights"
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${example.tokens.length}, minmax(0, 1fr))` }}
          >
            {example.tokens.map((token, index) => {
              const weight = weights[index];
              const rank = rankByIndex.get(index);
              return (
                <div
                  key={`${token}-${index}`}
                  role="listitem"
                  aria-label={`${token}, ${formatWeight(weight)} attention${rank ? `, rank ${rank}` : ""}`}
                  title={`${token}: ${formatWeight(weight)}`}
                  className={`flex min-h-12 min-w-0 flex-col justify-center border bg-surface px-0.5 text-center font-mono ${
                    rank === 1 ? "border-t-2 border-accent" : rank ? "border-primary" : "border-outline"
                  }`}
                >
                  <span className="block truncate text-[9px] text-on-surface sm:text-xs">{token}</span>
                  <span className="mt-0.5 flex items-center justify-center gap-1 text-[8px] text-on-surface-variant sm:text-[10px]">
                    {formatWeight(weight)}
                    {rank ? <strong className="font-medium text-primary">#{rank}</strong> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </figure>

      <footer className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 border-t border-outline px-3 py-2.5 text-xs leading-5">
        <p aria-live="polite" className="min-w-0 text-on-surface-variant">
          <span className="font-medium text-on-surface">{description}</span>
        </p>
        <p
          title={ATTENTION_DATA_DISCLOSURE}
          className="shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-on-surface-variant sm:text-[10px]"
        >
          Illustrative weights · not model output
          <span className="sr-only">. {ATTENTION_DATA_DISCLOSURE}</span>
        </p>
      </footer>
    </section>
  );
}
