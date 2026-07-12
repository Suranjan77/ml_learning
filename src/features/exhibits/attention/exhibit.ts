import type { ExhibitDefinition } from "../types";

export const attentionExhibit: ExhibitDefinition = {
  slug: "attention",
  title: "Follow the Attention",
  question: "Which words does a transformer look at?",
  summary:
    "Select a token and inspect the weighted connections it makes to the rest of a sentence.",
  insight:
    "Attention builds a context-sensitive mixture of other token representations; changing one word can shift which connection receives the most weight.",
  topic: "Language models",
  difficulty: "Approachable",
  duration: 5,
  renderer: "SVG",
  tags: ["transformer", "self-attention", "language model", "context", "tokens", "weights"],
  related: ["token-sampling", "backpropagation"],
  assumptions: [
    "Attention weights are hand-authored exemplars chosen to show how “it” resolves to different tokens; they are not computed from a trained transformer.",
    "A single attention head over one short sentence is shown; multi-head mixing, positional encodings, and later layers are omitted.",
  ],
  references: [
    { label: "Vaswani et al., Attention Is All You Need (2017)", href: "https://arxiv.org/abs/1706.03762" },
    { label: "Bahdanau, Cho & Bengio, Neural Machine Translation by Jointly Learning to Align and Translate (2015)", href: "https://arxiv.org/abs/1409.0473" },
  ],
  steps: [
    {
      title: "Ask what ‘it’ refers to",
      instruction:
        "Start with the tired sentence and select ‘it’. Compare its three strongest targets.",
      observation:
        "In this illustration, ‘animal’ receives the strongest weight because animals can be tired.",
    },
    {
      title: "Change one word",
      instruction:
        "Choose the sentence ending in ‘wide’, then select ‘it’ again.",
      observation:
        "The strongest target shifts to ‘street’. Attention weights depend on context, not token identity alone.",
    },
    {
      title: "Inspect another pattern",
      instruction:
        "Switch to the Previous token pattern and move through the tokens with the arrow keys.",
      observation:
        "Different heads can express different relationships; this illustrative head mostly follows local sequence order.",
    },
  ],
  challenges: [
    "Find a token whose strongest target changes when you switch attention patterns.",
    "Use only the keyboard to compare ‘it’ in both sentences.",
    "Explain why a large attention weight is not, by itself, proof of model reasoning.",
  ],
};
