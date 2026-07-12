"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { getExhibit } from "./registry";

export default function ExhibitShell({ slug }: { slug: string }) {
  const exhibit = getExhibit(slug)!;
  const [step, setStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const sceneId = useId();
  const Scene = exhibit.component;
  const current = exhibit.steps[step];

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("step");
    const requested = raw === null ? 0 : Number(raw);

    if (
      Number.isInteger(requested) &&
      requested >= 0 &&
      requested < exhibit.steps.length
    ) {
      setStep(requested);
    }
  }, [exhibit.steps.length]);

  function chooseStep(next: number) {
    setStep(next);
    const url = new URL(window.location.href);

    if (next === 0) {
      url.searchParams.delete("step");
    } else {
      url.searchParams.set("step", String(next));
    }

    window.history.replaceState({}, "", url);
  }

  function reset() {
    chooseStep(0);
    setResetKey((key) => key + 1);
  }

  return (
    <article
      data-testid="visualisation-workspace"
      className="grid h-full min-h-0 grid-rows-[76px_minmax(0,1fr)_148px] overflow-hidden sm:grid-rows-[72px_minmax(0,1fr)_104px]"
    >
      <header className="border-b border-outline bg-surface px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-label text-on-surface-variant sm:text-[11px]">
              <Link
                href="/visualisations"
                className="shrink-0 text-primary hover:underline"
              >
                All visualisations
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate">{exhibit.topic}</span>
            </div>
            <h1
              id={`${sceneId}-title`}
              className="mt-1 line-clamp-2 font-headline text-lg font-medium leading-tight text-on-surface sm:text-xl lg:text-2xl"
            >
              {exhibit.question}
            </h1>
          </div>

          <dl className="hidden shrink-0 items-center divide-x divide-outline border border-outline bg-background font-mono text-[10px] uppercase tracking-label text-on-surface-variant md:flex">
            <div className="px-3 py-2">
              <dt className="sr-only">Difficulty</dt>
              <dd>{exhibit.difficulty}</dd>
            </div>
            <div className="px-3 py-2">
              <dt className="sr-only">Estimated time</dt>
              <dd>{exhibit.duration} min</dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        aria-labelledby={`${sceneId}-title`}
        className="min-h-0 overflow-hidden bg-surface-container-low p-2 sm:p-3 lg:p-4"
      >
        <div className="mx-auto h-full min-h-0 max-w-[1600px] overflow-hidden [&>section]:h-full [&>section]:min-h-0">
          <Scene step={step} resetKey={resetKey} />
        </div>
      </section>

      <footer className="border-t border-outline bg-surface px-3 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-[1600px] min-w-0 flex-col justify-between gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
          <div className="min-w-0" aria-live="polite">
            <p className="flex min-w-0 items-baseline gap-2">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-label text-primary">
                Step {step + 1} of {exhibit.steps.length}
              </span>
              <span className="truncate text-sm font-medium text-on-surface">
                {current.title}
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-on-surface sm:line-clamp-1">
              {current.instruction}
            </p>
            <p className="mt-0.5 hidden truncate text-xs text-on-surface-variant md:block">
              {current.observation}
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-[44px_44px_minmax(96px,1fr)] gap-2 sm:flex sm:items-center">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => chooseStep(step - 1)}
              className="inline-flex h-11 items-center justify-center border border-outline bg-background px-3 text-sm transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous step"
              title="Previous step"
            >
              <ChevronLeft size={17} aria-hidden="true" />
              <span className="ml-1 hidden lg:inline">Previous</span>
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center border border-outline bg-background px-3 text-sm transition-colors hover:border-primary hover:text-primary"
              aria-label="Reset visualisation"
              title="Reset visualisation"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={step === exhibit.steps.length - 1}
              onClick={() => chooseStep(step + 1)}
              className="inline-flex h-11 items-center justify-center border border-accent bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next
              <ChevronRight className="ml-1" size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
    </article>
  );
}
