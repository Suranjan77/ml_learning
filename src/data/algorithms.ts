export type AlgorithmCategory = "Supervised" | "Unsupervised" | "Deep Learning";

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
  codeSnippet: string;
}

export const algorithms: Algorithm[] = [
  {
    id: "linear-regression",
    title: "Linear Regression",
    category: "Supervised",
    shortDescription:
      "Predicts a continuous output variable based on one or more input variables.",
    fullDescription:
      "Linear regression is a linear approach for modelling the relationship between a scalar response and one or more explanatory variables. It is one of the most well-known and well-understood algorithms in statistics and machine learning.",
    intuition:
      'Imagine you want to predict the price of a house based on its size. You plot past data on a graph (size on the x-axis, price on the y-axis). Linear regression finds the "line of best fit" through this data, allowing you to estimate the price for any given size.',
    mathematics: `For a single input feature, linear regression is often written as:

$$ \hat{y} = mx + b $$

More generally, with multiple features:

$$ \hat{y} = w^T x + b $$

Where:
- $\hat{y}$ = predicted value
- $x$ = input feature vector
- $w$ = weight vector
- $b$ = bias term

The most common fitting criterion is **Ordinary Least Squares (OLS)**, which minimizes the sum of squared residuals:

$$ RSS = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2 $$

This objective has a closed-form solution under standard assumptions, and it can also be optimized numerically.`,
    pros: [
      "Simple to implement and interpret.",
      "Fast to train and predict.",
      "Less prone to overfitting with regularization (Lasso/Ridge).",
      "Serves as an excellent baseline model.",
    ],
    cons: [
      "Assumes a linear relationship between features and target.",
      "Sensitive to outliers which can skew the best-fit line.",
      "Prone to underfitting on complex, non-linear datasets.",
      "Can become unstable when features are highly collinear, making coefficients harder to interpret.",
    ],
    codeSnippet: `from sklearn.linear_model import LinearRegression
import numpy as np

# Training data: [Size in sqft]
X = np.array([[1000], [1500], [2000], [2500]])
# Target: [Price in thousands]
y = np.array([300, 450, 590, 710])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

# Predict price for 1800 sqft
prediction = model.predict([[1800]])
print(f"Predicted Price: \${prediction[0]:.2f}k")`,
  },
  {
    id: "logistic-regression",
    title: "Logistic Regression",
    category: "Supervised",
    shortDescription:
      "Predicts the probability of a categorical target variable (binary classification).",
    fullDescription:
      "Despite its name, logistic regression is a classification algorithm. In the binary case, it models the probability that a given input belongs to class 1 by applying the logistic sigmoid function to a linear score. Multiclass extensions typically use the softmax function.",
    intuition:
      'If you want to classify emails as "Spam" or "Not Spam", logistic regression calculates a score based on keywords. It then passes this score through a "S-shaped" curve (Sigmoid) to get a probability between 0 and 1. If it\'s over 0.5, it\'s Spam!',
    mathematics: `For binary classification, logistic regression maps a linear score to a probability using the sigmoid function:

$$ P(y=1|x) = \sigma(w^T x + b) = \frac{1}{1 + e^{-(w^T x + b)}} $$

Equivalently, it models the **log-odds** as a linear function of the inputs:

$$ \log \frac{P(y=1|x)}{P(y=0|x)} = w^T x + b $$

The parameters are typically estimated by **maximum likelihood**, which is equivalent to minimizing the binary cross-entropy loss:

$$ L(w,b) = -\frac{1}{n} \sum_{i=1}^{n} \left[y_i \log(\hat{y}_i) + (1-y_i)\log(1-\hat{y}_i)\right] $$`,
    pros: [
      "Often produces reasonably calibrated probabilities, especially when the model is well specified.",
      "Highly efficient and requires low computational resources.",
      "Easy to regularize to prevent overfitting.",
      "Coefficients provide insight into feature importance.",
    ],
    cons: [
      "Cannot solve non-linear problems without feature engineering.",
      "Vulnerable to multicollinearity and outliers.",
      "Assumes a linear relationship between independent variables and log-odds.",
    ],
    codeSnippet: `from sklearn.linear_model import LogisticRegression
import numpy as np

# Features: [Hours Studied]
X = np.array([[1], [2], [3], [4], [5], [6]])
# Labels: [Pass (1) or Fail (0)]
y = np.array([0, 0, 0, 1, 1, 1])

model = LogisticRegression()
model.fit(X, y)

# Predict probability of passing for 3.5 hours study
prob = model.predict_proba([[3.5]])
print(f"Probability of Passing: {prob[0][1]:.2%}")`,
  },
  {
    id: "k-nearest-neighbors",
    title: "K-Nearest Neighbors",
    category: "Supervised",
    shortDescription:
      "Classifies data points based on the labels of their nearest neighbors.",
    fullDescription:
      'K-Nearest Neighbors (KNN) is a non-parametric, lazy learning algorithm. It doesn\'t learn a discriminative function from the training data but "memorizes" the dataset instead. Classification is performed by a majority vote of its neighbors.',
    intuition:
      '"Tell me who your neighbors are, and I\'ll tell you who you are." To classify a new point, KNN looks at the $K$ closest points in the training set. If most of them are "Red", the new point is classified as "Red".',
    mathematics: `Distance between points is often calculated using **Euclidean distance**:

$$ d(p, q) = \sqrt{\sum_{i=1}^{n} (p_i - q_i)^2} $$

For KNN classification, the prediction for a query point $x$ is the majority class among its nearest neighbors:

$$ \hat{y} = \operatorname{mode}(\{y_i : i \in N_k(x)\}) $$

Where $N_k(x)$ is the set of the $k$ training points closest to $x$.

For KNN regression, the prediction is typically the average target value among those neighbors.`,
    pros: [
      "Extremely simple to understand and implement.",
      "No training phase required (lazy learner).",
      "Naturally handles multi-class classification.",
      "Effective if the decision boundary is very irregular.",
    ],
    cons: [
      "Computationally expensive during prediction (must scan all data).",
      "High memory usage as it stores the entire dataset.",
      "Sensitive to the choice of $K$ and the distance metric.",
      "Sensitive to irrelevant features and data scaling.",
    ],
    codeSnippet: `from sklearn.neighbors import KNeighborsClassifier
import numpy as np

# Features: [Sweetness, Crunchiness]
X = np.array([[7, 7], [3, 2], [2, 1], [8, 5]])
# Labels: [Fruit (0) or Protein (1)]
y = np.array([0, 1, 1, 0])

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X, y)

# Classify a new food: [6, 4]
result = knn.predict([[6, 4]])
print(f"Classification: {'Fruit' if result[0]==0 else 'Protein'}")`,
  },
  {
    id: "support-vector-machines",
    title: "Support Vector Machines",
    category: "Supervised",
    shortDescription:
      "Finds the optimal hyperplane that maximizes the margin between different classes.",
    fullDescription:
      'Support Vector Machines (SVMs) are maximum-margin classifiers that seek a separating boundary with the largest possible margin between classes. In linear SVMs this boundary is a hyperplane; with kernels, the decision boundary can be non-linear in the original input space. Points that lie on or inside the margin are called "support vectors".',
    intuition:
      'Imagine trying to separate two groups of points with a wide "no-man\'s land" (the margin). SVM tries to find the widest possible path that separates the groups without touching any points.',
    mathematics: `For the hard-margin linear SVM, the goal is to maximize the geometric margin

$$ M = \frac{2}{\|w\|} $$

subject to the separation constraints

$$ y_i (w^T x_i + b) \ge 1 $$

In practice, most SVMs use a **soft margin**, introducing slack variables and a regularization parameter $C$ to trade off margin size against classification errors.

For non-linear decision boundaries, SVMs use the **kernel trick**:

$$ K(x_i, x_j) = \phi(x_i)^T \phi(x_j) $$

Common kernels include polynomial kernels and the **RBF (Gaussian)** kernel.`,
    pros: [
      "Effective in high-dimensional spaces.",
      "Robust against overfitting, especially in high-dimensional space.",
      "Memory efficient because it only uses a subset of training points (support vectors).",
      "Versatile through the use of different Kernel functions.",
    ],
    cons: [
      "Long training time for large datasets.",
      "Does not provide probability estimates directly.",
      "Sensitive to the choice of Kernel and regularization parameters.",
      "Difficult to interpret the final model weights.",
    ],
    codeSnippet: `from sklearn import svm
import numpy as np

# Training data
X = np.array([[1, 2], [5, 8], [1.5, 1.8], [8, 8]])
y = np.array([0, 1, 0, 1])

# Create SVM with RBF kernel
clf = svm.SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Prediction: {clf.predict([[0.5, 0.8]])}")`,
  },
  {
    id: "decision-trees",
    title: "Decision Trees",
    category: "Supervised",
    shortDescription:
      "A flowchart-like tree structure used for both classification and regression.",
    fullDescription:
      'Decision Trees recursively split the data into subsets based on feature values. For classification, the goal is to create leaves that are as pure as possible. For regression, the goal is to create leaves whose targets have low variance.',
    intuition:
      'Think of a game of "20 Questions". You ask: "Is the animal a mammal?", "Does it fly?", "Is it a bat?". Each question narrows down the possibilities until you reach a final answer.',
    mathematics: `For classification trees, a split is chosen by maximizing **impurity reduction**. Two common impurity measures are:

$$ Gini(D) = 1 - \sum_{i=1}^{c} p_i^2 $$

$$ Entropy(D) = -\sum_{i=1}^{c} p_i \log_2(p_i) $$

A split is preferred when it reduces the weighted impurity of the child nodes. With entropy, this reduction is called **information gain**.

For regression trees, splits are often chosen to reduce target variance or mean squared error within each child node.`,
    pros: [
      "Highly interpretable (White Box model).",
      "Requires very little data preparation (no need for scaling).",
      "Handles both numerical and categorical data.",
      "Can model complex non-linear relationships.",
    ],
    cons: [
      "Extremely prone to overfitting (creating overly complex trees).",
      "Unstable: small changes in data can lead to a completely different tree.",
      "Greedy algorithms might not find the globally optimal tree.",
    ],
    codeSnippet: `from sklearn.tree import DecisionTreeClassifier
import numpy as np

# Features: [Age, Income]
X = np.array([[25, 50000], [45, 80000], [20, 20000], [35, 120000]])
# Target: [Bought Product? (1/0)]
y = np.array([0, 1, 0, 1])

clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X, y)

prediction = clf.predict([[30, 60000]])[0]
print("Will buy:", "Yes" if prediction == 1 else "No")`,
  },
  {
    id: "random-forests",
    title: "Random Forests",
    category: "Supervised",
    shortDescription:
      "An ensemble of many decision trees to improve accuracy and robustness.",
    fullDescription:
      "Random Forest is an ensemble learning method that constructs a multitude of decision trees at training time. For classification, it outputs the mode of the classes; for regression, the mean prediction.",
    intuition:
      'Instead of asking one expert, you ask many. Each tree is trained on a bootstrap sample of the data, and at every split it considers only a random subset of features. This diversity makes the ensemble much more stable than a single decision tree.',
    mathematics: `Random forests combine **bagging** with **random feature selection**:

1. Draw $B$ bootstrap samples from the training data.
2. Train a tree $T_b$ on each bootstrap sample.
3. At each split, consider only a random subset of $m < p$ features.

For regression, predictions are averaged:

$$ \hat{f}(x) = \frac{1}{B} \sum_{b=1}^{B} T_b(x) $$

For classification, predictions are typically aggregated by majority vote or by averaging class probabilities.`,
    pros: [
      "A strong general-purpose baseline, especially for tabular data.",
      "Handles large datasets with high dimensionality very well.",
      "Provides useful feature-importance heuristics, though some importance measures can be biased.",
      "Highly resistant to overfitting compared to single trees.",
    ],
    cons: [
      "Can be slow to predict if the ensemble is very large.",
      "Complex and harder to interpret than a single tree.",
      "High memory usage to store many trees.",
      "Less effective on very sparse data (like text).",
    ],
    codeSnippet: `from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Features: [Age, Income, Visits]
X = np.array([
    [25, 50000, 2],
    [45, 80000, 7],
    [20, 20000, 1],
    [35, 120000, 9],
    [52, 110000, 8],
    [23, 32000, 2]
])
y = np.array([0, 1, 0, 1, 1, 0])

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

prediction = rf.predict([[40, 90000, 6]])[0]
print("Prediction:", prediction)
print("Top feature importance:", round(rf.feature_importances_.max(), 4))`,
  },
  {
    id: "gradient-boosting-machines",
    title: "Gradient Boosting (GBM)",
    category: "Supervised",
    shortDescription:
      "Builds trees sequentially, with each new tree correcting errors made by previous ones.",
    fullDescription:
      "Gradient Boosting is an ensemble technique where models are added sequentially. Each new model is fit to the negative gradient of the loss with respect to the current ensemble prediction, making the method a form of stagewise additive modeling and functional gradient descent.",
    intuition:
      'Imagine an archer. The first arrow hits near the bullseye but is slightly off to the left. The second arrow is aimed specifically to correct that "left-leaning" error. The third arrow corrects what remains. Together, they zero in on the target.',
    mathematics: `Gradient boosting minimizes a loss function $L(y, f(x))$ by adding weak learners stage by stage:

$$ f_m(x) = f_{m-1}(x) + \nu \, h_m(x) $$

Where $\nu$ is the **learning rate**.

At iteration $m$, the new learner is fit to the negative gradient of the loss with respect to the current model output:

$$ r_{im} = -\left[\frac{\partial L(y_i, f(x_i))}{\partial f(x_i)}\right]_{f=f_{m-1}} $$

For squared-error loss, these negative gradients are ordinary residuals. For more general losses, they are often called **pseudo-residuals**.`,
    pros: [
      "Often provides highly competitive accuracy on structured tabular data.",
      "Highly flexible: can optimize various loss functions.",
      "Can support robust handling of missing values in some implementations, though this is library-dependent.",
      "Powerful feature importance insights.",
    ],
    cons: [
      "Prone to overfitting if not carefully tuned (learning rate, depth).",
      "Slow to train since boosting stages are sequential, limiting parallelism across stages.",
      "Sensitive to noise in the data.",
      "Requires extensive hyperparameter tuning.",
    ],
    codeSnippet: `from sklearn.ensemble import GradientBoostingClassifier
import numpy as np

X = np.array([
    [1.0, 10.0],
    [1.5, 12.0],
    [2.0, 18.0],
    [3.5, 40.0],
    [4.0, 44.0],
    [5.0, 52.0]
])
y = np.array([0, 0, 0, 1, 1, 1])

gbm = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
gbm.fit(X, y)

accuracy = gbm.score(X, y)
print("Training accuracy:", round(accuracy, 3))`,
  },
  {
    id: "naive-bayes",
    title: "Naive Bayes",
    category: "Supervised",
    shortDescription:
      "Probabilistic classifier based on Bayes' Theorem with an assumption of independence.",
    fullDescription:
      'Naive Bayes is a probabilistic machine learning model used for classification tasks. It is based on Bayes\' Theorem with the "naive" assumption that features are conditionally independent given the class label.',
    intuition:
      "If you see an animal that is large, has a trunk, and is grey, Naive Bayes calculates the probability of it being an Elephant by multiplying the probabilities of each trait independently. It's fast and remarkably effective for text spam filtering!",
    mathematics: `Based on **Bayes' Theorem**:

$$ P(C|X) = \\frac{P(X|C) P(C)}{P(X)} $$

For a feature vector $x = (x_1, \ldots, x_n)$, the model assumes that features are **conditionally independent** given the class $C$:

$$ P(x_1, \ldots, x_n | C) = \prod_{i=1}^{n} P(x_i | C) $$

The classifier then selects the class $C$ that maximizes the posterior probability:

$$ \hat{y} = \operatorname{argmax}_{c} P(C=c) \prod_{i=1}^{n} P(x_i | C=c) $$

Where:
- $P(C=c)$ is the **prior** probability of the class.
- $P(x_i | C=c)$ is the **likelihood** of feature $i$ given the class, often modeled as Gaussian for continuous data or Multinomial for counts.`,
    pros: [
      "Extremely fast for both training and prediction.",
      "Performs well even with a small amount of training data.",
      "Handles high-dimensional data efficiently.",
      "Standard baseline for text classification and spam detection.",
    ],
    cons: [
      "The independence assumption is almost never true in real life.",
      "Probability estimates are often unreliable (though classification is often correct).",
      "Zero-frequency problem: unseen feature/class combinations can get zero estimated probability unless smoothing is used.",
    ],
    codeSnippet: `from sklearn.naive_bayes import GaussianNB, MultinomialNB
import numpy as np

# Continuous features: [Petal Length, Petal Width]
X = np.array([[1.4, 0.2], [1.3, 0.2], [4.7, 1.4], [4.5, 1.5]])
y = np.array([0, 0, 1, 1])

model = GaussianNB()
model.fit(X, y)

prediction = model.predict([[4.6, 1.3]])[0]
print("Predicted class:", prediction)

# For text or count data, MultinomialNB is usually preferred
text_model = MultinomialNB()`,
  },
  {
    id: "k-means",
    title: "K-Means Clustering",
    category: "Unsupervised",
    shortDescription:
      "Partitions data into K distinct clusters based on feature similarity.",
    fullDescription:
      "K-Means is an iterative algorithm that partitions a dataset into $K$ pre-defined non-overlapping subgroups (clusters). It assigns points to clusters such that the sum of squared distances to the cluster centroid is minimized.",
    intuition:
      'Imagine you have a crowd of people. You pick 3 random people to be "leaders". Everyone else joins the leader closest to them. Then, the leaders move to the center of their new group. Repeat until the groups stop changing!',
    mathematics: `The algorithm minimizes the **Within-Cluster Sum of Squares (WCSS)**:

$$ J = \\sum_{j=1}^{k} \\sum_{i \\in C_j} ||x_i - \\mu_j||^2 $$

Where $\\mu_j$ is the centroid of cluster $C_j$.
1. Assign points to nearest centroid.
2. Update centroids to be the mean of assigned points.`,
    pros: [
      "Scales to very large datasets.",
      "Simple to understand and implement.",
      "Lloyd's algorithm monotonically decreases the objective and converges to a local optimum.",
      "Very efficient computationally.",
    ],
    cons: [
      "Must specify the number of clusters $K$ manually.",
      "Sensitive to the initial placement of centroids (initialization).",
      "Struggles with clusters of varying sizes, densities, or non-spherical shapes.",
      "Outliers can significantly shift the centroids.",
    ],
    codeSnippet: `from sklearn.cluster import KMeans
import numpy as np

X = np.array([
    [1.0, 2.0],
    [1.5, 1.8],
    [5.0, 8.0],
    [8.0, 8.0],
    [1.0, 0.6],
    [9.0, 11.0]
])

kmeans = KMeans(n_clusters=2, init='k-means++', random_state=42)
kmeans.fit(X)

labels = kmeans.labels_
centroids = kmeans.cluster_centers_

print("Labels:", labels)
print("Centroids:", centroids)`,
  },
  {
    id: "dbscan",
    title: "DBSCAN",
    category: "Unsupervised",
    shortDescription:
      "Density-based clustering that can find clusters of arbitrary shape and identify noise.",
    fullDescription:
      "DBSCAN (Density-Based Spatial Clustering of Applications with Noise) groups together points that are close to each other based on a distance measurement and a minimum number of points.",
    intuition:
      'Imagine finding dense "islands" of points in a sea of data. If a point has enough neighbors, it\'s part of a cluster. If a point is in a lonely area, it\'s labeled as "Noise" (outlier). It doesn\'t force every point into a cluster!',
    mathematics: `Defined by two parameters: **Epsilon ($\\epsilon$)** and **MinPoints**.
- **Core Point**: Has $\\ge$ MinPoints within distance $\\epsilon$.
- **Border Point**: Has $<$ MinPoints within $\\epsilon$, but is in the neighborhood of a core point.
- **Noise Point**: Neither core nor border.

Two core points are in the same cluster if they are reachable via a chain of core points.`,
    pros: [
      "Does not require specifying the number of clusters in advance.",
      "Can find clusters of arbitrary shapes (e.g., crescents).",
      "Robust to outliers and identifies them as noise.",
      "Only needs two parameters.",
    ],
    cons: [
      "Struggles with datasets of varying densities.",
      "Sensitive to the choice of $\\epsilon$ and MinPoints.",
      "Distance metric choice is crucial and can be difficult for high-dimensional data.",
      "Not entirely deterministic for border points.",
    ],
    codeSnippet: `from sklearn.cluster import DBSCAN
import numpy as np

X = np.array([
    [1.0, 2.0],
    [1.1, 2.1],
    [0.9, 1.8],
    [8.0, 8.0],
    [8.2, 8.1],
    [7.8, 7.9],
    [20.0, 20.0]
])

dbscan = DBSCAN(eps=0.5, min_samples=2)
clusters = dbscan.fit_predict(X)

n_noise = list(clusters).count(-1)
print("Cluster labels:", clusters)
print("Noise points:", n_noise)`,
  },
  {
    id: "principal-component-analysis",
    title: "PCA",
    category: "Unsupervised",
    shortDescription:
      "Reduces the dimensionality of data while preserving as much variance as possible.",
    fullDescription:
      "Principal Component Analysis (PCA) is a statistical procedure that uses an orthogonal transformation to convert a set of observations of possibly correlated variables into a set of values of linearly uncorrelated variables called principal components.",
    intuition:
      'Imagine taking a 3D shadow of a complex object. You want to rotate the object so the shadow captures as much detail and "spread" as possible. PCA finds the best angles to look at your high-dimensional data.',
    mathematics: `PCA finds the eigenvectors of the data's **covariance matrix**. For mean-centered data $X_c$:

$$ \Sigma = \frac{1}{n-1} X_c^T X_c $$

The principal components are the eigenvectors associated with the largest eigenvalues of $\Sigma$.

A typical procedure is:
1. Center the data by subtracting the mean.
2. Optionally standardize features if they are on very different scales.
3. Compute the covariance matrix.
4. Compute eigenvalues and eigenvectors.
5. Project the data onto the top $k$ principal directions.`,
    pros: [
      "Can reduce redundancy and sometimes improve downstream model performance.",
      "Saves computational time and memory.",
      "Allows for visualization of high-dimensional data (e.g., in 2D or 3D).",
      "Produces orthogonal components, which can mitigate multicollinearity when used as inputs.",
    ],
    cons: [
      "Principal components are linear combinations of features, making them hard to interpret.",
      "May lose important information if the data is non-linearly related.",
      "Sensitive to feature scaling, so standardization is often important when features use different units.",
    ],
    codeSnippet: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

X = np.array([
    [2.5, 2.4, 10.0],
    [0.5, 0.7, 12.0],
    [2.2, 2.9, 9.0],
    [1.9, 2.2, 11.0],
    [3.1, 3.0, 8.0]
])

X_scaled = StandardScaler().fit_transform(X)

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print("Explained variance ratio:", pca.explained_variance_ratio_)`,
  },
  {
    id: "neural-networks",
    title: "Neural Networks (MLP)",
    category: "Deep Learning",
    shortDescription:
      "Feed-forward neural networks that learn non-linear mappings from inputs to outputs.",
    fullDescription:
      "Multilayer Perceptrons (MLP) are feed-forward neural networks made of an input layer, one or more hidden layers, and an output layer. Each hidden layer applies a linear transformation followed by a non-linear activation, allowing the model to learn patterns that a simple linear model cannot represent. During training, the network performs a forward pass to produce predictions, computes a loss, and then uses backpropagation with gradient descent to update its weights.",
    intuition:
      "You can think of an MLP as a stack of progressively smarter feature detectors. Early neurons may respond to simple combinations of inputs, while deeper neurons combine those signals into more abstract patterns. By repeatedly comparing predictions with the true answer and nudging weights in the right direction, the network gradually shapes a useful decision boundary.",
    mathematics: `For an MLP with one hidden layer, the forward pass is:

$$ z^{(1)} = W^{(1)}x + b^{(1)} $$
$$ a^{(1)} = f(z^{(1)}) $$
$$ z^{(2)} = W^{(2)}a^{(1)} + b^{(2)} $$
$$ \hat{y} = g(z^{(2)}) $$

Where $f$ is a hidden-layer activation such as **ReLU** or **tanh**, and $g$ is task-dependent:
- **sigmoid** for binary classification
- **softmax** for multiclass classification
- **identity / linear output** for regression

Training minimizes a loss $L(y, \hat{y})$ using backpropagation and gradient-based optimization. A standard parameter update is:

$$ W \leftarrow W - \eta \nabla_W L $$

Hidden layers allow the network to learn intermediate representations, which is why MLPs can solve non-linear classification and regression problems.`,
    pros: [
      "With enough capacity, they can approximate a wide class of continuous functions on compact domains.",
      "Highly flexible and scalable to massive datasets.",
      "Core neural-network ideas underlie many modern deep-learning architectures.",
      "Learns hierarchical feature representations automatically.",
    ],
    cons: [
      "Often needs careful regularization and enough data to generalize well.",
      "Large networks can be computationally expensive, though smaller MLPs often train well on CPU.",
      "Hyperparameters (layers, nodes, learning rate) are difficult to tune.",
      'Hard to interpret (The "Black Box" problem).',
    ],
    codeSnippet: `from sklearn.neural_network import MLPClassifier
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=400, noise=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

mlp = MLPClassifier(
    hidden_layer_sizes=(32, 16),
    activation="relu",
    learning_rate_init=0.01,
    max_iter=1000,
    random_state=42
)
mlp.fit(X_train, y_train)

print("Test accuracy:", round(mlp.score(X_test, y_test), 3))
print("Final loss:", round(mlp.loss_, 4))`,
  },
  {
    id: "convolutional-neural-networks",
    title: "CNNs",
    category: "Deep Learning",
    shortDescription:
      "Neural networks specialized for processing structured grid data like images.",
    fullDescription:
      "Convolutional Neural Networks (CNNs) are designed for grid-like data such as images. Instead of connecting every pixel to every neuron, CNNs apply small learnable filters across local regions, which makes them efficient and well suited to spatial data. Early layers often learn edges and textures, while deeper layers combine those into shapes, parts, and full objects.",
    intuition:
      'Imagine sliding a tiny window across an image and asking the same question everywhere: "Do I see an edge here? A corner? A texture?" CNNs reuse the same filter weights across the image, so they can detect the same pattern no matter where it appears. Stacking many layers lets the model move from simple visual cues to meaningful object-level understanding.',
    mathematics: `In most deep-learning libraries, the operation called "convolution" is implemented as **cross-correlation**:

$$ (I \star K)(i, j) = \sum_m \sum_n I(i+m, j+n)\,K(m, n) $$

For simplicity, this expression shows the single-channel case. In practice, CNNs sum over input channels as well.

A typical CNN block is:
1. Cross-correlation / convolution
2. Non-linearity such as ReLU
3. Optional pooling

For example, max pooling reduces spatial resolution:
$$ y_{i,j} = \max(\text{local neighborhood}) $$

Parameter sharing and local receptive fields make CNNs much more efficient than fully connected layers on image-like data.`,
    pros: [
      "Historically dominant and still highly effective for many vision tasks.",
      "Parameter sharing: fewer weights than a fully connected network.",
      "Convolutional layers are translation equivariant, and pooling can provide some translation invariance.",
      "Automatically learns spatial hierarchies.",
    ],
    cons: [
      "Large modern CNNs can be data- and compute-intensive.",
      "Requires careful architecture design (depth, stride, padding).",
      "Inefficient for non-grid data (like graphs).",
      'Still largely a "black box".',
    ],
    codeSnippet: `import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)
        )
        self.classifier = nn.Linear(32 * 8 * 8, 10)

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, start_dim=1)
        return self.classifier(x)

