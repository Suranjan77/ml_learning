import { Algorithm } from "./types";

export const instanceBasedTrees: Algorithm = {
  id: "instance-based-trees",
  title: "Instance-based Learning & Decision Trees",
  category: "Instance-based Learning & Decision Trees",
  shortDescription: "Algorithms that make decisions by looking at their closest neighbors (KNN) or by playing a game of 20 Questions (Decision Trees).",

  fullDescription: `
Unlike algorithms that try to draw a single mathematical line through data (like linear regression), Instance-based learning (like K-Nearest Neighbors) and Decision Trees take a completely different approach. They are "non-parametric," which means they don't assume the data fits a specific shape. Instead, their complexity grows naturally as you give them more data.

K-Nearest Neighbors (KNN) is the simplest algorithm in machine learning: it literally just memorizes the entire training dataset. When you ask it to make a prediction, it looks for the data points that are geometrically closest to your query and copies their answer. 

Decision Trees, on the other hand, act like a flowchart. They look at the data and figure out the best series of "Yes/No" questions to ask in order to split the data into pure, organized groups.

### Where is it used?
KNN is the engine behind many basic recommendation systems ("People who bought this also bought...") and is great for finding patterns in weirdly shaped data. Decision Trees are incredibly popular in business and medicine because they are completely transparent. If a bank denies your loan using a Decision Tree, they can trace the exact path of logic to tell you exactly *why* you were denied.
  `,

  intuition: `
**KNN**: Imagine you move to a new city and want to know if a specific neighborhood is safe. You don't need a complex mathematical formula; you just ask the 5 people who live closest to that neighborhood. If 4 out of 5 say it's safe, you assume it's safe. That's exactly how KNN works.

**Decision Tree**: Imagine playing the game "20 Questions" to guess an animal. You don't ask "Does it have a tail?" first, because that doesn't narrow it down much. You ask "Is it a mammal?" because that splits the animal kingdom in half. A Decision Tree uses math to figure out the absolute best sequence of questions to ask to arrive at the right answer as fast as possible.
  `,

  mathematics: `
### 1. K-Nearest Neighbors Distance
KNN relies entirely on measuring the distance between a new data point $x$ and an existing data point $x'$. The most common way to do this is using standard straight-line (Euclidean) distance:

$$ d(x, x') = \\sqrt{\\sum_{i=1}^{p} (x_i - x_i')^2} $$

### 2. Decision Tree Splitting (Gini and Entropy)
To figure out the best "Yes/No" question to ask, a Decision Tree tests every possible question and measures how "pure" the resulting groups are. It wants to split a mixed group of cats and dogs into one group of purely cats and one group of purely dogs. It measures this purity using two main formulas:

**Gini Impurity**: Measures how often you would be wrong if you randomly guessed the label of an item in the group, based on the mix of items in that group. Lower is better:

$$ Gini = 1 - \\sum_{i=1}^{c} p_i^2 $$

**Information Entropy**: A concept from physics and information theory that measures the total amount of chaos or disorder in the group. Lower is better:

$$ Entropy = - \\sum_{i=1}^{c} p_i \\log_2(p_i) $$

The algorithm calculates the "Information Gain" (how much the chaos dropped) for every possible split, and greedily chooses the split that reduces the chaos the most.
  `,

  pros: [
    "Decision Trees are perfectly transparent. You can print them out on a piece of paper and explain exactly how the AI made its decision.",
    "KNN doesn't actually have a 'training' phase. You just hand it data and it's immediately ready to make predictions.",
    "Both algorithms can easily handle highly complex, non-linear data without you having to manually tweak the math."
  ],

  cons: [
    "KNN is incredibly slow when making predictions on large datasets, because it has to calculate the distance to every single historical data point.",
    "Decision Trees are notorious for 'overfitting'. If you don't stop them, they will keep asking questions until they have memorized the exact training data, making them useless for new data.",
    "Both struggle with the 'Curse of Dimensionality'. If your data has hundreds of columns (features), the concept of 'distance' breaks down for KNN, and Trees become impossibly complex."
  ],

  codeSnippet: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

# Two-dimensional topological Feature grid
X = np.array([[0, 0], [1, 1.5], [1.5, 1], [8, 8], [8.5, 7.5], [9, 9]])
# Binary Categorical Labels
y = np.array([0, 0, 0, 1, 1, 1])

# Initialise and execute K-Nearest Neighbours
knn = KNeighborsClassifier(n_neighbors=2)
knn.fit(X, y)
print(f"KNN Assigned Classification for spatial coordinate [2, 2]: {knn.predict([[2, 2]])[0]}")

# Initialise and execute Decision Tree
dt = DecisionTreeClassifier(max_depth=2, random_state=42)
dt.fit(X, y)
print(f"Decision Tree Assigned Classification for spatial coordinate [7, 7]: {dt.predict([[7, 7]])[0]}")`
};
