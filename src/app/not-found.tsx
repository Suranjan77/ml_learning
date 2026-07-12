import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[70vh] max-w-[1100px] items-center gap-px border border-outline bg-border lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="bg-surface p-8 sm:p-12">
          <div className="mb-8 inline-flex border border-outline bg-surface-container-high px-3 py-2 font-mono text-[13px] uppercase tracking-[0.08em] text-primary">
            Route not found
          </div>
          <p className="mb-5 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
            Error 404
          </p>
          <h1 className="max-w-2xl font-headline text-5xl font-medium leading-tight text-on-surface">
            This page drifted outside the observable dataset.
          </h1>
          <p className="mt-7 max-w-xl text-base font-medium leading-8 text-on-surface-variant">
            The page you requested does not exist or may have moved. Return to
            the curriculum, open a learning track, or use the header search.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/"
              className="border border-accent bg-accent px-6 py-3 text-[15px] font-medium tracking-tight text-on-accent hover:bg-accent-hover hover:border-accent-hover"
            >
              Home
            </Link>
            <Link
              href="/tracks"
              className="border border-outline bg-surface px-6 py-3 text-[15px] font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              Learning Tracks
            </Link>
          </div>
        </section>

        <section className="bg-surface p-8 sm:p-12">
          <div className="crop-marks relative border border-outline bg-surface-container-lowest p-6 font-mono text-sm leading-8 text-on-surface">
            <div>
              <span className="text-on-surface-variant">request</span>
              <span className="mx-2 text-outline-dark">→</span>
              <span className="text-error">resource_not_found</span>
            </div>
            <div>
              <span className="text-on-surface-variant">recovery</span>
              <span className="mx-2 text-outline-dark">→</span>
              <span className="text-primary">known_learning_path</span>
            </div>
            <div>
              <span className="text-on-surface-variant">status</span>
              <span className="mx-2 text-outline-dark">→</span>
              <span>404</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
