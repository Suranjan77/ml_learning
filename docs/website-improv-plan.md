# Learner Experience Redesign Plan

## Status

**Implemented and validated — 14 July 2026**

This document began as a flagship-first proposal. The implementation retained
that discipline for Gradient Descent, then expanded only after a separate
audit of every visualisation showed that the remaining exhibits had distinct
visual—not merely navigational—learning failures.

The governing correction is:

> A shared learner journey cannot compensate for an unclear visual argument.

Each exhibit therefore received its own diagnosis, causal test, visual
treatment, responsive treatment, and deterministic verification. The full
diagnosis is recorded in
[`docs/exhibit-by-exhibit-learner-audit.md`](./exhibit-by-exhibit-learner-audit.md);
the deeper flagship audit is recorded in
[`docs/gradient-descent-learner-experience-audit.md`](./gradient-descent-learner-experience-audit.md).

## Implemented visual treatments

| Exhibit | Visual problem addressed | Implemented treatment |
| --- | --- | --- |
| Gradient Descent | Perspective concealed valley crossings and weakened the controlled comparison. | Added a marked valley floor and crossings, a computed top view, strong current/reference path semantics, state-specific evidence, a stability-boundary experiment, and a final two-path memory state. |
| Overfitting | The decisive train/validation contradiction was split across small values and distant curves. | Joined the selected errors with a generalisation-gap mark and retained kept-to-current deltas so “training improved; validation worsened” is visible directly. |
| Decision Tree | Rerouted points in feature space could not be followed through the tree. | Selected and numbered one informative point, traced its old and new routes through the nodes and leaves, and stated whether its prediction changed. |
| Kernel Trick | The final input-space circle replaced the lifted separator exactly when their equivalence mattered. | Kept the 3D plane visible beside an input-space circle inset built from the same points and threshold. |
| Self-Attention | Arc width showed where attention went but not how one score became one weight. | Tied the strongest arc to a score → exponential/softmax denominator → weight trace and added signed retained-comparison changes. |
| PCA | Projected points still lived in the 2D cloud, so compression to one coordinate was only asserted. | Added a true one-dimensional scalar-score strip whose spread and collapse follow the rotated axis. |
| K-means | Assignment and centroid movement replaced one another, obscuring why centroids moved. | Retained assignment links during updates, ghosted old centroids, drew move-to-mean arrows and a phase rail, and compared a poor ending with a deterministic better start on the same data. |
| Token Sampling | Temperature changes were a memory task and truncation looked like missing bars. | Plotted the actual post-truncation renormalised distribution, retained default-temperature outlines, marked signed changes and excluded mass, and separated exclusion from the random draw. |
| CNN | “patch × filter” hid the nine products that cause one activation; pooling was only labelled. | Added the selected 3×3 product grid and, in the final state, retained the activation map beside the pooled map with every 2×2 source block marked. |
| Backpropagation | Derivatives appeared as results while “chain rule” remained a caption. | Highlighted one input-to-output route and expanded its live gradient into downstream error × local sensitivity × input. |
| Regression | The loss map read as a tinted rectangle rather than parameter space. | Added computed iso-loss contours, labelled slope/intercept axes, a full crosshair, and direct two-parameter manipulation on the map. |
| Genetic Algorithm | Diversity was a number and the crossover/mutation event was visually undersized. | Aligned enlarged bit-cell parent, crossover, and child rows with cut and mutation marks, and added same-run best-fitness and diversity histories; mobile uses an intentional swipeable canvas instead of unreadable scaling. |
| Particle Swarm | The mechanism was delayed, the scalar view hid 2D search structure, and collapsed particles could appear missing. | Rebuilt the exhibit around a deterministic 2D Rastrigin landscape, selectable particles, exact head-to-tail force vectors, personal/shared histories, discovery and stagnation states, and an occupancy lens that honestly shows many particle IDs at one collapsed location. |

## Implemented concept constellation

The observation gate for the concept constellation was explicitly removed on
14 July 2026. The resulting `/concepts` route is an authored question map, not
a tag graph or forced curriculum:

* all thirteen exhibits appear exactly once at editorially chosen positions;
* eighteen relationships carry a specific learner question, explanation, and
  semantic type;
