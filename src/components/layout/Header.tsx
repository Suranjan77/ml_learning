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
  { label: "Playground", href: "/playground" },
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
    <header className="sticky top-0 z-30 border-b border-outline-variant/50 bg-surface-container">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Link href="/" className="block w-fit">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                ML Learn
              </p>
              <h1 className="mt-1 truncate font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
                The Digital Observatory
              </h1>
            </Link>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
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
                  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  item.label === "Playground"
                    ? "bg-primary text-on-primary hover:bg-primary/85"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
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
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
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
