import { notFound, redirect } from "next/navigation";
import type { TrackId } from "@/data/algorithms_content";
import { getTrackAnchor, learningTracks } from "@/lib/tracks";

interface TrackPageProps {
  params: Promise<{ trackId: string }>;
}

export function generateStaticParams() {
  return learningTracks.map(({ id }) => ({ trackId: id }));
}

export default async function TrackDetailPage({ params }: TrackPageProps) {
  const { trackId } = await params;
  const track = learningTracks.find(({ id }) => id === trackId);

  if (!track) notFound();

  redirect(`/tracks#${getTrackAnchor(trackId as TrackId)}`);
}
