"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  attentionSentences,
  type AttentionHead,
  type AttentionSentence,
} from "./attentionData";

interface WeightedTarget {
  index: number;
  weight: number;
}

interface ChipPoint {
  x: number;
  topY: number;
}

/** The row whose off-diagonal weight is highest is the sentence's "headline"
 * row — the token whose target resolves the sentence's insight (e.g. "it").
 * We always compute this from the first (interesting) head, regardless of
 * which head is currently selected, so the default highlight stays put
 * across head switches. */
function computeHeadlineIndex(head: AttentionHead): number {
  let bestIndex = 0;
  let bestWeight = -1;
  head.weights.forEach((row, i) => {
    row.forEach((weight, j) => {
      if (j !== i && weight > bestWeight) {
        bestWeight = weight;
        bestIndex = i;
      }
    });
  });
  return bestIndex;
}

function topTargets(row: number[], selfIndex: number, count: number): WeightedTarget[] {
  return row
    .map((weight, index) => ({ index, weight }))
    .filter((item) => item.index !== selfIndex)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count);
}

function pct(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

/** Tint toward the primary color at an opacity proportional to weight,
 * blending into whichever background the element already sits on. */
function tint(weight: number, base: "transparent" | "var(--color-surface)" = "transparent") {
  const amount = Math.round(Math.min(Math.max(weight, 0), 1) * 100);
  return `color-mix(in srgb, var(--color-primary) ${amount}%, ${base})`;
}

function readableTextClass(weight: number) {
  return weight > 0.38 ? "text-on-primary" : "text-on-surface";
}

export default function AttentionLab() {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [headIndex, setHeadIndex] = useState(0);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const sentence: AttentionSentence = attentionSentences[sentenceIndex];
  const head: AttentionHead = sentence.heads[headIndex];
  const tokens = sentence.tokens;

  const headlineIndex = useMemo(
    () => computeHeadlineIndex(sentence.heads[0]),
    [sentence],
  );
  const focusIndex = manualIndex ?? headlineIndex;

  const row = head.weights[focusIndex];
  const targets = useMemo(() => topTargets(row, focusIndex, 3), [row, focusIndex]);

  const selectSentence = (index: number) => {
    setSentenceIndex(index);
    setHeadIndex(0);
    setManualIndex(null);
    setHoveredCell(null);
  };

  // --- Arc geometry -------------------------------------------------------
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [points, setPoints] = useState<ChipPoint[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const next: ChipPoint[] = chipRefs.current.map((chip) => {
        if (!chip) return { x: 0, topY: 0 };
        const rect = chip.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          topY: rect.top - containerRect.top,
        };
      });
      setPoints(next);
      setSvgSize({ width: container.scrollWidth, height: container.scrollHeight });
    };

    measure();
    // Theater mode dispatches a synthetic "resize" event when it toggles,
    // since the container change alone doesn't fire one.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [tokens, sentenceIndex]);

  const focusPoint = points[focusIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Sentence selector */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
          Sentence
        </p>
        <div className="flex flex-col gap-2" role="tablist" aria-label="Preset sentences">
          {attentionSentences.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === sentenceIndex}
              onClick={() => selectSentence(i)}
              className={`border px-4 py-3 text-left font-mono text-sm leading-6 transition-colors ${
                i === sentenceIndex
                  ? "border-primary bg-primary/10 text-on-surface"
                  : "border-outline bg-surface text-on-surface-variant hover:border-primary hover:text-on-surface"
              }`}
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Head selector */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
          Attention head
        </p>
        <div className="flex flex-wrap gap-2">
          {sentence.heads.map((h, i) => (
            <button
              key={h.name}
              type="button"
              aria-pressed={i === headIndex}
              onClick={() => setHeadIndex(i)}
              className={`border px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-wide transition-colors ${
                i === headIndex
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">{head.description}</p>
      </div>

      {/* Token strip */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
          Hover or tab through tokens —{" "}
          <span className="text-primary">&ldquo;{tokens[focusIndex]}&rdquo;</span> is active
        </p>

        <div ref={containerRef} className="relative">
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={svgSize.width || undefined}
            height={svgSize.height || undefined}
            viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            aria-hidden="true"
          >
            {focusPoint &&
              targets.map((target) => {
                const to = points[target.index];
                if (!to) return null;
                const x1 = focusPoint.x;
                const y1 = focusPoint.topY;
                const x2 = to.x;
                const y2 = to.topY;
                const mid = (x1 + x2) / 2;
                const distance = Math.abs(focusIndex - target.index);
                const peak = Math.min(y1, y2) - Math.min(24 + distance * 12, 120);
                return (
                  <path
                    key={target.index}
                    d={`M ${x1} ${y1} Q ${mid} ${peak} ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={1 + target.weight * 10}
                    strokeOpacity={0.35 + target.weight * 0.5}
                  />
                );
              })}
          </svg>

          <div className="relative flex flex-wrap gap-2 pt-36">
            {tokens.map((token, i) => {
              const isFocus = i === focusIndex;
              const weight = isFocus ? null : row[i];
              return (
                <button
                  key={`${token}-${i}`}
                  type="button"
                  ref={(el) => {
                    chipRefs.current[i] = el;
                  }}
                  onMouseEnter={() => setManualIndex(i)}
                  onMouseLeave={() => setManualIndex(null)}
                  onFocus={() => setManualIndex(i)}
                  onBlur={() => setManualIndex(null)}
                  className={`border px-3 py-2 font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                    isFocus
                      ? "border-primary bg-primary text-on-primary font-bold"
                      : `border-outline ${readableTextClass(weight ?? 0)}`
                  }`}
                  style={isFocus ? undefined : { backgroundColor: tint(weight ?? 0) }}
                >
                  {token}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 border border-outline bg-surface p-4">
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Top attention targets from &ldquo;{tokens[focusIndex]}&rdquo;
          </p>
          <ul className="flex flex-wrap gap-4">
            {targets.map((target) => (
              <li key={target.index} className="font-mono text-sm text-on-surface">
                <span className="text-primary">{tokens[target.index]}</span>{" "}
                <span className="text-on-surface-variant">{pct(target.weight)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border border-outline bg-surface-container p-4 accent-left-primary">
          <p className="text-sm leading-6 text-on-surface-variant">{sentence.note}</p>
        </div>
      </div>

      {/* Full heatmap */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Full attention matrix — rows attend to columns
          </p>
          <p className="font-mono text-[13px] text-on-surface-variant" aria-live="polite">
            {hoveredCell
              ? `${tokens[hoveredCell.row]} → ${tokens[hoveredCell.col]}: ${pct(
                  head.weights[hoveredCell.row][hoveredCell.col],
                )}`
              : "Hover a cell to inspect its weight"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse">
            <caption className="sr-only">
              {sentence.text} — {head.name} head attention weights
            </caption>
            <thead>
              <tr>
                <th scope="col" className="p-1" />
                {tokens.map((token, j) => (
                  <th
                    key={`col-${j}`}
                    scope="col"
                    className="min-w-9 px-1 py-1 text-center font-mono text-[10px] font-normal text-on-surface-variant"
                  >
                    {token}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((fromToken, i) => (
                <tr key={`row-${i}`} className={i === focusIndex ? "bg-primary/5" : undefined}>
                  <th
                    scope="row"
                    className={`sticky left-0 whitespace-nowrap bg-surface-container-low px-2 py-1 text-right font-mono text-[11px] font-normal ${
                      i === focusIndex ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {fromToken}
                  </th>
                  {tokens.map((_, j) => {
                    const weight = head.weights[i][j];
                    return (
                      <td key={`cell-${i}-${j}`} className="p-0">
                        <button
                          type="button"
                          title={`${fromToken} → ${tokens[j]}: ${pct(weight)}`}
                          onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onFocus={() => setHoveredCell({ row: i, col: j })}
                          onBlur={() => setHoveredCell(null)}
                          className={`flex h-8 w-9 items-center justify-center border border-outline font-mono text-[9px] transition-colors ${readableTextClass(
                            weight,
                          )}`}
                          style={{ backgroundColor: tint(weight, "var(--color-surface)") }}
                        >
                          {Math.round(weight * 100)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
