import type { ExhibitDefinition } from "../types";

export const backpropExhibit: ExhibitDefinition = {
  slug: "backpropagation", title: "Backpropagation", question: "How does error travel backward through a neural network?",
  summary: "Follow inputs through a small neural network, measure prediction error, and trace the gradients that assign each weight responsibility before an update.",
  insight: "Backpropagation applies the chain rule from the loss backward. It does not move activations backward; it computes how sensitively the loss depends on each weight.",
  topic: "Deep learning", difficulty: "Technical", duration: 7, renderer: "SVG",
  tags: ["neural network", "gradients", "chain rule", "deep learning", "training", "error"],
  related: ["gradient-descent", "cnn-feature-maps", "attention"],
  steps: [
    { title: "Set the evidence", instruction: "Change the two inputs and inspect the weighted connections into the hidden layer.", observation: "Each hidden unit receives the same inputs but combines them with different learned weights." },
    { title: "Run the forward pass", instruction: "Read the hidden activations and final prediction from left to right.", observation: "The network composes weighted sums and nonlinear sigmoid activations to produce a probability." },
    { title: "Measure the error", instruction: "Flip the target and compare prediction, cross-entropy loss, and the one-update preview.", observation: "The loss turns prediction quality into one scalar objective; its derivative begins the backward pass." },
    { title: "Assign responsibility", instruction: "Inspect the signed gradient on every connection, then apply several updates.", observation: "The chain rule multiplies downstream error by local sensitivities. Gradient descent changes each weight in the opposite direction." },
  ], challenges: ["Find inputs that make one hidden unit much more active than the other.", "Flip the target and explain why every output-layer gradient changes sign."],
};
