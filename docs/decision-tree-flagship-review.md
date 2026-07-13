# Decision Tree Partitions Flagship Review

Status: implementation and visual review complete
Updated: 2026-07-13

## Visual argument

> An early decision-tree split changes which later rules an example can reach,
> so moving one root threshold can reshape several downstream regions at once.

Expected one-sentence recall:

> Moving the first split rerouted every point in the crossed strip, but only
> some rerouted points ended at a different prediction.

## Computation and honesty

- Point labels, the split sequence, and downstream rules are authored to make
  routing geometry legible.
- Prediction regions, root-branch changes, leaf predictions, and accuracy are
  computed directly from those rules.
- The exhibit explains routing and partition geometry, not how CART searches
  for an optimal split.
- Axis-aligned binary classification is shown; pruning, ensembles, missing
  values, and continuous outputs are omitted and disclosed.

## Signature states

| State | URL | Expected evidence |
| --- | --- | --- |
| Root cut | `/visualisations/decision-tree` | One root rule divides the full plane into two leaves. |
| Branch-specific splits | `/visualisations/decision-tree?step=1` | Separate y rules subdivide only the regions routed to their parents. |
| Full partition | `/visualisations/decision-tree?step=2` | The final split refines one upper-right leaf without changing earlier rules. |
| Root propagation | `/visualisations/decision-tree?step=3` | The current threshold 5.5 is compared with kept 4.0; the crossed strip and rerouted points are explicit. |
| Reverse root move | `/visualisations/decision-tree?step=3&threshold=3&refThreshold=4` | Moving the root in the other direction recomputes routing, predictions, and accuracy. |

The reviewed 1440×900 references are stored in
`docs/visual-baselines/decision-tree` and can be regenerated with
`npm run visual:decision-tree` while the static export is running on port 3000.

## Provisional scorecard

| Dimension | Score | Evidence or remaining risk |
| --- | ---: | --- |
| Visual argument | 3 | The tree diagram and rectangular feature-space regions expose the same routing rules. |
| Interactivity necessity | 3 | Dragging the root directly changes branch membership and inherited downstream regions. |
| Causal clarity | 3 | A kept root, affected strip, rerouted-point halos, prediction changes, and accuracy delta separate cause from consequence. |
| Directness | 3 | The root boundary itself is draggable; the adjacent slider and keyboard remain equivalent controls. |
| Surprise or tension | 3 | Rerouting does not necessarily imply a changed prediction, refining simplistic split intuition. |
| Fidelity and honesty | 3 | Routing is computed while the authored split sequence and omitted training process are disclosed. |
| Memory image | 2 | The intended image is a vertical root line sweeping across points while several downstream rectangles change. |
| Interaction coherence | 3 | Depth reveals structure; threshold manipulation demonstrates propagation; the kept root provides contrast. |
| Accessibility equivalence | 2 | Slider, keyboard, live counts, non-colour halos, and four-viewport browser checks communicate the core change. |
| Shareability | 3 | Depth, current root, and kept root are URL-restorable. |

## Choreography decision

This exhibit reuses the kept-comparison command but not the trajectory or
curve treatments from the earlier flagships. Its comparison is a spatial band
with affected points because routing propagation, rather than temporal motion
or error divergence, is the concept that must remain visible.
