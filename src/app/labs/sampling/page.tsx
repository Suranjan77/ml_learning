import type { Metadata } from "next";
import Link from "next/link";
import SamplingLab from "@/components/labs/SamplingLab";
import TheaterMode from "@/components/ui/TheaterMode";

export const metadata: Metadata = {
  title: "Token Sampling Lab",
  description:
    "Watch a language model pick its next word. Turn the temperature and top-k knobs and see the probability distribution reshape in real time.",
};

const guidelines = [
  [
    "01",
    "Read the Bars",
    "Each bar is the probability of the next word. The thin marker shows the model's raw opinion at temperature 1 — the bar shows what sampling actually uses.",
  ],
  [
    "02",
    "Turn the Temperature",
    "Low values sharpen the distribution toward the top word; high values flatten it toward randomness. Watch the bars move away from the markers.",
  ],
  [
    "03",
    "Cut with Top-k",
    "Top-k deletes everything outside the k most likely words before sampling. Struck-out rows get exactly 0% — no matter how hot the temperature.",
  ],
  [
    "04",
    "Generate and Compare",
    "Auto-generate a few sentences at temperature 0.2, then again at 1.8. The same tiny model produces boringly repetitive or gleefully chaotic text.",
  ],
] as const;

export default function SamplingLabPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Link
              href="/labs"
              className="border border-outline bg-surface px-4 py-2 text-sm font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              All Labs
            </Link>
            <div className="border border-outline bg-surface-container-high px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
              Interactive Laboratory
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-center">
            <div>
              <h1 className="text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
                Token Sampling Lab
              </h1>
              <p className="mt-7 text-base font-medium leading-8 text-on-surface-variant">
                Language models don&rsquo;t choose words — they score every
                candidate, and a sampler picks one. This is the full
                distribution of a tiny model, live, with the two knobs every
                real system exposes: temperature and top-k.
              </p>
            </div>
            <div className="grid border border-outline bg-border sm:grid-cols-3">
              {[
                ["Model", "Word bigram"],
                ["Sampler", "Softmax"],
                ["Knobs", "T · top-k"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-outline bg-surface px-5 py-7 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                    {label}
                  </p>
                  <p className="mt-2 font-headline text-2xl font-medium text-on-surface">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-outline px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px] border border-outline bg-surface">
          <div className="flex flex-col gap-3 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <span className="font-headline text-xl font-medium text-on-surface">
                Sampling Environment
              </span>
              <p className="mt-1 text-sm text-on-surface-variant">
                One word at a time — the whole distribution on the table
              </p>
            </div>
            <Link
              href="/algorithms/llms"
              className="border border-outline bg-surface-container px-4 py-2 text-sm font-medium tracking-tight text-on-surface hover:border-primary hover:text-primary"
            >
              Read Theory
            </Link>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <TheaterMode title="Token Sampling Lab">
              <SamplingLab />
            </TheaterMode>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <h2 className="mb-8 font-headline text-4xl font-medium text-on-surface">
            Operating Notes
          </h2>
          <div className="grid gap-px border border-outline bg-border sm:grid-cols-2 lg:grid-cols-4">
            {guidelines.map(([step, title, description]) => (
              <article key={step} className="bg-surface p-6">
                <div className="mb-8 font-mono text-[13px] text-on-surface-variant">
                  {step}
                </div>
                <h3 className="font-headline text-xl font-medium text-on-surface">
                  {title}
                </h3>
                <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-7 text-on-surface-variant">
            Real LLMs do exactly this over a vocabulary of ~100,000 tokens
            instead of a handful of words, and usually add a third knob —
            top-p (nucleus) sampling — that keeps the smallest set of words
            whose probabilities sum past a threshold. The mechanics you see
            here are otherwise unchanged.
          </p>
        </div>
      </section>
    </div>
  );
}
