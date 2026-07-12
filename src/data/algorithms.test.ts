import { describe, expect, it } from "vitest";
import {
  getAlgorithmBySlug,
  getAlgorithmIcon,
  getAlgorithmRoute,
} from "@/lib/algorithmPresentation";
import { algorithms } from "@/data/algorithms";

const requiredIds = [
  "applied-ml-workflow",
  "linear-regression",
  "logistic-regression",
  "regularization",
  "model-evaluation",
  "knn",
  "naive-bayes",
  "support-vector-machines",
  "decision-trees",
  "ensemble-learning",
  "gradient-boosting",
  "clustering",
  "gmm-em",
  "dimensionality-reduction",
  "mcmc",
  "neural-networks",
  "classical-synthesis",
  "backpropagation",
  "optimization-optimizers",
  "cnn",
  "cnn-architectures",
  "computer-vision",
  "object-detection",
  "image-segmentation",
  "embeddings-tokenization",
  "sequence-models",
  "nlp",
  "autoencoders",
  "generative-models",
  "transformers",
  "vision-transformers",
  "self-supervised-vision",
  "vision-language-models",
  "llms",
  "dl-synthesis",
  "fine-tuning",
  "rag",
  "ai-agents",
  "llm-evaluation-safety",
  "ai-inference",
  "reinforcement-learning",
  "llm-synthesis",
  "diffusion-models",
];

const textFields = [
  "title",
  "shortDescription",
  "fullDescription",
  "intuition",
  "mathematics",
  "codeSnippet",
] as const;

function wordsFor(content: string) {
  return content
    .toLowerCase()
    .replace(/[`$\\{}()[\],.;:!?+\-*/=<>_^|~]/g, " ")
    .split(/\s+/)
    .filter((word) => /^[a-z0-9]{4,}$/.test(word));
}

describe("algorithm catalogue", () => {
  it("contains every routed curriculum module exactly once", () => {
    expect(algorithms.map((algorithm) => algorithm.id)).toEqual(requiredIds);
    expect(new Set(algorithms.map((algorithm) => algorithm.id))).toHaveLength(
      algorithms.length,
    );
  });

  describe.each(algorithms)("$id", (algorithm) => {
    it("has a stable slug, route, and lookup entry", () => {
      expect(algorithm.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(getAlgorithmBySlug(algorithm.id)).toBe(algorithm);
      expect(getAlgorithmRoute(algorithm.id)).toBe(`/algorithms/${algorithm.id}`);
      expect(getAlgorithmIcon(algorithm.id)).toMatch(/^[a-z_]+$/);
    });

    it.each(textFields)("has substantial %s content", (field) => {
      const val = algorithm[field];
      if (val === undefined) return;
      const minimumLength =
        field === "title" ? 8 : field === "codeSnippet" ? 0 : 40;
      expect(val.trim().length).toBeGreaterThanOrEqual(minimumLength);
      expect(val).not.toMatch(/\b(TODO|TBD|FIXME|undefined|null)\b/i);
    });

    it("has balanced markdown math delimiters", () => {
      const combined = textFields.map((field) => algorithm[field] || "").join("\n");
      expect((combined.match(/\$\$/g) ?? []).length % 2).toBe(0);
      expect((combined.match(/(?<!\$)\$(?!\$)/g) ?? []).length % 2).toBe(0);
    });

    it("has useful pros and cons", () => {
      if (algorithm.pros) {
        expect(algorithm.pros.length).toBeGreaterThanOrEqual(2);
      }
      if (algorithm.cons) {
        expect(algorithm.cons.length).toBeGreaterThanOrEqual(2);
      }
      for (const item of [...(algorithm.pros || []), ...(algorithm.cons || [])]) {
        expect(item.length).toBeGreaterThan(20);
        expect(item).not.toMatch(/\b(TODO|TBD|FIXME)\b/i);
      }
    });

    const combinedContent = [
      algorithm.title,
      algorithm.category,
      algorithm.shortDescription,
      algorithm.fullDescription,
      algorithm.intuition || "",
      algorithm.mathematics || "",
      ...(algorithm.pros || []),
      ...(algorithm.cons || []),
      algorithm.codeSnippet || "",
    ].join("\n");

    const sentences = combinedContent
      .split(/(?<=[.!?])\s+|\n{2,}/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 12);

    it.each(sentences.map((sentence, index) => [index, sentence] as const))(
      "keeps sentence %i publishable",
      (_index, sentence) => {
        expect(sentence).not.toMatch(/\b(TODO|TBD|FIXME|lorem ipsum)\b/i);
        expect(sentence).not.toMatch(/https?:\/\/\s*$/);
        expect(sentence.length).toBeLessThan(900);
      },
    );

    const searchableTokens = wordsFor(combinedContent).slice(0, 160);

    it.each(searchableTokens.map((token, index) => [index, token] as const))(
      "keeps searchable token %i normalized",
      (_index, token) => {
        expect(token).toMatch(/^[a-z0-9]+$/);
        expect(token.length).toBeGreaterThanOrEqual(4);
      },
    );
  });
});
