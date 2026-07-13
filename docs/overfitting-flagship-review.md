# Overfitting Flagship Review

Status: implementation and visual review complete
Updated: 2026-07-13

## Visual argument

> Increasing model flexibility can keep reducing training error after
> generalisation has already become worse.

Expected one-sentence recall:

> The flexible curve fit the training noise more closely, but its error on
> held-out points rose.

## Computation and honesty

- Training and validation points are deterministic noisy samples from the same
  known function.
- Every displayed polynomial is fitted in-browser to the training split.
- Training and validation mean-squared errors are computed from that fit.
- Degree is the only capacity control; regularisation and cross-validation are
  deliberately omitted and disclosed.
- The dashed truth curve is available because this is an authored synthetic
  experiment, not because real training data normally reveals ground truth.

## Signature states

| State | URL | Expected evidence |
| --- | --- | --- |
| Underfit | `/visualisations/overfitting` | Degree 1 misses the pattern on both splits. |
| Generalising fit | `/visualisations/overfitting?step=1` | A moderate degree keeps both errors low. |
| Memorisation contrast | `/visualisations/overfitting?step=2` | Degree 3 remains as a muted baseline while degree 11 lowers training error and raises validation error. |
| Hidden evidence | `/visualisations/overfitting?step=2&validation=off` | Hiding validation points makes the high-degree training fit look more persuasive without changing its measured validation error. |
| Resampled contrast | `/visualisations/overfitting?step=2&seed=2` | The same degree-only comparison is recomputed on a second deterministic sample. |

Generate the five 1440×900 references with
`npm run visual:overfitting` while the static export is running on port 3000.
The reviewed references are stored in `docs/visual-baselines/overfitting`.

## Provisional scorecard

| Dimension | Score | Evidence or remaining risk |
| --- | ---: | --- |
| Visual argument | 3 | The fitted curve and error curves expose the same capacity change in two representations. |
| Interactivity necessity | 3 | Degree and sample changes recompute both the visible fit and held-out error. |
| Causal clarity | 3 | The kept fit holds data constant and changes only degree; exact before/after errors are stated. |
| Directness | 2 | Degree is manipulated adjacent to the plots, while the curve and error marker respond directly. |
| Surprise or tension | 3 | Better training performance visibly coincides with worse validation performance. |
| Fidelity and honesty | 3 | Fits and errors are computed; the synthetic truth and omissions are disclosed. |
| Memory image | 2 | The intended image is a smooth kept curve under a noise-chasing current curve while the two error lines separate. |
| Interaction coherence | 2 | Degree, resampling, validation visibility, and kept comparison all serve the generalisation argument. |
| Accessibility equivalence | 2 | Keyboard degree control, live computed error descriptions, and four-viewport browser checks pass. |
| Shareability | 3 | Degree, data seed, validation visibility, and kept degree are URL-restorable. |

## Reusable pattern decision

Gradient Descent and Overfitting both need a visitor-controlled kept baseline,
but their comparisons remain visually different. Only the compact kept-state
command is a candidate for shared code; trajectory ghosts, fitted curves,
outcome annotations, and causal summaries remain exhibit-owned.
