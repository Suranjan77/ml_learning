# UX and Frontend Improvement Plan

Status: active — Phase 1 complete; concept field repaired
Updated: 2026-09-03

This plan reviews the running site as a frontend engineer, an interface
designer, and an educator would, in that order: what is measurably broken, what
is structurally wrong, and what fails to teach. Every claim below is backed by a
measurement or a screenshot taken against `npm run dev` at the four viewports
`CONTRIBUTING.md` already requires, plus 1920×1080, 1366×768, and 1024×640.

It does not propose a redesign. The visual identity in `docs/identity-decision.md`
and the doctrine in `docs/greatness-plan.md` hold. The problems are layout
arithmetic, information density, and how much of the screen the actual
mechanism is allowed to occupy.

---

## 1. Method

- Rendered every public route in Chromium at 1920×1080, 1440×900, 1366×768,
  1280×720, 1024×640, 768×1024, and 390×844.
- Measured element geometry (`getBoundingClientRect`, `scrollHeight`,
  `clientHeight`) rather than judging from screenshots alone.
- Computed WCAG contrast for every text node with a canvas-resolved colour
  parser, because Tailwind v4 emits `oklab()` that naive parsers mis-read.
- Collected console errors and warnings on all 17 routes.

Raw findings are reproduced inline below so they can be re-checked.

---

## 2. Diagnosis

### 2.1 The homepage experiment answers itself off-screen (critical)

This is the defect the report of "the gradient descent explanation is hidden
under the screen" points at, and it is structural rather than incidental.

`GradientDescentProof` renders the interactive hero, then renders the
"Computed live result" band — the sentence that states what the experiment just
proved — as a **separate section immediately below it**. The hero is
`min-h-[calc(100svh-72px)]`. The band therefore starts exactly at the fold, at
every size:

| Viewport | Fold | Result band | Fully visible? |
| --- | --- | --- | --- |
| 1920×1080 | 1080 | 1068–1207 | no |
| 1440×900 | 900 | 888–1027 | no |
| 1366×768 | 768 | 793–932 | no |
| 1280×720 | 720 | 708–892 | no |
| 1024×640 | 640 | 628–812 | no |
| 768×1024 | 1024 | 1012–1273 | no |
| 390×844 | 844 | 832–1108 | no |

At 1440×900 the learning-rate slider sits at y≈623 and the sentence explaining
what moving it did sits at y≈888. The learner performs the manipulation and the
result of that manipulation scrolls out of view. The controlled comparison the
whole homepage is built around is the one thing the first screen does not
deliver.

The in-hero status line (`statusDetail`) is a partial substitute, but it is
`hidden ... sm:block`, three lines of 11px text in the lower-right corner, and
it repeats the band's content rather than replacing it.

**Contributing arithmetic bug.** `Header` is `h-[60px]`. The hero reserves
`100svh - 72px`. The atlas stage below reserves `top-[84px]` and
`h-[calc(100dvh-116px)]`. Three different assumptions about one header height,
none of them 60. The hero is 12px taller than a full screen minus the header, so
the band is pushed 12px further down than even the intended design.

### 2.2 The homepage presents the same 13 exhibits three times

Measured DOM on `/` at 1440×900:

| | `/` | `/visualisations` |
| --- | --- | --- |
| Page height | 5330px | 3278px |
| DOM nodes | 1686 | 1147 |
| SVG elements | 53 | 16 |
| SVG shapes | 458 | 270 |
| Rendered exhibit previews | **16** | 13 |
| Interactive elements | 59 | 28 |
| `h2`/`h3` headings | 23 | 14 |

The homepage is 63% taller than the library and renders more exhibit previews
than the library does. It contains three separate browsing surfaces for one
frozen 13-item catalogue:

1. **§02 Controlled comparisons** — 3 exhibits as full-bleed plates.
2. **§03 Concept field** — all 13 as an interactive graph.
3. **§04 Complete collection** — all 13 as a list with a sticky preview stage
   (13 more previews).

Each uses a different visual grammar, and §04 duplicates the job of
`/visualisations`, which does it better. This is the crowding. It is not that
any one section is bad — §03 and §04 are individually well made — it is that
four full-screen sections plus a hero compete for the same decision.

### 2.3 The homepage concept field draws edges in the wrong coordinate space

**Fixed.** The section reported as "weird" after the three controlled
comparisons. Two independent faults stacked:

