import type { AttentionExample, AttentionHead } from "./data";

export interface WeightedTarget {
  index: number;
  weight: number;
}

export function validateAttentionExample(example: AttentionExample): string[] {
  const errors: string[] = [];
  const size = example.tokens.length;
  for (const head of example.heads) {
    if (head.weights.length !== size) errors.push(`${head.id}: expected ${size} rows`);
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
