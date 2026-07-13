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
npm run budget
npm run e2e
```

The production build is a static export written to `out/` for GitHub Pages.
The budget check measures the compressed JavaScript referenced by every public
route. Browser tests run the complete viewport suite in Chromium and focused
SVG/WebGL smoke checks in Firefox and WebKit.

## Structure

- `src/features/exhibits/`: visualisation models, scenes, metadata, and tests.
- `src/app/visualisations/`: index and statically generated workspace routes.
- `src/app/tokens.css`: preserved colour, typography, shape, and motion system.
- `src/lib/vizTokens.ts`: renderer-safe copies of visualisation colours.
- `docs/website-roadmap.md`: current release and milestone tracker.
- `docs/identity-decision.md`: visual identity and public-language rules.
- `docs/embedding-and-static-reuse.md`: state links, iframe embeds, and static hosting.
- `CONTRIBUTING.md`: contributor requirements and the exhibit workflow.

## Adding a visualisation

Start with `npm run scaffold:exhibit -- --help`, then follow
[`CONTRIBUTING.md`](CONTRIBUTING.md). The scaffold creates the model, metadata,
scene, and test files but does not register unfinished work in the library.

## Embedding

Add `embed=1` to a visualisation URL for the navigation-free workspace. See
[`docs/embedding-and-static-reuse.md`](docs/embedding-and-static-reuse.md) for
state links, iframe markup, and static hosting constraints.
