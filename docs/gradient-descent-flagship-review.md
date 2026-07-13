# Gradient Descent Flagship Review

Status: implementation accepted for progression; direct review remains active
Updated: 2026-07-13

## Visual argument

> Gradient descent sees only the local slope, so the same update rule can
> converge, oscillate, diverge, or settle in a different basin depending on
> surface, step size, and starting point.

Expected one-sentence recall:

> Gradient descent only reacts to the slope where it is, so larger steps can
> cross a valley or diverge, and a different start can lead to a different
> basin.

## Reproducible signature states

These URLs use only deterministic model state and define the visual-regression
states.

| State | URL | Expected evidence |
| --- | --- | --- |
| Local slope and first update | `/visualisations/gradient-descent?step=1` | One computed update and its local gradient are visible. |
| Stable valley convergence | `/visualisations/gradient-descent?step=2&lr=0.4` | The 14-step loss is lower without crossing the stability boundary. |
| Ravine oscillation | `/visualisations/gradient-descent?step=2` | The path repeatedly crosses the valley at learning rate 0.90. |
| Divergence | `/visualisations/gradient-descent?step=2&lr=1.06` | The 14-step loss is higher immediately beyond the tested stable boundary. |
| Different basins | `/visualisations/gradient-descent?step=3` | The guided default holds learning rate constant; the kept start ends near loss 1.53 while the current start reaches loss 0.00. |

All five states are covered by model, component, or browser assertions. The
Firefox baseline environment renders a real 1406×535 WebGL canvas and rejects
uniform frames before capture. Regenerate the reviewed 1440×900 references with
`npx playwright install firefox` followed by `npm run visual:gradient` while the
static export is running on port 3000.

The camera is aimed explicitly at the same target used by orbit controls. This
keeps the surface framed on portrait canvases without removing background-drag
rotation, which remains part of the inspection workflow.

## Observation evidence

### Session 1 — ML-familiar, laptop, pointer and keyboard

The first uncoached action was rotating the 3D camera. The participant did not
discover the principal manipulation, understand the local downhill arrow,
distinguish oscillation from divergence, or understand the kept-path
comparison. Their summary that the page was unclear about what to do is
consistent with all four failures.

After interaction, the participant correctly connected a larger learning rate
with larger steps and understood that gradient descent only knows the nearby
surface. They also noticed that a large step could skip a minimum. However,
they generalised one explored result into "higher reaches the global minimum,
lower gets stuck," and remembered the red point moving toward green rather
than the intended ravine-oscillation contrast.

This session supports four immediate revisions:

1. Preserve useful camera orbit while clarifying the two gesture zones: surface
   drag moves the start; background drag rotates the view.
2. Draw local downhill as an actual arrow and call its values the local slope;
   a text label was tried and removed because it distracted from the geometry.
3. Name the computed full-path states `converging`, `oscillating`, and
   `diverging` beside the learning-rate control and in the outcome.
4. Promote path keeping from an underlined text link to a full comparison
   command.

The guided revision also opens the valley with a stable kept path and the
many-minima surface with two starts at the same rate. This makes both causal
contrasts inspectable immediately while keeping clearing, replacing, and
sharing the comparison available. The outcome panel names both valley regimes
and the grey trajectory carries an attached kept-path label instead of asking
visitors to infer its identity or behaviour from shape alone.

It does not establish novice, touch, mobile, or keyboard-only comprehension,
and it does not justify changing the many-minima model from a sample of one.
The "higher is better" inference is a priority question for the next sessions.
The raw record remains in `docs/flagship-observation-log.md`.

## Evidence-based scorecard

| Dimension | Score | Evidence or remaining risk |
| --- | ---: | --- |
| Visual argument | 3 | Local slope, step size, geometry, and basin outcome are joined in one computed scene. |
| Interactivity necessity | 3 | Moving a start and changing one rate directly produces different trajectories. |
| Causal clarity | 1 | The first participant did not understand the arrow, the two failure regimes, or the kept comparison. The revision needs observation. |
| Directness | 2 | Starts move on the surface by pointer or keyboard, but the distinction between surface drag and background orbit needs observation. |
| Surprise or tension | 3 | Larger steps become worse, and identical rules reach unequal minima. |
| Fidelity and honesty | 3 | Analytic authored surfaces and omitted optimiser features are disclosed. |
| Memory image | 1 | The recalled image was the red point moving toward green, not ravine oscillation or divergence. |
| Interaction coherence | 1 | The participant reported that it was unclear what to do and did not discover comparison. Four controls or cues were revised. |
| Accessibility equivalence | 2 | Keyboard input, live causal descriptions, reduced motion, and an explicit WebGL fallback exist. |
| Shareability | 3 | Current and kept starts, rates, surface, and guided step restore from the URL. |

These scores preserve what the first session established; they are not treated
as a progression gate. The maintainer will report concrete issues directly as
the implementation continues.

## Observation priorities

1. Does the visitor understand that the downhill arrow is local information,
   not a planned route?
2. Can the visitor distinguish oscillation that still lowers loss from true
   divergence?
3. Is the seeded grey comparison path understood without coaching, including
   which variable differs?
4. Does the visitor understand the warning when both start and rate change, and
   then return to a one-variable comparison?
5. After leaving the page, do they recall the ravine crossing rather than the
   controls or 3D surface alone?
6. Do they incorrectly conclude that a higher learning rate is generally more
   likely to reach the global minimum after exploring the many-minima surface?

Record further sessions in `docs/flagship-observation-log.md` when they are
available, and keep direct maintainer corrections in this review.
