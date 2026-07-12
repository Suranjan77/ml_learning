import { algorithmsList } from "@/data/algorithms_content";
import { labs } from "@/lib/labs";
import { STAGES, stageOf, type StageDef, type StageId } from "@/lib/stages";

export interface ConceptNode {
  id: string;
  title: string;
  stage: StageId;
  /** Longest prerequisite-chain length — used only for ordering. */
  depth: number;
  /** Number of modules that list this one as a direct prerequisite. */
  unlocks: number;
  /** True when an interactive lab links to this module as its theory. */
  hasLab: boolean;
}

export interface ConceptEdge {
  from: string;
  to: string;
}

export interface ConceptStageGroup extends StageDef {
  nodes: ConceptNode[];
}

export interface ConceptMapData {
  stages: ConceptStageGroup[];
  edges: ConceptEdge[];
}

/**
 * Builds the concept map as five ordered stage groups plus the prerequisite
 * edge list. Geometry is intentionally absent: the client component lays
 * nodes out with responsive CSS grid and measures real positions to draw
 * edges, so the map reflows instead of scrolling sideways.
 */
export function buildConceptMap(): ConceptMapData {
  const byId = new Map(algorithmsList.map((mod) => [mod.id, mod]));

  const edges: ConceptEdge[] = [];
  const dependents = new Map<string, number>();
  for (const mod of algorithmsList) {
    for (const prereq of mod.prerequisites ?? []) {
      if (!byId.has(prereq)) continue;
      edges.push({ from: prereq, to: mod.id });
      dependents.set(prereq, (dependents.get(prereq) ?? 0) + 1);
    }
  }

  // Longest-path depth from the roots (content tests forbid cycles; the
  // seen-set guard keeps this total even if one slips through).
  const depths = new Map<string, number>();
  const resolveDepth = (id: string, seen: Set<string>): number => {
    const known = depths.get(id);
    if (known !== undefined) return known;
    if (seen.has(id)) return 0;
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
  for (const mod of algorithmsList) resolveDepth(mod.id, new Set());

  const labModuleIds = new Set(
    labs
      .map((lab) => lab.theoryHref?.replace(/^\/algorithms\//, ""))
      .filter((id): id is string => Boolean(id)),
  );

  const groups = new Map<StageId, ConceptNode[]>(
    STAGES.map((stage) => [stage.id, []]),
  );
  for (const mod of algorithmsList) {
    const stage = stageOf(mod.id, mod.tracks);
    groups.get(stage)!.push({
      id: mod.id,
      title: mod.title,
      stage,
      depth: depths.get(mod.id) ?? 0,
      unlocks: dependents.get(mod.id) ?? 0,
      hasLab: labModuleIds.has(mod.id),
    });
  }

  const stages: ConceptStageGroup[] = STAGES.map((stage) => ({
    ...stage,
    nodes: groups
      .get(stage.id)!
      .sort(
        (a, b) => a.depth - b.depth || a.title.localeCompare(b.title),
      ),
  })).filter((group) => group.nodes.length > 0);

  return { stages, edges };
}
