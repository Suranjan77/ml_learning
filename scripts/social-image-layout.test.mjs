import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { exhibits } from "../src/features/exhibits/registry.ts";
import { motifFor, renderSocialSvg, socialCards } from "./social-image-layout.mjs";

describe("social image layout", () => {
  it("defines one route-specific motif for every public social card", () => {
    expect(socialCards).toHaveLength(16);
    expect(new Set(socialCards.map((card) => card.name)).size).toBe(socialCards.length);

    for (const card of socialCards) {
      expect(motifFor(card.name)).toContain(`data-motif="${card.name}"`);
      expect(renderSocialSvg(card)).toContain("INTERACTIVE EXHIBIT");
    }
  });

  it("rejects routes without an authored visual motif", () => {
    expect(() => motifFor("generic-fallback")).toThrow("No social motif");
  });

  it("keeps exhibit questions and topics aligned with the public registry", () => {
    for (const exhibit of exhibits) {
      expect(socialCards.find((card) => card.name === exhibit.slug)).toMatchObject({
        question: exhibit.question,
        topic: exhibit.topic,
      });
    }
  });

  it("commits distinct 1200 by 630 rasters for every route", async () => {
    const hashes = [];
    for (const card of socialCards) {
      const image = await readFile(resolve("public", "social", `${card.name}.png`));
      const metadata = await sharp(image).metadata();
      expect([metadata.width, metadata.height]).toEqual([1200, 630]);
      hashes.push(createHash("sha256").update(image).digest("hex"));
    }
    expect(new Set(hashes).size).toBe(socialCards.length);
  });
});
