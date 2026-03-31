import { Algorithm } from "./types";

export const maximumLikelihood: Algorithm = {
  id: "maximum-likelihood",
  title: "Maximum Likelihood Estimation",
  category: "Maximum Likelihood",
  shortDescription: "A mathematical way to figure out the most likely rules of a game just by looking at the final score.",

  fullDescription: `
Maximum Likelihood Estimation (MLE) is a core concept in statistics and machine learning. It answers a very simple question: "Given the data we just saw, what are the most likely rules that created it?" It's the mathematical engine behind how many algorithms learn from data, from simple trend lines to massive neural networks.

### Where is it used?
MLE is incredibly useful when you have a good guess about the general "shape" of your data (like a bell curve), but you don't know the exact details (like where the center of the curve is). It's used everywhere: figuring out the error rate of a factory machine, calculating the true conversion rate of a new website button in an A/B test, or predicting how long a lightbulb will last before burning out.
  `,

  intuition: `
Imagine you find a weird, weighted coin on the ground. You flip it 10 times, and it lands on heads 7 times. What's your best guess for the true probability of this coin landing on heads?

MLE says your best guess is exactly 70% (or 0.7). Why? Because if the true probability was 0.7, that makes the data you actually saw (7 heads out of 10) more likely to happen than if the probability was 0.5, or 0.9, or anything else. MLE simply finds the exact numbers that make your real-world observations the most mathematically probable outcome.
  `,

  mathematics: `
### 1. The Likelihood Function
Let's say we have a bunch of data points $X = \\{x_1, x_2, \\dots, x_n\\}$. We assume these data points come from some probability distribution (like a bell curve) that is controlled by some unknown settings, which we call parameters $\\theta$. 

The "Likelihood" of those parameters, given the data we saw, is calculated by multiplying the probability of seeing each individual data point:

$$ \\mathcal{L}(\\theta | X) = \\prod_{i=1}^{n} P(x_i | \\theta) $$

### 2. Log-Likelihood
Multiplying a bunch of tiny probabilities together (like $0.01 \\times 0.05 \\times 0.02$) quickly results in numbers so small that computers round them down to zero. Plus, multiplying is annoying to do calculus on. 

To fix this, we take the logarithm of the whole thing. In math, the log of a product becomes the sum of the logs. This turns our multiplication problem into an addition problem, which is much easier for computers to handle:

$$ \\log \\mathcal{L}(\\theta | X) = \\sum_{i=1}^{n} \\log P(x_i | \\theta) $$

### 3. Finding the Maximum
The Maximum Likelihood Estimate (MLE), written as $\\hat{\\theta}_{\\text{MLE}}$, is simply the parameter value that makes that log-likelihood equation as big as possible:

$$ \\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} \\log \\mathcal{L}(\\theta | X) $$

To find this peak, we use calculus. We take the derivative of the log-likelihood equation, set it to zero, and solve for $\\theta$:

$$ \\frac{\\partial}{\\partial \\theta} \\sum_{i=1}^{n} \\log P(x_i | \\theta) = 0 $$

### Example: Flipping a Coin
For a coin flip with probability $p$ of getting heads, the math for a single flip is $P(x_i | p) = p^{x_i}(1-p)^{1-x_i}$. The log-likelihood for a bunch of flips is:

$$ \\log \\mathcal{L}(p) = \\sum_{i=1}^n \\left[ x_i \\log p + (1-x_i) \\log(1-p) \\right] $$

If you do the calculus (take the derivative and set it to zero), the math perfectly proves that your best guess for $p$ is just the average number of heads you saw: $\\hat{p} = \\frac{1}{n} \\sum_{i=1}^n x_i$.
  `,

  pros: [
    "It's mathematically proven to give you the most accurate possible estimate as you get more and more data.",
    "It's the foundation for how we measure errors in machine learning (for example, Mean Squared Error is just MLE in disguise).",
    "It's consistent—if you transform the math, the best estimate transforms perfectly with it."
  ],

  cons: [
    "If you only have a tiny amount of data, MLE can make terrible, overconfident guesses (overfitting).",
    "It completely relies on you guessing the right 'shape' for your data. If you assume the data is a bell curve, but it's actually something else, MLE will give you the wrong answer.",
    "For really complex AI models, finding the exact maximum point using calculus is incredibly difficult or impossible."
  ],

  codeSnippet: `import numpy as np
from scipy.optimize import minimize

data = np.array([2.3, 1.9, 2.5, 2.8, 1.7])

def neg_log_likelihood(params):
    mu, sigma = params
    if sigma <= 0: return np.inf
    n = len(data)
    # Minimizing negative log-likelihood is the same as maximizing log-likelihood
    ll = - (n/2)*np.log(2*np.pi) - n*np.log(sigma) - np.sum((data - mu)**2)/(2*sigma**2)
    return -ll

result = minimize(neg_log_likelihood, [0.0, 1.0])
mu_est, sigma_est = result.x

print(f"MLE Derived Mean: {mu_est:.2f}")
print(f"MLE Derived Std Dev: {sigma_est:.2f}")`
};
