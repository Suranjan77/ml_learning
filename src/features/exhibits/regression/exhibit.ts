import type { ExhibitDefinition } from "../types";

export const regressionExhibit: ExhibitDefinition = {
  slug: "regression-boundary",
  title: "Regression parameters",
  question: "How do model parameters move a fit or decision boundary?",
  summary: "Move slope and intercept, then connect the visible prediction line to the same coordinates on a linear or logistic loss surface.",
  insight: "A regression model's parameters are geometry and optimisation coordinates at the same time. Changing one moves the prediction rule and changes every example's contribution to loss.",
  topic: "Classical machine learning", difficulty: "Approachable", duration: 6, renderer: "SVG",
  tags: ["linear regression", "logistic regression", "decision boundary", "loss surface", "slope", "intercept", "classification"],
  related: ["gradient-descent", "overfitting", "kernel-trick"],
  assumptions: [
    "Both datasets are small and hand-authored so the parameter-to-loss relationship is stable and reproducible.",
    "Logistic classification uses signed distance from a 2-D line; real models may have many features and regularisation terms.",
  ],
  references: [
    { label: "Hastie, Tibshirani & Friedman, The Elements of Statistical Learning (2009), chapters 3–4" },
    { label: "Bishop, Pattern Recognition and Machine Learning (2006), chapters 3–4" },
  ],
  steps: [
    { title: "Start with a poor line", instruction: "Compare the residuals on the data plot with the marker's high position on the loss map.", observation: "Slope and intercept are simultaneously a visible line and a point in parameter space." },
    { title: "Correct the slope", instruction: "Move slope toward the direction of the data and watch residuals and loss shrink together.", observation: "Changing slope rotates around x = 0, so errors change differently across the input range." },
    { title: "Move the intercept", instruction: "Shift the line vertically until positive and negative residuals balance.", observation: "The intercept moves every prediction by the same amount and moves the marker across the other loss axis." },
    { title: "Classify with a boundary", instruction: "Switch to logistic mode and find a line that separates the two classes.", observation: "The same line now defines a smooth probability transition; confident mistakes cost more log loss." },
  ],
  challenges: ["Find two parameter settings with similar loss but visibly different slopes.", "In logistic mode, move the boundary through one class and explain the sharp loss increase."],
};
