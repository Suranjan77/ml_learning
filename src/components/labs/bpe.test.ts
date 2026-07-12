import { describe, it, expect } from "vitest";
import { trainBpe, tokenize, vocabAt, merges, TRAINING_CORPUS } from "./bpe";

describe("trainBpe", () => {
  it("produces the hand-verified first merge for a toy corpus", () => {
    // Words (frequency): low x3, lower x1, lowest x1.
    // Symbols: low -> [l, o, w</w>], lower -> [l, o, w, e, r</w>],
    //          lowest -> [l, o, w, e, s, t</w>].
    // Pair (l, o) appears in every occurrence of every word: 3 + 1 + 1 = 5.
    // The next most frequent pair (o, w</w>) only appears 3 times (from
    // "low"), and (o, w) only 2 times (from lower/lowest) — so (l, o) wins
    // outright with no tie to break.
    const toyMerges = trainBpe("low low low lower lowest", 1);
    expect(toyMerges).toHaveLength(1);
    expect(toyMerges[0]).toEqual({ pair: ["l", "o"], result: "lo" });
  });

  it("is deterministic across repeated training runs", () => {
    const first = trainBpe(TRAINING_CORPUS, 50);
    const second = trainBpe(TRAINING_CORPUS, 50);
    expect(second).toEqual(first);
  });

  it("trains up to ~200 merges on the embedded corpus", () => {
    expect(merges.length).toBeGreaterThan(0);
    expect(merges.length).toBeLessThanOrEqual(200);
  });
});

describe("tokenize", () => {
  it("compresses a common word: fewer tokens with all merges than characters", () => {
    const word = "model";
    const full = tokenize(word, merges, merges.length);
    expect(full).toHaveLength(1);
    expect(full[0].length).toBeLessThan(word.length);
  });

  it("returns single-character tokens for every word when k=0", () => {
    const text = "the model is learning to read";
    const words = tokenize(text, merges, 0);
    for (const word of words) {
      for (const token of word) {
        expect(token.text.length).toBe(1);
      }
    }
  });

  it("marks exactly one word-final token per word", () => {
    const words = tokenize("the model is learning", merges, merges.length);
    for (const word of words) {
      const finalCount = word.filter((token) => token.isWordFinal).length;
      expect(finalCount).toBe(1);
      expect(word[word.length - 1].isWordFinal).toBe(true);
    }
  });

  it("handles unseen characters without crashing, keeping them single tokens", () => {
    expect(() => tokenize("café", merges, merges.length)).not.toThrow();
    const [word] = tokenize("café", merges, merges.length);
    const accented = word.find((token) => token.text.includes("é"));
    expect(accented).toBeDefined();
    expect(accented?.text).toBe("é");
  });

  it("applies exactly the first k merges — token counts are non-increasing in k", () => {
    const word = "learning";
    const counts = [0, 25, 50, 100, merges.length].map(
      (k) => tokenize(word, merges, k)[0].length,
    );
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
    // k=0 must be the full character count, and the full tokenizer must
    // compress it by at least one merge.
    expect(counts[0]).toBe(word.length);
    expect(counts[counts.length - 1]).toBeLessThan(counts[0]);
  });

  it("hand-derives tokenization of a toy word at three merge depths", () => {
    // Same toy corpus as the training test above. First merge is (l, o) ->
    // "lo". Second merge (computed the same way): after merging (l, o),
    // low -> [lo, w</w>] (freq 3), lower -> [lo, w, e, r</w>] (freq 1),
    // lowest -> [lo, w, e, s, t</w>] (freq 1). Pair (lo, w</w>) appears 3
    // times (from "low") which beats (lo, w) at 2 and (w, e) at 2, so the
    // second merge is (lo, w</w>) -> "low</w>".
    const toyMerges = trainBpe("low low low lower lowest", 2);
    expect(toyMerges[0]).toEqual({ pair: ["l", "o"], result: "lo" });
    expect(toyMerges[1]).toEqual({ pair: ["lo", "w</w>"], result: "low</w>" });

    const atZero = tokenize("low", toyMerges, 0).map((w) =>
      w.map((t) => t.text),
    );
    expect(atZero).toEqual([["l", "o", "w"]]);

    const atOne = tokenize("low", toyMerges, 1).map((w) =>
      w.map((t) => t.text),
    );
    expect(atOne).toEqual([["lo", "w"]]);

    const atTwo = tokenize("low", toyMerges, 2).map((w) =>
      w.map((t) => t.text),
    );
    expect(atTwo).toEqual([["low"]]);
  });
});

describe("vocabAt", () => {
  it("grows by exactly one per merge and matches merges.length at the end", () => {
    const base = vocabAt(0);
    for (let k = 1; k <= 10; k++) {
      expect(vocabAt(k)).toBe(base + k);
    }
    expect(vocabAt(merges.length)).toBe(base + merges.length);
  });

  it("clamps k outside [0, merges.length]", () => {
    expect(vocabAt(-5)).toBe(vocabAt(0));
    expect(vocabAt(merges.length + 100)).toBe(vocabAt(merges.length));
  });
});