The node buttons are HTML positioned by percentage across the full container.
The edge layer is an SVG with `viewBox="0 0 1200 720"` and no
`preserveAspectRatio`, so it defaulted to `xMidYMid meet`. The homepage renders
that field at 1374×390 — aspect 3.5 against the viewBox's 1.67 — so the drawing
was scaled to fit *height* and centred, compressing every edge into the middle
650px while the nodes spanned the full width. Measured at 1440×900:

| | x span | y span |
| --- | --- | --- |
| Edges | 419–909 | 55–355 |
| Node centres | 124–1156 | 55–355 |

The y spans agreed by coincidence — height was the constraining dimension —
which is why the field looked like a tangle of lines floating in the centre with
orphaned boxes stranded on both sides. No line could reach a box.

The `/concepts` page uses the same node data and the same viewBox and does not
have the bug, because its container is `aspect-[5/3]` — exactly 1200:720 — so
nothing letterboxes.

**Treatment applied:** the homepage field stretches with
`preserveAspectRatio="none"`, every path endpoint runs through the same
`clampPercent` helper the node positions use, and strokes carry
`vector-effect="non-scaling-stroke"` so the non-uniform scale does not distort
line weights or dash patterns. Edge and node spans now coincide exactly
(124–1156 on both axes). The decorative centre crosshairs were removed: on
`/concepts` they divide four labelled quadrants, but the homepage lens carries
no quadrant labels, so they read as relations that do not exist — in a figure
whose whole premise is that a line means an authored relationship.

Covered by a new e2e assertion that edge and node spans agree within 2px and
that no node label clips; verified to fail when `preserveAspectRatio` is removed.

### 2.4 Concept-map node labels are clipped

`HomeConceptField` node buttons carry `h-11` in the base class and add
`lg:min-h-12` at the large breakpoint, but `h-11` is never reset. The computed
height stays 48px while three-line titles need 51px.

Measured at 1440×900 — 5 of 13 nodes clipped their second line by 5px:
`pca`, `kernel-trick`, `regression-boundary`, `decision-tree`, `particle-swarm`.
"Principal component analysis" and "Particle swarm optimisation" visibly lost
their last line.

**Fixed** alongside 2.3, by adding `lg:h-auto` so the fixed 44px dot height
applies only to the mobile marker and the desktop label box grows to its text.
Zero nodes clip now.

### 2.5 Scenes do not fill the space they are given

The `ExhibitShell` grid allocates the scene 63–77% of the workspace, which is
correct. The scenes then decline to use it. Drawn surface versus slot height:

| Exhibit | 1440×900 | 1280×720 | 390×844 |
| --- | --- | --- | --- |
| slot height | 644px | 464px | 492px |
| gradient-descent | 445px | 265px | **208px** |
| attention | **336px** | **156px** | **129px** |
| overfitting | 504px | 324px | 273px |
| k-means | 540px | 360px | 329px |
| kernel-trick | 555px | 375px | 415px |

Attention uses 34% of its slot at 1280×720 and 26% at 390×844. Gradient descent
draws a 372×208 canvas inside a 492px slot on a phone — the 3D loss surface, the
single most important object on the page, gets a quarter of the screen while
controls and prose get the rest.

The cause is fixed `viewBox` aspect ratios and `preserveAspectRatio` defaults
that letterbox rather than adapt. Kernel-trick shows the mirror problem at
desktop width: the WebGL scene is centred in roughly a quarter of the available
width with dead space either side.

### 2.6 Legibility gaps inside the visualisations

Reviewed exhibit by exhibit against the "manipulated cause → visible
consequence" test the project already sets for itself:

- **Gradient descent (home hero).** The kept 0.40 reference path is drawn at
  `opacity 0.82` in `#CAD4BF` on `#1E1B16` and is visually lost behind the
  current path; at 1280×720 its `KEPT 0.40` label collides with `CURRENT 0.52`.
  A comparison you cannot see both halves of is not a comparison.
- **Gradient descent (exhibit).** The isotropic bowl renders near-white on a
  near-white surface; contours barely separate from the mesh.
- **Overfitting.** "Error vs degree" carries no x-axis tick values, so the
  learner cannot read which degree the curve minimum sits at — the exact fact
  the exhibit exists to teach. The `GAP 0.026` annotation overlaps the axis.
- **Decision tree.** No axis values on the feature plot, so the "root threshold
  4.0" slider cannot be related to a position in the plot. The legend
  ("BACKGROUND = LEAF PREDICTION · RED OUTLINE = MISTAKE") sits inside the plot
  and overlaps data points. The right-hand rules panel is ~40% of the width and
  ~80% empty at depth 1.
