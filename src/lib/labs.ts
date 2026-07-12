export type Lab = {
  href: string;
  kicker: string;
  title: string;
  description: string;
  details: readonly [string, string, string];
  theoryHref?: string;
};

export const labs: readonly Lab[] = [
  {
    href: "/playground",
    kicker: "Lab 01",
    title: "Neural Network Playground",
    description:
      "Draw a dataset, configure a network, and watch a decision boundary form in real time as backpropagation runs in your browser.",
    details: [
      "Live decision boundary",
      "Tunable architecture",
      "Three preset datasets",
    ],
    theoryHref: "/algorithms/neural-networks",
  },
  {
    href: "/labs/sampling",
    kicker: "Lab 02",
    title: "Token Sampling Lab",
    description:
      "See the full next-word probability distribution of a tiny language model, then reshape it with temperature and top-k and watch the text change character.",
    details: ["Full distribution view", "Temperature knob", "Top-k truncation"],
    theoryHref: "/algorithms/llms",
  },
  {
    href: "/labs/gradient-descent",
    kicker: "Lab 03",
    title: "Gradient Descent Lab",
    description:
      "Drop a ball on a loss surface and race SGD, momentum, RMSProp, and Adam to the minimum. Learning rate and momentum are yours to break.",
    details: [
      "Four optimizers side by side",
      "Selectable loss surfaces",
      "Click to set the start point",
    ],
    theoryHref: "/algorithms/optimization-optimizers",
  },
  {
    href: "/labs/overfitting",
    kicker: "Lab 04",
    title: "Overfitting Lab",
    description:
      "Fit a curve to noisy points and crank the model's complexity. Watch training error melt away while test error quietly betrays you.",
    details: [
      "Draw your own data",
      "Complexity slider",
      "Live train/test error curves",
    ],
    theoryHref: "/algorithms/regularization",
  },
  {
    href: "/labs/attention",
    kicker: "Lab 05",
    title: "Attention Lab",
    description:
      "Pick a sentence and see which words each token looks at. The heatmap behind every transformer, made hoverable.",
    details: [
      "Interactive attention heatmap",
      "Preset sentences",
      "Per-token weight breakdown",
    ],
    theoryHref: "/algorithms/transformers",
  },
  {
    href: "/labs/tokenizer",
    kicker: "Lab 06",
    title: "Tokenizer Lab",
    description:
      "Type anything and watch byte-pair encoding chop it into tokens, one merge at a time — the same trick every LLM uses to read.",
    details: [
      "Step through BPE merges",
      "Your text, live",
      "Token and vocabulary counts",
    ],
    theoryHref: "/algorithms/embeddings-tokenization",
  },
] as const;

export type SequenceStop = {
  href: string;
  label: string;
  kind: "lab" | "lesson";
};

export type Sequence = {
  id: string;
  title: string;
  tagline: string;
  stops: readonly SequenceStop[];
};

export const sequences: readonly Sequence[] = [
  {
    id: "zero-to-backprop",
    title: "Zero to Backprop",
    tagline:
      "From fitting a line to training a network — the shortest honest path to understanding how learning works.",
    stops: [
      { href: "/algorithms/linear-regression", label: "Linear Regression", kind: "lesson" },
      { href: "/labs/gradient-descent", label: "Gradient Descent Lab", kind: "lab" },
      { href: "/algorithms/neural-networks", label: "Neural Networks", kind: "lesson" },
      { href: "/playground", label: "Neural Network Playground", kind: "lab" },
      { href: "/algorithms/backpropagation", label: "Backpropagation", kind: "lesson" },
    ],
  },
  {
    id: "how-llms-read-and-write",
    title: "How LLMs Read & Write",
    tagline:
      "Follow a sentence through a language model: chopped into tokens, mixed by attention, sampled back out as text.",
    stops: [
      { href: "/labs/tokenizer", label: "Tokenizer Lab", kind: "lab" },
      { href: "/algorithms/embeddings-tokenization", label: "Embeddings & Tokenization", kind: "lesson" },
      { href: "/labs/attention", label: "Attention Lab", kind: "lab" },
      { href: "/algorithms/transformers", label: "Transformers", kind: "lesson" },
      { href: "/labs/sampling", label: "Token Sampling Lab", kind: "lab" },
    ],
  },
  {
    id: "why-models-fail",
    title: "Why Models Fail",
    tagline:
      "Overfitting, the fixes for it, and how to measure whether a model actually generalizes.",
    stops: [
      { href: "/labs/overfitting", label: "Overfitting Lab", kind: "lab" },
      { href: "/algorithms/regularization", label: "Regularization", kind: "lesson" },
      { href: "/algorithms/model-evaluation", label: "Model Evaluation", kind: "lesson" },
      { href: "/algorithms/applied-ml-workflow", label: "Applied ML Workflow", kind: "lesson" },
    ],
  },
] as const;

export const exploreLinks: readonly Lab[] = [
  {
    href: "/map",
    kicker: "Explore",
    title: "Concept Map",
    description:
      "Every module on one map, connected by prerequisites. See where a topic sits in the landscape and what it unlocks.",
    details: ["All modules", "Prerequisite chains", "Click to open a lesson"],
  },
] as const;
