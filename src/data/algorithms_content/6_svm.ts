import { Algorithm } from "./types";

export const svm: Algorithm = {
  id: "support-vector-machines",
  title: "Support Vector Machines",
  category: "Support Vector Machines",
  shortDescription: "An algorithm that finds the widest possible 'street' to separate different categories of data, using mathematical tricks to handle complex curves.",

  fullDescription: `
Support Vector Machines (SVMs) are powerful algorithms used mostly for classification. Imagine you have a bunch of red dots and blue dots on a piece of paper, and you need to draw a line to separate them. You could draw hundreds of different lines that work. 

An SVM doesn't just draw *any* line. It mathematically calculates the absolute best line—the one that sits exactly in the middle of the two groups, creating the widest possible "street" or "margin" between them. The data points that sit right on the edge of this street are called the "Support Vectors," because they literally support the entire structure of the model.

### Where is it used?
SVMs are fantastic when you have complex data but not a massive amount of it. They are historically famous for text classification (like deciding if an email is spam or not), recognizing handwritten digits, and analyzing complex biological data like proteins and genes.
  `,

  intuition: `
Imagine you're trying to build a fence between a flock of sheep and a pack of wolves. You don't want to build the fence right up against the sheep, because a wolf might reach through. You want to build the fence exactly in the middle of the empty space between the two groups, maximizing your safety margin.

But what if the wolves have surrounded the sheep in a circle? You can't draw a straight line to separate them. This is where SVMs use their secret weapon: the "Kernel Trick." The algorithm mathematically throws all the animals up into the air (into a 3D space). Suddenly, because the sheep are clustered in the middle and the wolves are on the outside, you can easily slide a flat sheet of metal between them while they are in mid-air. When they land back on the 2D ground, that flat sheet looks like a perfect circle separating the groups.
  `,

  mathematics: `
### 1. The Margin
For a dataset that can be perfectly separated by a straight line, the SVM tries to find a line (defined by weights $w$ and a bias $b$) that maximizes the distance to the closest points. Mathematically, maximizing this margin is the exact same thing as minimizing $\\frac{1}{2} \\|w\\|^2$, with the strict rule that every single data point must be on the correct side of the street:

$$ y_i (w^T x_i + b) \\ge 1 \\quad \\forall i $$

### 2. The Kernel Trick
When data cannot be separated by a straight line, SVMs use a "Kernel function" to calculate what the data would look like if it were projected into a massive, multi-dimensional space, *without actually having to do the heavy math of moving the data there*. 

The most popular kernel is the Radial Basis Function (RBF), which measures the distance between two points $x_i$ and $x_j$ and creates smooth, curved boundaries:

$$ K(x_i, x_j) = \\exp(-\\gamma \\|x_i - x_j\\|^2) $$
  `,

  pros: [
    "It is mathematically guaranteed to find the absolute best separation line, unlike neural networks which can get stuck on 'good enough' solutions.",
    "The Kernel Trick is practically magic. It allows the algorithm to draw incredibly complex, curvy boundaries with very little math.",
    "It is highly effective even when you have more features (columns) than actual data points (rows)."
  ],

  cons: [
    "It is incredibly slow to train if you have hundreds of thousands of data points.",
    "It doesn't naturally give you a percentage probability (like 'I am 80% sure this is a cat'). It just gives you a hard Yes or No.",
    "It is very sensitive to its settings. If you choose the wrong Kernel or the wrong 'C' value, the model will fail completely."
  ],

  codeSnippet: `import numpy as np
from sklearn.svm import SVC

X = np.array([[1, 2], [2, 3], [1.5, 1.8], [8, 8], [9, 10], [8.5, 9.2]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Number of Computed Support Vectors: {clf.n_support_}")`
};
