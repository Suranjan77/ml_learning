import type { Metadata } from "next";
import LabShell from "@/components/labs/LabShell";
import SamplingLab from "@/components/labs/SamplingLab";

export const metadata: Metadata = {
  title: "Token Sampling Lab",
  description:
    "Watch a language model pick its next word. Turn the temperature and top-k knobs and see the probability distribution reshape in real time.",
};

const guidelines: [string, string, string][] = [
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
];

export default function SamplingLabPage() {
  return (
    <LabShell
      title="Token Sampling Lab"
      lede="Language models don't choose words — they score every candidate, and a sampler picks one."
      theoryHref="/algorithms/llms"
      stats={[
        ["Model", "Word bigram"],
        ["Sampler", "Softmax"],
        ["Knobs", "T · top-k"],
      ]}
      notes={guidelines}
      closing={
        <>
          Real LLMs do exactly this over a vocabulary of ~100,000 tokens
          instead of a handful of words, and usually add a third knob —
          top-p (nucleus) sampling — that keeps the smallest set of words
          whose probabilities sum past a threshold. The mechanics you see
          here are otherwise unchanged.
        </>
      }
    >
      <SamplingLab />
    </LabShell>
  );
}
