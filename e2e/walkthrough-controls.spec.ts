import { expect, test } from "@playwright/test";
import { exhibits } from "../src/features/exhibits/registry";

test.describe("guided walkthrough controls", () => {
  for (const exhibit of exhibits) {
    test(`${exhibit.slug} supports every manual and automatic step`, async ({ page }) => {
      const runtimeErrors: string[] = [];
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") runtimeErrors.push(message.text());
      });

      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/visualisations/${exhibit.slug}`);

      const workspace = page.getByTestId("visualisation-workspace");
      const stepTitle = page.getByTestId("guided-step-title");
      await expect(workspace).toHaveAttribute("data-guided-step", "0");
      await expect(stepTitle).toHaveText(exhibit.steps[0].title);

      for (let index = 1; index < exhibit.steps.length; index += 1) {
        const next = page.getByRole("button", { name: "Next", exact: true });
        await expect(next).toBeEnabled();
        await next.click();
        await expect(workspace).toHaveAttribute("data-guided-step", String(index));
        await expect(stepTitle).toHaveText(exhibit.steps[index].title);
      }

      await expect(page.getByRole("button", { name: "Guided walkthrough complete" })).toBeDisabled();
      await page.getByRole("button", { name: "Reset visualisation" }).click();
      await expect(workspace).toHaveAttribute("data-guided-step", "0");

      await page.getByRole("button", { name: "Auto-play guided steps" }).click();
      await expect(workspace).toHaveAttribute("data-guided-step", "1");
      await expect(stepTitle).toHaveText(exhibit.steps[1].title);

      await expect(workspace).toHaveAttribute(
        "data-guided-step",
        String(exhibit.steps.length - 1),
        { timeout: Math.max(4_000, (exhibit.steps.length - 2) * 2_700) },
      );
      await expect(page.getByRole("button", { name: "Replay guided walkthrough" })).toBeVisible();

      await page.getByRole("button", { name: "Replay guided walkthrough" }).click();
      await expect(workspace).toHaveAttribute("data-guided-step", "0");
      await expect(page.getByRole("button", { name: "Pause guided walkthrough" })).toBeVisible();
      await page.getByRole("button", { name: "Pause guided walkthrough" }).click();

      expect(runtimeErrors).toEqual([]);
    });
  }
});
