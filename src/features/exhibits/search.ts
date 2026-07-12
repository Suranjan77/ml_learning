import type { ExhibitSummary } from "./types";

export type DurationBucket = "short" | "medium" | "long";

export interface LibraryFilters {
  query: string;
  topic: string;
  difficulty: string;
  renderer: string;
  duration: string;
}

export const emptyFilters: LibraryFilters = {
  query: "",
  topic: "",
  difficulty: "",
  renderer: "",
  duration: "",
};

export const durationBuckets: Record<DurationBucket, { label: string; test: (minutes: number) => boolean }> = {
  short: { label: "Under 5 min", test: (minutes) => minutes <= 4 },
  medium: { label: "5 to 6 min", test: (minutes) => minutes >= 5 && minutes <= 6 },
  long: { label: "7 min or more", test: (minutes) => minutes >= 7 },
};

/** Every term in the query must appear in the exhibit's searchable text. */
export function matchesQuery(exhibit: ExhibitSummary, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const haystack = [
    exhibit.title,
    exhibit.question,
    exhibit.summary,
    exhibit.topic,
    ...exhibit.tags,
  ]
    .join(" ")
    .toLowerCase();

  return trimmed.split(/\s+/).every((term) => haystack.includes(term));
}

function matchesDuration(minutes: number, bucket: string): boolean {
  if (bucket === "") return true;
  const definition = durationBuckets[bucket as DurationBucket];
  return definition ? definition.test(minutes) : true;
}

export function filterExhibits(
  exhibits: readonly ExhibitSummary[],
  filters: LibraryFilters,
): ExhibitSummary[] {
  return exhibits.filter(
    (exhibit) =>
      matchesQuery(exhibit, filters.query) &&
      (filters.topic === "" || exhibit.topic === filters.topic) &&
      (filters.difficulty === "" || exhibit.difficulty === filters.difficulty) &&
      (filters.renderer === "" || exhibit.renderer === filters.renderer) &&
      matchesDuration(exhibit.duration, filters.duration),
  );
}

export function hasActiveFilters(filters: LibraryFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.topic !== "" ||
    filters.difficulty !== "" ||
    filters.renderer !== "" ||
    filters.duration !== ""
  );
}

/** Distinct topics in the order they first appear in the library. */
export function collectTopics(exhibits: readonly ExhibitSummary[]): string[] {
  return Array.from(new Set(exhibits.map((exhibit) => exhibit.topic)));
}

/**
 * Read filters from URL params, ignoring any value that is not present in the
 * library so a hand-edited or stale link never produces an empty result set
 * from an invalid option.
 */
export function filtersFromParams(
  params: URLSearchParams,
  exhibits: readonly ExhibitSummary[],
): LibraryFilters {
  const allowed = (values: readonly string[], candidate: string | null) =>
    candidate && values.includes(candidate) ? candidate : "";

  return {
    query: params.get("q") ?? "",
    topic: allowed(collectTopics(exhibits), params.get("topic")),
    difficulty: allowed(
      exhibits.map((exhibit) => exhibit.difficulty),
      params.get("difficulty"),
    ),
    renderer: allowed(
      exhibits.map((exhibit) => exhibit.renderer),
      params.get("renderer"),
    ),
    duration: allowed(Object.keys(durationBuckets), params.get("duration")),
  };
}

/** Serialise filters back to URL params, omitting defaults for readable links. */
export function filtersToParams(filters: LibraryFilters): URLSearchParams {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("q", query);
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.renderer) params.set("renderer", filters.renderer);
  if (filters.duration) params.set("duration", filters.duration);
  return params;
}
