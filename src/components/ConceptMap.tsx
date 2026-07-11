"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  ConceptMapEdge,
  ConceptMapLayout,
  ConceptMapNode,
} from "@/lib/conceptMap";

const trackStyles: Record<
  string,
  { node: string; active: string; swatch: string; label: string }
> = {
  practitioner: {
    node: "border-primary/40 bg-primary/10 text-on-surface",
    active: "border-primary bg-primary/20",
    swatch: "bg-primary",
    label: "ML Practitioner",
  },
  "modern-ai": {
    node: "border-secondary/40 bg-secondary/10 text-on-surface",
    active: "border-secondary bg-secondary/20",
    swatch: "bg-secondary",
    label: "Deep Learning",
  },
  "computer-vision": {
    node: "border-tertiary/40 bg-tertiary/10 text-on-surface",
    active: "border-tertiary bg-tertiary/20",
    swatch: "bg-tertiary",
    label: "Computer Vision",
  },
};

const fallbackStyle = {
  node: "border-outline bg-surface-container text-on-surface",
  active: "border-outline-dark bg-surface-container-high",
  swatch: "bg-outline-dark",
  label: "General",
};

function styleFor(node: Pick<ConceptMapNode, "track">) {
  return (node.track && trackStyles[node.track]) || fallbackStyle;
}

interface ConceptMapProps {
  layout: ConceptMapLayout;
}

export default function ConceptMap({ layout }: ConceptMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { ancestorsOf, descendantsOf } = useMemo(() => {
    const parents = new Map<string, string[]>();
    const children = new Map<string, string[]>();
    for (const edge of layout.edges) {
      parents.set(edge.to, [...(parents.get(edge.to) ?? []), edge.from]);
      children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to]);
    }
    const closure = (start: string, next: Map<string, string[]>) => {
      const result = new Set<string>();
      const queue = [...(next.get(start) ?? [])];
      while (queue.length > 0) {
        const id = queue.pop()!;
        if (result.has(id)) continue;
        result.add(id);
        queue.push(...(next.get(id) ?? []));
      }
      return result;
    };
    return {
      ancestorsOf: (id: string) => closure(id, parents),
      descendantsOf: (id: string) => closure(id, children),
    };
  }, [layout.edges]);

  const highlight = useMemo(() => {
    if (!activeId) return null;
    return {
      ancestors: ancestorsOf(activeId),
      descendants: descendantsOf(activeId),
    };
  }, [activeId, ancestorsOf, descendantsOf]);

  const isNodeLit = (id: string) =>
    !highlight ||
    id === activeId ||
    highlight.ancestors.has(id) ||
    highlight.descendants.has(id);

  const isEdgeLit = (edge: ConceptMapEdge) => {
    if (!highlight || !activeId) return false;
    const lineage = new Set([activeId, ...highlight.ancestors]);
    const unlocks = new Set([activeId, ...highlight.descendants]);
    return (
      (lineage.has(edge.from) && lineage.has(edge.to)) ||
      (unlocks.has(edge.from) && unlocks.has(edge.to))
    );
  };

  const nodeById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout.nodes],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-on-surface-variant">
        {Object.values(trackStyles).map((style) => (
          <span key={style.label} className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 ${style.swatch}`} />
            {style.label}
          </span>
        ))}
        <span className="text-on-surface-variant/70">
          Hover a topic to trace what it builds on and what it unlocks · click
          to open the lesson
        </span>
      </div>

      <div className="overflow-x-auto border border-outline bg-surface-container-lowest">
        <div
          className="relative"
          style={{ width: layout.width, height: layout.height }}
          onMouseLeave={() => setActiveId(null)}
        >
          <svg
            width={layout.width}
            height={layout.height}
            className="absolute inset-0"
            aria-hidden="true"
          >
            {layout.edges.map((edge) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) return null;
              const x1 = from.x + layout.nodeWidth;
              const y1 = from.y + layout.nodeHeight / 2;
              const x2 = to.x;
              const y2 = to.y + layout.nodeHeight / 2;
              const bend = Math.max(32, (x2 - x1) / 2);
              const lit = isEdgeLit(edge);
              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={lit ? "var(--color-primary)" : "var(--color-outline)"}
                  strokeWidth={lit ? 2 : 1}
                  opacity={highlight && !lit ? 0.25 : 1}
                />
              );
            })}
          </svg>

          {layout.nodes.map((node) => {
            const style = styleFor(node);
            const lit = isNodeLit(node.id);
            return (
              <Link
                key={node.id}
                href={`/algorithms/${node.id}`}
                onMouseEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                onBlur={() => setActiveId(null)}
                className={`absolute flex items-center border px-3 py-2 text-[12px] font-medium leading-4 transition-opacity duration-150 hover:z-10 ${style.node} ${
                  node.id === activeId ? `z-10 ${style.active}` : ""
                } ${lit ? "opacity-100" : "opacity-30"}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: layout.nodeWidth,
                  height: layout.nodeHeight,
                }}
              >
                <span className="line-clamp-2">{node.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {layout.isolated.length > 0 && (
        <div className="border border-outline bg-surface-container-low p-5">
          <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Standalone topics &amp; synthesis reviews
          </p>
          <div className="flex flex-wrap gap-2">
            {layout.isolated.map((node) => {
              const style = styleFor(node);
              return (
                <Link
                  key={node.id}
                  href={`/algorithms/${node.id}`}
                  className={`border px-3 py-2 text-[12px] font-medium transition-colors hover:border-primary ${style.node}`}
                >
                  {node.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
