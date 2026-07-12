import type { Metadata } from "next";
import Link from "next/link";
import { labs as labRegistry, exploreLinks, sequences } from "@/lib/labs";

export const metadata: Metadata = {
  title: "Interactive Labs",
  description:
    "Standalone interactive tools for building AI intuition — train a neural network, sample from a language model, and explore how concepts connect.",
};

const labs = [...labRegistry, ...exploreLinks];

export default function LabsPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-7 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
            <span className="h-px w-8 bg-outline-dark" />
            Interactive Labs
          </div>
          <h1 className="max-w-3xl text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
            Learn by poking at it.
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-on-surface-variant">
            Each lab is a standalone tool built around one idea. No reading
            required — open one, turn the knobs, and watch what happens. The
            related lessons are one click away when you want the depth.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-px border border-outline bg-border md:grid-cols-3">
          {labs.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="group flex flex-col bg-surface p-7 transition-colors hover:bg-surface-container-low sm:p-9"
            >
              <div className="mb-8 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
                {lab.kicker}
              </div>
              <h2 className="font-headline text-2xl font-medium text-on-surface group-hover:text-primary sm:text-3xl">
                {lab.title}
              </h2>
              <p className="mt-5 flex-1 text-sm font-medium leading-7 text-on-surface-variant">
                {lab.description}
              </p>
              <ul className="mt-7 space-y-2 text-[13px] font-medium text-on-surface-variant">
                {lab.details.map((detail) => (
                  <li key={detail} className="flex gap-2.5">
                    <span className="font-mono text-primary">›</span>
                    {detail}
                  </li>
                ))}
              </ul>
              <span className="mt-8 inline-flex items-center text-[15px] font-medium tracking-tight text-primary underline-offset-[6px] decoration-1 group-hover:underline">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-outline px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-10 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
            <span className="h-px w-8 bg-outline-dark" />
            Curated Sequences
          </div>
          <h2 className="max-w-3xl text-balance font-headline text-4xl font-medium leading-tight text-on-surface">
            Don&rsquo;t know where to start? Follow a path.
          </h2>
          <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant">
            Each sequence alternates between a lab to play with and a lesson
            that explains what you just saw. Walk them in order.
          </p>

          <div className="mt-10 grid gap-px border border-outline bg-border lg:grid-cols-3">
            {sequences.map((sequence) => (
              <article key={sequence.id} className="flex flex-col bg-surface p-7 sm:p-9">
                <h3 className="font-headline text-2xl font-medium text-on-surface">
                  {sequence.title}
                </h3>
                <p className="mt-4 flex-none text-sm font-medium leading-7 text-on-surface-variant">
                  {sequence.tagline}
                </p>
                <ol className="mt-7 space-y-3">
                  {sequence.stops.map((stop, index) => (
                    <li key={stop.href} className="flex items-center gap-3">
                      <span className="w-5 flex-none font-mono text-[13px] text-on-surface-variant">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Link
                        href={stop.href}
                        className="text-sm font-medium tracking-tight text-on-surface underline-offset-[5px] decoration-1 hover:text-primary hover:underline"
                      >
                        {stop.label}
                      </Link>
                      <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
                        {stop.kind}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
