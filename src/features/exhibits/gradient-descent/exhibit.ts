import type { ExhibitDefinition } from "../types";

export const gradientDescentExhibit: ExhibitDefinition = {
  slug: "gradient-descent",
  title: "Gradient descent",
  question: "Does taking a bigger step always get you to the bottom faster?",
  summary: "Change the start and step size on computed 3D loss surfaces, then see how each local next step builds paths that converge, diverge, cross a valley, or enter a local-minimum trap.",
  insight: "Each update uses only the slope at the current point. It can cross a narrow valley, diverge with a large step, or settle in a local basin without ever discovering a better minimum beyond a ridge.",
  topic: "Learning and optimisation",
  difficulty: "Approachable",
  duration: 4,
  renderer: "WebGL",
  tags: ["optimisation", "loss surface", "learning rate", "local minima", "convergence", "training"],
  related: ["backpropagation", "overfitting", "genetic-algorithm"],
  assumptions: [
    "The loss surfaces are hand-authored two-parameter functions chosen to show valleys and multiple minima, not a real trained model's loss.",
    "Every update is plain full-batch gradient descent with a fixed learning rate—no momentum, adaptive rates, or stochastic mini-batches.",
  ],
  references: [
    { label: "Goodfellow, Bengio & Courville, Deep Learning (2016), ch. 4 & 8" },
    { label: "Bishop, Pattern Recognition and Machine Learning (2006), §5.2" },
  ],
  steps: [
    {
      title: "Start with what it knows",
      instruction: "Surface height is loss. Move the rust start, inspect the local downhill arrow, then decide where you think it will go.",
      observation: "The green arrow is local information at one point—not a planned route or a map of the destination.",
    },
    {
      title: "Take one local step",
      instruction: "Take another step and compare the computed loss before and after it.",
      observation: "The update moves against the local gradient. It does not inspect the complete route or know where the minimum is.",
    },
    {
      title: "Test a larger step",
      instruction: "Predict what a larger step will do, then find the highest slider value that still lowers loss after 14 steps.",
      observation: "Only the rate changes. Valley crossings can still lower loss—until the path becomes unstable.",
    },
    {
      title: "Change only the start",
      instruction: "The green and rust paths use the same learning rate. Move the rust start and compare their forecast destinations.",
      observation: "With learning rate held constant, changing only the start can lead to a different basin and final loss.",
    },
    {
      title: "Keep the contrast",
      instruction: "Hold the final green and rust paths together: same start, same landscape, different step size.",
      observation: "The stable path converges while the larger-step path finishes with higher loss. Gradient descent knows local downhill, not the destination.",
    },
  ],
  challenges: [
    "On the valley surface, find the largest learning rate that still reduces the loss over the full path.",
    "Move the start point close to the minimum and compare the local arrow with one farther away.",
    "On the many-minima surface, find two starts that converge to different final losses with the same learning rate.",
  ],
};