- **k-means.** The nearest-centroid region tint is close enough to the canvas
  colour to read as noise, and points are uniformly grey before assignment, so
  the "tint = region" legend has nothing to anchor to.
- **PCA.** Three different quality measures are shown at once — `VARIANCE KEPT
  0.21`, `RECONSTRUCTION ERROR 6.90`, `3.0% OF VARIATION EXPLAINED`, `BEST
  POSSIBLE ERROR 0.21` — in three different units, with two unrelated
  quantities both printed as `0.21`. Projected points are not drawn on the
  projection axis, so "collapsing onto this line" is asserted, not shown.
- **Backpropagation.** The initial state shows `?` in every computed node and
  no loss value, so the first screen of an exhibit about error flowing backward
  contains neither a prediction nor an error.
- **Token sampling.** Bars occupy the left quarter; the probability readout sits
  at the far right edge, ~700px of eye travel from the bar it describes. Tokens
  below 1% render as sub-pixel slivers.
- **CNN.** Adequate, but see §2.6 for a labelling bug.
- **Attention, kernel-trick.** Strong arguments, undersized rendering (§2.4).

### 2.7 Correctness and hygiene

- **Hydration mismatch** on `/visualisations/token-sampling` and
  `/visualisations/regression-boundary`: *"A tree hydrated but some attributes
  of the server rendered HTML didn't match the client properties."* Both
  exhibits involve sampling; the likely cause is the same class of
  float-serialisation drift that `pointsAttribute` in `GradientDescentProof`
  already works around with `toFixed(3)`.
- **Mislabelled CNN output.** `CnnScene.tsx:151` sets
  `stageLabel = activeStep === 0 ? "INPUT" : ...`, and line 194 renders the
  convolution result as `` label={`6×6 ${stageLabel}`} ``. On step 0 the
  feature map is therefore labelled "6×6 INPUT" while the actual input is
  labelled "8×8 INPUT IMAGE". Two different tensors, both called the input, in a
  diagram whose entire subject is the difference between them.
- **No hero CTA on mobile.** The "Open Gradient Descent" link is
  `hidden ... sm:flex`; the substitute is in the result band, which is below the
  fold (§2.1). At 390×844 the first screen has no way into an exhibit.
- **`THREE.Clock` deprecation** warning on both WebGL exhibits.
- **Contrast.** The site is in good shape overall — `/visualisations`,
  `/concepts`, and the exhibit pages have effectively no failures. Eight small
  labels in the homepage hero fall below AA: the preset rate values `0.40` /
  `0.90` / `1.06` at **3.1:1**, and `Start fixed · surface fixed · 14 steps`
  and the slider end-labels at **4.1:1**. The rate values are inside buttons,
  which makes them the ones worth fixing.

### 2.8 The `:has()` atlas is brittle

`globals.css` carries 13 hand-written
`.home-atlas:has(.home-atlas-row:nth-child(N):is(:hover, :focus-within))`
selector pairs. It works, and it avoids client JavaScript, which is a
legitimate trade for a static site. But it silently breaks the moment a row is
added, removed, or reordered, and it has no test covering row 13. If §04
survives the restructure in §4, this needs either a generated selector block or
a comment binding it to `exhibits.length`.

---

## 3. Principles for the fix

1. **A manipulation and its consequence share a screen.** No control may be
   separated from the statement of its result by a fold.
2. **The mechanism gets the pixels.** Prose, chrome, and controls yield space to
   the drawing, not the other way round.
3. **One header height, declared once.** Layout arithmetic comes from a token,
   not from three different magic numbers.
4. **One browsing surface per page.** The homepage argues; the library browses.
5. **Every axis a learner is asked to reason about carries readable values.**
6. **Preserve what works.** The library page, the concept map's authored
   relation semantics, the kept-comparison grammar, and the identity rules stay.

---

## 4. Plan

Five phases, ordered so that each is independently shippable and verifiable.
Phase 1 alone fixes the reported complaint.

### Phase 1 — Fix the fold (highest value, lowest risk) — **complete**

**Goal:** the manipulation, the drawing, and the computed result sentence are
simultaneously visible at 1280×720 and above, and reachable without scrolling
past the hero on a phone.

1. Introduce `--layout-header-height: 60px` in `tokens.css` and consume it in
   `Header`, `GradientDescentProof`, and the atlas stage. Removes the
   60/72/84/116 disagreement.
