export interface AttentionHead {
  id: string;
  name: string;
  description: string;
  weights: number[][];
}

export interface AttentionExample {
  id: string;
  text: string;
  tokens: string[];
  focusToken: string;
  expectedTarget: string;
  note: string;
  heads: AttentionHead[];
}

/**
 * These examples are deliberately hand-authored teaching illustrations. They
 * are not measurements from a trained model and must not be presented as such.
 */
export const ATTENTION_DATA_DISCLOSURE =
  "The attention patterns shown here are hand-authored illustrations, not output from a trained model.";

function normalizedRow(length: number, peaks: Record<number, number>, self: number): number[] {
  const row = Array.from({ length }, () => 0.015);
  row[self] = 0.06;
  for (const [index, value] of Object.entries(peaks)) row[Number(index)] = value;
  const total = row.reduce((sum, value) => sum + value, 0);
  return row.map((value) => value / total);
}

function previousTokenHead(tokens: string[]): AttentionHead {
  return {
    id: "previous-token",
    name: "Previous token",
    description: "Each query places most of its weight on the preceding token.",
    weights: tokens.map((_, index) =>
      normalizedRow(tokens.length, { [index === 0 ? 1 : index - 1]: 0.74 }, index),
    ),
  };
}

function coreferenceHead(tokens: string[], focus: string, target: string): AttentionHead {
  const focusIndex = tokens.indexOf(focus);
  const targetIndex = tokens.indexOf(target);
  const subjectIndex = tokens.indexOf("Animal");
  const verbIndex = tokens.indexOf("left");
  const objectIndex = tokens.indexOf("street");
  const becauseIndex = tokens.indexOf("because");
  const adjectiveIndex = tokens.length - 1;

  const contextualPeaks: Record<number, Record<number, number>> = {
    0: { [verbIndex]: 0.46 },
    1: { [subjectIndex]: 0.42, [objectIndex]: 0.32 },
    2: { [objectIndex]: 0.7 },
    3: { [verbIndex]: 0.38, [becauseIndex]: 0.28 },
    4: { [verbIndex]: 0.42, [focusIndex]: 0.3 },
    5: { [targetIndex]: 0.66, [adjectiveIndex]: 0.18 },
    6: { [focusIndex]: 0.45, [adjectiveIndex]: 0.36 },
    7: { [targetIndex]: 0.48, [focusIndex]: 0.3 },
  };

  return {
    id: "coreference",
    name: "Reference",
    description: "The pronoun shifts toward the noun supported by the sentence ending.",
    weights: tokens.map((_, index) =>
      normalizedRow(tokens.length, contextualPeaks[index] ?? { [verbIndex]: 0.36 }, index),
    ),
  };
}

function example(
  id: string,
  adjective: "tired" | "wide",
  expectedTarget: "animal" | "street",
): AttentionExample {
  const tokens = ["Animal", "left", "the", "street", "because", "it", "was", adjective];
  return {
    id,
    text: tokens.join(" ") + ".",
    tokens,
    focusToken: "it",
    expectedTarget: expectedTarget === "animal" ? "Animal" : expectedTarget,
    note:
      expectedTarget === "animal"
        ? "With ‘tired’, the strongest reference is Animal."
        : "With ‘wide’, the strongest reference shifts to street.",
    heads: [
      coreferenceHead(tokens, "it", expectedTarget === "animal" ? "Animal" : expectedTarget),
      previousTokenHead(tokens),
    ],
  };
}

export const attentionExamples: readonly AttentionExample[] = [
  example("tired", "tired", "animal"),
  example("wide", "wide", "street"),
];
