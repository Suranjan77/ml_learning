"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const visualisationsActive = pathname.startsWith("/visualisations");
  const conceptsActive = pathname === "/concepts";

  return (
    <header className="sticky top-0 z-40 h-[60px] shrink-0 border-b border-outline bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Machine learning visualisations — home"
          className="font-headline text-base font-medium text-on-surface transition-colors hover:text-primary sm:text-lg"
        >
          <span className="sm:hidden">ML visualisations</span>
          <span className="hidden sm:inline">Machine learning visualisations</span>
        </Link>
        <nav aria-label="Primary navigation" className="flex h-full items-center gap-3 text-xs sm:gap-5 sm:text-sm">
          <Link
            href="/visualisations"
            aria-current={visualisationsActive ? "page" : undefined}
            className={
              visualisationsActive
                ? "flex h-full items-center border-b-2 border-primary text-primary"
                : "flex h-full items-center border-b-2 border-transparent text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            Visualisations
          </Link>
          <Link
            href="/concepts"
            aria-current={conceptsActive ? "page" : undefined}
            className={
              conceptsActive
                ? "flex h-full items-center border-b-2 border-primary text-primary"
                : "flex h-full items-center border-b-2 border-transparent text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            <span className="sm:hidden">Map</span>
            <span className="hidden sm:inline">Concept map</span>
          </Link>
          <Link
            href="/methodology"
            aria-current={pathname === "/methodology" ? "page" : undefined}
            className={
              pathname === "/methodology"
                ? "flex h-full items-center border-b-2 border-primary text-primary"
                : "flex h-full items-center border-b-2 border-transparent text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
