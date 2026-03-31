import { Algorithm } from "./types";

export const linearAlgebra: Algorithm = {
  id: "linear-algebra",
  title: "Linear Algebra & Data Structure",
  category: "Linear Algebra",
  shortDescription: "The structural foundation of algorithms, managing massive multidimensional datasets via matrices and vectors.",

  fullDescription: `
While calculus explains *how* a machine learning algorithm learns, **linear algebra provides the actual structure for the data and the model.** In many ways, machine learning is just applied linear algebra.

An AI doesn't "see" an image the way we do; instead, it looks at a grid of numbers representing pixel colors. When an algorithm turns inputs (like an image) into outputs (like "that's a cat"), it's not just doing simple math. It's actually stretching, rotating, and squishing massive amounts of data using **Vectors and Matrices**.

### Vectors, Matrices, and Tensors
A **Scalar** is just a single number. A **Vector** is a list of numbers (like a line pointing somewhere in space). A **Matrix** is a 2D grid of numbers (like a spreadsheet). A **Tensor** is just a grid with even more dimensions (like a cube of numbers). Every piece of data in AI—from words in a sentence to frames in a video—is eventually turned into one of these shapes.

Modern AI is only possible because operations on these shapes—like multiplying an input vector by a weight matrix—can be done incredibly fast on graphics cards (GPUs). This speed is what took neural networks from a cool idea to a world-changing technology.

### Eigenvalues and Dimensionality
Linear algebra isn't just for storing data; it also helps us find hidden patterns. Advanced ideas like **Eigenvalues, Eigenvectors, and Singular Value Decomposition (SVD)** help algorithms (like Principal Component Analysis) find the most important information in a messy dataset. They can take data with thousands of confusing dimensions and squash it down into a simple, easy-to-understand space.
  `,

  intuition: `
Imagine a huge, empty 3D room with a starting point right in the middle.

1. **A Vector** is like an arrow pointing from the center to a specific spot in the room. It has a length and a direction. To an AI, a picture is just one incredibly long arrow pointing into a space with millions of dimensions.
2. **A Dataset** is a massive cloud of these arrows, all starting from the center.
3. **A Matrix** is like a machine that grabs an arrow and changes it—maybe stretching it, squishing it, or rotating it to point somewhere entirely new.

When a neural network is learning, it's constantly tweaking these massive "machines" (the weight matrices) to make sure the cloud of input arrows gets rotated and stretched until the different categories (like cats and dogs) are neatly separated. Machine learning is basically just finding the perfect way to rotate space!
  `,

  mathematics: `
### 1. Vector Spaces and Dot Products
A vector $\\mathbf{x} = [x_1, x_2, \\dots, x_n]^T$ holds $n$ different features. The **Dot Product** between an input vector $\\mathbf{x}$ and a weight vector $\\mathbf{w}$ is the most basic math operation in AI:

$$ \\mathbf{w} \\cdot \\mathbf{x} = \\sum_{i=1}^{n} w_i x_i $$

Visually, this operation measures how much the input data lines up with what the model is looking for. A big positive number means they point in the same direction!

### 2. Matrix Multiplication
If we have a dataset with $m$ examples and $n$ features, we can write it as an $m \\times n$ matrix $\\mathbf{X}$. Applying our model's weights to the whole dataset at once is called matrix multiplication:

$$ \\mathbf{Y} = \\mathbf{X} \\mathbf{W} + \\mathbf{b} $$

This beautiful piece of math replaces slow, repetitive loops in code and lets GPUs process millions of examples at the exact same time.

### 3. Eigenvectors and Singular Value Decomposition
Imagine a matrix $A$ that stretches and rotates space. An **eigenvector** $v$ is a special arrow that doesn't change direction when $A$ transforms it—it only gets longer or shorter. The amount it stretches or shrinks is the **eigenvalue** $\\lambda$:

$$ A \\mathbf{v} = \\lambda \\mathbf{v} $$

For datasets that aren't perfectly square, we use **Singular Value Decomposition (SVD)** to break the data down into its core building blocks: $\\mathbf{X} = \\mathbf{U} \\Sigma \\mathbf{V}^T$. This helps us find the directions where the data varies the most, which is the secret sauce behind data compression and reducing dimensions.
  `,

  pros: [
    "Matrix math is perfect for modern GPUs and TPUs, allowing for massive speedups.",
    "Turning all data into standard grids (tensors) lets different algorithms work together easily.",
    "Tricks like SVD can magically separate important signals from random noise without needing labeled data.",
    "It scales perfectly: math that works in 2D space works exactly the same way in a million-dimensional space."
  ],

  cons: [
    "The 'Curse of Dimensionality': As you add more dimensions, everything gets incredibly far apart, making it hard for algorithms to find patterns.",
    "Doing complex math on massive matrices (like finding the inverse) is extremely slow and takes a lot of computing power.",
    "Sparse matrices (grids filled mostly with zeros, common in text processing) can waste huge amounts of memory if not handled carefully.",
    "If your features are too similar to each other, it can warp the math space and cause the algorithm to crash or give crazy answers."
  ],


  codeSnippet: ``
};
