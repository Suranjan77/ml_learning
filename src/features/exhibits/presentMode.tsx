"use client";

import { createContext, useContext, useMemo } from "react";
import { vizStroke, vizType } from "@/lib/vizTokens";

/**
 * Scene type and linework are authored for reading distance — a laptop at arm's
 * length. Projected in a teaching room the same drawing is read from several
 * metres away, where the numeric readouts that carry the causal argument are
 * the first thing to become illegible.
 *
 * Present mode multiplies authored type and linework by this factor. Combined
 * with the workspace dropping its 1600px cap, a 9-unit label in the 1180-wide
 * authoring viewBox lands near 23 CSS pixels on a 1920-wide projector, which is
 * the point at which back-row legibility starts.
 */
export const PRESENT_SCALE = 1.6;

/** Linework thickens more gently than type; matching 1.6 turns hairlines into bars. */
export const PRESENT_STROKE_SCALE = 1.3;

const PresentModeContext = createContext(false);

export const PresentModeProvider = PresentModeContext.Provider;

/** True while the exhibit is being projected to a room rather than read. */
export function usePresentMode() {
  return useContext(PresentModeContext);
}

function scaleTokens<Key extends string>(
  tokens: Readonly<Record<Key, number>>,
  factor: number,
): Readonly<Record<Key, number>> {
  if (factor === 1) return tokens;
  const scaled = {} as Record<Key, number>;
  for (const key of Object.keys(tokens) as Key[]) {
    scaled[key] = Math.round(tokens[key] * factor * 10) / 10;
  }
  return Object.freeze(scaled);
}

/**
 * Authored type sizes, enlarged when presenting. Scenes read every label size
 * from here so that one toggle moves the whole catalogue coherently instead of
 * each scene deciding for itself.
 */
export function useVizType() {
  const presenting = usePresentMode();
  return useMemo(
    () => scaleTokens(vizType, presenting ? PRESENT_SCALE : 1),
    [presenting],
  );
}

/** Authored stroke weights, thickened when presenting. */
export function useVizStroke() {
  const presenting = usePresentMode();
  return useMemo(
    () => scaleTokens(vizStroke, presenting ? PRESENT_STROKE_SCALE : 1),
    [presenting],
  );
}
