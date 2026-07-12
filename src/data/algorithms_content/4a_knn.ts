import { LearningModule } from "./types";

export const knn: LearningModule = {
  id: "knn",
  title: "K-Nearest Neighbors",
  category: "K-Nearest Neighbors",
  prerequisites: ["applied-ml-workflow"],
  tracks: ["practitioner"],
  difficulty: 2,
  shortDescription: "A simple algorithm that makes predictions for a new data point by finding the closest, most similar historical examples.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the non-parametric nature of the K-Nearest Neighbors algorithm',
    'Compute distances between data points using Euclidean and Manhattan distance metrics',
    'Compare the behavior of the model for small versus large values of $K$ (overfitting vs underfitting)',
    'Describe why feature scaling is critical for distance-based algorithms',
  ],
  keyTerms: [
    { term: 'Non-parametric', definition: 'A class of model that does not make strong assumptions about the form of the underlying mapping function.' },
    { term: 'Euclidean Distance', definition: 'The straight-line distance between two points in a Euclidean space.' },
    { term: 'Curse of Dimensionality', definition: 'The phenomenon where distance metrics become less informative as the number of feature dimensions increases.' },
  ],
  misconceptions: [
    {
      claim: 'KNN actually trains a model during the `.fit()` step.',
      correction: 'In standard KNN, `.fit()` is a lazy step that just stores the training data in memory. All computation (finding neighbors and voting) happens during the prediction phase.'
    },
    {
      claim: 'You should always set $K$ as large as possible to get a smooth boundary.',
      correction: 'If $K$ is too large (approaching the dataset size $N$), the model will just predict the majority class of the entire dataset, leading to underfitting. If $K=1$, the model will overfit to individual noise points.'
    }
  ],
  references: [
    {
      title: "Classification and Regression Trees",
      authors: "Breiman, L., Friedman, J., Stone, C.J. and Olshen, R.A",
      url: "https://www.routledge.com",
      type: "textbook"
    },
    {
      title: "Machine Learning with Random Forests and Decision Trees",
      authors: "Scott, S",
      url: "https://example.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Unscaled Features Dominating',
      description: 'If one feature has values in range [0, 1,000,000] and another has range [0, 1], the first feature dominates the distance calculation entirely.',
      mitigation: 'Standardize or normalize features (e.g. using MinMaxScaler or StandardScaler) before running KNN.'
    }
  ],
  fullDescription: `
K-Nearest Neighbors (KNN) is one of the simplest and most intuitive algorithms in machine learning. It is a non-parametric method, meaning it does not assume any underlying mathematical shape for the data. Instead of training a model to find mathematical equations, KNN literally just memorizes the entire training dataset.

When you ask it to make a prediction for a new, unseen data point, it looks at the entire dataset, finds the $k$ data points that are geometrically closest (most similar) to the new point, and takes a vote. For classification, it returns the most common label among its neighbors; for regression, it returns the average value of its neighbors.

### Where is it used?
KNN is used in basic recommendation systems (finding users with similar movie tastes), anomaly detection (flagging transactions that are geometrically far from a user's normal spending clusters), and as a quick baseline algorithm before trying more complex models.
  `,
  intuition: `
Imagine you move to a new city and want to know if a specific neighborhood is safe. You don't need a complex mathematical formula; you just ask the 5 people who live closest to that neighborhood. If 4 out of 5 say it's safe, you assume it's safe. That's exactly how KNN works.
  `,
  mathematics: `
### 1. K-Nearest Neighbors Distance
KNN relies entirely on measuring the distance between a query data point $x$ and an existing database point $x'$. The most common distance metric is Euclidean distance:

$$ d(x, x') = \\sqrt{\\sum_{i=1}^{p} (x_i - x_i')^2} $$

Other metrics like Manhattan distance ($L_1$ norm) or Cosine similarity (for text/embeddings) are also frequently used:

**Manhattan Distance**:
$$ d_1(x, x') = \\sum_{i=1}^{p} |x_i - x_i'| $$
  `,
  pros: [
    "Extremely simple to understand and implement.",
    "No training phase whatsoever; adding new data is instant.",
    "Can easily handle complex, non-linear decision boundaries."
  ],
  cons: [
    "Extremely slow at prediction time on large datasets, because it must compute the distance to every single point.",
    "Requires keeping the entire dataset in memory.",
    "Sensitive to the scale of features; features with larger ranges will dominate the distance calculation."
  ],
  codeSnippet: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier

