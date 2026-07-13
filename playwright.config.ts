import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";
const localChrome = process.env.PLAYWRIGHT_USE_SYSTEM_CHROME === "1"
  ? { channel: "chrome" as const }
  : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...localChrome },
    },
    {
      name: "firefox-smoke",
      testMatch: "**/cross-browser.spec.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-smoke",
      testMatch: "**/cross-browser.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run serve:static",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
