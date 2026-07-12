import Link from "next/link";
import { ArrowRight, MoveRight, Play } from "lucide-react";
import ExhibitCard, { ExhibitPreview } from "@/components/ExhibitCard";
import { exhibits } from "@/features/exhibits/registry";

const FEATURED_SLUG = "gradient-descent";

const questionThemes = [
  {
    keyword: "Data",
    label: "Learn from data",
    description: "Optimisation, fitting, and the difference between learning a pattern and memorising noise.",
    slugs: ["gradient-descent", "overfitting", "k-means", "pca"],
  },
  {
    keyword: "Boundaries",
    label: "Shape a boundary",
    description: "Transform data, compare distances, and see how simple rules produce complex decision regions.",
    slugs: ["kernel-trick", "particle-swarm", "genetic-algorithm", "cnn-feature-maps", "backpropagation"],
  },
  {
    keyword: "Language",
    label: "Inside language models",
    description: "Trace contextual connections, reshape probabilities, and inspect why generated text changes.",
    slugs: ["attention", "token-sampling"],
  },
] as const;

export default function Home() {
  const featured = exhibits.find((exhibit) => exhibit.slug === FEATURED_SLUG) ?? exhibits[0];

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-outline bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(to_right,var(--color-outline)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-outline)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_right,black,transparent_72%)]" />
        <div className="relative mx-auto grid max-w-content gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)] lg:items-center lg:gap-16">
          <div>
            <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-label text-primary sm:text-[11px]">
              <span className="h-px w-8 bg-primary" />
              Interactive machine learning
            </p>
            <h1 className="mt-5 max-w-4xl text-balance font-headline text-[2.75rem] font-medium leading-[0.98] tracking-[-0.025em] text-on-surface sm:text-6xl lg:text-[4.75rem]">
              Don’t just read the algorithm. <span className="text-primary">Watch it change.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-on-surface-variant sm:text-lg sm:leading-8">
              Manipulate the inputs, step through the mechanism, and connect every parameter to a visible consequence. No setup, hidden code, or passive animation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/visualisations/${featured.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 border border-accent bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:border-accent-hover hover:bg-accent-hover">
                <Play size={15} fill="currentColor" aria-hidden="true" />
                Start with gradient descent
              </Link>
              <Link href="/visualisations" className="inline-flex min-h-12 items-center justify-center gap-2 border border-outline-dark bg-surface px-5 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary">
                Explore the full library
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 border-y border-outline bg-background/65">
              <div className="py-4 pr-3">
                <dt className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Exhibits</dt>
                <dd className="mt-1 font-headline text-2xl text-on-surface">{exhibits.length}</dd>
              </div>
              <div className="border-x border-outline px-4 py-4">
                <dt className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Format</dt>
                <dd className="mt-1 font-headline text-2xl text-on-surface">Guided</dd>
              </div>
              <div className="py-4 pl-4">
                <dt className="font-mono text-[9px] uppercase tracking-label text-on-surface-variant">Control</dt>
                <dd className="mt-1 font-headline text-2xl text-on-surface">Yours</dd>
              </div>
            </dl>
          </div>

          <Link href={`/visualisations/${featured.slug}`} className="group relative block border border-outline-dark bg-surface transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <div className="flex items-center justify-between border-b border-outline px-4 py-3 font-mono text-[10px] uppercase tracking-label text-on-surface-variant">
              <span><span className="text-accent">Recommended first</span> · {featured.duration} min</span>
              <span>Interactive</span>
            </div>
            <div className="relative h-64 overflow-hidden bg-primary-container/35 sm:h-80 lg:h-[22rem]">
              <div className="absolute inset-0 scale-110 transition-transform duration-500 group-hover:scale-[1.14]">
                <ExhibitPreview slug={featured.slug} />
              </div>
              <div className="absolute bottom-4 left-4 border border-outline-dark bg-surface/95 px-3 py-2 font-mono text-[10px] uppercase tracking-label text-primary">
                Change the learning rate
              </div>
            </div>
            <div className="grid gap-4 border-t border-outline p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-label text-primary">{featured.topic}</p>
                <h2 className="mt-2 max-w-xl font-headline text-2xl font-medium leading-tight text-on-surface sm:text-3xl">{featured.question}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">{featured.summary}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-b border-outline bg-inverse-surface px-4 py-8 text-inverse-on-surface sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-content gap-6 md:grid-cols-[0.55fr_1.45fr] md:items-center md:gap-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-label text-inverse-primary">How to use the library</p>
            <h2 className="mt-2 font-headline text-2xl font-medium sm:text-3xl">Prediction first. Explanation second.</h2>
          </div>
          <ol className="grid gap-px bg-[#49443B] sm:grid-cols-3">
            {["Predict what changes", "Manipulate one variable", "Explain the result"].map((label, index) => (
              <li key={label} className="flex items-center gap-3 bg-inverse-surface px-4 py-4 text-sm">
                <span className="font-mono text-[10px] text-inverse-primary">0{index + 1}</span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface-dim px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-primary">Explore by question</p>
              <h2 className="mt-2 max-w-3xl text-balance font-headline text-3xl font-medium leading-tight text-on-surface sm:text-4xl">Start with a question, not a syllabus.</h2>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">These are related ideas grouped by the kind of reasoning they make visible—not a sequence. Open any one first; there are no prerequisites or completion.</p>
          </div>

          <div className="mt-8 grid gap-px border border-outline-dark bg-outline-dark lg:grid-cols-3">
            {questionThemes.map((theme) => (
              <article key={theme.keyword} className="flex min-h-64 flex-col bg-surface p-5 sm:p-6">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-label text-on-surface-variant"><span>{theme.keyword}</span><span>{theme.slugs.length} exhibits</span></div>
                <h3 className="mt-8 font-headline text-2xl font-medium text-on-surface">{theme.label}</h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{theme.description}</p>
                <div className="mt-auto pt-6">
                  {theme.slugs.map((slug) => {
                    const exhibit = exhibits.find((item) => item.slug === slug);
                    if (!exhibit) return null;
                    return <Link key={slug} href={`/visualisations/${slug}`} className="group/link flex items-center justify-between border-t border-outline py-2.5 text-sm text-on-surface transition-colors hover:text-primary"><span>{exhibit.title}</span><MoveRight size={15} className="transition-transform group-hover/link:translate-x-1" aria-hidden="true" /></Link>;
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-label text-primary">Complete library</p>
              <h2 className="mt-2 font-headline text-3xl font-medium text-on-surface sm:text-4xl">Explore every visualisation</h2>
            </div>
            <Link href="/visualisations" className="hidden items-center gap-2 text-sm font-medium text-primary hover:underline sm:inline-flex">Browse by topic <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="mt-8 grid gap-px border border-outline bg-outline md:grid-cols-2 xl:grid-cols-3">
            {exhibits.map((exhibit, index) => <ExhibitCard key={exhibit.slug} exhibit={exhibit} index={index} className={index === exhibits.length - 1 && exhibits.length % 3 === 2 ? "md:col-span-2" : ""} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
