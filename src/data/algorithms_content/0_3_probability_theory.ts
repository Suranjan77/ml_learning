import { Algorithm } from "./types";

export const probabilityTheory: Algorithm = {
  id: "probability-theory",
  title: "Probability & Statistics",
  category: "Probability Theory",
  shortDescription: "The math that helps AI deal with uncertainty, ignore random noise, and make smart guesses in a messy world.",

  fullDescription: `
While calculus helps models improve and linear algebra gives them structure, **probability theory gives AI the logic it needs to handle uncertainty.** 

The real world is messy. The data we feed into machine learning models is almost never perfect—it's full of random noise, missing pieces, and biased samples. If an AI could only think in absolute black-and-white terms, it would fail the moment it stepped outside the lab. Machine learning works because algorithms don't just make blind guesses; they use math to figure out exactly how confident they should be.

### Beyond Absolute Certainty

Probability lets algorithms measure their own uncertainty. Instead of giving a single, rigid answer (like "This house is worth exactly $400,000"), statistical machine learning gives a probabilistic forecast: "I'm 95% sure this house is worth between $380,000 and $420,000, assuming the housing market behaves normally."

This isn't just a nice feature added on top of AI—**many of the most important machine learning models are built entirely out of probability math.** 

For example, Maximum Likelihood Estimation is the core math behind how most models measure their mistakes. Naive Bayes classifiers are just direct code translations of Bayes' Theorem. And Decision Trees rely on entropy (a concept from Information Theory that's deeply tied to probability) to figure out the best way to split up data.

### Random Variables and Expectations

In machine learning, we treat data points as random observations of the real world. When an algorithm calculates an average across thousands of examples, it's really estimating the **Expected Value**. When it calculates the variance (how spread out the data is), it's measuring exactly how unpredictable the real world is.
  `,

  intuition: `
Imagine you're trying to figure out the exact shape and size of an invisible, shifting cloud, but you're only allowed to look at a few raindrops falling from it.

1. **Probability asks:** If we already knew the exact shape of the cloud, what are the chances we'd see these specific raindrops?
2. **Statistics (Machine Learning) asks:** Since we only have these specific raindrops, what is the most likely shape of the invisible cloud they came from?

Usually, the AI assumes the cloud has a standard, predictable shape (like a Bell Curve, where most raindrops fall in the middle and fewer fall on the edges). It measures the center of the raindrops (the mean) and how spread out they are (the variance). By finding the mathematical curve that best explains the raindrops we actually saw, the AI makes a highly educated guess about the invisible cloud.
  `,

  mathematics: `
### 1. Probability Distributions and Density
A **Probability Density Function (PDF)** $p(x)$ describes how likely it is for a random variable $X$ to land on a specific value. The most famous distribution in machine learning is the **Gaussian (Normal) Distribution** (the Bell Curve):

$$ \\mathcal{N}(x | \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right) $$

When algorithms assume data follows this curve, they can compress massive, complex datasets into just two simple numbers: the mean $\\mu$ (the center) and the variance $\\sigma^2$ (how spread out it is).

### 2. Bayes' Theorem
Bayes' Theorem is the ultimate formula for changing your mind when you get new evidence:

$$ P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} $$

In machine learning, $A$ is our Model's Hypothesis, and $B$ is the Training Data. The whole goal of Bayesian AI is to calculate the **Posterior Distribution $P(\\text{Model} | \\text{Data})$**—which basically means "how much should I believe my model now that I've seen the data?"

### 3. Entropy and Information Theory
In AI, Information Theory uses a concept called entropy $H(X)$ to measure exactly how messy or unpredictable a dataset is:

$$ H(X) = - \\sum_{x} P(x) \\log P(x) $$

When a model is trained to minimize "Cross-Entropy" (or maximize "Information Gain"), the math is literally forcing the algorithm to reduce its own confusion and become more confident in its predictions.
  `,

  pros: [
    "It gives models the math they need to handle messy, noisy, and missing data without crashing.",
    "It allows AI to output confidence scores (like 'I am 80% sure this is a dog') instead of just rigid guesses.",
    "Concepts like entropy give us a perfect mathematical way to measure how messy data is, which is how decision trees work.",
    "Bayesian math lets human experts easily inject their own knowledge into the AI before it even starts learning."
  ],

  cons: [
    "The math can get incredibly slow and complicated when dealing with datasets that have thousands of dimensions.",
    "Most AI assumes every data point is totally independent, which completely breaks down when dealing with things like stock prices or weather over time.",
    "The real world rarely follows a perfect Bell Curve. If an AI assumes the data is normal when it isn't, it will make terrible predictions.",
    "Advanced probabilistic methods (like MCMC sampling) are incredibly slow compared to standard deep learning techniques."
  ],


  codeSnippet: `import numpy as np
from scipy import stats

# Generate 1000 random data points from a Normal Distribution
data = np.random.normal(loc=5.0, scale=2.0, size=1000)

# Calculate the Mean (Expected Value) and Variance
mean = np.mean(data)
variance = np.var(data)

print(f"Calculated Mean: {mean:.2f}")
print(f"Calculated Variance: {variance:.2f}")

# Use Bayes' Theorem to update our belief
prior_prob = 0.5
likelihood = 0.8
evidence = 0.6

posterior_prob = (likelihood * prior_prob) / evidence
print(f"Updated Bayesian Probability: {posterior_prob:.2f}")`
};
