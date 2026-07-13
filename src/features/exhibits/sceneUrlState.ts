"use client";

import { useEffect, useRef } from "react";

export interface SceneUrlEntry {
  key: string;
  value: string;
  defaultValue: string;
}

export const SCENE_URL_KEYS = [
  "surface",
  "lr",
  "x",
  "y",
  "refX",
  "refY",
  "refLr",
  "compare",
  "degree",
  "refDegree",
  "seed",
  "validation",
  "ending",
  "refEnding",
  "head",
  "query",
  "lift",
  "angle",
  "temperature",
  "truncate",
  "topK",
  "topP",
  "mode",
  "slope",
  "intercept",
  "depth",
  "threshold",
  "refThreshold",
] as const;

/** Preserve route-level parameters while adding only non-default scene state. */
export function applySceneUrlState(url: URL, entries: readonly SceneUrlEntry[]) {
  for (const entry of entries) {
    if (entry.value === entry.defaultValue) {
      url.searchParams.delete(entry.key);
    } else {
      url.searchParams.set(entry.key, entry.value);
    }
  }
  return url;
}

export function numberParam(
  params: URLSearchParams,
  key: string,
  { min, max, step }: { min: number; max: number; step?: number },
) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) return undefined;
  if (step !== undefined) {
    const steps = (value - min) / step;
    if (Math.abs(steps - Math.round(steps)) > 1e-7) return undefined;
  }
  return value;
}

export function enumParam<const Value extends string>(
  params: URLSearchParams,
  key: string,
  values: readonly Value[],
) {
  const raw = params.get(key);
  return values.includes(raw as Value) ? (raw as Value) : undefined;
}

/** Restore once after hydration, then keep the address bar in sync with controls. */
export function replaceSceneUrlState(entries: readonly SceneUrlEntry[]) {
  if (!window.location.pathname.startsWith("/visualisations/")) return;
  const url = applySceneUrlState(new URL(window.location.href), entries);
  window.history.replaceState({}, "", url);
}

export function useSceneUrlState(restore: (params: URLSearchParams) => void, restoreKey?: unknown) {
  const restoreRef = useRef(restore);

  useEffect(() => {
    restoreRef.current = restore;
  });

  useEffect(() => {
    if (!window.location.pathname.startsWith("/visualisations/")) return;
    restoreRef.current(new URLSearchParams(window.location.search));
  }, [restoreKey]);
}
