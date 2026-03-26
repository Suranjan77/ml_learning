import Link from "next/link";
import AlgorithmCard from "@/components/ui/AlgorithmCard";
import { algorithms } from "@/data/algorithms";
import {
  getCategoryColor,
  getAlgorithmIcon,
  getFormulaPreview,
} from "@/lib/algorithmPresentation";

const featuredTracks = [
  {
    title: "Supervised Learning",
    description:
      "Start with regression, classification, trees, and ensemble methods.",
    href: "/algorithms/supervised",
    accent: "primary",
  },
  {
    title: "Unsupervised Learning",
    description:
      "Explore clustering, density estimation, and dimensionality reduction.",
    href: "/algorithms/unsupervised",
    accent: "secondary",
  },
  {
    title: "Deep Learning",
    description:
      "Study multilayer networks, CNNs, RNNs, and representation learning.",
    href: "/algorithms/deep-learning",
    accent: "tertiary",
  },
] as const;

const heroStats = [
  { label: "Tracks", value: "3" },
  { label: "Algorithms", value: `${algorithms.length}` },
  { label: "Interactive Labs", value: "1" },
] as const;

const accentClassMap = {
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary/12 text-secondary",
  tertiary: "bg-tertiary/12 text-tertiary",
} as const;

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="relative z-10 mr-auto grid max-w-[1400px] gap-10 xl:grid-cols-[minmax(0,1.08fr)_320px] xl:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Learn ML with real interactive demos
            </div>

            <h1 className="max-w-4xl font-headline text-4xl font-bold leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl xl:text-7xl">
              Understand AI,{" "}
              <span className="text-primary">
                Mathematically
              </span>{" "}
              & Intuitively
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
              Explore machine learning algorithms through concise explanations,
              polished visual intuition, readable mathematical logic, code
              examples, and a browser-based neural playground you can manipulate
              yourself.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/algorithms/supervised"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary/85 sm:px-8 sm:text-base"
              >
                Start Learning
              </Link>

              <Link
                href="/algorithms/deep-learning"
                className="inline-flex items-center justify-center rounded-xl bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest sm:px-8 sm:text-base"
              >
                Explore Curriculum
              </Link>

              <Link
                href="/playground"
                className="inline-flex items-center justify-center rounded-xl border border-outline-variant px-6 py-3.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface sm:px-8 sm:text-base"
              >
                Open Playground
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-surface-container-high p-4"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-on-surface">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 lg:px-12 lg:pb-20">
        <div className="mr-auto max-w-[1400px]">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                Structured learning tracks
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Move through the curriculum by category, then drill into each
                algorithm for intuition, logic, code, strengths, and
                limitations.
              </p>
            </div>

            <Link
              href="/algorithms/supervised"
              className="inline-flex w-fit items-center justify-center rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              View all topics
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {featuredTracks.map((track) => (
              <Link
                key={track.title}
                href={track.href}
                className="group rounded-xl border border-outline-variant/50 bg-surface-container-high p-5 transition-colors hover:bg-surface-container-highest"
              >
                <div
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    accentClassMap[track.accent]
                  }`}
                >
                  {track.title}
                </div>
                <h3 className="mt-4 font-headline text-xl font-semibold tracking-tight text-on-surface">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  {track.description}
                </p>
                <div className="mt-5 text-sm font-semibold text-on-surface-variant transition-colors group-hover:text-primary">
                  Open track →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mr-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                Core Foundations
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Master the algorithms that shape modern machine learning
                systems, from classical models to deep learning architectures.
              </p>
            </div>

            <div className="hidden rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant md:inline-flex">
              {algorithms.length} topics available
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {algorithms.map((algorithm) => (
              <AlgorithmCard
                key={algorithm.id}
                title={algorithm.title}
                description={algorithm.shortDescription}
                formula={getFormulaPreview(algorithm.mathematics)}
                icon={getAlgorithmIcon(algorithm.id)}
                slug={algorithm.id}
                color={getCategoryColor(algorithm.category)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Playground CTA */}
      <section className="px-6 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mr-auto max-w-[1400px]">
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-container p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center rounded-full bg-tertiary/12 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tertiary">
                  Interactive Lab
                </div>
                <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                  Neural Network Playground
                </h2>
                <p className="mt-4 text-base leading-8 text-on-surface-variant">
                  Build classification datasets, tune model settings, and watch
                  a real neural network learn a decision boundary in your
                  browser. Full backpropagation, no shortcuts.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/playground"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary/85"
                >
                  Open Playground
                </Link>
                <Link
                  href="/algorithms/neural-networks"
                  className="inline-flex items-center justify-center rounded-xl bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                >
                  Neural Networks Lesson
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
