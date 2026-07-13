import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { firefox } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDirectory = resolve("docs/visual-baselines/attention");
const states = [
  ["01-tired-reference.png", ""],
  ["02-wide-reference.png", "?step=1"],
  ["03-previous-position.png", "?head=previous-token&query=6"],
  ["04-street-query.png", "?query=3"],
];

await mkdir(outputDirectory, { recursive: true });

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

try {
  for (const [filename, query] of states) {
    await page.goto(`${baseUrl}/visualisations/attention${query}`);
    await page.getByRole("img", { name: /Attention connections from/ }).waitFor({ state: "visible" });
    await page.screenshot({ animations: "disabled", path: resolve(outputDirectory, filename) });
    console.log(filename);
  }
} finally {
  await browser.close();
}
