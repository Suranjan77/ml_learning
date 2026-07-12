import type { TrackId } from "@/data/algorithms_content";

/**
 * The curriculum's five stages — the narrative spine of the concept map.
 * Stages are a presentation taxonomy layered over modules: every module
 * belongs to exactly one stage, ordered as one journey from "how does a
 * machine learn anything" to "how do modern generative systems work".
 */
export type StageId =
  | "foundations"
  | "classical"
  | "deep-learning"
  | "language"
  | "vision";

export interface StageDef {
  id: StageId;
  numeral: string;
  title: string;
  blurb: string;
  /** Muted identity hue, in keeping with the site's paper palette. */
  color: string;
}

export const STAGES: readonly StageDef[] = [
  {
    id: "foundations",
    numeral: "I",
    title: "Foundations",
    blurb:
      "How a machine learns anything at all — fitting, evaluating, and regularizing the simplest models.",
    color: "#556B4A",
  },
  {
    id: "classical",
    numeral: "II",
    title: "Classical ML Toolbox",
    blurb:
      "The pre-deep-learning arsenal: trees, ensembles, margins, neighbors, and probabilistic models that still win on tabular data.",
    color: "#7B756A",
  },
  {
    id: "deep-learning",
    numeral: "III",
    title: "Deep Learning",
    blurb:
      "Neural networks and the machinery that trains them — backprop, optimizers, convolutions, sequences, and generative nets.",
    color: "#B0573E",
  },
  {
    id: "language",
    numeral: "IV",
    title: "Language & LLMs",
    blurb:
      "From tokens and embeddings through transformers to the full LLM stack: retrieval, fine-tuning, agents, evaluation, and inference.",
    color: "#5E6E85",
  },
  {
    id: "vision",
    numeral: "V",
    title: "Vision & Generation",
    blurb:
      "The modern visual stack — detection, segmentation, vision transformers, multimodal models, and diffusion.",
    color: "#8D5149",
  },
] as const;

const MODULE_STAGE: Record<string, StageId> = {
  // I — Foundations
  "linear-regression": "foundations",
  "logistic-regression": "foundations",
  regularization: "foundations",
  "model-evaluation": "foundations",
  "applied-ml-workflow": "foundations",
  // II — Classical ML Toolbox
  knn: "classical",
  "decision-trees": "classical",
  "ensemble-learning": "classical",
  "gradient-boosting": "classical",
  "support-vector-machines": "classical",
  "naive-bayes": "classical",
  clustering: "classical",
  "gmm-em": "classical",
  "dimensionality-reduction": "classical",
  mcmc: "classical",
  "classical-synthesis": "classical",
  // III — Deep Learning
  "neural-networks": "deep-learning",
  backpropagation: "deep-learning",
  "optimization-optimizers": "deep-learning",
  cnn: "deep-learning",
  "sequence-models": "deep-learning",
  autoencoders: "deep-learning",
  "generative-models": "deep-learning",
  "reinforcement-learning": "deep-learning",
  "dl-synthesis": "deep-learning",
  // IV — Language & LLMs
  nlp: "language",
  "embeddings-tokenization": "language",
  transformers: "language",
  llms: "language",
  rag: "language",
  "fine-tuning": "language",
  "llm-evaluation-safety": "language",
  "ai-inference": "language",
  "ai-agents": "language",
  "llm-synthesis": "language",
  // V — Vision & Generation
  "computer-vision": "vision",
  "cnn-architectures": "vision",
  "object-detection": "vision",
  "image-segmentation": "vision",
  "vision-transformers": "vision",
  "self-supervised-vision": "vision",
  "vision-language-models": "vision",
  "diffusion-models": "vision",
};

const TRACK_FALLBACK: Record<TrackId, StageId> = {
  practitioner: "classical",
  "modern-ai": "deep-learning",
  "computer-vision": "vision",
};

/**
 * Stage for a module. Unmapped modules (e.g. ones added after this file)
 * fall back to a stage inferred from their first track, so nothing ever
 * disappears from the map.
 */
export function stageOf(
  moduleId: string,
  tracks: readonly TrackId[] | undefined,
): StageId {
  const mapped = MODULE_STAGE[moduleId];
  if (mapped) return mapped;
  const track = tracks?.[0];
  return (track && TRACK_FALLBACK[track]) || "classical";
}
