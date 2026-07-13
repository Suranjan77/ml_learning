# Website Roadmap

Status: active
Updated: 2026-07-13

## Implementation tracker

| Release | Status | Progress |
| --- | --- | --- |
| Release 1: Leaner and safer | Complete | Scene bundles, CI gates, JavaScript budgets, modal accessibility, reduced-motion handling, and Chromium/Firefox/WebKit coverage are verified. The optional physical-device font/render audit was skipped by maintainer direction. |
| Release 2: Easier to explore | Complete | Search, filters with URL state, discovery tags, question-led groupings, and related ideas are complete. The library browser passes Chromium, Firefox, and containerised WebKit coverage. |
| Release 3: Easier to share and trust | Complete | Meaningful scene state and guided steps are shareable; copy-link, clean embeds, visible WebGL fallback text, references, assumptions, methodology, unique canonical/social metadata, static preview images, and structured data are implemented and verified. |
| Release 4: Expand carefully | Complete | Regression parameters and decision-tree partitions shipped as a two-exhibit wave with deterministic models, shareable controls, static metadata, budgets, four-viewport coverage, and Chromium/Firefox/WebKit verification. |
| G0: Baseline and freeze | In progress | The 13-exhibit catalogue is frozen. The creative doctrine, flagship scorecard, signature states, and human-observation gate are defined in `docs/greatness-plan.md`. |
| G1: Gradient Descent flagship | In progress | Gradient Descent is the sole committed flagship. Work is focused on causal path comparison, the learning-rate stability boundary, deterministic signature states, and comprehension. |
| G2: Human observation | In progress | One ML-familiar laptop session is recorded. It exposed failures in first-action clarity, arrow meaning, regime distinction, comparison discovery, and intended recall; the first evidence-led revision is implemented and awaiting uncoached retest. |
| G3-G6 | Blocked by gates | Reusable grammar, later flagships, homepage re-authoring, and naming wait for evidence from G1 and G2. |

Update this tracker in the same change that completes or materially advances a
roadmap item. A release is complete only after its completion criteria have been
verified.

### Greatness phase implementation log

Updated: 2026-07-13

- [x] Freeze catalogue expansion at 13 exhibits until the first flagship passes
  its creative and observation gates.
- [x] Adopt the flagship scorecard and the second-use rule for shared
  interaction abstractions.
- [x] Commit to Gradient Descent as the only first flagship; leave later
  candidates unselected.
- [x] Define five deterministic Gradient Descent signature states.
- [x] Add computed full-path assessment for the valley stability experiment.
- [x] Add an explicit kept-path comparison so learning rate can be isolated as
  the changing variable.
- [x] Make current and kept starting positions URL-restorable, expose the
  different-basin contrast nonvisually, and verify all five signature states.
- [x] Label whether a kept-path comparison isolates rate, isolates start, or
  changes both; avoid attributing confounded basin outcomes to the start alone.
- [x] Record the provisional flagship scorecard and observation priorities in
  `docs/gradient-descent-flagship-review.md`.
- [x] Replace global-only WebGL detection with a real context probe and verify
  that unsupported environments show an explanatory fallback instead of a
  blank canvas.
- [x] Verify lint, 157 unit/component tests, the 21-page static build, every
  JavaScript budget, and all 69 Chromium checks across the four representative
  viewports; verify all four smoke checks in Chromium, Firefox, and the official
  Playwright WebKit container.
- [x] Capture five reviewed WebGL signature baselines with a deterministic,
  nonblank-frame-checked Firefox script.
- [x] Record the first uncoached observation without altering the raw account;
  clarify move-versus-orbit gestures, label local downhill, name the three
  computed path regimes, and promote the kept-path comparison command in
  response.
- [ ] Complete the first uncoached human-observation round and revise the scene.
- [ ] Pass the flagship scorecard and close G1/G2 before extracting shared UI.

### Release 1 implementation log

Updated: 2026-07-12

