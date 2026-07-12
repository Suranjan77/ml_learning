import type { ExhibitDefinition } from "../types";

export const pcaExhibit: ExhibitDefinition = {
  slug: "pca", title: "Principal component analysis", question: "How does PCA compress data without labels?",
  summary: "Rotate a one-dimensional projection through a two-dimensional point cloud and watch retained variance trade against reconstruction error.",
  insight: "PCA keeps directions with the greatest variance. Projecting onto those axes preserves as much squared distance as a linear compression can.",
  topic: "Unsupervised learning", difficulty: "Approachable", duration: 5, renderer: "SVG",
  steps: [
    { title: "Choose a bad projection", instruction: "Inspect the long dashed reconstruction distances on the nearly perpendicular axis.", observation: "Collapsing data onto this line discards the direction where the points vary most." },
    { title: "Rotate toward the data", instruction: "Move the angle slider and watch variance rise as reconstruction error falls.", observation: "The projected points spread out when the axis aligns with structure in the data." },
    { title: "Approach the principal axis", instruction: "Try to minimise reconstruction error manually.", observation: "For centred data, maximising projected variance and minimising squared reconstruction error identify the same axis." },
    { title: "Use the optimum", instruction: "Align the principal axis and compare the retained one-dimensional coordinates with the original cloud.", observation: "Thirty 2D points are now represented by thirty scalar scores plus the shared axis and mean." },
  ], challenges: ["Find an angle that retains about half the variation.", "Explain why PCA would fail to preserve a curved manifold even if it is visually simple."],
};
