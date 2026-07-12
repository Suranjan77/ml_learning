import type { Metadata } from "next";
import Link from "next/link";
import ConceptMap from "@/components/ConceptMap";
import { buildConceptMap } from "@/lib/conceptMap";

export const metadata: Metadata = {
  title: "Concept Map",
  description:
    "The whole curriculum as one map — five stages from foundations to modern generative AI, every module connected by prerequisites.",
};

export default function ConceptMapPage() {
  const data = buildConceptMap();
  const moduleCount = data.stages.reduce(
    (total, stage) => total + stage.nodes.length,
    0,
  );

  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/labs"
              className="border border-outline bg-surface px-4 py-2 text-sm font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              All Labs
            </Link>
            <div className="border border-outline bg-surface-container-high px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
              {moduleCount} modules · {data.stages.length} stages
            </div>
          </div>

          <h1 className="mt-7 max-w-3xl text-balance font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
            The Concept Map
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant sm:text-base sm:leading-8">
            One curriculum in five stages, from how a machine learns anything
            to how modern generative systems work. Every module sits in its
            stage; hover one to trace the full chain of what it builds on and
            what it unlocks.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <ConceptMap data={data} />
        </div>
      </section>
    </div>
  );
}
