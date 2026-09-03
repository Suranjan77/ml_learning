import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ExhibitPreview } from "@/components/ExhibitCard";
import { exhibits } from "@/features/exhibits/registry";
import type { ExhibitDefinition } from "@/features/exhibits/types";
import { GradientDescentProof } from "@/features/home/GradientDescentProof";
import { HomeConceptField } from "@/features/home/HomeConceptField";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURED_SLUGS = ["overfitting", "decision-tree", "kernel-trick"] as const;

const comparisons: Record<(typeof FEATURED_SLUGS)[number], {
  fixed: string;
  changed: string;
  result: string;
}> = {
  overfitting: {
    fixed: "The sampled data",
    changed: "Polynomial degree",
    result: "Training error falls while validation error rises.",
  },
  "decision-tree": {
    fixed: "The downstream rules",
    changed: "The root threshold",
    result: "Moving the root threshold reroutes points in the crossed strip; only some predictions change.",
  },
  "kernel-trick": {
    fixed: "The points and threshold",
    changed: "Squared radial distance becomes a third coordinate",
    result: "The horizontal plane and input-space circle represent the same threshold.",
  },
};

function catalogueNumber(slug: string) {
  const index = exhibits.findIndex((exhibit) => exhibit.slug === slug);
  return String(index + 1).padStart(2, "0");
}

function FolioMarker({ label }: { label: string }) {
  return (
    <span className="home-folio-marker" aria-hidden="true">
      <span>{label}</span>
    </span>
  );
}

function ControlledPlate({ exhibit, index }: { exhibit: ExhibitDefinition; index: number }) {
  const evidence = comparisons[exhibit.slug as keyof typeof comparisons];

  return (
    <Link
      href={`/visualisations/${exhibit.slug}`}
      className={`causal-study group relative grid w-full min-w-full max-w-none shrink-0 snap-start overflow-hidden border-y border-outline-dark transition-colors focus-visible:z-10 lg:min-h-[21rem] lg:w-auto lg:min-w-0 lg:grid-cols-[5rem_minmax(14rem,0.72fr)_minmax(25rem,1.28fr)_minmax(17rem,0.72fr)] lg:border-b-0 ${index % 2 === 0 ? "bg-surface" : "bg-background"}`}
    >
      <div className="flex items-start justify-between border-b border-outline p-4 lg:block lg:border-b-0 lg:border-r lg:p-5">
        <span className="font-headline text-4xl font-medium leading-none text-on-surface sm:text-5xl">
          {catalogueNumber(exhibit.slug)}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant lg:mt-8 lg:block lg:[writing-mode:vertical-rl]">
          Catalogue
        </span>
      </div>

      <div className="flex flex-col justify-between border-b border-outline p-5 sm:p-7 lg:border-b-0 lg:border-r">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-primary">{exhibit.title}</p>
          <h3 className="mt-3 text-balance font-headline text-3xl font-medium leading-[1.05] text-on-surface transition-colors group-hover:text-primary">
            {exhibit.question}
          </h3>
        </div>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">
          Open visualisation
          <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>

      <div className="grid min-h-[260px] grid-rows-[auto_minmax(220px,1fr)] overflow-hidden border-b border-outline bg-surface-dim lg:border-b-0 lg:border-r">
        <div className="border-b border-outline bg-background px-3 py-2 font-mono text-[9px] uppercase tracking-[0.11em] text-on-surface-variant sm:px-5">
          Mechanism plate {String(index + 1).padStart(2, "0")}
        </div>
        <div className="min-h-0 overflow-hidden p-3 sm:p-5">
          <ExhibitPreview slug={exhibit.slug} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-outline lg:grid-cols-1">
        <div className="bg-background p-4 sm:p-5">
          <dt className="font-mono text-[9px] uppercase tracking-[0.11em] text-on-surface-variant">Held fixed</dt>
          <dd className="mt-2 text-sm font-medium leading-5 text-on-surface">{evidence.fixed}</dd>
        </div>
        <div className="bg-background p-4 sm:p-5">
          <dt className="font-mono text-[9px] uppercase tracking-[0.11em] text-on-surface-variant">Changed</dt>
          <dd className="mt-2 text-sm font-medium leading-5 text-on-surface">{evidence.changed}</dd>
        </div>
        <div className="col-span-2 bg-primary-container p-4 sm:p-5 lg:col-span-1">
          <dt className="font-mono text-[9px] uppercase tracking-[0.11em] text-primary">Visible consequence</dt>
          <dd className="mt-2 text-sm font-medium leading-5 text-on-primary-container">{evidence.result}</dd>
        </div>
      </dl>
    </Link>
  );
}

