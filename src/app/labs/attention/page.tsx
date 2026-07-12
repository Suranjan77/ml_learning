import type { Metadata } from "next";
import LabShell from "@/components/labs/LabShell";
import AttentionLab from "@/components/labs/AttentionLab";

export const metadata: Metadata = {
  title: "Attention Lab",
  description:
    "Pick a sentence and see which words each token looks at. The heatmap behind every transformer, made hoverable.",
};

const guidelines: [string, string, string][] = [
  [
    "01",
    "Hover a Token",
    "Every other chip's shade shows how much attention flows out of the token under your cursor — darker means more. Curved arcs trace the top three targets.",
  ],
  [
    "02",
    "Switch Heads",
    "Each sentence ships two heads: one hand-tuned to a real, documented pattern, and a \"Previous token\" head that always looks one step back. Compare how differently they light up the same sentence.",
  ],
  [
    "03",
    "Flip the Referent",
    "The first two sentences are the same up to one word. Watch \"it\" swing its attention from \"animal\" to \"street\" as the ending changes from \"tired\" to \"wide\".",
  ],
  [
    "04",
    "Read the Full Matrix",
    "The grid below is every row at once — rows are the attending token, columns are what's attended to. Hover any cell for its exact weight.",
  ],
];

export default function AttentionLabPage() {
  return (
    <LabShell
      title="Attention Lab"
      lede="Attention is how a transformer decides what a word means from context."
      theoryHref="/algorithms/transformers"
      stats={[
        ["Sentences", "4 presets"],
        ["Heads", "2 per sentence"],
        ["View", "Arcs + matrix"],
      ]}
      notes={guidelines}
      closing={
        <>
          The weights here are hand-crafted, not extracted from a trained
          model — they&rsquo;re built to mirror patterns observed in real
          transformers, like the classic pronoun-resolution example from
          the original &ldquo;Attention Is All You Need&rdquo; paper. Real
          models run this over dozens of heads and layers at once, each
          specializing in a different kind of relationship, and the
          weights emerge from training rather than being written by hand.
          The mechanics — one softmax row per token, weights that sum to
          one, values mixed by those weights — are otherwise unchanged.
        </>
      }
    >
      <AttentionLab />
    </LabShell>
  );
}
