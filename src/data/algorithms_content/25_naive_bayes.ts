import { LearningModule } from "./types";

export const naiveBayes: LearningModule = {
  id: "naive-bayes",
  title: "Naive Bayes",
  category: "Naive Bayes",
  prerequisites: ["applied-ml-workflow"],
  tracks: ["practitioner"],
  difficulty: 2,
  estimatedMinutes: 30,
  shortDescription: "A fast, probabilistic classifier that computes class probabilities using Bayes' Theorem with the 'naive' assumption of feature independence.",
  learningObjectives: [
    "Formulate the Naive Bayes classification model using Bayes' Theorem.",
    "Explain the 'naive' conditional independence assumption and its mathematical implications.",
    "Contrast Gaussian, Multinomial, and Bernoulli Naive Bayes variants and their use cases.",
    "Apply Laplace smoothing to handle zero-frequency feature occurrences.",
    "Explain the reason for computing probabilities in log-space to prevent underflow."
  ],
  keyTerms: [
    {
      term: "Conditional Independence",
      definition: "An assumption that the presence or absence of a particular feature is unrelated to the presence or absence of any other feature, given the class label."
    },
    {
      term: "Laplace Smoothing",
      definition: "A technique used to smooth categorical data by adding a small positive constant (usually 1) to all feature counts to avoid zero probability estimates."
    },
    {
      term: "Prior Probability",
      definition: "The initial probability of a class before observing any feature data, computed as the class proportion in the training dataset."
    },
    {
      term: "Likelihood",
      definition: "The conditional probability of observing a specific feature value given the class label."
    }
  ],
  misconceptions: [
    {
      claim: "Naive Bayes requires features to be truly independent in the real world to perform well.",
      correction: "Even though features are rarely independent in reality (e.g. 'credit' and 'card' in spam), Naive Bayes often yields highly accurate classification decisions because the decision boundary (not the absolute probabilities) is what determines the final class assignment."
    },
    {
      claim: "If a feature is missing from a class in training data, the model will just treat its likelihood as very low.",
      correction: "Without smoothing, a zero-frequency count results in a likelihood of exactly 0. Because probabilities are multiplied together, a single zero likelihood will zero out the entire posterior probability, regardless of other evidence."
    }
  ],
  references: [
    {
      title: "Speech and Language Processing (3rd ed. draft)",
      authors: "Dan Jurafsky and James H. Martin",
      url: "https://web.stanford.edu/~jurafsky/slp3/",
      type: "textbook"
    },
    {
      title: "Machine Learning: A Probabilistic Perspective",
      authors: "Kevin P. Murphy",
      url: "https://probml.github.io/pml-book/book1.html",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: "High Feature Correlation",
      description: "When features are highly correlated (e.g. duplicate columns), Naive Bayes double-counts the evidence, causing class probabilities to polarize incorrectly toward 0 or 1.",
      mitigation: "Remove redundant or highly collinear features during feature selection."
    }
  ],
  pros: [
    "Extremely fast to train and predict; requires only a single pass through the dataset.",
    "Performs remarkably well on high-dimensional text classification (e.g. spam detection, sentiment analysis).",
    "Requires relatively small amounts of training data to estimate parameters."
  ],
  cons: [
    "Known to be a poor estimator; the output class probabilities are often poorly calibrated.",
    "The conditional independence assumption is fundamentally unrealistic for most natural datasets."
  ],
  intuition: "Imagine you're trying to guess if an email is spam based on the words it contains: 'win', 'lottery', and 'money'. Calculating the exact probability of these words appearing together in a specific sequence is difficult. So, you make a simplifying, 'naive' assumption: you pretend that words appear completely independently of each other. You look up how likely 'win' is in spam, how likely 'lottery' is, and how likely 'money' is, and simply multiply those probabilities together. Even though this independence assumption is technically wrong, the resulting guess is usually correct!",
  mathematics: "### Bayes' Theorem for Classification\n\nGiven a class variable $C$ and a feature vector $\\mathbf{x} = (x_1, \\dots, x_d)$, the posterior probability is:\n$$P(C | \\mathbf{x}) = \\frac{P(\\mathbf{x} | C) P(C)}{P(\\mathbf{x})}$$\n\nSince the denominator $P(\\mathbf{x})$ is constant for all classes, we focus on the numerator:\n$$P(C | \\mathbf{x}) \\propto P(\\mathbf{x} | C) P(C)$$\n\n### The Independence Assumption\n\nThe joint probability $P(\\mathbf{x} | C)$ is factored as the product of individual conditional probabilities:\n$$P(\\mathbf{x} | C) = P(x_1, \\dots, x_d | C) = \\prod_{j=1}^{d} P(x_j | C)$$\n\nThis yields the classification rule:\n$$\\hat{y} = \\arg\\max_{c} P(C=c) \\prod_{j=1}^{d} P(x_j | C=c)$$\n\n### Computation in Log-Space\n\nMultiplying many small probabilities can lead to numerical underflow. To prevent this, we calculate in log-space:\n$$\\hat{y} = \\arg\\max_{c} \\left( \\log P(C=c) + \\sum_{j=1}^{d} \\log P(x_j | C=c) \\right)$$\n\n### Laplace Smoothing (Additive Smoothing)\n\nFor categorical features, the conditional probability is smoothed by adding $\\alpha > 0$ (typically $\\alpha=1$):\n$$\\hat{P}(x_j = v | C=c) = \\frac{\\text{count}(x_j=v, C=c) + \\alpha}{\\text{count}(C=c) + \\alpha K_j}$$\nwhere $K_j$ is the number of unique values feature $j$ can take.",
  fullDescription: "Naive Bayes classifiers are a collection of classification algorithms based on Bayes' Theorem. It is not a single algorithm but a family of algorithms where all of them share a common principle: every pair of features being classified is independent of each other. Despite their simplistic assumptions, Naive Bayes classifiers work extremely well in many complex real-world situations, particularly in document classification and spam filtering.",
  codeSnippet: `/**
 * Simple Multinomial Naive Bayes Classifier for text tokens
 */
export class MultinomialNaiveBayes {
  private classPriors: Record<string, number> = {};
  private wordCounts: Record<string, Record<string, number>> = {};
  private totalWordCounts: Record<string, number> = {};
  private vocab: Set<string> = new Set();
  private classes: string[] = [];

  constructor(private alpha: number = 1.0) {}

  fit(docs: string[][], labels: string[]) {
    const numDocs = docs.length;
    const classCounts: Record<string, number> = {};

    // Count instances
    for (let i = 0; i < numDocs; i++) {
      const label = labels[i];
      const doc = docs[i];

      classCounts[label] = (classCounts[label] || 0) + 1;
      if (!this.wordCounts[label]) {
        this.wordCounts[label] = {};
        this.totalWordCounts[label] = 0;
      }

      doc.forEach(word => {
        this.vocab.add(word);
        this.wordCounts[label][word] = (this.wordCounts[label][word] || 0) + 1;
        this.totalWordCounts[label]++;
      });
    }

    this.classes = Object.keys(classCounts);
    this.classes.forEach(c => {
      this.classPriors[c] = classCounts[c] / numDocs;
    });
  }

  predict(doc: string[]): string {
    let bestClass = this.classes[0];
    let bestScore = -Infinity;
    const vocabSize = this.vocab.size;

    this.classes.forEach(c => {
      // Start score with prior probability in log-space
      let score = Math.log(this.classPriors[c]);
      const totalWords = this.totalWordCounts[c];

      doc.forEach(word => {
        // Only count words that were seen in the training vocabulary
        if (this.vocab.has(word)) {
          const count = this.wordCounts[c][word] || 0;
          // Apply Laplace smoothing
          const prob = (count + this.alpha) / (totalWords + this.alpha * vocabSize);
          score += Math.log(prob);
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    });

    return bestClass;
  }
}`,
  relatedModules: ["nlp", "logistic-regression"],
  tldr: [
    'Naive Bayes is a **generative** classifier: it models how each class generates features via $P(y)$ and $P(x_i \\mid y)$, then applies Bayes’ theorem.',
    'The **naive** assumption is conditional independence of features given the class, giving $P(y \\mid \\mathbf{x}) \\propto P(y)\\prod_i P(x_i \\mid y)$.',
    'Predict the class that maximizes the posterior; in practice work in **log-space**, $\\arg\\max_c \\big[\\log P(c) + \\sum_i \\log P(x_i \\mid c)\\big]$, to avoid underflow.',
    '**Laplace (additive) smoothing** adds $\\alpha$ to every count so that an unseen feature value never forces a zero probability that wipes out the whole product.',
    'It is a fast, data-efficient **baseline** that excels on high-dimensional sparse text (spam, sentiment) despite the independence assumption being false.',
    'Probabilities are often **poorly calibrated** (over-confident) because correlated features double-count evidence, but the $\\arg\\max$ decision is frequently still correct.',
  ],
  additionalSections: [
    {
      heading: 'Deriving the Classifier from Bayes’ Theorem',
      content: `
Naive Bayes is a **generative** model: rather than learning a decision boundary directly, it models how each class produces data and then inverts that model with Bayes’ theorem. For a class label $y$ and feature vector $\\mathbf{x} = (x_1, \\dots, x_d)$:

$$ P(y \\mid \\mathbf{x}) = \\frac{P(\\mathbf{x} \\mid y)\\,P(y)}{P(\\mathbf{x})} $$

The evidence $P(\\mathbf{x})$ does not depend on $y$, so for choosing the best class it is a constant we can drop:

$$ P(y \\mid \\mathbf{x}) \\propto P(\\mathbf{x} \\mid y)\\,P(y) $$

The hard term is the joint likelihood $P(\\mathbf{x} \\mid y) = P(x_1, \\dots, x_d \\mid y)$, which in general requires modelling every interaction between features — exponentially many parameters. The **naive** conditional-independence assumption says that, *given the class*, the features are independent:

$$ P(x_1, \\dots, x_d \\mid y) = \\prod_{i=1}^{d} P(x_i \\mid y) $$

Substituting gives the Naive Bayes classifier:

$$ P(y \\mid \\mathbf{x}) \\propto P(y) \\prod_{i=1}^{d} P(x_i \\mid y), \\qquad \\hat{y} = \\arg\\max_{c} \\; P(c) \\prod_{i=1}^{d} P(x_i \\mid c) $$

This collapses the parameter count from exponential to linear in $d$: we only ever estimate one-dimensional conditionals $P(x_i \\mid y)$, which is exactly why the model trains in a single pass and needs very little data.
      `,
    },
    {
      heading: 'Log-Space Computation and Laplace Smoothing',
      content: `
A document can contain hundreds of tokens, so the product $\\prod_i P(x_i \\mid y)$ multiplies hundreds of numbers each below $1$. The result quickly drops below the smallest representable floating-point value — **numerical underflow**. Because $\\log$ is monotonic, taking logs preserves the $\\arg\\max$ while turning the product into a numerically stable sum:

$$ \\hat{y} = \\arg\\max_{c} \\left[ \\log P(c) + \\sum_{i=1}^{d} \\log P(x_i \\mid c) \\right] $$

A second problem is the **zero-frequency** trap. If a word $v$ never appeared with class $c$ in training, the maximum-likelihood estimate is $P(v \\mid c) = 0$, and a single zero factor annihilates the entire product (or sends the log to $-\\infty$), no matter how much other evidence points to $c$. **Laplace (additive) smoothing** fixes this by adding a pseudocount $\\alpha > 0$ to every count:

$$ \\hat{P}(x_i = v \\mid c) = \\frac{\\text{count}(v, c) + \\alpha}{\\text{count}(c) + \\alpha K} $$

where $K$ is the number of distinct values the feature can take (the vocabulary size for text). With $\\alpha = 1$ every value gets at least one phantom observation, so no probability is ever exactly $0$, and the denominator is inflated by $\\alpha K$ to keep the conditional distribution normalized. Larger $\\alpha$ pulls estimates toward the uniform distribution (stronger regularization); $\\alpha \\to 0$ recovers the raw maximum-likelihood counts.
      `,
    },
  ],
  comparisons: [
    {
      title: 'Naive Bayes vs Logistic Regression',
      methods: ['Naive Bayes', 'Logistic Regression'],
      rows: [
        {
          dimension: 'Modelling paradigm',
          values: ['Generative — models $P(\\mathbf{x} \\mid y)$ and $P(y)$, then inverts with Bayes', 'Discriminative — models $P(y \\mid \\mathbf{x})$ directly'],
        },
        {
          dimension: 'Feature independence',
          values: ['Assumes conditional independence given the class', 'No independence assumption; learns weights jointly'],
        },
        {
          dimension: 'Small-data behavior',
          values: ['Data-efficient — converges fast, strong with few examples', 'Needs more data to reach its (lower) asymptotic error'],
        },
        {
          dimension: 'Probability calibration',
          values: ['Often poorly calibrated / over-confident from correlated features', 'Typically well calibrated, especially with regularization'],
        },
        {
          dimension: 'Training speed',
          values: ['Single pass of counting — extremely fast', 'Iterative optimization (gradient descent) — slower'],
        },
      ],
      takeaway: 'Naive Bayes wins when data is scarce and you need a fast baseline; logistic regression usually wins asymptotically with enough data and gives better-calibrated probabilities. A classic result (Ng & Jordan, 2001) shows NB reaches its error faster but logistic regression reaches a lower error eventually.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Classifying **text**: spam filtering, sentiment, or topic labeling where the bag-of-words representation is high-dimensional and sparse.',
      'You have **little training data** and need a model that estimates its few parameters reliably from a single pass.',
      'You need a **fast, cheap baseline** to benchmark before investing in heavier models.',
      'Features are roughly conditionally independent given the class, or correlations are mild enough that the $\\arg\\max$ decision survives.',
    ],
    avoidWhen: [
      'Features are **strongly correlated** (e.g. duplicate or near-duplicate columns) — NB double-counts evidence and polarizes probabilities.',
      'You need **well-calibrated probability estimates** rather than just the most likely class — prefer logistic regression or a calibrated model.',
      'The decision genuinely depends on **feature interactions** that independence erases — use trees or models that capture interactions.',
    ],
    rulesOfThumb: [
      'Always apply Laplace smoothing ($\\alpha = 1$ is a sensible default) so unseen feature values cannot zero out a posterior.',
      'Compute scores in log-space to avoid floating-point underflow on long documents.',
      'Match the variant to the data: Multinomial NB for token counts, Bernoulli NB for binary presence/absence, Gaussian NB for continuous features.',
      'Drop redundant or highly collinear features before fitting to reduce evidence double-counting.',
    ],
  },
  caseStudies: [
    {
      title: 'Bayesian spam filtering with a bag-of-words classifier',
      domain: 'Email / NLP',
      scenario: 'In the early 2000s, rule-based spam filters were brittle and easy for spammers to evade. Paul Graham’s essay "A Plan for Spam" proposed instead learning a per-user statistical filter that scores each incoming email from the words it contains, treating tokens as (naively) independent evidence for the Spam vs Ham classes.',
      approach: 'Build a bag-of-words token model: estimate $P(\\text{token} \\mid \\text{Spam})$ and $P(\\text{token} \\mid \\text{Ham})$ from each user’s own corpus of good and spam mail, smooth rare tokens to avoid zero probabilities, and combine the most informative tokens via Bayes’ theorem to produce a spam probability for each new message.',
      outcome: 'The naive-Bayes-style filter classified spam with very high accuracy — Graham reported catching about **99.5%** of spam with roughly **0.03%** false positives on his mail — dramatically better than the hand-written rules it replaced, and the approach (popularized as "Bayesian spam filtering") became the template for production spam filters. The lesson: a simple bag-of-words Naive Bayes model, trained per user and properly smoothed, is a remarkably strong text classifier.',
      source: {
        title: 'A Plan for Spam',
        authors: 'Paul Graham',
        url: 'https://www.paulgraham.com/spam.html',
        type: 'tutorial',
      },
    },
  ],
  quiz: [
    {
      question: 'What exactly does the "naive" conditional-independence assumption state?',
      options: [
        { text: 'Given the class label, the features are independent of one another.', correct: true },
        { text: 'The features are unconditionally (marginally) independent in the raw data.', correct: false },
        { text: 'The classes are equally likely (uniform prior).', correct: false },
        { text: 'Each feature depends only on the previous feature in sequence.', correct: false },
      ],
      explanation: 'Naive Bayes assumes the features are independent **conditioned on the class**: $P(x_1,\\dots,x_d \\mid y) = \\prod_i P(x_i \\mid y)$. This is weaker than marginal independence and is what reduces the joint likelihood to a product of one-dimensional conditionals. It says nothing about the priors being uniform.',
    },
    {
      question: 'The independence assumption is almost always false for real data (e.g. "credit" and "card" co-occur). Why does Naive Bayes still classify well?',
      options: [
        { text: 'The final prediction is an $\\arg\\max$ over classes, which often picks the right class even when the absolute probability estimates are wrong.', correct: true },
        { text: 'Because correlated features make the probability estimates more accurate.', correct: false },
        { text: 'Because it secretly models the correlations behind the scenes.', correct: false },
        { text: 'Because text data actually has independent words.', correct: false },
      ],
      explanation: 'Violating independence skews the magnitude of the posterior (often making it over-confident), but classification only needs the *correct class to score highest*. The $\\arg\\max$ decision is robust to these distortions, so accuracy stays high even though the probabilities themselves are poorly calibrated.',
    },
    {
      question: 'Why is Laplace (additive) smoothing applied to the likelihoods?',
      options: [
        { text: 'It prevents an unseen feature value from producing a zero probability that would wipe out the entire posterior product.', correct: true },
        { text: 'It speeds up training by reducing the number of counts to store.', correct: false },
        { text: 'It makes the features truly independent.', correct: false },
        { text: 'It converts the model from generative to discriminative.', correct: false },
      ],
      explanation: 'A feature value never seen with a class has a maximum-likelihood probability of $0$, and since likelihoods are multiplied, one zero annihilates the whole posterior. Adding a pseudocount $\\alpha$ to every count guarantees strictly positive probabilities, so no single missing token can veto a class.',
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Naive Bayes is fundamentally a "generative" classifier. Contrast the generative modeling paradigm of Naive Bayes with discriminative models (like Logistic Regression). How does Naive Bayes arrive at the posterior probability $P(y \\mid \\mathbf{x})$?',
      expectedAnswerRubric: 'A strong answer will explain that a generative model learns the joint probability distribution by modeling the prior $P(y)$ and the class-conditional feature distributions $P(x_i \\mid y)$. It then uses Bayes’ Theorem to invert these and compute the posterior $P(y \\mid \\mathbf{x})$. This is contrasted with discriminative models, which bypass modeling the feature distributions and directly estimate the decision boundary or posterior $P(y \\mid \\mathbf{x})$.'
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
