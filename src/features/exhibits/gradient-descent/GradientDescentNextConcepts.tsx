import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ExhibitDefinition } from "../types";

const transitions: Record<string, { question: string; promise: string }> = {
  backpropagation: {
    question: "Where did the gradient come from?",
    promise: "Follow the chain rule as it assigns responsibility backward through a network.",
  },
  overfitting: {
    question: "Can training improve while prediction gets worse?",
    promise: "Hold the data fixed and watch training and validation error move apart.",
  },
  "genetic-algorithm": {
    question: "Can we search without a gradient?",
    promise: "Compare local slope-following with selection, crossover, and mutation.",
  },
};

export function GradientDescentNextConcepts({ exhibits }: { exhibits: readonly ExhibitDefinition[] }) {
  return (
    <div className="mt-8">
      <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Where should you go next?</p>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">You have seen how step size and starting point change optimisation. Pick the next question, not a prescribed lesson.</p>
      <ul className="mt-3 divide-y divide-outline border-y border-outline">
        {exhibits.map((item) => {
          const transition = transitions[item.slug];
          if (!transition) return null;
          return (
            <li key={item.slug}>
              <Link href={`/visualisations/${item.slug}`} className="group/related grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 text-on-surface transition-colors hover:text-primary">
                <span>
                  <span className="font-headline text-base font-medium">{transition.question}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant"><strong className="font-medium text-on-surface">{item.title}.</strong> {transition.promise}</span>
                </span>
                <ChevronRight size={16} className="mt-1 shrink-0 transition-transform group-hover/related:translate-x-1" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
