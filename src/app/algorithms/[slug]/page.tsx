import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

  return (
    <div className="relative px-6 py-10 sm:px-8 lg:px-12">
      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={categoryRoute}
            className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            ← Back to {categoryLabel}
          </Link>

          <div
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${accent.badge}`}
          >
            {categoryLabel}
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h1 className="mb-5 font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              {algorithm.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-on-surface-variant sm:text-lg">
              {algorithm.fullDescription}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl bg-surface-container-high p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Best use
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface">
                {summary.bestUse}
              </p>
            </div>

            <div className="rounded-xl bg-surface-container-high p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Watch out for
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface">
                {summary.watchOut}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-high">
            <div className="border-b border-outline-variant/50 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3 text-tertiary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary/12 text-lg">
                  💡
                </div>
                <h2 className="font-headline text-2xl font-semibold text-on-surface">
                  Real-World Intuition
                </h2>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
                {algorithm.intuition}
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="min-h-[380px]">
                <AlgorithmVisualization algorithmId={algorithm.id} />
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-high">
            <div className="border-b border-outline-variant/50 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3 text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-lg">
                  ∑
                </div>
                <h2 className="font-headline text-2xl font-semibold text-on-surface">
                  The Logic
                </h2>
              </div>
              <p className="text-sm leading-7 text-on-surface-variant">
                The mathematical core, objective, and update rules for{" "}
                {algorithm.title.toLowerCase()}.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <LogicContent content={algorithm.mathematics} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-12">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
            <div className="flex flex-col gap-3 border-b border-outline-variant/50 bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Code Example
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">{codeLabel}</p>
              </div>
            </div>

            <div className="p-0">
              <CodeBlock code={algorithm.codeSnippet} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-high">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-lg text-primary">
                  ✓
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Strengths
                </h2>
              </div>

              <ul className="space-y-4">
                {algorithm.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                      →
                    </span>
                    <span className="leading-7 text-on-surface-variant">
                      {pro}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="xl:col-span-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-high">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/12 text-lg text-error">
                  !
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Limitations
                </h2>
              </div>

              <ul className="space-y-4">
                {algorithm.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-error/12 text-xs font-bold text-error">
                      ×
                    </span>
                    <span className="leading-7 text-on-surface-variant">
                      {con}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="xl:col-span-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-high">
            <div className="border-b border-outline-variant/50 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-lg text-on-surface">
                  A
                </div>
                <h2 className="font-headline text-2xl font-semibold text-on-surface">
                  Key Assumptions
                </h2>
              </div>
              <p className="text-sm leading-7 text-on-surface-variant">
                Important assumptions, scope conditions, and interpretation
                notes for this algorithm.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <ul className="space-y-4">
                {supportSections.assumptions.map((assumption, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold text-on-surface">
                      •
                    </span>
                    <span className="leading-7 text-on-surface-variant">
                      {assumption}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="xl:col-span-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-high">
            <div className="border-b border-outline-variant/50 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-lg text-on-surface">
                  R
                </div>
                <h2 className="font-headline text-2xl font-semibold text-on-surface">
                  References
                </h2>
              </div>
              <p className="text-sm leading-7 text-on-surface-variant">
                Authoritative books and papers for deeper study and
                verification.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <ul className="space-y-4">
                {supportSections.references.map((reference, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-surface-container p-4"
                  >
                    <p className="font-semibold leading-7 text-on-surface">
                      {reference.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      {reference.authors}
                      {reference.year ? ` (${reference.year})` : ""}
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

      <footer className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col gap-4 border-t border-outline-variant/50 pt-8 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
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
