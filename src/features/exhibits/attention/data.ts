import { scaledDotProductAttention } from "./model";

export interface AttentionHead {
  id: string;
  name: string;
  description: string;
  vectorDimension: number;
  scores: number[][];
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

export const ATTENTION_DATA_DISCLOSURE =
  "Weights are computed in-browser with scaled dot-product attention and softmax over small hand-authored query and key vectors. They are not output from a trained transformer.";

function computedHead(
  id: string,
  name: string,
  description: string,
  queries: number[][],
  keys: number[][],
): AttentionHead {
  const { scores, weights } = scaledDotProductAttention(queries, keys);
  return { id, name, description, vectorDimension: keys[0].length, scores, weights };
}

function previousTokenHead(tokens: string[]): AttentionHead {
  const keys = tokens.map((_, index) => tokens.map((__, keyIndex) => Number(index === keyIndex)));
  const queries = tokens.map((_, index) =>
    tokens.map((__, keyIndex) => Number(keyIndex === Math.max(0, index - 1)) * 8),
  );
  return computedHead(
    "previous-token",
    "Previous token",
    "A positional query vector aligns most strongly with the preceding position.",
    queries,
    keys,
  );
}

function referenceHead(adjective: "tired" | "wide"): AttentionHead {
  // Dimensions represent animal, place, tired, wide, action, and connective features.
  const tired = adjective === "tired";
  const keys = [
    [1.2, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0.3],
    [0, 1.2, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 1.5],
    [0.4, 0.4, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0.8],
    tired ? [0, 0, 2, 0, 0, 0] : [0, 0, 0, 2, 0, 0],
  ];
  const contextualReference = tired ? [1.2, 0, 2, 0, 0, 0] : [0, 1.2, 0, 2, 0, 0];
  const supportingReference = tired ? [0.7, 0, 1.3, 0, 0, 0] : [0, 0.7, 0, 1.3, 0, 0];
  const queries = [
    [0, 0, 0, 0, 1.4, 0],
    [1, 1, 0, 0, 0, 0],
    [0, 1.5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0.8, 0.8],
    [0.5, 0.5, 0, 0, 0.7, 0],
    contextualReference,
    supportingReference,
    contextualReference,
  ];
  return computedHead(
    "reference",
    "Reference",
    "A contextual query aligns with animal or place features supplied by the sentence ending.",
    queries,
    keys,
  );
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
      referenceHead(adjective),
      previousTokenHead(tokens),
    ],
  };
}

export const attentionExamples: readonly AttentionExample[] = [
  example("tired", "tired", "animal"),
  example("wide", "wide", "street"),
];
