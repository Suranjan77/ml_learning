import Image from "next/image";
import Link from "next/link";
import ConceptMap from "@/components/ConceptMap";
import HeroTrainingDemo from "@/components/HeroTrainingDemo";
import { buildConceptMap } from "@/lib/conceptMap";
import { labs } from "@/lib/labs";

const pillars = [
  {
    glyph: "◇",
    title: "Model Intuition",
    text: "Concepts are introduced through behavior, tradeoffs, and concrete failure modes before implementation.",
  },
  {
    glyph: "◎",
    title: "Visual Intuition",
    text: "Abstract ideas rendered geometrically. Diagrams, animations, and spatial reasoning before algebra.",
  },
  {
    glyph: "⌗",
    title: "Code-Oriented Thinking",
    text: "Algorithms expressed as executable logic. From pseudocode to working implementations.",
  },
] as const;

export default function Home() {
  const conceptMap = buildConceptMap();
  const moduleCount = conceptMap.stages.reduce(
    (total, stage) => total + stage.nodes.length,
    0,
  );
  const heroStats = [
    { label: "Modules", value: moduleCount },
    { label: "Interactive Labs", value: labs.length },
  ] as const;

  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[minmax(0,520px)_360px] xl:grid-cols-[minmax(0,560px)_400px] lg:items-center lg:justify-between">
          <div className="flex flex-col items-start">
            <div className="mb-7 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
              <span className="h-px w-8 bg-outline-dark" />
              {heroStats.map((stat) => (
                <span key={stat.label}>
                  {stat.value} {stat.label}
                </span>
              ))}
            </div>
            <h1 className="w-full max-w-full text-balance font-headline text-[2.75rem] font-medium leading-[1.04] tracking-normal text-on-surface sm:max-w-[520px] sm:text-[4.05rem] lg:text-[4rem] xl:text-[4.35rem]">
              Understand AI, Visually{" "}
              <span className="text-on-surface-variant">& Intuitively.</span>
            </h1>
            <p className="mt-8 w-full max-w-full text-base font-medium leading-8 text-on-surface-variant sm:max-w-2xl sm:text-[17px]">
              A structured curriculum that teaches machine learning through
              visual intuition, model behavior, and code-oriented thinking
              from classical ML workflows through modern AI systems.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/labs"
                className="inline-flex min-h-10 items-center justify-center border border-accent bg-accent px-8 py-3 text-[15px] font-medium tracking-tight text-on-accent hover:bg-accent-hover hover:border-accent-hover"
              >
                Explore the Labs
              </Link>
              <Link
                href="/map"
                className="inline-flex min-h-10 items-center justify-center border border-outline px-8 py-3 text-[15px] font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
              >
                See the Concept Map
              </Link>
              <Link
                href="/#curriculum"
                className="inline-flex min-h-10 items-center justify-center border border-transparent px-8 py-3 text-[15px] font-medium tracking-tight text-primary underline-offset-[6px] decoration-1 hover:underline"
              >
                Curriculum →
              </Link>
            </div>
          </div>

          <div className="mt-10 w-full justify-self-end lg:mt-0 lg:max-w-[420px]">
            <HeroTrainingDemo />
          </div>
        </div>
      </section>

      <section
        id="labs"
        className="border-b border-outline px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-5 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
                <span className="h-px w-8 bg-outline-dark" />
                Interactive Labs
              </div>
              <h2 className="font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
                Learn by poking at it.
              </h2>
            </div>
            <Link
              href="/labs"
              className="inline-flex items-center text-[15px] font-medium tracking-tight text-primary underline-offset-[6px] decoration-1 hover:underline"
            >
              All labs →
            </Link>
          </div>

          <div className="grid gap-px border border-outline bg-border md:grid-cols-3">
            {labs.map((lab) => (
              <Link
                key={lab.href}
                href={lab.href}
                className="group flex flex-col bg-surface p-7 transition-colors hover:bg-surface-container-low sm:p-9"
              >
                <div className="mb-6 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
                  {lab.kicker}
                </div>
                <h3 className="font-headline text-xl font-medium text-on-surface group-hover:text-primary">
                  {lab.title}
                </h3>
                <p className="mt-4 flex-1 text-sm font-medium leading-7 text-on-surface-variant">
                  {lab.description}
                </p>
                <span className="mt-6 inline-flex items-center text-[15px] font-medium tracking-tight text-primary underline-offset-[6px] decoration-1 group-hover:underline">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="philosophy"
        className="border-b border-outline bg-surface-dim px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mx-auto max-w-[1360px] border border-outline bg-border">
          <div className="grid gap-px md:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="bg-surface px-7 py-9 sm:px-9 sm:py-10"
              >
                <div className="mb-7 font-headline text-3xl text-outline-dark">
                  {pillar.glyph}
                </div>
                <h2 className="font-headline text-xl font-medium text-on-surface">
                  {pillar.title}
                </h2>
                <p className="mt-5 text-sm font-medium leading-7 text-on-surface-variant">
                  {pillar.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="curriculum"
        className="border-b border-outline px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-5 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
                <span className="h-px w-8 bg-outline-dark" />
                Curriculum
              </div>
              <h2 className="max-w-2xl text-balance font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
                The curriculum is a map, not a list.
              </h2>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant sm:text-base sm:leading-8">
                Five stages, {moduleCount} modules, every arrow a prerequisite.
                Hover a topic to trace what it builds on and what it unlocks —
                click to open the lesson.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/map"
                className="inline-flex min-h-10 items-center justify-center border border-accent bg-accent px-8 py-3 text-[15px] font-medium tracking-tight text-on-accent hover:bg-accent-hover hover:border-accent-hover"
              >
                Open the Full Map →
              </Link>
              <Link
                href="/tracks"
                className="inline-flex min-h-10 items-center justify-center border border-outline px-8 py-3 text-[15px] font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
              >
                Browse as a List
              </Link>
            </div>
          </div>

          <ConceptMap data={conceptMap} embed />
        </div>
      </section>

      <section className="bg-[#faf8f2] border-t border-outline px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-8 md:grid-cols-[minmax(0,1fr)_460px] lg:grid-cols-[minmax(0,1fr)_520px] md:items-center">
          <div>
            <div className="mb-6 flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
              <span className="h-px w-8 bg-outline-dark" />
              Suranjan.co.uk
            </div>
            <h2 className="max-w-2xl font-headline text-3xl font-medium leading-tight text-on-surface sm:text-4xl">
              Keep the portfolio close at hand.
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant sm:text-base sm:leading-8">
              Scan the code for Suranjan Poudel&apos;s main website, projects,
              and contact details.
            </p>
          </div>

          <a
            href="https://www.suranjan.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Suranjan Poudel's website"
            className="block w-full max-w-[420px] md:max-w-[460px] md:justify-self-end lg:max-w-[520px]"
          >
            <Image
              src="/suranjan-qr.svg"
              alt="QR code linking to suranjan.co.uk"
              width={1200}
              height={1200}
              className="h-auto w-full"
            />
          </a>
        </div>
      </section>

      <footer className="border-t border-outline px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p>ML Learn · Learning AI & ML</p>
          <p>
            © 2026{" "}
            <a
              href="https://www.suranjan.co.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Suranjan Poudel
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
