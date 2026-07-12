/**
 * Pure, deterministic math for the token-sampling exhibit: temperature
 * scaling, top-k / top-p truncation and inverse-CDF sampling over a fixed
 * distribution. Nothing here calls Math.random(); the scene walks a fixed
 * authored sequence of "random" draws (SAMPLE_DRAWS) so behaviour is
 * reproducible and testable.
 */

export type TruncationMethod = "none" | "top-k" | "top-p";

export interface TruncationResult {
  /** Same length as the input; cut entries are zero, survivors renormalise to sum to 1. */
  probabilities: number[];
  /** Indices (ascending) that survived truncation. */
  survivingIndices: number[];
}

export type TemperatureRegime = "near-greedy" | "balanced" | "adventurous";

export const TEMPERATURE_RANGE = { min: 0.2, max: 2.0, step: 0.05 } as const;
export const DEFAULT_TEMPERATURE = 0.8;
export const DEFAULT_TOP_K = 5;
export const DEFAULT_TOP_P = 0.9;
export const TOP_K_RANGE = { min: 1, max: 10, step: 1 } as const;
export const TOP_P_RANGE = { min: 0.1, max: 1, step: 0.05 } as const;

/** Softmax temperature below this is treated as this floor, to avoid divide-by-zero blow-ups. */
const MIN_TEMPERATURE = 0.05;

const NEAR_GREEDY_MAX = 0.5;
const ADVENTUROUS_MIN = 1.3;

/** Names the temperature band for the control readout. */
export function temperatureRegime(temperature: number): TemperatureRegime {
  if (temperature <= NEAR_GREEDY_MAX) return "near-greedy";
  if (temperature >= ADVENTUROUS_MIN) return "adventurous";
  return "balanced";
}

/** Temperature-scaled softmax over raw logits. Guards temperature to a sane minimum. */
export function softmaxWithTemperature(logits: readonly number[], temperature: number): number[] {
  const bounded = Math.max(MIN_TEMPERATURE, temperature);
  const scaled = logits.map((logit) => logit / bounded);
  const max = Math.max(...scaled);
  const exponentials = scaled.map((value) => Math.exp(value - max));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function renormalise(probabilities: readonly number[], survivingIndices: readonly number[]): TruncationResult {
  const survivors = new Set(survivingIndices);
  const total = survivingIndices.reduce((sum, index) => sum + probabilities[index], 0);
  const result = probabilities.map((probability, index) =>
    survivors.has(index) && total > 0 ? probability / total : 0,
  );
  return { probabilities: result, survivingIndices: [...survivingIndices].sort((a, b) => a - b) };
}

/** Keeps only the k highest-probability entries and renormalises them to sum to 1. */
export function applyTopK(probabilities: readonly number[], k: number): TruncationResult {
  const bounded = Math.max(1, Math.min(probabilities.length, Math.round(k)));
  const ranked = probabilities
    .map((probability, index) => ({ probability, index }))
    .sort((a, b) => b.probability - a.probability);
  const survivingIndices = ranked.slice(0, bounded).map((entry) => entry.index);
  return renormalise(probabilities, survivingIndices);
}

/** Keeps the smallest highest-probability prefix whose cumulative mass reaches p, then renormalises. */
export function applyTopP(probabilities: readonly number[], p: number): TruncationResult {
  const target = Math.max(0, Math.min(1, p));
  const ranked = probabilities
    .map((probability, index) => ({ probability, index }))
    .sort((a, b) => b.probability - a.probability);
  const survivingIndices: number[] = [];
  let cumulative = 0;
  for (const entry of ranked) {
    survivingIndices.push(entry.index);
    cumulative += entry.probability;
    if (cumulative >= target) break;
  }
  return renormalise(probabilities, survivingIndices);
}

/** Applies the requested truncation method, or passes the distribution through unchanged. */
export function applyTruncation(
  probabilities: readonly number[],
  method: TruncationMethod,
  topK: number,
  topP: number,
): TruncationResult {
  if (method === "top-k") return applyTopK(probabilities, topK);
  if (method === "top-p") return applyTopP(probabilities, topP);
  return { probabilities: [...probabilities], survivingIndices: probabilities.map((_, index) => index) };
}

/**
 * Inverse-CDF sample: walks the distribution in index order, returning the
 * first index whose cumulative probability exceeds u. Deterministic for a
 * given u, which is why the scene draws u from a fixed authored sequence
 * rather than Math.random().
 */
export function sampleIndex(distribution: readonly number[], u: number): number {
  const target = Math.max(0, Math.min(u, 0.999_999_999_9));
  let cumulative = 0;
  for (let index = 0; index < distribution.length; index += 1) {
    cumulative += distribution[index];
    if (target < cumulative) return index;
  }
  // Floating-point drift can leave the cumulative sum a hair under 1; fall back
  // to the last surviving (non-zero) token instead of an out-of-range index.
  for (let index = distribution.length - 1; index >= 0; index -= 1) {
    if (distribution[index] > 0) return index;
  }
  return distribution.length - 1;
}

/** Shannon entropy of a probability distribution, in bits. */
export function entropy(distribution: readonly number[]): number {
  return distribution.reduce((sum, probability) => (probability > 0 ? sum - probability * Math.log2(probability) : sum), 0);
}

/**
 * A fixed, hand-authored sequence of uniform draws in [0, 1) used in place of
 * Math.random() so that "sampling" in the exhibit is reproducible and
 * testable. Deliberately varied so it lands on the favourite token most of
 * the time but occasionally reaches into the tail once temperature or
 * truncation make that possible.
 */
export const SAMPLE_DRAWS: readonly number[] = [
  0.12, 0.83, 0.45, 0.05, 0.67, 0.29, 0.94, 0.38, 0.58, 0.02, 0.74, 0.5,
];
