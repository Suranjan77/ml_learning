import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildScaffoldFiles, normalizeOptions, pascalCase, scaffoldExhibit, validateOptions } from "./scaffold-exhibit.mjs";

describe("exhibit scaffold", () => {
  it("normalises names and creates the five expected files", () => {
    const options = normalizeOptions({ slug: "bias-variance" });
    validateOptions(options);

    expect(pascalCase(options.slug)).toBe("BiasVariance");
    expect(options.title).toBe("Bias variance");
    expect(buildScaffoldFiles(options).size).toBe(5);
  });

  it("rejects slugs and renderers that cannot be registered safely", () => {
    expect(() => validateOptions(normalizeOptions({ slug: "Bad Slug" }))).toThrow(/kebab-case/);
    expect(() => validateOptions(normalizeOptions({ slug: "valid", renderer: "HTML" }))).toThrow(/renderer/);
  });

  it("writes a deterministic model and refuses to overwrite it", async () => {
    const root = await mkdtemp(join(tmpdir(), "mlv-scaffold-"));
    await scaffoldExhibit({ slug: "sample-exhibit", title: "Sample exhibit" }, root);

    const model = await readFile(join(root, "src/features/exhibits/sample-exhibit/model.ts"), "utf8");
    expect(model).toContain("export function stateForStep");
    await expect(scaffoldExhibit({ slug: "sample-exhibit" }, root)).rejects.toThrow(/Refusing to overwrite/);
  });
});
