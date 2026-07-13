# Contributing

Contributions should improve a visual explanation, its correctness, or the
static platform around it. A new topic is not enough on its own.

## Before changing an exhibit

Read the exhibit metadata, model, scene, and current tests together. Preserve
the existing URL state and interaction semantics unless the change explicitly
replaces them. Record what is computed, authored, precomputed, simplified, or
omitted in the exhibit assumptions.

For visual changes, check the complete workspace at:

- 390×844
- 768×1024
- 1280×720
- 1440×900

Controls must remain usable with keyboard, pointer, and touch. Important states
need a nonvisual description and cannot rely on colour or continuous motion
alone.

## Proposing a new exhibit

First answer these questions in the issue or pull request:

1. What single question does the exhibit answer?
2. What does the visitor manipulate?
3. What change becomes visible because of that manipulation?
4. Why is a static diagram or existing exhibit insufficient?
5. What is computed, authored, or omitted?
6. Which deterministic states should be covered by tests and shared URLs?

Catalogue expansion is intentionally selective. Do not register an unfinished
placeholder merely to reserve a topic.

Create the starting files with:

```bash
npm run scaffold:exhibit -- \
  --slug bias-variance \
  --title "Bias and variance" \
  --question "How do fitted models vary across samples?" \
  --topic "Generalisation" \
  --renderer SVG
```

Use `--dry-run` to inspect the file plan. The command refuses to overwrite an
existing exhibit directory.

The scaffold creates a model, model test, exhibit definition, accessible scene,
and scene test. Its placeholder text is deliberately obvious. Replace it before
adding the exhibit to:

- `src/features/exhibits/registry.ts`
- `src/features/exhibits/sceneRegistry.tsx`
- `scripts/check-static-budget.mjs`
- `scripts/generate-social-images.mjs`
- the relevant browser coverage in `e2e/`

Use `sceneUrlState.ts` for shareable non-default controls. Add a shared runtime
abstraction only after a second exhibit needs the same semantic behaviour.

## Validation

Run the complete local gate after implementation:

```bash
npm run lint
npm test
npm run build
npm run budget
npm run e2e
```

WebGL changes also need a nonblank canvas check and direct visual review.
Signature-state capture scripts belong in `scripts/`; reviewed images belong in
`docs/visual-baselines/`.

## Scope and licence

Keep the production application static and free of analytics, accounts,
advertising, tracking cookies, or third-party runtime scripts without a clear
technical need. Do not add generated lockfile churn or unrelated refactors.

The repository does not currently contain an explicit reuse licence. Source
availability alone does not grant redistribution rights. A separate owner
decision is required before the project can describe itself as openly reusable.
