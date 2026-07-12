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
];

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

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
    await expect(page.getByText(`${routes.length} visualisations`)).toBeVisible();
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
    await expect(page.getByText("Step 2 of 3")).toBeVisible({ timeout: 5_000 });

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

    const dialog = page.getByRole("dialog", { name: "Follow the Attention" });
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