* mechanism, representation, contrast, and failure relationships have distinct
  line treatments without implying a required direction of study;
* selecting a desktop node reveals only its meaningful neighbourhood, and the
  arrow keys move spatially between nodes;
* mobile and tablet use a one-hop question lens instead of shrinking the whole
  graph until its labels are unreadable;
* the homepage, primary navigation, and every exhibit insight drawer provide
  entry points with the relevant concept preselected in the URL.

The authored relationship data is tested for missing exhibits, invalid or
duplicate edges, isolated nodes, and disconnected subgraphs.

The shared implementation remains deliberately small: guided observations stay
visible at every viewport, the concept constellation now provides global
intellectual place, and Gradient Descent retains its more specific authored
transitions. Predictions, reveals, traces, thresholds, and memory images remain
exhibit-owned because their semantics are not interchangeable.

## Follow-up defects addressed

* Homepage and library hydration mismatches were traced to final-digit
  differences in server/browser floating-point SVG attributes. Authored SVG
  coordinates are now serialised to stable precision and regression-tested.
* The Decision Tree’s rightmost depth-three leaf exceeded its own SVG viewBox.
  Its routing coordinates were re-authored to fit a separate native-scale
  region divided from the partition plot—without a surrounding box, scaling,
  left overlap, or escaping nodes. Rendered bounds are asserted at 390×844.
* The homepage Gradient Descent proof was visually dominant. It is now a
  contained experiment card rather than a full-bleed hero background, with a
  170–230 pixel plot and compact controls that keep the opening question—not
  the diagram—as the dominant element.
* The redundant “Browse by question” grid was removed. The authored concept
  constellation now occupies that discovery role between the curiosity
  invitations and complete collection.
* Guided playback previously waited before giving feedback and used the same
  idle state at completion. Auto-play now advances immediately, identifies
  when it is running, stops cleanly, exposes an explicit Replay state, and
  changes the terminal Next action to Complete. Every manual step, autoplay
  sequence, replay, pause, console, and runtime-error path is exercised on all
  thirteen exhibits.

## Validation record

The implementation passed:

* TypeScript type checking and linting;
* 205 unit/component tests across 33 files;
* the production static export of all 22 generated pages;
* every route performance budget;
* 108 Chromium and Firefox browser tests, including an every-exhibit guided
  control matrix, keyboard, touch-sized,
  responsive, URL-restoration, reduced-motion, and deterministic signature
  coverage;
* all 6 WebKit smoke tests inside the available
  `mcr.microsoft.com/playwright:v1.61.1-noble` Docker image.

All thirteen exhibits were rendered and inspected at 1440×900 and 390×844.
The concept constellation and three reported follow-up defects were reviewed at
390×844, 768×1024, 1280×720, and 1440×900. This review caught visual issues that
tests did not, including the
collapsed-swarm disappearance, a clipped CNN connector, an unreadably scaled
mobile genetic-algorithm panel, and weak mobile evidence summaries.

## Deliberate deferrals

The optional local learning trail remains deferred because it introduces
persistence rather than clarifying an exhibit or relationship. A generic
prediction or guide framework was also not extracted: the implementations did
not establish a second genuinely identical semantic use case.

## Primary objective

Transform the website from a technically excellent collection of interactive machine-learning exhibits into a learning experience that feels alive, connected, memorable, and responsive to the learner's thinking.

The website should not become:

* a conventional linear course;
* a gamified learning platform;
* an AI chatbot experience;
* a collection of decorative animations;
* a rigid step-by-step tutorial system;
* an engagement-optimised product.

The core identity remains:

> A public laboratory of interactive visual arguments about machine learning.

However, each visualisation should feel less like an isolated exhibit and more like a short conversation with an excellent teacher.

The desired learner experience is:

> **Wonder → Predict → Touch → Tension → Reveal → Transfer**

The learner should:

1. encounter an interesting question;
2. form an expectation;
3. manipulate something meaningful;
4. encounter a surprising or important consequence;
5. understand why it happened;
6. leave with one memorable mental image;
7. see where that idea naturally connects next.

---

# 1. The problem to solve

The existing project is already strong in:

