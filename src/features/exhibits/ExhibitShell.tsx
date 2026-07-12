"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Lightbulb, Pause, Play, RotateCcw, X } from "lucide-react";
import { getExhibit } from "./registry";
import { ExhibitScene } from "./sceneRegistry";

export default function ExhibitShell({ slug }: { slug: string }) {
  const exhibit = getExhibit(slug)!;
  const [step, setStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const sceneId = useId();
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

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  const chooseStep = useCallback((next: number) => {
    setStep(next);
    const url = new URL(window.location.href);

    if (next === 0) {
      url.searchParams.delete("step");
    } else {
      url.searchParams.set("step", String(next));
    }

    window.history.replaceState({}, "", url);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPlaying(false);
      return;
    }
    if (!playing) return;
    if (step >= exhibit.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => chooseStep(step + 1), 3200);
    return () => window.clearTimeout(timer);
  }, [chooseStep, exhibit.steps.length, playing, reducedMotion, step]);

  const closeDetails = useCallback(() => setDetailsOpen(false), []);

  useEffect(() => {
    if (!detailsOpen) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const focusable = () => dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      : [];

    focusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetails();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => previousFocus?.focus());
    };
  }, [closeDetails, detailsOpen]);

  function reset() {
    setPlaying(false);
    chooseStep(0);
    setResetKey((key) => key + 1);
  }

  return (
    <article
      data-testid="visualisation-workspace"
      className="relative grid h-full min-h-0 grid-rows-[76px_minmax(0,1fr)_148px] overflow-hidden sm:grid-rows-[72px_minmax(0,1fr)_104px]"
    >
      <header inert={detailsOpen ? true : undefined} className="border-b border-outline bg-surface px-4 sm:px-6 lg:px-8">
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
        inert={detailsOpen ? true : undefined}
        className="min-h-0 overflow-hidden bg-surface-container-low p-2 sm:p-3 lg:p-4"
      >
        <div className="mx-auto h-full min-h-0 max-w-[1600px] overflow-hidden [&>section]:h-full [&>section]:min-h-0">
          <ExhibitScene slug={slug} step={step} resetKey={resetKey} />
        </div>
      </section>

      <footer inert={detailsOpen ? true : undefined} className="border-t border-outline bg-surface px-3 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-[1600px] min-w-0 flex-col justify-between gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
          <div className="min-w-0" aria-live="polite">
            <p className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-label text-primary">
                Step {step + 1} of {exhibit.steps.length}
              </span>
              <span className="truncate text-sm font-medium text-on-surface">
                {current.title}
              </span>
              <span className="ml-1 hidden items-center gap-1 md:flex" aria-label="Guided step progress">
                {exhibit.steps.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => { setPlaying(false); chooseStep(index); }}
                    aria-label={`Go to step ${index + 1}: ${item.title}`}
                    aria-current={index === step ? "step" : undefined}
                    className={`h-1.5 transition-all ${index === step ? "w-6 bg-primary" : "w-3 bg-outline-dark hover:bg-primary"}`}
                  />
                ))}
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-on-surface sm:line-clamp-1">
              {current.instruction}
            </p>
            <p className="mt-0.5 hidden truncate text-xs text-on-surface-variant md:block">
              {current.observation}
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-[40px_40px_40px_40px_minmax(88px,1fr)] gap-2 sm:flex sm:items-center">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => { setPlaying(false); chooseStep(step - 1); }}
              className="inline-flex h-11 items-center justify-center border border-outline bg-background px-3 text-sm transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous step"
              title="Previous step"
            >
              <ChevronLeft size={17} aria-hidden="true" />
              <span className="ml-1 hidden lg:inline">Previous</span>
            </button>
            <button
              type="button"
              disabled={reducedMotion}
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                } else {
                  if (step === exhibit.steps.length - 1) chooseStep(0);
                  setPlaying(true);
                }
              }}
              className={`inline-flex h-11 items-center justify-center border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${playing ? "border-primary bg-primary text-on-primary" : "border-outline bg-background hover:border-primary hover:text-primary"}`}
              aria-label={reducedMotion ? "Automatic walkthrough disabled by reduced-motion preference" : playing ? "Pause guided walkthrough" : "Play guided walkthrough"}
              aria-pressed={playing}
              title={reducedMotion ? "Automatic walkthrough is disabled when reduced motion is preferred" : playing ? "Pause guided walkthrough" : "Play guided walkthrough"}
            >
              {playing ? <Pause size={16} fill="currentColor" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
              <span className="ml-1.5 hidden lg:inline">{playing ? "Pause" : "Play"}</span>
            </button>
            <button
              type="button"
              onClick={() => { setPlaying(false); setDetailsOpen(true); }}
              className="inline-flex h-11 items-center justify-center border border-outline bg-background px-3 text-sm transition-colors hover:border-primary hover:text-primary"
              aria-label="Open insight and challenges"
              title="Insight and challenges"
            >
              <Lightbulb size={16} aria-hidden="true" />
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
              onClick={() => { setPlaying(false); chooseStep(step + 1); }}
              className="inline-flex h-11 items-center justify-center border border-accent bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next
              <ChevronRight className="ml-1" size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>

      {detailsOpen ? (
        <div className="absolute inset-0 z-50 flex items-end bg-on-surface/20 backdrop-blur-[2px] sm:items-stretch sm:justify-end" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
          <aside ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${sceneId}-insight-title`} aria-describedby={`${sceneId}-insight-description`} className="max-h-[82%] w-full overflow-y-auto border-t border-outline-dark bg-surface p-5 sm:max-h-none sm:w-[min(30rem,42vw)] sm:border-l sm:border-t-0 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-label text-primary">What to take away</p>
                <h2 id={`${sceneId}-insight-title`} className="mt-2 font-headline text-2xl font-medium leading-tight text-on-surface">{exhibit.title}</h2>
              </div>
              <button type="button" onClick={closeDetails} className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-outline hover:border-primary hover:text-primary" aria-label="Close insight panel"><X size={18} aria-hidden="true" /></button>
            </div>
            <p id={`${sceneId}-insight-description`} className="mt-6 border-l-2 border-primary pl-4 text-base leading-7 text-on-surface">{exhibit.insight}</p>
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Try these challenges</p>
              <ol className="mt-3 divide-y divide-outline border-y border-outline">
                {exhibit.challenges.map((challenge, index) => <li key={challenge} className="grid grid-cols-[28px_1fr] gap-3 py-4 text-sm leading-6 text-on-surface"><span className="font-mono text-[10px] text-primary">{String(index + 1).padStart(2, "0")}</span><span>{challenge}</span></li>)}
              </ol>
            </div>
            <button type="button" onClick={closeDetails} className="mt-7 inline-flex min-h-11 w-full items-center justify-center border border-primary bg-primary px-4 text-sm font-medium text-on-primary">Return to visualisation</button>
          </aside>
        </div>
      ) : null}
    </article>
  );
}
