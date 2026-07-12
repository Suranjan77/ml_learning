import type { ExhibitDefinition } from "../types";

export const gradientDescentExhibit: ExhibitDefinition = {
  slug: "gradient-descent",
  title: "Gradient descent",
  question: "How does gradient descent choose its next step?",
  summary: "Compare direct descent, ravine zig-zags, and local-minimum traps while changing the start and learning rate on real 3D loss surfaces.",
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
      instruction: "Orbit the loss surface, then drag across it or focus it and use the arrow keys to move the start.",
      observation: "Surface height is the loss for two model parameters. The dashed segment shows the local downhill direction.",
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
    {
      title: "Get trapped in a local minimum",
      instruction: "Switch starting positions on the many-minima surface and compare the forecast destination.",
      observation: "The update rule always follows the local slope. It can settle in a nearby basin even when a lower minimum exists beyond a ridge.",
    },
  ],
  challenges: [
    "On the valley surface, find the largest learning rate that still reduces the loss over the full path.",
    "Move the start point close to the minimum and compare the local arrow with one farther away.",
    "On the many-minima surface, find two starts that converge to different final losses with the same learning rate.",
  ],
};
