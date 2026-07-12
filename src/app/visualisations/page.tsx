import type { Metadata } from "next";
import LibraryBrowser from "@/features/library/LibraryBrowser";
import { exhibitSummaries } from "@/features/exhibits/registry";

export const metadata: Metadata = {
  title: "Visualisations",
  description: "Interactive visualisations of machine learning concepts.",
};

export default function VisualisationsPage() {
  return (
    <div className="flex min-h-[calc(100dvh-60px)] flex-col">
      <header className="shrink-0 border-b border-outline px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto grid max-w-content gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)] md:items-end md:gap-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-label text-primary sm:text-[11px]">
              Library
            </p>
            <h1 className="mt-2 font-headline text-3xl font-medium text-on-surface sm:text-4xl">
              Machine learning visualisations
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
            Search by concept or filter by topic, then open any workspace directly. There is no required order—start wherever your question is.
          </p>
        </div>
      </header>

      <section className="flex-1 bg-surface-dim px-4 py-5 pb-8 sm:px-6 lg:px-8">
        <LibraryBrowser exhibits={exhibitSummaries} />
      </section>
    </div>
  );
}
