import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "katex/dist/katex.min.css";

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
    <div className="relative overflow-hidden px-6 py-10 sm:px-8 lg:px-12">
      <div
        className={`neural-glow absolute left-12 top-16 h-72 w-72 ${accent.glow}`}
      />
      <div className="neural-glow absolute bottom-10 right-4 h-80 w-80 bg-white/4" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={categoryRoute}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/10 hover:text-slate-100"
          >
            ← Back to {categoryLabel}
          </Link>

          <div
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${accent.badge}`}
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-surface-container-high/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                Best use
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {summary.bestUse}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-container-high/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                Watch out for
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {summary.watchOut}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="glass-card overflow-hidden rounded-3xl border border-white/10">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3 text-tertiary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary/15 text-lg">
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
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface-container-high shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3 text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg">
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
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_12px_50px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                  Code Example
                </p>
                <p className="mt-1 text-sm text-slate-300">{codeLabel}</p>
              </div>
            </div>

            <div className="p-0">
              <CodeBlock code={algorithm.codeSnippet} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-6">
          <div className="group overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/12 to-surface-container shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-xl text-primary">
                  ✓
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Strengths
                </h2>
              </div>

              <ul className="space-y-4">
                {algorithm.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
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
          <div className="group overflow-hidden rounded-3xl border border-error/10 bg-gradient-to-br from-error/8 to-surface-container shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-error/20 text-xl text-error">
                  !
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Limitations
                </h2>
              </div>

              <ul className="space-y-4">
                {algorithm.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-error/15 text-xs font-bold text-error">
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
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface-container-high shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-slate-200">
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
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-200">
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
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface-container-high shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-slate-200">
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
              <ul className="space-y-5">
                {supportSections.references.map((reference, index) => (
                  <li
                    key={index}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
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
                        className="mt-3 inline-flex text-sm font-medium text-primary transition-colors hover:text-tertiary"
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

      <footer className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col gap-4 border-t border-white/10 pt-8 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 The Digital Observatory</p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link
            href={categoryRoute}
            className="transition-colors hover:text-primary"
          >
            Back to {categoryLabel}
          </Link>
          <Link
            href="/#neural-playground"
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
