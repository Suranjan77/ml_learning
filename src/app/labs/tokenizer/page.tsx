import type { Metadata } from "next";
import LabShell from "@/components/labs/LabShell";
import TokenizerLab from "@/components/labs/TokenizerLab";
import { merges, vocabAt } from "@/components/labs/bpe";

export const metadata: Metadata = {
  title: "Tokenizer Lab",
  description:
    "Type anything and watch byte-pair encoding chop it into tokens, one merge at a time — the same trick every LLM uses to read.",
};

const guidelines: [string, string, string][] = [
  [
    "01",
    "Type Your Own Text",
    "The tokenizer was trained on a small corpus of everyday sentences, so common words and English letter patterns compress well — unfamiliar words fall back to shorter pieces.",
  ],
  [
    "02",
    "Scrub the Merge Steps",
    "At merge 0, every character is its own token. Drag the slider right and watch pairs of tokens fuse in the exact order the algorithm learned them.",
  ],
  [
    "03",
    "Watch the Boundaries",
    "Each chip is one token; the notch marks where a word ends. A merge never crosses a word boundary, so tokens never straddle two words.",
  ],
  [
    "04",
    "Check the Vocabulary",
    "Every merge adds exactly one new symbol to the vocabulary. Compare the vocab size at merge 0 against the full run to see how much a tokenizer's vocabulary costs.",
  ],
];

export default function TokenizerLabPage() {
  return (
    <LabShell
      title="Tokenizer Lab"
      lede="Before a language model can read a sentence, it has to chop it into pieces."
      theoryHref="/algorithms/embeddings-tokenization"
      stats={[
        ["Algorithm", "Byte-pair encoding"],
        ["Trained merges", String(merges.length)],
        ["Full vocab", String(vocabAt(merges.length))],
      ]}
      notes={guidelines}
      closing={
        <>
          Real tokenizers like GPT&rsquo;s work identically but at a much
          larger scale — trained on hundreds of gigabytes of text with
          tens of thousands of merges, operating on raw bytes rather than
          characters so any language or symbol can be represented. The
          mechanics — count pairs, merge the most frequent, repeat — are
          exactly what you just watched happen a few hundred times over.
        </>
      }
    >
      <TokenizerLab />
    </LabShell>
  );
}
