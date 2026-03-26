"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { algorithms } from "@/data/algorithms";

const navigation = [
  {
    name: "Home",
    href: "/",
    match: (pathname: string) => pathname === "/",
    meta: "Dashboard",
  },
  {
    name: "Supervised",
    href: "/algorithms/supervised",
    match: (pathname: string) =>
      pathname === "/algorithms/supervised" ||
      getAlgorithmCategoryPath(pathname) === "/algorithms/supervised",
    meta: "Algorithm Track",
  },
  {
    name: "Unsupervised",
    href: "/algorithms/unsupervised",
    match: (pathname: string) =>
      pathname === "/algorithms/unsupervised" ||
      getAlgorithmCategoryPath(pathname) === "/algorithms/unsupervised",
    meta: "Algorithm Track",
  },
  {
    name: "Deep Learning",
    href: "/algorithms/deep-learning",
    match: (pathname: string) =>
      pathname === "/algorithms/deep-learning" ||
      getAlgorithmCategoryPath(pathname) === "/algorithms/deep-learning",
    meta: "Algorithm Track",
  },
  {
    name: "Playground",
    href: "/playground",
    match: (pathname: string) => pathname === "/playground",
    meta: "Interactive Lab",
  },
] as const;

function getAlgorithmCategoryPath(pathname: string): string | null {
  if (!pathname.startsWith("/algorithms/")) {
    return null;
  }

  const slug = pathname.replace("/algorithms/", "");

  if (!slug || slug.includes("/")) {
    return null;
  }

  const algorithm = algorithms.find((item) => item.id === slug);

  if (!algorithm) {
    return null;
  }

  switch (algorithm.category) {
    case "Supervised":
      return "/algorithms/supervised";
    case "Unsupervised":
      return "/algorithms/unsupervised";
    case "Deep Learning":
      return "/algorithms/deep-learning";
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-outline-variant/50 lg:bg-surface-container">
      <div className="border-b border-outline-variant/50 px-6 py-7">
        <Link href="/" className="block">
          <p className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            ML Learn
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-on-surface-variant">
            Digital Observatory
          </p>
        </Link>
      </div>

      <div className="px-4 py-5">
        <div className="mb-4 rounded-xl bg-surface-container-high p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
            Learning Tracks
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Move through the curriculum by category, then open each algorithm
            for intuition, math, code, and trade-offs.
          </p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                <span
                  className={clsx(
                    "h-2 w-2 rounded-full transition-colors",
                    isActive
                      ? "bg-primary"
                      : "bg-outline group-hover:bg-on-surface-variant",
                  )}
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {item.name}
                  </div>
                  <p
                    className={clsx(
                      "mt-0.5 text-xs tracking-wide",
                      isActive ? "text-primary/70" : "text-on-surface-variant",
                    )}
                  >
                    {item.meta}
                  </p>
                </div>

                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-outline-variant/50 p-5">
        <div className="rounded-xl bg-surface-container-high p-4">
          <p className="text-sm font-semibold text-on-surface">
            Guided Learning
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Interactive • Visual • Mathematical
          </p>

          <div className="mt-4 space-y-1.5 text-xs text-on-surface-variant">
            <div className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2">
              <span>Categories</span>
              <span className="font-semibold text-on-surface">3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2">
              <span>Algorithms</span>
              <span className="font-semibold text-on-surface">
                {algorithms.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
