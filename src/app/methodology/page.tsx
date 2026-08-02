import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology and about",
  description: "How the machine-learning visualisations are built, sourced, and reviewed.",
  alternates: { canonical: "/methodology" },
  openGraph: {
    url: "/methodology",
    title: "Methodology and about",
    description: "Models, references, accessibility, privacy, and reuse terms for the visualisation library.",
    images: [{ url: "/social/methodology.png", width: 1200, height: 630, alt: "Methodology for the machine learning visualisation library" }],
  },
  twitter: { images: ["/social/methodology.png"] },
};

const sections = [
  {
    id: "approach",
    title: "Approach",
    body: "Each exhibit focuses on one relationship. Controls change the model or data directly, and guided steps point out useful states without requiring a fixed order. Fixed models and datasets keep the examples repeatable.",
  },
  {
    id: "evidence-and-simplification",
    title: "Evidence and simplification",
    body: "The insight drawer for every exhibit names its references and states what is illustrative, idealised, or omitted. Equations appear only when they clarify a control or visible mechanism. The visualisations are explanations, not production model benchmarks or claims about real-world performance.",
  },
  {
    id: "accessibility",
    title: "Accessibility",
    body: "Controls are designed for keyboard, pointer, and touch input. Scenes include a nonvisual description, important states are not encoded by colour alone, dialogs trap and restore focus, and automatic walkthroughs stop when reduced motion is preferred. Automated checks complement—not replace—manual review with assistive technology and real devices.",
  },
  {
    id: "privacy",
    title: "Privacy",
    body: "The site is a static export. It uses no analytics, tracking pixels, cookies, accounts, advertising, or stored visitor profiles. Search, filters, and exhibit state remain in the browser and are represented in ordinary URLs when they need to be shared.",
  },
] as const;

export default function MethodologyPage() {
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[10px] uppercase tracking-label text-primary">About the library</p>
        <h1 className="mt-3 max-w-4xl text-balance font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
          How the visualisations are made.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
          Suranjan Poudel builds and maintains this collection of interactive machine-learning visualisations. Each page covers one topic, includes its assumptions and references, and runs without accounts or visitor analytics.
        </p>

        <div className="mt-12 grid gap-px border border-outline bg-outline md:grid-cols-2">
          {sections.map((section) => (
            <section id={section.id} key={section.title} className="scroll-mt-20 bg-surface p-6 sm:p-8">
              <h2 className="font-headline text-2xl font-medium text-on-surface">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 border border-outline bg-surface p-6 sm:p-8">
          <h2 className="font-headline text-2xl font-medium text-on-surface">Source, licence, and reuse</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant">
            The source is publicly available on GitHub. The repository does not currently include an explicit software licence, so source availability should not be interpreted as permission to redistribute it; reuse terms will be documented there if that changes.
          </p>
          <a href="https://github.com/suranjan77/suranjan77.github.io" target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 border border-primary px-4 text-sm font-medium text-primary hover:bg-primary hover:text-on-primary">
            View source repository <ExternalLink size={15} aria-hidden="true" />
          </a>
        </section>

        <section className="mt-10 border border-outline bg-surface p-6 sm:p-8">
          <h2 className="font-headline text-2xl font-medium text-on-surface">Share or embed an exhibit</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant">
            Use “Copy exhibit link” in any workspace to copy its normal page address. For a navigation-free iframe, add <code className="bg-surface-container-high px-1.5 py-0.5 font-mono text-xs">?embed=1</code> to that address. Embedded views retain keyboard controls and a link back to the full page.
          </p>
          <Link href="/visualisations" className="mt-5 inline-flex min-h-11 items-center border border-outline px-4 text-sm font-medium text-on-surface hover:border-primary hover:text-primary">
            Choose a visualisation
          </Link>
        </section>
      </div>
    </div>
  );
}