function AtlasDefaultStage() {
  return (
    <>
      <div data-atlas-view="default" className="home-atlas-default grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-surface-dim">
        <div className="border-b border-outline-dark bg-background px-4 py-2 font-mono text-[9px] uppercase tracking-[0.11em] text-on-surface-variant">
          Live index · choose a question
        </div>
        <svg viewBox="0 0 720 420" className="h-full w-full" aria-hidden="true">
          <g fill="none" stroke="var(--color-outline-dark)" opacity="0.72">
            <path d="M360 24 V396" strokeDasharray="3 7" />
            <path d="M24 210 H696" strokeDasharray="3 7" />
          </g>

          <g transform="translate(30 22)">
            <g fill="none" stroke="var(--color-outline-dark)">
              <ellipse cx="160" cy="92" rx="112" ry="60" />
              <ellipse cx="160" cy="92" rx="78" ry="42" />
              <ellipse cx="160" cy="92" rx="42" ry="23" />
            </g>
            <path d="M55 42 C88 48 83 78 116 79 S134 94 160 92" fill="none" stroke="var(--color-accent)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="55" cy="42" r="7" fill="var(--color-accent)" />
            <circle cx="160" cy="92" r="7" fill="var(--color-primary)" />
            <text x="48" y="178" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-on-surface-variant)">LOCAL SEARCH</text>
          </g>

          <g transform="translate(390 28)">
            <path d="M162 139 C145 86 98 68 52 61" fill="none" stroke="var(--color-primary)" strokeWidth="7" opacity="0.9" />
            <path d="M162 139 C191 93 235 78 276 61" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.64" />
            <rect x="18" y="43" width="88" height="35" fill="var(--color-background)" stroke="var(--color-outline-dark)" />
            <rect x="228" y="43" width="88" height="35" fill="var(--color-background)" stroke="var(--color-outline-dark)" />
            <rect x="126" y="122" width="72" height="36" fill="var(--color-primary)" />
            <text x="48" y="188" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-on-surface-variant)">CONTENT WEIGHT</text>
          </g>

          <g transform="translate(34 235)">
            <path d="M12 126 L292 28" stroke="var(--color-accent)" strokeWidth="4" />
            {[[30,112],[68,102],[105,91],[142,78],[182,72],[220,53],[266,48]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--color-primary)" />
            ))}
            <text x="14" y="166" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-on-surface-variant)">VISIBLE FIT</text>
          </g>

          <g transform="translate(410 238)">
            <rect x="10" y="8" width="270" height="128" fill="var(--color-primary-container)" opacity="0.72" />
            <rect x="144" y="8" width="136" height="128" fill="var(--color-accent-container)" opacity="0.82" />
            <path d="M144 8 V136" stroke="var(--color-accent)" strokeWidth="4" />
            <path d="M10 90 H144" stroke="var(--color-primary)" strokeWidth="3" />
            {[[42,42,"var(--color-primary)"],[76,108,"var(--color-primary)"],[118,61,"var(--color-primary)"],[174,46,"var(--color-error)"],[216,104,"var(--color-error)"],[252,65,"var(--color-error)"]].map(([x, y, fill]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={String(fill)} />
            ))}
            <text x="10" y="166" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-on-surface-variant)">RULE PARTITION</text>
          </g>
        </svg>
      </div>
      <div data-atlas-view="default" className="home-atlas-default border-t border-outline-dark bg-on-surface p-7 text-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-inverse-primary">Complete mechanism field</p>
        <h3 className="mt-3 max-w-3xl text-balance font-headline text-3xl font-medium leading-tight">
          One collection. Thirteen ways to make a model visible.
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-background/60">
          Hover or focus a question in the index to replace this field with its mechanism.
        </p>
      </div>
    </>
  );
}

