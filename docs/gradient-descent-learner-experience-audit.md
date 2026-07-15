# Gradient Descent Learner-Experience Audit

Status: pre-implementation audit
Updated: 2026-07-14

## Current learner journey

1. The route opens on a rotatable bowl with every surface, rate, comparison,
   playback, and shell control already visible.
2. The first guided state asks the learner to move the start and take a step.
3. The second state exposes one computed update and its local gradient.
4. The third state opens directly on an oscillating narrow-valley path at rate
   0.90 beside a stable kept path at rate 0.40.
5. The fourth state changes to a many-minima surface and compares two starts at
   the same rate.
6. Challenges, simplifications, references, and related links live in the
   insight drawer.

The model, URL-restorable controls, and five deterministic signature states
already support a strong causal argument. The weakness is how that evidence is
staged and read.

## Strong existing elements

- The surface, gradient, updates, path outcomes, and final losses are computed
  from one deterministic model.
- The valley comparison can genuinely hold start and surface constant while
  changing only learning rate.
- The many-minima comparison labels confounded rate-and-start changes instead
  of making an unsupported causal claim.
- Pointer, keyboard, touch, reduced-motion, WebGL fallback, live text, and URL
  restoration behaviours already exist.
- The current scene distinguishes completed and forecast path segments and can
  keep a comparison path on screen.

These behaviours are regression constraints, not redesign targets.

## Likely confusion and missed brain-clicks

### The visual argument is too hard to parse at first glance

The 3D surface dominates, but the current ochre path, faint grey kept path,
contours, grid, local arrow, two overlays, legend, and control bank compete for
attention. In the reviewed oscillation state, the crucial event—crossing the
valley floor—is not directly marked. The learner must infer it from a
perspective projection and then decode the explanation panel.

### The answer arrives before the learner has an expectation

The learning-rate state opens at 0.90 with an oscillating path and a static
explanation. It demonstrates the result, but does not let the learner first
commit to an intuition about whether a larger step will help.

### The causal comparison is textual before it is visual

“Compare: rate only” is accurate, but the scene does not make “same start” and
the two rate/outcome pairs visually immediate. The kept path is deliberately
faint, which makes the controlled contrast easy to miss.

### The most useful challenge is secondary

Finding the largest tested rate that still lowers loss is the natural
experiment, but it appears both as footer copy and as a drawer challenge. The
scene does not acknowledge progress toward or discovery of the computed
boundary.

### The journey has no landing image

The final state is a different-basin example. It is valuable, but it replaces
the step-size contrast instead of ending by reinstating it. There is no final,
reproducible view that holds the stable and unstable paths together as the
memory image.

### Explanations disappear or become secondary on small screens

The shell hides every guided-step observation below the `md` breakpoint. The
scene's detailed overlay remains, so small screens retain the denser evidence
while losing the concise interpretation.

### Related links explain proximity, not purpose

The drawer lists title and topic only. It does not tell the learner which new
question Backpropagation, Overfitting, or a gradient-free search method answers.

## Revised visual and pedagogical decisions

1. Keep the mathematical model and URL state unchanged in meaning.
2. Start the rate experiment in a stable state, ask an optional prediction,
   and let the learner produce oscillation or divergence.
3. Give the 3D view a direct visual grammar: rust for the current path, green
   for the stable reference, an explicit valley-floor line, marked crossings,
   and labels attached to both outcomes.
4. Add a computed top-view comparison inset where perspective otherwise hides
   the zig-zag.
5. Replace the all-purpose evidence overlay with state-specific evidence:
   local update math for the first-step states, paired path outcomes for the
   rate experiment, and paired basin outcomes for the start experiment.
6. Promote the stability-boundary challenge into an exhibit-owned guide. Its
   response must be derived from the actual 14-step path on the slider's tested
   rate grid.
7. Add a fifth final state that recreates the stable-versus-diverging
   comparison and states both the memory image and the honest transfer.
8. Keep prediction and guide behaviour owned by Gradient Descent. Do not add a
   generic learning framework before another exhibit proves the same need.
9. Surface guided observations at every viewport and replace Gradient
   Descent's generic related list with question-led transitions.
10. Reuse the same model, assessment language, and stability evidence in the
    homepage micro-experiment.

## What must not regress

- analytic gradients and deterministic paths;
- the stable, oscillating, diverging, and different-basin signature states;
- one-variable versus confounded comparison labels;
- direct pointer/touch start placement and keyboard start movement;
- manual stepping, path playback, restart, shell reset, and reduced motion;
- restored surface, rate, start, and kept-path URL state;
- WebGL fallback and nonvisual causal descriptions;
- single-viewport workspace fit at 390×844, 768×1024, 1280×720, and 1440×900;
- static export, route budgets, and cross-browser smoke coverage.

## Acceptance questions

The implementation is ready for observation when an uncoached learner has a
fair chance to answer:

- What did you change? — the learning rate, while start and surface stayed
  fixed.
- What happened? — the path began crossing the valley and eventually finished
  with higher loss.
- Why? — each direction was locally downhill, but the steps were too large for
  this valley's curvature.
- What image remains? — the green stable path and rust unstable path from the
  same start, separated by repeated valley-floor crossings.
- What comes next? — where gradients come from, why successful optimisation
  can still generalise poorly, or how search can work without gradients.
