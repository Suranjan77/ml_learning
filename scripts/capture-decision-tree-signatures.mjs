import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { firefox } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDirectory = resolve("docs/visual-baselines/decision-tree");
const states = [
  ["01-root-cut.png", ""],
  ["02-branch-splits.png", "?step=1"],
  ["03-full-partition.png", "?step=2"],
  ["04-root-propagation.png", "?step=3"],
  ["05-reverse-root-move.png", "?step=3&threshold=3&refThreshold=4"],
];

await mkdir(outputDirectory, { recursive: true });

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

try {
  for (const [filename, query] of states) {
    await page.goto(`${baseUrl}/visualisations/decision-tree${query}`);
    await page.getByRole("img", { name: /Decision tree with depth/ }).waitFor({ state: "visible" });
    await page.screenshot({ animations: "disabled", path: resolve(outputDirectory, filename) });
    console.log(filename);
  }
} finally {
  await browser.close();
}
