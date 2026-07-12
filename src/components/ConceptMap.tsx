"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import type { ConceptEdge, ConceptMapData } from "@/lib/conceptMap";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ConceptMapProps {
  data: ConceptMapData;
  /** Compact homepage variant: fixed height, internal scroll, no toolbar. */
  embed?: boolean;
}

const ANCESTOR_COLOR = "var(--color-accent)";
const DESCENDANT_COLOR = "var(--color-primary)";

function edgePath(a: Box, b: Box): string {
  const sx = a.x + a.w / 2;
  const sy = a.y + a.h;
  const tx = b.x + b.w / 2;
  const ty = b.y;
  if (ty - sy >= 12) {
    const dy = (ty - sy) / 2;
    return `M ${sx} ${sy} C ${sx} ${sy + dy}, ${tx} ${ty - dy}, ${tx} ${ty}`;
  }
  // Same row or target above (grid wrap): connect the facing side edges.
  const x1 = a.x <= b.x ? a.x + a.w : a.x;
  const x2 = a.x <= b.x ? b.x : b.x + b.w;
  const y1 = a.y + a.h / 2;
  const y2 = b.y + b.h / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

export default function ConceptMap({ data, embed = false }: ConceptMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [boxes, setBoxes] = useState<Map<string, Box>>(new Map());
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const next = new Map<string, Box>();
    for (const [id, el] of nodeRefs.current) {
      const rect = el.getBoundingClientRect();
      next.set(id, {
        x: rect.left - wrapRect.left,
        y: rect.top - wrapRect.top,
        w: rect.width,
        h: rect.height,
      });
    }
    setBoxes(next);
    setSize({ w: wrapRect.width, h: wrapRect.height });
  }, []);

  useEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const { ancestorsOf, descendantsOf, stageOfNode } = useMemo(() => {
    const parents = new Map<string, string[]>();
    const children = new Map<string, string[]>();
    for (const edge of data.edges) {
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
    const stageOfNode = new Map<string, string>();
    for (const group of data.stages) {
      for (const node of group.nodes) stageOfNode.set(node.id, group.id);
    }
    return {
      ancestorsOf: (id: string) => closure(id, parents),
      descendantsOf: (id: string) => closure(id, children),
      stageOfNode,
    };
  }, [data]);

  const highlight = useMemo(() => {
    if (!activeId) return null;
    return {
      lineage: new Set([activeId, ...ancestorsOf(activeId)]),
      unlocked: new Set([activeId, ...descendantsOf(activeId)]),
    };
  }, [activeId, ancestorsOf, descendantsOf]);

  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (title: string) =>
    normalizedQuery === "" || title.toLowerCase().includes(normalizedQuery);

  const isNodeLit = (id: string, title: string) => {
    if (highlight) {
      return highlight.lineage.has(id) || highlight.unlocked.has(id);
    }
    return matchesQuery(title);
  };

  const edgeState = (edge: ConceptEdge): "ancestor" | "descendant" | "base" | "hidden" => {
    if (highlight) {
      if (highlight.lineage.has(edge.from) && highlight.lineage.has(edge.to)) {
        return "ancestor";
      }
      if (highlight.unlocked.has(edge.from) && highlight.unlocked.has(edge.to)) {
        return "descendant";
      }
      return "hidden";
    }
    // Calm default: only short, same-stage edges.
    return stageOfNode.get(edge.from) === stageOfNode.get(edge.to)
      ? "base"
      : "hidden";
  };

  const content = (
    <div ref={wrapRef} className="relative" onMouseLeave={() => setActiveId(null)}>
      <svg
        width={size.w}
        height={size.h}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {data.edges.map((edge) => {
          const from = boxes.get(edge.from);
          const to = boxes.get(edge.to);
          if (!from || !to) return null;
          const state = edgeState(edge);
          if (state === "hidden" && highlight) return null;
          const stroke =
            state === "ancestor"
              ? ANCESTOR_COLOR
              : state === "descendant"
                ? DESCENDANT_COLOR
                : "var(--color-outline-dark)";
          return (
            <path
              key={`${edge.from}-${edge.to}`}
              d={edgePath(from, to)}
              fill="none"
              stroke={stroke}
              strokeWidth={state === "base" ? 1 : 1.8}
              opacity={state === "base" ? 0.35 : 0.95}
            />
          );
        })}
      </svg>

      <div className={embed ? "flex flex-col gap-7 p-5" : "flex flex-col gap-10"}>
        {data.stages.map((stage) => (
          <section key={stage.id} id={embed ? undefined : `stage-${stage.id}`}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className="inline-block h-2.5 w-2.5 self-center"
                style={{ backgroundColor: stage.color }}
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Stage {stage.numeral}
              </span>
              <h3 className="font-headline text-lg font-medium text-on-surface sm:text-xl">
                {stage.title}
              </h3>
              <span className="font-mono text-[11px] text-on-surface-variant">
                {stage.nodes.length} modules
              </span>
              {!embed && (
                <p className="hidden w-full text-[13px] font-medium leading-6 text-on-surface-variant sm:block sm:w-auto sm:flex-1 sm:basis-full">
                  {stage.blurb}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {stage.nodes.map((node) => {
                const lit = isNodeLit(node.id, node.title);
                return (
                  <Link
                    key={node.id}
                    href={`/algorithms/${node.id}`}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(node.id, el);
                      else nodeRefs.current.delete(node.id);
                    }}
                    onMouseEnter={() => setActiveId(node.id)}
                    onFocus={() => setActiveId(node.id)}
                    onBlur={() => setActiveId(null)}
                    className={`relative flex min-h-[64px] flex-col justify-between gap-1.5 border border-outline bg-surface px-3 py-2.5 transition-[opacity,border-color] duration-150 hover:border-outline-dark ${
                      lit ? "opacity-100" : "opacity-30"
                    } ${node.id === activeId ? "z-10 border-outline-dark shadow-sm" : ""}`}
                    style={{ borderLeft: `3px solid ${stage.color}` }}
                  >
                    <span className="line-clamp-2 text-[12.5px] font-medium leading-snug text-on-surface">
                      {node.title}
                    </span>
                    <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">
                      <span>{node.unlocks > 0 ? `unlocks ${node.unlocks}` : ""}</span>
                      {node.hasLab && (
                        <span
                          className="border px-1 py-px"
                          style={{ borderColor: stage.color, color: stage.color }}
                        >
                          lab
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );

  if (embed) {
    return (
      <div className="relative">
        <div className="h-[540px] overflow-y-auto border border-outline bg-surface-container-lowest">
          {content}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface-dim to-transparent"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {data.stages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() =>
                document
                  .getElementById(`stage-${stage.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="inline-flex items-center gap-2 border border-outline bg-surface px-2.5 py-1.5 text-[12px] font-medium text-on-surface-variant hover:border-outline-dark hover:text-on-surface"
            >
              <span
                className="h-2 w-2"
                style={{ backgroundColor: stage.color }}
                aria-hidden="true"
              />
              {stage.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-px w-5"
              style={{ backgroundColor: "var(--color-accent)" }}
              aria-hidden="true"
            />
            builds on
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-px w-5"
              style={{ backgroundColor: "var(--color-primary)" }}
              aria-hidden="true"
            />
            unlocks
          </span>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter topics…"
          aria-label="Filter topics"
          className="ml-auto w-full max-w-[220px] border border-outline bg-surface px-3 py-1.5 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:border-outline-dark focus:outline-none"
        />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
        Hover a topic to trace what it builds on and what it unlocks · click to open the lesson
      </p>

      {content}
    </div>
  );
}
