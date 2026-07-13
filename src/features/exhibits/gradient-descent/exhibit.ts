import type { ExhibitDefinition } from "../types";

export const gradientDescentExhibit: ExhibitDefinition = {
  slug: "gradient-descent",
  title: "Gradient descent",
  question: "How can the same local next step converge, oscillate, diverge, or find a different basin?",
  summary: "Change the start and step size on computed 3D loss surfaces, then compare direct descent, ravine oscillation, divergence, and local-minimum traps.",
  insight: "Each update uses only the slope at the current point. It can cross a narrow valley, diverge with a large step, or settle in a local basin without ever discovering a better minimum beyond a ridge.",
  topic: "Learning and optimisation",
  difficulty: "Approachable",
  duration: 4,
  renderer: "WebGL",
  tags: ["optimisation", "loss surface", "learning rate", "local minima", "convergence", "training"],
  related: ["backpropagation", "particle-swarm", "genetic-algorithm"],
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
      title: "Set the starting point",
      instruction: "Rotate the view to inspect the surface, drag the surface to move the red start, then take one local step.",
      observation: "Surface height is loss. The green dashed arrow shows only the downhill direction at the current point, not a planned route.",
    },
    {
      title: "Apply one update",
      instruction: "Take another step and compare the loss before and after it.",
      observation: "The update moves against the local gradient. It does not inspect the complete route or know where the minimum is.",
    },
    {
      title: "Increase the step size",
      instruction: "The grey path uses a stable rate of 0.40. Change the current rate and find the highest value that still lowers loss after 14 steps.",
      observation: "The two paths share a start and differ only in learning rate. A high rate repeatedly crosses the valley floor; above the stable range, loss grows.",
    },
    {
      title: "Get trapped in a local minimum",
      instruction: "The grey and red paths use the same learning rate. Move the red start and compare their forecast destinations.",
      observation: "With learning rate held constant, changing only the start can lead to a different basin and final loss.",
    },
  ],
  challenges: [
    "On the valley surface, find the largest learning rate that still reduces the loss over the full path.",
    "Move the start point close to the minimum and compare the local arrow with one farther away.",
    "On the many-minima surface, find two starts that converge to different final losses with the same learning rate.",
  ],
};
