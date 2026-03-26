import AlgorithmCard from "@/components/ui/AlgorithmCard";
import { Algorithm, AlgorithmCategory } from "@/data/algorithms";

interface AlgorithmCategoryPageProps {
  title: string;
  eyebrow: string;
  description: string;
  category: AlgorithmCategory;
  algorithms: Algorithm[];
}

const categoryColors: Record<
  AlgorithmCategory,
  {
    accent: "primary" | "secondary" | "tertiary";
    glow: string;
    badge: string;
    badgeText: string;
    statLabel: string;
  }
> = {
  Supervised: {
    accent: "primary",
    glow: "bg-primary/8",
    badge: "bg-primary/10 border-primary/20",
    badgeText: "text-primary",
    statLabel: "Labeled data",
  },
  Unsupervised: {
    accent: "secondary",
    glow: "bg-secondary/8",
    badge: "bg-secondary/10 border-secondary/20",
    badgeText: "text-secondary",
    statLabel: "Hidden structure",
  },
  "Deep Learning": {
    accent: "tertiary",
    glow: "bg-tertiary/8",
    badge: "bg-tertiary/10 border-tertiary/20",
    badgeText: "text-tertiary",
    statLabel: "Representation learning",
  },
};

const iconMap: Record<string, string> = {
  "linear-regression": "show_chart",
  "logistic-regression": "leaderboard",
  "k-nearest-neighbors": "group",
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

function getFormulaPreview(math: string): string {
  const match = math.match(/\$\$([\s\S]*?)\$\$/);
  return match ? match[1].replace(/\s+/g, " ").trim() : "f(x) = ...";
}

function getCategoryStats(category: AlgorithmCategory, count: number) {
  switch (category) {
    case "Supervised":
      return [
        { label: "Track size", value: `${count} algorithms` },
        { label: "Best for", value: "Prediction & classification" },
        { label: "Signal", value: "Inputs paired with labels" },
      ];
    case "Unsupervised":
      return [
        { label: "Track size", value: `${count} algorithms` },
        { label: "Best for", value: "Clustering & compression" },
        { label: "Signal", value: "Patterns without labels" },
      ];
    case "Deep Learning":
      return [
        { label: "Track size", value: `${count} algorithms` },
        { label: "Best for", value: "Vision, language, sequence tasks" },
        { label: "Signal", value: "Layered feature learning" },
      ];
    default:
      return [
        { label: "Track size", value: `${count} algorithms` },
        { label: "Best for", value: "Core ML concepts" },
        { label: "Signal", value: "Model intuition" },
      ];
  }
}

export default function AlgorithmCategoryPage({
  title,
  eyebrow,
  description,
  category,
  algorithms,
}: AlgorithmCategoryPageProps) {
  const theme = categoryColors[category];
  const stats = getCategoryStats(category, algorithms.length);

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-8 lg:px-12">
      <div className={`neural-glow absolute left-12 top-16 h-72 w-72 ${theme.glow}`}></div>
      <div className="neural-glow absolute bottom-12 right-8 h-64 w-64 bg-white/3"></div>

      <section className="relative z-10 mx-auto mb-12 max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${theme.badge} ${theme.badgeText}`}
          >
            {eyebrow}
          </div>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {theme.statLabel}
          </div>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h1 className="mb-5 font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-on-surface-variant sm:text-lg">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-surface-container-high/70 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur"
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </div>
                <div className="mt-2 text-sm font-semibold leading-6 text-slate-100">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-2xl font-semibold text-slate-50 sm:text-3xl">
              Algorithms in this track
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
              Start with the concepts you need most, then drill into intuition,
              math, code, strengths, and limitations for each algorithm.
            </p>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 md:inline-flex">
            {algorithms.length} topics
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {algorithms.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.id}
              title={algorithm.title}
              description={algorithm.shortDescription}
              formula={getFormulaPreview(algorithm.mathematics)}
              icon={iconMap[algorithm.id] ?? "data_object"}
              slug={algorithm.id}
              color={theme.accent}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
