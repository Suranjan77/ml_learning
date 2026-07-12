import type { ExhibitDefinition } from "../types";

export const kernelTrickExhibit: ExhibitDefinition = {
  slug: "kernel-trick",
  title: "Kernel SVM",
  question: "How can an SVM separate concentric classes?",
  summary: "Lift concentric data into a three-dimensional feature space where a maximum-margin plane can divide the classes.",
  insight: "A nonlinear SVM boundary in the input space can correspond to a flat, maximum-margin decision plane in transformed feature space.",
  topic: "Classical machine learning",
  difficulty: "Intermediate",
  duration: 5,
  renderer: "WebGL",
  tags: ["svm", "support vector machine", "non-linear", "feature space", "classification", "decision boundary"],
  related: ["overfitting", "cnn-feature-maps"],
  assumptions: [
    "The dataset is a hand-authored non-linearly-separable arrangement; the lift to a higher dimension uses an explicit illustrative feature map, not a learned kernel.",
    "The separating plane is drawn for intuition—no soft-margin optimisation or support-vector solving runs live.",
  ],
  references: [
    { label: "Cortes & Vapnik, Support-Vector Networks (1995), Machine Learning" },
    { label: "Bishop, Pattern Recognition and Machine Learning (2006), ch. 6 & 7" },
  ],
  steps: [
    { title: "Original space", instruction: "Compare possible straight boundaries with the class arrangement.", observation: "The outer class encloses the inner class, so a straight line cannot separate them." },
    { title: "Feature mapping", instruction: "Increase the lift to map radial distance onto a third axis.", observation: "Outer points rise while points near the centre remain low." },
    { title: "Maximum-margin separation", instruction: "Orbit around the decision plane and compare it with the dashed margins.", observation: "The closest samples become support vectors and determine the SVM plane halfway between the classes." },
    { title: "Original-space boundary", instruction: "Return to the top-down view.", observation: "The separating plane corresponds to a circular boundary in the original space." },
  ],
  challenges: [
    "Drag the lift halfway down. At what point does the separation become visually clear?",
    "Predict how changing the radial feature map would change the projected boundary.",
  ],
};
