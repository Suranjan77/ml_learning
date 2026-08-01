/** Stable colour values for renderers that cannot consume CSS custom properties. */
export const vizTokens = Object.freeze({
  canvas: "#FAF8F2",
  grid: "#DED7CA",
  axis: "#625A4F",
  border: "#AFA693",
  ink: "#1E1B16",
  mutedInk: "#625A4F",
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

/**
 * Shared label sizes (SVG user units at the 1180×520 authoring viewBox), named
 * by the job the text does rather than by its size. Centralised for the same
 * reason as `vizStroke`, and because Present mode has to enlarge every label in
 * the catalogue together — which is only possible if no scene hardcodes its own.
 *
 * Read these through `useVizType()` so the values respond to Present mode.
 */
export const vizType = Object.freeze({
  /** Dense supporting detail: axis ticks, units, per-point annotations. */
  micro: 8,
  /** Standard uppercase caption on an axis, series, or region. */
  label: 9,
  /** A caption naming the thing currently being manipulated. */
  labelStrong: 10,
  /** Column and panel headings inside the scene. */
  caption: 11,
  /** Running prose inside the scene, where a scene uses any. */
  body: 12,
  /** A supporting computed number: a reference, bound, or previous value. */
  valueSoft: 14,
  /** A computed number the learner is being asked to watch. */
  value: 17,
  /** The single headline number that carries the argument. */
  valueStrong: 21,
} as const);

export type VizType = keyof typeof vizType;
