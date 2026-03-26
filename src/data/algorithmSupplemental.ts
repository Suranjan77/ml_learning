export interface AlgorithmReference {
  title: string;
  authors?: string;
  year?: string;
  publisher?: string;
  url?: string;
}

export interface AlgorithmSupplemental {
  whenToUse: string[];
  assumptions: string[];
  references: AlgorithmReference[];
}

export const algorithmSupplemental: Record<string, AlgorithmSupplemental> = {
  "linear-regression": {
    whenToUse: [
      "When the target is continuous and you want a strong, interpretable baseline.",
      "When you need a simple model whose coefficients can be inspected directly.",
      "When the relationship is approximately linear or can be made linear with feature engineering.",
    ],
    assumptions: [
      "The expected response is approximately linear in the features.",
      "Errors are typically assumed to be independent with constant variance for classical inference.",
      "Strong multicollinearity can make coefficient estimates unstable, even though predictors do not need to be fully independent.",
    ],
    references: [
      {
        title: "An Introduction to Statistical Learning",
        authors: "Gareth James, Daniela Witten, Trevor Hastie, Robert Tibshirani",
        year: "2021",
        publisher: "Springer",
        url: "https://www.statlearning.com/",
      },
      {
        title: "Introduction to Linear Regression Analysis",
        authors: "Douglas C. Montgomery, Elizabeth A. Peck, G. Geoffrey Vining",
        year: "2021",
        publisher: "Wiley",
      },
      {
        title: "LinearRegression",
        publisher: "scikit-learn documentation",
        url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html",
      },
    ],
  },

  "logistic-regression": {
    whenToUse: [
      "When you need a fast and interpretable classifier for binary outcomes.",
      "When calibrated probability estimates matter more than highly complex decision boundaries.",
      "When you want a regularized linear decision model that works well as a baseline.",
    ],
    assumptions: [
      "For binary logistic regression, the log-odds are modeled as a linear function of the inputs.",
      "Observations are typically assumed independent for standard estimation and inference.",
      "The default 0.5 threshold is only a convention and should be tuned when class imbalance or decision costs matter.",
    ],
    references: [
      {
        title: "Applied Logistic Regression",
        authors: "David W. Hosmer, Stanley Lemeshow, Rodney X. Sturdivant",
        year: "2013",
        publisher: "Wiley",
      },
      {
        title: "Pattern Recognition and Machine Learning",
        authors: "Christopher M. Bishop",
        year: "2006",
        publisher: "Springer",
      },
      {
        title: "LogisticRegression",
        publisher: "scikit-learn documentation",
        url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html",
      },
    ],
  },

  "k-nearest-neighbors": {
    whenToUse: [
      "When you want a very simple non-parametric baseline for classification.",
      "When the local geometry of the data matters more than a global parametric model.",
      "When the training set is moderate in size and prediction latency is not the main constraint.",
    ],
    assumptions: [
      "Nearby points in feature space are assumed to have similar labels or targets.",
      "Distance is only meaningful if features are scaled appropriately and irrelevant features are controlled.",
      "Prediction cost grows with dataset size unless specialized indexing or approximate nearest-neighbor methods are used.",
    ],
    references: [
      {
        title: "Nearest Neighbor Pattern Classification",
        authors: "Thomas M. Cover, Peter E. Hart",
        year: "1967",
        publisher: "IEEE Transactions on Information Theory",
      },
      {
        title: "The Elements of Statistical Learning",
        authors: "Trevor Hastie, Robert Tibshirani, Jerome Friedman",
        year: "2009",
        publisher: "Springer",
        url: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        title: "Nearest Neighbors Classification",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/neighbors.html#classification",
      },
    ],
  },

  "support-vector-machines": {
    whenToUse: [
      "When you need a strong classifier on small-to-medium datasets with clear class separation.",
      "When high-dimensional feature spaces are involved and margin maximization is attractive.",
      "When kernel methods may help capture non-linear structure without explicit feature engineering.",
    ],
    assumptions: [
      "The displayed hard-margin constraints are an idealized case; practical SVMs usually use soft margins with regularization.",
      "Kernel choice and the regularization parameter strongly affect both fit and generalization.",
      "Linear SVMs are often more interpretable than kernel SVMs, whose boundaries are nonlinear in the original space.",
    ],
    references: [
      {
        title: "Support-Vector Networks",
        authors: "Corinna Cortes, Vladimir Vapnik",
        year: "1995",
        publisher: "Machine Learning",
      },
      {
        title: "The Elements of Statistical Learning",
        authors: "Trevor Hastie, Robert Tibshirani, Jerome Friedman",
        year: "2009",
        publisher: "Springer",
        url: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        title: "Support Vector Machines",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/svm.html",
      },
    ],
  },

  "decision-trees": {
    whenToUse: [
      "When interpretability and explicit if/else rules are important.",
      "When you want a model that naturally handles non-linear interactions.",
      "When you need a baseline that requires little preprocessing and can work with mixed feature types.",
    ],
    assumptions: [
      "For classification, splits are chosen by impurity reduction such as information gain or Gini decrease.",
      "For regression, trees are usually built by reducing squared error or variance, not classification purity measures.",
      "Greedy split selection is local and does not guarantee the globally optimal tree.",
    ],
    references: [
      {
        title: "Classification and Regression Trees",
        authors: "Leo Breiman, Jerome Friedman, Richard Olshen, Charles Stone",
        year: "1984",
        publisher: "Wadsworth",
      },
      {
        title: "C4.5: Programs for Machine Learning",
        authors: "J. Ross Quinlan",
        year: "1993",
        publisher: "Morgan Kaufmann",
      },
      {
        title: "Decision Trees",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/tree.html",
      },
    ],
  },

  "random-forests": {
    whenToUse: [
      "When you want a robust general-purpose model for structured tabular data.",
      "When a single decision tree overfits and you need lower variance.",
      "When you want an ensemble that often works well with limited tuning.",
    ],
    assumptions: [
      "Each tree is trained on a bootstrap sample of the data, and random feature subsets are considered at each split.",
      "For regression, predictions are typically averaged; for classification, predictions are aggregated by vote or averaged class probabilities.",
      "Impurity-based feature importances are useful heuristics but can be biased; permutation importance is often more reliable.",
    ],
    references: [
      {
        title: "Random Forests",
        authors: "Leo Breiman",
        year: "2001",
        publisher: "Machine Learning",
      },
      {
        title: "The Elements of Statistical Learning",
        authors: "Trevor Hastie, Robert Tibshirani, Jerome Friedman",
        year: "2009",
        publisher: "Springer",
        url: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        title: "Forest of Randomized Trees",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/ensemble.html#forest",
      },
    ],
  },

  "gradient-boosting-machines": {
    whenToUse: [
      "When you need a highly competitive model for structured/tabular data.",
      "When additive stagewise models are a good fit for the problem and careful tuning is acceptable.",
      "When you want to optimize a differentiable loss with weak learners such as shallow trees.",
    ],
    assumptions: [
      "Gradient boosting performs stagewise additive modeling and can be viewed as functional gradient descent on the loss.",
      "For squared-error loss, negative gradients correspond to ordinary residuals; for other losses they are pseudo-residuals.",
      "Boosting stages are sequential, though some work within a stage can still be parallelized depending on the implementation.",
    ],
    references: [
      {
        title: "Greedy Function Approximation: A Gradient Boosting Machine",
        authors: "Jerome H. Friedman",
        year: "2001",
        publisher: "Annals of Statistics",
      },
      {
        title: "The Elements of Statistical Learning",
        authors: "Trevor Hastie, Robert Tibshirani, Jerome Friedman",
        year: "2009",
        publisher: "Springer",
        url: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        title: "Gradient Boosting",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting",
      },
    ],
  },

  "naive-bayes": {
    whenToUse: [
      "When you need a fast baseline for classification, especially in high-dimensional spaces.",
      "When working with text or count data where multinomial or Bernoulli variants are natural.",
      "When training data is limited and you want a simple probabilistic model.",
    ],
    assumptions: [
      "The naive assumption is conditional independence of features given the class, not unconditional independence.",
      "Likelihood estimates can become zero for unseen feature-class combinations unless smoothing is applied.",
      "Probability estimates are often poorly calibrated even when classification accuracy is acceptable.",
    ],
    references: [
      {
        title: "Introduction to Information Retrieval",
        authors: "Christopher D. Manning, Prabhakar Raghavan, Hinrich Schütze",
        year: "2008",
        publisher: "Cambridge University Press",
        url: "https://nlp.stanford.edu/IR-book/",
      },
      {
        title: "A Comparison of Event Models for Naive Bayes Text Classification",
        authors: "Andrew McCallum, Kamal Nigam",
        year: "1998",
        publisher: "AAAI Workshop on Learning for Text Categorization",
      },
      {
        title: "Naive Bayes",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/naive_bayes.html",
      },
    ],
  },

  "k-means": {
    whenToUse: [
      "When you want a simple and scalable clustering baseline.",
      "When Euclidean cluster centers are meaningful and roughly spherical clusters are plausible.",
      "When you already have a reasonable guess for the number of clusters.",
    ],
    assumptions: [
      "K-means minimizes within-cluster squared distance to centroids, typically under Euclidean geometry.",
      "Lloyd's algorithm monotonically decreases the objective and converges to a local optimum, not necessarily the global one.",
      "Results can vary substantially with initialization, scaling, and the choice of K.",
    ],
    references: [
      {
        title: "Some Methods for Classification and Analysis of Multivariate Observations",
        authors: "J. B. MacQueen",
        year: "1967",
        publisher: "Proceedings of the Fifth Berkeley Symposium on Mathematical Statistics and Probability",
      },
      {
        title: "Least Squares Quantization in PCM",
        authors: "Stuart Lloyd",
        year: "1982",
        publisher: "IEEE Transactions on Information Theory",
      },
      {
        title: "K-means",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/clustering.html#k-means",
      },
    ],
  },

  dbscan: {
    whenToUse: [
      "When you want to detect arbitrarily shaped dense clusters and explicit noise points.",
      "When outlier identification is an important part of the task.",
      "When you do not want to specify the number of clusters in advance.",
    ],
    assumptions: [
      "Clusters are defined by density connectivity, not by centroid structure.",
      "The distance metric, feature scaling, epsilon, and minimum samples all strongly affect the result.",
      "DBSCAN can struggle when different parts of the data have very different densities.",
    ],
    references: [
      {
        title: "A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise",
        authors: "Martin Ester, Hans-Peter Kriegel, Jörg Sander, Xiaowei Xu",
        year: "1996",
        publisher: "KDD",
      },
      {
        title: "DBSCAN Revisited, Revisited",
        authors: "Erich Schubert, Jörg Sander, Martin Ester, Hans-Peter Kriegel, Xiaowei Xu",
        year: "2017",
        publisher: "ACM Transactions on Database Systems",
      },
      {
        title: "DBSCAN",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/clustering.html#dbscan",
      },
    ],
  },

  "principal-component-analysis": {
    whenToUse: [
      "When you need a lower-dimensional representation that preserves as much variance as possible.",
      "When you want to visualize high-dimensional data in 2D or 3D.",
      "When orthogonal components are useful for reducing redundancy among features.",
    ],
    assumptions: [
      "The covariance expression is defined for mean-centered data; centering is essential before standard PCA derivations.",
      "Standardization is often helpful when features are on very different scales, but unit-variance scaling is not universally required.",
      "PCA is a linear method and may miss important nonlinear structure.",
    ],
    references: [
      {
        title: "Principal Component Analysis",
        authors: "Ian T. Jolliffe",
        year: "2002",
        publisher: "Springer",
      },
      {
        title: "Principal Component Analysis: A Review and Recent Developments",
        authors: "Ian T. Jolliffe, Jorge Cadima",
        year: "2016",
        publisher: "Philosophical Transactions of the Royal Society A",
      },
      {
        title: "PCA",
        publisher: "scikit-learn User Guide",
        url: "https://scikit-learn.org/stable/modules/decomposition.html#pca",
      },
    ],
  },

  "neural-networks": {
    whenToUse: [
      "When you need a flexible non-linear model for fixed-length vector inputs.",
      "When feature interactions are complex and simpler linear models underfit.",
      "When you want a foundational feed-forward architecture for understanding deep learning.",
    ],
    assumptions: [
      "The universal approximation theorem concerns approximation on compact domains with sufficiently large networks; it does not guarantee practical trainability or sample efficiency.",
      "The output activation depends on the task: sigmoid or softmax for classification, and often identity/linear for regression.",
      "MLPs often benefit from more data than simpler models, but small and medium networks can still be practical on CPU-scale problems.",
    ],
    references: [
      {
        title: "Deep Learning",
        authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
        year: "2016",
        publisher: "MIT Press",
        url: "https://www.deeplearningbook.org/",
      },
      {
        title: "Approximation by Superpositions of a Sigmoidal Function",
        authors: "George Cybenko",
        year: "1989",
        publisher: "Mathematics of Control, Signals and Systems",
      },
      {
        title: "MLPClassifier",
        publisher: "scikit-learn documentation",
        url: "https://scikit-learn.org/stable/modules/generated/sklearn.neural_network.MLPClassifier.html",
      },
    ],
  },

  "convolutional-neural-networks": {
    whenToUse: [
      "When the input has spatial or grid structure such as images, spectrograms, or feature maps.",
      "When local receptive fields and parameter sharing are more appropriate than full connectivity.",
      "When you want a strong architecture family for many classical computer vision tasks.",
    ],
    assumptions: [
      "The operation used in most deep-learning libraries is cross-correlation, even though it is commonly called convolution.",
      "Convolutional layers are translation equivariant; partial translation invariance is encouraged by pooling, striding, and aggregation rather than guaranteed directly.",
      "The displayed formula is typically simplified to the single-channel case; practical CNNs also sum across input channels.",
    ],
    references: [
      {
        title: "Deep Learning",
        authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
        year: "2016",
        publisher: "MIT Press",
        url: "https://www.deeplearningbook.org/",
      },
      {
        title: "Deep Learning",
        authors: "Yann LeCun, Yoshua Bengio, Geoffrey Hinton",
        year: "2015",
        publisher: "Nature",
      },
      {
        title: "Conv2d",
        publisher: "PyTorch documentation",
        url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html",
      },
    ],
  },

  "recurrent-neural-networks": {
    whenToUse: [
      "When sequential order matters and hidden state is a natural modeling choice.",
      "When working with time series, streaming signals, or lightweight sequence models.",
      "When you want to understand the foundations behind gated sequence architectures such as LSTMs and GRUs.",
    ],
    assumptions: [
      "The recurrence creates sequential dependence across time steps, which limits parallelization across sequence length.",
      "For classification, the output layer usually applies an activation such as sigmoid or softmax on top of logits.",
      "RNNs were historically central in NLP, but modern large-scale NLP is now dominated by transformer-based architectures.",
    ],
    references: [
      {
        title: "Deep Learning",
        authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
        year: "2016",
        publisher: "MIT Press",
        url: "https://www.deeplearningbook.org/",
      },
      {
        title: "Learning Long-Term Dependencies with Gradient Descent Is Difficult",
        authors: "Yoshua Bengio, Patrice Simard, Paolo Frasconi",
        year: "1994",
        publisher: "IEEE Transactions on Neural Networks",
      },
      {
        title: "Long Short-Term Memory",
        authors: "Sepp Hochreiter, Jürgen Schmidhuber",
        year: "1997",
        publisher: "Neural Computation",
        url: "https://www.bioinf.jku.at/publications/older/2604.pdf",
      },
      {
        title: "Attention Is All You Need",
        authors: "Ashish Vaswani et al.",
        year: "2017",
        publisher: "NeurIPS",
        url: "https://arxiv.org/abs/1706.03762",
      },
    ],
  },
};
