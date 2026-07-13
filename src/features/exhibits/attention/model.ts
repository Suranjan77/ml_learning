import type { AttentionExample, AttentionHead } from "./data";

export interface AttentionComputation {
  scores: number[][];
  weights: number[][];
}

export interface WeightedTarget {
  index: number;
  weight: number;
}

export function softmax(values: readonly number[]): number[] {
  if (values.length === 0) return [];
  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

export function scaledDotProductAttention(
  queries: readonly (readonly number[])[],
  keys: readonly (readonly number[])[],
): AttentionComputation {
  const dimension = queries[0]?.length ?? keys[0]?.length ?? 0;
  if (dimension === 0) throw new Error("Attention vectors must have at least one dimension");
  if (queries.some((vector) => vector.length !== dimension) || keys.some((vector) => vector.length !== dimension)) {
    throw new Error("Every attention vector must use the same dimension");
  }

  const scale = Math.sqrt(dimension);
  const scores = queries.map((query) => keys.map((key) =>
    query.reduce((sum, value, index) => sum + value * key[index], 0) / scale,
  ));
  return { scores, weights: scores.map(softmax) };
}

export function validateAttentionExample(example: AttentionExample): string[] {
  const errors: string[] = [];
  const size = example.tokens.length;
  for (const head of example.heads) {
    if (head.scores.length !== size) errors.push(`${head.id}: expected ${size} score rows`);
    if (head.weights.length !== size) errors.push(`${head.id}: expected ${size} rows`);
    head.scores.forEach((row, index) => {
      if (row.length !== size) errors.push(`${head.id}: score row ${index} has the wrong length`);
      if (row.some((score) => !Number.isFinite(score))) errors.push(`${head.id}: score row ${index} contains an invalid value`);
    });
    head.weights.forEach((row, index) => {
      if (row.length !== size) errors.push(`${head.id}: row ${index} has the wrong length`);
      if (row.some((weight) => weight < 0 || weight > 1)) errors.push(`${head.id}: row ${index} contains an invalid weight`);
      const total = row.reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(total - 1) > 1e-9) errors.push(`${head.id}: row ${index} does not sum to one`);
    });
  }
  return errors;
}

export function topTargets(
  head: AttentionHead,
  sourceIndex: number,
  count = 3,
): WeightedTarget[] {
  return head.weights[sourceIndex]
    .map((weight, index) => ({ index, weight }))
    .filter(({ index }) => index !== sourceIndex)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .slice(0, count);
}

export function describeAttention(
  example: AttentionExample,
  head: AttentionHead,
  sourceIndex: number,
): string {
  const targets = topTargets(head, sourceIndex);
  const detail = targets
    .map(({ index, weight }) => `${example.tokens[index]} ${Math.round(weight * 100)}%`)
    .join(", ");
  return `${example.tokens[sourceIndex]} pays most attention to ${detail}.`;
}
