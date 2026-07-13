import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { firefox } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDirectory = resolve("docs/visual-baselines/gradient-descent");
const states = [
  ["01-local-step.png", "?step=1"],
  ["02-stable-convergence.png", "?step=2&lr=0.4"],
  ["03-ravine-oscillation.png", "?step=2"],
  ["04-divergence.png", "?step=2&lr=1.06"],
  ["05-different-basins.png", "?step=3&x=0.4&y=0.4&refX=-3.4&refY=1.9&refLr=0.24"],
];

await mkdir(outputDirectory, { recursive: true });

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

try {
  for (const [filename, query] of states) {
    await page.goto(`${baseUrl}/visualisations/gradient-descent${query}`);
    const canvas = page.getByRole("img", { name: "Three-dimensional loss landscape" }).locator("canvas");
    await canvas.waitFor({ state: "visible" });
    await page.waitForTimeout(300);

    const uniqueColours = await canvas.evaluate(async (element) => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const gl = element.getContext("webgl2") ?? element.getContext("webgl");
      if (!gl) return 0;
      const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const colours = new Set();
      const stride = Math.max(1, Math.floor(pixels.length / 4 / 500));
      for (let pixel = 0; pixel < pixels.length / 4; pixel += stride) {
        const index = pixel * 4;
        colours.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]},${pixels[index + 3]}`);
      }
      return colours.size;
    });

    if (uniqueColours < 2) throw new Error(`${filename}: WebGL frame is blank or unavailable`);
    await page.screenshot({ animations: "disabled", path: resolve(outputDirectory, filename) });
    console.log(`${filename}: ${uniqueColours} sampled colours`);
  }
} finally {
  await browser.close();
}
