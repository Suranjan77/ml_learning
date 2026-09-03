import { expect, test } from "@playwright/test";

test("operates an SVG exhibit", async ({ page }) => {
  await page.goto("/visualisations/attention");

  await expect(page.getByRole("img", { name: /attention connections/i })).toBeVisible();
  await page.getByRole("button", { name: "Auto-play guided steps" }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Pause guided walkthrough" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("button", { name: "Guided walkthrough complete" })).toBeDisabled();
  await page.getByRole("button", { name: "Replay guided walkthrough" }).click();
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Pause guided walkthrough" }).click();
});

test("renders a nonblank WebGL scene or an explicit fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/visualisations/gradient-descent");

  await expect(page.locator('[data-testid="visualisation-workspace"]')).toBeVisible();
  const scene = page.getByRole("img", { name: "Three-dimensional loss landscape" });
  await expect(scene).toBeVisible();

  const canvas = scene.locator("canvas");
  const fallback = scene.getByText(/3D view is unavailable/);
  await expect.poll(async () => {
    if (await canvas.count()) return "canvas";
    if (await fallback.isVisible().catch(() => false)) return "fallback";
    return "pending";
  }).toMatch(/canvas|fallback/);

  if (await canvas.count()) {
    await expect(canvas).toBeVisible();
    await expect.poll(() => canvas.evaluate(async (element) => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const canvasElement = element as HTMLCanvasElement;
      const context = canvasElement.getContext("webgl2") ?? canvasElement.getContext("webgl");
      if (!context) return 0;
      const { drawingBufferWidth: width, drawingBufferHeight: height } = context;
      const pixels = new Uint8Array(width * height * 4);
      context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, pixels);
      const colours = new Set<string>();
      const xStep = Math.max(1, Math.floor(width / 64));
      const yStep = Math.max(1, Math.floor(height / 36));
      for (let y = 0; y < height; y += yStep) {
        for (let x = 0; x < width; x += xStep) {
          const index = (y * width + x) * 4;
          colours.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]},${pixels[index + 3]}`);
          if (colours.size > 1) return colours.size;
        }
      }
      return colours.size;
    }), { timeout: 10_000 }).toBeGreaterThan(1);
  } else {
    await expect(fallback).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
});

test("searches and filters the library", async ({ page }) => {
  await page.goto("/visualisations");
  // The library filters client-side, so a fill that lands before hydration is
  // dropped. Re-apply the query until it takes rather than racing the bundle.
  const search = page.getByRole("searchbox", { name: "Search visualisations" });
  await expect.poll(async () => {
    await search.fill("language model");
    return page.locator('a[href^="/visualisations/"]').count();
  }).toBe(2);

  await expect(page.locator('a[href="/visualisations/attention"]')).toBeVisible();
  await expect(page.locator('a[href="/visualisations/token-sampling"]')).toBeVisible();
  await expect(page).toHaveURL(/q=language(?:\+|%20)model/);
});

test("follows an authored question through the concept constellation", async ({ page }) => {
  await page.goto("/concepts?focus=attention");

  await expect(page.getByRole("heading", { level: 2, name: "Self-attention weights" })).toBeVisible();
  await page.getByRole("button", { name: /How is an attention weight different from a token probability/i }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Token sampling" })).toBeVisible();
  await expect(page).toHaveURL(/focus=token-sampling/);
  await expect(page.getByRole("link", { name: /Open visualisation/i })).toHaveAttribute("href", "/visualisations/token-sampling");
});

test("operates the Release 4 SVG exhibits", async ({ page }) => {
  await page.goto("/visualisations/regression-boundary");
  await expect(page.getByRole("img", { name: /Linear fit with slope/ })).toBeVisible();
  await page.getByRole("button", { name: "logistic" }).click();
  await expect(page.getByRole("img", { name: /Logistic boundary/ })).toBeVisible();

  await page.goto("/visualisations/decision-tree");
  await expect(page.getByRole("img", { name: /Decision tree with depth/ })).toBeVisible();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await expect(page.getByRole("img", { name: /depth 3, 5 leaves/ })).toBeVisible();
});

test("operates the Particle Swarm vector workbench", async ({ page }) => {
  await page.goto("/visualisations/particle-swarm?step=1");

  const field = page.getByTestId("particle-swarm-field");
  await expect(field).toBeVisible();
  await expect(field.getByLabel(/Head-to-tail force addition/)).toBeVisible();
  await page.getByRole("button", { name: "Show same-origin vector comparison" }).click();
  await expect(field.getByLabel(/Same-origin force comparison/)).toBeVisible();
});