* mathematical honesty;
* deterministic computation;
* direct manipulation;
* accessibility;
* responsive behaviour;
* cross-browser verification;
* performance budgets;
* explicit assumptions;
* references;
* guided steps;
* challenges;
* related concepts;
* visual consistency.

The problem is not lack of quality.

The problem is that the experience can feel:

* lonely;
* clinical;
* overly formal;
* catalogue-like;
* structurally repetitive;
* disconnected from the learner's own thought process.

The learner often receives instructions but is rarely asked:

> What do you think will happen?

The site shows effects but does not always acknowledge:

> You caused this.

The learner encounters concepts individually but has little sense of:

> Where am I intellectually, and what question naturally comes next?

The redesign must address these problems without compromising the project's existing principles.

---

# 2. Governing experience principle

Every major visualisation should attempt to create at least one genuine **brain-click moment**.

A brain-click moment occurs when:

1. the learner has an intuition or expectation;
2. the learner changes something;
3. something meaningful happens;
4. the causal relationship becomes visible;
5. the learner can explain the result in one sentence.

The goal is not merely:

> The learner interacted with the visualisation.

The goal is:

> The learner's mental model changed.

---

# 3. New pedagogical choreography

Use the following conceptual structure where appropriate:

## 3.1 Wonder

Start with an interesting question rather than a control description.

Weak:

> Change the learning rate.

Better:

> Does taking bigger steps always get you to the bottom faster?

Weak:

> Adjust the polynomial degree.

Better:

> Can improving training performance make a model worse?

Weak:

> Rotate the projection axis.

Better:

> How much of a cloud can survive when it is flattened into one line?

The opening should create curiosity before exposing every technical control.

---

## 3.2 Predict

Where a meaningful misconception, uncertainty, or competing intuition exists, allow the learner to make a lightweight prediction.

Example:

> What do you think will happen if the learning rate increases?

Possible responses:

* Faster convergence
* It will overshoot
* It depends
* Not sure

Rules:

* No scoring.
* No account.
* No leaderboard.
* No shame for wrong answers.
* Do not artificially force a prediction when it adds no value.
* Predictions should exist only when they strengthen the subsequent reveal.

The system should be capable of remembering the prediction temporarily so the reveal can respond to it.

Example:

> You expected faster convergence. That happened initially—but after 0.78 the path began crossing the valley repeatedly.

The purpose is cognitive investment, not assessment.

---

## 3.3 Touch

The learner should manipulate the most meaningful representation directly wherever practical.

Prefer:

* dragging a decision boundary;
* moving a starting point;
* rotating a PCA axis;
* selecting a CNN receptive field directly;
* changing a learning rate while watching the trajectory;
* changing a token and seeing attention redistribute.

Avoid unnecessary controls disconnected from their visual consequences.

Every major control should serve the central visual argument.

---

## 3.4 Tension

Every flagship exhibit should contain at least one state where intuition is challenged, refined, or made more precise.

Examples:

### Gradient Descent

Bigger steps initially improve convergence.

Then:

* oscillation begins;
* the path repeatedly crosses the valley;
* eventually loss increases.

### Overfitting

Training error continues improving while validation error worsens.

### Decision Tree

Moving one apparently simple threshold reroutes many points and changes several downstream predictions.

### Kernel Trick

A boundary that is impossible in the original representation becomes simple after transforming the representation.

The site should not rush through these moments.

Allow important states to breathe.

---

## 3.5 Reveal

When an important event occurs, acknowledge exactly what the learner changed and what happened.

Avoid only displaying generic static explanations.

Weak:

> High learning rates may cause divergence.

Better:

> You increased the learning rate from 0.40 to 0.96. The optimiser now crosses the valley so aggressively that loss increases after 14 steps.

Weak:

> High-degree models may overfit.

Better:

> Training error fell again, but validation error increased. The model fitted the training data more closely while generalising worse.

Reveals should be:

* specific;
* causal;
* concise;
* computed from actual state wherever possible;
* attached to the changed phenomenon.

Do not claim causality that the computation does not support.

---

## 3.6 Transfer

End meaningful experiences with two things:

### A. Memory image

Give the learner one visual relationship worth remembering.

Example:

> **Keep this image:** Same start. Same landscape. Different step size. One path converges; the other explodes.

