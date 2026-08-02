import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] place-items-center px-5 py-8">
      <section className="w-full max-w-xl border border-outline bg-surface p-8 sm:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-on-surface-variant">404 · Page not found</p>
        <h1 className="mt-5 font-headline text-4xl font-medium text-on-surface">The requested page is unavailable.</h1>
        <p className="mt-5 leading-7 text-on-surface-variant">Return to the visualisation index to select an available topic.</p>
        <Link href="/visualisations" className="mt-8 inline-flex min-h-11 items-center border border-accent bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover">View visualisations</Link>
      </section>
    </div>
  );
}
