import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExhibitShell from "@/features/exhibits/ExhibitShell";
import { exhibits, getExhibit } from "@/features/exhibits/registry";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return exhibits.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibit = getExhibit(slug);

  const path = `/visualisations/${slug}`;
  const image = `/social/${slug}.png`;

  return exhibit
    ? {
        title: exhibit.title,
        description: `${exhibit.question} ${exhibit.summary}`,
        alternates: { canonical: path },
        openGraph: {
          type: "website",
          url: path,
          siteName: siteConfig.name,
          title: exhibit.question,
          description: exhibit.summary,
          images: [{ url: image, width: 1200, height: 630, alt: `${exhibit.title} interactive visualisation` }],
        },
        twitter: {
          card: "summary_large_image",
          title: exhibit.question,
          description: exhibit.summary,
          images: [image],
        },
      }
    : { title: "Visualisation not found" };
}

export default async function VisualisationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibit = getExhibit(slug);

  if (!exhibit) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: exhibit.title,
    headline: exhibit.question,
    description: exhibit.summary,
    url: getAbsoluteUrl(`/visualisations/${exhibit.slug}`),
    learningResourceType: "Interactive visualisation",
    educationalLevel: exhibit.difficulty,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: "Suranjan Poudel" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <ExhibitShell slug={exhibit.slug} />
    </>
  );
}
