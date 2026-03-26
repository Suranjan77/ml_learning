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
    href: "/#neural-playground",
    match: () => false,
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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/10 lg:bg-slate-950/80 lg:backdrop-blur-xl">
      <div className="border-b border-white/5 px-6 py-7">
        <Link href="/" className="block">
          <p className="font-headline text-2xl font-bold tracking-tight text-slate-100">
            ML Learn
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
            Digital Observatory
          </p>
        </Link>
      </div>

      <div className="px-4 py-5">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">
            Learning Tracks
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Move through the curriculum by category, then open each algorithm
            for intuition, math, code, and trade-offs.
          </p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = item.match(pathname);

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
                  isActive
                    ? "border-primary/25 bg-primary/10 text-slate-50"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-slate-100",
                )}
              >
                <span
                  className={clsx(
                    "h-2.5 w-2.5 rounded-full transition-colors",
                    isActive
                      ? "bg-primary"
                      : "bg-slate-600 group-hover:bg-slate-300",
                  )}
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate font-headline text-base font-medium tracking-tight">
                    {item.name}
                  </div>
                  <p
                    className={clsx(
                      "mt-0.5 text-xs uppercase tracking-[0.18em]",
                      isActive ? "text-slate-300" : "text-slate-500",
                    )}
                  >
                    {item.meta}
                  </p>
                </div>

                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(173,198,255,0.8)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/5 p-5">
        <div className="rounded-2xl border border-white/10 bg-surface-container-high/70 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-slate-100">
            Guided Learning
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Interactive • Visual • Mathematical
          </p>

          <div className="mt-4 space-y-2 text-xs leading-6 text-slate-400">
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>Categories</span>
              <span className="font-semibold text-slate-200">3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>Algorithms</span>
              <span className="font-semibold text-slate-200">
                {algorithms.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
