import Image from "next/image";
import Link from "next/link";

const footerNavLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-background/70 transition-colors hover:text-inverse-primary";

export default function Footer() {
  return (
    <footer className="border-t border-outline-dark bg-on-surface text-background">
      <div className="mx-auto max-w-content px-4 py-9 sm:px-6 sm:py-11 lg:px-8">
        <div className="grid gap-8 border-b border-background/15 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.6fr)] md:items-end md:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo-favicon.svg"
                width={42}
                height={42}
                alt=""
                aria-hidden="true"
                className="h-10 w-10 shrink-0"
              />
              <div className="leading-none">
                <p className="font-headline text-lg font-medium">Machine Learning Visualisations</p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-background/55">
                  13 experiments · computed in browser
                </p>
              </div>
            </div>
            <h2 className="mt-6 max-w-2xl text-balance font-headline text-3xl font-medium leading-tight sm:text-4xl">
              Every exhibit states what is computed, authored, and omitted.
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-background/65">
            Models run in your browser with assumptions and references attached. No accounts, analytics, advertising, or tracking cookies.
          </p>
        </div>

        <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-label text-background/50">
            Designed and built by{" "}
            <a
              href="https://github.com/suranjan77"
              target="_blank"
              rel="noreferrer"
              className="text-background transition-colors hover:text-inverse-primary"
              aria-label="Suranjan Poudel on GitHub (opens in a new tab)"
            >
              Suranjan Poudel <span aria-hidden="true">↗</span>
            </a>
          </p>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 text-sm">
            <Link href="/methodology" className={footerNavLinkClass}>
              Methodology
            </Link>
            <Link href="/methodology#privacy" className={footerNavLinkClass}>
              Privacy
            </Link>
            <a
              href="https://github.com/suranjan77/suranjan77.github.io"
              target="_blank"
              rel="noreferrer"
              className={footerNavLinkClass}
              aria-label="View source on GitHub (opens in a new tab)"
            >
              Source <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
