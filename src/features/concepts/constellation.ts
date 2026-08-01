export const conceptSlugs = [
  "pca",
  "cnn-feature-maps",
  "attention",
  "token-sampling",
  "kernel-trick",
  "regression-boundary",
  "decision-tree",
  "k-means",
  "backpropagation",
  "gradient-descent",
  "overfitting",
  "genetic-algorithm",
  "particle-swarm",
  "classification-threshold",
  "bayesian-updating",
  "bagging-and-boosting",
] as const;

export type ConceptSlug = (typeof conceptSlugs)[number];

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen", "twenty",
] as const;

/**
 * The map's prose names its own size. Spelled out rather than numeric because
 * it reads inside a sentence — and derived rather than written down, so adding
 * a concept cannot leave the label claiming the wrong count.
 */
export const conceptCountWord: string =
  NUMBER_WORDS[conceptSlugs.length] ?? String(conceptSlugs.length);

export type ConceptRelationKind =
  | "builds-on"
  | "explains"
  | "contrasts-with"
  | "another-failure-mode"
  | "changes-representation"
  | "optimises"
  | "provides-gradient-for";

export interface ConceptNode {
  slug: ConceptSlug;
  x: number;
  y: number;
}

export interface ConceptRelation {
  from: ConceptSlug;
  to: ConceptSlug;
  kind: ConceptRelationKind;
  question: string;
  explanation: string;
  /** Authored curvature keeps crossing lines and nearby concepts legible. */
  bend?: number;
}

export const relationLabels: Record<ConceptRelationKind, string> = {
  "builds-on": "builds on",
  explains: "explains",
  "contrasts-with": "contrasts with",
  "another-failure-mode": "another failure mode",
  "changes-representation": "changes representation",
  optimises: "optimises",
  "provides-gradient-for": "provides the gradient",
};

/**
 * Positions are editorial, not simulated. Neighbourhoods express four loose
 * questions: representation (top-left), choice (top-right), improvement
 * (bottom-left), and failure (bottom-right). They are not curriculum levels.
 */
export const conceptNodes: readonly ConceptNode[] = [
  { slug: "pca", x: 105, y: 118 },
  { slug: "cnn-feature-maps", x: 340, y: 102 },
  { slug: "attention", x: 635, y: 112 },
  { slug: "token-sampling", x: 1010, y: 122 },
  { slug: "kernel-trick", x: 185, y: 302 },
  { slug: "regression-boundary", x: 505, y: 310 },
  { slug: "decision-tree", x: 905, y: 310 },
  { slug: "k-means", x: 105, y: 508 },
  { slug: "backpropagation", x: 355, y: 498 },
  { slug: "gradient-descent", x: 625, y: 505 },
  { slug: "overfitting", x: 1010, y: 505 },
  { slug: "genetic-algorithm", x: 405, y: 655 },
  { slug: "particle-swarm", x: 765, y: 655 },
  { slug: "classification-threshold", x: 1050, y: 648 },
  { slug: "bayesian-updating", x: 700, y: 200 },
  { slug: "bagging-and-boosting", x: 1055, y: 415 },
] as const;

/**
 * Every line is an authored learner question. Direction describes the
 * sentence in `kind`; it never means that the learner must visit `from`
 * before `to`.
 */
