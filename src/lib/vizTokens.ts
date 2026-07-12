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

/**
 * Shared stroke weights (SVG user units at the 1180×520 authoring viewBox).
 * Centralised so every exhibit draws linework at a consistent, deliberate scale
 * rather than each scene inventing its own magic numbers.
 */
export const vizStroke = Object.freeze({
  hairline: 1,
  grid: 1,
  contour: 1.4,
  contourStrong: 2.4,
  guide: 1.5,
  path: 3,
  marker: 2,
  markerStrong: 3,
  arrow: 3,
} as const);

export type VizStroke = keyof typeof vizStroke;
