# Interactive Redesign — Plan & Status

> **Status:** Phase 1 landed, phases 2–3 outstanding
> **Branch:** `redesign`
> **Last updated:** 2026-07-11

Reframes the site from "a textbook with pictures" into an interactive-first
companion for understanding AI: the interactive thing becomes the page, the
text becomes the supporting material.

---

## Shipped on this branch

### 1. Lesson pages are visualization-first
`LessonPage.tsx` now opens with the interactive visualization immediately
after the TL;DR (subtitle: "Start here — play with the model, then read on").
The notation table moved inside the collapsed **The Mathematics** section, so
all formal math sits behind one "go deeper" fold. Intuition, In Depth, and
the practice sections follow the visualization.

### 2. Theater mode (`src/components/ui/TheaterMode.tsx`)
Fullscreen overlay toggle wrapped around every lesson visualization and the
playground simulator. Children stay mounted across the toggle so trained
weights / drawn points survive. ESC closes; a `resize` event is dispatched on
toggle so canvas-based visuals re-measure.

### 3. Shareable playground URLs
`AlgorithmSimulator.tsx` reads `?preset=xor&h=8&lr=0.08&reg=0.0005&act=tanh&m=0.9`
on mount and applies it; a **Copy Setup Link** button (next to Reset Weights)
serializes the current settings, writes them to the address bar, and copies
the URL. Hand-drawn custom points are intentionally not encoded.

### 4. Labs section
- `/labs` — gallery page listing all standalone interactive tools.
- `/labs/sampling` — **Token Sampling Lab** (`src/components/labs/SamplingLab.tsx`):
  a fully client-side, hand-authored word-bigram language model whose entire
  next-word distribution is displayed as bars (adjusted probability) with a
  marker for the raw T=1 probability. Temperature (0.1–2) and top-k (1–5)
  knobs, sample/auto-generate/reset controls.

### 5. Concept map
- `src/lib/conceptMap.ts` — build-time layout: longest-path depth columns,
  barycenter row ordering, isolated modules (knn, mcmc, 3× synthesis)
  separated out. Computed in the server component so module content stays
  out of the client bundle.
- `src/components/ConceptMap.tsx` — HTML nodes over an SVG edge underlay;
  hover/focus highlights the full prerequisite lineage and everything the
  topic unlocks; click opens the lesson. Track-colored, horizontally
  scrollable.
- `/map` — the page.

### 6. Navigation & homepage (scoped)
Header nav: Curriculum · Labs · Concept Map · About. Hero CTAs now lead with
"Explore the Labs" and "See the Concept Map". Sitemap includes
`/labs`, `/labs/sampling`, `/playground`, `/map`.

---

## Remaining work (planned, not started)

1. **Full homepage rebuild** — hero with a live embedded mini-interactive
   (auto-training decision boundary) instead of the static contour SVG;
   labs strip section; demote tracks further. Also extract the inline QR
   SVG in `src/app/page.tsx` (~69 KB, line 12) to `public/` — it dominates
   the page bundle.
2. **More labs** (one idea each, no prose walls):
   - Tokenizer & embeddings lab (BPE splitting + 2D-projected embeddings;
     transformers.js works within a static export if real embeddings wanted).
   - Attention lab (sentence → interactive attention heatmap).
   - Gradient descent lab (extract/expand `OptimizationOptimizersViz`).
   - Overfitting lab (draw points, crank complexity, watch train/test
     diverge).
3. **Per-visualization overhaul** — execute
   `docs/visualization-pedagogy-overhaul-plan.md` (full-width canvases, one
   insight moment per viz, retire the cramped 340px side rail in 26 of 40
   visuals).
4. **Curated sequences** — named ordered paths through 4–5 labs/modules.
5. **Cypress refresh** — `homepage.cy.ts` and `tracks.cy.ts` still assert
   the pre-rebrand "Modern AI Systems" track title (now "Deep Learning"),
   and `smoke.cy.ts` visits a `/gradforge` route that no longer exists;
   these predate this branch. Update alongside the homepage rebuild.
