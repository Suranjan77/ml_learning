"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { merges, tokenize, vocabAt, type DisplayToken } from "./bpe";

const DEFAULT_TEXT = "the model is learning to read";
const MARKER = "</w>";
const MERGE_TABLE_LIMIT = 40;

/** Chip background tints, cycling by flat token index so adjacent tokens —
 * even across a word boundary — stay visually distinguishable. */
const TOKEN_TINTS = [
  "bg-primary/10 border-primary/25",
  "bg-primary/20 border-primary/35",
  "bg-primary/30 border-primary/45",
  "bg-primary/40 border-primary/55",
];

function splitMarker(symbol: string): { text: string; isBoundary: boolean } {
  if (symbol.endsWith(MARKER)) {
    return { text: symbol.slice(0, -MARKER.length), isBoundary: true };
  }
  return { text: symbol, isBoundary: false };
}

function formatMerge(pair: [string, string], result: string): string {
  const a = splitMarker(pair[0]);
  const b = splitMarker(pair[1]);
  const r = splitMarker(result);
  const render = (part: { text: string; isBoundary: boolean }) =>
    part.text.length > 0
      ? `${part.text}${part.isBoundary ? "⏎" : ""}`
      : "⏎";
  return `${render(a)} + ${render(b)} → ${render(r)}`;
}

export default function TokenizerLab() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [step, setStep] = useState(merges.length);
  const [tableOpen, setTableOpen] = useState(false);

  const words = useMemo<DisplayToken[][]>(
    () => tokenize(text, merges, step),
    [text, step],
  );

  const tokenCount = words.reduce((total, word) => total + word.length, 0);
  const charCount = words.reduce(
    (total, word) =>
      total + word.reduce((sum, token) => sum + token.text.length, 0),
    0,
  );
  const ratio = tokenCount > 0 ? charCount / tokenCount : 0;
  const currentVocab = vocabAt(step);

  const currentMerge = step > 0 ? merges[step - 1] : null;

  let flatIndex = 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Text input */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <label
          htmlFor="tokenizer-input"
          className="mb-3 block font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant"
        >
          Text to tokenize
        </label>
        <textarea
          id="tokenizer-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="Type anything…"
          className="w-full resize-none border border-outline bg-surface px-4 py-3 font-mono text-base text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Tokens */}
      <div className="border border-outline bg-surface-container-low p-5 sm:p-6">
        <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
          Tokens at merge step {step}
        </p>
        {words.length === 0 || tokenCount === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Type something above to see it tokenized.
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {words.map((word, wordIndex) => (
              <div
                key={`${wordIndex}-${word.map((t) => t.text).join("")}`}
                className="flex items-stretch"
              >
                {word.map((token, tokenIndex) => {
                  const tint = TOKEN_TINTS[flatIndex % TOKEN_TINTS.length];
                  flatIndex += 1;
                  return (
                    <span
                      key={`${wordIndex}-${tokenIndex}`}
                      title={token.isWordFinal ? "word boundary" : undefined}
                      className={`inline-flex items-center border px-2 py-1 font-mono text-sm text-on-surface ${tint} ${
                        token.isWordFinal
                          ? "mr-0 rounded-r-sm border-r-2 border-r-on-surface/30"
                          : "rounded-none"
                      } ${tokenIndex === 0 ? "rounded-l-sm" : "-ml-px"}`}
                    >
                      {token.text.length > 0 ? token.text : "∅"}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Merge scrubber */}
      <div className="border border-outline bg-surface-container p-5 accent-left-primary sm:p-6">
        <label
          htmlFor="tokenizer-step"
          className="mb-2 flex flex-wrap justify-between gap-2 font-mono text-[13px] font-bold tracking-wide text-on-surface"
        >
          Merge step{" "}
          <span className="text-primary">
            {step} / {merges.length}
          </span>
        </label>
        <input
          id="tokenizer-step"
          type="range"
          min={0}
          max={merges.length}
          step={1}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          className="w-full accent-primary"
        />
        <p className="mt-3 min-h-[1.5rem] font-mono text-sm text-on-surface-variant">
          {currentMerge ? (
            <>
              Just applied:{" "}
              <span className="text-primary">
                {formatMerge(currentMerge.pair, currentMerge.result)}
              </span>
            </>
          ) : (
            "No merges applied — every token is a single character."
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-px border border-outline bg-border sm:grid-cols-4">
        {[
          ["Tokens", String(tokenCount)],
          ["Characters", String(charCount)],
          ["Chars / token", ratio.toFixed(2)],
          ["Vocab size", String(currentVocab)],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface px-5 py-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
              {label}
            </p>
            <p className="mt-2 font-headline text-2xl font-medium text-on-surface">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Merge table */}
      <div className="border border-outline bg-surface">
        <button
          type="button"
          aria-expanded={tableOpen}
          aria-controls="tokenizer-merge-table"
          onClick={() => setTableOpen((current) => !current)}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface-container-low sm:px-6"
        >
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface">
            Merge table — first {Math.min(MERGE_TABLE_LIMIT, merges.length)}{" "}
            of {merges.length} merges
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-primary transition-transform ${
              tableOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {tableOpen && (
          <div
            id="tokenizer-merge-table"
            className="grid gap-x-6 gap-y-1 border-t border-outline px-5 py-4 font-mono text-sm text-on-surface-variant sm:grid-cols-2 sm:px-6"
          >
            {merges.slice(0, MERGE_TABLE_LIMIT).map((merge, index) => (
              <div
                key={`${merge.pair[0]}-${merge.pair[1]}-${index}`}
                className={`flex justify-between gap-3 py-0.5 ${
                  index + 1 === step ? "text-primary" : ""
                }`}
              >
                <span className="text-on-surface-variant/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-right">
                  {formatMerge(merge.pair, merge.result)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