2. **Move the computed-result sentence into the hero.** Merge the
   `resultSentence` band into `GradientDescentProof`'s right-hand column,
   directly beneath the chart and slider — the same block that already owns
   `statusTitle` and `statusDetail`. One live region, one place to look.
   - Keep the colour-coded regime rail (`resultRailClass`) as a left border or
     background on that block; the traffic-light semantics are good.
   - Delete the standalone `<section>` and its folio marker `01`; renumber.
3. **Reclaim hero vertical space.** The h1 is `clamp(2.55rem, 6vw, 6.15rem)` and
   wraps to six lines at 1440px while the chart it introduces is 230px tall.
   Cap it nearer `clamp(2.25rem, 4.4vw, 4.25rem)` and let the chart grow into
   the recovered space. Target: chart ≥ 300px at 1440×900.
4. **Give mobile a CTA above the fold.** Remove `hidden sm:flex` from the hero
   action row; use the compact variant already written for the band.
5. Raise the three preset-button rate values and the slider end-labels to AA.

**Acceptance:** a script asserts, at all seven measured viewports, that the
slider, the chart, and the element carrying `resultSentence` all have
`getBoundingClientRect().bottom <= window.innerHeight`. Add it to the e2e suite.

**Delivered.** `--layout-header-height` now lives in `tokens.css` and is the
single source for the header, the hero, and the atlas stage. The result block
sits inside the hero beneath the slider, carrying the regime colour, the
computed sentence, and the reveal control. Measured after the change:

| Viewport | Chart | Result block ends | Clear of the fold by |
| --- | --- | --- | --- |
| 1920×1080 | 300px | 862 | 218px |
| 1440×900 | 300px | 785 | 115px |
| 1366×768 | 260px | 699 | 69px |
| 1280×720 | 200px | 653 | 67px |
| 1024×640 | 200px | 606 | 34px |
| 768×1024 | 230px | 911 | 113px |
| 390×844 | 160px | 833 | 11px |

The chart grew from 230px to 300px at 1440×900; chart height is now budgeted
against viewport height, not the type scale. The homepage CTA appears on mobile.
`e2e/visualisations.spec.ts` gained a seven-viewport fold assertion, and the old
`demoHeight` ceiling became a height-aware floor so the chart cannot silently
shrink again.

Two things surfaced during the work and were fixed with it:

- **The diverging path was a single dot.** `visiblePath` truncated before the
  first out-of-domain point, so at rate 1.06 the chart showed a lone marker
  while the result sentence claimed a 36% loss increase. The path is now
  extended to its exact crossing of the plotted domain and capped with an arrow,
  so divergence is visible. This is the first row of Phase 4, taken early
  because it contradicted Phase 1's own claim.
- **Two e2e tests raced hydration.** `fill()` on the library searchbox is lost
  if it lands before the client bundle attaches; the tests now re-apply the
  query until it takes. Worth noting as product behaviour too: a visitor who
  types before hydration loses those keystrokes.

### Phase 2 — Thin the homepage

**Goal:** the homepage makes one argument and hands off. Target ≤ 3200px at
1440×900 (from 5330) and ≤ 8 rendered previews (from 16).

1. **Cut §04 "Complete collection".** It is `/visualisations` rendered a second
   time, worse, and it costs 13 of the 16 previews and the entire brittle
   `:has()` block. Replace with a single band: the count, one line, and the
   existing "Search the library" button. This alone removes ~1900px, ~40 SVG
   elements, and 13 previews.
2. **Keep §02** (three controlled comparisons). It is the strongest section on
   the page and the only one that demonstrates the method rather than listing
   the catalogue. Tighten each plate's vertical rhythm.
3. **Keep §03** (concept field) as the sole full-catalogue surface on the
   homepage. Its edge alignment and label clipping are already fixed (§2.3,
   §2.4); nothing further is required of it here.
4. Re-check the folio markers and section numbering after removal.

**Acceptance:** DOM node count, page height, and preview count measured before
and after; `npm run budget` re-run.

### Phase 3 — Let the scenes breathe

**Goal:** every scene uses ≥ 80% of its allotted slot height at all four
required viewports.

1. Audit each scene's `viewBox` and `preserveAspectRatio`. Replace fixed
   aspect ratios with either (a) a `ResizeObserver`-driven `viewBox` (already
   the pattern in `VizCanvas`), or (b) `preserveAspectRatio="none"` on
   background layers with shape-preserving marks drawn in screen units.
2. Priority order by measured waste: **attention** (26–34% used),
   **gradient-descent on mobile** (42%), **overfitting** (70–78%),
   **kernel-trick horizontal** (~25% of width used at desktop).
