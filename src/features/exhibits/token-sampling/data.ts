export interface TokenCandidate {
  token: string;
  logit: number;
}

/**
 * This prompt, its candidate next tokens and their logits are a hand-authored
 * teaching illustration. They are not measurements from a trained language
 * model and must not be presented as such.
 */
export const TOKEN_SAMPLING_DISCLOSURE =
  "The prompt continuation shown here is a hand-authored illustration, not output from a trained model.";

export const PROMPT = "The hikers reached the summit just before";

/**
 * Ten authored candidate continuations with hand-written logits: one clear
 * favourite, a run of sensible alternatives, a couple of odd-but-plausible
 * choices, and a tail with one deliberately implausible token.
 */
export const CANDIDATES: readonly TokenCandidate[] = [
  { token: "dusk", logit: 4.2 },
  { token: "sunset", logit: 3.6 },
  { token: "nightfall", logit: 3.1 },
  { token: "noon", logit: 2.0 },
  { token: "dawn", logit: 1.6 },
  { token: "midnight", logit: 1.0 },
  { token: "lunch", logit: 0.4 },
  { token: "rain", logit: -0.2 },
  { token: "collapsing", logit: -1.5 },
  { token: "spaghetti", logit: -3.8 },
] as const;
