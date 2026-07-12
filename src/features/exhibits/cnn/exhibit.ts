import type { ExhibitDefinition } from "../types";

export const cnnExhibit: ExhibitDefinition = {
  slug: "cnn-feature-maps",
  title: "CNN feature maps",
  question: "How does a CNN turn pixels into features?",
  summary: "Move from an input image through convolution, activation, and pooling while inspecting the exact patch calculation behind every feature-map cell.",
  insight: "A convolution reuses one small filter across the image. Each output cell responds to a local pattern; deeper layers combine those local responses into larger features.",
  topic: "Deep learning",
  difficulty: "Intermediate",
  duration: 6,
  renderer: "SVG",
  steps: [
    { title: "Read pixels locally", instruction: "Inspect the highlighted 3×3 receptive field inside the 8×8 image.", observation: "A convolutional unit sees a local patch, not the complete image." },
    { title: "Slide one shared filter", instruction: "Click output cells and compare the highlighted patch with the dot-product result.", observation: "The same nine filter weights are reused at every position, which is why the layer can detect a pattern anywhere." },
    { title: "Keep useful responses", instruction: "Switch filters and inspect which negative responses ReLU turns into zero.", observation: "An edge filter responds strongly only where its orientation matches; ReLU removes responses in the opposite direction." },
    { title: "Pool nearby evidence", instruction: "Compare the 6×6 activation map with its 3×3 pooled representation.", observation: "Max pooling keeps the strongest response in each region, reducing spatial detail while preserving whether a feature appeared nearby." },
  ],
  challenges: ["Find an output cell that flips sign when switching from vertical to horizontal edge detection.", "Explain what information max pooling discards and what it retains."],
};
