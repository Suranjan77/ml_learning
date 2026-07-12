/**
 * Hand-authored sentences and attention matrices for the Attention Lab.
 *
 * These matrices are NOT extracted from a real model. They are hand-crafted,
 * pedagogical illustrations of attention patterns that are documented in
 * real trained transformers — most notably the pronoun-resolution example
 * from Vaswani et al., "Attention Is All You Need" (2017), and the widely
 * observed "previous token" and "attention sink" head types. Rows always
 * sum to 1 (a softmax's worth of attention leaving a token); weights[i][j]
 * is the attention paid FROM token i TO token j.
 *
 * Tokenization is whitespace-based with trailing punctuation split off as
 * its own token, authored by hand — there is no runtime tokenizer here.
 */

export interface AttentionHead {
  name: string;
  description: string;
  /** weights[i][j] = attention FROM token i TO token j. Each row sums to 1. */
  weights: number[][];
}

export interface AttentionSentence {
  id: string;
  text: string;
  tokens: string[];
  note: string;
  heads: AttentionHead[];
}

const sentence_coref_tired: AttentionSentence = {
  id: "coref-tired",
  text: "The animal didn't cross the street because it was too tired.",
  tokens: ["The","animal","didn't","cross","the","street","because","it","was","too","tired","."],
  note: "“It” resolves to “animal” — tired things are usually animals, not streets.",
  heads: [
    {
      name: "Coreference",
      description: "A documented pattern in trained transformers (from the original \"Attention Is All You Need\" paper): the pronoun looks back to resolve what it refers to.",
      weights: [
        [0.40, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.10],
        [0.20, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.03, 0.55, 0.03, 0.03, 0.03, 0.15, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40],
      ],
    },
    {
      name: "Previous token",
      description: "A documented pattern found in many trained transformer heads: each token attends mostly to the token immediately before it, tracking local sequence order.",
      weights: [
        [0.70, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.10],
        [0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.05],
      ],
    },
  ],
};

const sentence_coref_wide: AttentionSentence = {
  id: "coref-wide",
  text: "The animal didn't cross the street because it was too wide.",
  tokens: ["The","animal","didn't","cross","the","street","because","it","was","too","wide","."],
  note: "Flip one word — “tired” to “wide” — and “it” now resolves to “street” instead of “animal”, the classic Winograd-schema pair.",
  heads: [
    {
      name: "Coreference",
      description: "A documented pattern in trained transformers (from the original \"Attention Is All You Need\" paper): the pronoun looks back to resolve what it refers to.",
      weights: [
        [0.40, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.10],
        [0.20, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04, 0.04, 0.04],
        [0.03, 0.15, 0.03, 0.03, 0.03, 0.55, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40, 0.04],
        [0.20, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.40],
      ],
    },
    {
      name: "Previous token",
      description: "A documented pattern found in many trained transformer heads: each token attends mostly to the token immediately before it, tracking local sequence order.",
      weights: [
        [0.70, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.10],
        [0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.05],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.05],
      ],
    },
  ],
};

const sentence_subject_verb_keys: AttentionSentence = {
  id: "subject-verb-keys",
  text: "The keys to the cabinet are on the table.",
  tokens: ["The","keys","to","the","cabinet","are","on","the","table","."],
  note: "“Are” agrees with the plural subject “keys”, not the nearer singular “cabinet” that sits right before it.",
  heads: [
    {
      name: "Subject–verb",
      description: "Illustrates subject-verb agreement: the verb attends past the nearer distractor noun back to its true subject.",
      weights: [
        [0.40, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.12],
        [0.20, 0.40, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
        [0.20, 0.05, 0.40, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
        [0.20, 0.05, 0.05, 0.40, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
        [0.20, 0.05, 0.05, 0.05, 0.40, 0.05, 0.05, 0.05, 0.05, 0.05],
        [0.03, 0.55, 0.03, 0.03, 0.15, 0.03, 0.03, 0.03, 0.03, 0.09],
        [0.20, 0.05, 0.05, 0.05, 0.05, 0.05, 0.40, 0.05, 0.05, 0.05],
        [0.20, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.40, 0.05, 0.05],
        [0.20, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.40, 0.05],
        [0.20, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.40],
      ],
    },
    {
      name: "Previous token",
      description: "A documented pattern found in many trained transformer heads: each token attends mostly to the token immediately before it, tracking local sequence order.",
      weights: [
        [0.70, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.06],
        [0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.09],
        [0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.09],
        [0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.09],
        [0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.02, 0.09],
        [0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.02, 0.09],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.02, 0.09],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.02, 0.09],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.02, 0.09],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.75, 0.09],
      ],
    },
  ],
};

const sentence_pouring_glass: AttentionSentence = {
  id: "pouring-glass",
  text: "She poured water from the bottle into the glass until it was full.",
  tokens: ["She","poured","water","from","the","bottle","into","the","glass","until","it","was","full","."],
  note: "“It” resolves to “glass”, the vessel being filled — not “bottle”, the vessel being emptied.",
  heads: [
    {
      name: "Coreference",
      description: "A documented pattern in trained transformers (from the original \"Attention Is All You Need\" paper): the pronoun looks back to resolve what it refers to.",
      weights: [
        [0.40, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.12],
        [0.20, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.40, 0.03, 0.03, 0.03, 0.07],
        [0.02, 0.02, 0.02, 0.02, 0.02, 0.15, 0.02, 0.02, 0.55, 0.02, 0.02, 0.02, 0.02, 0.08],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.40, 0.03, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.40, 0.07],
        [0.20, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.07, 0.40],
      ],
    },
    {
      name: "Previous token",
      description: "A documented pattern found in many trained transformer heads: each token attends mostly to the token immediately before it, tracking local sequence order.",
      weights: [
        [0.70, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.06],
        [0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.01, 0.13],
        [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.75, 0.13],
      ],
    },
  ],
};

export const attentionSentences: AttentionSentence[] = [
  sentence_coref_tired,
  sentence_coref_wide,
  sentence_subject_verb_keys,
  sentence_pouring_glass,
];
