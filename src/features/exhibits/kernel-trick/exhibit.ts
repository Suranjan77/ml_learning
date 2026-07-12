import type { ExhibitDefinition } from "../types";
import KernelTrickScene from "./KernelTrickScene";

export const kernelTrickExhibit: ExhibitDefinition = {
  slug: "kernel-trick",
  title: "Kernel feature mapping",
  question: "Non-linear separation with a radial feature map",
  summary: "Transform concentric data into a feature space where a linear separator can divide the classes.",
  insight: "A nonlinear boundary in the original space can correspond to a simple linear boundary in a transformed feature space.",
  topic: "Classical machine learning",
  difficulty: "Intermediate",
  duration: 5,
  renderer: "SVG",
  steps: [
    { title: "Original space", instruction: "Compare possible straight boundaries with the class arrangement.", observation: "The outer class encloses the inner class, so a straight line cannot separate them." },
    { title: "Feature mapping", instruction: "Increase the lift to map radial distance onto a third axis.", observation: "Outer points rise while points near the centre remain low." },
    { title: "Linear separation", instruction: "Inspect the plane between the two height ranges.", observation: "The classes are linearly separable in the transformed space." },
    { title: "Original-space boundary", instruction: "Return to the top-down view.", observation: "The separating plane corresponds to a circular boundary in the original space." },
  ],
  challenges: [
    "Drag the lift halfway down. At what point does the separation become visually clear?",
    "Predict how changing the radial feature map would change the projected boundary.",
  ],
  component: KernelTrickScene,
};
