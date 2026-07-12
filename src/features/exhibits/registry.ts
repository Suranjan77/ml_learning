import type { ExhibitDefinition } from "./types";
import { attentionExhibit } from "./attention/exhibit";
import { gradientDescentExhibit } from "./gradient-descent/exhibit";
import { kernelTrickExhibit } from "./kernel-trick/exhibit";

export const exhibits: readonly ExhibitDefinition[] = [
  gradientDescentExhibit,
  attentionExhibit,
  kernelTrickExhibit,
];

export function getExhibit(slug: string) {
  return exhibits.find((exhibit) => exhibit.slug === slug);
}
