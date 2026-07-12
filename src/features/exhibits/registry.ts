import type { ExhibitDefinition } from "./types";
import { attentionExhibit } from "./attention/exhibit";
import { gradientDescentExhibit } from "./gradient-descent/exhibit";
import { kernelTrickExhibit } from "./kernel-trick/exhibit";
import { kMeansExhibit } from "./k-means/exhibit";
import { overfittingExhibit } from "./overfitting/exhibit";
import { tokenSamplingExhibit } from "./token-sampling/exhibit";

export const exhibits: readonly ExhibitDefinition[] = [
  gradientDescentExhibit,
  overfittingExhibit,
  kMeansExhibit,
  kernelTrickExhibit,
  attentionExhibit,
  tokenSamplingExhibit,
];

export function getExhibit(slug: string) {
  return exhibits.find((exhibit) => exhibit.slug === slug);
}
