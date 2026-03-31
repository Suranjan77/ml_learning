import { Algorithm } from "./types";

export const linearRegression: Algorithm = {
  id: "linear-regression",
  title: "Linear & Logistic Regression",
  category: "Linear Regression",
  shortDescription: "The classic algorithms for drawing a line through data to predict numbers (Linear) or sort things into categories (Logistic).",

  fullDescription: `
Linear regression is one of the oldest and most fundamental algorithms in machine learning. It tries to find the simplest possible relationship between your inputs and your target by drawing a straight line (or a flat plane) through your data points. 

Logistic regression is its close cousin, but instead of predicting a continuous number (like the price of a house), it predicts a probability between 0 and 1 (like the chance a house will sell this month). It does this by taking the straight line from linear regression and bending it into an "S" shape.

### Where is it used?
Linear regression is perfect when you need a simple, understandable prediction, like forecasting next month's sales based on advertising spend, or predicting a patient's blood pressure based on their weight. Logistic regression is the industry standard for binary classification: credit card fraud detection (fraud or not fraud?), medical diagnosis (sick or healthy?), and email filtering (spam or inbox?).
  `,

  intuition: `
Imagine you scatter a handful of points on a graph. Linear regression grabs a ruler and tries to draw a single straight line that gets as close to all the points as possible. It does this by measuring the vertical distance from every point to the line, squaring those distances (to make negative errors positive and punish big mistakes), and twisting the line until that total error is as small as possible.

Logistic regression does something similar, but instead of trying to draw a line *through* the points, it tries to draw a line that *separates* the points into two distinct groups. It then measures how far away a point is from that boundary line to calculate the percentage chance that the point belongs to group A or group B.
  `,

  mathematics: `
### 1. Ordinary Least Squares (Linear Regression)
For a set of input features $x$, the model makes a prediction $\\hat{y}$ by multiplying each feature by a specific weight $w$ and adding a baseline number $b$:

$$ \\hat{y} = w^T x + b $$

The goal is to find the weights that minimize the Mean Squared Error (MSE), which is the average of all the squared mistakes:

$$ \\mathcal{L}(w) = \\frac{1}{n} \\|y - Xw\\|^2 $$

Because this is a simple linear equation, we don't even need to use complex optimization algorithms to find the answer. We can solve it perfectly using a direct algebra formula (the Normal Equation):

$$ \\hat{w} = (X^T X)^{-1} X^T y $$

### 2. Logistic Regression
For classification (where the answer $y$ is either 0 or 1), we take that same linear equation and pass it through a Sigmoid function $\\sigma(z) = \\frac{1}{1 + e^{-z}}$. This squashes any number into a probability between 0 and 1:

$$ P(y=1|x) = \\sigma(w^T x + b) $$

### 3. Binary Cross-Entropy Loss
To train a logistic regression model, we can't use Mean Squared Error. Instead, we use Binary Cross-Entropy (BCE), which uses logarithms to heavily penalize the model if it is highly confident but completely wrong:

$$ \\mathcal{L}(w) = -\\frac{1}{n} \\sum_{i=1}^{n} \\left[ y_i \\log(\\hat{y}_i) + (1-y_i) \\log(1-\\hat{y}_i) \\right] $$

The calculus derivative used to update the weights during training is surprisingly simple and elegant:

$$ \\nabla_w \\mathcal{L} = \\frac{1}{n} X^T (\\hat{y} - y) $$
  `,

  pros: [
    "Incredibly easy to understand. You can look at the final weights and know exactly how much each feature influenced the prediction.",
    "Extremely fast to train, making it the perfect baseline model to try before moving on to complex neural networks."
  ],

  cons: [
    "It assumes the relationship between variables is a perfectly straight line. If the real world is curved or complex, these models will fail.",
    "Highly sensitive to outliers. A single extreme data point can drag the entire line out of place.",
    "If two of your input features are highly correlated (like 'years alive' and 'age'), the math can break down."
  ],

  codeSnippet: `import numpy as np
from sklearn.linear_model import LogisticRegression

# Features: [Total Hours studied, Number of Past tests failed]
X = np.array([[2, 0], [4, 0], [1, 2], [3, 1], [5, 0], [1.5, 3]])

# Absolute Labels: Pass Exam [1] or Fail Exam [0]
y = np.array([1, 1, 0, 1, 1, 0])

clf = LogisticRegression(penalty='l2', C=1.0)
clf.fit(X, y)

print("Mathematical Weights (Studied, Failed):", clf.coef_[0])
print("Base Intercept log-odds:", clf.intercept_)

predict_prob = clf.predict_proba([[2.5, 1]])
print(f"Computed Pass Probability: {predict_prob[0][1]:.2%}")`
};
