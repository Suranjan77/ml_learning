import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { firefox } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDirectory = resolve("docs/visual-baselines/overfitting");
const states = [
  ["01-underfit.png", ""],
  ["02-generalising-fit.png", "?step=1"],
  ["03-memorisation-contrast.png", "?step=2"],
  ["04-hidden-validation.png", "?step=2&validation=off"],
  ["05-resampled-contrast.png", "?step=2&seed=2"],
];

await mkdir(outputDirectory, { recursive: true });

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

try {
  for (const [filename, query] of states) {
    await page.goto(`${baseUrl}/visualisations/overfitting${query}`);
    await page.getByTestId("overfitting-stage").waitFor({ state: "visible" });
    await page.screenshot({ animations: "disabled", path: resolve(outputDirectory, filename) });
    console.log(filename);
  }
} finally {
  await browser.close();
}