export default function Home() {
  const flagships = FEATURED_SLUGS.flatMap((slug) => {
    const exhibit = exhibits.find((item) => item.slug === slug);
    return exhibit ? [exhibit] : [];
  });
  const mapExhibits = exhibits.map(({ slug, title, question, topic }) => ({ slug, title, question, topic }));

  return (
    <div className="overflow-hidden">
      <GradientDescentProof />

      <div className="home-folio relative">
        <section className="relative border-b border-outline-dark bg-surface-dim px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
          <FolioMarker label="01" />
          <div className="mx-auto max-w-content">
            <div className="grid gap-5 pb-9 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary sm:text-[11px]">Three controlled comparisons</p>
                <h2 className="mt-3 max-w-4xl text-balance font-headline text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-on-surface sm:text-5xl lg:text-6xl">
                  Keep the evidence fixed. Change one cause.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-on-surface-variant sm:text-base sm:leading-7">
                Current and kept states remain together, so the result does not depend on memory.
              </p>
            </div>

            <div className="causal-study-strip grid gap-4 lg:block lg:border-b lg:border-outline-dark">
              {flagships.map((exhibit, index) => (
                <ControlledPlate key={exhibit.slug} exhibit={exhibit} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-b border-background/15 bg-on-surface px-4 py-14 text-background sm:px-6 sm:py-18 lg:px-8 lg:py-24">
          <FolioMarker label="02" />
          <div className="mx-auto max-w-content">
            <div className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.48fr)] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-inverse-primary sm:text-[11px]">Questions connected to Gradient Descent</p>
                <h2 className="mt-3 max-w-4xl text-balance font-headline text-[2rem] font-medium leading-[1.03] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
                  Where did the gradient come from—and what can successful optimisation still miss?
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-background/65 sm:text-base">
                Start at Gradient Descent. Follow a question to see how gradients are computed, why lower training loss can coexist with worse prediction, or how search works without gradients.
              </p>
            </div>

            <HomeConceptField exhibits={mapExhibits} />
          </div>
        </section>

        <section className="relative bg-background px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
          <FolioMarker label="03" />
          <div className="mx-auto max-w-content">
            <div className="grid gap-6 border-b border-outline-dark pb-9 lg:grid-cols-[minmax(13rem,0.28fr)_minmax(0,1fr)_minmax(18rem,0.34fr)] lg:items-end">
              <p className="font-headline text-[8rem] font-medium leading-[0.72] tracking-[-0.08em] text-on-surface sm:text-[10rem]">13</p>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary sm:text-[11px]">Complete collection</p>
                <h2 className="mt-3 max-w-2xl text-balance font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
                  Start with the question you have.
                </h2>
              </div>
              <div>
                <p className="text-sm leading-6 text-on-surface-variant">
                  Hover or focus an entry to preview its mechanism. Select any entry to open the visualisation.
                </p>
                <Link href="/visualisations" className="group mt-5 inline-flex min-h-11 items-center gap-3 border border-primary bg-primary px-4 text-sm font-medium text-on-primary hover:bg-on-surface">
                  Search the library
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="home-atlas mt-9 grid gap-6 lg:grid-cols-[minmax(22rem,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-10">
              <ol className="grid grid-cols-1 gap-px border border-outline-dark bg-outline-dark min-[480px]:grid-cols-2 lg:block lg:border-x lg:border-t lg:bg-transparent">
                {exhibits.map((exhibit) => (
                  <li key={exhibit.slug} className="home-atlas-row bg-surface min-[480px]:last:col-span-2 lg:border-b lg:border-outline-dark lg:last:col-span-1">
                    <Link aria-label={`Open ${exhibit.title}: ${exhibit.question}`} href={`/visualisations/${exhibit.slug}`} className="group grid h-full min-h-[88px] grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-2 bg-surface px-3 py-3 transition-colors hover:bg-primary-container/55 min-[480px]:min-h-[112px] lg:min-h-[68px] lg:grid-cols-[2.5rem_minmax(0,1fr)_auto] lg:items-center lg:gap-3 lg:px-5">
                      <span className="font-mono text-[10px] text-on-surface-variant">{catalogueNumber(exhibit.slug)}</span>
                      <span>
                        <span className="block font-mono text-[9px] uppercase tracking-[0.11em] text-primary">{exhibit.title}</span>
                        <span className="mt-1 block text-[12px] leading-4 text-on-surface lg:hidden">{exhibit.question}</span>
                        <span className="mt-1 hidden font-mono text-[8px] uppercase tracking-[0.09em] text-on-surface-variant lg:block">{exhibit.topic} · {exhibit.duration} min</span>
                      </span>
                      <ArrowUpRight size={16} className="hidden text-on-surface-variant transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary lg:block" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>

              <div className="home-atlas-stage sticky top-[calc(var(--layout-header-height)+1.5rem)] hidden h-[calc(100dvh-var(--layout-header-height)-3.5rem)] min-h-[34rem] max-h-[46rem] overflow-hidden border border-outline-dark bg-surface lg:block" aria-hidden="true">
                {exhibits.map((exhibit, index) => (
                  <article key={exhibit.slug} className={`home-atlas-panel absolute inset-0 grid grid-rows-[minmax(0,1fr)_auto] ${index === 0 ? "is-default" : ""}`}>
                    {index === 0 ? <AtlasDefaultStage /> : null}
                    <div data-atlas-view={index === 0 ? "selected" : undefined} className={`grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-surface-dim ${index === 0 ? "home-atlas-selected" : ""}`}>
                      <span className="border-b border-outline-dark bg-background px-4 py-2 font-mono text-[9px] uppercase tracking-[0.11em] text-on-surface-variant">
                        Mechanism {catalogueNumber(exhibit.slug)} · {exhibit.renderer}
                      </span>
                      <div className="min-h-0 overflow-hidden p-7">
                        <ExhibitPreview slug={exhibit.slug} />
                      </div>
                    </div>
                    <div data-atlas-view={index === 0 ? "selected" : undefined} className={`border-t border-outline-dark bg-on-surface p-7 text-background ${index === 0 ? "home-atlas-selected" : ""}`}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-inverse-primary">{exhibit.title}</p>
                      <h3 className="mt-3 max-w-3xl text-balance font-headline text-3xl font-medium leading-tight">{exhibit.question}</h3>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-background/60">{exhibit.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
