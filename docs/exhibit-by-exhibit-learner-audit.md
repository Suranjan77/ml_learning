# Exhibit-by-Exhibit Learner Audit

Status: implementation brief
Updated: 2026-07-14

This audit treats every visualisation as a different visual argument. It does
not prescribe one sequence of prompts or one layout. The shared acceptance
test is narrower: the manipulated cause, visible consequence, explanation, and
memory image must agree.

## 1. Gradient Descent

**Argument:** local downhill information plus step size produces convergence,
valley crossing, instability, or a different basin.

**Current strength:** the analytic surfaces, path assessment, kept path, and
confound labels already support controlled experiments.

**Problem:** perspective hides valley-floor crossings; current and kept paths
have weak visual hierarchy; the oscillating answer is shown before the learner
forms an expectation; no final state reinstates the stable/unstable contrast.

**Treatment:** mark the valley floor and crossings in 3D, add a computed
top-view inset, use distinct current/reference path semantics, replace the
generic evidence panel with state-specific comparisons, promote the computed
stability-boundary experiment, and end on the two-path memory image.

## 2. Overfitting

**Argument:** increasing flexibility can lower training error while increasing
held-out error.

**Current strength:** current and kept fits share one dataset, and the degree
error curves are computed for all tested degrees.

**Problem:** the decisive generalisation gap is encoded as two small values and
two distant curves. The error chart devotes substantial space to history but
does not visually join the selected training and validation errors. The
learner sees a wiggly curve, but the controlled contradiction is not the
strongest shape on the page.

**Treatment:** connect the selected train/validation values with a labelled
gap, add directional change markers from kept to current degree, and turn the
high-degree state into a direct “training improved / validation worsened”
reveal. Keep the data sample fixed during that claim.

## 3. Decision Tree Partitions

**Argument:** one threshold reroutes examples into another subtree, where only
some rerouted examples receive a different prediction.

**Current strength:** feature-space regions and the rule tree are shown
together; the root is directly draggable; a kept threshold makes rerouting
countable.

**Problem:** highlighted rerouted points are not visibly traceable through the
tree. The learner must mentally map a point on the left to an unhighlighted
sequence of nodes on the right.

**Treatment:** choose one informative rerouted example, give it a numbered
focus ring, highlight its current route and leaf in the tree, and state whether
rerouting changed its prediction. Preserve the aggregate counts as supporting
evidence.

## 4. Kernel Trick

**Argument:** an explicit radial feature lifts concentric classes so one flat
threshold in feature space corresponds to a circle in input space.

**Current strength:** the map, support samples, margins, plane, circle, and
four exact correspondences are mathematically joined.

**Problem:** the final input-space state replaces the lifted plane. The learner
must remember the previous view precisely at the moment the equivalence should
become the memory image.

**Treatment:** retain the 3D separator in the final state and add a simultaneous
input-space inset using the same points, radius, and class colours. Label the
shared threshold on both sides; do not imply a generic feature map beyond the
disclosed radial example.

## 5. Self-Attention

**Argument:** a selected query produces scaled query-key scores, softmax turns
those scores into weights, and a different projection or token changes the
distribution.

**Current strength:** width-as-weight arcs, exact computed scores, keyboard
query selection, and retained ending comparisons make redistribution visible.

**Problem:** the diagram is excellent at showing “where attention goes” but
less direct about the question in the title—how one similarity becomes one
weight. Formula disclosure is detached from a concrete selected connection.

**Treatment:** for the strongest target, show a compact score → exp/softmax →
weight trace tied to the highlighted arc. When a comparison exists, show its
signed weight change at the target rather than only a tiny prior marker.

## 6. Principal Component Analysis

**Argument:** rotating a one-dimensional axis trades projected spread against
perpendicular reconstruction loss.

**Current strength:** the axis is directly draggable; every projection and
lost distance is visible; the optimum is computed.

**Problem:** projected points remain overlaid on the 2D cloud, so the promised
compressed representation is never shown as data that actually has only one
coordinate. The metric panel tells the result more strongly than the visual.

**Treatment:** add a separate 1D score strip aligned to the current axis, with
the same projected scalar coordinates and no second spatial dimension. Let
the strip visibly spread or collapse as the axis rotates.

## 7. K-means

**Argument:** assignment to the nearest centroid and movement to each assigned
mean alternate; both reduce inertia, yet a poor start can converge badly.

**Current strength:** centroid dragging, nearest-region tint, assignments,
half-step playback, and exact inertia all use one deterministic model.

