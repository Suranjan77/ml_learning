import type { ExhibitDefinition, ExhibitSummary } from "./types";
import { attentionExhibit } from "./attention/exhibit";
import { gradientDescentExhibit } from "./gradient-descent/exhibit";
import { kernelTrickExhibit } from "./kernel-trick/exhibit";
import { kMeansExhibit } from "./k-means/exhibit";
import { overfittingExhibit } from "./overfitting/exhibit";
import { tokenSamplingExhibit } from "./token-sampling/exhibit";
import { particleSwarmExhibit } from "./particle-swarm/exhibit";
import { cnnExhibit } from "./cnn/exhibit";
import { geneticAlgorithmExhibit } from "./genetic-algorithm/exhibit";
import { pcaExhibit } from "./pca/exhibit";
import { backpropExhibit } from "./backprop/exhibit";

export const exhibits: readonly ExhibitDefinition[] = [
  gradientDescentExhibit,
  overfittingExhibit,
  kMeansExhibit,
  kernelTrickExhibit,
  attentionExhibit,
  tokenSamplingExhibit,
  cnnExhibit,
  particleSwarmExhibit,
  geneticAlgorithmExhibit,
  pcaExhibit,
  backpropExhibit,
];

export function getExhibit(slug: string) {
  return exhibits.find((exhibit) => exhibit.slug === slug);
}

function toSummary(exhibit: ExhibitDefinition): ExhibitSummary {
  const { slug, title, question, summary, topic, difficulty, duration, renderer, tags } = exhibit;
  return { slug, title, question, summary, topic, difficulty, duration, renderer, tags };
}

/** Lightweight metadata shipped to the client browser (no steps/challenges). */
export const exhibitSummaries: readonly ExhibitSummary[] = exhibits.map(toSummary);
