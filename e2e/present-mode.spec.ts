import { expect, test } from "@playwright/test";

/** Smallest on-screen height of any rendered SVG label in the scene. */
async function labelHeights(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const heights: number[] = [];
    const scene = document.querySelector('[data-testid="visualisation-workspace"] section');
    for (const node of (scene ?? document).querySelectorAll("svg text")) {
      const text = (node.textContent ?? "").trim();
      const box = node.getBoundingClientRect();
      if (text && box.height > 0) heights.push(box.height);
    }
    heights.sort((a, b) => a - b);
    return { min: heights[0], median: heights[Math.floor(heights.length / 2)], count: heights.length };
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
});

test("enlarges scene labels for projection without changing the exhibit", async ({ page }) => {
  await page.goto("/visualisations/pca");
  const reading = await labelHeights(page);
  expect(reading.count).toBeGreaterThan(0);

  await page.getByTestId("present-toggle").click();
  await expect(page.locator('[data-testid="visualisation-workspace"]')).toHaveAttribute("data-present", "true");

  const presenting = await labelHeights(page);
  // The same labels, drawn larger — nothing gained or dropped from the scene.
  expect(presenting.count).toBe(reading.count);
  expect(presenting.median).toBeGreaterThan(reading.median * 1.4);
  // Back-row legibility starts around 24px on a 1080p projector.
  expect(presenting.median).toBeGreaterThanOrEqual(24);
});

test("keeps every scene label inside the frame when presenting", async ({ page }) => {
  await page.goto("/visualisations/pca?present=1");
  await expect(page.locator('[data-testid="visualisation-workspace"]')).toHaveAttribute("data-present", "true");

  const overflowing = await page.evaluate(() => {
    // The scene SVG is the largest on the page. Selecting `svg[viewBox]` would
    // match a 24px lucide icon in the chrome and pass without checking anything.
    const svg = [...document.querySelectorAll("svg")]
      .map((node) => {
        const box = node.getBoundingClientRect();
        return { node, area: box.width * box.height };
      })
      .sort((a, b) => b.area - a.area)[0]?.node;
    if (!svg) return ["no svg"];
    const frame = svg.getBoundingClientRect();
    const escaped: string[] = [];
    for (const node of svg.querySelectorAll("text")) {
      const box = node.getBoundingClientRect();
      if (!box.height) continue;
      if (box.bottom > frame.bottom + 1 || box.right > frame.right + 1 || box.top < frame.top - 1) {
        escaped.push((node.textContent ?? "").trim().slice(0, 40));
      }
    }
    return escaped;
  });

  expect(overflowing).toEqual([]);
});

test("travels in the URL so a projected link opens ready to present", async ({ page }) => {
  await page.goto("/visualisations/pca");
  await page.getByTestId("present-toggle").click();
  await expect(page).toHaveURL(/present=1/);

  // Stepping the walkthrough must not drop the mode mid-lecture.
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/present=1/);
  await expect(page.locator('[data-testid="visualisation-workspace"]')).toHaveAttribute("data-present", "true");

  await page.getByTestId("present-toggle").click();
  await expect(page).not.toHaveURL(/present=1/);
});

test("toggles without provoking a runtime or React error", async ({ page }) => {
  // The address-bar write must stay outside the setPresenting updater. Doing it
  // inside makes React update the Router mid-render, which the production build
  // shows as a thrown error rather than the development warning.
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

  await page.goto("/visualisations/backpropagation");
  await page.waitForLoadState("networkidle");

  await page.getByTestId("present-toggle").click();
  await page.keyboard.press("p");
  await page.keyboard.press("p");
  await page.getByTestId("present-toggle").click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.waitForTimeout(400);

  expect(problems).toEqual([]);
});

test("toggles from the keyboard without reaching for the control", async ({ page }) => {
  await page.goto("/visualisations/pca");
  const workspace = page.locator('[data-testid="visualisation-workspace"]');
  await expect(workspace).not.toHaveAttribute("data-present", "true");

  await page.keyboard.press("p");
  await expect(workspace).toHaveAttribute("data-present", "true");

  await page.keyboard.press("p");
  await expect(workspace).not.toHaveAttribute("data-present", "true");
});