### B. Transfer statement

Connect the simplified experiment to the broader machine-learning idea.

Example:

> Real neural networks may have billions of parameters rather than two, but the optimiser still acts using local information rather than a complete map of the final destination.

The transfer statement must clearly distinguish:

* what is genuinely general;
* what is simplified;
* what is specific to the exhibit.

---

# 4. Add a restrained guide voice

Do not add:

* a chatbot;
* an animated mascot;
* a character avatar;
* constant motivational messages;
* excessive conversational copy.

Instead, introduce a quiet editorial voice that appears only when useful.

Recommended language patterns:

> **Try this.**

> **Before you move it—what do you expect?**

> **Watch this part.**

> **Now push it slightly further.**

> **There it is.**

> **What changed?**

> **Why did that happen?**

> **Keep this image.**

> **Take this idea with you.**

The guide should feel like a thoughtful teacher standing beside the learner, not a product trying to maximise engagement.

Use this voice sparingly.

Silence is valuable.

---

# 5. Do not force every exhibit into one identical template

The current project correctly allows different exhibits to use different choreography.

Preserve that principle.

Do not create a universal requirement that every visualisation must contain exactly:

1. prediction;
2. challenge;
3. reveal;
4. quiz;
5. memory card.

Instead, provide reusable semantic capabilities that exhibits may use when appropriate.

Possible reusable primitives:

```ts
interface PredictionPrompt {
  question: string;
  options: readonly PredictionOption[];
}

interface PredictionOption {
  id: string;
  label: string;
}

interface Reveal {
  id: string;
  title?: string;
  message: string;
}

interface MemoryImage {
  title?: string;
  message: string;
}

interface TransferNote {
  message: string;
}

interface ExperimentChallenge {
  id: string;
  prompt: string;
  successCondition?: unknown;
}
```

Do not finalise these interfaces before examining actual use cases.

Follow the project's existing second-use rule:

> Do not introduce a shared abstraction until at least two exhibits demonstrate the same semantic need.

Start with exhibit-owned implementations where necessary.

Extract only genuinely reusable behaviour.

---

# 6. Redesign the exhibit workspace

The current workspace roughly consists of:

* exhibit header;
* visualisation scene;
* guided-step footer;
* controls;
* secondary insight panel.

The redesign should make the learning conversation more present without overcrowding the visualisation.

## Desired hierarchy

The scene remains dominant.

The learner should see:

1. the central question;
2. the meaningful interactive scene;
3. the current invitation or observation;
4. contextual acknowledgement of important changes;
5. optional deeper information.

Avoid placing the most important pedagogical material exclusively behind secondary controls.

---

## 6.1 Contextual guide area

Create a restrained area capable of presenting one current message.

Example:

> **Try this**
> Increase the learning rate until the path stops descending cleanly.

After interaction:

> **Watch the valley floor.**
> The optimiser is now crossing from one side to the other.

After further interaction:

> **There it is.**
> At 0.96, the update direction remains locally downhill, but the steps are too large for stable convergence.

This content should be state-aware where appropriate.

Avoid a constantly changing stream of verbose text.

One good observation is better than five mediocre ones.

---

## 6.2 Surface important observations

The current `observation` field should not disappear on smaller screens simply because space is limited.

Reconsider how observations are presented.

Options include:

* compact expandable observation;
* transient contextual annotation;
* inline guide message;
* overlay attached to the relevant visual feature;
* short current-state summary.

The exact implementation may vary by exhibit.

The important requirement is:

> The learner should not lose the core explanation simply because they are using a smaller screen.

---

## 6.3 Simplify secondary controls

Audit the workspace controls.

Current conceptual controls include:

* Previous;
* Play;
* Insight;
* Reset;
* Copy link;
* Next.

Determine whether every control deserves equal prominence.

The primary hierarchy should probably be:

### Primary

* meaningful scene interaction;
* next guided state when needed;
* current challenge or prompt.

### Secondary

* previous;
* reset;
* automatic walkthrough.

### Tertiary

* copy;
* references;
* technical details.

Do not blindly implement this hierarchy. Evaluate it against accessibility and existing interaction tests.

---

# 7. Promote challenges into the core experience

