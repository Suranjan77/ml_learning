"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const visualisationsActive = pathname.startsWith("/visualisations");
  const conceptsActive = pathname === "/concepts";
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 h-[var(--layout-header-height)] shrink-0 border-b border-outline bg-background/95 backdrop-blur-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-on-surface focus:px-3 focus:py-2 focus:text-xs focus:text-background"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-full max-w-content items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Machine learning visualisations — home"
          aria-current={pathname === "/" ? "page" : undefined}
          className="group flex min-w-0 items-center gap-2.5 text-on-surface transition-colors hover:text-primary"
        >
          <Image
            src="/logo-favicon.svg"
            width={34}
            height={34}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 sm:h-[34px] sm:w-[34px]"
          />
          <span className="min-w-0 leading-none">
            <span className="block truncate font-headline text-sm font-medium sm:text-base">
              <span className="sm:hidden">ML</span>
              <span className="hidden sm:inline">Machine Learning</span>
            </span>
            <span className="mt-1 block truncate font-mono text-[8px] uppercase tracking-[0.16em] text-on-surface-variant transition-colors group-hover:text-primary sm:text-[9px]">
              Visualisations
              <span className="hidden md:inline"> · 13 experiments</span>
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="flex h-full shrink-0 items-center gap-2 text-[11px] font-medium sm:gap-5 sm:text-sm">
          <Link
            href="/visualisations"
            aria-current={visualisationsActive ? "page" : undefined}
            className={
              visualisationsActive
                ? "flex h-full items-center border-b-2 border-primary px-0.5 text-primary"
                : "flex h-full items-center border-b-2 border-transparent px-0.5 text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            <span className="sm:hidden">Library</span>
            <span className="hidden sm:inline">Visualisations</span>
          </Link>
          <Link
            href="/concepts"
            aria-current={conceptsActive ? "page" : undefined}
            className={
              conceptsActive
                ? "flex h-full items-center border-b-2 border-primary px-0.5 text-primary"
                : "flex h-full items-center border-b-2 border-transparent px-0.5 text-on-surface-variant transition-colors hover:text-primary"
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
                ? "flex h-full items-center border-b-2 border-primary px-0.5 text-primary"
                : "flex h-full items-center border-b-2 border-transparent px-0.5 text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            <span className="sm:hidden">About</span>
            <span className="hidden sm:inline">Methodology</span>
          </Link>
        </nav>
      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-0.5 w-full origin-left bg-accent transition-transform duration-150"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
    </header>
  );
}
