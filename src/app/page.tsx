import Link from "next/link";
import AlgorithmCard from "@/components/ui/AlgorithmCard";
import AlgorithmSimulator from "@/components/ui/AlgorithmSimulator";
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
  primary: "border-primary/20 bg-primary/10 text-primary",
  secondary: "border-secondary/20 bg-secondary/10 text-secondary",
  tertiary: "border-tertiary/20 bg-tertiary/10 text-tertiary",
} as const;

export default function Home() {
  return (
    <div className="hero-gradient min-h-screen">
      <section className="relative overflow-hidden px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-[-4rem] h-72 w-72 rounded-full bg-tertiary/10 blur-[120px]" />

        <div className="relative z-10 mr-auto grid max-w-[1400px] gap-10 xl:grid-cols-[minmax(0,1.08fr)_320px] xl:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Learn ML with real interactive demos
            </div>

            <h1 className="max-w-4xl font-headline text-4xl font-bold leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl xl:text-7xl">
              Understand AI,{" "}
              <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">
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

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/algorithms/supervised"
                className="inline-flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-container px-6 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:text-base"
              >
                Start Learning
              </Link>

              <Link
                href="/algorithms/deep-learning"
                className="inline-flex items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest sm:px-8 sm:text-base"
              >
                Explore Curriculum
              </Link>

              <Link
                href="#neural-playground"
                className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-primary/8 px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/12 sm:px-8 sm:text-base"
              >
                Jump to Playground
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-surface-container-high/70 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur"
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
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
              <h2 className="font-headline text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                Structured learning tracks
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Move through the curriculum by category, then drill into each
                algorithm for intuition, logic, code, strengths, and
                limitations.
              </p>
            </div>

            <Link
              href="/algorithms/supervised"
              className="inline-flex w-fit items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-primary"
            >
              View all topics
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {featuredTracks.map((track) => (
              <Link
                key={track.title}
                href={track.href}
                className="group rounded-2xl border border-white/10 bg-surface-container-high/60 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-surface-container-high"
              >
                <div
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                    accentClassMap[track.accent]
                  }`}
                >
                  {track.title}
                </div>
                <h3 className="mt-4 font-headline text-xl font-semibold tracking-tight text-slate-100">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {track.description}
                </p>
                <div className="mt-5 text-sm font-semibold text-slate-200 transition-colors group-hover:text-primary">
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
              <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-50">
                Core Foundations
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Master the algorithms that shape modern machine learning
                systems, from classical models to deep learning architectures.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 md:inline-flex">
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

      <section
        id="neural-playground"
        className="px-6 pb-24 sm:px-8 lg:px-12 lg:pb-32"
      >
        <div className="mr-auto max-w-[1400px]">
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-surface-container shadow-2xl">
            <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="flex flex-col justify-center border-b border-white/5 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:border-white/5 lg:p-12">
                <div className="mb-4 inline-flex w-fit items-center rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-tertiary">
                  Interactive lab
                </div>

                <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
                  Interactive Neural Playground
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
                  Build a tiny classification dataset, tune model settings, and
                  watch a small neural network learn a decision boundary
                  directly in your browser.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    "Click to place Class A or Class B samples on the canvas",
                    "Train a two-layer neural network and inspect the live boundary",
                    "Compare linear, XOR, and ring-shaped datasets",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-on-surface"
                    >
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(173,198,255,0.8)]" />
                      <span className="leading-7 text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="#neural-playground-canvas"
                    className="inline-flex items-center justify-center rounded-xl border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                  >
                    Jump to Playground
                  </Link>

                  <Link
                    href="/algorithms/neural-networks"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110"
                  >
                    Open Neural Network Lesson
                  </Link>
                </div>
              </div>

              <div className="relative bg-surface-container-highest p-4 sm:p-6 lg:p-8">
                <div className="flex h-full min-h-[560px] flex-col rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-inner sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                    <span className="ml-4 text-xs font-mono text-slate-500">
                      neural_playground.tsx
                    </span>
                  </div>

                  <div
                    id="neural-playground-canvas"
                    className="relative min-h-[320px] flex-1 scroll-mt-24"
                  >
                    <AlgorithmSimulator />
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-6 text-xs leading-relaxed text-slate-500">
                    Tip: left click to add samples, use the preset datasets, and
                    train the model to see how hidden layers bend the decision
                    surface.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
