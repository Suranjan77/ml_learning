import type { Transition } from "motion/react";

/**
 * Shared motion presets for the visualisation library. Every exhibit animates
 * against the same springs and easings so transitions feel like one system,
 * and so honouring `prefers-reduced-motion` is a single call rather than
 * per-scene guesswork.
 *
 * Easings mirror the `--ease-*` custom properties in tokens.css.
 */
export const vizMotion = Object.freeze({
  /** A marker settling to a new position — the dominant "thing moved" motion. */
  markerSpring: { type: "spring", stiffness: 300, damping: 28, mass: 0.7 },
  /** A new element appearing (a dot, a label) — snappier, slight overshoot. */
  popIn: { type: "spring", stiffness: 420, damping: 24 },
  /** A stroke drawing itself in (pathLength 0 → 1). */
  draw: { duration: 0.55, ease: [0.2, 0, 0, 1] },
  /** A fast opacity/colour cross-fade for state swaps. */
  fade: { duration: 0.18, ease: [0.2, 0, 0, 1] },
  /** A guided-playback camera beat: long enough to perceive the mechanism moving. */
  cinematic: { duration: 1.45, ease: [0.16, 1, 0.3, 1] },
} satisfies Record<string, Transition>);

export type VizMotion = keyof typeof vizMotion;

/** Collapse any preset to an instant transition when the user prefers reduced motion. */
export function reduced(transition: Transition, prefersReduced: boolean | null): Transition {
  return prefersReduced ? { duration: 0 } : transition;
}
