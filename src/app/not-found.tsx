import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-tertiary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 rounded-3xl border border-white/10 bg-surface-container/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur xl:grid-cols-[1.1fr_0.9fr] xl:p-12">
          <section className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Route not found
            </div>

            <p className="mb-4 font-mono text-sm uppercase tracking-[0.35em] text-slate-500">
              Error 404
            </p>

            <h1 className="mb-6 font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              This page drifted outside the observable dataset.
            </h1>

            <p className="mb-8 max-w-xl text-base leading-8 text-on-surface-variant sm:text-lg">
              The page you requested doesn&apos;t exist, may have moved, or the
              link you followed is out of date. You can jump back into the core
              curriculum, explore the neural playground, or return to the main
              dashboard.
            </p>

            <div className="mb-10 flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110"
              >
                Back to Home
              </Link>
              <Link
                href="/#neural-playground"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-on-surface transition hover:bg-white/10"
              >
                Open Playground
              </Link>
              <Link
                href="/algorithms/supervised"
                className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
              >
                Browse Algorithms
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/algorithms/supervised"
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-primary/30 hover:bg-slate-950/70"
              >
                <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
                  Track 01
                </div>
                <div className="font-semibold text-on-surface">
                  Supervised Learning
                </div>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Regression, classification, trees, and ensembles.
                </p>
              </Link>

              <Link
                href="/algorithms/unsupervised"
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-secondary/30 hover:bg-slate-950/70"
              >
                <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
                  Track 02
                </div>
                <div className="font-semibold text-on-surface">
                  Unsupervised Learning
                </div>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Clustering, structure discovery, and dimensionality reduction.
                </p>
              </Link>

              <Link
                href="/algorithms/deep-learning"
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-tertiary/30 hover:bg-slate-950/70"
              >
                <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
                  Track 03
                </div>
                <div className="font-semibold text-on-surface">
                  Deep Learning
                </div>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Neural networks, CNNs, RNNs, and representation learning.
                </p>
              </Link>
            </div>
          </section>

          <section className="relative">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                  routing_diagnostics.ts
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-950 px-5 py-6">
                <div className="absolute inset-0 opacity-30">
                  <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
                </div>

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border border-error/20 bg-error/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-error">
                      Missing route
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      status: 404
                    </span>
                  </div>

                  <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <div className="font-mono text-sm leading-7 text-slate-300">
                      <div>
                        <span className="text-slate-500">request</span>
                        <span className="mx-2 text-slate-600">→</span>
                        <span className="text-primary">resource_not_found</span>
                      </div>
                      <div>
                        <span className="text-slate-500">recovery</span>
                        <span className="mx-2 text-slate-600">→</span>
                        <span className="text-tertiary">
                          redirect_to_known_learning_path()
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">recommendation</span>
                        <span className="mx-2 text-slate-600">→</span>
                        <span className="text-secondary">
                          resume_from_dashboard()
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                        <span>Navigation confidence</span>
                        <span>stable</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full w-[88%] rounded-full bg-linear-to-r from-primary to-tertiary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
                          Home
                        </div>
                        <div className="mt-2 text-lg font-semibold text-on-surface">
                          Ready
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
                          Paths
                        </div>
                        <div className="mt-2 text-lg font-semibold text-on-surface">
                          3
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
                          Status
                        </div>
                        <div className="mt-2 text-lg font-semibold text-on-surface">
                          Fixed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Tip: if you bookmarked an older route, update it to one of the
                current learning tracks above.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