Challenges are currently valuable but secondary.

They should become contextual invitations when they directly support the central argument.

Example:

> **Can you break it?**
> Find the largest learning rate that still lowers loss after 14 steps.

The system may optionally respond to state:

> 0.72 still converges.

Then:

> 0.76 still converges. Getting close.

Then:

> At 0.78 the path begins oscillating.

Avoid turning this into a game.

Do not add:

* points;
* stars;
* scores;
* XP;
* streaks;
* leaderboards.

The purpose is discovery.

---

# 8. Make causality explicit

Each flagship should help the learner identify:

### What changed?

Example:

> Learning rate increased from 0.40 to 0.96.

### What stayed constant?

Example:

> Starting point and loss surface remained unchanged.

### What happened?

Example:

> Final loss increased rather than decreased.

### Why?

Example:

> The update repeatedly crossed the narrow valley and became unstable.

Whenever a comparison exists, the site should help distinguish:

* controlled comparison;
* partially controlled comparison;
* confounded comparison.

Do not attribute effects to a variable when more than one relevant variable changed.

Preserve the project's strong commitment to causal honesty.

---

# 9. Add memory images

Every flagship exhibit should define one durable visual relationship.

Examples:

## Gradient Descent

> Same start. Same landscape. Different step size. One path converges; one explodes.

## Overfitting

> Training error falls while validation error rises.

## Decision Tree

> Moving one boundary reroutes points through different branches.

## PCA

> Rotate one line and watch how much variation survives in its shadow.

## Attention

> Changing one token redistributes which other tokens matter.

## Kernel Trick

> The original points remain where they are; the representation changes until a simple separator becomes possible.

Memory images should be:

* visually strong;
* conceptually accurate;
* compact;
* reproducible;
* suitable for social previews where practical.

Do not create decorative illustrations unrelated to the actual mechanism.

---

# 10. Redesign the homepage around curiosity, not inventory

The homepage should not immediately behave primarily as a catalogue.

The first experience should be a real micro-experiment.

The existing Gradient Descent homepage experiment is the correct foundation.

Improve its choreography.

Suggested structure:

---

## Hero experiment

### Question

> **Does taking a bigger step always get you to the bottom faster?**

Show:

* one real loss surface or top-down valley;
* a stable reference path;
* a learner-controlled current path;
* learning-rate control.

As the learner changes the value, show concise computed responses.

Examples:

> **0.52 — converging faster**

> **0.72 — crossing the valley**

> **0.84 — oscillating**

> **0.96 — diverging**

Then:

> **You just found a stability boundary.**

Primary action:

> Explore why →

---

## Curiosity invitations

Instead of immediately showing a conventional card grid, introduce a small number of major questions.

Example:

### Why does learning sometimes fail?

Show a compact overfitting or optimisation argument.

### How does a machine divide the world?

Show decision boundaries responding to manipulation.

### How can changing representation make the impossible simple?

Show the kernel transformation.

Each invitation should contain:

* one question;
* one visual argument;
* one concrete promise.

Avoid generic marketing language.

---

## Full collection

Only after the curiosity-led sections, show:

> **All interactive experiments**

Retain the complete searchable library.

The library remains useful for deliberate browsing.

It should not be the emotional introduction to the project.

---

# 11. Build a concept constellation

Do not create a forced curriculum.

Do not require a sequence.

Do provide a sense of intellectual place.

The learner should be able to understand how concepts relate.

Possible conceptual relationships:

```text
Gradient Descent
    │
    ├── Where do gradients come from?
    │       └── Backpropagation
    │
    ├── What happens when optimisation becomes unstable?
    │       └── Divergence
    │
    └── What happens when training succeeds but generalisation fails?
            └── Overfitting
```

Another:

```text
Representation
    │
    ├── PCA
    ├── CNN feature maps
    ├── Attention
    └── Kernel transformations
```

The implementation should not become an arbitrary force-directed graph.

Prefer an authored concept map with meaningful semantic relationships.

Possible relationship types:

```ts
type ConceptRelation =
  | "builds-on"
  | "explains"
  | "contrasts-with"
  | "another-failure-mode"
  | "changes-representation"
  | "optimises"
  | "provides-gradient-for";
```

