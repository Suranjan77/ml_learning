import { LearningModule } from "./learningModuleTypes";

export const classicalSynthesis: LearningModule = {
  id: "classical-synthesis",
  title: "Synthesis: Classical ML Architecture Choice",
  category: "Machine Learning Concepts",
  prerequisites: ["gradient-boosting", "support-vector-machines", "clustering"],
  learningObjectives: [
    'Synthesize and compare the performance profiles of classical ML algorithms (Linear Models, Trees, SVMs).',
    'Select appropriate algorithms based on data constraints (size, dimensionality, noise).',
    'Analyze trade-offs between model interpretability, inference speed, and predictive power.'
  ],
  misconceptions: [
    {
      claim: 'Gradient Boosting is always better than Linear Regression.',
      correction: 'While Gradient Boosting generally achieves higher accuracy on tabular data, it is prone to overfitting on very small datasets, is slower to train/infer, and is much harder to interpret than Linear Regression.'
    },
    {
      claim: 'SVMs are the best choice for text classification.',
      correction: 'While SVMs with linear kernels were historically the gold standard for text, they scale poorly ($O(N^2)$ to $O(N^3)$) with large datasets. Logistic Regression or Naive Bayes are often preferred for massive sparse datasets.'
    }
  ],
  references: [
    {
      title: 'A Few Useful Things to Know about Machine Learning',
      authors: 'Pedro Domingos',
      url: 'https://homes.cs.washington.edu/~pedrod/papers/cacm12.pdf',
      type: 'paper'
    },
    {
      title: 'Do we Need Hundreds of Classifiers to Solve Real World Classification Problems?',
      authors: 'Fernández-Delgado et al.',
      url: 'https://jmlr.org/papers/volume15/delgado14a/delgado14a.pdf',
      type: 'paper'
    }
  ],
  failureModes: [
    {
      name: 'Over-engineering',
      description: 'Defaulting to complex ensembles (like XGBoost or Random Forests) when a simple linear model would suffice, leading to unnecessary technical debt and inference costs.',
      mitigation: 'Always establish a strong baseline using simple models (Logistic/Linear Regression or a single Decision Tree) before trying more complex algorithms.'
    }
  ],

  shortDescription: "A milestone case study synthesizing and comparing classical Machine Learning algorithms (Linear Models, SVMs, Trees) under various constraints.",
  fullDescription: `
This milestone module does not introduce new theoretical algorithms. Instead, it focuses on the **System Design** and **Architectural Choice** required when deploying classical ML.

In real-world applied machine learning, the hardest part is rarely training the model—it's deciding *which* model to train given strict physical, financial, and temporal constraints. Here, we synthesize knowledge from Linear Regression, Logistic Regression, Decision Trees, Ensembles, SVMs, and Dimensionality Reduction.
  `,
  intuition: `
### The No Free Lunch Theorem in Practice

Every classical ML model makes a fundamental trade-off:
*   **Linear Models** are fast to train, fast to infer, and highly interpretable, but have high bias (they assume linear boundaries).
*   **Decision Trees** have low bias and capture non-linearities, but have high variance (they memorize noise).
*   **Ensembles (Random Forests, Gradient Boosting)** fix the variance of trees but sacrifice interpretability and increase memory footprint.
*   **SVMs** can perfectly separate complex boundaries using kernels, but their training scales terribly ($O(N^3)$) with dataset size.

When designing a system, you must balance **Bias vs Variance**, **Training Time vs Inference Time**, and **Memory vs Accuracy**.
  `,
  mathematics: `
### Mathematical Constraints of Classical Models

1.  **Complexity of SVMs:** A kernel SVM requires storing the support vectors. If there are $M$ support vectors in $d$ dimensions, inference requires $O(M \\cdot d)$ operations, which can be prohibitively slow for real-time systems compared to a linear model's $O(d)$.
2.  **Memory of Random Forests:** A Random Forest with $T$ trees, each with maximum depth $D$, has $O(T \\cdot 2^D)$ nodes. For large depth and many trees, this easily exceeds MBs of RAM, making it unsuitable for tiny edge devices.
3.  **Dimensionality Curse:** As dimensions $d$ grow, distance-based metrics (like K-Means and KNN) lose meaning because the ratio of the nearest to farthest point approaches 1. PCA $O(d^3)$ is often required as a prerequisite step.
  `,
  pros: ['Forces synthesis of diverse classical methods', 'Highlights edge cases that test deep understanding'],
  cons: ['Higher cognitive load than typical modules', 'May frustrate beginners if attempted too early'],
  hasVisualization: false,
  difficulty: 3,
  estimatedMinutes: 20,
  tracks: ['practitioner', 'modern-ai'],
  
  caseStudies: [
    {
      title: "Credit Card Fraud Detection on Edge Devices",
      scenario: "You are deploying a fraud detection model directly onto the credit card terminal (edge device) with only 500KB of RAM available. Inference must happen in < 5 milliseconds. The data is highly non-linear.",
      approach: "While a Random Forest or Kernel SVM would handle the non-linear boundaries well, they violate the memory and latency constraints. The solution is to use **Logistic Regression** (requiring only $O(d)$ memory), but to manually engineer non-linear features (e.g., polynomial features) prior to deployment.",
      outcome: "The model achieved 92% of the Random Forest's accuracy but fit within 15KB of RAM and executed in 0.1ms."
    }
  ],


  shortAnswerQuestions: [
    {
      question: "You are tasked with building a housing price predictor. You have 5,000 samples. Interpretability is legally required. You suspect the relationship between square footage and price is linear, but the relationship between zip code and price is highly irregular. Design an architecture that satisfies all constraints.",
      expectedAnswerRubric: `
**Self-Grading Rubric:**
1.  **Rejection of Black Boxes:** Did you explicitly reject Random Forests, Gradient Boosting, or SVMs due to the strict legal requirement for interpretability?
2.  **Handling Linear Features:** Did you propose Linear/Ridge Regression for the continuous features like square footage?
3.  **Handling Irregular Features:** Did you suggest a hybrid approach? (e.g. Target Encoding the zip codes, or using a very shallow Decision Tree, or fitting a linear model where Zip Code is one-hot encoded).
4.  **Overall Synthesis:** The ideal answer is a Generalized Additive Model (GAM) or a Linear Regression with explicitly engineered categorical interactions, guaranteeing full transparency.
      `
    }
  ]
};
