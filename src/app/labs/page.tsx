import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interactive Labs",
  description:
    "Standalone interactive tools for building AI intuition — train a neural network, sample from a language model, and explore how concepts connect.",
};

const labs = [
  {
    href: "/playground",
    kicker: "Lab 01",
    title: "Neural Network Playground",
    description:
      "Draw a dataset, configure a network, and watch a decision boundary form in real time as backpropagation runs in your browser.",
    details: ["Live decision boundary", "Tunable architecture", "Three preset datasets"],
  },
  {
    href: "/labs/sampling",
    kicker: "Lab 02",
    title: "Token Sampling Lab",
    description:
      "See the full next-word probability distribution of a tiny language model, then reshape it with temperature and top-k and watch the text change character.",
    details: ["Full distribution view", "Temperature knob", "Top-k truncation"],
  },
  {
    href: "/map",
    kicker: "Explore",
    title: "Concept Map",
    description:
      "Every module on one map, connected by prerequisites. See where a topic sits in the landscape and what it unlocks.",
    details: ["All modules", "Prerequisite chains", "Click to open a lesson"],
  },
] as const;

export default function LabsPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-7 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
            <span className="h-px w-8 bg-outline-dark" />
            Interactive Labs
          </div>
          <h1 className="max-w-3xl text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
            Learn by poking at it.
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-on-surface-variant">
            Each lab is a standalone tool built around one idea. No reading
            required — open one, turn the knobs, and watch what happens. The
            related lessons are one click away when you want the depth.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-px border border-outline bg-border md:grid-cols-3">
          {labs.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="group flex flex-col bg-surface p-7 transition-colors hover:bg-surface-container-low sm:p-9"
            >
              <div className="mb-8 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
                {lab.kicker}
              </div>
              <h2 className="font-headline text-2xl font-medium text-on-surface group-hover:text-primary sm:text-3xl">
                {lab.title}
              </h2>
              <p className="mt-5 flex-1 text-sm font-medium leading-7 text-on-surface-variant">
                {lab.description}
              </p>
              <ul className="mt-7 space-y-2 text-[13px] font-medium text-on-surface-variant">
                {lab.details.map((detail) => (
                  <li key={detail} className="flex gap-2.5">
                    <span className="font-mono text-primary">›</span>
                    {detail}
                  </li>
                ))}
              </ul>
              <span className="mt-8 inline-flex items-center text-[15px] font-medium tracking-tight text-primary underline-offset-[6px] decoration-1 group-hover:underline">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
