# Embedding and Static Reuse

Updated: 2026-07-13

## Link to a specific state

Open an exhibit, set its controls, and use **Copy current view**. Supported
non-default controls and the current guided step are stored in the query string.
The link does not depend on an account, cookie, local storage, or backend.

Example:

```text
https://suranjan77.github.io/visualisations/gradient-descent?step=2&lr=0.4
```

Invalid or out-of-range scene parameters are ignored. Default values are
removed from the URL to keep links readable.

## Embed an exhibit

Add `embed=1` to a normal exhibit URL. The embedded view removes global
navigation while retaining the exhibit title, controls, keyboard operation,
guided steps, insight dialog, and a link to the full page.

```html
<iframe
  src="https://suranjan77.github.io/visualisations/gradient-descent?step=2&amp;lr=0.4&amp;embed=1"
  title="Gradient descent learning-rate visualisation"
  width="1280"
  height="720"
  loading="lazy"
  style="width: 100%; max-width: 1280px; border: 0;"
></iframe>
```

Use enough height for the workspace controls. A 16:9 frame is a useful desktop
starting point; portrait layouts should be given substantially more height.
Do not remove the iframe `title`.

The host page must allow frames from `https://suranjan77.github.io` in its
Content Security Policy. The project itself does not load analytics, advertising,
or visitor-profile scripts inside the frame.

## Build the static export

```bash
npm ci
npm run build
npm run budget
```

The deployable output is written to `out/`. It consists of HTML, JavaScript,
fonts, images, the manifest, sitemap, and other static assets. Test it locally
with:

```bash
npm run serve:static
```

The included GitHub Actions workflow validates and publishes `out/` to GitHub
Pages after pushes to `main`.

## Hosting at another path

The current production build targets the root of
`https://suranjan77.github.io`. Hosting a fork below a path such as
`https://example.com/tools/ml/` requires a matching Next.js `basePath` and
public site URL, followed by a fresh build and browser test pass. Do not move
the existing `out/` directory below another path and assume its absolute asset
URLs will continue to work.

## Reuse status

The source is visible, but this repository does not yet include an explicit
software or content licence. Embedding the published pages through their normal
URLs is documented here. Redistribution or derivative use requires a separate
licence decision from the repository owner.