- [x] Remove scene components from the shared metadata registry.
- [x] Dynamically import each exhibit scene through a stable scene renderer.
- [x] Confirm that SVG routes exclude the large Three.js/WebGL chunk.
- [x] Add compressed-JavaScript budgets for the homepage, library, SVG routes,
  and WebGL routes.
- [x] Gate Pages deployment on lint, unit/component tests, production build,
  static budgets, and browser tests.
- [x] Add Firefox and WebKit smoke projects for one SVG and one WebGL exhibit.
- [x] Trap focus in the insight dialog, close it with Escape, restore trigger
  focus, and make the underlying workspace inert while it is open.
- [x] Disable automatic walkthrough playback when reduced motion is preferred
  while leaving manual step controls available.
- [x] Verify lint, all 85 unit/component tests, the static production build,
  all route budgets, 51 Chromium browser checks, and both Firefox smoke checks.
- [x] Verify the SVG and WebGL WebKit smoke checks in the matching official
  Playwright 1.61.1 container.
- [x] Skip the representative physical-device font/loading audit by maintainer
  direction; the automated 390×844 viewport remains covered in Chromium.

### Release 2 implementation log

Updated: 2026-07-12

- [x] Give every exhibit a stable `tags` set and expose lightweight
  `exhibitSummaries` for discovery without shipping steps/challenges.
- [x] Add client-side search over titles, questions, summaries, and tags in a
  pure, unit-tested `search` module (every term must match).
- [x] Add topic, difficulty, length, and renderer filters via a
  `LibraryBrowser` client component.
- [x] Encode filter state in query parameters (`q`, `topic`, `difficulty`,
  `renderer`, `duration`), omit defaults, and ignore invalid or stale values.
- [x] Replace the inactive "All topics" label with real browsing controls, a
  live result count, a clear-filters action, and an empty state.
- [x] Add non-prescriptive `related` links per exhibit, surfaced as "Related
  ideas" inside the insight drawer.
- [x] Reframe the homepage groupings as "Explore by question" / related ideas
  with non-ordinal keywords instead of numbered learning paths.
- [x] Verify lint, 119 unit/component tests (34 new), the production build, all
  route budgets (library 189.7/210 KiB), and 54 Chromium browser checks.
- [x] Extend Firefox/WebKit smoke coverage to the library browser.
- [x] Verify the library browser smoke check in Firefox locally.
- [x] Verify the library browser smoke check in the matching official
  Playwright 1.61.1 WebKit container.

### Release 3 implementation log

Updated: 2026-07-12

- [x] Add concise assumptions/simplifications and references to each exhibit's
  metadata (`assumptions`, `references` with optional stable links).
- [x] Render "What is simplified" and "References" sections in the insight
  drawer, with external references opening in a new tab.
- [x] Verify lint, 130 unit/component tests (11 new), the production build, all
  route budgets, and the drawer Chromium check.
- [x] Extend the `?step=` convention to validated, non-default scene parameters
  for gradient-descent surface/learning rate, polynomial degree, and token
  sampling temperature/truncation controls.
- [x] Add a resilient "Copy current view" action and verify that a shared scene
  state restores after reload without storage, cookies, or identifiers.
- [x] Add a clean `embed=1` presentation without global navigation, retaining
  keyboard controls and a link back to the full view.
- [x] Add a visible explanatory fallback when WebGL is unavailable.
- [x] Add unique canonical URLs and per-route Open Graph/Twitter metadata.
- [x] Generate static 1200×630 preview images for the homepage, library,
  methodology page, and every exhibit.
- [x] Add `LearningResource` structured data to every exhibit without course or
  accreditation claims.
- [x] Add a methodology/about page covering approach, author, source, current
  licence status, accessibility, privacy, sharing, and embedding.
- [x] Add the methodology route to primary navigation and the sitemap.
- [x] Verify lint, 133 unit/component tests, the static production build, every
  JavaScript budget, all 58 Chromium checks, and all three Firefox smoke checks.
