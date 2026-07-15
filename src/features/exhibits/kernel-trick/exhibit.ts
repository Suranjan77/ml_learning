import type { ExhibitDefinition } from "../types";

export const kernelTrickExhibit: ExhibitDefinition = {
  slug: "kernel-trick",
  title: "Feature maps and kernels",
  question: "How can a feature map turn a circular boundary into a flat one?",
  summary: "Map radial distance to a third coordinate, then connect a flat feature-space threshold to its circular input-space boundary.",
  insight: "A flat threshold in this explicit feature space corresponds to a circle in the original input space. A kernel can evaluate dot products induced by the map without constructing the visible coordinates.",
  topic: "Classical machine learning",
  difficulty: "Intermediate",
  duration: 5,
  renderer: "WebGL",
  tags: ["kernel", "feature map", "svm", "support vector machine", "non-linear", "feature space", "classification", "decision boundary"],
  related: ["overfitting", "cnn-feature-maps"],
  assumptions: [
    "The dataset is hand-authored and the visible third coordinate is the explicit map phi(x, y) = (x, y, (r / R)^2); it is not learned.",
    "The scene enlarges the third axis by 4.2 times for legibility. Printed z values and the kernel calculation use the unscaled feature coordinate.",
    "The horizontal separator is computed halfway between the closest lifted samples in this radial example. No general hard- or soft-margin SVM solver runs in the browser.",
  ],
  references: [
    { label: "Cortes & Vapnik, Support-Vector Networks (1995), Machine Learning" },
    { label: "Bishop, Pattern Recognition and Machine Learning (2006), ch. 6 & 7" },
  ],
  steps: [
    { title: "Original space", instruction: "Compare possible straight boundaries with the class arrangement.", observation: "The outer class encloses the inner class, so a straight line cannot separate them." },
    { title: "Explicit feature map", instruction: "Move toward the feature-space view, then orbit the surface.", observation: "The map sends outer points higher because its third coordinate is squared radial distance." },
    { title: "Flat separation", instruction: "Orbit around the solid plane and compare it with the dashed margins.", observation: "For this radial example, the midpoint between the closest lifted samples gives a horizontal separator." },
    { title: "Same boundary", instruction: "Hold the lifted plane and input-space inset together; trace the shared threshold in both views.", observation: "Every point on the inset circle maps to the plane height, so one flat feature-space threshold is the same circular input-space boundary." },
  ],
  challenges: [
    "Orbit the feature-space view until the plane and its matching lifted contour are both visible.",
    "Trace one dashed correspondence from the input-space circle to the same height on the mapped surface.",
  ],
};
