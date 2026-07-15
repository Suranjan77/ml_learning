import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { firefox } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDirectory = resolve("docs/visual-baselines/particle-swarm");
const states = [
  ["01-scattered-search.png", "?step=0"],
  ["02-one-move-dissected.png", "?step=1"],
  ["03-new-global-discovery.png", "?step=2"],
  ["04-premature-collapse.png", "?step=3"],
  ["05-sustained-exploration.png", "?step=4"],
];

await mkdir(outputDirectory, { recursive: true });

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await context.newPage();

try {
  for (const [filename, query] of states) {
    await page.goto(`${baseUrl}/visualisations/particle-swarm${query}`);
    await page.getByTestId("particle-swarm-field").waitFor({ state: "visible" });
    await page.screenshot({ animations: "disabled", path: resolve(outputDirectory, filename) });
    console.log(filename);
  }
} finally {
  await browser.close();
}
