"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import AlgorithmCard from "@/components/ui/AlgorithmCard";
import { algorithms } from "@/data/algorithms";
import {
  getCategoryColor,
  getAlgorithmIcon,
  getFormulaPreview,
} from "@/lib/algorithmPresentation";

// Curriculum is now fully continuous over the 10 core algorithm domains

const heroStats = [
  { label: "Core Topics", value: "13" },
  { label: "Curriculum Modules", value: `${algorithms.length}` },
  { label: "Interactive Labs", value: "1" },
] as const;

const accentBorderMap = {
  primary: "border-l-primary hover:shadow-[0_2px_16px_-4px_rgba(173,198,255,0.12)]",
  secondary: "border-l-secondary hover:shadow-[0_2px_16px_-4px_rgba(208,188,255,0.12)]",
  tertiary: "border-l-tertiary hover:shadow-[0_2px_16px_-4px_rgba(123,208,255,0.12)]",
} as const;

const accentBadgeMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
} as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-visible px-6 py-14 sm:px-8 lg:px-12 lg:py-24">
        <div className="relative z-10 mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1fr_360px] lg:items-center">
          
          {/* Left Column (Hero Content) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 flex flex-col gap-6"
          >
            {/* Main Headline */}
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-headline text-5xl font-black uppercase leading-none tracking-tight text-on-surface sm:text-6xl lg:text-7xl xl:text-8xl">
                Understand AI,
              </h1>
              <div className="border-4 border-outline bg-primary px-4 py-2 shadow-[-8px_8px_0px_0px_var(--color-outline)]">
                <span className="font-headline text-4xl font-black uppercase tracking-tight text-outline-dark sm:text-5xl lg:text-6xl">
                  Mathematically
                </span>
              </div>
              <div className="border-4 border-outline bg-tertiary px-4 py-2 shadow-[-8px_8px_0px_0px_var(--color-outline)]">
                <span className="font-headline text-4xl font-black uppercase tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
                  & Intuitively
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-2xl font-mono text-base font-medium leading-relaxed text-[#D4D4D4] sm:text-lg">
              Explore machine learning algorithms through concise explanations,
              polished visual intuition, readable mathematical logic, code
              examples, and a browser-based neural playground you can manipulate
              yourself.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/algorithms/supervised"
                className="inline-flex items-center justify-center border-4 border-outline-dark bg-primary px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-outline-dark shadow-[-6px_6px_0px_0px_var(--color-outline-dark)] transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-2px_2px_0px_0px_var(--color-outline-dark)]"
              >
                Start Learning
              </Link>

              <Link
                href="/algorithms/maximum-likelihood"
                className="inline-flex items-center justify-center border-4 border-outline-dark bg-[#E5E5E5] px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-outline-dark shadow-[-6px_6px_0px_0px_var(--color-outline-dark)] transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-2px_2px_0px_0px_var(--color-outline-dark)]"
              >
                Explore Curriculum
              </Link>

              <Link
                href="/playground"
                className="inline-flex items-center justify-center border-4 border-tertiary bg-transparent px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-tertiary shadow-[-6px_6px_0px_0px_var(--color-tertiary)] transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-2px_2px_0px_0px_var(--color-tertiary)]"
              >
                Open Playground
              </Link>
            </div>
          </motion.div>

          {/* Right Column (Visuals & Data Cards) */}
          <div className="relative mt-12 lg:mt-0">
            {/* Abstract Background Shapes */}
            <motion.div
              className="pointer-events-none absolute -right-16 -top-16 z-0 h-64 w-64"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                <polygon
                  points="50,10 90,90 10,90"
                  fill="var(--color-tertiary)"
                  stroke="var(--color-outline)"
                  strokeWidth="4"
                  strokeLinejoin="miter"
                />
              </svg>
            </motion.div>
            
            <motion.div
              className="pointer-events-none absolute -bottom-16 -left-16 z-0 h-56 w-56"
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="var(--color-secondary)"
                  stroke="var(--color-outline)"
                  strokeWidth="4"
                />
              </svg>
            </motion.div>

            {/* Data Cards */}
            <motion.div
              className="relative z-10 flex flex-col gap-6 pointer-events-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-4 border-outline bg-[#2A2A2A] p-6 shadow-[-8px_8px_0px_0px_var(--color-outline)] transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_0px_var(--color-outline)]"
                >
                  <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#D4D4D4]">
                    {stat.label}
                  </div>
                  <div className="mt-2 font-headline text-5xl font-black tracking-tight text-on-surface">
                    {stat.value}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Complete Curriculum Grid */}
      <section className="px-6 pb-20 pt-10 sm:px-8 lg:px-12 lg:pb-24 lg:pt-12">
        <div className="mr-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Curriculum
              </p>
              <h2 className="font-headline text-4xl font-black uppercase tracking-tight text-on-surface">
                Complete Sequence
              </h2>
              <p className="mt-2 max-w-2xl font-mono text-base font-medium leading-relaxed text-[#D4D4D4]">
                Master the full mathematical foundations sequentially across all {algorithms.length} distinct rigorous learning modules.
              </p>
            </div>

            <div className="hidden border-2 border-outline bg-surface px-4 py-2 font-mono text-sm font-bold uppercase text-on-surface shadow-[-4px_4px_0px_0px_var(--color-outline)] md:inline-flex">
              {algorithms.length} topics available
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {algorithms.map((algorithm, i) => (
              <motion.div key={algorithm.id} variants={fadeUp} custom={i}>
                <AlgorithmCard
                  title={algorithm.title}
                  description={algorithm.shortDescription}
                  formula={getFormulaPreview(algorithm.mathematics)}
                  icon={getAlgorithmIcon(algorithm.id)}
                  slug={algorithm.id}
                  color={getCategoryColor(algorithm.category)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


    </div>
  );
}
