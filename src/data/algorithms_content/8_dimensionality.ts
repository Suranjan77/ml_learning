import { Algorithm } from "./types";

export const dimensionalityReduction: Algorithm = {
  id: "dimensionality-reduction",
  title: "Dimensionality Reduction",
  category: "Dimensionality Reduction",
  shortDescription: "Techniques to shrink massive datasets down to their most important core features, making them easier to visualize and faster to process.",

  fullDescription: `
Imagine you have a spreadsheet with 1,000 columns describing a house (square footage, number of windows, color of the front door, distance to the nearest coffee shop, etc.). "Dimensionality Reduction" algorithms figure out how to compress those 1,000 columns down to, say, 10 columns, without losing the core "meaning" of the data.

The most famous technique is Principal Component Analysis (PCA). PCA looks at all your data and mathematically figures out which combinations of features actually matter. For example, it might figure out that "number of bedrooms," "number of bathrooms," and "square footage" all basically measure the same thing: "House Size." It combines them into one new super-feature, throwing away the redundant noise.

### Where is it used?
It is heavily used for data visualization. Humans can't visualize a 1,000-dimensional graph, but PCA can compress that data down to 2 or 3 dimensions so we can actually look at it on a screen. It's also used to compress images, speed up facial recognition systems, and clean up messy data before feeding it into other machine learning models.
  `,

  intuition: `
Imagine you are trying to take a photograph of a complex 3D object, like a bicycle. If you take the photo from the front, it just looks like a thin line (a tire and some handlebars). You've lost almost all the information about what the object is. 

But if you walk around to the side and take a photo, you capture the wheels, the frame, the pedals, and the seat. You have successfully compressed a 3D object into a 2D photograph while keeping the maximum amount of useful visual information. 

PCA does exactly this, but with math. It mathematically rotates your data until it finds the absolute best "camera angle" that captures the widest, most informative view of your dataset.
  `,

  mathematics: `
### 1. The Covariance Matrix
To figure out how features relate to each other, PCA first calculates a Covariance Matrix ($\\Sigma$). If you have a dataset $X$ (where the average of every column is zero), the covariance matrix is calculated as:

$$ \\Sigma = \\frac{1}{n-1} X^T X $$

This matrix tells the algorithm which features move together (like height and weight) and which are completely unrelated.

### 2. Eigenvectors and Eigenvalues
PCA then performs a mathematical operation called "Eigendecomposition" on that covariance matrix:

$$ \\Sigma v_i = \\lambda_i v_i $$

It finds special directions called **Eigenvectors** ($v_i$). These are the new "camera angles." It also finds **Eigenvalues** ($\\lambda_i$), which tell you exactly how much information (variance) is captured by that specific camera angle. You simply keep the top few eigenvectors with the biggest eigenvalues, and throw the rest away!
  `,

  pros: [
    "It is a brilliant, mathematically proven way to remove redundant, highly correlated columns from your data.",
    "It drastically speeds up other machine learning algorithms by giving them less, but higher-quality, data to process.",
    "It allows you to visualize incredibly complex datasets on a standard 2D screen."
  ],

  cons: [
    "PCA assumes that the relationships in your data are straight lines (linear). If your data is curved or twisted, standard PCA will fail.",
    "The new 'super-features' it creates are mathematically abstract. You might compress 10 columns into 'Component 1', but it becomes very hard to explain to a human what 'Component 1' actually represents in the real world."
  ],

  codeSnippet: `import numpy as np
from sklearn.decomposition import PCA

# Create a fake dataset: 100 rows, 5 columns
X = np.random.randn(100, 5)

# Tell PCA to keep enough components to explain 95% of the data's variance
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X)

print(f"Original shape: {X.shape}")
print(f"Reduced shape: {X_reduced.shape}")
print(f"How much information each new column holds: {pca.explained_variance_ratio_}")`
};
