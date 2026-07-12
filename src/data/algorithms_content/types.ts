export type AlgorithmCategory =
  | "Linear Regression"
  | "Logistic Regression"
  | "K-Nearest Neighbors"
  | "Decision Trees"
  | "Clustering"
  | "Support Vector Machines"
  | "Ensemble Learning"
  | "Dimensionality Reduction"
  | "Markov Chain Monte Carlo"
  | "Neural Networks / Deep Learning"
  | "Convolutional Neural Networks"
  | "Computer Vision"
  | "Natural Language Processing"
  | "Autoencoders"
  | "Transformers"
  | "Large Language Models"
  | "Reinforcement Learning"
  | "Machine Learning Concepts"
  | "Generative Models"
  | "Regularization"
  | "Naive Bayes"
  | "Gaussian Mixtures and EM"
  | "Backpropagation"
  | "Sequence Models"
  | "Embeddings and Tokenization"
  | "Retrieval-Augmented Generation"
  | "Fine-Tuning and Preference Optimization"
  | "LLM Evaluation and Safety"
  | "AI Inference Systems"
  | "AI Agents and Tool Use";

export interface Algorithm {
  id: string;
  title: string;
  category: AlgorithmCategory;
  shortDescription: string;
  fullDescription: string;
  intuition: string;
  mathematics: string;
  pros: string[];
  cons: string[];
  codeSnippet?: string;
  hasVisualization?: boolean;
}

export * from './learningModuleTypes';
