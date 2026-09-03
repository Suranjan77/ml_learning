"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  conceptNodes,
  conceptRelations,
  otherConcept,
  relationLabels,
  type ConceptRelation,
  type ConceptRelationKind,
  type ConceptSlug,
} from "@/features/concepts/constellation";

export interface HomeConceptExhibit {
  slug: string;
  title: string;
  question: string;
  topic: string;
}

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 720;
const ROOT_CONCEPT: ConceptSlug = "gradient-descent";

const relationStyles: Record<ConceptRelationKind, { colour: string; dash?: string }> = {
  "builds-on": { colour: "var(--color-inverse-primary)" },
  explains: { colour: "var(--color-inverse-primary)" },
  "provides-gradient-for": { colour: "var(--color-accent)" },
  optimises: { colour: "var(--color-accent)" },
  "changes-representation": { colour: "var(--color-warning)" },
  "contrasts-with": { colour: "var(--color-secondary-fixed)", dash: "8 7" },
  "another-failure-mode": { colour: "var(--color-error)", dash: "3 8" },
};

const shortNodeLabels: Record<ConceptSlug, string> = {
  pca: "PCA",
  "cnn-feature-maps": "CNN maps",
  attention: "Attention",
  "token-sampling": "Sampling",
  "kernel-trick": "Kernel",
  "regression-boundary": "Parameters",
  "decision-tree": "Tree",
  "k-means": "K-means",
  backpropagation: "Backprop",
  "gradient-descent": "Gradient",
  overfitting: "Overfitting",
  "genetic-algorithm": "Genetic",
  "particle-swarm": "Swarm",
};

// Nodes are HTML positioned by percentage, so the edge layer has to use the
// same mapping. The homepage field is a wide flat band rather than the 5:3 of
// the full concept map, so the SVG stretches with preserveAspectRatio="none"
// and every endpoint goes through the identical clamp the nodes use. Without
// this the edges letterbox into the middle 47% of the width and never reach a
// box. See docs/ux-improvement-plan.md.
function clampPercent(value: number, total: number) {
  return Math.max(9, Math.min(91, value / total * 100));
}

function anchor(node: { x: number; y: number }) {
  return {
    x: clampPercent(node.x, MAP_WIDTH) / 100 * MAP_WIDTH,
    y: clampPercent(node.y, MAP_HEIGHT) / 100 * MAP_HEIGHT,
  };
}

