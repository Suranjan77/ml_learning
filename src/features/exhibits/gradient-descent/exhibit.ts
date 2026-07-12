import type { ExhibitDefinition } from "../types";
import GradientDescentScene from "./GradientDescentScene";

export const gradientDescentExhibit: ExhibitDefinition = {
  slug: "gradient-descent",
  title: "Gradient descent",
  question: "How does gradient descent choose its next step?",
  summary: "Move the starting point, inspect the local downhill direction, and test how the learning rate changes each update.",
  insight: "Each update uses only the slope at the current point. A larger step can cross a narrow valley or increase the loss instead of reducing it.",
  topic: "Learning and optimisation",
  difficulty: "Approachable",
  duration: 4,
  renderer: "SVG",
  steps: [
    {
      title: "Set the starting point",
      instruction: "Drag across the landscape, or focus it and use the arrow keys.",
      observation: "The equal-loss contours show the shape of the surface. The arrow shows the downhill direction at the current point.",
    },
    {
      title: "Apply one update",
      instruction: "Take another step and compare the loss before and after it.",
      observation: "The update moves against the local gradient. It does not inspect the complete route or know where the minimum is.",
    },
    {
      title: "Increase the step size",
      instruction: "Lower the learning rate, restart, and compare the new path.",
      observation: "On a narrow valley, a high learning rate repeatedly crosses the valley floor. Above the stable range, the loss grows.",
    },
  ],
  challenges: [
    "On the valley surface, find the largest learning rate that still reduces the loss over the full path.",
    "Move the start point close to the minimum and compare the local arrow with one farther away.",
  ],
  component: GradientDescentScene,
};
