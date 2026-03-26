"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Supervised", href: "/algorithms/supervised" },
  { label: "Unsupervised", href: "/algorithms/unsupervised" },
  { label: "Deep Learning", href: "/algorithms/deep-learning" },
];

const quickActions = [
  { label: "Playground", href: "/#neural-playground" },
  { label: "Neural Networks", href: "/algorithms/neural-networks" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Link href="/" className="block w-fit">
              <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500">
                ML Learn
              </p>
              <h1 className="mt-1 truncate font-headline text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
                The Digital Observatory
              </h1>
            </Link>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Learn machine learning through interactive intuition, mathematical
              logic, and production-quality visual explanations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                  item.label === "Playground"
                    ? "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {primaryNav.map((item) => {
            const active = isActiveLink(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "border-primary/25 bg-primary/12 text-primary shadow-[0_0_0_1px_rgba(173,198,255,0.08)]"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/15 hover:bg-white/[0.08] hover:text-slate-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
