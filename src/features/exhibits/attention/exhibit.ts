import type { ExhibitDefinition } from "../types";

export const attentionExhibit: ExhibitDefinition = {
  slug: "attention",
  title: "Self-attention weights",
  question: "How does a self-attention head turn query-key similarity into weights?",
  summary:
    "Select a query token and inspect the similarity scores and softmax weights it computes against every key.",
  insight:
    "Scaled dot products produce similarity scores; softmax turns those scores into a distribution used to mix token representations.",
  topic: "Language models",
  difficulty: "Approachable",
  duration: 5,
  renderer: "SVG",
  tags: ["transformer", "self-attention", "language model", "context", "tokens", "weights"],
  related: ["token-sampling", "backpropagation"],
  assumptions: [
    "Weights are computed in-browser with scaled dot-product attention over small hand-authored query and key vectors; they are not output from a trained transformer.",
    "The reference query includes a hand-authored feature from the sentence ending, standing in for context supplied by an earlier layer.",
    "One head over one short sentence is shown; value vectors, multi-head mixing, learned projections, residual connections, and later layers are omitted.",
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
        "Each query-key dot product is scaled by √d; softmax turns the resulting scores into the displayed weights.",
    },
    {
      title: "Change one word",
      instruction:
        "Choose the sentence ending in ‘wide’, then select ‘it’ again.",
      observation:
        "Only the ending changes; every score and weight is recomputed while the query stays ‘it’.",
    },
    {
      title: "Inspect another pattern",
      instruction:
        "Switch to the Previous token pattern and move through the tokens with the arrow keys.",
      observation:
        "The positional query aligns with the preceding key, showing how a different query-key projection produces a different distribution.",
    },
  ],
  challenges: [
    "Find a token whose strongest target changes when you switch attention patterns.",
    "Use only the keyboard to compare ‘it’ in both sentences.",
    "Explain why a large attention weight is not, by itself, proof of model reasoning.",
  ],
};
