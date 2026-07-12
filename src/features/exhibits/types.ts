export type ExhibitDifficulty = "Approachable" | "Intermediate" | "Technical";
export type ExhibitRenderer = "SVG" | "Canvas" | "WebGL";

export interface ExhibitSceneProps {
  step: number;
  resetKey: number;
}

export interface ExhibitStep {
  title: string;
  instruction: string;
  observation: string;
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
  steps: readonly ExhibitStep[];
  challenges: readonly string[];
}
