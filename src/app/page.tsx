import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";
import ExhibitCard from "@/components/ExhibitCard";
import { GradientDescentProof } from "@/features/home/GradientDescentProof";
import { exhibits } from "@/features/exhibits/registry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FLAGSHIP_SLUGS = ["gradient-descent", "overfitting", "decision-tree"] as const;

const questionThemes = [
  {
    question: "How does a model learn?",
    slugs: ["gradient-descent", "backpropagation", "genetic-algorithm", "particle-swarm"],
  },
  {
    question: "Why does learning fail?",
    slugs: ["overfitting", "gradient-descent"],
  },
  {
    question: "How does a model divide the world?",
    slugs: ["regression-boundary", "decision-tree", "kernel-trick"],
  },
  {
    question: "How is information represented?",
    slugs: ["pca", "cnn-feature-maps", "attention"],
  },
  {
    question: "How does a model choose?",
    slugs: ["k-means", "token-sampling"],
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
              <p className="font-mono text-[10px] uppercase tracking-label text-primary">Three visual arguments</p>
              <h2 className="mt-2 max-w-3xl text-balance font-headline text-3xl font-medium leading-tight text-on-surface sm:text-4xl">
                Start where causality is already visible.
              </h2>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">
              Each flagship changes one meaningful variable, preserves the comparison, and makes the consequence inspectable without pretending the simplification is the complete model.
            </p>
          </div>

          <div className="mt-8 grid gap-px border border-outline-dark bg-outline-dark lg:grid-cols-3">
            {flagships.map((exhibit, index) => <ExhibitCard key={exhibit.slug} exhibit={exhibit} index={index} />)}
          </div>
        </div>
      </section>

      <section className="border-b border-outline bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-label text-primary">Explore by question</p>
            <h2 className="mt-2 text-balance font-headline text-3xl font-medium leading-tight text-on-surface sm:text-4xl">
              Enter through the mechanism you want to understand.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-on-surface-variant">
              These doorways overlap deliberately. They are routes into the collection, not chapters, levels, or prerequisites.
            </p>
          </div>

          <div className="mt-8 grid gap-px border border-outline bg-outline md:grid-cols-2 xl:grid-cols-5">
            {questionThemes.map((theme) => (
              <article key={theme.question} className="flex min-h-72 flex-col bg-surface p-5">
                <p className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Question</p>
                <h3 className="mt-4 font-headline text-xl font-medium leading-tight text-on-surface">{theme.question}</h3>
                <div className="mt-auto pt-6">
                  {theme.slugs.map((slug) => {
                    const exhibit = exhibits.find((item) => item.slug === slug);
                    if (!exhibit) return null;
                    return (
                      <Link key={slug} href={`/visualisations/${slug}`} className="group flex items-center justify-between gap-3 border-t border-outline py-2.5 text-sm text-on-surface transition-colors hover:text-primary">
                        <span>{exhibit.title}</span>
                        <MoveRight size={15} className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-outline bg-inverse-surface px-4 py-10 text-inverse-on-surface sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-content">
          <div className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-inverse-primary">Project principles</p>
              <h2 className="mt-2 font-headline text-2xl font-medium sm:text-3xl">Built for understanding, not engagement metrics.</h2>
            </div>
            <dl className="grid gap-px bg-[#49443B] sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Direct", "Manipulate the variable that causes the change."],
                ["Inspectable", "Keep the previous state when comparison matters."],
                ["Honest", "Computed, authored, and omitted behaviour is disclosed."],
                ["Private", "No accounts, tracking, ads, or hidden learner profile."],
              ].map(([term, description]) => (
                <div key={term} className="bg-inverse-surface p-4">
                  <dt className="font-mono text-[10px] uppercase tracking-label text-inverse-primary">{term}</dt>
                  <dd className="mt-2 text-sm leading-6 text-inverse-on-surface/80">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-primary">Complete collection</p>
              <h2 className="mt-2 font-headline text-3xl font-medium text-on-surface sm:text-4xl">Explore every visualisation</h2>
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
