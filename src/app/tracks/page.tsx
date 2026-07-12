import type { Metadata } from "next";
import Link from "next/link";
import TrackCurriculumExplorer from "@/components/ui/TrackCurriculumExplorer";
import { algorithms } from "@/data/algorithms";

export const metadata: Metadata = {
  title: "Curriculum Tracks",
  description:
    "Browse the full curriculum across the ML Practitioner, Deep Learning, and Computer Vision tracks, or explore it as a concept map.",
};

export default function TracksPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-7 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
            <span className="h-px w-8 bg-outline-dark" />
            Curriculum
          </div>
          <h1 className="max-w-3xl text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
            Three tracks, one curriculum.
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-on-surface-variant">
            The curriculum is organized into three tracks — ML Practitioner,
            Deep Learning, and Computer Vision — each broken into modules you
            can expand below. Prefer to see how the ideas connect instead?
            Browse the same curriculum as a{" "}
            <Link
              href="/map"
              className="text-primary underline-offset-[5px] decoration-1 hover:underline"
            >
              concept map
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <TrackCurriculumExplorer algorithms={algorithms} />
        </div>
      </section>
    </div>
  );
}