Again, do not implement this abstraction until the actual content relationships have been authored carefully.

---

# 12. Improve related-concept navigation

Replace generic:

> Related ideas

with question-led transitions.

Example after Gradient Descent:

> **You have seen how step size changes optimisation. Where should you go next?**

### Where did the gradient come from?

**Backpropagation**

See how error is assigned backward through a network.

### Can training improve while prediction gets worse?

**Overfitting**

See training and validation behaviour move in opposite directions.

### Can we search without gradients?

**Genetic Algorithm**

Compare local slope-based optimisation with population-based search.

These transitions should explain **why** another exhibit is related.

Do not show only a title and topic.

---

# 13. Add local learning memory without accounts

Optional but strongly recommended after the core flagship work is complete.

Use local device storage only.

No server.

No user account.

No analytics.

No tracking.

Possible stored data:

```ts
interface LocalLearningTrail {
  viewedExhibits: string[];
  completedMoments: string[];
  memorableDiscoveries: LocalDiscovery[];
}

interface LocalDiscovery {
  exhibitSlug: string;
  momentId: string;
  timestamp?: number;
}
```

Possible experience:

> **Your trail**

> 4 ideas explored

* Gradient Descent
  Bigger steps can destabilise learning.

* Overfitting
  Lower training error can coexist with worse generalisation.

* Backpropagation
  Not explored yet.

On return:

> Welcome back. Last time, you made Gradient Descent diverge.

Only make statements that are directly supported by locally stored events.

Provide:

> Forget my trail

This should immediately erase all locally stored learning history.

Do not add this before the core exhibit experience is excellent.

---

# 14. Visual design direction

Preserve:

* warm neutral backgrounds;
* dark ink;
* muted green;
* rust accent;
* serif headline type;
* sans-serif body type;
* monospaced technical notation;
* semantic colour meaning;
* restrained animation;
* accessible contrast.

Do not replace the identity with:

* neon gradients;
* generic AI imagery;
* glassmorphism;
* excessive glowing effects;
* futuristic dashboards;
* cartoon education aesthetics.

However, reduce the current visual rigidity.

The current experience relies heavily on:

* rectangular boxes;
* borders;
* nearly square corners;
* dense grid structures;
* repeated card layouts;
* absence of depth.

Move toward:

> **Research notebook × interactive museum × precise computational instrument**

Possible changes:

* fewer visible borders;
* more negative space;
* selective tonal separation instead of boxes;
* occasional larger-radius surfaces where appropriate;
* some scenes breaking normal content boundaries;
* more direct annotations attached to the phenomenon;
* stronger contrast between calm and surprising states;
* selective asymmetry;
* unique visual atmosphere per concept.

Do not make every exhibit visually identical.

Shared identity should come from:

* typography;
* colour semantics;
* annotation grammar;
* interaction honesty;
* control behaviour;
* comparison language.

Not from forcing every scene into the same box.

---

# 15. Flagship first: Gradient Descent

Do not attempt a site-wide redesign first.

Begin with Gradient Descent.

The redesigned Gradient Descent experience should become the proving ground for the new learner-experience language.

## Desired experience

### Phase 1: Wonder

Show the landscape.

Prompt:

> A model is standing somewhere on this landscape. Lower is better. But it cannot see the whole terrain.

Then:

> **Where do you think it will end up?**

Prediction is optional but recommended.

---

### Phase 2: Local information

Show the local gradient.

Prompt:

> **This is everything the optimiser knows.**

Then:

> Take one step.

After the update:

> One local decision. No map. No knowledge of the final destination.

The exact wording may be refined.

Keep it concise.

---

### Phase 3: Learning-rate experiment

Show:

* fixed starting point;
* fixed loss surface;
* kept stable reference path;
* current adjustable path.

Ask:

> **Would a larger step always make learning faster?**

Let the learner adjust the learning rate.

Responses should come from real computed state.

Possible state language:

* converging;
* faster convergence;
* crossing the valley;
* oscillating;
* diverging.

Do not invent thresholds manually when the model can determine the state.

---

### Phase 4: Tension and reveal

When divergence occurs:

> **There it is.**

Then:

> The direction is locally downhill, but the steps are too large for stable convergence.

