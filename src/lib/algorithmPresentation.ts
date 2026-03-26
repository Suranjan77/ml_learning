import { algorithms, type Algorithm, type AlgorithmCategory } from "@/data/algorithms";

export type AccentColor = "primary" | "secondary" | "tertiary";

const categoryConfig: Record<
  AlgorithmCategory,
  {
    color: AccentColor;
    route: string;
    label: string;
    description: string;
  }
> = {
  Supervised: {
    color: "primary",
    route: "/algorithms/supervised",
    label: "Supervised Learning",
    description:
      "Learn from labeled examples to predict outcomes such as classes, prices, or probabilities.",
  },
  Unsupervised: {
    color: "secondary",
    route: "/algorithms/unsupervised",
    label: "Unsupervised Learning",
    description:
      "Discover hidden structure in unlabeled data through clustering, dimensionality reduction, and density estimation.",
  },
  "Deep Learning": {
    color: "tertiary",
    route: "/algorithms/deep-learning",
    label: "Deep Learning",
    description:
      "Study neural architectures that learn rich hierarchical representations from large and complex datasets.",
  },
};

const algorithmIcons: Record<string, string> = {
  "linear-regression": "show_chart",
  "logistic-regression": "leaderboard",
  "k-nearest-neighbors": "my_location",
  "support-vector-machines": "shield",
  "decision-trees": "account_tree",
  "random-forests": "forest",
  "gradient-boosting-machines": "trending_up",
  "naive-bayes": "percent",
  "k-means": "bubble_chart",
  dbscan: "grain",
  "principal-component-analysis": "scatter_plot",
  "neural-networks": "hub",
  "convolutional-neural-networks": "image",
  "recurrent-neural-networks": "timeline",
};

export function getAlgorithmBySlug(slug: string): Algorithm | undefined {
  return algorithms.find((algorithm) => algorithm.id === slug);
}

export function getCategoryColor(category: AlgorithmCategory): AccentColor {
  return categoryConfig[category].color;
}

export function getCategoryRoute(category: AlgorithmCategory): string {
  return categoryConfig[category].route;
}

export function getCategoryLabel(category: AlgorithmCategory): string {
  return categoryConfig[category].label;
}

export function getCategoryDescription(category: AlgorithmCategory): string {
  return categoryConfig[category].description;
}

export function getAlgorithmIcon(id: string): string {
  return algorithmIcons[id] ?? "data_object";
}

export function getAlgorithmRoute(id: string): string {
  return `/algorithms/${id}`;
}

export function getFormulaPreview(mathematics: string): string {
  const normalized = mathematics.replace(/\r\n/g, "\n");
  const blockMatch = normalized.match(/\$\$([\s\S]*?)\$\$/);

  if (blockMatch?.[1]) {
    return blockMatch[1].replace(/\s+/g, " ").trim();
  }

  const inlineMatch = normalized.match(/\$([^$\n]+)\$/);
  if (inlineMatch?.[1]) {
    return inlineMatch[1].replace(/\s+/g, " ").trim();
  }

  return "f(x) = ...";
}

export function formatLogicContent(content: string): string {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(-\s|\d+\.\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(\$\$)/g, "$1\n\n$2")
    .replace(/(\$\$)\n([^\n])/g, "$1\n\n$2")
    .trim();
}

export function getAccentClasses(color: AccentColor) {
  if (color === "secondary") {
    return {
      badge: "bg-secondary/10 border-secondary/20 text-secondary",
      glow: "bg-secondary/5",
      surface: "from-secondary/20 to-surface-container",
      icon: "bg-secondary/15 text-secondary border-secondary/20",
      subtleText: "text-secondary/80",
      border: "border-secondary/20",
    };
  }

  if (color === "tertiary") {
    return {
      badge: "bg-tertiary/10 border-tertiary/20 text-tertiary",
      glow: "bg-tertiary/5",
      surface: "from-tertiary/20 to-surface-container",
      icon: "bg-tertiary/15 text-tertiary border-tertiary/20",
      subtleText: "text-tertiary/80",
      border: "border-tertiary/20",
    };
  }

  return {
    badge: "bg-primary/10 border-primary/20 text-primary",
    glow: "bg-primary/5",
    surface: "from-primary/20 to-surface-container",
    icon: "bg-primary/15 text-primary border-primary/20",
    subtleText: "text-primary/80",
    border: "border-primary/20",
  };
}
