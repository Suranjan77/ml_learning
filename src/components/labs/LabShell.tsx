import type { ReactNode } from "react";
import Link from "next/link";
import TheaterMode from "@/components/ui/TheaterMode";

interface LabShellProps {
  title: string;
  lede: string;
  theoryHref: string;
  theoryLabel?: string;
  stats: [string, string][];
  notesTitle?: string;
  notes: [string, string, string][];
  closing?: ReactNode;
  children: ReactNode;
}

/**
 * Shared page shell for the interactive labs. Keeps the header compact so
 * the environment itself is visible within the initial viewport, with the
 * explanatory prose (operating notes, closing paragraph) below the fold.
 */
export default function LabShell({
  title,
  lede,
  theoryHref,
  theoryLabel = "Read Theory",
  stats,
  notesTitle = "Operating Notes",
  notes,
  closing,
  children,
}: LabShellProps) {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <Link
              href="/labs"
              className="shrink-0 border border-outline bg-surface px-4 py-2 text-sm font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              All Labs
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-headline text-2xl font-medium text-on-surface sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 max-w-xl truncate text-sm text-on-surface-variant">
                {lede}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-on-surface-variant">
              {stats.map(([label, value]) => (
                <span
                  key={label}
                  className="border border-outline bg-surface-container-high px-3 py-2"
                >
                  {label}: <span className="text-on-surface">{value}</span>
                </span>
              ))}
            </div>
            <Link
              href={theoryHref}
              className="shrink-0 border border-outline bg-surface-container px-4 py-2 text-sm font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              {theoryLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px] border border-outline bg-surface">
          <div className="p-4 sm:p-6">
            <TheaterMode title={title}>{children}</TheaterMode>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <h2 className="mb-8 font-headline text-4xl font-medium text-on-surface">
            {notesTitle}
          </h2>
          <div className="grid gap-px border border-outline bg-border sm:grid-cols-2 lg:grid-cols-4">
            {notes.map(([step, noteTitle, description]) => (
              <article key={step} className="bg-surface p-6">
                <div className="mb-8 font-mono text-[13px] text-on-surface-variant">
                  {step}
                </div>
                <h3 className="font-headline text-xl font-medium text-on-surface">
                  {noteTitle}
                </h3>
                <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">
                  {description}
                </p>
              </article>
            ))}
          </div>
          {closing && (
            <div className="mt-8 max-w-3xl text-sm leading-7 text-on-surface-variant">
              {closing}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
