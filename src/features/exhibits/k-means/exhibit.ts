import type { ExhibitDefinition } from "../types";

export const kMeansExhibit: ExhibitDefinition = {
  slug: "k-means",
  title: "K-means clustering",
  question: "How does k-means decide where clusters belong?",
  summary: "Move the centroids, step through assignment and update phases one at a time, and watch the inertia settle as the split improves.",
  insight: "K-means alternates two simple rules: give each point to its nearest centroid, then move each centroid to the mean of its points. It always reduces inertia, but a poor start can still settle into a split that a better start would have avoided.",
  topic: "Unsupervised learning",
  difficulty: "Approachable",
  duration: 5,
  renderer: "SVG",
  tags: ["clustering", "unsupervised", "centroids", "assignment", "convergence", "distance"],
  related: ["pca", "particle-swarm"],
  assumptions: [
    "Points and initial centroids are hand-placed 2-D examples; runs use Lloyd's algorithm with Euclidean distance and a fixed k.",
    "The result is a local optimum that depends on initialisation—no k-means++ seeding or multiple restarts are shown.",
  ],
  references: [
    { label: "Lloyd, Least Squares Quantization in PCM (1982), IEEE Trans. Information Theory" },
    { label: "MacQueen, Some Methods for Classification and Analysis of Multivariate Observations (1967)" },
  ],
  steps: [
    {
      title: "Place the centroids",
      instruction: "Drag a centroid, or focus the chart and use the number keys to select one and the arrow keys to move it.",
      observation: "Nothing is assigned yet. The three centroids start away from the true centre of each group of points.",
    },
    {
      title: "Assign points",
      instruction: "Run the assignment phase and see which centroid each point is nearest to.",
      observation: "Every point joins the nearest centroid. The thin lines show each point's assignment, and inertia measures the total squared distance.",
    },
    {
      title: "Move the centroids",
      instruction: "Run the update phase and compare the inertia before and after.",
      observation: "Each centroid jumps to the mean of the points assigned to it. Inertia never increases during this move.",
    },
    {
      title: "Run to convergence",
      instruction: "Press Run to convergence and watch the remaining phases play out automatically.",
      observation: "These centroids started clustered together with one left in an empty corner. K-means still stops improving, but it settles on a noticeably worse split than a better start would find.",
    },
  ],
  challenges: [
    "Drag two centroids on top of each other and leave the third far from every point, then run to convergence. Compare the final inertia with the default start.",
    "Switch between k = 2, 3 and 4 on the same points and watch which groups get merged or split apart.",
  ],
};
