# Interactive Redesign — Plan & Status

> **Status:** Phases 1–3 landed (labs, homepage, map/curriculum restructure); phase 4 outstanding
> **Branch:** `redesign`
> **Last updated:** 2026-07-12

Reframes the site from "a textbook with pictures" into an interactive-first
companion for understanding AI: the interactive thing becomes the page, the
text becomes the supporting material. The curriculum itself is presented as
**one journey in five stages** rather than three parallel tracks.

---

## Design decisions of record

1. **Five-stage taxonomy** (`src/lib/stages.ts`): Foundations → Classical ML
   Toolbox → Deep Learning → Language & LLMs → Vision & Generation. Stages are
   a presentation layer over modules; the three legacy track ids
   (`practitioner`, `modern-ai`, `computer-vision`) remain underneath for the
   /tracks browser and module metadata. Every module maps to exactly one
   stage; unmapped modules fall back by track so new modules never vanish
   from the map.
2. **The concept map is the curriculum's front door.** The homepage's
   curriculum section embeds the interactive map; the track-list browser
   moved to `/tracks` as the secondary "browse as a list" view.
3. **Labs are viewport-first.** Lab pages use a shared `LabShell` with a
   compact (~100px) header so the interactive environment is visible without
   scrolling; all prose sits below the fold.
4. **Muted stage identities.** Stage colors stay inside the paper palette:
   sage `#556B4A`, greige `#7B756A`, terracotta `#B0573E`, slate `#5E6E85`,
   brick `#8D5149` — carried by a card's left edge, not loud fills.

---

## Shipped on this branch

### Labs (6 total)
- `/playground` — Neural Network Playground (pre-existing; shareable URLs,
  theater mode).
- `/labs/sampling` — Token Sampling Lab (bigram LM, temperature/top-k).
- `/labs/gradient-descent` — SGD vs Momentum vs RMSProp vs Adam racing on
  four analytic loss surfaces; topographic contour-line canvas (marching
  squares in `gradientDescentMath.ts`), click-to-drop start point, direct
  trail labels.
- `/labs/overfitting` — polynomial regression on noisy 1D data; degree and
  ridge-λ sliders, click-to-add points, train/test RMSE with the U-shaped
  error-vs-degree chart (`overfittingMath.ts`, normal equations with
  partial-pivot elimination, x normalized to [-1,1]).
- `/labs/attention` — hand-authored (explicitly disclosed) attention
  matrices over 4 sentences × 2 heads, incl. the Vaswani coreference pair;
  hover arcs + full N×N heatmap. Row-stochasticity enforced by tests.
- `/labs/tokenizer` — real BPE trained at module load (~200 merges on an
  embedded corpus); merge-step scrubber, token chips, live stats (`bpe.ts`).
- All labs: pure logic in a separate tested module; page shells via
  `src/components/labs/LabShell.tsx`; registry + curated sequences in
  `src/lib/labs.ts` (single source of truth for gallery, homepage strip,
  sitemap).

### Concept map v2 (`src/lib/conceptMap.ts`, `src/components/ConceptMap.tsx`)
- Stage-banded vertical layout (no more sideways scrolling): five bands,
  responsive CSS-grid node cards, ordered by prerequisite depth.
- Edges drawn on a measured SVG overlay (ResizeObserver): calm default shows
  only short same-stage edges; hover/focus a node to see its full ancestor
  chain (terracotta, "builds on") and descendant chain (sage, "unlocks")
  across bands while everything else dims.
- Node cards carry stage-colored edge, "unlocks n" count, and a `lab` chip
  when an interactive lab targets that module.
- Full page (`/map`): stage-chip jump nav, builds-on/unlocks legend, text
  filter. Homepage: `embed` variant (fixed height, internal scroll, fade).

### Homepage (`src/app/page.tsx`)
- Server component (was client) — module content stays out of the bundle.
- Hero: live auto-training MLP decision boundary (`HeroTrainingDemo.tsx`,
  2→8→8→1 on two-moons, pauses offscreen, honors reduced motion).
- Section order: hero → labs strip (from registry) → philosophy → embedded
  concept map (with "Open the Full Map" / "Browse as a List") → QR → footer.
- 69 KB inline QR SVG extracted to `public/suranjan-qr.svg`.

### Curriculum restructure (phase 1 of the "destroy & rebuild" mandate)
- Prerequisite-graph repairs: naive-bayes no longer "requires" NLP; the three
  synthesis modules became real capstones with prerequisites; knn /
  decision-trees / mcmc joined the graph.
- New module: **AI Agents & Tool Use** (`ai-agents`, stage IV) — tool
  calling, ReAct, planning, memory, multi-agent, failure modes, evaluation —
  with its own step-through agent-loop visualization.
- `/tracks` is now a real page hosting the track/list browser;
  `/tracks/[trackId]` redirects there.

### Verification state (final, 2026-07-12)
- `npx tsc --noEmit`, `npm test` (9,309 incl. content validation), `npm run
  lint`, `npm run build` (static export), and the **entire** cypress suite —
  11 specs, 36/36 tests — all green against the served static export.
- Cypress specs were substantially repaired in the process; latent traps
  fixed: unscoped `cy.contains('button', 'Deep Learning')` matched the
  dl-synthesis module card, the header renders two SearchBars (scope
  `:visible`), the quiz is collapsed by default (open before asserting Q1),
  `#lesson-module-select` navigates away if "spammed", and synthesis/workflow
  modules legitimately have no Interactive Diagram (viz checks now
  conditional in all-modules.cy.ts).
- `scripts/serve-static.mjs` restored from git history (`26aed98`) — it was
  deleted by an earlier commit while `package.json` still referenced it.

---

## Remaining work (planned, not started)

1. **Per-visualization overhaul** — execute
   `docs/visualization-pedagogy-overhaul-plan.md` (full-width canvases, one
   insight moment per viz, retire the cramped 340px side rail in 26 of 40
   visuals). Largest single quality lever left.
2. **Curriculum phase 2 — retire & rewrite.** Candidates to merge or retire:
   `mcmc` (fold into `gmm-em` as a sampling section?), `naive-bayes`
   (refresh, it's the weakest classical module), `nlp` (mostly superseded by
   embeddings-tokenization + transformers; consider merging). Candidates to
   add: interpretability/explainability, time-series. Decide per module with
   the content-validation suite as the gate.
3. **More curated sequences** once new modules settle (a "Vision" path; an
   "Agents" path ending at the ai-agents module).
4. **Mobile pass on the concept map** — bands work on small screens but
   hover-lineage needs a tap-to-pin interaction.
5. **Cypress depth** — specs for /map interactions and each lab's core
   controls (only homepage/smoke/tracks/navigation cover the new surfaces).
