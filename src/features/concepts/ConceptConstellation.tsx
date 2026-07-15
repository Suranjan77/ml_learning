"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, LocateFixed } from "lucide-react";
import {
  conceptNodes,
  conceptRelations,
  conceptSlugs,
  otherConcept,
  relationLabels,
  relationsFor,
  type ConceptNode,
  type ConceptRelation,
  type ConceptRelationKind,
  type ConceptSlug,
} from "./constellation";

export interface ConceptMapExhibit {
  slug: ConceptSlug;
  title: string;
  question: string;
  summary: string;
  topic: string;
}

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 720;

const relationStyles: Record<ConceptRelationKind, { colour: string; dash?: string }> = {
  "builds-on": { colour: "var(--color-primary)" },
  explains: { colour: "var(--color-primary)" },
  "provides-gradient-for": { colour: "var(--color-accent)" },
  optimises: { colour: "var(--color-accent)" },
  "changes-representation": { colour: "var(--color-warning)" },
  "contrasts-with": { colour: "var(--color-secondary)", dash: "7 6" },
  "another-failure-mode": { colour: "var(--color-error)", dash: "2 7" },
};

function pathFor(relation: ConceptRelation) {
  const from = conceptNodes.find((node) => node.slug === relation.from)!;
  const to = conceptNodes.find((node) => node.slug === relation.to)!;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / length;
  const uy = dy / length;
  const padding = 82;
  const start = { x: from.x + ux * padding, y: from.y + uy * 30 };
  const end = { x: to.x - ux * padding, y: to.y - uy * 30 };
  const bend = relation.bend ?? 0;
  const nx = -uy;
  const ny = ux;
  const first = { x: start.x + (end.x - start.x) * 0.34 + nx * bend, y: start.y + (end.y - start.y) * 0.34 + ny * bend };
  const second = { x: start.x + (end.x - start.x) * 0.66 + nx * bend, y: start.y + (end.y - start.y) * 0.66 + ny * bend };
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} C ${first.x.toFixed(2)} ${first.y.toFixed(2)}, ${second.x.toFixed(2)} ${second.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function isDirected(kind: ConceptRelationKind) {
  return kind !== "contrasts-with" && kind !== "another-failure-mode";
}

function directionalNeighbour(current: ConceptNode, key: string) {
  const candidates = conceptNodes.filter((candidate) => {
    if (candidate.slug === current.slug) return false;
    if (key === "ArrowLeft") return candidate.x < current.x - 8;
    if (key === "ArrowRight") return candidate.x > current.x + 8;
    if (key === "ArrowUp") return candidate.y < current.y - 8;
    return candidate.y > current.y + 8;
  });

  return candidates.sort((first, second) => {
    const score = (node: ConceptNode) => {
      const dx = Math.abs(node.x - current.x);
      const dy = Math.abs(node.y - current.y);
      return key === "ArrowLeft" || key === "ArrowRight" ? dx + dy * 0.8 : dy + dx * 0.8;
    };
    return score(first) - score(second);
  })[0];
}

export function ConceptConstellation({ exhibits }: { exhibits: readonly ConceptMapExhibit[] }) {
  const [selectedSlug, setSelectedSlug] = useState<ConceptSlug>("gradient-descent");
  const nodeRefs = useRef(new Map<ConceptSlug, HTMLButtonElement>());
  const exhibitBySlug = useMemo(() => new Map(exhibits.map((exhibit) => [exhibit.slug, exhibit])), [exhibits]);
  const selected = exhibitBySlug.get(selectedSlug)!;
  const selectedRelations = relationsFor(selectedSlug);

  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (focus && conceptSlugs.includes(focus as ConceptSlug)) setSelectedSlug(focus as ConceptSlug);
  }, []);

  function selectConcept(slug: ConceptSlug, updateAddress = true) {
    setSelectedSlug(slug);
    if (!updateAddress) return;
    const url = new URL(window.location.href);
    if (slug === "gradient-descent") url.searchParams.delete("focus");
    else url.searchParams.set("focus", slug);
    window.history.replaceState({}, "", url);
  }

  function handleNodeKeyDown(event: KeyboardEvent<HTMLButtonElement>, node: ConceptNode) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const neighbour = directionalNeighbour(node, event.key);
    if (!neighbour) return;
    event.preventDefault();
    selectConcept(neighbour.slug);
    nodeRefs.current.get(neighbour.slug)?.focus();
  }

  return (
    <div data-testid="concept-constellation">
      <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">
              Select a concept · arrow keys move spatially
            </p>
            <RelationLegend />
          </div>
          <div
            role="group"
            aria-label="Authored map of thirteen machine-learning concepts. Select a concept to inspect the questions connecting it to its neighbours."
            className="relative aspect-[5/3] min-h-[32rem] overflow-hidden border border-outline-dark bg-surface"
          >
            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                {Object.entries(relationStyles).map(([kind, style]) => (
                  <marker key={kind} id={`concept-arrow-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={style.colour} />
                  </marker>
                ))}
              </defs>
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--color-surface)" />
              <g fill="none" stroke="var(--color-outline)" strokeWidth="1">
                <path d="M600 18V702" /><path d="M18 350H1182" />
              </g>
              <g fill="var(--color-on-surface-variant)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.6" opacity="0.75">
                <text x="30" y="34">REPRESENT EVIDENCE</text>
                <text x="1170" y="34" textAnchor="end">MAKE A CHOICE</text>
                <text x="30" y="690">IMPROVE A MODEL</text>
                <text x="1170" y="690" textAnchor="end">CHECK HOW IT FAILS</text>
              </g>
              {conceptRelations.map((relation) => {
                const style = relationStyles[relation.kind];
                const active = relation.from === selectedSlug || relation.to === selectedSlug;
                return (
                  <path
                    key={`${relation.from}-${relation.to}`}
                    d={pathFor(relation)}
                    fill="none"
                    stroke={style.colour}
                    strokeWidth={active ? 3.2 : 1.25}
                    strokeDasharray={style.dash}
                    strokeLinecap="round"
                    opacity={active ? 0.92 : 0.22}
                    markerEnd={isDirected(relation.kind) ? `url(#concept-arrow-${relation.kind})` : undefined}
                  />
                );
              })}
            </svg>

            {conceptNodes.map((node) => {
              const exhibit = exhibitBySlug.get(node.slug)!;
              const active = node.slug === selectedSlug;
              const connected = selectedRelations.some((relation) => relation.from === node.slug || relation.to === node.slug);
              return (
                <button
                  key={node.slug}
                  ref={(element) => {
                    if (element) nodeRefs.current.set(node.slug, element);
                    else nodeRefs.current.delete(node.slug);
                  }}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectConcept(node.slug)}
                  onKeyDown={(event) => handleNodeKeyDown(event, node)}
                  className={`absolute flex min-h-[3.25rem] w-[14%] min-w-[7.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-start justify-center border px-3 py-2 text-left transition-[border-color,background-color,opacity,transform] ${active ? "z-20 scale-[1.04] border-primary bg-primary text-on-primary" : connected ? "z-10 border-outline-dark bg-surface text-on-surface hover:border-primary" : "border-outline bg-surface text-on-surface opacity-80 hover:border-primary hover:opacity-100"}`}
                  style={{ left: `${(node.x / MAP_WIDTH * 100).toFixed(3)}%`, top: `${(node.y / MAP_HEIGHT * 100).toFixed(3)}%` }}
                >
                  <span className={`font-mono text-[8px] uppercase tracking-[0.08em] ${active ? "text-on-primary/75" : "text-on-surface-variant"}`}>{exhibit.topic}</span>
                  <span className="mt-0.5 text-[12px] font-medium leading-tight xl:text-[13px]">{exhibit.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ConceptFocusPanel
          selected={selected}
          selectedSlug={selectedSlug}
          relations={selectedRelations}
          exhibitBySlug={exhibitBySlug}
          onSelect={selectConcept}
        />
      </div>

      <div className="lg:hidden">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-label text-on-surface-variant">
          One-hop lens · choose a question to recenter
        </p>
        <ConceptFocusPanel
          selected={selected}
          selectedSlug={selectedSlug}
          relations={selectedRelations}
          exhibitBySlug={exhibitBySlug}
          onSelect={selectConcept}
          compact
        />
        <div className="mt-5 border border-outline bg-surface p-4">
          <p className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">All thirteen concepts</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {conceptNodes.map((node) => (
              <button
                key={node.slug}
                type="button"
                aria-pressed={node.slug === selectedSlug}
                onClick={() => selectConcept(node.slug)}
                className={`min-h-10 border px-3 text-left text-xs ${node.slug === selectedSlug ? "border-primary bg-primary text-on-primary" : "border-outline bg-background text-on-surface hover:border-primary"}`}
              >
                {exhibitBySlug.get(node.slug)!.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConceptFocusPanel({
  selected,
  selectedSlug,
  relations,
  exhibitBySlug,
  onSelect,
  compact = false,
}: {
  selected: ConceptMapExhibit;
  selectedSlug: ConceptSlug;
  relations: readonly ConceptRelation[];
  exhibitBySlug: ReadonlyMap<ConceptSlug, ConceptMapExhibit>;
  onSelect: (slug: ConceptSlug) => void;
  compact?: boolean;
}) {
  return (
    <aside aria-live="polite" className={`border border-outline-dark bg-surface ${compact ? "p-4 sm:p-5" : "self-start p-5 xl:p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-label text-primary">You are here</p>
          <h2 className="mt-2 font-headline text-2xl font-medium leading-tight text-on-surface">{selected.title}</h2>
        </div>
        <LocateFixed size={19} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-on-surface">{selected.question}</p>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{selected.summary}</p>
      <Link href={`/visualisations/${selected.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 border border-accent bg-accent px-4 text-sm font-medium text-on-accent hover:border-accent-hover hover:bg-accent-hover">
        Open visualisation <ArrowRight size={15} aria-hidden="true" />
      </Link>

      <div className="mt-6 border-t border-outline pt-4">
        <p className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">
          {relations.length} connecting {relations.length === 1 ? "question" : "questions"}
        </p>
        <ul className="mt-2 divide-y divide-outline">
          {relations.map((relation) => {
            const neighbourSlug = otherConcept(relation, selectedSlug);
            const neighbour = exhibitBySlug.get(neighbourSlug)!;
            return (
              <li key={`${relation.from}-${relation.to}`}>
                <button type="button" onClick={() => onSelect(neighbourSlug)} className="group w-full py-3 text-left">
                  <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.08em] text-on-surface-variant">
                    <span className="h-px w-4" style={{ background: relationStyles[relation.kind].colour }} />
                    {relationLabels[relation.kind]}
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-5 text-on-surface group-hover:text-primary">{relation.question}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{relation.explanation}</span>
                  <span className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-label text-primary">
                    Recenter on {neighbour.title} <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function RelationLegend() {
  return (
    <div aria-label="Relationship line legend" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 font-mono text-[8px] uppercase tracking-[0.08em] text-on-surface-variant">
      <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-primary" /> Explains or enables</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-warning" /> Changes representation</span>
      <span className="inline-flex items-center gap-1.5"><span className="w-5 border-t border-dashed border-secondary" /> Contrast</span>
      <span className="inline-flex items-center gap-1.5"><span className="w-5 border-t-2 border-dotted border-error" /> Failure mode</span>
    </div>
  );
}