**Problem:** each phase largely replaces the previous one. It is easy to see
that centroids moved without seeing that they moved specifically to the mean
of the just-assigned points. The poor-start ending lacks a retained good-start
counterfactual.

**Treatment:** retain ghost centroids and movement arrows through update
phases, label the assign/move rule currently responsible, and show the poor
ending beside a small deterministic better-start inertia reference.

## 8. Token Sampling

**Argument:** temperature reshapes the complete distribution; top-k and top-p
then remove candidates; a random draw selects from the surviving mass.

**Current strength:** bars, entropy, survivor count, the unit interval, and
repeatable sample history expose all three operations.

**Problem:** moving temperature replaces the old distribution, making
“flattened” or “sharpened” a memory task. Truncation mainly appears as absent
bars rather than excluded probability mass.

**Treatment:** keep the default-temperature bar lengths as thin outlines,
show signed probability changes for the largest movers, and visibly mark
excluded rows/cumulative mass under truncation. Keep random sampling distinct
from argmax selection.

## 9. CNN Feature Maps

**Argument:** the same small filter performs a local dot product at every
position; ReLU and pooling then transform those responses.

**Current strength:** selecting an output cell identifies its exact input
patch, and keyboard/pointer controls share one computation.

**Problem:** the essential multiplication is compressed into “Σ patch ×
filter”. The input patch and filter are visible, but the nine cellwise products
that cause the selected output are not.

**Treatment:** show a compact 3×3 product grid or explicit nine-term equation
for the selected cell, then connect its sum to the highlighted output. In the
pooling state, outline each 2×2 source block so “max of nearby evidence” is
visible rather than merely stated.

## 10. Backpropagation

**Argument:** the chain rule assigns each weight a signed responsibility for
the loss; activations move forward, sensitivities are computed backward.

**Current strength:** forward values, signed connection gradients, the target,
loss, one-update preview, and deterministic replay are all computed.

**Problem:** the backward arrow and six derivative labels show results without
showing one causal chain of factors. “Chain rule” remains a caption rather than
a visible multiplication.

**Treatment:** highlight one input→hidden→output route and expand one weight
gradient into downstream error × local sensitivity × input. Keep the other
gradients visible but subordinate so the learner can transfer the pattern.

## 11. Regression Parameters

**Argument:** slope and intercept are simultaneously geometry in prediction
space and coordinates on a loss surface.

**Current strength:** the data view and parameter map update together for
linear and logistic modes.

**Problem:** the “loss map” reads as a tinted rectangle rather than a surface:
it lacks contour structure, a clearly labelled intercept axis, and direct
manipulation. The strongest idea—one point is the line—is therefore weaker on
the right than on the left.

**Treatment:** render computed loss contours and axis labels, add crosshairs
from the current parameter point, and make the map directly clickable/keyboard
movable. Retain sliders as precise controls and expose the resulting line/loss
nonvisually.

## 12. Genetic Algorithm

**Argument:** selection exploits current fitness, crossover recombines bits,
and mutation preserves variation needed to escape a local peak.

**Current strength:** genomes map to positions, one real reproduction event is
dissected, mutations are distinguished, and the global/local peaks are explicit.

**Problem:** population diversity is a number while convergence is a spatial
event. The reproduction example is small relative to empty panel space, and
the mutation/no-mutation tension is not retained across time.

**Treatment:** enlarge and align the parent/crossover/mutation bit rows with a
visible cut and changed-bit markers, and add best-fitness/diversity history so
premature convergence becomes a visible divergence between two trends.

## 13. Particle Swarm

**Argument:** each move combines inertia, personal memory, and shared evidence;
strong agreement can improve quickly while destroying exploration.

**Current strength:** one particle's exact force components are rendered as a
vector chain, global discoveries are counted, and the premature-collapse and
repulsion states are deterministic.

**Problem:** the opening asks the learner to select a particle before the main
mechanism appears. In collapse, particles overlap so successfully that the
visual can look empty rather than compressed.

**Treatment:** seed an informative selected particle in the force-combination
state, keep selection optional in the opening, and add a magnified cluster
inset when spread becomes very small. Tie the inset to the spread history so
collapse reads as evidence, not a rendering failure.

## Shared changes justified by repeated evidence

Only two shell-level changes recur across nearly every exhibit:

1. Guided observations must remain visible at every viewport rather than being
   hidden below `md`.
2. Related links should answer a next question, not merely list metadata.

Prediction prompts, reveal logic, visual traces, comparison thresholds, and
memory images remain exhibit-owned until a second implementation proves an
identical semantic and interaction need.
