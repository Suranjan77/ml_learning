import type { ExhibitDefinition } from "../types";

export const decisionTreeExhibit: ExhibitDefinition = {
  slug: "decision-tree",
  title: "Decision tree partitions",
  question: "How does a decision tree carve up feature space?",
  summary: "Reveal a small tree one level at a time and move its first threshold to see rules become rectangular prediction regions.",
  insight: "A decision tree predicts by routing an example through nested if/else rules. Each axis-aligned split cuts one existing region, so deeper trees build a patchwork of leaf predictions.",
  topic: "Classical machine learning", difficulty: "Approachable", duration: 5, renderer: "SVG",
  tags: ["decision tree", "classification", "feature space", "partition", "threshold", "leaf", "rules"],
  related: ["regression-boundary", "kernel-trick", "overfitting"],
  assumptions: [
    "The points and split sequence are hand-authored to make routing visible; no training algorithm searches for the splits in the browser.",
    "Only axis-aligned binary classification is shown; ensembles, pruning, missing values, and continuous leaf outputs are omitted.",
  ],
  references: [
    { label: "Breiman, Friedman, Olshen & Stone, Classification and Regression Trees (1984)" },
    { label: "Hastie, Tibshirani & Friedman, The Elements of Statistical Learning (2009), chapter 9" },
  ],
  steps: [
    { title: "Make the first cut", instruction: "Inspect how one x threshold creates two leaves and two broad prediction regions.", observation: "One rule can only divide the whole plane into two half-planes." },
    { title: "Split each branch", instruction: "Increase depth and follow the y rules attached beneath the left and right branches.", observation: "A new rule only subdivides examples that reached its parent node." },
    { title: "Refine one leaf", instruction: "Reveal the final x split inside the upper-right region.", observation: "Deeper trees create more local rectangular regions without changing earlier routing decisions." },
    { title: "Move the root", instruction: "The dashed line keeps x < 4.0. Drag the solid root threshold and inspect the highlighted strip and rerouted points.", observation: "Crossing the root changes which subtree a point reaches. Some rerouted points keep the same prediction; others inherit a different leaf and change the accuracy." },
  ],
  challenges: ["Move the root until accuracy first drops and identify the rerouted point.", "Explain why a diagonal boundary needs several rectangular leaves."],
};
