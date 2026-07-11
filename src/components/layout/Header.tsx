"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { useHydrated } from "@/lib/useHydrated";

const navItems = [
  { label: "Curriculum", href: "/#curriculum" },
  { label: "Labs", href: "/labs" },
  { label: "Concept Map", href: "/map" },
  { label: "About", href: "/#philosophy" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-outline bg-background/95">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12 lg:py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-favicon.svg"
            alt=""
            width={34}
            height={34}
            priority
            className="h-8 w-8 shrink-0 sm:h-[34px] sm:w-[34px]"
          />
          <span>
            <p className="font-headline text-xl font-medium leading-none tracking-normal text-on-surface">
              ML Learn
            </p>
            <p className="mt-1 font-mono text-xs font-normal uppercase tracking-[0.12em] text-on-surface-variant">
              Learning AI & ML
            </p>
          </span>
        </Link>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center border border-outline bg-surface text-on-surface transition-colors hover:border-primary hover:text-primary lg:hidden"
        >
          {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
          <SearchBar />

          <PrimaryNavigation
            pathname={pathname}
            isHydrated={isHydrated}
            onNavigate={() => setMenuOpen(false)}
          />
        </div>
      </div>

      <div className="border-t border-outline px-4 py-3 sm:px-8 lg:hidden">
        <SearchBar />
      </div>

      <div
        id="mobile-primary-navigation"
        className={clsx(
          "border-t border-outline bg-surface px-4 py-3 sm:px-8 lg:hidden",
          !menuOpen && "hidden",
        )}
      >
        <PrimaryNavigation
          pathname={pathname}
          isHydrated={isHydrated}
          onNavigate={() => setMenuOpen(false)}
          mobile
        />
      </div>
    </header>
  );
}

function PrimaryNavigation({
  pathname,
  isHydrated,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  isHydrated: boolean;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  return (
    <nav
      aria-label="Primary"
      className={clsx(
        mobile ? "grid grid-cols-2 gap-2 sm:grid-cols-5" : "flex items-center gap-6",
      )}
    >
      {navItems.map((item) => {
        const active = isHydrated && isActiveLink(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={clsx(
              "transition-colors",
              mobile
                ? "border px-3 py-3 text-center text-sm font-medium tracking-tight"
                : "relative whitespace-nowrap py-1 text-[15px] font-medium tracking-tight underline-offset-[6px] decoration-1 hover:underline",
              active
                ? mobile
                  ? "border-primary bg-primary-container text-primary"
                  : "text-primary underline"
                : mobile
                  ? "border-outline text-on-surface-variant"
                  : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
