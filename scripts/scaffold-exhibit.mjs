import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const RENDERERS = new Set(["SVG", "Canvas", "WebGL"]);

function usage() {
  return `Usage:
  npm run scaffold:exhibit -- --slug bias-variance --title "Bias and variance" \\
    --question "How do fitted models vary across samples?" [--topic "Generalisation"] [--renderer SVG]

Options:
  --slug       Required kebab-case route slug
  --title      Display title; defaults to the title-cased slug
  --question   Exhibit question; defaults to "What does <title> show?"
  --topic      Library topic; defaults to "Uncategorised"
  --renderer   SVG, Canvas, or WebGL; defaults to SVG
  --dry-run    Print the files without writing them
  --help       Show this message`;
}

export function pascalCase(slug) {
  return slug.split("-").map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join("");
}

export function titleFromSlug(slug) {
  const [first, ...rest] = slug.split("-");
  return [`${first[0].toUpperCase()}${first.slice(1)}`, ...rest].join(" ");
}

export function validateOptions(options) {
  if (!options.slug || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(options.slug)) {
    throw new Error("--slug must be kebab-case and start with a letter");
  }
  if (!RENDERERS.has(options.renderer)) {
    throw new Error(`--renderer must be one of: ${[...RENDERERS].join(", ")}`);
  }
}

export function buildScaffoldFiles({ slug, title, question, topic, renderer }) {
  const component = pascalCase(slug);
  const variable = `${component[0].toLowerCase()}${component.slice(1)}Exhibit`;
  const folder = `src/features/exhibits/${slug}`;

  return new Map([
    [`${folder}/model.ts`, `export interface ${component}State {
  value: number;
}

const STEP_VALUES = [0.2, 0.5, 0.8] as const;

export function stateForStep(step: number): ${component}State {
  const index = Math.max(0, Math.min(STEP_VALUES.length - 1, Math.floor(step)));
  return { value: STEP_VALUES[index] };
}
`],
    [`${folder}/model.test.ts`, `import { describe, expect, it } from "vitest";
import { stateForStep } from "./model";

describe("${slug} model", () => {
  it("returns deterministic bounded presets", () => {
    expect(stateForStep(1)).toEqual(stateForStep(1));
    expect(stateForStep(-1).value).toBe(0.2);
    expect(stateForStep(99).value).toBe(0.8);
  });
});
`],
    [`${folder}/exhibit.ts`, `import type { ExhibitDefinition } from "../types";

export const ${variable}: ExhibitDefinition = {
  slug: "${slug}",
  title: ${JSON.stringify(title)},
  question: ${JSON.stringify(question)},
  summary: "Replace this with one sentence describing the manipulation and visible result.",
  insight: "Replace this with the exhibit's central relationship.",
  topic: ${JSON.stringify(topic)},
  difficulty: "Approachable",
  duration: 4,
  renderer: "${renderer}",
  tags: ["replace", "these", "tags"],
  related: [],
  assumptions: ["State what is authored, simplified, precomputed, or omitted."],
  references: [{ label: "Add a primary reference before registration." }],
  steps: [
    { title: "Establish the state", instruction: "Name the first useful action.", observation: "State what the visitor should notice." },
    { title: "Change one input", instruction: "Change the variable that drives the argument.", observation: "Describe the computed consequence." },
    { title: "Find the limit", instruction: "Test where the simple intuition stops holding.", observation: "State the refined conclusion." },
  ],
  challenges: ["Add one question that requires direct manipulation."],
};
`],
    [`${folder}/${component}Scene.tsx`, `"use client";

import type { ExhibitSceneProps } from "../types";
import { stateForStep } from "./model";

export default function ${component}Scene({ step }: ExhibitSceneProps) {
  const state = stateForStep(step);
  const description = ${JSON.stringify(`${title}.`)} + " Current value " + state.value.toFixed(1) + ".";

  return (
    <section aria-label=${JSON.stringify(`${title} visualisation`)} className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div role="img" aria-label={description} className="flex min-h-0 items-center justify-center bg-surface p-6">
        <p className="font-mono text-sm text-on-surface">Replace this scaffold with the working ${renderer} scene.</p>
      </div>
      <div className="border-t border-outline bg-surface-container-low p-3">
        <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Value {state.value.toFixed(1)}</p>
      </div>
    </section>
  );
}
`],
    [`${folder}/${component}Scene.test.tsx`, `import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ${component}Scene from "./${component}Scene";

describe("${component}Scene", () => {
  it("exposes the deterministic guided state nonvisually", () => {
    render(<${component}Scene step={1} resetKey={0} />);
    expect(screen.getByRole("img", { name: /current value 0\\.5/i })).toBeInTheDocument();
  });
});
`],
  ]);
}

export function normalizeOptions(options) {
  const slug = options.slug;
  const title = options.title ?? (slug ? titleFromSlug(slug) : "");
  return {
    slug,
    title,
    question: options.question ?? `What does ${title} show?`,
    topic: options.topic ?? "Uncategorised",
    renderer: options.renderer ?? "SVG",
    dryRun: Boolean(options.dryRun),
  };
}

export async function scaffoldExhibit(rawOptions, repositoryRoot = DEFAULT_REPOSITORY_ROOT) {
  const options = normalizeOptions(rawOptions);
  validateOptions(options);
  const files = buildScaffoldFiles(options);
  const targetDirectory = resolve(repositoryRoot, "src", "features", "exhibits", options.slug);

  try {
    await access(targetDirectory);
    throw new Error(`Refusing to overwrite existing directory: ${relative(repositoryRoot, targetDirectory)}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  if (!options.dryRun) {
    await mkdir(targetDirectory, { recursive: true });
    await Promise.all([...files].map(async ([path, contents]) => {
      await writeFile(resolve(repositoryRoot, path), contents, { encoding: "utf8", flag: "wx" });
    }));
  }

  return { options, files };
}

function printResult({ options, files }) {
  console.log(`${options.dryRun ? "Would create" : "Created"} ${files.size} files for ${options.slug}:`);
  for (const path of files.keys()) console.log(`  ${path}`);
  console.log("\nBefore registration:");
  console.log("  1. Replace every scaffold placeholder with the finished visual argument.");
  console.log("  2. Add the exhibit import and definition to src/features/exhibits/registry.ts.");
  console.log("  3. Add its dynamic scene import to src/features/exhibits/sceneRegistry.tsx.");
  console.log("  4. Add its route and budget to scripts/check-static-budget.mjs.");
  console.log("  5. Add its social card to scripts/generate-social-images.mjs and regenerate assets.");
  console.log("  6. Add viewport and interaction coverage, then run the full validation suite.");
}

async function main() {
  const { values } = parseArgs({
    options: {
      slug: { type: "string" },
      title: { type: "string" },
      question: { type: "string" },
      topic: { type: "string" },
      renderer: { type: "string", default: "SVG" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(usage());
    return;
  }

  const result = await scaffoldExhibit({
    slug: values.slug,
    title: values.title,
    question: values.question,
    topic: values.topic,
    renderer: values.renderer,
    dryRun: values["dry-run"],
  });
  printResult(result);
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    console.error(`\n${usage()}`);
    process.exitCode = 1;
  });
}
