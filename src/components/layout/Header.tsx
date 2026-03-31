"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Curriculum", href: "/algorithms/maximum-likelihood" },
  { label: "Playground", href: "/playground", accent: true },
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
    <header className="sticky top-0 z-30 border-b-4 border-outline bg-surface">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex flex-col">
          <p className="font-headline text-2xl font-black uppercase tracking-tight text-on-surface">
            ML Learn
          </p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant">
            Digital Observatory
          </p>
        </Link>

        {/* Navigation links */}
        <nav
          aria-label="Primary"
          className="flex items-center gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);

            if (item.accent) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="whitespace-nowrap border-2 border-outline bg-surface px-4 py-2 font-mono text-sm font-bold uppercase text-on-surface transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_0px_var(--color-outline)]"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative whitespace-nowrap font-mono text-sm font-bold uppercase transition-colors hover:text-primary",
                  active ? "text-primary" : "text-on-surface-variant"
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
