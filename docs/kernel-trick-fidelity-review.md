# Feature Maps and Kernels Fidelity Review

Status: implementation and visual review complete
Updated: 2026-07-13

## Visual argument

> A flat threshold in the displayed feature space is the same boundary as a
> circle in the original input space.

Expected one-sentence recall:

> Squared distance lifts every point on one input-space circle to the same
> height, so a horizontal threshold maps back to that circle.

## What is computed

The deterministic dataset is mapped in the browser with:

```text
phi(x, y) = (x, y, (r / R)^2)
K(a, b) = phi(a) dot phi(b)
```

The separator height is halfway between the closest lifted samples from the
two classes. Its input-space radius is computed by inverting the radial map.
The solid contour on the mapped surface, the four dashed correspondences, and
the input-space circle therefore represent the same threshold.

## What remains authored

- The core-and-ring dataset is chosen by hand.
- The visible map is one explicit radial example, not a learned transform.
- The third axis is drawn at 4.2 times its mathematical scale for legibility;
  printed values and the kernel calculation use the unscaled coordinate.
- The separator is restricted to a horizontal plane for this radial example.
- No general hard- or soft-margin SVM optimisation runs in the browser.
- A practical kernel method can evaluate the induced dot product without
  constructing or drawing the coordinates shown here.

## Signature states

| State | URL | Expected evidence |
| --- | --- | --- |
| Input space | `/visualisations/kernel-trick?step=0` | A top-down core-and-ring arrangement cannot be divided by one straight line. |
| Explicit map | `/visualisations/kernel-trick?step=1` | The angled view shows outer points rising with squared radial distance. |
| Flat separator | `/visualisations/kernel-trick?step=2` | The horizontal plane, lifted contour, ground circle, and dashed correspondences are visible together. |
| Circular boundary | `/visualisations/kernel-trick?step=3` | The authored top-down camera shows the exact input-space circle. |

Generate the four 1440x900 references with `npm run visual:kernel` while the
static export is running on port 3000.

## Provisional scorecard

| Dimension | Score | Evidence or remaining risk |
| --- | ---: | --- |
| Visual argument | 3 | The same computed threshold is drawn as a plane contour and an input-space circle. |
| Interactivity necessity | 2 | The continuous view transition and free orbit expose a spatial relationship that a single fixed view obscures. |
| Causal clarity | 3 | Exact solid contours and dashed vertical correspondences connect the two representations. |
| Directness | 2 | The visitor controls the representation transition and camera directly. |
| Surprise or tension | 2 | A circular boundary becomes a flat threshold without changing class membership. |
| Fidelity and honesty | 3 | The explicit map, induced kernel, restricted separator, authored data, and omitted solver are stated separately. |
| Memory image | 3 | A horizontal plane and circle are shown as two views of one threshold. |
| Interaction coherence | 3 | The view control and orbit serve only the map-to-boundary relationship. |
| Accessibility equivalence | 2 | Keyboard slider, value text, factual descriptions, and step observations state the same relationship. |
| Shareability | 3 | Guided state and the continuous view position are URL-restorable. |