function pathFor(relation: ConceptRelation) {
  const from = anchor(conceptNodes.find((node) => node.slug === relation.from)!);
  const to = anchor(conceptNodes.find((node) => node.slug === relation.to)!);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const bend = relation.bend ?? 0;
  const controlX = (from.x + to.x) / 2 + normalX * bend;
  const controlY = (from.y + to.y) / 2 + normalY * bend;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

function nodePosition(value: number, total: number) {
  return `${clampPercent(value, total).toFixed(3)}%`;
}

function RelationItem({
  relation,
  activeSlug,
  exhibitBySlug,
  onSelect,
  className = "",
}: {
  relation: ConceptRelation;
  activeSlug: ConceptSlug;
  exhibitBySlug: ReadonlyMap<string, HomeConceptExhibit>;
  onSelect: (slug: ConceptSlug) => void;
  className?: string;
}) {
  const neighbourSlug = otherConcept(relation, activeSlug);
  const neighbour = exhibitBySlug.get(neighbourSlug)!;

  return (
    <li className={`bg-on-surface ${className}`}>
      <button
        type="button"
        onClick={() => onSelect(neighbourSlug)}
        className="group flex h-full min-h-[6.5rem] w-full flex-col items-start p-3 text-left hover:bg-background/[0.045] focus-visible:z-10 sm:p-4"
      >
        <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-background/50">
          <span
            className="h-0.5 w-5 shrink-0"
            style={{ backgroundColor: relationStyles[relation.kind].colour }}
            aria-hidden="true"
          />
          {relationLabels[relation.kind]} · {neighbour.title}
        </span>
        <span className="mt-2 block text-sm font-medium leading-5 text-background transition-colors group-hover:text-inverse-primary">
          {relation.question}
        </span>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-inverse-primary">
          Recenter <ArrowRight size={12} aria-hidden="true" />
        </span>
      </button>
    </li>
  );
}

export function HomeConceptField({ exhibits }: { exhibits: readonly HomeConceptExhibit[] }) {
  const [selectedSlug, setSelectedSlug] = useState<ConceptSlug>(ROOT_CONCEPT);
  const fieldRef = useRef<HTMLElement>(null);
  const exhibitBySlug = useMemo(
    () => new Map(exhibits.map((exhibit) => [exhibit.slug, exhibit])),
    [exhibits],
  );
  const availableNodes = useMemo(
    () => conceptNodes.filter((node) => exhibitBySlug.has(node.slug)),
    [exhibitBySlug],
  );
  const availableRelations = useMemo(
    () => conceptRelations.filter(
      (relation) => exhibitBySlug.has(relation.from) && exhibitBySlug.has(relation.to),
    ),
    [exhibitBySlug],
  );
  const selected = exhibitBySlug.get(selectedSlug) ?? exhibitBySlug.get(ROOT_CONCEPT) ?? exhibits[0];
  const activeSlug = selected?.slug as ConceptSlug | undefined;
  const activeRelations = useMemo(
    () => activeSlug
      ? availableRelations.filter((relation) => relation.from === activeSlug || relation.to === activeSlug)
      : [],
    [activeSlug, availableRelations],
  );
  const connectedSlugs = useMemo(
    () => new Set(activeSlug ? activeRelations.map((relation) => otherConcept(relation, activeSlug)) : []),
    [activeRelations, activeSlug],
  );

  if (!selected || !activeSlug) return null;

  function select(slug: ConceptSlug) {
    setSelectedSlug(slug);
  }

  function resetToRoot() {
    setSelectedSlug(ROOT_CONCEPT);
    requestAnimationFrame(() => {
      const rootButtons = fieldRef.current?.querySelectorAll<HTMLButtonElement>(`[data-concept-slug="${ROOT_CONCEPT}"]`);
      const visibleRoot = Array.from(rootButtons ?? []).find((button) => button.offsetParent !== null);
      visibleRoot?.focus({ preventScroll: true });
    });
  }

  return (
    <section
      ref={fieldRef}
      aria-label="A focus-driven field of connected machine-learning visualisations"
      className="overflow-hidden border border-background/25 bg-on-surface text-background"
      data-testid="home-concept-field"
    >
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-b border-background/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.13em] text-background/55">
        <span>A one-hop lens · starting from Gradient Descent</span>
        {activeSlug === ROOT_CONCEPT ? (
          <span>{activeRelations.length} questions in view</span>
        ) : (
          <button
            type="button"
            onClick={resetToRoot}
            className="border-b border-background/35 py-1 text-background hover:border-inverse-primary hover:text-inverse-primary"
          >
            Return to Gradient Descent
          </button>
        )}
      </div>

      <ConceptMap
        availableNodes={availableNodes}
        availableRelations={availableRelations}
        activeSlug={activeSlug}
        connectedSlugs={connectedSlugs}
        exhibitBySlug={exhibitBySlug}
        onSelect={select}
      />

      <div className="border-t border-background/20 bg-background/[0.035] p-4 sm:p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] xl:gap-7">
          <div>
            <div aria-live="polite" aria-atomic="true">
              <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-inverse-primary">
                In focus · {selected.topic}
              </p>
              <h3 className="mt-2 font-headline text-2xl font-medium leading-tight text-background sm:text-3xl">
                {selected.title}
              </h3>
              <p className="mt-3 max-w-xl text-base font-medium leading-6 text-background sm:text-lg sm:leading-7">
                {activeSlug === ROOT_CONCEPT
                  ? `${activeRelations.length} authored questions branch from this optimisation result.`
                  : selected.question}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/visualisations/${activeSlug}`}
                className="group inline-flex min-h-11 items-center gap-2 border border-accent bg-accent px-4 text-sm font-medium text-on-accent hover:border-accent-hover hover:bg-accent-hover"
              >
                Open selected visualisation
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
              </Link>
              <Link
                href={`/concepts?focus=${activeSlug}`}
                className="group inline-flex min-h-11 items-center gap-2 border border-background/35 px-4 text-sm font-medium text-background hover:border-inverse-primary hover:text-inverse-primary"
              >
                Full map · start anywhere
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="border-t border-background/20 pt-4 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-background/55">
              {activeRelations.length} authored {activeRelations.length === 1 ? "question" : "questions"} connect this visualisation
            </p>
            <ul className="mt-2 grid gap-px border border-background/15 bg-background/15 sm:grid-cols-2">
              {activeRelations.map((relation, index) => (
                <RelationItem
                  key={`${relation.from}-${relation.to}`}
                  relation={relation}
                  activeSlug={activeSlug}
                  exhibitBySlug={exhibitBySlug}
                  onSelect={select}
                  className={index > 0 ? "hidden sm:block" : ""}
                />
              ))}
            </ul>
            {activeRelations.length > 1 ? (
              <details className="mt-3 border border-background/20 sm:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 font-mono text-[9px] uppercase tracking-[0.1em] text-inverse-primary">
                  Show {activeRelations.length - 1} more connections
                  <span aria-hidden="true">＋</span>
                </summary>
                <ul className="grid gap-px border-t border-background/15 bg-background/15">
                  {activeRelations.slice(1).map((relation) => (
                    <RelationItem
                      key={`mobile-${relation.from}-${relation.to}`}
                      relation={relation}
                      activeSlug={activeSlug}
                      exhibitBySlug={exhibitBySlug}
                      onSelect={select}
                    />
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConceptMap({
  availableNodes,
  availableRelations,
  activeSlug,
  connectedSlugs,
  exhibitBySlug,
  onSelect,
}: {
  availableNodes: typeof conceptNodes;
  availableRelations: readonly ConceptRelation[];
  activeSlug: ConceptSlug;
  connectedSlugs: ReadonlySet<ConceptSlug>;
  exhibitBySlug: ReadonlyMap<string, HomeConceptExhibit>;
  onSelect: (slug: ConceptSlug) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Concept field. Focus, hover, or select a study to reveal its direct authored connections."
      className="relative bg-background/[0.025]"
    >
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {availableRelations.map((relation) => {
          const active = relation.from === activeSlug || relation.to === activeSlug;
          const style = relationStyles[relation.kind];
          return (
            <path
              key={`${relation.from}-${relation.to}`}
              d={pathFor(relation)}
              fill="none"
              stroke={active ? style.colour : "var(--color-background)"}
              strokeWidth={active ? 3 : 1.25}
              strokeDasharray={style.dash}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity={active ? 0.96 : 0.3}
              className="transition-opacity duration-300 motion-reduce:transition-none"
            />
          );
        })}
      </svg>

      <div className="relative h-[300px] w-full sm:h-[360px] lg:h-auto lg:min-h-[390px]">
        {availableNodes.map((node) => {
          const exhibit = exhibitBySlug.get(node.slug)!;
          const active = node.slug === activeSlug;
          const connected = connectedSlugs.has(node.slug);
          return (
            <button
              key={node.slug}
              type="button"
              aria-label={`${exhibit.title}: ${exhibit.question}`}
              aria-pressed={active}
              data-concept-slug={node.slug}
              onPointerEnter={() => onSelect(node.slug)}
              onFocus={() => onSelect(node.slug)}
              onClick={() => onSelect(node.slug)}
              className={`absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center lg:h-auto transition-[color,background-color,border-color,opacity,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverse-primary motion-reduce:transition-none lg:min-h-12 lg:w-[7.5rem] lg:flex-col lg:items-start lg:border lg:px-2.5 lg:py-2 lg:text-left ${active ? "lg:scale-[1.04] lg:border-accent lg:bg-accent lg:text-on-accent" : connected ? "lg:border-background/55 lg:bg-on-surface lg:text-background lg:opacity-100 lg:hover:border-inverse-primary" : "lg:border-background/28 lg:bg-on-surface lg:text-background/75 lg:opacity-100 lg:hover:border-background/60 lg:hover:text-background lg:focus:text-background"}`}
              style={{ left: nodePosition(node.x, MAP_WIDTH), top: nodePosition(node.y, MAP_HEIGHT) }}
            >
              <span
                aria-hidden="true"
                className={`block border transition-[width,height,background-color,border-color,opacity] duration-200 motion-reduce:transition-none lg:hidden ${active ? "h-4 w-4 border-accent bg-accent" : connected ? "h-3 w-3 border-inverse-primary bg-on-surface" : "h-2.5 w-2.5 border-background/60 bg-on-surface"}`}
              />
              {active || connected ? (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.05em] lg:hidden ${node.y > 590 ? "bottom-8" : "top-8"} ${active ? "text-accent" : "text-background/65"}`}
                >
                  {shortNodeLabels[node.slug]}
                </span>
              ) : null}
              <span className={`hidden font-mono text-[8px] uppercase tracking-[0.09em] lg:block ${active ? "text-on-accent/75" : connected ? "text-background/50" : "text-current"}`}>
                {exhibit.topic}
              </span>
              <span className="mt-1 hidden text-[11px] font-medium leading-tight lg:block">{exhibit.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HomeConceptField;