- [x] Verify all three WebKit smoke checks in the matching official Playwright
  1.61.1 container (3/3 passed).

### Release 4 implementation log

Updated: 2026-07-12

- [x] Select regression parameters and decision-tree partitions as a two-exhibit
  wave using the visual-argument test.
- [x] Regression answers how slope/intercept move both predictions and position
  on a loss surface; visitors manipulate model type, slope, and intercept. This
  connects parameter geometry to loss, which the abstract optimisation exhibit
  does not. The compact authored datasets and losses are deterministic.
- [x] Decision trees answer how nested rules carve feature space; visitors
  manipulate depth and the root threshold. This exposes inherited rectangular
  partitions, which no existing boundary exhibit shows. Routing and accuracy
  use a deterministic authored dataset.
- [x] Add guided steps, challenges, references, simplification disclosures,
  discovery tags, related ideas, and nonvisual live descriptions to both.
- [x] Encode non-default regression and tree controls in shareable URLs.
- [x] Add both routes to static generation, library/home discovery, sitemap,
  route budgets, canonical/social metadata, and generated preview images.
- [x] Add deterministic model tests and component interaction/preset tests.
- [x] Verify lint, 150 unit/component tests, the 13-route static export, every
  JavaScript budget, and all 66 Chromium checks across 390×844, 768×1024,
  1280×720, and 1440×900.
- [x] Verify all four smoke checks, including direct interaction with both new
  exhibits, in Firefox and containerised WebKit (4/4 in each).

## Direction

Take the website forward as a focused, static library of interactive machine-
learning visualisations. It is not a course, curriculum, learning-management
system, or user-tracking product. Each visualisation should remain useful on its
own: a visitor arrives with a question, manipulates the idea, understands the
mechanism, and leaves with a clearer mental model.

The site should stay:

- fully static and deployable to GitHub Pages;
- private by default, with no analytics, tracking pixels, cookies, accounts, or
  stored visitor profiles;
- open to non-linear exploration, without lessons, prerequisites, completion
  states, streaks, quizzes, or forced sequences;
- centred on direct manipulation rather than long-form teaching content;
- fast, accessible, shareable, and credible;
- visually distinctive without acquiring unnecessary product machinery.

## Current position

The foundation is already strong:

- thirteen purpose-built visualisations cover optimisation, generalisation,
  clustering, dimensionality reduction, classical machine learning, deep
  learning, evolutionary computation, and language models;
- every exhibit uses a compact, one-viewport workspace;
- the site is statically generated and has no backend requirement;
- deterministic models have unit tests and key scenes have component tests;
- Playwright checks every exhibit at four representative viewport sizes;
- lint, 150 unit/component tests, the production build, route budgets, and the
  Chromium/Firefox/WebKit suites currently pass.

The next stage should improve the quality and reach of the library before
expanding its size aggressively.

## Product principles

1. **One exhibit, one visual argument.** Every scene should make a specific
   relationship visible rather than act as a generic chart or simulation.
2. **Exploration is non-linear.** Topic groupings can help visitors browse, but
   must not imply a required syllabus or progression.
3. **Interaction comes first.** Supporting explanation should remain concise
   and should not push the visualisation out of the viewport.
4. **The URL is the state boundary.** When an exhibit state is worth preserving,
   encode it in the URL rather than storing it against a visitor.
5. **No surveillance as a feature.** Do not add behavioural analytics, session
   recording, advertising scripts, fingerprinting, or engagement tracking.
6. **Static by design.** Prefer build-time content, browser-native features, and
   GitHub-based project workflows over servers and databases.
7. **Depth before volume.** Improve weak visual explanations and missing context
   before adding another topic.

## Phase 1: Performance and delivery

Goal: make every exhibit load only what it needs and make deployment reliably
verify the site.

### Work

- Separate lightweight exhibit metadata from scene component imports.
- Dynamically load the requested scene so an SVG exhibit does not download the
  rest of the library or the WebGL stack.
