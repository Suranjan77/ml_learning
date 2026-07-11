import { algorithmsList } from "@/data/algorithms_content";
import type { TrackId } from "@/data/algorithms_content";

export interface ConceptMapNode {
  id: string;
  title: string;
  track: TrackId | null;
  depth: number;
  x: number;
  y: number;
}

export interface ConceptMapEdge {
  from: string;
  to: string;
}

export interface ConceptMapIsolatedNode {
  id: string;
  title: string;
  track: TrackId | null;
}

export interface ConceptMapLayout {
  nodes: ConceptMapNode[];
  edges: ConceptMapEdge[];
  isolated: ConceptMapIsolatedNode[];
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
}

export const NODE_WIDTH = 176;
export const NODE_HEIGHT = 58;
const COLUMN_GAP = 64;
const ROW_GAP = 18;
const PADDING = 24;

const trackOrder: Record<TrackId, number> = {
  practitioner: 0,
  "modern-ai": 1,
  "computer-vision": 2,
};

function primaryTrack(tracks: TrackId[] | undefined): TrackId | null {
  if (!tracks || tracks.length === 0) return null;
  return [...tracks].sort((a, b) => trackOrder[a] - trackOrder[b])[0];
}

/**
 * Lays out the module prerequisite graph as columns: a module's column is
 * its longest prerequisite chain length, so every arrow points rightward.
 * Modules with no prerequisite links at all (standalone topics and the
 * synthesis reviews) are listed separately instead of floating unconnected.
 */
export function buildConceptMapLayout(): ConceptMapLayout {
  const byId = new Map(algorithmsList.map((mod) => [mod.id, mod]));

  const edges: ConceptMapEdge[] = [];
  const connected = new Set<string>();
  for (const mod of algorithmsList) {
    for (const prereq of mod.prerequisites ?? []) {
      if (!byId.has(prereq)) continue;
      edges.push({ from: prereq, to: mod.id });
      connected.add(prereq);
      connected.add(mod.id);
    }
  }

  const isolated: ConceptMapIsolatedNode[] = algorithmsList
    .filter((mod) => !connected.has(mod.id))
    .map((mod) => ({
      id: mod.id,
      title: mod.title,
      track: primaryTrack(mod.tracks),
    }));

  // Longest-path depth from the roots.
  const depths = new Map<string, number>();
  const resolveDepth = (id: string, seen: Set<string>): number => {
    const known = depths.get(id);
    if (known !== undefined) return known;
    if (seen.has(id)) return 0; // defensive: content tests forbid cycles
    seen.add(id);
    const prereqs = (byId.get(id)?.prerequisites ?? []).filter((p) =>
      byId.has(p),
    );
    const depth =
      prereqs.length === 0
        ? 0
        : Math.max(...prereqs.map((p) => resolveDepth(p, seen))) + 1;
    depths.set(id, depth);
    return depth;
  };

  const graphModules = algorithmsList.filter((mod) => connected.has(mod.id));
  for (const mod of graphModules) resolveDepth(mod.id, new Set());

  const columnCount = Math.max(...[...depths.values()]) + 1;
  const columns: string[][] = Array.from({ length: columnCount }, () => []);
  for (const mod of graphModules) columns[depths.get(mod.id)!].push(mod.id);

  // Order each column left to right: first column by track then title, later
  // columns by the average row of their prerequisites (keeps edges short).
  const rowIndex = new Map<string, number>();
  columns.forEach((column, depth) => {
    const sorted = [...column].sort((a, b) => {
      if (depth > 0) {
        const barycenter = (id: string) => {
          const rows = (byId.get(id)?.prerequisites ?? [])
            .filter((p) => rowIndex.has(p))
            .map((p) => rowIndex.get(p)!);
          return rows.length
            ? rows.reduce((total, row) => total + row, 0) / rows.length
            : Number.MAX_SAFE_INTEGER;
        };
        const diff = barycenter(a) - barycenter(b);
        if (diff !== 0) return diff;
      }
      const trackA = primaryTrack(byId.get(a)?.tracks);
      const trackB = primaryTrack(byId.get(b)?.tracks);
      const orderA = trackA ? trackOrder[trackA] : 99;
      const orderB = trackB ? trackOrder[trackB] : 99;
      if (orderA !== orderB) return orderA - orderB;
      return (byId.get(a)?.title ?? "").localeCompare(byId.get(b)?.title ?? "");
    });
    columns[depth] = sorted;
    sorted.forEach((id, row) => rowIndex.set(id, row));
  });

  const maxRows = Math.max(...columns.map((column) => column.length));
  const columnPitch = NODE_WIDTH + COLUMN_GAP;
  const rowPitch = NODE_HEIGHT + ROW_GAP;
  const width = PADDING * 2 + columnCount * columnPitch - COLUMN_GAP;
  const height = PADDING * 2 + maxRows * rowPitch - ROW_GAP;

  const nodes: ConceptMapNode[] = [];
  columns.forEach((column, depth) => {
    const columnOffset = ((maxRows - column.length) * rowPitch) / 2;
    column.forEach((id, row) => {
      const mod = byId.get(id)!;
      nodes.push({
        id,
        title: mod.title,
        track: primaryTrack(mod.tracks),
        depth,
        x: PADDING + depth * columnPitch,
        y: PADDING + columnOffset + row * rowPitch,
      });
    });
  });

  return {
    nodes,
    edges,
    isolated,
    width,
    height,
    nodeWidth: NODE_WIDTH,
    nodeHeight: NODE_HEIGHT,
  };
}
