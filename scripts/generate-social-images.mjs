import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { renderSocialSvg, socialCards } from "./social-image-layout.mjs";

const output = path.join(process.cwd(), "public", "social");
await mkdir(output, { recursive: true });

await Promise.all(socialCards.map((card) =>
  sharp(Buffer.from(renderSocialSvg(card))).png().toFile(path.join(output, `${card.name}.png`)),
));