model = SimpleCNN()
images = torch.randn(8, 3, 32, 32)
logits = model(images)
print(logits.shape)  # torch.Size([8, 10])`,
  },
  {
    id: "recurrent-neural-networks",
    title: "RNNs",
    category: "Deep Learning",
    shortDescription:
      "Neural networks designed for sequential data like text, time-series, or speech.",
    fullDescription:
      "Recurrent Neural Networks (RNNs) are neural networks built for sequences such as text, speech, and time-series signals. They process one element at a time while carrying forward a hidden state that summarizes previous context. This shared state gives the model a notion of memory, making RNNs useful when the order of observations matters.",
    intuition:
      "Unlike a feed-forward model that sees each input in isolation, an RNN keeps a running summary of what it has seen so far. Reading a sentence is a good analogy: the meaning of the current word depends heavily on the words before it. The hidden state acts like short-term memory, helping the network interpret each new token in context.",
    mathematics: `At time step $t$, an RNN updates its hidden state using the current input $x_t$ and previous state $h_{t-1}$:

$$ h_t = \tanh(W_h h_{t-1} + W_x x_t + b_h) $$

An output is then formed from the hidden state:
$$ o_t = W_y h_t + b_y $$
$$ \hat{y}_t = g(o_t) $$

Where $g$ is chosen for the task, such as softmax for classification or the identity map for regression.

Training is performed with **Backpropagation Through Time (BPTT)**, often in truncated form for long sequences.

Classic RNNs can struggle with long-range dependencies because of vanishing or exploding gradients, which is why gated variants such as **LSTMs** and **GRUs** are often preferred.`,
    pros: [
      "Can naturally handle variable-length sequential inputs.",
      "Models temporal/sequential dependencies effectively.",
      "Memory allows context to influence current predictions.",
      "Historically central in NLP and still useful for some sequence and time-series settings.",
    ],
    cons: [
      "Suffers from vanishing and exploding gradient problems.",
      "Sequential dependencies across time steps limit parallelization and can make training slower.",
      "Difficult to capture very long-term dependencies (without LSTM/GRU).",
      "Hard to train and tune.",
    ],
    codeSnippet: `import torch
import torch.nn as nn

class SimpleRNNCell(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.xh = nn.Linear(input_size, hidden_size)
        self.hh = nn.Linear(hidden_size, hidden_size)

    def forward(self, x, h_prev):
        h_next = torch.tanh(self.xh(x) + self.hh(h_prev))
        return h_next

cell = SimpleRNNCell(input_size=5, hidden_size=8)
x_t = torch.randn(4, 5)       # batch of 4 time-step inputs
h_prev = torch.zeros(4, 8)    # previous hidden state
h_next = cell(x_t, h_prev)

print(h_next.shape)  # torch.Size([4, 8])`,
  },
];
