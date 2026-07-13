# Attention Fidelity Review

Status: implementation and visual review complete
Updated: 2026-07-13

## Question

> How does a self-attention head turn query-key similarity into weights?

## What is computed

For every selected query, the exhibit computes each score and probability in
the browser:

```text
score(q, k) = q · k / sqrt(d)
weight(q, k) = softmax(scores)
```

The displayed percentages, connection widths, ranks, and text alternative all
come from those computed weights. Changing the sentence ending changes the
authored contextual query vector; changing the pattern selects another authored
query/key projection. No probability row is authored directly.

## What remains authored

- The six-dimensional semantic feature vectors are chosen by hand.
- The reference query receives an ending feature that stands in for context
  supplied by an earlier layer.
- The previous-token pattern uses an eight-dimensional positional basis.
- The vectors are not learned parameters and the output is not taken from a
  trained transformer.
- Value vectors, learned projections, multi-head mixing, residual connections,
  normalisation, and later layers are omitted.

The exhibit therefore explains scaled dot-product scoring and softmax mixing.
It does not claim to reveal how a production model represents or reasons about
this sentence.

## Reproducible states

| State | URL | Expected evidence |
| --- | --- | --- |
| Tired reference | `/visualisations/attention` | The contextual query gives Animal the highest computed score and weight. |
| Wide reference | `/visualisations/attention?ending=wide` | The same query token now gives street the highest score and weight. |
| Previous position | `/visualisations/attention?head=previous-token&query=6` | The positional query aligns most strongly with the preceding token. |
| Street query | `/visualisations/attention?query=3` | A non-pronoun query produces its own score and softmax distribution. |

Generate the four 1440×900 references with `npm run visual:attention` while the
static export is running on port 3000.

The reviewed references are stored in `docs/visual-baselines/attention`. The
scene also passes the shared 390×844, 768×1024, 1280×720, and 1440×900
workspace checks; the portrait layout keeps all tokens, weights, and the
computed/authored disclosure visible.

## Remaining product question

The mechanism is now computed honestly, but the two sentence endings are still
viewed one at a time. A future flagship review should decide whether a retained
before/after distribution improves the context-change argument without making
the compact scene too dense.
