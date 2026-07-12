export interface TreePoint { x: number; y: number; label: "A" | "B" }
export interface TreeConfig { depth: 1 | 2 | 3; threshold: number }

export const TREE_POINTS: readonly TreePoint[] = Object.freeze([
  { x: 1.0, y: 1.2, label: "A" }, { x: 2.1, y: 2.4, label: "A" }, { x: 3.2, y: 4.6, label: "A" },
  { x: 1.4, y: 7.2, label: "B" }, { x: 2.7, y: 8.5, label: "B" }, { x: 3.7, y: 6.7, label: "B" },
  { x: 4.8, y: 1.0, label: "B" }, { x: 6.2, y: 2.6, label: "B" }, { x: 8.5, y: 1.8, label: "B" },
  { x: 5.1, y: 5.4, label: "A" }, { x: 6.4, y: 7.1, label: "A" }, { x: 6.8, y: 8.7, label: "A" },
  { x: 7.8, y: 5.2, label: "B" }, { x: 8.8, y: 6.5, label: "B" }, { x: 9.2, y: 8.2, label: "B" },
]);

export function predictTree(point: Pick<TreePoint, "x" | "y">, config: TreeConfig): "A" | "B" {
  if (config.depth === 1) return point.x < config.threshold ? "A" : "B";
  if (point.x < config.threshold) return point.y < 6 ? "A" : "B";
  if (point.y < 4) return "B";
  if (config.depth === 2) return "A";
  return point.x < 7.2 ? "A" : "B";
}

export function treeAccuracy(config: TreeConfig) {
  return TREE_POINTS.filter((point) => predictTree(point, config) === point.label).length / TREE_POINTS.length;
}

export function leafCount(depth: TreeConfig["depth"]) {
  return depth === 1 ? 2 : depth === 2 ? 4 : 5;
}