Also display actual computed evidence.

Example:

> After 14 steps, loss is 243% higher.

Use the actual model output.

---

### Phase 5: Different basins

Hold learning rate constant.

Allow different starts.

Compare results.

Reveal:

> Same algorithm. Same learning rate. Different starting point. Different basin.

Do not imply the globally best solution was available to the optimiser.

---

### Phase 6: Memory image

End with:

> **Keep this image:**
> Same start. Same landscape. Different step size. One path converges; one explodes.

And:

> Gradient descent does not know the destination. It knows only what downhill means here.

Ensure this statement remains mathematically honest within the simplified model.

---

# 16. Homepage flagship changes

After the full Gradient Descent exhibit works well, update the homepage experiment using the same model and semantic logic.

Do not create a fake simplified animation disconnected from the exhibit's real computation.

The homepage should reuse:

* actual Gradient Descent model behaviour;
* actual path assessment;
* same semantic state language;
* same visual comparison grammar.

The homepage experiment should be understandable in under approximately 30 seconds without requiring a tutorial.

---

# 17. Implementation order and outcome

The initial sequence below was deliberately revised after the flagship audit.
It remains useful as a record of why shared abstractions were avoided, but it
is no longer a list of unfinished implementation tasks.

## Phase A — Gradient Descent audit and observation — completed

Before changing architecture:

1. inspect all existing Gradient Descent states;
2. inspect current desktop and mobile screenshots;
3. identify the exact learner actions available;
4. identify which important insights are currently hidden or easy to miss;
5. record the current first-screen hierarchy;
6. preserve existing tests and deterministic signature states.

Output:

```text
docs/gradient-descent-learner-experience-audit.md
```

The audit should identify:

* current learner journey;
* likely confusion;
* missed brain-click opportunities;
* strong existing elements;
* what must not regress.

---

## Phase B — Gradient Descent choreography — completed

Implement the new learner-experience pattern within Gradient Descent.

Focus on:

* better opening question;
* optional prediction;
* state-aware guide voice;
* contextual reveal;
* promoted challenge;
* memory image;
* question-led next concepts.

Do not generalise prematurely.

---

## Phase C — Rendered review and learner observation — ongoing

Automated interaction checks and direct desktop/mobile render inspection are
complete. Existing learner-observation evidence was retained in
`docs/gradient-descent-flagship-review.md`; more uncoached learner sessions are
still valuable and must not be simulated or replaced by implementation
confidence.

Test manually with several types of learner where practical:

* novice;
* computing student;
* experienced ML practitioner;
* touch user;
* keyboard-oriented user.

Observe:

* first action;
* confusion;
* whether prediction creates investment;
* whether the causal relationship is understood;
* what surprised the learner;
* what visual state they remember afterward.

Do not ask only:

> Did you like it?

Ask:

> What changed?

> Why did it happen?

> What image do you remember?

> What would you try next?

---

## Phase D — Exhibit-by-exhibit visual treatment — completed

The original phase proposed applying the philosophy to Overfitting second.
Instead of copying its treatment onward, every remaining exhibit was audited
before editing. All twelve non-Gradient-Descent exhibits now have a distinct
treatment recorded in the implementation table and exhibit audit above.

Do not copy the Gradient Descent layout blindly.

Determine which capabilities genuinely recur.

Likely reusable candidates:

* prediction;
* state-aware reveal;
* memory image;
* question-led related concepts.

Only after the second use should shared abstractions be considered.

---

## Phase E — Extract only proven reusable grammar — completed for current evidence

After two successful exhibits, identify semantic capabilities worth sharing.

Potential examples:

```text
Prediction prompt
Contextual reveal
Memory image
Question-led concept transition
Locally stored completed discovery
```

Only always-visible guided observations proved to be a platform-wide need.
Question-led transitions were implemented where their authored relationship
was strong. The following remain exhibit-specific:

* scene choreography;
* annotations;
* state derivation;
* visual traces;
* causal explanations;
* thresholds;
* challenge success logic.

---

## Phase F — Homepage re-authoring — completed for the flagship surface

Once Gradient Descent and Overfitting establish the new standard:

1. refine the homepage flagship micro-experiment;
2. replace catalogue-first discovery with curiosity-first discovery;
3. retain complete collection access;
4. retain search and filters;
5. avoid marketing exaggeration.

---

## Phase G — Concept constellation — completed

Explicit conceptual relationships were added after the exhibit-specific visual
treatments were complete. The implementation uses authored coordinates,
questions, explanations, and relationship types, with separate global-map and
mobile one-hop treatments.

Author relationships manually.

Do not infer them automatically from tags alone.

---

## Phase H — Optional local learning trail — deferred pending learner evidence

Implement only after the core experience proves useful.

No backend.

No account.

No analytics.

Easy deletion.

---

# 18. What must not change

Preserve all existing non-negotiables unless explicitly reconsidered by the maintainer.

Do not regress:

* static export;
* GitHub Pages compatibility;
* direct exhibit routes;
* no account requirement;
* no analytics;
* no tracking cookies;
* no advertising;
* keyboard access;
* touch access;
* pointer access;
* reduced-motion support;
* nonvisual equivalents;
* responsive layouts;
* visible assumptions;
* references;
* deterministic behaviour where educationally useful;
* browser testing;
* viewport testing;
* JavaScript budgets;
* unit tests;
* accessibility.

Do not add a fourteenth exhibit as part of this redesign.

Depth before expansion.

---

# 19. What not to build

Explicitly avoid:

* XP;
* streaks;
* badges;
* points;
* achievements;
* leaderboards;
* daily goals;
* engagement loops;
* push notifications;
* login walls;
* social feeds;
* AI chatbots;
* generic floating assistants;
* cartoon mascots;
* forced course sequencing;
* mandatory quizzes;
* excessive celebratory animations;
* confetti;
* artificial urgency;
* decorative 3D unrelated to the concept;
* generic AI gradients;
* dark futuristic dashboard aesthetics.

The experience should feel intellectually alive, not gamified.

---

# 20. Agent behaviour requirements

Any AI coding agent working on this redesign must:

1. inspect the existing code before proposing architecture;
2. preserve the current mathematical model unless a real flaw is identified;
3. use computed state instead of manually invented explanatory claims where possible;
4. avoid introducing abstractions before a second genuine use case exists;
5. preserve existing accessibility behaviour;
6. preserve or improve test coverage;
7. run the relevant validation commands;
8. inspect actual rendered output at representative viewports;
9. avoid claiming work is complete solely because tests pass;
10. evaluate whether the interaction actually creates causal clarity.

The coding agent must not optimise for:

> More features.

It should optimise for:

> Better understanding.

---

# 21. Definition of success

The redesign succeeds when a learner can interact with an exhibit and answer:

### What did you change?

### What happened?

### Why did it happen?

### What surprised you?

### What image will you remember?

### What question naturally comes next?

For Gradient Descent specifically, a successful learner should be able to express something close to:

> Gradient descent uses local slope information. The learning rate controls the step size, and steps that are too large can cause oscillation or divergence. Different starting points can also lead to different minima.

The learner should understand this because they **saw and caused it**, not because they merely read the definition.

---

# 22. Next evaluation task

The implementation task is complete. The next task is evidence gathering, not
another speculative redesign:

1. run short uncoached sessions with a novice, computing student, experienced
   practitioner, touch user, and keyboard-oriented user where practical;
2. ask each learner what changed, what caused it, and what image remains;
3. record misunderstandings against the relevant exhibit’s visual argument;
4. change an exhibit only when the observation identifies a reproducible
   learner problem;
5. refresh visual baselines only after the corresponding state is reviewed and
   accepted;
6. ask whether a learner can explain why two connected exhibits are related,
   rather than merely recalling that a line joined them;
7. compare desktop global-map comprehension with the mobile one-hop lens before
   changing either navigation model.

The strongest candidate for future shared infrastructure is whichever pattern
survives two independently authored exhibits and two rounds of learner
observation with the same semantics. Until then, keep the visual arguments
specific.

---

# Final design principle

> **Do not design around the information the website wants to present. Design around the moment the learner's understanding changes.**

The site's strongest future is not to become a bigger library.

It is to become a place where difficult machine-learning ideas become visible, manipulable, surprising, and memorable.
