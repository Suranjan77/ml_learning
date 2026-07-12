# Interactive Visualisation Rebuild

Status: complete; library expanded to six visualisations  
Updated: 2026-07-12

Current validation: TypeScript and ESLint pass; 23 unit/component tests pass;
the static production build passes; all 13 production-browser checks pass at
390×844, 768×1024, 1280×720, and 1440×900. Final screenshots were reviewed at
native desktop and mobile sizes, including guided kernel and attention states.

## Goal

Replace the course application with a neutral, compact library of interactive
machine-learning visualisations. Preserve only the established colour,
typography, border, radius, and motion system.

The primary usability rule is that the complete interactive experience must fit
inside the visible browser window. The stage, essential controls, step context,
and navigation must remain simultaneously visible without vertical page
scrolling at supported desktop and tablet viewport sizes. Mobile may use a
compact stacked arrangement, but the interaction itself must remain within one
screen-height panel.

## Product rules

- Use neutral, descriptive language. Do not invent a product or brand name.
- Lead with the visualisation, not a marketing header or lesson introduction.
- Each visualisation teaches one idea through an authored interaction.
- Controls must directly affect the visual state and produce immediate feedback.
- Prefer purpose-built visual explanations over generic charts or reused lesson UI.
- Provide keyboard, pointer, touch, reduced-motion, and nonvisual descriptions.
- Remove the previous curriculum, tracks, lessons, labs, map, sidebar, and their
  runtime routes rather than retaining compatibility.
- Keep the existing design tokens and font selection unchanged.

## Target structure

```text
src/app/
  page.tsx                    compact visualisation index
  visualisations/[slug]/      full-window visualisation workspace

src/features/visualisations/
  core/                       workspace, viewport sizing, controls, types
  gradient-descent/           purpose-built scene and model
  attention/                  purpose-built scene and model
  kernel-trick/               purpose-built scene and model
  registry.ts
```

## Workspace layout

Desktop/tablet workspace height:

```text
100dvh
├── 56–64px global header
└── remaining viewport
    ├── compact title/context row
    ├── responsive visual stage (largest area)
    └── fixed-height control + observation strip
```

There must be no duplicate descriptions beneath the stage. Supporting detail is
available through a compact information drawer that overlays or replaces the
control strip instead of extending the page.

## Visualisation improvements

### Gradient descent

- Replace the basic contour plot and side form with a larger landscape view.
- Animate individual steps with a clear local gradient arrow and before/after loss.
- Make learning-rate failure visible through overshoot, not just a number.
- Provide direct start-point dragging and keyboard nudging.

### Attention

- Replace token buttons plus ranked cards with a spatial attention diagram.
- Render weighted connections between source and destination token rows.
- Allow pointer/focus scrubbing across query tokens.
- Compare two sentence contexts without adding separate content panels.
- Label the data as an authored explanation rather than model output.

### Kernel trick

- Use a continuous 2D → lifted feature-space transition.
- Make depth readable through axes, point ordering, surface occlusion, and motion.
- Connect the separating plane to the resulting circular boundary.
- Keep the practical-kernel simplification available in the information drawer.

## Work tracker

### A. Plan and foundation

- [x] Write the rebuild plan and usability rules into the repository.
- [x] Replace naming and copy with neutral language.
- [x] Replace the page shell with a one-viewport workspace.
- [x] Add viewport and overflow regression tests.

### B. Visualisations

- [x] Rebuild gradient descent interaction and visual treatment.
- [x] Rebuild attention as a weighted spatial connection diagram.
- [x] Rebuild the kernel transition and plane/boundary relationship.
- [x] Add interaction and model tests for each rebuilt scene.

### C. Destructive cleanup

- [x] Remove curriculum, algorithm, track, lab, map, playground, and sidebar routes.
- [x] Remove legacy navigation, content registries, and unreachable presentation code.
- [x] Remove obsolete tests and dependencies.
- [x] Rewrite metadata, manifest, sitemap, and README for the neutral product.

### D. Verification

- [x] Verify 390×844, 768×1024, 1280×720, and 1440×900 layouts.
- [x] Verify pointer, touch, and keyboard operation.
- [x] Verify reduced-motion behavior and accessible state descriptions.
- [x] Pass TypeScript, lint, unit tests, and static production build.
- [x] Review final screenshots for clipping, hierarchy, and visual consistency.

## Final verification record

- `npx tsc --noEmit` — passed.
- `npm run lint` — passed without warnings.
- `npm run test` — 6 files, 23 tests passed.
- `npm run build` — passed; static export contains only the index,
  visualisation library, three visualisation routes, and metadata routes.
- `npx cypress run --spec cypress/e2e/visualisations.cy.ts` — 13/13 passed.
- Production-only hydration checks — passed after correcting the attention SVG
  title to use a single text node.
- Screenshot review — homepage and all three workspaces reviewed at desktop;
  attention and gradient descent reviewed at 390×844; kernel class bounds were
  adjusted to prevent point clipping in the short desktop workspace.

## Library expansion — wave 2

Added 2026-07-12, following the "Adding a visualisation" checklist in the
README. Three exhibits covering the topic areas the initial trio lacked:

- **Overfitting** (`overfitting`, Generalisation) — polynomial degree against
  deterministic noisy samples, with a paired train/validation error panel.
  Regime labels derive from the empirical validation-error minimum with a 25%
  tolerance band.
- **K-means clustering** (`k-means`, Unsupervised learning) — draggable
  centroids over an authored three-blob dataset, explicit assign/update
  half-iteration stepping, animated run to convergence, and an authored bad
  initialisation that settles into a visibly poor local optimum.
- **Token sampling** (`token-sampling`, Language models) — temperature and
  top-k/top-p reshaping a hand-authored next-token distribution, with
  deterministic sampling from a fixed draw sequence. The attention exhibit's
  topic facet was renamed to match ("Language models").

Presentation changes with the expansion:

- The homepage now shows a curated featured trio and links to the full
  library; `/visualisations` scrolls normally and scales to any exhibit count.
- Each new exhibit received a purpose-drawn card vignette in
  `src/components/ExhibitCard.tsx`.
- The Cypress suite covers all six workspace routes at the four target
  viewports, plus a library-index listing check.

## Completion criteria

- Only the new index and visualisation workspace are linked and generated.
- Every workspace fits within the visible viewport at the target desktop/tablet
  sizes without document scrolling.
- The three initial visualisations are purpose-built and materially clearer than
  their previous versions.
- No invented brand language remains in visible UI or metadata.
- The static export and automated verification suite pass.
