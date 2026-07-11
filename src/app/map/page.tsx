import type { Metadata } from "next";
import Link from "next/link";
import ConceptMap from "@/components/ConceptMap";
import { buildConceptMapLayout } from "@/lib/conceptMap";

export const metadata: Metadata = {
  title: "Concept Map",
  description:
    "Every module on one interactive map, connected by prerequisites. See where a topic sits in the landscape of AI and what it unlocks.",
};

export default function ConceptMapPage() {
  const layout = buildConceptMapLayout();

  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Link
              href="/labs"
              className="border border-outline bg-surface px-4 py-2 text-sm font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              All Labs
            </Link>
            <div className="border border-outline bg-surface-container-high px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
              Interactive Navigation
            </div>
          </div>

          <h1 className="max-w-3xl text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
            The Concept Map
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-on-surface-variant">
            Every topic on the site, arranged by what it builds on. Arrows
            point from prerequisite to dependent — the further right a topic
            sits, the deeper its foundations run. Hover to trace a lineage,
            click to open the lesson.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <ConceptMap layout={layout} />
        </div>
      </section>
    </div>
  );
}
