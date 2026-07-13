# Greatness Plan

Status: adopted
Updated: 2026-07-13

## Decision

Preserve the current static, private, tested platform. Freeze catalogue
expansion at 13 exhibits and move from engineering completeness to creative
distinction by making Gradient Descent the first flagship.

The project is a public laboratory of visual arguments about machine learning:
not a course, generic playground, animated catalogue, or engagement product.

The governing principle is:

> Depth first. Causality visible. Simplifications honest. Interaction earned.
> Memory durable.

## Creative doctrine

Every flagship must make an otherwise difficult relationship inspectable
through meaningful manipulation. It should show what changed, what caused it,
and what followed. Its simplifications must distinguish computed, authored,
precomputed, illustrative, and omitted behaviour. Its memorable image must
come from the mechanism rather than decoration.

Prediction, traces, counterexamples, annotations, and discovery notes are
optional tools. No exhibit must follow a universal choreography. Shared
infrastructure owns routing, state, embeds, accessibility, references, and
responsive boundaries; each exhibit may arrange its explanation differently.

Do not add a shared interaction abstraction until a second exhibit needs the
same semantic capability.

## Flagship scorecard

Score every dimension from 0 to 3: absent, weak, good, exceptional.

| Dimension | Question |
| --- | --- |
| Visual argument | What difficult relationship becomes visible? |
| Interactivity necessity | Why must this be interactive? |
| Causal clarity | Can the visitor identify change, cause, and consequence? |
| Directness | Is the meaningful representation manipulated directly where practical? |
| Surprise or tension | Where does intuition fail or need refinement? |
| Fidelity and honesty | Is computed, authored, illustrative, and omitted behaviour clear? |
| Memory image | Is there one durable visual behaviour or contrast? |
| Interaction coherence | Does every major control serve the central argument? |
| Accessibility equivalence | Is the idea available without fine motor control, colour, continuous motion, or vision alone? |
| Shareability | Can the exhibit itself be linked directly without an account or service? |

A flagship has no zero scores; scores at least 2 for visual argument, causal
clarity, fidelity, and accessibility; and scores 3 in at least two of
interactivity necessity, causal clarity, surprise, and memory image. It also
needs a repeatable one-sentence causal takeaway and no mismatch between visual
implication and actual computation. The maintainer's direct review is the
active correction loop; formal participant observation is useful but does not
block implementation progress.

## Gradient Descent thesis

> Gradient descent sees only the local slope, so the same update rule can
> converge, oscillate, diverge, or settle in a different basin depending on
> surface, step size, and starting point.

Keep the scope to plain full-batch gradient descent with a fixed learning rate.
Do not add momentum, Adam, stochastic batches, schedulers, Hessians, or
optimiser comparisons.

### Signature states

1. Local slope and first update on the bowl.
2. Stable convergence in the narrow valley.
3. Repeated ravine crossings at a high but stable learning rate.
4. Loss-increasing divergence beyond the stability boundary.
5. Two starts reaching different basins on the multimodal surface.

These states must be deterministic and become visual-regression candidates once
the flagship design stabilises.

## Feedback loop

Observe, without coaching, a mix of novice, student, experienced, touch, and
keyboard-oriented users where practical. Record first action, discoverability,
confusion, causal explanation, surprise, and recalled image. Do not use
analytics or ask only whether the participant liked the exhibit.

Record participant observations when available, but continue implementation
from direct maintainer review rather than waiting for a formal sample. Reported
confusion should still be captured and corrected explicitly.

## Release order

1. G0: preserve the baseline, freeze expansion, and define the gate.
2. G1: make Gradient Descent pass the scorecard.
3. G2: incorporate direct review and any available user observations.
4. G3: extract only interaction patterns that prove reusable.
5. G4: select later flagships from evidence, not topic popularity.
6. G5: re-author the homepage around a proven flagship interaction.
7. G6: consider naming only after the product identity is demonstrated.

Overfitting, Decision Tree Partitions, and Kernel Trick are candidates for G4.
Attention requires a fidelity upgrade or narrower mathematical framing before
flagship consideration.

## Non-negotiables

- Static export and GitHub Pages viability.
- No analytics, tracking, cookies, accounts, profiles, advertising, or
  engagement mechanics.
- Non-linear exploration and no forced course sequence.
- Every exhibit has a stable, directly shareable route; exact parameter state is optional.
- Keyboard, touch, pointer, reduced-motion, and nonvisual support.
- Visible assumptions, simplifications, and references.
- Deterministic behaviour where it improves explanation and testing.
- Performance budgets, unit tests, browser checks, and viewport checks remain
  release gates.
- No 14th exhibit until the existing flagship work establishes a reusable
  standard across at least two exhibits.
