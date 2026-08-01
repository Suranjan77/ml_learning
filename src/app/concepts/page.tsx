import type { Metadata } from "next";
import { ConceptConstellation, type ConceptMapExhibit } from "@/features/concepts/ConceptConstellation";
import { conceptCountWord, conceptNodes, type ConceptSlug } from "@/features/concepts/constellation";
import { exhibits } from "@/features/exhibits/registry";

export const metadata: Metadata = {
  title: "Concept map",
  description: `Explore an authored map of the questions connecting ${conceptCountWord} interactive machine-learning visualisations.`,
  alternates: { canonical: "/concepts" },
  openGraph: {
    url: "/concepts",
    title: "Machine-learning concept map",
    description: "Start anywhere and follow the question that matters next.",
    images: [{ url: "/social/library.png", width: 1200, height: 630, alt: "Machine-learning concept map" }],
  },
  twitter: { images: ["/social/library.png"] },
};

export default function ConceptsPage() {
  const mapExhibits = conceptNodes.map(({ slug }) => {
    const exhibit = exhibits.find((item) => item.slug === slug);
    if (!exhibit) throw new Error(`Concept map references missing exhibit: ${slug}`);
    return {
      slug: exhibit.slug as ConceptSlug,
      title: exhibit.title,
      question: exhibit.question,
      summary: exhibit.summary,
      topic: exhibit.topic,
    } satisfies ConceptMapExhibit;
  });

  return (
    <div className="min-h-[calc(100dvh-60px)] bg-surface-dim">
      <header className="border-b border-outline bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto grid max-w-content gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.48fr)] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-label text-primary">Concept constellation</p>
            <h1 className="mt-2 max-w-4xl text-balance font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
              Start anywhere. Follow the question that matters next.
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
            This is an authored map, not a curriculum. Lines express a precise relationship between two exhibits; they do not prescribe an order or infer similarity from tags.
          </p>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-content">
          <ConceptConstellation exhibits={mapExhibits} />
        </div>
      </main>
    </div>
  );
}

