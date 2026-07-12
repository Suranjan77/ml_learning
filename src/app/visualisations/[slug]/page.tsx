import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExhibitShell from "@/features/exhibits/ExhibitShell";
import { exhibits, getExhibit } from "@/features/exhibits/registry";

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

  return exhibit
    ? { title: exhibit.title, description: exhibit.summary }
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

  return <ExhibitShell slug={exhibit.slug} />;
}