- Measure generated asset sizes and set route-level JavaScript budgets.
- Keep Three.js isolated to the exhibits that genuinely require 3D.
- Run lint, unit tests, the production build, and Playwright in CI before the
  deployment job is allowed to publish.
- Add small Firefox and WebKit smoke suites for navigation, controls, SVG
  rendering, and WebGL fallback.
- Audit font loading and initial rendering on a mid-range mobile device.

### Completion criteria

- Each exhibit route ships only its own scene code and shared shell code.
- A failed validation step prevents deployment.
- Static export remains the only production artefact.
- The main pages meet documented performance budgets on mobile and desktop.

## Phase 2: Better library discovery

Goal: help visitors find a relevant visualisation without turning the site into
a course catalogue.

### Work

- Add client-side search over titles, questions, summaries, and topics.
- Add simple topic, difficulty, duration, and renderer filters.
- Put filter state in query parameters so filtered library views can be linked.
- Replace the inactive "All topics" label with real browsing controls.
- Add compact related-visualisation links to each workspace, based on conceptual
  relationships rather than a prescribed next lesson.
- Reframe homepage groupings as "Explore by question" or "Related ideas" rather
  than learning paths.
- Give every exhibit a stable set of tags for discovery and build-time metadata.

### Completion criteria

- Every exhibit can be found by both its formal name and the question it answers.
- Topic groupings never imply required order or completion.
- Search and filters work entirely in the browser with no network service.
- Filtered views remain usable without cookies or local storage.

## Phase 3: Sharable interactive states

Goal: make individual discoveries easy to reproduce while keeping the site
stateless and private.

### Work

- Extend the existing `?step=` convention to meaningful scene parameters where
  practical, such as learning rate, polynomial degree, temperature, or selected
  token.
- Add a "Copy current view" action using the browser clipboard API.
- Ensure shared URLs restore the same deterministic state.
- Keep URLs readable by omitting default values and rejecting invalid values.
- Add a clean embed presentation controlled by a URL parameter or dedicated
  static route, without the global navigation.
- Provide a static fallback summary when WebGL is unavailable.

### Completion criteria

- Important exhibit configurations can be shared as ordinary URLs.
- Shared state requires no database, account, cookie, or browser identifier.
- Embedded exhibits remain keyboard accessible and link back to the full view.

## Phase 4: Authority, context, and accessibility

Goal: make the visual explanations trustworthy and usable without burying them
under textbook material.

### Work

- Add concise references, assumptions, and simplifications to each insight
  drawer.
- Clearly identify hand-authored datasets and illustrative model outputs.
- Add equations or notation only where they clarify what the visitor is
  manipulating.
- Add a small methodology/about page covering the visualisation approach,
  author, source repository, licence, and accessibility commitment.
- Make the insight drawer fully modal: Escape to close, trapped focus, restored
  focus, and inert background content.
- Verify that autoplay and continuous scene motion respect reduced-motion
  preferences.
- Review colour contrast, non-colour encodings, touch target sizes, screen-reader
  descriptions, and keyboard operation.
- Add automated accessibility smoke checks while retaining manual review.

### Completion criteria

- Every exhibit states what is real, simplified, or hand-authored.
- Every interactive control is operable by keyboard and touch.
- The complete idea remains available through a nonvisual description.
- Supporting context stays inside the existing compact drawer pattern.

## Phase 5: Search and social presentation

Goal: make static pages understandable when discovered through search engines,
links, and social previews without observing visitor behaviour.

### Work

- Give every exhibit its own canonical URL rather than inheriting the homepage
  canonical.
- Generate a static Open Graph image for the homepage, library, and each exhibit.
- Add per-exhibit Open Graph and social metadata at build time.
- Add appropriate structured data for an educational interactive resource,
  without making course or accreditation claims.
- Improve page descriptions around the question each exhibit answers.
- Ensure the sitemap, manifest, `robots.txt`, favicon, and social images use the
  configured production base URL correctly.