# Two-dimensional feature coordinates
X = np.array([[0, 0], [1, 1.5], [1.5, 1], [8, 8], [8.5, 7.5], [9, 9]])
# Binary Labels
y = np.array([0, 0, 0, 1, 1, 1])

# Initialize and fit KNN
knn = KNeighborsClassifier(n_neighbors=2)
knn.fit(X, y)
print(f"KNN Class for coordinate [2, 2]: {knn.predict([[2, 2]])[0]}")`,
  tldr: [
    'KNN is a **lazy**, **non-parametric** classifier: it stores the training set and defers all work to prediction time, where it finds the $k$ closest points and takes a majority vote (or an average for regression).',
    'The choice of $k$ is a **bias-variance dial**: small $k$ means low bias but high variance (jagged, noise-chasing boundaries), large $k$ means high bias but low variance (smooth, possibly underfit boundaries).',
    'Predictions hinge on a distance metric, usually **Euclidean** $d(x, x\') = \\sqrt{\\sum_i (x_i - x_i\')^2}$ or **Manhattan** $d_1 = \\sum_i |x_i - x_i\'|$.',
    'Because distance mixes all features, **feature scaling is mandatory** — an unscaled large-range feature will dominate the metric and silently ignore the others.',
    'KNN shines on small, low-dimensional datasets but degrades badly in high dimensions (the **curse of dimensionality**) and is slow at prediction time, costing $O(n \\cdot p)$ per query with a brute-force search.',
  ],
  additionalSections: [
    {
      heading: 'How $k$ Controls the Bias-Variance Tradeoff',
      content: `
The single hyperparameter $k$ is the knob that moves KNN along the bias-variance spectrum, and you can see this directly in how the decision boundary behaves.

**Small $k$ (e.g. $k = 1$): low bias, high variance.** With $k = 1$ every training point owns a little territory (its Voronoi cell), and the prediction is whatever the single closest point says. The model bends to fit every point exactly, so the training error is **zero** — but the boundary is jagged and chases noise. Move one noisy point and the boundary near it flips. This is **overfitting**: high variance, low bias.

**Large $k$ (e.g. $k \\to n$): high bias, low variance.** As $k$ grows, each prediction averages over more neighbors, smoothing the boundary. In the limit $k = n$, every query gets the same answer — the global majority class — regardless of where it sits. The model ignores local structure entirely: low variance (it barely changes when data changes) but high bias (**underfitting**).

A useful way to see the variance is to look at the regression form of KNN, which predicts the mean of the $k$ neighbor targets:

$$ \\hat{f}(x) = \\frac{1}{k} \\sum_{i \\in N_k(x)} y_i $$

If the targets carry independent noise of variance $\\sigma^2$, the variance of this averaged estimate is

$$ \\operatorname{Var}\\big(\\hat{f}(x)\\big) = \\frac{\\sigma^2}{k} $$

so variance falls as $1/k$ — doubling $k$ halves the variance. The cost is bias: averaging over a wider, less local neighborhood pulls the estimate away from the true value of $f$ at $x$. The sweet spot is found by cross-validation, and a common heuristic starting point is $k \\approx \\sqrt{n}$.
      `,
    },
    {
      heading: 'Distance Metrics and Why Scaling Is Non-Negotiable',
      content: `
KNN ranks neighbors by distance, so the *units* of your features directly determine who counts as "near". Consider a query point $q = (\\text{age}=30, \\text{income}=50000)$ and two candidate neighbors:

- $A = (\\text{age}=31, \\text{income}=50000)$ — one year older, identical income.
- $B = (\\text{age}=30, \\text{income}=50500)$ — same age, \\$500 more income.

**Raw (unscaled) Euclidean distances:**

$$ d(q, A) = \\sqrt{(30-31)^2 + (50000-50000)^2} = \\sqrt{1} = 1 $$

$$ d(q, B) = \\sqrt{(30-30)^2 + (50000-50500)^2} = \\sqrt{250000} = 500 $$

By this metric $A$ is "500 times closer" than $B$, purely because income is measured on a vastly larger numeric scale. Income's range swamps age; the age feature is effectively invisible. The fix is **standardization**, mapping each feature to zero mean and unit variance:

$$ z_i = \\frac{x_i - \\mu_i}{\\sigma_i} $$

Suppose age has $\\sigma_{\\text{age}} = 1$ and income has $\\sigma_{\\text{income}} = 500$. After scaling, $A$ differs from $q$ by $1$ standard deviation in age, and $B$ differs by $1$ standard deviation in income — now the two are **equidistant** ($d = 1$ for both), which matches the intuition that "one year" and "one standard deviation of income" are comparable amounts of difference. Always fit the scaler on the training data only and reuse it on the test data to avoid leakage.
      `,
    },
  ],
  comparisons: [
    {
      title: 'KNN vs Logistic Regression vs Decision Tree',
      methods: ['KNN', 'Logistic Regression', 'Decision Tree'],
      rows: [
        {
          dimension: 'Model type',
          values: ['Non-parametric (instance-based)', 'Parametric (learns fixed weights $w, b$)', 'Non-parametric (learns a tree structure)'],
        },
        {
          dimension: 'Training cost',
          values: ['Effectively $O(1)$ — just stores the data (lazy)', 'Iterative optimization of the weights', 'Recursive splitting, roughly $O(n p \\log n)$'],
        },
        {
          dimension: 'Prediction cost',
          values: ['Expensive: $O(n p)$ per query (brute force)', 'Cheap: one dot product $O(p)$', 'Cheap: a root-to-leaf walk $O(\\text{depth})$'],
        },
        {
          dimension: 'Interpretability',
          values: ['Low — no global rule, only neighbor lookups', 'High — signed coefficients per feature', 'High — human-readable if/else splits'],
        },
        {
          dimension: 'Handling of nonlinearity',
          values: ['Naturally nonlinear, arbitrary boundaries', 'Linear boundary unless features are engineered', 'Naturally nonlinear via axis-aligned splits'],
        },
        {
          dimension: 'Feature scaling needed',
          values: ['Yes — distance is scale-sensitive', 'Helpful for convergence, not strictly required', 'No — splits are scale-invariant'],
        },
      ],
      takeaway: 'Reach for KNN when boundaries are irregular and the dataset is small and low-dimensional; prefer logistic regression for a fast, interpretable linear baseline, and a decision tree when you want nonlinearity plus human-readable rules without worrying about scaling.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'The dataset is **small to medium and low-dimensional**, so brute-force neighbor search stays cheap and distances remain meaningful.',
      'The decision boundary is **irregular or highly non-linear** and you want a method that adapts locally without assuming a functional form.',
      'You need a quick, assumption-light **baseline** or a simple similarity engine (e.g. "find the most similar items/users").',
    ],
    avoidWhen: [
      'The feature space is **high-dimensional** — under the curse of dimensionality all points become roughly equidistant and neighbor votes lose meaning.',
      'You have a **large training set** with tight latency requirements — every prediction scans the whole dataset, which is slow and memory-heavy.',
      'You need an **interpretable, global explanation** of the model — KNN offers no coefficients or rules, only per-query neighbor lists.',
    ],
    rulesOfThumb: [
      'Always **scale features** (standardize or min-max) before computing distances.',
      'Start with $k \\approx \\sqrt{n}$ and tune $k$ by cross-validation; prefer an **odd $k$** in binary classification to avoid ties.',
      'For large datasets, replace brute-force search with an approximate index (KD-tree, ball tree, or HNSW) to cut prediction cost.',
    ],
  },
  caseStudies: [
    {
      title: 'Handwritten digit recognition on MNIST',
      domain: 'Computer vision / OCR',
      scenario: 'The MNIST benchmark contains 70,000 grayscale images of handwritten digits (60,000 train, 10,000 test), each a $28 \\times 28$ image flattened into a 784-dimensional pixel vector. The task is to classify each image as one of the ten digits $0$ through $9$.',
      approach: 'Treat each image as a point in $\\mathbb{R}^{784}$ and classify a test image by the majority label among its $k$ nearest training images under Euclidean (L2) distance. No model is trained — the algorithm simply searches the 60,000 stored examples for the closest matches at prediction time.',
      outcome: 'A plain KNN classifier with $k = 3$ and Euclidean distance reaches roughly **97% test accuracy** (about a **3% error rate**) on MNIST — a strong result for such a simple, training-free method, and competitive with early neural networks. The main cost is at prediction time, since each of the 10,000 test queries is compared against all 60,000 training points.',
      source: {
        title: 'The MNIST Database of Handwritten Digits (benchmark results table)',
        authors: 'LeCun, Y., Cortes, C. and Burges, C.J.C.',
        url: 'http://yann.lecun.com/exdb/mnist/',
        type: 'documentation',
      },
    },
  ],
  quiz: [

    {
      question: 'Why is feature scaling considered essential before running KNN?',
      options: [
        { text: 'Distances combine all features, so a feature with a large numeric range dominates the metric and crowds out the others.', correct: true },
        { text: 'Scaling speeds up the neighbor search by reducing the number of points.', correct: false },
        { text: 'KNN cannot compute distances on negative numbers without scaling.', correct: false },
        { text: 'Scaling is what allows KNN to perform a training step.', correct: false },
      ],
      explanation: 'KNN ranks neighbors by distance, and an unscaled feature measured in large units (e.g. income in dollars) will contribute far more to the distance than a small-range feature (e.g. age), effectively ignoring the latter. Standardizing each feature to comparable units restores balance. Scaling does not change the number of points or enable a training step.',
    },
    {
      question: 'KNN is often called a "lazy learner". What does this mean?',
      options: [
        { text: 'It does no real work at training time — it just stores the data and defers all computation to prediction time.', correct: true },
        { text: 'It trains slowly because it optimizes many parameters.', correct: false },
        { text: 'It randomly skips some training points to save time.', correct: false },
        { text: 'It refuses to make predictions until it has seen the test labels.', correct: false },
      ],
      explanation: 'A lazy learner builds no explicit model during `.fit()`; it simply memorizes the training set. All the expense (computing distances, finding neighbors, voting) happens lazily at query time. This is why KNN has near-zero training cost but expensive prediction.',
    },
    {
      question: 'What is the "curse of dimensionality" as it affects KNN?',
      options: [
        { text: 'As dimensions grow, points become nearly equidistant, so "nearest" neighbors are barely nearer than any others and votes lose meaning.', correct: true },
        { text: 'High dimensions make the training step impossibly slow.', correct: false },
        { text: 'KNN can only handle at most three features by definition.', correct: false },
        { text: 'Adding dimensions always improves accuracy because there is more information.', correct: false },
      ],
      explanation: 'In high-dimensional space the contrast between the nearest and farthest points shrinks: distances concentrate, so the closest neighbors are no longer meaningfully closer than distant ones. The neighborhood stops being "local", and KNN degrades. This is why KNN favors small, low-dimensional datasets or aggressive dimensionality reduction.',
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Describe the effect on the bias and variance of a K-Nearest Neighbors model as the hyperparameter $k$ is decreased toward 1.',
      expectedAnswerRubric: 'The answer should explain that as $k$ approaches 1, the model becomes highly sensitive to individual training points (noise), leading to a high variance and low bias. The decision boundary becomes jagged and overfits the training data.'
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
