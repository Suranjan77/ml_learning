/** Stable colour values for renderers that cannot consume CSS custom properties. */
export const vizTokens = Object.freeze({
  canvas: "#FAF8F2",
  grid: "#E8E2D5",
  axis: "#6F6658",
  border: "#BEB6A5",
  ink: "#1E1B16",
  mutedInk: "#6F6658",
  classA: "#556B4A",
  classB: "#8D5149",
  prediction: "#556B4A",
  target: "#B0573E",
  error: "#8D5149",
  path: "#927A4B",
  selection: "#B0573E",
  pointOutline: "#FAF8F2",
} as const);

export type VizToken = keyof typeof vizTokens;
