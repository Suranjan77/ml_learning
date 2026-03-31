import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

import { algorithms } from "@/data/algorithms";
import { algorithmSupplemental } from "@/data/algorithmSupplemental";
import AlgorithmVisualization from "@/components/ui/AlgorithmVisualization";
import CodeBlock from "@/components/ui/CodeBlock";
import LogicContent from "@/components/ui/LogicContent";
import {
  getAccentClasses,
  getAlgorithmBySlug,
  getCategoryColor,
  getCategoryLabel,
  getCategoryRoute,
} from "@/lib/algorithmPresentation";
import FoundationView from "./FoundationView";

function inferCodeLabel(code: string, title: string) {
  const normalized = code.toLowerCase();

  if (normalized.includes("torch") || normalized.includes("nn.module")) {
    return `${title.toLowerCase().replace(/\s+/g, "_")}.py · pytorch example`;
  }

  if (normalized.includes("sklearn")) {
    return `${title.toLowerCase().replace(/\s+/g, "_")}.py · scikit-learn example`;
  }

  return `${title.toLowerCase().replace(/\s+/g, "_")}.py · reference implementation`;
}

function getSummaryCards(pros: string[], cons: string[]) {
  return {
    bestUse:
      pros[0] ??
      "Works well when you need a practical, understandable baseline.",
    watchOut:
      cons[0] ??
      "Be careful about assumptions, data quality, and generalization.",
  };
}

function getSupportSections(slug: string) {
  const supplemental = algorithmSupplemental[slug];

  return {
    assumptions: supplemental?.assumptions ?? [],
    references: supplemental?.references ?? [],
  };
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const algorithm = getAlgorithmBySlug(resolvedParams.slug);

  if (!algorithm) {
    return {
      title: "Algorithm Not Found",
    };
  }

  return {
    title: algorithm.title,
    description: algorithm.shortDescription,
  };
}

export async function generateStaticParams() {
  return algorithms.map((algorithm) => ({
    slug: algorithm.id,
  }));
}

export default async function AlgorithmPage({ params }: PageProps) {
  const resolvedParams = await params;
  const algorithm = getAlgorithmBySlug(resolvedParams.slug);

  if (!algorithm) {
    notFound();
  }

  const categoryRoute = getCategoryRoute(algorithm.category);
  const categoryLabel = getCategoryLabel(algorithm.category);
  const accent = getAccentClasses(getCategoryColor(algorithm.category));
  const summary = getSummaryCards(algorithm.pros, algorithm.cons);
  const codeLabel = inferCodeLabel(algorithm.codeSnippet, algorithm.title);
  const supportSections = getSupportSections(algorithm.id);

  const isFoundation = [
    "Calculus",
    "Linear Algebra",
    "Probability Theory",
  ].includes(algorithm.category);
  if (isFoundation) {
    return (
      <FoundationView algorithm={algorithm} supportSections={supportSections} />
    );
  }

  return (
    <div className="relative px-6 py-10 sm:px-8 lg:px-12">
      <section className="relative z-10 mx-auto max-w-5xl">
        {/* Breadcrumb navigation */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant/60">
          <Link
            href="/"
            className="transition-colors hover:text-on-surface-variant"
          >
            Home
          </Link>
          <span className="text-outline-variant">›</span>
          <Link
            href={categoryRoute}
            className="transition-colors hover:text-on-surface-variant"
          >
            {categoryLabel}
          </Link>
          <span className="text-outline-variant">›</span>
          <span className="font-medium text-on-surface-variant">
            {algorithm.title}
          </span>
        </nav>

        {/* Page header */}
        <div className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${accent.badge}`}
            >
              {categoryLabel}
            </div>
          </div>

          <h1 className="mb-5 font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
            {algorithm.title}
          </h1>
          <div className="max-w-max sm:text-lg">
            <LogicContent content={algorithm.fullDescription} />
          </div>
        </div>

        {/* Quick summary cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-high accent-left-success p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
              Best use
            </div>
            <p className="mt-3 text-sm leading-7 text-on-surface">
              {summary.bestUse}
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-high accent-left-error p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
              Watch out for
            </div>
            <p className="mt-3 text-sm leading-7 text-on-surface">
              {summary.watchOut}
            </p>
          </div>
        </div>
      </section>

      {/* Full-width stacked content sections */}
      <section className="relative z-10 mx-auto max-w-5xl space-y-8">
        {/* Intuition + Visualization — full width */}
        <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
          <div className="border-b border-outline-variant/30 px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary/12 text-lg">
                <Image
                  src="/think.png"
                  alt="think"
                  width={30}
                  height={30}
                  className="filter invert"
                />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold text-on-surface sm:text-2xl">
                  Real-World Intuition
                </h2>
                <p className="text-xs text-on-surface-variant/60">
                  How to think about this algorithm
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={algorithm.intuition} />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="min-h-[380px]">
              <AlgorithmVisualization algorithmId={algorithm.id} />
            </div>
          </div>
        </div>

        {/* The Logic — full width */}
        <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
          <div className="border-b border-outline-variant/30 px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-lg">
                ∑
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold text-on-surface sm:text-2xl">
                  The Logic
                </h2>
                <p className="text-xs text-on-surface-variant/60">
                  Mathematical core for {algorithm.title.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <LogicContent content={algorithm.mathematics} />
          </div>
        </div>

        {/* Code example — full width */}
        <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
          <div className="flex flex-col gap-3 border-b border-outline-variant/30 bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
                Code Example
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {codeLabel}
              </p>
            </div>
          </div>

          <div className="p-0">
            <CodeBlock code={algorithm.codeSnippet} />
          </div>
        </div>

        {/* Strengths & Limitations — side by side */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-sm font-bold text-primary">
                  ✓
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  Strengths
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.pros.map((pro, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-surface-container/50 px-4 py-3 accent-left-primary"
                  >
                    <span className="leading-7 text-on-surface-variant">
                      {pro}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error/12 text-sm font-bold text-error">
                  !
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  Limitations
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.cons.map((con, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-surface-container/50 px-4 py-3 accent-left-error"
                  >
                    <span className="leading-7 text-on-surface-variant">
                      {con}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Assumptions & References — stacked in rows*/}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
            <div className="border-b border-outline-variant/30 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-highest text-sm font-bold text-on-surface">
                  A
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold text-on-surface">
                    Key Assumptions
                  </h2>
                  <p className="text-xs text-on-surface-variant/60">
                    Scope conditions and interpretation notes
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <ul className="space-y-3">
                {supportSections.assumptions.map((assumption, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-surface-container/50 px-4 py-3"
                  >
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-bold text-on-surface-variant">
                      {index + 1}
                    </span>
                    <span className="leading-7 text-on-surface-variant">
                      {assumption}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
            <div className="border-b border-outline-variant/30 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-highest text-sm font-bold text-on-surface">
                  R
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold text-on-surface">
                    References
                  </h2>
                  <p className="text-xs text-on-surface-variant/60">
                    Books and papers for deeper study
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <ul className="space-y-4">
                {supportSections.references.map((reference, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container p-4"
                  >
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant/90">
                      {reference.source}
                    </p>
                    {reference.url ? (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Open reference →
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-5xl flex-col gap-4 border-t border-outline-variant/30 pt-8 text-sm text-on-surface-variant/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 The Digital Observatory</p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link
            href={categoryRoute}
            className="transition-colors hover:text-primary"
          >
            Back to {categoryLabel}
          </Link>
          <Link
            href="/playground"
            className="transition-colors hover:text-primary"
          >
            Open Playground
          </Link>
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
