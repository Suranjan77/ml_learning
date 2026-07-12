"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchModules, SearchResult } from "@/lib/search";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        const res = searchModules(query);
        setResults(res);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full lg:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules..."
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-full rounded-md border border-outline bg-surface-container-low py-1.5 pl-9 pr-8 font-sans text-sm font-medium text-on-surface transition-all placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-1 text-on-surface-variant hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 max-h-80 w-full min-w-[280px] overflow-y-auto border border-outline bg-surface p-2 shadow-lg backdrop-blur-md">
          {results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-2 pb-1 pt-0.5 font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
                Matching Modules
              </p>
              {results.map(({ module }) => (
                <Link
                  key={module.id}
                  href={`/algorithms/${module.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block rounded px-2.5 py-2 transition-colors hover:bg-surface-container-high"
                >
                  <p className="font-headline text-sm font-medium text-on-surface">
                    {module.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-on-surface-variant">
                    {module.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-sm font-medium text-on-surface-variant">
                No results found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