- Add a human-readable static index of topics for crawlers and visitors.

### Completion criteria

- Every public route has a unique title, description, canonical URL, and preview.
- Link previews communicate the actual visual idea rather than generic branding.
- No SEO work introduces scripts, tracking, or server-side infrastructure.

## Phase 6: Selective exhibit expansion

Goal: broaden the library only where a new exhibit adds a distinct visual idea.

### Candidate topics

1. **Linear and logistic regression (shipped in Release 4)** — connect a
   decision boundary to a loss surface and parameter changes.
2. **Decision trees (shipped in Release 4)** — show how a sequence of
   axis-aligned splits partitions feature space.
3. **Embeddings** — expose neighbourhoods, analogy directions, and the limits of
   distance-based interpretation.
4. **Transformer block** — connect attention, residual connections,
   normalisation, and token updates in one compact flow.
5. **Bias and variance** — compare repeated fitted models rather than duplicating
   the existing overfitting exhibit.
6. **Reinforcement learning** — show how value estimates change through a small,
   deterministic environment.

### Selection test

Before implementing a candidate, require clear answers to all of the following:

- What single question does it answer?
- What can the visitor directly manipulate?
- What causal relationship becomes visible?
- Why is the idea not already covered by an existing exhibit?
- Can the complete interaction fit the established workspace?
- Can its model and important states be deterministic and testable?

Add exhibits in waves of no more than two or three, followed by visual,
accessibility, performance, and cross-browser review.

## Phase 7: Open, static distribution

Goal: let other people reuse and improve the work without creating a platform or
service.

### Work

- Document how to embed a visualisation with a normal URL or iframe.
- Provide a concise contributor guide and an exhibit scaffold.
- Document metadata, deterministic-model, accessibility, and viewport
  requirements for new exhibits.
- Add static downloadable diagrams or print-friendly summaries only where they
  are useful outside the interactive view.
- Use GitHub issues or discussions for feedback rather than building an in-site
  feedback backend.
- Consider offline caching only if it can remain a simple static enhancement and
  does not complicate updates or correctness.

## Recommended release sequence

### Release 1: Leaner and safer

- split the registry and route bundles;
- add full CI validation before deployment;
- fix modal behaviour and reduced-motion handling;
- establish performance budgets.

### Release 2: Easier to explore

- add static client-side search and filters;
- replace course-like path language with question-led topic groupings;
- add related concepts without prescribed ordering.

### Release 3: Easier to share and trust

- add URL-encoded exhibit states and copy-link support;
- add references, assumptions, and methodology;
- add route-specific canonical metadata and social previews;
- add the clean embed view.

### Release 4: Expand carefully

- select the next two exhibits using the visual-argument test;
- ship them with the same deterministic, accessibility, viewport, and static-
  export guarantees as the existing library.

## Explicit non-goals

The following are outside the intended direction:

- analytics and behavioural event tracking;
- accounts, profiles, authentication, or cloud-saved state;
- progress tracking, completion badges, streaks, points, or certificates;
- lessons, courses, syllabuses, assessments, or prerequisite gates;
- personalised recommendations based on visitor behaviour;
- comments, social feeds, or an in-site community backend;
- APIs, databases, or server rendering that compromise static deployment;
- advertising, sponsorship tracking, or marketing automation;
- adding exhibits merely to increase the library count.

## Ongoing quality checklist

For every change:

- preserve static export and GitHub Pages deployment;
- avoid third-party runtime scripts unless they are essential and privacy-safe;
- test at 390x844, 768x1024, 1280x720, and 1440x900;
- verify pointer, touch, keyboard, screen-reader, and reduced-motion behaviour;
- keep the visualisation and essential controls within the workspace viewport;
- keep model behaviour deterministic where possible;
- update unit, component, and browser tests in proportion to the change;
- check that the change makes an idea clearer, the site easier to explore, or
  the implementation more robust.