3. For attention specifically: the arc field is inherently wide and short.
   Either allow it to expand vertically (taller arcs, more separation between
   the eight context tokens) or accept a shorter slot and give the recovered
   height to the token detail rows.
4. Add the slot-fill ratio to the e2e viewport suite as a soft assertion so
   regressions surface.

### Phase 4 — Make each argument readable

Per-exhibit, smallest change that closes the gap identified in §2.5. Each is
independent; ship them one at a time with a visual baseline capture.

| Exhibit | Change |
| --- | --- |
| Gradient descent (hero) | Raise kept-path weight/opacity; move `KEPT`/`CURRENT` labels to a fixed legend row instead of floating anchors that collide |
| Gradient descent (exhibit) | Darken the surface material or lighten the canvas so the bowl reads as a solid form; strengthen contour lines |
| Overfitting | Add degree tick values to the error chart x-axis; move the `GAP` annotation clear of the axis; mark the selected degree on both charts |
| Decision tree | Add x/y tick values to the feature plot; move the legend out of the plot into the panel header; collapse the empty rules-panel space at depth 1 |
| k-means | Increase region-tint saturation to a legible separation; tint points by assigned cluster once assignment runs |
| PCA | Reduce to two quality numbers with one unit; draw the projected points on the projection axis |
| Backpropagation | Compute and show the forward pass and loss on load; reserve `?` for the step that actually asks a question |
| Token sampling | Move the percentage readout adjacent to each bar; give sub-1% tokens a visible minimum bar with the value beside it |
| CNN | Fix `stageLabel` so step 0 reads "RAW FEATURE MAP", not "INPUT" |

### Phase 5 — Hygiene

1. Fix the two hydration mismatches (`token-sampling`, `regression-boundary`) —
   apply the same fixed-precision serialisation used in `GradientDescentProof`.
2. Replace deprecated `THREE.Clock` with `THREE.Timer`.
3. Add a console-error assertion to the e2e suite so hydration regressions fail
   CI rather than sitting silently in a dev-only overlay.
4. Bound the `/concepts` map to the viewport so it does not clip mid-node.

---

## 5. Deliberately not doing

- **Not restyling.** The warm-neutral / rust / muted-green system, the serif
  display face, and the mono technical labels are the site's identity and are
  working. Nothing here changes a colour token except for two AA fixes.
- **Not adding exhibits.** The catalogue is frozen at 13 by
  `docs/greatness-plan.md` and that is the right call.
- **Not adding a shared scene-layout abstraction.** The second-use rule in the
  greatness plan applies; Phase 3 fixes the same class of bug in several places
  but each scene's geometry is genuinely its own.
- **Not touching the library page.** It is the cleanest surface on the site.
- **Not adding motion.** The existing reduced-motion handling is thorough and
  the trace animations are restrained.

---

## 6. Sequencing and risk

| Phase | Effort | Risk | Unblocks |
| --- | --- | --- | --- |
| 1 Fix the fold | S | Low — one component, one token | **Complete** — the reported complaint |
| 2 Thin the homepage | M | Low — mostly deletion | Budget headroom, removes brittle CSS |
| 3 Scene sizing | M | Medium — touches 13 scenes' geometry | Phase 4 legibility work |
| 4 Per-exhibit legibility | L | Medium — needs visual baseline re-capture | — |
| 5 Hygiene | S | Low | Clean CI signal |

Phase 1 and Phase 2 together are the bulk of the perceived improvement and can
land in one change. Phase 3 should precede Phase 4 so that legibility fixes are
made at the size the scene will actually be drawn.

Every phase must pass the existing gate before merge:
`npm run lint`, `npm run test`, `npm run build`, `npm run budget`, `npm run e2e`,
plus the four `CONTRIBUTING.md` viewports and a re-capture of any affected
`docs/visual-baselines/` signature states.

---

## 7. Verification notes for this machine

`npm run lint`, `npm run test` (201 passing), `npm run build`, and
`npm run budget` (16/16 within budget; homepage 202.8 KiB of a 210 KiB budget)
all pass. The Chromium e2e project passes 116/116 when run on its own.

Two environment limits apply here and are not code problems:

- **WebKit cannot launch.** It needs `libicu74`, `libxml2`, and `libflite1`,
  which Playwright names as Debian packages; this is an Arch host. The README
  already directs WebKit coverage to the official Playwright container.
- **The suite is flaky under full parallelism on this GPU.** WebGL exhibits log
  `GPU stall due to ReadPixels` and one or two walkthrough tests fail per run,
  passing in isolation. The unmodified tree fails the same way at the same
  worker counts, so this predates the Phase 1 change.
