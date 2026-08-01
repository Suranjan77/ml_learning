"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Lightbulb, Pause, Play, Presentation, RotateCcw, Share2, X } from "lucide-react";
import { getExhibit } from "./registry";
import { ExhibitScene } from "./sceneRegistry";
import { SCENE_URL_KEYS } from "./sceneUrlState";
import { PresentModeProvider } from "./presentMode";
import { GradientDescentNextConcepts } from "./gradient-descent/GradientDescentNextConcepts";

// Keep guided playback close to the duration of the scene transitions. A long
// hold here makes the walkthrough feel like a slideshow rather than animation.
const WALKTHROUGH_STEP_INTERVAL_MS = 2400;

export default function ExhibitShell({ slug }: { slug: string }) {
  const exhibit = getExhibit(slug)!;
  const relatedExhibits = exhibit.related
    .map((relatedSlug) => getExhibit(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
  const [step, setStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedMode, setEmbedMode] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const sceneId = useId();
  const current = exhibit.steps[step];
  const finalStep = step === exhibit.steps.length - 1;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("step");
    const requested = raw === null ? 0 : Number(raw);

    setEmbedMode(params.get("embed") === "1");
    setPresenting(params.get("present") === "1");

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

    for (const key of SCENE_URL_KEYS) url.searchParams.delete(key);

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
    const timer = window.setTimeout(
      () => chooseStep(step + 1),
      WALKTHROUGH_STEP_INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [chooseStep, exhibit.steps.length, playing, reducedMotion, step]);

  // Present mode is route-level state like `step` and `embed`, so it survives
  // stepping through the walkthrough and travels with a copied or embedded link.
  // The address-bar write stays outside the state updater: React may call an
  // updater during render, and touching history there updates the Router while
  // this component is still rendering.
  const togglePresenting = useCallback(() => {
    const next = !presenting;
    setPresenting(next);

    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set("present", "1");
    } else {
      url.searchParams.delete("present");
    }
    window.history.replaceState({}, "", url);
  }, [presenting]);

  // "P" toggles from the lectern without hunting for the control mid-sentence.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== "p" && event.key !== "P") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      togglePresenting();
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [togglePresenting]);

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

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      return;
    }

    if (finalStep) {
      chooseStep(0);
      setPlaying(true);
      return;
    }

    const next = step + 1;
    chooseStep(next);
    setPlaying(next < exhibit.steps.length - 1);
  }

  const playbackLabel = reducedMotion
    ? "Automatic walkthrough disabled by reduced-motion preference"
    : playing
      ? "Pause guided walkthrough"
      : finalStep
        ? "Replay guided walkthrough"
        : "Auto-play guided steps";

  async function copyExhibitLink() {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    const href = url.toString();
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      const field = document.createElement("textarea");
      field.value = href;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const fullViewHref = `/visualisations/${slug}`;

  // Presenting trades supporting chrome for scene area and larger type: the
  // room needs the question, the drawing, and the current instruction, and
  // nothing else competing with them.
  const shellRows = presenting
    ? "grid-rows-[68px_minmax(0,1fr)_136px]"
    : "grid-rows-[76px_minmax(0,1fr)_172px] sm:grid-rows-[72px_minmax(0,1fr)_104px]";
  const contentMax = presenting ? "max-w-none" : "max-w-[1600px]";

  return (
    <PresentModeProvider value={presenting}>
    <article
      data-testid="visualisation-workspace"
      data-embed={embedMode ? "true" : undefined}
      data-present={presenting ? "true" : undefined}
      data-guided-step={step}
      className={`relative grid h-full min-h-0 overflow-hidden ${shellRows}`}
    >
      <header inert={detailsOpen ? true : undefined} className="border-b border-outline bg-surface px-4 sm:px-6 lg:px-8">
        <div className={`mx-auto grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 ${contentMax}`}>
          <div className="min-w-0">
            {presenting ? null : (
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
            )}
            <h1
              id={`${sceneId}-title`}
              className={
                presenting
                  ? "line-clamp-2 font-headline text-2xl font-medium leading-tight text-on-surface lg:text-[2rem]"
                  : "mt-1 line-clamp-2 font-headline text-lg font-medium leading-tight text-on-surface sm:text-xl lg:text-2xl"
              }
            >
              {exhibit.question}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {presenting ? null : (
              <dl className="hidden items-center divide-x divide-outline border border-outline bg-background font-mono text-[10px] uppercase tracking-label text-on-surface-variant md:flex">
                <div className="px-3 py-2">
                  <dt className="sr-only">Difficulty</dt>
                  <dd>{exhibit.difficulty}</dd>
                </div>
                <div className="px-3 py-2">
                  <dt className="sr-only">Estimated time</dt>
                  <dd>{exhibit.duration} min</dd>
                </div>
              </dl>
            )}
            <button
              type="button"
              onClick={togglePresenting}
              aria-pressed={presenting}
              data-testid="present-toggle"
              title={presenting ? "Leave present mode (P)" : "Enlarge for projection (P)"}
              className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-label transition-colors ${presenting ? "h-11 border-primary bg-primary px-4 text-sm text-on-primary" : "h-9 border-outline bg-background px-3 text-[10px] text-on-surface-variant hover:border-primary hover:text-primary"}`}
            >
              <Presentation size={presenting ? 17 : 14} aria-hidden="true" />
              Present
            </button>
          </div>
          {embedMode ? (
            <Link
              href={fullViewHref}
              target="_top"
              className="absolute right-3 top-2 inline-flex min-h-9 items-center gap-1.5 border border-outline bg-surface px-3 text-xs text-primary hover:border-primary"
            >
              Full view <ExternalLink size={13} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </header>

      <section
        aria-labelledby={`${sceneId}-title`}
        inert={detailsOpen ? true : undefined}
        className={`min-h-0 overflow-hidden bg-surface-container-low ${presenting ? "p-1" : "p-2 sm:p-3 lg:p-4"}`}
      >
        <div
          className={`relative mx-auto h-full min-h-0 overflow-hidden [&>section]:h-full [&>section]:min-h-0 ${contentMax}`}
          data-guided-playback={playing ? "true" : undefined}
        >
          <ExhibitScene slug={slug} step={step} resetKey={resetKey} playing={playing} />
          {playing ? <div className="guided-playback-sweep" aria-hidden="true" /> : null}
        </div>
      </section>

      <footer inert={detailsOpen ? true : undefined} className="border-t border-outline bg-surface px-3 py-3 sm:px-6 lg:px-8">
        <div className={`mx-auto flex h-full min-w-0 flex-col justify-between gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 ${contentMax}`}>
          <div className="min-w-0" aria-live="polite">
            <p className="flex min-w-0 items-center gap-2">
              <span className={`shrink-0 font-mono uppercase tracking-label text-primary ${presenting ? "text-sm" : "text-[10px]"}`}>
                Step {step + 1} of {exhibit.steps.length}
              </span>
              <span data-testid="guided-step-title" className={`truncate font-medium text-on-surface ${presenting ? "text-xl" : "text-sm"}`}>
                {current.title}
              </span>
              {playing ? <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-label text-primary lg:inline">Auto-playing</span> : null}
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
            <p className={`mt-1 line-clamp-2 text-on-surface sm:line-clamp-1 ${presenting ? "text-lg leading-7" : "text-sm leading-5"}`}>
              {current.instruction}
            </p>
            <p className={`mt-0.5 line-clamp-2 text-on-surface-variant sm:line-clamp-1 ${presenting ? "text-base leading-6" : "text-xs leading-4"}`}>
              {current.observation}
            </p>
          </div>

          <div data-exhibit-controls className="grid shrink-0 grid-cols-[40px_64px_40px_40px_40px_minmax(80px,1fr)] gap-1.5 sm:flex sm:items-center sm:gap-2">
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
              onClick={togglePlayback}
              className={`inline-flex h-11 items-center justify-center border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${playing ? "border-primary bg-primary text-on-primary" : "border-outline bg-background hover:border-primary hover:text-primary"}`}
              aria-label={playbackLabel}
              aria-pressed={playing}
              title={playbackLabel}
            >
              {playing ? <Pause size={16} fill="currentColor" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
              <span className="ml-1 text-[9px] sm:hidden">{playing ? "Pause" : finalStep ? "Replay" : "Auto"}</span>
              <span className="ml-1.5 hidden sm:inline">{playing ? "Pause" : finalStep ? "Replay" : "Auto-play"}</span>
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
              onClick={copyExhibitLink}
              className="inline-flex h-11 items-center justify-center border border-outline bg-background px-3 text-sm transition-colors hover:border-primary hover:text-primary"
              aria-label={copied ? "Exhibit link copied" : "Copy exhibit link"}
              title={copied ? "Copied" : "Copy exhibit link"}
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            </button>
            <button
              type="button"
              disabled={finalStep}
              aria-label={finalStep ? "Guided walkthrough complete" : undefined}
              onClick={() => { setPlaying(false); chooseStep(step + 1); }}
              className="inline-flex h-11 items-center justify-center border border-accent bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-35"
            >
              {finalStep ? "Complete" : "Next"}
              {finalStep ? null : <ChevronRight className="ml-1" size={17} aria-hidden="true" />}
            </button>
          </div>
          <span className="sr-only" aria-live="polite">{copied ? "Exhibit link copied to the clipboard." : ""}</span>
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
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">What is simplified</p>
              <ul className="mt-3 space-y-2 border-l-2 border-outline pl-4 text-sm leading-6 text-on-surface-variant">
                {exhibit.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">References</p>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {exhibit.references.map((reference) =>
                  reference.href ? (
                    <li key={reference.label}>
                      <a
                        href={reference.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline decoration-outline underline-offset-2 hover:decoration-primary"
                      >
                        {reference.label}
                      </a>
                    </li>
                  ) : (
                    <li key={reference.label} className="text-on-surface-variant">{reference.label}</li>
                  ),
                )}
              </ul>
            </div>
            {slug === "gradient-descent" && relatedExhibits.length > 0 ? (
              <GradientDescentNextConcepts exhibits={relatedExhibits} />
            ) : relatedExhibits.length > 0 ? (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Related ideas</p>
                <ul className="mt-3 divide-y divide-outline border-y border-outline">
                  {relatedExhibits.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/visualisations/${item.slug}`} className="group/related flex items-center justify-between gap-3 py-3 text-sm text-on-surface transition-colors hover:text-primary">
                        <span>
                          <span className="font-medium">{item.title}</span>
                          <span className="mt-0.5 block text-xs text-on-surface-variant">{item.topic}</span>
                        </span>
                        <ChevronRight size={15} className="shrink-0 transition-transform group-hover/related:translate-x-1" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Link href={`/concepts?focus=${slug}`} className="mt-7 flex min-h-12 items-center justify-between gap-4 border border-outline bg-background px-4 text-sm text-on-surface transition-colors hover:border-primary hover:text-primary">
              <span>
                <span className="font-medium">Locate this idea in the concept map</span>
                <span className="mt-0.5 block text-xs text-on-surface-variant">Follow a question to a neighbouring exhibit.</span>
              </span>
              <Share2 size={17} className="shrink-0" aria-hidden="true" />
            </Link>
            <button type="button" onClick={closeDetails} className="mt-7 inline-flex min-h-11 w-full items-center justify-center border border-primary bg-primary px-4 text-sm font-medium text-on-primary">Return to visualisation</button>
          </aside>
        </div>
      ) : null}
    </article>
    </PresentModeProvider>
  );
}
