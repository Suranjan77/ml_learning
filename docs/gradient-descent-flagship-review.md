# Gradient Descent Flagship Review

Status: revision after observation 1; retest pending
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

These URLs use only deterministic model state and are the candidates for visual
regression once a WebGL-capable baseline environment is selected.

| State | URL | Expected evidence |
| --- | --- | --- |
| Local slope and first update | `/visualisations/gradient-descent?step=1` | One computed update and its local gradient are visible. |
| Stable valley convergence | `/visualisations/gradient-descent?step=2&lr=0.4` | The 14-step loss is lower without crossing the stability boundary. |
| Ravine oscillation | `/visualisations/gradient-descent?step=2` | The path repeatedly crosses the valley at learning rate 0.90. |
| Divergence | `/visualisations/gradient-descent?step=2&lr=1.06` | The 14-step loss is higher immediately beyond the tested stable boundary. |
| Different basins | `/visualisations/gradient-descent?step=3&x=0.4&y=0.4&refX=-3.4&refY=1.9&refLr=0.24` | The kept start ends near loss 1.53 while the current start reaches loss 0.00. |

All five states are covered by model, component, or browser assertions. The
Firefox baseline environment renders a real 1406×535 WebGL canvas and rejects
uniform frames before capture. Regenerate the reviewed 1440×900 references with
`npx playwright install firefox` followed by `npm run visual:gradient` while the
static export is running on port 3000.

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
2. Attach `Local downhill` to the green direction mark and call its values the
   local slope.
3. Name the computed full-path states `converging`, `oscillating`, and
   `diverging` beside the learning-rate control and in the outcome.
4. Promote path keeping from an underlined text link to a full comparison
   command.

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

The exhibit is below the flagship threshold because causal clarity is below 2
and the intended memory image has not survived unaided use. Implementation of
the first revision does not raise these scores until another uncoached session
confirms the changes.

## Observation priorities

1. Does the visitor understand that the downhill arrow is local information,
   not a planned route?
2. Can the visitor distinguish oscillation that still lowers loss from true
   divergence?
3. Is `Keep this path to compare` discovered before coaching?
4. Does the visitor understand the warning when both start and rate change, and
   then return to a one-variable comparison?
5. After leaving the page, do they recall the ravine crossing rather than the
   controls or 3D surface alone?
6. Do they incorrectly conclude that a higher learning rate is generally more
   likely to reach the global minimum after exploring the many-minima surface?

Record sessions in `docs/flagship-observation-log.md` and revise this scorecard
from evidence rather than preference.
