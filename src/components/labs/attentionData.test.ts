import { describe, it, expect } from "vitest";
import { attentionSentences } from "./attentionData";

const TOLERANCE = 1e-6;

describe("attentionSentences", () => {
  it("ships exactly 4 preset sentences", () => {
    expect(attentionSentences).toHaveLength(4);
  });

  for (const sentence of attentionSentences) {
    describe(`sentence "${sentence.id}"`, () => {
      it("has exactly 2 heads", () => {
        expect(sentence.heads).toHaveLength(2);
      });

      for (const head of sentence.heads) {
        describe(`head "${head.name}"`, () => {
          it("is a square matrix matching tokens.length", () => {
            expect(head.weights).toHaveLength(sentence.tokens.length);
            for (const row of head.weights) {
              expect(row).toHaveLength(sentence.tokens.length);
            }
          });

          it("has every row summing to 1 within tolerance", () => {
            for (const row of head.weights) {
              const sum = row.reduce((total, value) => total + value, 0);
              expect(Math.abs(sum - 1)).toBeLessThanOrEqual(TOLERANCE);
            }
          });

          it("has every weight in [0, 1]", () => {
            for (const row of head.weights) {
              for (const value of row) {
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(1);
              }
            }
          });
        });
      }
    });
  }

  it('in "coref-tired", "it" attends most to "animal" (Coreference head)', () => {
    const sentence = attentionSentences.find((s) => s.id === "coref-tired");
    expect(sentence).toBeDefined();
    const itIndex = sentence!.tokens.indexOf("it");
    const animalIndex = sentence!.tokens.indexOf("animal");
    const head = sentence!.heads.find((h) => h.name === "Coreference");
    expect(head).toBeDefined();
    const row = head!.weights[itIndex];
    const maxIndex = row.indexOf(Math.max(...row));
    expect(maxIndex).toBe(animalIndex);
  });

  it('in "coref-wide", "it" attends most to "street" (Coreference head)', () => {
    const sentence = attentionSentences.find((s) => s.id === "coref-wide");
    expect(sentence).toBeDefined();
    const itIndex = sentence!.tokens.indexOf("it");
    const streetIndex = sentence!.tokens.indexOf("street");
    const head = sentence!.heads.find((h) => h.name === "Coreference");
    expect(head).toBeDefined();
    const row = head!.weights[itIndex];
    const maxIndex = row.indexOf(Math.max(...row));
    expect(maxIndex).toBe(streetIndex);
  });
});
