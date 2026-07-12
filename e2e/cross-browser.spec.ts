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

test("searches and filters the library", async ({ page }) => {
  await page.goto("/visualisations");
  await page.getByRole("searchbox", { name: "Search visualisations" }).fill("language model");

  await expect(page.locator('a[href="/visualisations/attention"]')).toBeVisible();
  await expect(page.locator('a[href="/visualisations/token-sampling"]')).toBeVisible();
  await expect(page).toHaveURL(/q=language(?:\+|%20)model/);
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
