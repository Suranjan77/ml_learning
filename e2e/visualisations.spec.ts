import { expect, test } from "@playwright/test";

const routes = [
  "/visualisations/gradient-descent",
  "/visualisations/attention",
  "/visualisations/kernel-trick",
  "/visualisations/overfitting",
  "/visualisations/k-means",
  "/visualisations/token-sampling",
  "/visualisations/cnn-feature-maps",
  "/visualisations/particle-swarm",
  "/visualisations/genetic-algorithm",
  "/visualisations/pca",
  "/visualisations/backpropagation",
  "/visualisations/regression-boundary",
  "/visualisations/decision-tree",
];

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

test.describe("homepage proof", () => {
  for (const viewport of viewports) {
    test(`fits and reveals the collection at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");

      await expect(page.getByRole("heading", { level: 1, name: "Machine learning visualisations" })).toBeVisible();
      await expect(page.getByRole("slider", { name: "Homepage learning rate" })).toBeVisible();

      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        nextSectionTop: document.querySelectorAll("main section")[1]?.getBoundingClientRect().top,
      }));
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.nextSectionTop).toBeLessThan(viewport.height);
    });
  }

  test("turns an oscillating path into a converging path", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const proof = page.getByRole("img", { name: /Top-down narrow loss valley/ });
    await expect(proof).toHaveAttribute("aria-label", /current path at 0\.90 is oscillating/i);

    await page.getByRole("slider", { name: "Homepage learning rate" }).fill("0.4");
    await expect(proof).toHaveAttribute("aria-label", /current path at 0\.40 is converging/i);
  });
});

test.describe("visualisation workspace", () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      for (const route of routes) {
        test(`${route} fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
          await page.goto(route);

          const workspace = page.locator('[data-testid="visualisation-workspace"]');
          await expect(workspace).toBeVisible();

          await expect(
            workspace
              .locator('[role="img"], [role="group"]')
              .first(),
          ).toBeVisible();

          await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();

          const { documentScrollHeight, bodyScrollHeight } = await page.evaluate(() => ({
            documentScrollHeight: document.documentElement.scrollHeight,
            bodyScrollHeight: document.body.scrollHeight,
          }));
          expect(documentScrollHeight).toBeLessThanOrEqual(viewport.height);
          expect(bodyScrollHeight).toBeLessThanOrEqual(viewport.height);
        });
      }
    });
  }

  test("lists every visualisation on the library index", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations");

    await expect(page.locator('a[href^="/visualisations/"]')).toHaveCount(routes.length);
    await expect(page.getByText(`${routes.length} of ${routes.length} visualisations`)).toBeVisible();
  });

  test("searches the library and reflects the query in the URL", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations");

    await page.getByRole("searchbox", { name: "Search visualisations" }).fill("svm");

    await expect(page.locator('a[href^="/visualisations/"]')).toHaveCount(1);
    await expect(page.locator('a[href="/visualisations/kernel-trick"]')).toBeVisible();
    await expect(page).toHaveURL(/\?q=svm/);
  });

  test("restores filter state from the URL and clears it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations?topic=Language+models");

    const cards = page.locator('a[href^="/visualisations/"]');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('a[href="/visualisations/attention"]')).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(cards).toHaveCount(routes.length);
    await expect(page).toHaveURL(/\/visualisations$/);
  });

  test("shares and restores meaningful scene state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/overfitting");

    const degree = page.getByRole("slider", { name: "Degree" });
    const stage = page.getByRole("group", { name: /Model fit and error curves/ });
    await stage.focus();
    await stage.press("ArrowRight");
    const sharedDegree = await degree.inputValue();
    expect(Number(sharedDegree)).toBeGreaterThan(1);
    await expect.poll(() => new URL(page.url()).searchParams.get("degree")).toBe(sharedDegree);

    await page.reload();
    await expect(degree).toHaveValue(sharedDegree);

    await page.getByRole("button", { name: "Copy current view" }).click();
    await expect(page.getByRole("button", { name: "Current view copied" })).toBeVisible();
  });

  test("restores a computed Attention state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/attention?ending=wide&head=previous-token&query=3&refEnding=tired");

    await expect(page.getByRole("button", { name: "Use sentence ending in wide" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Show Previous token attention pattern" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Use street as the query token" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Clear kept tired" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Attention connections from street/ })).toBeVisible();
  });

  test("shares and restores a Gradient Descent start comparison", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/gradient-descent?step=3");
    await expect(page.getByText("Step 4 of 4")).toBeVisible();

    const landscape = page.getByTestId("loss-landscape");
    await landscape.focus();
    await landscape.press("ArrowRight");

    await expect.poll(() => new URL(page.url()).searchParams.get("x")).toBe("0.56");
    expect(new URL(page.url()).searchParams.get("refX")).toBe("-3.4");
    expect(new URL(page.url()).searchParams.get("refY")).toBe("1.9");
    expect(new URL(page.url()).searchParams.get("refLr")).toBe("0.24");

    await page.reload();
    await expect(landscape).toHaveAttribute("aria-label", /x 0\.56, y 0\.40/);
    await expect(page.getByRole("button", { name: "Clear kept path at 0.24" })).toBeVisible();
  });

  test("restores the five Gradient Descent signature states", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/visualisations/gradient-descent?step=1");
    await expect(page.getByText("Step 2 of 4")).toBeVisible();
    await expect(page.getByText("Update 1", { exact: true })).toBeVisible();

    await page.goto("/visualisations/gradient-descent?step=2&lr=0.4");
    await expect(page.getByRole("slider", { name: "Learning rate" })).toHaveValue("0.4");
    await expect(page.getByText(/Current 0\.40 converging: after 14 steps, loss is .* lower/i)).toBeVisible();

    await page.goto("/visualisations/gradient-descent?step=2");
    await expect(page.getByText(/Overshoot: crossed the valley/)).toBeVisible();
    await expect(page.getByText(/0\.90 · oscillating/i)).toBeVisible();

    await page.goto("/visualisations/gradient-descent?step=2&lr=1.06");
    await expect(page.getByText(/Current 1\.06 diverging: after 14 steps, loss is .* higher/i)).toBeVisible();
    await expect(page.getByText(/1\.06 · diverging/i)).toBeVisible();

    await page.goto("/visualisations/gradient-descent?step=3&x=0.4&y=0.4&refX=-3.4&refY=1.9&refLr=0.24");
    await expect(page.getByText(/Starts reach different basins/)).toBeVisible();
  });

  test("offers a clean, keyboard-accessible embed view", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/attention?embed=1&step=1");

    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Full view" })).toHaveAttribute("target", "_top");
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
  });

  test("publishes route-specific canonical and social metadata", async ({ page }) => {
    await page.goto("/visualisations/attention");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/visualisations\/attention$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/social\/attention\.png$/);
    const jsonLd = await page.locator('script[type="application\/ld\+json"]').textContent();
    expect(jsonLd).toContain("LearningResource");
  });

  test("offers related-idea links from the insight drawer", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/token-sampling");

    await page.getByRole("button", { name: "Open insight and challenges" }).click();

    await expect(page.getByText("What is simplified")).toBeVisible();
    await expect(page.getByText("References")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /The Curious Case of Neural Text Degeneration/ }),
    ).toHaveAttribute("href", "https://arxiv.org/abs/1904.09751");

    const related = page.getByRole("link", { name: /attention/i });
    await expect(related).toBeVisible();
    await related.click();
    await expect(page).toHaveURL(/\/visualisations\/attention/);
  });

  test("keeps step controls operable and keyboard focusable", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/attention");

    const next = page.getByRole("button", { name: "Next", exact: true });
    await expect(next).toBeEnabled();
    await next.focus();
    await expect(next).toBeFocused();
    await next.click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();

    const reset = page.getByRole("button", { name: "Reset visualisation" });
    await reset.focus();
    await expect(reset).toBeFocused();
    await reset.click();
    await expect(page.getByText("Step 1 of 3")).toBeVisible();
  });

  test("plays and pauses the guided walkthrough", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/attention");

    const play = page.getByRole("button", { name: "Play guided walkthrough" });
    await play.click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible({ timeout: 3_500 });

    const pause = page.getByRole("button", { name: "Pause guided walkthrough" });
    await pause.click();
    await page.waitForTimeout(3_500);
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
  });

  test("traps focus in the insight dialog and restores it after closing", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/attention");

    const trigger = page.getByRole("button", { name: "Open insight and challenges" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Self-attention weights" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close insight panel" })).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Return to visualisation" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("disables automatic playback when reduced motion is preferred", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/visualisations/attention");

    await expect(
      page.getByRole("button", {
        name: "Automatic walkthrough disabled by reduced-motion preference",
      }),
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
  });
});
