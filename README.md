# Interactive Machine Learning Visualisations

A static web application for exploring machine-learning and deep-learning
concepts through direct manipulation. Each visualisation is designed to fit in
one browser viewport with its essential controls and explanation visible at the
same time.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run test
npm run build
```

The production build is a static export written to `out/` for GitHub Pages.

## Structure

- `src/features/exhibits/`: visualisation models, scenes, metadata, and tests.
- `src/app/visualisations/`: index and statically generated workspace routes.
- `src/app/tokens.css`: preserved colour, typography, shape, and motion system.
- `src/lib/vizTokens.ts`: renderer-safe copies of visualisation colours.
- `docs/visualisation-rebuild-plan.md`: implementation plan and work tracker.

## Adding a visualisation

1. Create a deterministic model and its tests.
2. Build a responsive scene implementing `ExhibitSceneProps`.
3. Keep the scene within the available workspace height; do not add page-length
   explanatory sections.
4. Register its metadata in `src/features/exhibits/registry.ts`.
5. Verify keyboard, pointer, touch, reduced-motion, and accessible descriptions.
