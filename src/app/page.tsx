import Link from "next/link";
import ExhibitCard from "@/components/ExhibitCard";
import { exhibits } from "@/features/exhibits/registry";

const FEATURED_SLUGS = ["gradient-descent", "attention", "k-means"];

export default function Home() {
  const featured = FEATURED_SLUGS.map((slug) =>
    exhibits.find((exhibit) => exhibit.slug === slug),
  ).filter((exhibit) => exhibit !== undefined);
  const shown = featured.length === 3 ? featured : exhibits.slice(0, 3);

  return (
    <div className="md:flex md:h-[calc(100dvh-60px)] md:min-h-0 md:flex-col md:overflow-hidden">
      <section className="shrink-0 border-b border-outline px-4 py-7 sm:px-6 md:py-8 lg:px-8">
        <div className="mx-auto grid max-w-content gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] md:items-end lg:gap-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-label text-primary sm:text-[11px]">
              Interactive machine learning
            </p>
            <h1 className="mt-3 max-w-3xl text-balance font-headline text-3xl font-medium leading-[1.08] text-on-surface sm:text-4xl lg:text-5xl">
              Explore machine learning concepts through visualisation.
            </h1>
          </div>
          <div className="md:pb-1">
            <p className="max-w-lg text-sm leading-6 text-on-surface-variant sm:text-base">
              Adjust parameters and inspect how a model responds. Each visualisation focuses on a single concept and includes a short guided sequence.
            </p>
            <Link
              href="/visualisations"
              className="mt-4 inline-flex h-10 items-center border border-accent bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover"
            >
              View all visualisations
            </Link>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 bg-surface-dim px-4 py-5 sm:px-6 md:flex md:flex-col lg:px-8">
        <div className="mx-auto flex w-full max-w-content items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant sm:text-[11px]">
              Featured
            </p>
            <h2 className="mt-1 font-headline text-2xl font-medium text-on-surface sm:text-3xl">
              Visualisations
            </h2>
          </div>
          <Link
            href="/visualisations"
            className="hidden text-sm font-medium text-primary hover:underline lg:block"
          >
            Browse all {exhibits.length} visualisations →
          </Link>
        </div>

        <div className="mx-auto mt-4 grid w-full max-w-content gap-px border border-outline bg-outline md:min-h-0 md:flex-1 md:grid-cols-3">
          {shown.map((exhibit) => (
            <ExhibitCard
              key={exhibit.slug}
              exhibit={exhibit}
              index={exhibits.indexOf(exhibit)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
