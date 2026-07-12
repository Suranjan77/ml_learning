import { expect, test } from "@playwright/test";

test("operates an SVG exhibit", async ({ page }) => {
  await page.goto("/visualisations/attention");

  await expect(page.getByRole("img", { name: /attention connections/i })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
});

test("opens a WebGL exhibit with an accessible scene", async ({ page }) => {
  await page.goto("/visualisations/gradient-descent");

  await expect(page.locator('[data-testid="visualisation-workspace"]')).toBeVisible();
  await expect(page.locator('[role="img"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
});
