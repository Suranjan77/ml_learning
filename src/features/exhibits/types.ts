export type ExhibitDifficulty = "Approachable" | "Intermediate" | "Technical";
export type ExhibitRenderer = "SVG" | "Canvas" | "WebGL";

export interface ExhibitSceneProps {
  step: number;
  resetKey: number;
  /** True while the shell is directing the guided, continuous walkthrough. */
  playing?: boolean;
}

export interface ExhibitStep {
  title: string;
  instruction: string;
  observation: string;
}

export interface ExhibitReference {
  label: string;
  /** Optional stable URL (e.g. an arXiv abstract). Omit for book citations. */
  href?: string;
}

export interface ExhibitDefinition {
  slug: string;
  title: string;
  question: string;
  summary: string;
  insight: string;
  topic: string;
  difficulty: ExhibitDifficulty;
  duration: number;
  renderer: ExhibitRenderer;
  /** Discovery keywords: concepts, synonyms, and related vocabulary. */
  tags: readonly string[];
  /** Slugs of conceptually related exhibits. Not a prescribed next step. */
  related: readonly string[];
  /** What is simplified, hand-authored, or idealised in this exhibit. */
  assumptions: readonly string[];
  /** Sources for the idea shown. Books cite in text; papers may link out. */
  references: readonly ExhibitReference[];
  steps: readonly ExhibitStep[];
  challenges: readonly string[];
}

/** Lightweight metadata for browsing, search, and cards. */
export interface ExhibitSummary {
  slug: string;
  title: string;
  question: string;
  summary: string;
  topic: string;
  difficulty: ExhibitDifficulty;
  duration: number;
  renderer: ExhibitRenderer;
  tags: readonly string[];
}
