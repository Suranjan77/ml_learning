import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { firefox } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outputDirectory = resolve("docs/visual-baselines/kernel-trick");
const states = [
  ["01-input-space.png", "?step=0"],
  ["02-explicit-map.png", "?step=1"],
  ["03-flat-separator.png", "?step=2"],
  ["04-circular-boundary.png", "?step=3"],
];

await mkdir(outputDirectory, { recursive: true });

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

try {
  for (const [filename, query] of states) {
    await page.goto(`${baseUrl}/visualisations/kernel-trick${query}`);
    const canvas = page.getByRole("img", { name: "Radial feature-space transformation" }).locator("canvas");
    await canvas.waitFor({ state: "visible" });
    await page.waitForTimeout(300);

    const uniqueColours = await canvas.evaluate(async (element) => {
      await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
      const gl = element.getContext("webgl2") ?? element.getContext("webgl");
      if (!gl) return 0;
      const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const colours = new Set();
      const xStep = Math.max(1, Math.floor(gl.drawingBufferWidth / 64));
      const yStep = Math.max(1, Math.floor(gl.drawingBufferHeight / 36));
      for (let y = 0; y < gl.drawingBufferHeight; y += yStep) {
        for (let x = 0; x < gl.drawingBufferWidth; x += xStep) {
          const index = (y * gl.drawingBufferWidth + x) * 4;
          colours.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]},${pixels[index + 3]}`);
        }
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
