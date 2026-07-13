"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ExhibitCard from "@/components/ExhibitCard";
import type { ExhibitSummary } from "@/features/exhibits/types";
import {
  collectTopics,
  durationBuckets,
  emptyFilters,
  filterExhibits,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  type LibraryFilters,
} from "@/features/exhibits/search";

const selectClass =
  "min-h-11 w-full appearance-none border border-outline bg-background px-3 py-2 pr-8 text-sm text-on-surface transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">
        {label}
      </span>
      <div className="relative">
        <select
          className={selectClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        >
          ▾
        </span>
      </div>
    </label>
  );
}

export default function LibraryBrowser({
  exhibits,
}: {
  exhibits: readonly ExhibitSummary[];
}) {
  const [filters, setFilters] = useState<LibraryFilters>(emptyFilters);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters(filtersFromParams(params, exhibits));
  }, [exhibits]);

  const update = (next: LibraryFilters) => {
    setFilters(next);
    const params = filtersToParams(next);
    const query = params.toString();
    const url = new URL(window.location.href);
    url.search = query;
    window.history.replaceState({}, "", url);
  };

  const topicOptions = useMemo(
    () => [
      { value: "", label: "All topics" },
      ...collectTopics(exhibits).map((topic) => ({ value: topic, label: topic })),
    ],
    [exhibits],
  );

  const difficultyOptions = useMemo(() => {
    const values = Array.from(new Set(exhibits.map((exhibit) => exhibit.difficulty)));
    return [
      { value: "", label: "Any difficulty" },
      ...values.map((value) => ({ value, label: value })),
    ];
  }, [exhibits]);

  const rendererOptions = useMemo(() => {
    const values = Array.from(new Set(exhibits.map((exhibit) => exhibit.renderer)));
    return [
      { value: "", label: "Any renderer" },
      ...values.map((value) => ({ value, label: value })),
    ];
  }, [exhibits]);

  const durationOptions = useMemo(
    () => [
      { value: "", label: "Any length" },
      ...Object.entries(durationBuckets).map(([value, { label }]) => ({ value, label })),
    ],
    [],
  );

  const results = useMemo(() => filterExhibits(exhibits, filters), [exhibits, filters]);
  const active = hasActiveFilters(filters);

  return (
    <div>
      <div className="mx-auto w-full max-w-content border border-outline bg-surface">
        <div className="border-b border-outline p-3 sm:p-4">
          <label className="relative block">
            <span className="sr-only">Search visualisations</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => update({ ...filters, query: event.target.value })}
              placeholder="Search by name, question, or concept…"
              className="min-h-11 w-full border border-outline bg-background pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
          <FilterSelect
            label="Topic"
            value={filters.topic}
            onChange={(topic) => update({ ...filters, topic })}
            options={topicOptions}
          />
          <FilterSelect
            label="Difficulty"
            value={filters.difficulty}
            onChange={(difficulty) => update({ ...filters, difficulty })}
            options={difficultyOptions}
          />
          <FilterSelect
            label="Length"
            value={filters.duration}
            onChange={(duration) => update({ ...filters, duration })}
            options={durationOptions}
          />
          <FilterSelect
            label="Renderer"
            value={filters.renderer}
            onChange={(renderer) => update({ ...filters, renderer })}
            options={rendererOptions}
          />
        </div>
      </div>

      <div className="mx-auto mt-3 mb-3 flex w-full max-w-content items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-label text-on-surface-variant sm:text-[11px]">
        <span aria-live="polite">
          {results.length} of {exhibits.length} visualisations
        </span>
        {active ? (
          <button
            type="button"
            onClick={() => update(emptyFilters)}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <X size={13} aria-hidden="true" />
            Clear filters
          </button>
        ) : (
          <span>All topics</span>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mx-auto grid w-full max-w-content gap-px border border-outline bg-outline md:auto-rows-fr md:grid-cols-3">
          {results.map((exhibit, index) => (
            <ExhibitCard
              key={exhibit.slug}
              exhibit={exhibit}
              index={index}
              className={
                index === results.length - 1 && results.length % 3 === 2
                  ? "md:col-span-2"
                  : ""
              }
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-content border border-outline bg-surface p-10 text-center">
          <p className="font-headline text-xl text-on-surface">No visualisations match those filters.</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Try a broader search term or clear the filters to see the full library.
          </p>
          <button
            type="button"
            onClick={() => update(emptyFilters)}
            className="mt-5 inline-flex min-h-11 items-center justify-center border border-primary bg-primary px-4 text-sm font-medium text-on-primary"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
