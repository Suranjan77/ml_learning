"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ExhibitSceneProps } from "./types";

type ExhibitScene = ComponentType<ExhibitSceneProps>;

function SceneLoading() {
  return (
    <div
      className="flex h-full items-center justify-center border border-outline bg-surface font-mono text-[10px] uppercase tracking-label text-on-surface-variant"
      role="status"
    >
      Loading visualisation
    </div>
  );
}

const scenes: Readonly<Record<string, ExhibitScene>> = {
  "gradient-descent": dynamic<ExhibitSceneProps>(() => import("./gradient-descent/GradientDescentScene"), { loading: SceneLoading }),
  overfitting: dynamic<ExhibitSceneProps>(() => import("./overfitting/OverfittingScene"), { loading: SceneLoading }),
  "k-means": dynamic<ExhibitSceneProps>(() => import("./k-means/KMeansScene"), { loading: SceneLoading }),
  "kernel-trick": dynamic<ExhibitSceneProps>(() => import("./kernel-trick/KernelTrickScene"), { loading: SceneLoading }),
  attention: dynamic<ExhibitSceneProps>(() => import("./attention/AttentionScene"), { loading: SceneLoading }),
  "token-sampling": dynamic<ExhibitSceneProps>(() => import("./token-sampling/TokenSamplingScene"), { loading: SceneLoading }),
  "cnn-feature-maps": dynamic<ExhibitSceneProps>(() => import("./cnn/CnnScene"), { loading: SceneLoading }),
  "particle-swarm": dynamic<ExhibitSceneProps>(() => import("./particle-swarm/ParticleSwarmScene"), { loading: SceneLoading }),
  "genetic-algorithm": dynamic<ExhibitSceneProps>(() => import("./genetic-algorithm/GeneticAlgorithmScene"), { loading: SceneLoading }),
  pca: dynamic<ExhibitSceneProps>(() => import("./pca/PcaScene"), { loading: SceneLoading }),
  backpropagation: dynamic<ExhibitSceneProps>(() => import("./backprop/BackpropScene"), { loading: SceneLoading }),
  "regression-boundary": dynamic<ExhibitSceneProps>(() => import("./regression/RegressionScene"), { loading: SceneLoading }),
  "decision-tree": dynamic<ExhibitSceneProps>(() => import("./decision-tree/DecisionTreeScene"), { loading: SceneLoading }),
  "classification-threshold": dynamic<ExhibitSceneProps>(() => import("./classification-threshold/ClassificationThresholdScene"), { loading: SceneLoading }),
  "bayesian-updating": dynamic<ExhibitSceneProps>(() => import("./bayesian-updating/BayesianUpdatingScene"), { loading: SceneLoading }),
  "bagging-and-boosting": dynamic<ExhibitSceneProps>(() => import("./ensembles/EnsemblesScene"), { loading: SceneLoading }),
};

export function ExhibitScene({ slug, ...props }: ExhibitSceneProps & { slug: string }) {
  const Scene = scenes[slug];

  if (!Scene) return null;
  return <Scene {...props} />;
}
