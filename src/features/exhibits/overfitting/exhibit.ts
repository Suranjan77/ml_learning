import type { ExhibitDefinition } from "../types";
import OverfittingScene from "./OverfittingScene";

export const overfittingExhibit: ExhibitDefinition = {
  slug: "overfitting",
  title: "Overfitting",
  question: "When does a flexible model stop generalising?",
  summary: "Fit polynomials of increasing degree to noisy samples, then compare training and validation error to see where the model stops generalising.",
  insight: "A model can drive its training error to zero by fitting the noise rather than the pattern. Held-out validation error is what reveals the gap between memorising and generalising.",
  topic: "Generalisation",
  difficulty: "Approachable",
  duration: 4,
  renderer: "SVG",
  steps: [
    {
      title: "Start with a rigid model",
      instruction: "Look at the low-degree curve against the training points.",
      observation: "A near-straight line cannot bend enough to follow the pattern. It misses on both the training and the validation data.",
    },
    {
      title: "Find a fit that generalises",
      instruction: "Raise the degree until the curve tracks the pattern rather than the individual points.",
      observation: "Training and validation error both stay low here. The extra flexibility captures the true shape without chasing noise.",
    },
    {
      title: "Push the model past its limit",
      instruction: "Raise the degree further and watch the two error curves separate on the right.",
      observation: "Training error keeps falling as the curve threads through every point, but validation error climbs. The model has started memorising the noise.",
    },
  ],
  challenges: [
    "Resample the data a few times at degree 3. Does the fitted curve stay close to the true function each time?",
    "Find the degree where validation error is lowest, then move one step past it and describe what changes in both panels.",
  ],
  component: OverfittingScene,
};