export const conceptRelations: readonly ConceptRelation[] = [
  {
    from: "backpropagation",
    to: "gradient-descent",
    kind: "provides-gradient-for",
    question: "Where does gradient descent get its slope?",
    explanation: "Backpropagation computes how loss depends on each weight; gradient descent uses those derivatives to choose an update.",
  },
  {
    from: "gradient-descent",
    to: "regression-boundary",
    kind: "optimises",
    question: "What does an optimiser actually move?",
    explanation: "Regression makes parameters visible as both a prediction line and a point on a loss map—the coordinates an optimiser changes.",
    bend: -24,
  },
  {
    from: "gradient-descent",
    to: "overfitting",
    kind: "another-failure-mode",
    question: "What if optimisation succeeds but prediction gets worse?",
    explanation: "A low training loss can coexist with rising validation error. Overfitting is a different failure from unstable optimisation.",
  },
  {
    from: "gradient-descent",
    to: "genetic-algorithm",
    kind: "contrasts-with",
    question: "Can search work without a local slope?",
    explanation: "A genetic algorithm evaluates a population, then selects, recombines, and mutates candidates without differentiating the objective.",
    bend: 18,
  },
  {
    from: "gradient-descent",
    to: "particle-swarm",
    kind: "contrasts-with",
    question: "What changes when many candidates share discoveries?",
    explanation: "Particle swarm replaces one local path with moving candidates that combine momentum, personal memory, and shared evidence.",
    bend: -18,
  },
  {
    from: "genetic-algorithm",
    to: "particle-swarm",
    kind: "contrasts-with",
    question: "How do two population searches preserve variation?",
    explanation: "Genetic search changes encoded candidates through reproduction; particle swarm moves persistent candidates through velocity and memory.",
  },
  {
    from: "k-means",
    to: "particle-swarm",
    kind: "contrasts-with",
    question: "Are the moving points data or candidate solutions?",
    explanation: "K-means keeps data fixed while centroids move. In particle swarm, the moving particles themselves are candidate solutions.",
    bend: 42,
  },
  {
    from: "k-means",
    to: "gradient-descent",
    kind: "contrasts-with",
    question: "Alternating assignments or following a slope?",
    explanation: "K-means reduces its objective with assign-and-move phases; gradient descent reduces loss with local derivatives.",
    bend: -36,
  },
  {
    from: "pca",
    to: "k-means",
    kind: "builds-on",
    question: "Can compression preserve the clusters you want to find?",
    explanation: "PCA changes distances by retaining selected directions; those new distances can change the nearest-centroid assignments used by k-means.",
  },
  {
    from: "pca",
    to: "kernel-trick",
    kind: "contrasts-with",
    question: "Should representation remove dimensions or add one?",
    explanation: "PCA compresses onto a lower-dimensional axis; the kernel exhibit adds a radial coordinate to make separation simpler.",
  },
  {
    from: "kernel-trick",
    to: "regression-boundary",
    kind: "changes-representation",
    question: "Can a new representation make a flat boundary sufficient?",
    explanation: "The radial feature map turns a circular input-space boundary into a flat threshold that a linear rule can express.",
  },
  {
    from: "regression-boundary",
    to: "decision-tree",
    kind: "contrasts-with",
    question: "One line or a patchwork of rules?",
    explanation: "Regression uses one global linear boundary; a decision tree composes axis-aligned rules into local rectangular regions.",
  },
  {
    from: "decision-tree",
    to: "overfitting",
    kind: "another-failure-mode",
    question: "When do finer partitions stop generalising?",
    explanation: "Extra tree depth can isolate increasingly specific cases; held-out evidence is needed to tell useful structure from memorisation.",
  },
  {
    from: "kernel-trick",
    to: "overfitting",
    kind: "another-failure-mode",
    question: "Does extra flexibility always generalise?",
    explanation: "A richer representation can make a boundary possible, but validation behaviour still decides whether that flexibility transfers.",
    bend: -58,
  },
  {
    from: "backpropagation",
    to: "cnn-feature-maps",
    kind: "explains",
    question: "How would a convolutional filter learn?",
    explanation: "The CNN exhibit exposes shared filter calculations; backpropagation supplies the weight derivatives used to train such filters in a full network.",
    bend: 22,
  },
  {
    from: "backpropagation",
    to: "attention",
    kind: "explains",
    question: "How would query and key projections learn?",
    explanation: "The attention exhibit uses authored projections; in a trained transformer, backpropagation computes how their weights affect loss.",
    bend: -42,
  },
  {
    from: "cnn-feature-maps",
    to: "attention",
    kind: "contrasts-with",
    question: "Local receptive fields or content-dependent mixing?",
    explanation: "A convolution reuses a local filter at every position; self-attention recomputes connections from the current query-key content.",
  },
  {
    from: "decision-tree",
    to: "bagging-and-boosting",
    kind: "builds-on",
    question: "What can many trees express that one cannot?",
    explanation: "A single axis-aligned rule cannot describe a diagonal. A weighted vote over many of them approximates one as a staircase — the same cuts, combined rather than chosen between.",
  },
  {
    from: "bagging-and-boosting",
    to: "overfitting",
    kind: "another-failure-mode",
    question: "Does combining more learners ever stop helping?",
    explanation: "Ensemble accuracy here is measured on the training data, where it can only improve. Whether that improvement transfers is the question held-out error answers.",
    bend: 30,
  },
  {
    from: "bayesian-updating",
    to: "classification-threshold",
    kind: "explains",
    question: "What is precision, in probability terms?",
    explanation: "Precision is the posterior probability that an alert is real. The base rate that ruins it is the prior; the detector's score distributions are the likelihood.",
    bend: 54,
  },
  {
    from: "bayesian-updating",
    to: "overfitting",
    kind: "contrasts-with",
    question: "Can a belief be held too tightly, or too loosely?",
    explanation: "A weak prior lets a small sample dictate the answer, much as a flexible model lets noise dictate its fit. A strong prior is a form of regularisation.",
    bend: -46,
  },
  {
    from: "regression-boundary",
    to: "classification-threshold",
    kind: "builds-on",
    question: "Where does a boundary turn into a decision?",
    explanation: "A linear model outputs a score, not a verdict. The threshold that converts that score into an alert is a separate choice, and it is the one that decides which errors you make.",
    bend: 30,
  },
  {
    from: "overfitting",
    to: "classification-threshold",
    kind: "another-failure-mode",
    question: "Can a model that generalises well still be unusable?",
    explanation: "Overfitting is a failure to generalise. A well-generalising detector can still be worthless if the positive class is rare enough that almost every alert is false — a failure of the operating point, not the fit.",
  },
  {
    from: "attention",
    to: "token-sampling",
    kind: "contrasts-with",
    question: "How is an attention weight different from a token probability?",
    explanation: "Attention weights mix internal representations. Sampling probabilities govern which output token is drawn; the two distributions serve different jobs.",
  },
] as const;

export function relationsFor(slug: ConceptSlug): readonly ConceptRelation[] {
  return conceptRelations.filter((relation) => relation.from === slug || relation.to === slug);
}

export function otherConcept(relation: ConceptRelation, slug: ConceptSlug): ConceptSlug {
  return relation.from === slug ? relation.to : relation.from;
}

