import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";
import ExhibitCard from "@/components/ExhibitCard";
import { GradientDescentProof } from "@/features/home/GradientDescentProof";
import { exhibits } from "@/features/exhibits/registry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FLAGSHIP_SLUGS = ["overfitting", "decision-tree", "kernel-trick"] as const;

const constellationTrails = [
  {
    question: "Where does learning come from—and how can it still fail?",
    concepts: [
      { label: "Backpropagation", focus: "backpropagation" },
      { label: "Gradient descent", focus: "gradient-descent" },
      { label: "Overfitting", focus: "overfitting" },
    ],
  },
  {
    question: "Should a representation compress the data or add a feature?",
    concepts: [
      { label: "PCA", focus: "pca" },
      { label: "Feature maps", focus: "kernel-trick" },
      { label: "Regression", focus: "regression-boundary" },
    ],
  },
  {
    question: "How is an internal weight different from an output choice?",
    concepts: [
      { label: "Attention", focus: "attention" },
      { label: "Token sampling", focus: "token-sampling" },
    ],
  },
] as const;

export default function Home() {
  const flagships = FLAGSHIP_SLUGS.flatMap((slug) => {
    const exhibit = exhibits.find((item) => item.slug === slug);
    return exhibit ? [exhibit] : [];
  });

  return (
    <div className="overflow-hidden">
      <GradientDescentProof />

      <section className="border-b border-outline bg-surface-dim px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-primary">Curiosity invitations</p>
              <h2 className="mt-2 max-w-3xl text-balance font-headline text-3xl font-medium leading-tight text-on-surface sm:text-4xl">
                Three questions worth touching.
              </h2>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">
              Make training improve while prediction worsens, reroute a point through a tree, or turn a circular problem into a flat separation.
            </p>
          </div>

          <div className="mt-8 grid gap-px border border-outline-dark bg-outline-dark lg:grid-cols-3">
            {flagships.map((exhibit, index) => <ExhibitCard key={exhibit.slug} exhibit={exhibit} index={index} />)}
          </div>
        </div>
      </section>

      <section className="border-b border-outline bg-on-surface px-4 py-12 text-background sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-content gap-8 lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-label text-inverse-primary">Concept constellation</p>
            <h2 className="mt-2 text-balance font-headline text-3xl font-medium leading-tight sm:text-4xl">
              The next exhibit should answer your next question.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-background/70">
              Explore an authored map of mechanisms, contrasts, representation changes, and failure modes. There is no start point and no required order.
            </p>
            <Link href="/concepts" className="mt-6 inline-flex min-h-11 items-center gap-2 border border-background/40 px-4 text-sm font-medium text-background hover:border-inverse-primary hover:text-inverse-primary">
              Explore the concept map <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-background/15 border-y border-background/20">
            {constellationTrails.map((trail) => (
              <article key={trail.question} className="py-4 sm:grid sm:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1fr)] sm:items-center sm:gap-5">
                <p className="text-sm leading-5 text-background/70">{trail.question}</p>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
                  {trail.concepts.map((concept, index) => (
                    <span key={concept.focus} className="contents">
                      {index > 0 ? <MoveRight size={14} className="shrink-0 text-background/35" aria-hidden="true" /> : null}
                      <Link href={`/concepts?focus=${concept.focus}`} className="border border-background/25 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-background hover:border-inverse-primary hover:text-inverse-primary">
                        {concept.label}
                      </Link>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-primary">All interactive experiments</p>
              <h2 className="mt-2 font-headline text-3xl font-medium text-on-surface sm:text-4xl">Explore the complete collection</h2>
            </div>
            <Link href="/visualisations" className="hidden items-center gap-2 text-sm font-medium text-primary hover:underline sm:inline-flex">
              Search and filter <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-px border border-outline bg-outline md:grid-cols-2 xl:grid-cols-3">
            {exhibits.map((exhibit, index) => <ExhibitCard key={exhibit.slug} exhibit={exhibit} index={index} className={index === exhibits.length - 1 && exhibits.length % 3 === 2 ? "md:col-span-2" : ""} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
